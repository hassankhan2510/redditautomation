import { NextResponse } from 'next/server'
import { generateCompletion } from '@/lib/llm'

export async function POST(request: Request) {
    try {
        const { topic, mode } = await request.json()

        if (!topic) return NextResponse.json({ error: 'Topic required' }, { status: 400 })

        const systemPrompt = `You are a legendary YouTube Shorts Scriptwriter.
Your goal is to write a VIRAL, FAST-PACED script about the given topic.

Rules:
1.  **Hook (0-3s)**: Start with a crazy statement or question.
2.  **Body**: rapid-fire facts or storytelling.
3.  **Twist/Ending**: A strong conclusion or call to action.
4.  **Format**: Just the raw script text. No scene descriptions like [Cut to black].
5.  **Length**: Keep it under 150 words (approx 45-60 seconds spoken).
6.  **Tone**: ${mode === 'scary' ? 'Dark, mysterious, unsettling' : 'High energy, exciting, loud'}.

Example Output:
"Did you know you swallow 8 spiders a year while sleeping? It's actually a myth, but the truth is worse. Spiders love warmth, and your mouth is a cozy cave..."
`

        const userPrompt = `Write a viral short script about: "${topic}"`

        const script = await generateCompletion(systemPrompt, userPrompt)

        return NextResponse.json({ script })

    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}
