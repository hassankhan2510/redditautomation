import { NextResponse } from 'next/server'
import { supabase } from '@/lib/db'
import { generateCompletion } from '@/lib/llm'
import { calculateSimilarity } from '@/lib/similarity'
import { PostIdea, Subreddit } from '@/types'

// Helper to construct system prompt
function buildSystemPrompt(sub: Subreddit) {
    return `You are a regular user of the subreddit ${sub.name}. 
Your goal is to start a meaningful discussion or share value, NOT to sell or promote excessively.
You must adhere to these community norms:
- Audience: ${sub.audience_type}
- Tone & Style: ${sub.tone} (Pay close attention to the "Style" instruction if present)
- Self-Promotion Tolerance: ${sub.self_promo_level}
- Preferred Length: ${sub.preferred_length}
- Required Flair: ${sub.required_flair}
- Ending Style: ${sub.ending_style}

BANNED PHRASES (Do not use): ${sub.banned_phrases?.join(', ') || 'None'}

 Formatting:
- Write like a normal human user.
- NO **bolding** of words.
- NO markdown lists (- item). Write in paragraphs or natural spacing.
- NO "In conclusion" or "Hope this helps".
- NO hashtags.
- NO emojis unless the tone is very casual.
`
}

export async function POST(request: Request) {
    try {
        const { ideaId, subredditId } = await request.json()

        if (!ideaId) {
            return NextResponse.json({ error: 'ideaId is required' }, { status: 400 })
        }

        // 1. Fetch Idea
        const { data: idea, error: ideaError } = await supabase
            .from('post_ideas')
            .select('*')
            .eq('id', ideaId)
            .single()

        if (ideaError || !idea) throw new Error('Idea not found')

        // 2. Fetch Subreddits (or specific one)
        let query = supabase.from('subreddits').select('*')
        if (subredditId) {
            query = query.eq('id', subredditId)
        }
        const { data: subreddits, error: subError } = await query

        if (subError || !subreddits || subreddits.length === 0) {
            return NextResponse.json({ message: 'No subreddits found to generate for.' })
        }

        // Process one by one (or just the first one if we want to effectively limit to one per call for Vercel)
        // For Vercel Free, it's best if the client calls this endpoint once per subreddit.
        // If subredditId is NOT provided, specific logic might be needed, but let's assume client handles loop.
        // We will process ALL found (if small count) or just warn. 
        // Let's implement robust single-sub generation loop here.

        const results = []

        for (const sub of subreddits) {
            // A. Generate Initial Draft
            const systemPrompt = buildSystemPrompt(sub)
            const userPrompt = `
Here is my core idea/update:
Title: ${(idea as PostIdea).title}
Content: ${(idea as PostIdea).core_idea}
Technical Depth: ${(idea as PostIdea).technical_depth}/5
Goal: ${(idea as PostIdea).goal}

Write a Reddit post title and body for ${sub.name}.
Structure it naturally. Do not sound like a marketing bot.
`
            let draft = await generateCompletion(systemPrompt, userPrompt)

            // B. Critique Loop
            let finalDraft = draft
            const critiquePrompt = `
Critique the following Reddit post draft for ${sub.name} based on these rules:
- No "I'm excited to announce" (unless allowed)
- No sales-y language
- Must offer value
- Must fit tone: ${sub.tone}

Draft:
${finalDraft}

If it's good, reply with "Clean".
If it needs changes, describe specific changes or rewrite it.
`
            const critique = await generateCompletion("You are a strict content moderator.", critiquePrompt)

            if (!critique.toLowerCase().includes("clean")) {
                // Rewrite
                const rewritePrompt = `
Original Draft:
${finalDraft}

Critique:
${critique}

Rewrite the post to address the critique completely. Return ONLY the new post title and body.
`
                finalDraft = await generateCompletion(systemPrompt, rewritePrompt)
            }

            // C. Similarity Guard
            let maxSim = 0
            const { data: siblingDrafts } = await supabase
                .from('post_drafts')
                .select('content')
                .eq('post_idea_id', idea.id)

            if (siblingDrafts && siblingDrafts.length > 0) {
                for (const sib of siblingDrafts) {
                    // Skip self if somehow already exists, though we are inserting new
                    const score = await calculateSimilarity(finalDraft, sib.content)
                    if (score > maxSim) maxSim = score
                }
            }

            // D. Save Draft
            const { data: savedDraft, error: saveError } = await supabase
                .from('post_drafts')
                .insert({
                    post_idea_id: idea.id,
                    subreddit_id: sub.id,
                    content: finalDraft,
                    status: 'draft',
                    similarity_score: maxSim
                })
                .select()
                .single()

            if (!saveError) {
                results.push(savedDraft)
            }
        }

        return NextResponse.json({ success: true, count: results.length, drafts: results })

    } catch (e: any) {
        console.error(e)
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}
