import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const region = searchParams.get('region') || 'global' // 'pk' or 'global'

    // User requested "Every type of news", so we force 'general'
    const category = 'general'

    const apiKey = process.env.NEWS_API_KEY

    // Fallback Mock Data (Generic, not Tech-heavy)
    if (!apiKey) {
        return NextResponse.json({
            status: 'ok',
            articles: [
                {
                    source: { name: 'Mock News PK' },
                    title: 'Pakistan cricket team announces new squad (Mock)',
                    description: 'Major changes expected in the lineup for the upcoming series.',
                    url: 'https://example.com'
                },
                {
                    source: { name: 'Mock Global' },
                    title: 'Global markets rally as inflation data improves (Mock)',
                    description: 'Stocks hit record highs following the latest economic report.',
                    url: 'https://example.com'
                }
            ]
        })
    }

    try {
        let url = `https://newsapi.org/v2/top-headlines?apiKey=${apiKey}&pageSize=12`

        if (region === 'pk') {
            // PK: Explicitly ask for General category to avoid random focused English results
            url = `https://newsapi.org/v2/top-headlines?apiKey=${apiKey}&country=pk&category=general&pageSize=12`
        } else {
            // Global: Default to English, General Category
            url = `https://newsapi.org/v2/top-headlines?apiKey=${apiKey}&language=en&category=general&pageSize=12`
        }

        console.log(`Fetching News: ${url}`)
        let res = await fetch(url, { next: { revalidate: 3600 } })
        let data = await res.json()

        // Fallback for PK if top-headlines is empty
        if (region === 'pk' && (!data.articles || data.articles.length === 0)) {
            console.log("PK Top Headlines empty, switching to stricter search...")
            // Fix: Use qInTitle to ensure it's actually ABOUT Pakistan, not just mentioning it in footer
            // Removed 'language=en' restriction to allow local sources if indexed
            const fallbackUrl = `https://newsapi.org/v2/everything?apiKey=${apiKey}&qInTitle=Pakistan&sortBy=publishedAt&pageSize=12`
            res = await fetch(fallbackUrl, { next: { revalidate: 3600 } })
            data = await res.json()
        }

        if (data.status !== 'ok') {
            console.error("NewsAPI Error:", data)
            throw new Error(data.message || 'NewsAPI Error')
        }

        return NextResponse.json(data)
    } catch (e: any) {
        console.error("API Route Error:", e)
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}
