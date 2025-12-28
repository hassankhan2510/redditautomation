import { NextResponse } from 'next/server'
import Parser from 'rss-parser'

const parser = new Parser({
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
})

// Reliable sources for "Viral Tech Discourse"
const FEEDS = [
    { url: 'https://www.techmeme.com/feed.xml', source: 'TechMeme' },
    { url: 'https://news.ycombinator.com/rss', source: 'Hacker News' },
    { url: 'https://verge.com/rss/index.xml', source: 'The Verge' }
]

export async function GET() {
    try {
        const feedPromises = FEEDS.map(async (feedInfo) => {
            try {
                const feed = await parser.parseURL(feedInfo.url)
                return feed.items.map(item => ({
                    title: item.title,
                    link: item.link,
                    source: feedInfo.source,
                    pubDate: item.pubDate
                })).slice(0, 5) // Top 5 from each
            } catch (e) {
                console.error(`Error fetching ${feedInfo.source}:`, e)
                return []
            }
        })

        const results = await Promise.all(feedPromises)
        const allTrends = results.flat().sort((a, b) => {
            return new Date(b.pubDate!).getTime() - new Date(a.pubDate!).getTime()
        })

        return NextResponse.json({ trends: allTrends })

    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}
