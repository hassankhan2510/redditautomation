import { NextResponse } from 'next/server'
import { generateCompletion } from '@/lib/llm'

export async function POST(request: Request) {
    try {
        const { topic } = await request.json()

        if (!topic) return NextResponse.json({ error: 'Topic required' }, { status: 400 })

        const systemPrompt = `You are a LinkedIn Carousel Expert.
Your goal is to write a viral 5-10 slide carousel structure.
Output valid JSON only: { "slides": ["Slide 1 Text", "Slide 2 Text", ...] }

Rules:
- Slide 1: Punchy Hook (Short).
- Slide 2: Context/Problem.
- Slide 3-7: Value/Steps.
- Last Slide: Call to Action.
- Keep text under 20 words per slide for design.
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
