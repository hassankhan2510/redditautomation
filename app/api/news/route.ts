import { NextResponse } from 'next/server'
import Parser from 'rss-parser'

// Initialize RSS Parser
const parser = new Parser()

// Define Feed Sources - Verified URLs
const PK_FEEDS = [
    'https://www.dawn.com/feeds/home',
    'https://www.geo.tv/rss/1',
    'https://tribune.com.pk/feed',
    'https://www.thenews.com.pk/rss/1/1'
]

const GLOBAL_FEEDS = [
    'http://feeds.bbci.co.uk/news/rss.xml',
    'http://rss.cnn.com/rss/edition.rss',
    'https://www.theverge.com/rss/index.xml', // Tech mix
]

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const region = searchParams.get('region') || 'global' // 'pk' or 'global'

    // Select feeds based on region
    const feedsToFetch = region === 'pk' ? PK_FEEDS : GLOBAL_FEEDS

    try {
        console.log(`Fetching RSS feeds for region: ${region} from ${feedsToFetch.length} sources...`)

        // Fetch in parallel (fail-safe: if one fails, others still load)
        const feedPromises = feedsToFetch.map(async (url) => {
            try {
                const feed = await parser.parseURL(url)
                // Normalize feed items to match our App's structure
                // We map 'feed.title' to 'source.name'
                return feed.items.map(item => ({
                    source: { name: feed.title?.trim() || 'News Source' },
                    title: item.title,
                    description: item.contentSnippet || item.content || '',
                    url: item.link,
                    publishedAt: item.isoDate || item.pubDate ? new Date(item.isoDate || item.pubDate!).toISOString() : new Date().toISOString()
                }))
            } catch (err) {
                console.error(`Failed to parse feed ${url}:`, err)
                return [] // Return empty array on failure
            }
        })

        const feedResults = await Promise.all(feedPromises)

        // Flatten array of arrays
        let allArticles = feedResults.flat()

        // Deduplicate (based on URL or Title)
        const uniqueArticles = Array.from(new Map(allArticles.map(item => [item.title, item])).values())

        // Sort by date (Newest first)
        uniqueArticles.sort((a, b) => {
            return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
        })

        // Limit to 20 items to keep payload light
        const finalArticles = uniqueArticles.slice(0, 20)

        // Return in same format as NewsAPI for compatibility
        return NextResponse.json({
            status: 'ok',
            totalResults: finalArticles.length,
            articles: finalArticles
        })

    } catch (e: any) {
        console.error("RSS Route Error:", e)
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}
