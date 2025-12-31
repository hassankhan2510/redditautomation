import { NextResponse } from 'next/server'
import { generateCompletion } from '@/lib/llm'

export async function POST(request: Request) {
    try {
        const { script } = await request.json()

        if (!script) return NextResponse.json({ error: 'Script required' }, { status: 400 })

        const systemPrompt = `You are an expert Video Director.
Your goal is to parse raw text into a STRUCTURED JSON format for a kinetic typography video.
Output valid JSON only.

Structure:
{
  "title": "Short Punchy Header (Max 4 words)",
  "subtitle": "One sentence context explanation",
  "points": ["Point 1", "Point 2", "Point 3", "Point 4"]
}

Rules:
- Title must be high-impact.
- Points must be concise (Max 6 words each).
- Max 5 points.
`

        const userPrompt = `Convert this text into a video script:\n"${script}"`

        const completion = await generateCompletion(systemPrompt, userPrompt)

        // Parse JSON safely
        let videoData
        try {
            // strip markdown code blocks if present
            const cleanJson = completion.replace(/```json/g, '').replace(/```/g, '').trim()
            videoData = JSON.parse(cleanJson)
        } catch (e) {
            return NextResponse.json({ error: "Failed to generate video structure", raw: completion }, { status: 500 })
        }

        return NextResponse.json({ videoData })

    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}
