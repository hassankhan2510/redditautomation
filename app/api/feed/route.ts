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

export const CATEGORIES: any = {
    'business': [
        { name: 'CNBC', url: 'https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=10001147', category: 'Business' },
        { name: 'Yahoo Finance', url: 'https://finance.yahoo.com/news/rssindex', category: 'Business' },
        { name: 'Entrepreneur', url: 'https://www.entrepreneur.com/latest.rss', category: 'Business' }
    ],
    'tech': [
        { name: 'TechCrunch', url: 'https://techcrunch.com/feed/', category: 'Tech' },
        { name: 'Wired', url: 'https://www.wired.com/feed/rss', category: 'Tech' },
        { name: 'Ars Technica', url: 'https://arstechnica.com/feed/', category: 'Tech' }
    ],
    'launch': [
        { name: 'Indie Hackers', url: 'https://feed.indiehackers.com', category: 'Launch' }
    ],
    'engineering': [
        { name: 'Netflix Tech', url: 'https://netflixtechblog.com/feed', category: 'Engineering' },
        { name: 'Uber Eng', url: 'https://eng.uber.com/feed/', category: 'Engineering' },
        { name: 'Pinterest Eng', url: 'https://medium.com/feed/@Pinterest_Engineering', category: 'Engineering' },
        { name: 'Stripe Eng', url: 'https://stripe.com/blog/feed.xml', category: 'Engineering' },
        { name: 'Discord Eng', url: 'https://discord.com/blog/rss.xml', category: 'Engineering' }
    ],
    'growth': [
        { name: 'Moz SEO', url: 'https://moz.com/blog/rss', category: 'Growth' },
        { name: 'Search Engine Land', url: 'https://searchengineland.com/feed', category: 'Growth' },
        { name: 'Backlinko', url: 'https://backlinko.com/feed', category: 'Growth' },
        { name: 'Seth Godin', url: 'https://seths.blog/feed/', category: 'Growth' }
    ],
    'crypto': [
        { name: 'CoinDesk', url: 'https://www.coindesk.com/arc/outboundfeeds/rss/', category: 'Crypto' },
        { name: 'CoinTelegraph', url: 'https://cointelegraph.com/rss', category: 'Crypto' },
        { name: 'a16z Crypto', url: 'https://a16zcrypto.com/feed/', category: 'Crypto' }
    ],
    'philosophy': [
        { name: 'Daily Nous', url: 'https://dailynous.com/feed/', category: 'Philosophy' },
        { name: 'Philosophy Now', url: 'https://philosophynow.org/feed', category: 'Philosophy' }
    ],
    'history': [
        { name: 'History Today', url: 'https://www.historytoday.com/feed/rss.xml', category: 'History' },
        { name: 'History Extra', url: 'https://www.historyextra.com/feed/', category: 'History' }
    ],
    'politics': [
        { name: 'BBC Politics', url: 'https://feeds.bbci.co.uk/news/politics/rss.xml', category: 'Politics' },
        { name: 'The Guardian', url: 'https://www.theguardian.com/politics/rss', category: 'Politics' },
        { name: 'Politico', url: 'https://www.politico.com/rss/politicopicks.xml', category: 'Politics' }
    ],
    'stocks': [
        { name: 'MarketWatch', url: 'https://www.marketwatch.com/rss/topstories', category: 'Stocks' },
        { name: 'Investing.com', url: 'https://www.investing.com/rss/news.rss', category: 'Stocks' }
    ]
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const region = searchParams.get('region')
    const sourceFilter = searchParams.get('source')

    let sourcesToFetch = REGIONS['global']

    // Filter Logic
    if (region === 'pk') sourcesToFetch = REGIONS['pk']
    else if (category === 'business') sourcesToFetch = CATEGORIES['business']
    else if (category === 'tech') sourcesToFetch = CATEGORIES['tech']
    else if (category === 'launch') sourcesToFetch = CATEGORIES['launch']
    else if (category === 'engineering') sourcesToFetch = CATEGORIES['engineering']
    else if (category === 'growth') sourcesToFetch = CATEGORIES['growth']
    else if (category === 'crypto') sourcesToFetch = CATEGORIES['crypto']
    else if (category === 'philosophy') sourcesToFetch = CATEGORIES['philosophy']
    else if (category === 'history') sourcesToFetch = CATEGORIES['history']
    else if (category === 'politics') sourcesToFetch = CATEGORIES['politics']
    else if (category === 'stocks') sourcesToFetch = CATEGORIES['stocks']

    // Source Specific Filter
    if (sourceFilter && sourceFilter !== 'all') {
        sourcesToFetch = sourcesToFetch.filter(s => s.name === sourceFilter)
    }

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
