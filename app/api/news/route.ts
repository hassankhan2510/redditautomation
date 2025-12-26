import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const region = searchParams.get('region') || 'global' // 'pk' or 'global'
    const category = searchParams.get('category') || 'general'

    const apiKey = process.env.NEWS_API_KEY

    // Fallback Mock Data if no key (for local dev safety)
    if (!apiKey) {
        console.warn('NEWS_API_KEY is missing. Returning mock data.')
        return NextResponse.json({
            status: 'ok',
            articles: [
                {
                    source: { name: 'Mock News' },
                    title: 'DeepSeek releases new AI model surpassing GPT-4 (Mock)',
                    description: 'The open-source community celebrates a major milestone in LLM performance.',
                    url: 'https://example.com'
                },
                {
                    source: { name: 'TechCrunch' },
                    title: 'Pakistan tech exports surge by 20% in Q1 (Mock)',
                    description: 'IT sector shows robust growth amidst economic challenges.',
                    url: 'https://example.com'
                }
            ]
        })
    }

    try {
        let url = `https://newsapi.org/v2/top-headlines?apiKey=${apiKey}&pageSize=10`

        if (region === 'pk') {
            url = `https://newsapi.org/v2/top-headlines?apiKey=${apiKey}&country=pk&pageSize=10`
        } else {
            url = `https://newsapi.org/v2/top-headlines?apiKey=${apiKey}&language=en&pageSize=10`
            if (category === 'technology') url += '&category=technology'
        }

        console.log(`Fetching News: ${url}`)
        let res = await fetch(url, { next: { revalidate: 3600 } })
        let data = await res.json()

        // Fallback for PK if top-headlines is empty (common in Free tier or quiet days)
        if (region === 'pk' && (!data.articles || data.articles.length === 0)) {
            console.log("PK Top Headlines empty, switching to search query 'Pakistan'...")
            const fallbackUrl = `https://newsapi.org/v2/everything?apiKey=${apiKey}&q=pakistan&sortBy=publishedAt&language=en&pageSize=10`
            res = await fetch(fallbackUrl, { next: { revalidate: 3600 } })
            data = await res.json()
        }

        if (data.status !== 'ok') {
            // Log the actual error from NewsAPI for debugging
            console.error("NewsAPI Error:", data)
            throw new Error(data.message || 'NewsAPI Error')
        }

        return NextResponse.json(data)
    } catch (e: any) {
        console.error("API Route Error:", e)
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}
