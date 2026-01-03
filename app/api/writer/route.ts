import { NextResponse } from 'next/server'
import { generateCompletion } from '@/lib/llm'

export async function POST(request: Request) {
    try {
        const { topic, mode } = await request.json()

        if (!topic) return NextResponse.json({ error: 'Topic required' }, { status: 400 })

        const systemPrompt = `You are a legendary YouTube Shorts Scriptwriter.
Your goal is to write a VIRAL, FAST-PACED script (45-60s).

CONTEXT AWARENESS:
- IF POLITICAL: Focus on "Anger" or "Injustice". "They are lying to you about X."
- IF TECHNICAL: Focus on "Speed" or "Obscurity". "Stop using Python for this."
- IF BUSINESS: Focus on "Money" or "Freedom". "How I made $10k in a week."

STRUCTURE:
1.  **The Hook (0-3s)**: Must physically stop the scroll.
2.  **The Re-Hook (3-10s)**: "But here is the crazy part..."
3.  **The Value (10-40s)**: Rapid-fire facts. No breaths.
4.  **The CTA (40s+)**: "Subscribe if..."

Example Output:
"Stop using Chrome. Seriously. It's spying on you. Here are 3 browsers that actually protect you..."
`

        const userPrompt = `Write a viral short script about: "${topic}"`

        const script = await generateCompletion(systemPrompt, userPrompt)

        return NextResponse.json({ script })

    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}
