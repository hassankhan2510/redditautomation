import { NextResponse } from 'next/server'
import { generateCompletion } from '@/lib/llm'

export async function POST(request: Request) {
    try {
        const { topic } = await request.json()

        if (!topic) return NextResponse.json({ error: 'Topic required' }, { status: 400 })

        const systemPrompt = `You are a LinkedIn Ghostwriter.
Your goal is to write a High-Value Carousel (5-8 Slides).
Output valid JSON only: { "slides": ["Slide 1 Content", "Slide 2 Content", ...] }

CRITICAL RULES:
1. DO NOT write single sentences.
2. Each slide must have a HEADLINE (Bold) and a short BODY (Explanation).
3. Use '\\n' for line breaks.
4. Style: Dense, Actionable, No Fluff.
5. Example format:
   "HEADLINE HERE\\n\\n• Point 1\\n• Point 2"
`
        const userPrompt = `Topic: ${topic}`

        const completion = await generateCompletion(systemPrompt, userPrompt)

        let data
        try {
            data = JSON.parse(completion.replace(/```json/g, '').replace(/```/g, '').trim())
        } catch (e) {
            return NextResponse.json({ error: "Failed to parse slides" }, { status: 500 })
        }

        return NextResponse.json({ slides: data.slides })

    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}
