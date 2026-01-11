import { NextResponse } from 'next/server'
import Parser from 'rss-parser'

const parser = new Parser({
    timeout: 10000,
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
})

// Search endpoints for different sources
const SEARCH_SOURCES = {
    // Google News RSS search
    news: (query: string) => `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-US&gl=US&ceid=US:en`,

    // Reddit search
    reddit: (query: string) => `https://www.reddit.com/search.rss?q=${encodeURIComponent(query)}&sort=relevance&t=month`,

    // ArXiv search
    arxiv: (query: string) => `https://export.arxiv.org/api/query?search_query=all:${encodeURIComponent(query)}&start=0&max_results=15&sortBy=relevance`,

    // Hacker News (Algolia)
    hn: (query: string) => `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(query)}&tags=story&hitsPerPage=15`,
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const source = searchParams.get('source') || 'all'

    if (!query || query.trim().length < 2) {
        return NextResponse.json({ error: 'Query must be at least 2 characters' }, { status: 400 })
    }

    const results: any[] = []
    const errors: string[] = []

    try {
        // Fetch from multiple sources in parallel
        const promises: Promise<void>[] = []

        // Google News
        if (source === 'all' || source === 'news') {
            promises.push(
                (async () => {
                    try {
                        const feed = await parser.parseURL(SEARCH_SOURCES.news(query))
                        feed.items.slice(0, 10).forEach(item => {
                            results.push({
                                title: item.title || 'Untitled',
                                link: item.link || '',
                                snippet: item.contentSnippet?.substring(0, 200) || item.content?.substring(0, 200) || '',
                                source: 'Google News',
                                category: 'news',
                                pubDate: item.pubDate || new Date().toISOString()
                            })
                        })
                    } catch (e) {
                        errors.push('Google News search failed')
                    }
                })()
            )
        }

        // Reddit
        if (source === 'all' || source === 'reddit') {
            promises.push(
                (async () => {
                    try {
                        const feed = await parser.parseURL(SEARCH_SOURCES.reddit(query))
                        feed.items.slice(0, 10).forEach(item => {
                            results.push({
                                title: item.title || 'Untitled',
                                link: item.link || '',
                                snippet: item.contentSnippet?.substring(0, 200) || '',
                                source: 'Reddit',
                                category: 'discussion',
                                pubDate: item.pubDate || new Date().toISOString()
                            })
                        })
                    } catch (e) {
                        errors.push('Reddit search failed')
                    }
                })()
            )
        }

        // Hacker News (JSON API)
        if (source === 'all' || source === 'hn') {
            promises.push(
                (async () => {
                    try {
                        const res = await fetch(SEARCH_SOURCES.hn(query))
                        const data = await res.json()
                        data.hits?.slice(0, 10).forEach((hit: any) => {
                            results.push({
                                title: hit.title || 'Untitled',
                                link: hit.url || `https://news.ycombinator.com/item?id=${hit.objectID}`,
                                snippet: hit.story_text?.substring(0, 200) || `${hit.points} points • ${hit.num_comments} comments`,
                                source: 'Hacker News',
                                category: 'tech',
                                pubDate: hit.created_at || new Date().toISOString()
                            })
                        })
                    } catch (e) {
                        errors.push('Hacker News search failed')
                    }
                })()
            )
        }

        // ArXiv (XML API)
        if (source === 'all' || source === 'arxiv') {
            promises.push(
                (async () => {
                    try {
                        const res = await fetch(SEARCH_SOURCES.arxiv(query))
                        const xml = await res.text()

                        // Simple XML parsing for ArXiv
                        const entries = xml.match(/<entry>[\s\S]*?<\/entry>/g) || []
                        entries.slice(0, 10).forEach(entry => {
                            const title = entry.match(/<title>([\s\S]*?)<\/title>/)?.[1]?.replace(/\n/g, ' ').trim()
                            const link = entry.match(/<id>([\s\S]*?)<\/id>/)?.[1]
                            const summary = entry.match(/<summary>([\s\S]*?)<\/summary>/)?.[1]?.replace(/\n/g, ' ').trim()
                            const published = entry.match(/<published>([\s\S]*?)<\/published>/)?.[1]

                            if (title && link) {
                                results.push({
                                    title,
                                    link: link.replace('abs', 'pdf'),
                                    snippet: summary?.substring(0, 200) || '',
                                    source: 'ArXiv',
                                    category: 'science',
                                    pubDate: published || new Date().toISOString()
                                })
                            }
                        })
                    } catch (e) {
                        errors.push('ArXiv search failed')
                    }
                })()
            )
        }

        // Wait for all searches
        await Promise.all(promises)

        // Sort by date (newest first)
        results.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime())

        return NextResponse.json({
            items: results,
            query,
            source,
            count: results.length,
            errors: errors.length > 0 ? errors : undefined
        })

    } catch (e: any) {
        console.error('Search error:', e)
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}
