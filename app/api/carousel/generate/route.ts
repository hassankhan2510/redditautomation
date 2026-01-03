import { NextResponse } from 'next/server'
import { generateCompletion } from '@/lib/llm'

export async function POST(request: Request) {
    try {
        const { topic } = await request.json()

        if (!topic) return NextResponse.json({ error: 'Topic required' }, { status: 400 })

        const systemPrompt = `You are a LinkedIn Ghostwriter.
Your goal is to write a High-Value Carousel (PDF) structure (5-8 Slides).
Output valid JSON only: { "slides": ["Slide 1 Content", "Slide 2 Content", ...] }

CONTEXT AWARENESS:
- If Technical: Include "Code Snippets" or "Architecture Diagrams" descriptions.
- If Business: Use "Frameworks" and "Steps".
- If Political: Use "Quotes" and "Timelines".

CRITICAL VISUAL RULES:
1. DO NOT write single sentences.
2. Structure every slide as:
   "HEADLINE (Bold, <5 words)\\n\\n• Point 1 (Insight)\\n• Point 2 (Data)\\n• Point 3 (Takeaway)"
3. The Last Slide MUST be a "Cheat Sheet" summary.
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
