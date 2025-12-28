import { NextResponse } from 'next/server'
import Parser from 'rss-parser'
import * as cheerio from 'cheerio'

const parser = new Parser({
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
})

export async function POST(request: Request) {
    try {
        const { keyword } = await request.json()

        if (!keyword) return NextResponse.json({ error: 'Keyword required' }, { status: 400 })

        // Use Reddit Search RSS
        const rssUrl = `https://www.reddit.com/search.rss?q=${encodeURIComponent(keyword)}&sort=new`

        try {
            const feed = await parser.parseURL(rssUrl)

            const leads = feed.items.map(item => {
                // Extract clean text from Reddit's HTML description
                const $ = cheerio.load(item.content || item.contentSnippet || '')
                const text = $('body').text().substring(0, 300)

                return {
                    title: item.title,
                    link: item.link,
                    snippet: text,
                    date: item.pubDate,
                    author: item.author
                }
            }).slice(0, 10) // Top 10 newest leads

            return NextResponse.json({ leads })

        } catch (rssError) {
            console.error("RSS Error:", rssError)
            return NextResponse.json({ error: "Failed to fetch Reddit feeds. Reddit might be rate limiting." }, { status: 500 })
        }

    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}
