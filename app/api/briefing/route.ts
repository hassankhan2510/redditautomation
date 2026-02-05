import { NextResponse } from 'next/server'
import Parser from 'rss-parser'

const parser = new Parser()

export async function GET() {
    try {
        // 1. Fetch Hourly PK News (Top 1)
        // We'll use a specific PK news source for reliability
        const pkFeedUrl = 'https://www.dawn.com/feeds/home/'
        const pkFeed = await parser.parseURL(pkFeedUrl)

        // Get the latest item
        const latestPkNews = pkFeed.items[0] ? {
            title: pkFeed.items[0].title,
            link: pkFeed.items[0].link,
            snippet: pkFeed.items[0].contentSnippet?.slice(0, 200),
            source: "Dawn News",
            pubDate: pkFeed.items[0].pubDate
        } : null

        // 2. Fetch Daily 2 Deep Dives (e.g. from ArXiv or TechCrunch)
        // For variety, let's mix one science/tech paper and one business/tech news
        const arxivUrl = 'http://export.arxiv.org/api/query?search_query=cat:cs.AI&start=0&max_results=5&sortBy=submittedDate&sortOrder=descending'
        const techUrl = 'https://techcrunch.com/feed/'

        // We fetch in parallel
        const [arxivRes, techFeed] = await Promise.all([
            fetch(arxivUrl).then(res => res.text()),
            parser.parseURL(techUrl)
        ])

        // Parse ArXiv XML manually (simple regex for speed)
        const arxivEntry = arxivRes.match(/<entry>([\s\S]*?)<\/entry>/)
        const arxivItem = arxivEntry ? {
            title: arxivEntry[1].match(/<title>([\s\S]*?)<\/title>/)?.[1].replace(/\n/g, ' ').trim(),
            link: arxivEntry[1].match(/<id>([\s\S]*?)<\/id>/)?.[1],
            snippet: arxivEntry[1].match(/<summary>([\s\S]*?)<\/summary>/)?.[1].replace(/\n/g, ' ').slice(0, 200),
            source: "ArXiv Research",
            type: "paper"
        } : null

        // Tech item
        const techItem = techFeed.items[0] ? {
            title: techFeed.items[0].title,
            link: techFeed.items[0].link,
            snippet: techFeed.items[0].contentSnippet?.slice(0, 200),
            source: "TechCrunch",
            type: "article"
        } : null

        return NextResponse.json({
            hourlyNews: latestPkNews,
            dailyDeepDives: [arxivItem, techItem].filter(Boolean)
        })

    } catch (e: any) {
        console.error("Briefing API Error:", e)
        return NextResponse.json({ error: "Failed to generate briefing" }, { status: 500 })
    }
}
