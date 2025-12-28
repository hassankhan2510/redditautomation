import { NextResponse } from 'next/server'
import { generateCompletion } from '@/lib/llm'

export async function POST(request: Request) {
    try {
        const { content, context, tone } = await request.json()

        if (!content) return NextResponse.json({ error: 'Content required' }, { status: 400 })

        const systemPrompt = `You are a Ghostwriter for high-net-worth individuals.
Your goal is to "Remix" viral content. 
Take the STRUCTURE and PSYCHOLOGY of the original post, but completely rewrite the content to fit the user's specific context/niche.

RULES:
- Analyze the "Viral DNA" (Hooks, lists, pacing, loops).
- Apply that DNA to the new topic.
- Do NOT just swap words. Rewrite the idea.
- Keep it under 280 chars if it looks like a tweet, or longer if it looks like a LI post.

User Context: ${context || 'General Tech'}
Target Tone: ${tone || 'Professional'}
`

        const userPrompt = `
ORIGINAL CONTENT:
"${content}"

ACTION:
Rewrite this into 3 distinct variations for my niche.
Separate them by "---".
`

        const completion = await generateCompletion(systemPrompt, userPrompt)

        const variations = completion.split('---')
            .map(t => t.trim())
            .filter(t => t.length > 0)

        return NextResponse.json({ variations })

    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}
