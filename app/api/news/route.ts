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
        // NewsAPI param logic
        // "global" isn't a country code, so we use 'us' or just category if 'global'
        // 'pk' is valid.

        let url = `https://newsapi.org/v2/top-headlines?apiKey=${apiKey}&pageSize=6`

        if (region === 'pk') {
            url += `&country=pk`
        } else {
            // Global/Western focus for X virality often implies US/Tech
            url += `&language=en`
            if (category === 'technology') url += '&category=technology'
        }

        const res = await fetch(url, { next: { revalidate: 3600 } }) // Cache for 1 hour
        const data = await res.json()

        if (data.status !== 'ok') {
            throw new Error(data.message || 'NewsAPI Error')
        }

        return NextResponse.json(data)
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}
