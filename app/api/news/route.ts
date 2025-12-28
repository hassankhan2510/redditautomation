import { NextResponse } from 'next/server'
import Parser from 'rss-parser'

// Initialize RSS Parser with User-Agent to avoid 403s
const parser = new Parser({
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
})

// === VERIFIED FEED SOURCES ===

// 1. REGIONAL (Pakistan vs Global)
const REGIONS = {
    'pk': [
        'https://www.dawn.com/feeds/home',
        'https://www.thenews.com.pk/rss/1/1',
        'https://arynews.tv/feed/',
        'https://profit.pakistantoday.com.pk/feed/' // Added Profit PK
    ],
    'global': [
        'http://feeds.bbci.co.uk/news/rss.xml',
        'http://rss.cnn.com/rss/edition.rss',
        'https://www.theverge.com/rss/index.xml'
    ]
}

// 2. CATEGORIES (New Request)
const CATEGORIES: Record<string, string[]> = {
    'business': [
        'https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=10001147', // CNBC
        'https://finance.yahoo.com/news/rssindex', // Yahoo Finance
        'https://www.entrepreneur.com/latest.rss'
    ],
    'tech': [
        'https://techcrunch.com/feed/',
        'https://www.wired.com/feed/rss',
        'https://arstechnica.com/feed/'
    ],
    'politics': [
        'http://rss.cnn.com/rss/cnn_allpolitics.rss', // CNN Politics
        'https://feeds.bbci.co.uk/news/politics/rss.xml' // BBC Politics
    ],
    'stock': [
        'https://www.investing.com/rss/news.rss', // Investing.com
        'https://www.marketwatch.com/rss/topstories' // MarketWatch
    ]
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const customUrl = searchParams.get('customUrl')
    const category = searchParams.get('category') // 'business', 'tech', etc.
    const region = searchParams.get('region') || 'global'

    let feedsToFetch: string[] = []

    // Priority: Custom > Category > Region
    if (customUrl) {
        feedsToFetch = [customUrl]
    } else if (category && CATEGORIES[category]) {
        feedsToFetch = CATEGORIES[category]
    } else {
        feedsToFetch = REGIONS[region as keyof typeof REGIONS] || REGIONS['global']
    }

    try {
        // Fetch in parallel
        const feedPromises = feedsToFetch.map(async (url) => {
            try {
                const feed = await parser.parseURL(url)
                return feed.items.map(item => ({
                    source: { name: feed.title?.trim() || 'News Source' },
                    title: item.title,
                    description: item.contentSnippet || item.content || '',
                    url: item.link,
                    publishedAt: item.isoDate || item.pubDate ? new Date(item.isoDate || item.pubDate!).toISOString() : new Date().toISOString()
                }))
            } catch (err: any) {
                console.error(`RSS Error [${url}]:`, err.message)
                return [] // Fail gracefully
            }
        })

        const feedResults = await Promise.all(feedPromises)
        const allArticles = feedResults.flat()

        // Deduplicate
        const seenTitles = new Set()
        const uniqueArticles = allArticles.filter(item => {
            if (seenTitles.has(item.title)) return false
            seenTitles.add(item.title)
            return true
        })

        // Sort Newest First
        uniqueArticles.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())

        return NextResponse.json({
            status: 'ok',
            totalResults: uniqueArticles.length,
            articles: uniqueArticles.slice(0, 30) // Increased limit slightly
        })

    } catch (e: any) {
        console.error("RSS Aggregator Error:", e)
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}
