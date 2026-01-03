import { NextResponse } from 'next/server'
import Parser from 'rss-parser'

const parser = new Parser({
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
})

// === SOURCES ===

const REGIONS = {
    'pk': [
        { name: 'Dawn News', url: 'https://www.dawn.com/feeds/home', category: 'News' },
        { name: 'The News PK', url: 'https://www.thenews.com.pk/rss/1/1', category: 'News' },
        { name: 'ARY News', url: 'https://arynews.tv/feed/', category: 'News' },
        { name: 'Profit PK', url: 'https://profit.pakistantoday.com.pk/feed/', category: 'Business' }
    ],
    'global': [
        { name: 'Hacker News', url: 'https://hnrss.org/frontpage', category: 'Tech' },
        { name: 'OpenAI Blog', url: 'https://openai.com/blog/rss.xml', category: 'AI' },
        { name: 'MIT Tech Review', url: 'https://www.technologyreview.com/feed/', category: 'Science' },
        { name: 'The Verge', url: 'https://www.theverge.com/rss/index.xml', category: 'News' }
    ]
}

const CATEGORIES = {
    'business': [
        { name: 'CNBC', url: 'https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=10001147', category: 'Business' },
        { name: 'Yahoo Finance', url: 'https://finance.yahoo.com/news/rssindex', category: 'Business' },
        { name: 'Entrepreneur', url: 'https://www.entrepreneur.com/latest.rss', category: 'Business' }
    ],
    'tech': [
        { name: 'TechCrunch', url: 'https://techcrunch.com/feed/', category: 'Tech' },
        { name: 'Wired', url: 'https://www.wired.com/feed/rss', category: 'Tech' },
        { name: 'Ars Technica', url: 'https://arstechnica.com/feed/', category: 'Tech' }
    ]
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const region = searchParams.get('region')

    let sourcesToFetch = REGIONS['global']

    // Filter Logic
    if (region === 'pk') sourcesToFetch = REGIONS['pk']
    else if (category === 'business') sourcesToFetch = CATEGORIES['business']
    else if (category === 'tech') sourcesToFetch = CATEGORIES['tech']

    try {
        const feedPromises = sourcesToFetch.map(async (source: any) => {
            try {
                const feed = await parser.parseURL(source.url)
                return feed.items.map(item => ({
                    title: item.title,
                    link: item.link,
                    pubDate: item.pubDate,
                    source: source.name,
                    category: source.category,
                    snippet: item.contentSnippet?.substring(0, 200) || ""
                }))
            } catch (e) {
                console.error(`Failed to fetch ${source.name}`, e)
                return []
            }
        })

        const results = await Promise.all(feedPromises)
        // Flatten and Sort by Date
        const allItems = results.flat().sort((a, b) => {
            return new Date(b.pubDate!).getTime() - new Date(a.pubDate!).getTime()
        })

        return NextResponse.json({ items: allItems.slice(0, 40) })

    } catch (e: any) {
        console.error("Feed Error", e)
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}
