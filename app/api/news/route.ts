import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const region = searchParams.get('region') || 'global' // 'pk' or 'global'
    const category = 'general'
    const apiKey = process.env.NEWS_API_KEY

    if (!apiKey) {
        return NextResponse.json({
            status: 'ok',
            articles: [
                {
                    source: { name: 'Dawn' },
                    title: 'Stock market crosses 70,000 points milestone (Mock)',
                    description: 'KSE-100 index shows historic performance.',
                    url: 'https://dawn.com'
                }
            ]
        })
    }

    try {
        let url = ''

        if (region === 'pk') {
            // STRATEGY: 
            // 1. Try Top Headlines from PK (often empty on free tier)
            // 2. If empty, use "Everything" but RESTRICTED to top Pakistani Domains
            // This prevents "BBC reporting on Pakistan" and gives "Dawn/Geo reporting on Pakistan"

            const pkDomains = 'dawn.com,tribune.com.pk,geo.tv,thenews.com.pk,brecorder.com,nation.com.pk,arynews.tv'

            // First try strict top-headlines (rarely works well for limited countries on free)
            url = `https://newsapi.org/v2/top-headlines?apiKey=${apiKey}&country=pk&pageSize=12`

            console.log(`Fetching PK Headlines: ${url}`)
            let res = await fetch(url, { next: { revalidate: 3600 } })
            let data = await res.json()

            if (!data.articles || data.articles.length === 0) {
                // Fallback: Use Domain Filter to force local sources
                console.log("PK Headlines empty. Switch to Domain Filter...")
                // We search for "Pakistan" OR widely relevant generic news within these domains
                // Actually, just listing domains and sorting by publishedAt is often best "feed"
                const fallbackUrl = `https://newsapi.org/v2/everything?apiKey=${apiKey}&domains=${pkDomains}&sortBy=publishedAt&pageSize=12`
                res = await fetch(fallbackUrl, { next: { revalidate: 3600 } })
                data = await res.json()
            }

            return NextResponse.json(data)

        } else {
            // Global Logic (Simple)
            url = `https://newsapi.org/v2/top-headlines?apiKey=${apiKey}&language=en&category=${category}&pageSize=12`
            const res = await fetch(url, { next: { revalidate: 3600 } })
            const data = await res.json()
            return NextResponse.json(data)
        }

    } catch (e: any) {
        console.error("API Route Error:", e)
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}
