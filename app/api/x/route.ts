import { NextResponse } from 'next/server'
import { generateCompletion } from '@/lib/llm'

export async function POST(request: Request) {
    try {
        const { topic, tone, persona, language } = await request.json()

        if (!topic) return NextResponse.json({ error: 'Topic required' }, { status: 400 })

        const langInstruction = language === 'ur'
            ? "OUTPUT LANGUAGE: URDU (Standard Urdu Script). Write naturally for a South Asian audience."
            : "OUTPUT LANGUAGE: ENGLISH."

        const systemPrompt = `You are a ${persona || 'Social Media Expert'}.
Your goal is to write high-engagement posts that feel raw, authentic, and human.

${langInstruction}

CRITICAL RULES (ANTI-ROBOT MODE):
- NO hashtags (0 hashtags).
- NO bolding (**text**).
- NO markdown lists (- item). Use natural line breaks.
- NO emojis unless it fits the specific tone perfectly (keep it minimal).
- NO "Here are 3 variations" intro. Just the posts.
- NO "Unlock" or "Unleash" or "Elevate" (Banned AI words).
- Write exactly like a human user posted this from their phone.

CONTEXT:
Topic: "${topic}"
Style/Format: ${tone}
`

        const userPrompt = `
Generate 3 distinct variations separated by "---".
1. A short, punchy single tweet.
2. A detailed "insight" style post.
3. A "hook" style post.

Return ONLY the 3 variations separated by "---".
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
