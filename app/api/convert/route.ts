import { NextResponse } from 'next/server'
import { generateCompletion } from '@/lib/llm'
import * as cheerio from 'cheerio'

export async function POST(request: Request) {
    try {
        const { url, platform } = await request.json()

        if (!url) return NextResponse.json({ error: 'URL required' }, { status: 400 })

        // 1. Fetch content
        const response = await fetch(url)
        const html = await response.text()
        const $ = cheerio.load(html)

        // Remove scripts, styles
        $('script').remove()
        $('style').remove()

        // simple text extraction
        const title = $('title').text()
        const body = $('body').text().replace(/\s+/g, ' ').substring(0, 5000) // Limit context

        // 2. LLM Summarization
        const systemPrompt = `You are a Content Repurposing Expert.
Your goal is to convert a Blog Post/Article into an engaging Social Media Post for ${platform || 'Twitter'}.

RULES:
- Identify the 3-5 key takeaways.
- Start with a strong hook (citing the source).
- Use bullet points for readability.
- Add a CTA to read the full article (include the link).
`

        const userPrompt = `
ARTICLE TITLE: ${title}
ARTICLE CONTENT: ${body}
SOURCE URL: ${url}

ACTION: Write a thread/post.
`

        const thread = await generateCompletion(systemPrompt, userPrompt)

        return NextResponse.json({ thread })

    } catch (e: any) {
        console.error(e)
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}
