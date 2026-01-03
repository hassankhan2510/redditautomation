import { NextResponse } from 'next/server'
import Parser from 'rss-parser'

const parser = new Parser()

const TARGET_SUBREDDITS = [
    'https://www.reddit.com/r/AITAH/top/.rss?t=day',
    'https://www.reddit.com/r/confessions/top/.rss?t=day',
    'https://www.reddit.com/r/tifu/top/.rss?t=day',
    'https://www.reddit.com/r/relationship_advice/top/.rss?t=day'
]

export async function GET() {
    try {
        const promises = TARGET_SUBREDDITS.map(async (url) => {
            try {
                const feed = await parser.parseURL(url)
                return feed.items.map(item => {
                    const content = item.contentSnippet || item.content || ""
                    // Filter: Must be long enough to be a story
                    if (content.length < 500) return null

                    return {
                        title: item.title,
                        link: item.link,
                        content: content.substring(0, 1500), // Cap length for API
                        subreddit: url.split('/r/')[1].split('/')[0],
                        score: 'Viral Potential' // RSS doesn't give score, but "Top" implies high score
                    }
                }).filter(Boolean)
            } catch (e) {
                console.error(`Failed ${url}`, e)
                return []
            }
        })

        const results = await Promise.all(promises)
        const leads = results.flat()

        return NextResponse.json({ leads })

    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}
