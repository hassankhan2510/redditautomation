import { NextResponse } from 'next/server'
import { generateCompletion } from '@/lib/llm'

export async function POST(request: Request) {
    try {
        const { originalContent, targetPlatform, persona, tone, language } = await request.json()

        if (!originalContent) return NextResponse.json({ error: 'Content required' }, { status: 400 })

        const langInstruction = language === 'ur'
            ? "OUTPUT LANGUAGE: URDU (Standard Urdu Script). Write naturally for a South Asian audience."
            : "OUTPUT LANGUAGE: ENGLISH."

        // Platform specific instructions
        let platformInstruction = ""
        switch (targetPlatform) {
            case 'linkedin':
                platformInstruction = `
PLATFORM: LinkedIn
FORMAT: Professional storytelling ("Broetry" style). 
- One sentence per line for readability.
- Start with a strong "Mockingbird" hook (a statement that stops the scroll).
- Middle: Share a struggle or insight.
- End: A clear lesson or call to action.
- Tone: Professional but personal.
- Hashtags: Use 3-5 relevant hashtags at the very end.
`
                break;
            case 'x':
                platformInstruction = `
PLATFORM: X (Twitter)
FORMAT: Viral Thread or Short Hook.
- STRICT LENGTH LIMIT: Every single tweet variation MUST be under 280 characters.
- Style: Punchy, lowercase aesthetic (optional), no hashtags.
- Focus: High anxiety or high reward hooks.
`
                break;
            case 'reddit':
                platformInstruction = `
PLATFORM: Reddit
FORMAT: Authentic Community Discussion.
- NO hashtags.
- NO marketing jargon.
- Tone: "I found this interesting" or "Has anyone else noticed?". 
- Make it sound like a real person asking a question or sharing a discovery, not a brand.
`
                break;
            default:
                platformInstruction = "PLATFORM: General Social Media"
        }

        const systemPrompt = `You are a ${persona || 'Social Media Expert'}.
Your task is to REWRITE the provided content for a specific platform.

${langInstruction}
${platformInstruction}

CRITICAL RULES:
- Do NOT just summarize. Rewrite it completely to fit the platform's culture.
- If X (Twitter), force < 280 chars per tweet.
- If LinkedIn, ensure good spacing.
- If Reddit, be conversational.

CONTEXT:
Original Content Provided by User.
Target Tone: ${tone}
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
