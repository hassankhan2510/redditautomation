import { NextResponse } from 'next/server'
import { generateCompletion } from '@/lib/llm'

export async function POST(request: Request) {
    try {
        const { targetTweet, goal, persona, tone, language } = await request.json()

        if (!targetTweet) return NextResponse.json({ error: 'Target tweet required' }, { status: 400 })

        const langInstruction = language === 'ur'
            ? "OUTPUT LANGUAGE: URDU (Standard Urdu Script). Write naturally for a South Asian audience."
            : "OUTPUT LANGUAGE: ENGLISH."

        const systemPrompt = `You are a ${persona || 'Social Media Expert'}.
Your goal is to write "High Status" replies to viral tweets.

${langInstruction}

CRITICAL RULES (ANTI-NPC MODE):
- NEVER say "Great post", "Thanks for sharing", or "100% agreed".
- NEVER sound like a fanboy/fangirl. 
- Write like a PEER or EXPERT.
- Lowercase aesthetic is preferred for English (unless persona is Journalist).
- Keep it under 280 characters.

REPLY TYPES TO GENERATE:
1. "The Insight": Add new data, a specific example, or a mental model that expands the original point.
2. "The Friendly Counter": Respectfully challenge a specific premise. Start with "But..." or "Maybe...".
3. "The Witty One-Liner": A joke, sarcasm, or "inside thought" regarding the topic.

Target Tone: ${tone}
User Goal: ${goal || 'Gain visibility'}
`

        const userPrompt = `
TARGET TWEET:
"${targetTweet}"

ACTION:
Generate 3 distinct replies (1 Insight, 1 Counter, 1 Witty) separated by "---".
Return ONLY the 3 replies separated by "---".
`

        const completion = await generateCompletion(systemPrompt, userPrompt)

        // Split by "---" and Enforce Limits
        const replies = completion.split('---')
            .map(t => t.trim())
            .filter(t => t.length > 0)
            .map(t => {
                if (t.length > 280) return t.substring(0, 275) + "..."
                return t
            })

        return NextResponse.json({ replies })

    } catch (e: any) {
        console.error(e)
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}
