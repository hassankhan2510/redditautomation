

import { NextResponse } from 'next/server'
import { generateCompletion } from '@/lib/llm'
import { scrapeContent } from '@/lib/scraper' // 1. Import scrapeContent

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

export async function POST(request: Request) {
    try {
        const { url, category } = await request.json() // Removed 'content', added 'source' (though 'source' isn't used in the provided snippet)

        if (!url) {
            return NextResponse.json({ error: "URL is required" }, { status: 400 })
        }

        // 1. Scrape Content (Browser-Based)
        const startTime = Date.now()
        console.log(`Analyzing: ${url} [${category}]`)

        let text = ""
        let scrapedSuccessfully = false

        try {
            const scraped = await scrapeContent(url)

            if (scraped && scraped.content) {
                text = scraped.content
                scrapedSuccessfully = true
                console.log(`Puppeteer Success: ${text.length} chars in ${Date.now() - startTime} ms`)
            } else {
                console.log("Puppeteer failed, falling back to simple fetch...")
                // Simple Fallback
                const res = await fetch(url)
                text = await res.text() // Raw HTML is better than nothing for LLM
                console.log(`Simple Fetch Fallback: ${text.length} chars in ${Date.now() - startTime} ms`)
            }
        } catch (e) {
            console.error("Error during scraping, falling back to simple fetch:", e)
            try {
                const res = await fetch(url)
                text = await res.text()
                console.log(`Simple Fetch Fallback after error: ${text.length} chars in ${Date.now() - startTime} ms`)
            } catch (fetchError) {
                return NextResponse.json({ error: "Failed to scrape URL even with fallback" }, { status: 400 })
            }
        }

        if (!text || text.length < 500) { // Updated content length check
            return NextResponse.json({ error: "Failed to read article content or content too short" }, { status: 400 })
        }

        const systemPrompt = getPrompt(category)
        const explanation = await generateCompletion(systemPrompt, `Analyze this text: \n\n${text} `)

        return NextResponse.json({ explanation })

    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}
