import { createClient } from '@supabase/supabase-js'
import { generateCompletion } from '@/lib/llm'
import { getPromptForCategory } from '@/lib/prompts'

// Initialize Supabase client (server-side only)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! // Or service_role in production for bypassed RLS
const supabase = createClient(supabaseUrl, supabaseKey)

// Simple HTML to text extraction
export function extractTextFromHtml(html: string): string {
    let text = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    text = text.replace(/<noscript[^>]*>[\s\S]*?<\/noscript>/gi, '')
    text = text.replace(/<[^>]+>/g, ' ')
    text = text.replace(/&nbsp;/g, ' ')
    text = text.replace(/&amp;/g, '&')
    text = text.replace(/&lt;/g, '<')
    text = text.replace(/&gt;/g, '>')
    text = text.replace(/&quot;/g, '"')
    text = text.replace(/&#39;/g, "'")
    text = text.replace(/&#x27;/g, "'")
    text = text.replace(/\s+/g, ' ').trim()
    return text.substring(0, 15000)
}

// Generate explanation from URL
export async function generateResearch(url: string, category: string, title?: string): Promise<{ explanation: string, fetchedContent: boolean }> {
    const startTime = Date.now()
    console.log(`🔍 Generating for: ${url}`)

    let text = ""
    let fetchSuccess = false

    try {
        const res = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            },
            signal: AbortSignal.timeout(15000)
        })
        if (res.ok) {
            const html = await res.text()
            text = extractTextFromHtml(html)
            fetchSuccess = true
        }
    } catch (e) {
        console.error("Fetch failed:", e)
    }

    if (!fetchSuccess || text.length < 300) {
        text = `Title: ${title || 'Unknown'}\nURL: ${url}\nNote: Unable to access full article content. Please provide analysis based on the title/snippet.`
    }

    const systemPrompt = getPromptForCategory(category)
    const userPrompt = `Analyze this content and provide a comprehensive breakdown:\n\n${text}`
    const explanation = await generateCompletion(systemPrompt, userPrompt)

    return { explanation, fetchedContent: fetchSuccess }
}

// Get from cache or generate
export async function getOrGenerateExplanation(url: string, category: string, title?: string) {
    // 1. Check Cache
    // We use simple base64 of URL as hash to avoid issues with long URLs in index, or just query by URL if indexed
    // For simplicity, let's query by URL directly (assuming index exists or table small)
    // Actually schema uses url_hash unique. Let's use btoa(url)
    const urlHash = btoa(url).slice(0, 100) // limit length

    const { data: cached } = await supabase
        .from('explanation_cache')
        .select('explanation')
        .eq('url_hash', urlHash)
        .single()

    if (cached) {
        console.log(`⚡ Cache hit for: ${url}`)
        return { explanation: cached.explanation, cached: true }
    }

    // 2. Generate
    const { explanation, fetchedContent } = await generateResearch(url, category, title)

    // 3. Save to Cache (fire and forget)
    // We don't await this to speed up response, but in serverless we might need to await
    // For Vercel, await is safer
    await supabase.from('explanation_cache').upsert({
        url_hash: urlHash,
        url: url,
        category: category,
        explanation: explanation
    })

    return { explanation, cached: false, fetchedContent }
}
