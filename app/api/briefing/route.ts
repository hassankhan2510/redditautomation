import { NextResponse } from 'next/server'
import Parser from 'rss-parser'
import { getOrGenerateExplanation } from '@/lib/research'

const parser = new Parser()

export async function GET() {
    try {
        // 1. Fetch Hourly PK News (Top 1)
        const pkFeedUrl = 'https://www.dawn.com/feeds/home/'
        const pkFeed = await parser.parseURL(pkFeedUrl)

        let hourlyNews = pkFeed.items[0] ? {
            title: pkFeed.items[0].title,
            link: pkFeed.items[0].link,
            snippet: pkFeed.items[0].contentSnippet?.slice(0, 200),
            source: "Dawn News",
            pubDate: pkFeed.items[0].pubDate
        } : null

        // 2. Fetch Daily 2 Deep Dives
        const arxivUrl = 'http://export.arxiv.org/api/query?search_query=cat:cs.AI&start=0&max_results=5&sortBy=submittedDate&sortOrder=descending'
        const techUrl = 'https://techcrunch.com/feed/'

        const [arxivRes, techFeed] = await Promise.all([
            fetch(arxivUrl).then(res => res.text()),
            parser.parseURL(techUrl)
        ])

        const arxivEntry = arxivRes.match(/<entry>([\s\S]*?)<\/entry>/)
        let arxivItem = arxivEntry ? {
            title: arxivEntry[1].match(/<title>([\s\S]*?)<\/title>/)?.[1].replace(/\n/g, ' ').trim(),
            link: arxivEntry[1].match(/<id>([\s\S]*?)<\/id>/)?.[1],
            snippet: arxivEntry[1].match(/<summary>([\s\S]*?)<\/summary>/)?.[1].replace(/\n/g, ' ').slice(0, 200),
            pubDate: arxivEntry[1].match(/<published>([\s\S]*?)<\/published>/)?.[1],
            source: "ArXiv Research",
            type: "paper"
        } : null

        let techItem = techFeed.items[0] ? {
            title: techFeed.items[0].title,
            link: techFeed.items[0].link,
            snippet: techFeed.items[0].contentSnippet?.slice(0, 200),
            pubDate: techFeed.items[0].pubDate,
            source: "TechCrunch",
            type: "article"
        } : null

        // 3. Auto-Explain All Items (Parallel)
        // We catch errors individually so one failure doesn't break the whole briefing
        const explainItem = async (item: any, category: string) => {
            if (!item?.link) return item
            try {
                const { explanation } = await getOrGenerateExplanation(item.link, category, item.title)
                return { ...item, explanation }
            } catch (e) {
                console.error(`Auto-explain failed for ${item.link}`, e)
                return item
            }
        }

        const [processedHourly, processedArxiv, processedTech] = await Promise.all([
            explainItem(hourlyNews, 'news'),
            explainItem(arxivItem, 'research'),
            explainItem(techItem, 'tech')
        ])

        return NextResponse.json({
            hourlyNews: processedHourly,
            dailyDeepDives: [processedArxiv, processedTech].filter(Boolean)
        })

    } catch (e: any) {
        console.error("Briefing API Error:", e)
        return NextResponse.json({ error: "Failed to generate briefing" }, { status: 500 })
    }
}
