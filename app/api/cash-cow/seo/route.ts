import { NextResponse } from 'next/server'
import { generateCompletion } from '@/lib/llm'

const SEO_PROMPT = `You are a YouTube Shorts and TikTok Algorithm Expert.
Your goal is to maximize RETENTION and CLICKS.

Input: A Reddit Story.
Output: A JSON Payload with:
1. "title": A viral, curiosity-gap title (Max 50 chars). USE CAPS for emphasis.
2. "description": A 3-sentence hook description.
3. "tags": 15 high-traffic hashtags (mixed broad and niche).
4. "posting_time": The best time to post this specific content (EST).

Story:
`

export async function POST(request: Request) {
    try {
        const { story } = await request.json()

        const response = await generateCompletion(SEO_PROMPT, story)

        // Naive JSON extraction (User asked for "Hard Code", usually better to use Schema mode if available, 
        // but text mode is robust with clear prompts).
        // I will return the raw text and let the UI display it formatted.

        return NextResponse.json({ seo: response })

    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}
