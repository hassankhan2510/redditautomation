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
- STRICT LENGTH LIMIT: Every single tweet variation MUST be under 280 characters. This is non-negotiable.

CONTEXT:
Topic: "${topic}"
Style/Format: ${tone}
`

        const userPrompt = `
Generate 3 distinct variations separated by "---".
All 3 must be high-impact X posts matching the "${tone}" style.
VERY IMPORTANT: Keep them SHORT. Maximum 2-3 sentences per post.

Return ONLY the 3 variations separated by "---".
`

        const completion = await generateCompletion(systemPrompt, userPrompt)

        // Split by "---" and Enforce 280 Character Limit
        const tweets = completion.split('---')
            .map(t => t.trim())
            .filter(t => t.length > 0)
            .map(t => {
                // Hard Cutoff Safety Net
                if (t.length > 280) {
                    return t.substring(0, 275) + "..."
                }
                return t
            })

        return NextResponse.json({ tweets })

    } catch (e: any) {
        console.error(e)
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}
