import { NextResponse } from 'next/server'
import { generateCompletion } from '@/lib/llm'
import { getPromptForCategory } from '@/lib/prompts'

// Simple HTML to text extraction
function extractTextFromHtml(html: string): string {
    // Remove script and style tags with their content
    let text = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    text = text.replace(/<noscript[^>]*>[\s\S]*?<\/noscript>/gi, '')

    // Remove HTML tags but keep text content
    text = text.replace(/<[^>]+>/g, ' ')

    // Decode common HTML entities
    text = text.replace(/&nbsp;/g, ' ')
    text = text.replace(/&amp;/g, '&')
    text = text.replace(/&lt;/g, '<')
    text = text.replace(/&gt;/g, '>')
    text = text.replace(/&quot;/g, '"')
    text = text.replace(/&#39;/g, "'")
    text = text.replace(/&apos;/g, "'")
    text = text.replace(/&#x27;/g, "'")
    text = text.replace(/&#x2F;/g, '/')

    // Clean up whitespace
    text = text.replace(/\s+/g, ' ').trim()

    return text.substring(0, 15000) // 15k char limit
}

export async function POST(request: Request) {
    try {
        const { url, category, title } = await request.json()

        if (!url) {
            return NextResponse.json({ error: "URL is required" }, { status: 400 })
        }

        const startTime = Date.now()
        console.log(`🔍 Analyzing: ${url} [${category}]`)

        let text = ""
        let fetchSuccess = false

        // Attempt to fetch the article
        try {
            const res = await fetch(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.9',
                },
                signal: AbortSignal.timeout(15000) // 15s timeout
            })

            if (res.ok) {
                const html = await res.text()
                text = extractTextFromHtml(html)
                fetchSuccess = true
                console.log(`✅ Fetched: ${text.length} chars in ${Date.now() - startTime}ms`)
            }
        } catch (e) {
            console.error("⚠️ Fetch failed:", e)
        }

        // If fetch failed or content too short, use title + URL as context
        if (!fetchSuccess || text.length < 300) {
            console.log("📝 Using title-based analysis")
            text = `Title: ${title || 'Unknown'}\nURL: ${url}\nNote: Unable to access full article content. Please provide analysis based on the title and what you know about this topic.`
        }

        // Get the appropriate prompt for this category
        const systemPrompt = getPromptForCategory(category)

        // Generate the explanation
        const userPrompt = `Analyze this content and provide a comprehensive breakdown:\n\n${text}`
        const explanation = await generateCompletion(systemPrompt, userPrompt)

        console.log(`✨ Analysis complete in ${Date.now() - startTime}ms`)

        return NextResponse.json({
            explanation,
            fetchedContent: fetchSuccess,
            contentLength: text.length
        })

    } catch (e: any) {
        console.error("❌ Explain API Error:", e)
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}
