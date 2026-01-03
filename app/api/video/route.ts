import { NextResponse } from 'next/server'
import { generateCompletion } from '@/lib/llm'

export async function POST(request: Request) {
    try {
        const { script } = await request.json()

        if (!script) return NextResponse.json({ error: 'Script required' }, { status: 400 })

        const systemPrompt = `You are a World-Class Motion Designer.
Your goal is to turn text into a SCENE-BASED video script.
Output valid JSON only.

Structure:
{
  "scenes": [
    { "type": "title", "text": "MAIN HEADLINE", "subtext": "Subtitle here", "color": "blue" },
    { "type": "problem", "text": "The Pain Point", "icon": "alert", "color": "red" },
    { "type": "solution", "text": "The Fix", "list": ["Step 1", "Step 2"], "color": "green" },
    { "type": "quote", "text": "Inspirational Quote", "author": "Author Name", "color": "purple" },
    { "type": "outro", "text": "Call To Action", "subtext": "Follow for more", "color": "black" }
  ]
}

Rules:
- Create 5-7 scenes for a complete story.
- "text" must be punchy (max 5 words).
- Colors: Choose from [blue, red, green, purple, black, orange].
- Be kinetic and exciting.
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

        // Inject Mode if provided
        if (mode) videoData.mode = mode

        return NextResponse.json({ videoData })

    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}
