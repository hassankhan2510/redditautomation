import { NextResponse } from 'next/server'
import { generateCompletion } from '@/lib/llm'

export async function POST(request: Request) {
    try {
        const { originalContent, targetPlatform, persona, tone, language } = await request.json()

        if (!originalContent) return NextResponse.json({ error: 'Content required' }, { status: 400 })

        const langInstruction = language === 'ur'
            ? "OUTPUT LANGUAGE: URDU (Standard Urdu Script). Write naturally for a South Asian audience."
            : "OUTPUT LANGUAGE: ENGLISH."

        // --- PLATFORM SUPER-PROMPTS ---
        let platformInstruction = ""
        switch (targetPlatform) {
            case 'linkedin':
                platformInstruction = `
PLATFORM: LinkedIn
GOAL: High-Engagement Professional Content.

CONTEXT AWARENESS:
- IF TECHNICAL: Use "The Engineer" Frame. Focus on specific problem-solution, code snippets (if applicable), and "How I fixed X".
- IF CAREER/BUSINESS: Use "The Founder" Frame. "Broetry" formatting. Start with a contrarian take.
- IF POLITICAL/NEWS: Use "The Analyst" Frame. Fair, balanced, but insightful. Focus on economic/business impact.

FORMATTING RULES:
1. "The Hook": First line must be < 10 words and controversial.
2. "The Spacing": One sentence per line. Massive white space.
3. "The Meat": Use bullet points for value.
4. "The Call": Ends with a question to drive comments.
`
                break;
            case 'x':
                platformInstruction = `
PLATFORM: X (Twitter)
GOAL: Viral Reach & Shares.

CONTEXT AWARENESS:
- IF TECHNICAL: Use "The Threadboi" Frame. "Here is how to build X in Y steps 🧵". Dense value. No fluff.
- IF POLITICAL/NEWS: Use "The Pundit" Frame. Aggressive, short, punchy. High emotion. "They don't want you to know this."
- IF PERSONAL: Use "The Vulnerable" Frame. Lowercase aesthetic. "I lost $50k doing this."

STRICT RULES:
1. MAX 280 Characters per tweet.
2. NO Hashtags (unless it's a specific trend).
3. First tweet must imply a "Secret" or "Guide".
`
                break;
            case 'reddit':
                platformInstruction = `
PLATFORM: Reddit
GOAL: Community Trust & Discussion (Karma).

CONTEXT AWARENESS:
- IF TECHNICAL (r/programming, r/SaaS): Be "The Senior Dev". Humble but expert. "I built this open source tool..."
- IF POLITICAL (r/politics): Be "The Citizen". Informed, citing sources, passionate but not bot-like.
- IF GENERAL: Be "The Average Joe". "TIFU by..." or "Does anyone else feel like..."

STRICT RULES:
1. NO Marketing jargon. Zero.
2. NO "Follow me for more".
3. Lowercase titles preferred for casual subs.
4. Write like a human on a toilet, not a brand in a boardroom.
`
                break;
            case 'hooks':
                platformInstruction = `
PLATFORM: Viral Hooks (Hook Lab)
FORMAT: 5 Distinct Variations of the first sentence/headline.
1. The Negative Hook ("Stop doing X...")
2. The Statistic Hook ("80% of people fail at...")
3. The Story Hook ("I lost everything in 2022...")
4. The How-To Hook ("How to X without Y...")
5. The Contrarian Hook ("X is dead. Here is why...")
OUTPUT: Just the 5 hooks, numbered.
`
                break;
            default:
                platformInstruction = "PLATFORM: General Social Media"
        }

        const systemPrompt = `You are a World-Class Ghostwriter (Justin Welsh / Nicolas Cole level).
Your task is to REWRITE the provided content for ${targetPlatform}.

${langInstruction}
${platformInstruction}

YOUR SECRET SAUCE:
- You detest boring content.
- You use specific nouns and verbs, not adjectives.
- You adapt instantly to the core topic (Politics vs Tech vs Life).

CONTEXT:
Original Content Provided by User.
Target Tone: ${tone} (Adjust heavily based on this).
`

        const userPrompt = `
ORIGINAL CONTENT:
"${originalContent}"

ACTION:
Rewrite this content into 3 distinct variations for ${targetPlatform}.
return ONLY the variations separated by "---".
`

        const completion = await generateCompletion(systemPrompt, userPrompt)

        // Split by "---" and Enforce Limits
        const drafts = completion.split('---')
            .map(t => t.trim())
            .filter(t => t.length > 0)
            .map(t => {
                // Formatting cleanups
                if (targetPlatform === 'x' && t.length > 280) {
                    return t.substring(0, 275) + "..."
                }
                return t
            })

        return NextResponse.json({ drafts })

    } catch (e: any) {
        console.error(e)
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}
