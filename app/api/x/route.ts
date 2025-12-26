import { NextResponse } from 'next/server'
import { generateCompletion } from '@/lib/llm'

export async function POST(request: Request) {
    try {
        const { topic, tone } = await request.json()

        if (!topic) return NextResponse.json({ error: 'Topic required' }, { status: 400 })

        const systemPrompt = `You are a viral social media manager for X (Twitter).
Your goal is to write high-engagement posts that stop the scroll.
You understand hooks, spacing, and the "valuable thread" format.
Never use hashtags unless explicitly appropriate for a trend (max 1).
Never use "Click the link below" (we don't have links).
Use short, punchy sentences.
`

        const userPrompt = `
Topic/Context: "${topic}"
Desired Style: ${tone}

Please generate 3 distinct variations of an X post/thread starter based on this topic.
1. A short, punchy single tweet.
2. A detailed "insight" style post (can be longer).
3. A "hook" style post that creates curiosity.

Return ONLY the 3 variations separated by "---".
Do not number them "1.", "2." manually if you can avoid it, just the content.
`

        const completion = await generateCompletion(systemPrompt, userPrompt)

        // Split by "---"
        const tweets = completion.split('---').map(t => t.trim()).filter(t => t.length > 0)

        return NextResponse.json({ tweets })

    } catch (e: any) {
        console.error(e)
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}
