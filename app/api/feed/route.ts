import { NextResponse } from 'next/server'
import Parser from 'rss-parser'

const parser = new Parser()

const FEEDS = [
    { name: 'Hacker News', url: 'https://hnrss.org/frontpage', category: 'Tech' },
    { name: 'OpenAI Blog', url: 'https://openai.com/blog/rss.xml', category: 'AI' },
    { name: 'MIT Tech Review', url: 'https://www.technologyreview.com/feed/', category: 'Science' },
    { name: 'Arxiv (AI)', url: 'http://export.arxiv.org/rss/cs.AI', category: 'Research' },
    { name: 'The Verge', url: 'https://www.theverge.com/rss/index.xml', category: 'News' }
]

export async function GET() {
    try {
        const feedPromises = FEEDS.map(async (source) => {
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

        return NextResponse.json({ items: allItems.slice(0, 30) }) // Top 30

    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}
