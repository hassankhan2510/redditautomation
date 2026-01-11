import { NextResponse } from 'next/server'
import { generateCompletion } from '@/lib/llm'

// === SYSTEM PROMPTS ===
import {
    SCIENCE_PROMPT,
    NEWS_PROMPT,
    PHILOSOPHY_PROMPT,
    BUSINESS_PROMPT,
    HISTORY_PROMPT,
    ENGINEERING_PROMPT,
    STOCKS_PROMPT
} from '@/lib/prompts'

function getPrompt(category: string) {
    const cat = category?.toLowerCase() || ''

    // 1. Specific High-Value Categories
    if (cat.includes('hist')) return HISTORY_PROMPT
    if (cat.includes('stock') || cat.includes('cryp') || cat.includes('fin') || cat.includes('invest')) return STOCKS_PROMPT
    if (cat.includes('eng') || cat.includes('launch') || cat.includes('code') || cat.includes('dev') || cat.includes('tech')) return ENGINEERING_PROMPT

    // 2. Core Categories
    if (cat.includes('scien') || cat.includes('ai') || cat.includes('bio') || cat.includes('phys') || cat.includes('math')) return SCIENCE_PROMPT
    if (cat.includes('news') || cat.includes('poli') || cat.includes('pk') || cat.includes('glob')) return NEWS_PROMPT
    if (cat.includes('phil') || cat.includes('idea')) return PHILOSOPHY_PROMPT
    if (cat.includes('bus') || cat.includes('grow') || cat.includes('startup')) return BUSINESS_PROMPT

    // 3. Fallback
    return SCIENCE_PROMPT
}

// Simple HTML to text extraction (no Puppeteer)
function extractTextFromHtml(html: string): string {
    // Remove script and style tags with their content
    let text = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')

    // Remove HTML tags but keep text content
    text = text.replace(/<[^>]+>/g, ' ')

    // Decode common HTML entities
    text = text.replace(/&nbsp;/g, ' ')
    text = text.replace(/&amp;/g, '&')
    text = text.replace(/&lt;/g, '<')
    text = text.replace(/&gt;/g, '>')
    text = text.replace(/&quot;/g, '"')
    text = text.replace(/&#39;/g, "'")

    // Clean up whitespace
    text = text.replace(/\s+/g, ' ').trim()

    return text.substring(0, 15000) // 15k char limit
}

export async function POST(request: Request) {
    try {
        const { url, category } = await request.json()

        if (!url) {
            return NextResponse.json({ error: "URL is required" }, { status: 400 })
        }

        // Simple fetch - no Puppeteer (avoids CAPTCHA issues)
        const startTime = Date.now()
        console.log(`Analyzing: ${url} [${category}]`)

        let text = ""

        try {
            const res = await fetch(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
                }
            })
            const html = await res.text()
            text = extractTextFromHtml(html)
            console.log(`Simple Fetch Success: ${text.length} chars in ${Date.now() - startTime} ms`)
        } catch (e) {
            console.error("Error during fetch:", e)
            return NextResponse.json({ error: "Failed to fetch URL" }, { status: 400 })
        }

        if (!text || text.length < 500) {
            return NextResponse.json({ error: "Failed to read article content or content too short" }, { status: 400 })
        }

        const systemPrompt = getPrompt(category)
        const explanation = await generateCompletion(systemPrompt, `Analyze this text: \n\n${text} `)

        return NextResponse.json({ explanation })

    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}
