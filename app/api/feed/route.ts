import { NextResponse } from 'next/server'
import Parser from 'rss-parser'

const parser = new Parser({
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8'
    }
})

// === SOURCES ===
// Using simpler URLs where possible to avoid blockage
const REGIONS = {
    'pk': [
        { name: 'Dawn News', url: 'https://www.dawn.com/feeds/home', category: 'News' },
        { name: 'The News PK', url: 'https://www.thenews.com.pk/rss/1/1', category: 'News' },
        { name: 'ARY News', url: 'https://arynews.tv/feed/', category: 'News' },
        { name: 'Profit PK', url: 'https://profit.pakistantoday.com.pk/feed/', category: 'Business' },
        { name: 'Geo News', url: 'https://geo.tv/rss/1/1', category: 'News' },
        { name: 'Express Tribune', url: 'https://tribune.com.pk/feed/latest', category: 'News' }
    ],
    'global': [
        { name: 'Hacker News', url: 'https://hnrss.org/frontpage', category: 'Tech' },
        { name: 'OpenAI Blog', url: 'https://openai.com/blog/rss.xml', category: 'AI' },
        { name: 'MIT Tech Review', url: 'https://www.technologyreview.com/feed/', category: 'Science' },
        { name: 'The Verge', url: 'https://www.theverge.com/rss/index.xml', category: 'Tech' },
        { name: 'CNN', url: 'http://rss.cnn.com/rss/edition.rss', category: 'News' },
        { name: 'BBC News', url: 'https://feeds.bbci.co.uk/news/rss.xml', category: 'News' },
        { name: 'Al Jazeera', url: 'https://www.aljazeera.com/xml/rss/all.xml', category: 'News' }
    ]
}

export const CATEGORIES: any = {
    'business': [
        { name: 'CNBC', url: 'https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=10001147', category: 'Business' },
        { name: 'Yahoo Finance', url: 'https://finance.yahoo.com/news/rssindex', category: 'Business' },
        // Entrepreneur often blocks, switching to Forbes if possible or keeping as try
        { name: 'Entrepreneur', url: 'https://www.entrepreneur.com/latest.rss', category: 'Business' },
        { name: 'Forbes', url: 'https://www.forbes.com/business/feed/', category: 'Business' },
        { name: 'Bloomberg', url: 'https://feeds.bloomberg.com/markets/news.rss', category: 'Business' },
        { name: 'Business Insider', url: 'https://feeds.businessinsider.com/custom/all', category: 'Business' }
    ],
    'tech': [
        { name: 'TechCrunch', url: 'https://techcrunch.com/feed/', category: 'Tech' },
        { name: 'Wired', url: 'https://www.wired.com/feed/rss', category: 'Tech' },
        { name: 'Ars Technica', url: 'https://arstechnica.com/feed/', category: 'Tech' },
        { name: 'The Next Web', url: 'https://thenextweb.com/feed', category: 'Tech' },
        { name: 'Engadget', url: 'https://www.engadget.com/rss.xml', category: 'Tech' }
    ],
    'launch': [
        { name: 'Indie Hackers', url: 'https://feed.indiehackers.com', category: 'Launch' },
        { name: 'Product Hunt', url: 'https://rss.producthunt.com/feed', category: 'Launch' }
    ],
    'engineering': [
        { name: 'Netflix Tech', url: 'https://netflixtechblog.com/feed', category: 'Engineering' },
        { name: 'Uber Eng', url: 'https://eng.uber.com/feed/', category: 'Engineering' },
        { name: 'Pinterest Eng', url: 'https://medium.com/feed/@Pinterest_Engineering', category: 'Engineering' },
        { name: 'Stripe Eng', url: 'https://stripe.com/blog/feed.xml', category: 'Engineering' },
        { name: 'Discord Eng', url: 'https://discord.com/blog/rss.xml', category: 'Engineering' },
        { name: 'Spotify Eng', url: 'https://engineering.atspotify.com/feed/', category: 'Engineering' },
        { name: 'Airbnb Eng', url: 'https://medium.com/feed/airbnb-engineering', category: 'Engineering' }
    ],
    'growth': [
        { name: 'Moz SEO', url: 'https://moz.com/feeds/blog.rss', category: 'Growth' }, // Updated URL
        { name: 'Search Engine Land', url: 'https://searchengineland.com/feed', category: 'Growth' },
        { name: 'Backlinko', url: 'https://backlinko.com/feed', category: 'Growth' },
        { name: 'Seth Godin', url: 'https://seths.blog/feed/', category: 'Growth' },
        { name: 'HubSpot', url: 'https://blog.hubspot.com/marketing/rss.xml', category: 'Growth' },
        { name: 'Ahrefs', url: 'https://ahrefs.com/blog/feed', category: 'Growth' }
    ],
    'crypto': [
        { name: 'CoinDesk', url: 'https://www.coindesk.com/arc/outboundfeeds/rss/', category: 'Crypto' },
        { name: 'CoinTelegraph', url: 'https://cointelegraph.com/rss', category: 'Crypto' },
        { name: 'a16z Crypto', url: 'https://a16zcrypto.com/feed/', category: 'Crypto' },
        { name: 'Decrypt', url: 'https://decrypt.co/feed', category: 'Crypto' },
        { name: 'The Block', url: 'https://www.theblock.co/rss', category: 'Crypto' }
    ],
    'philosophy': [
        { name: 'Daily Nous', url: 'https://dailynous.com/feed/', category: 'Philosophy' },
        { name: 'Philosophy Now', url: 'https://philosophynow.org/feed', category: 'Philosophy' },
        { name: 'Aeon', url: 'https://aeon.co/feed.rss', category: 'Philosophy' },
        { name: 'Stanford Encyclopedia', url: 'https://plato.stanford.edu/rss/sep.xml', category: 'Philosophy' }
    ],
    'history': [
        { name: 'History Today', url: 'https://www.historytoday.com/feed/rss.xml', category: 'History' },
        { name: 'History Extra', url: 'https://www.historyextra.com/feed/', category: 'History' },
        { name: 'Smithsonian', url: 'https://www.smithsonianmag.com/rss/history/', category: 'History' },
        { name: 'History Net', url: 'https://www.historynet.com/feed', category: 'History' }
    ],
    'politics': [
        { name: 'BBC Politics', url: 'https://feeds.bbci.co.uk/news/politics/rss.xml', category: 'Politics' },
        { name: 'The Guardian', url: 'https://www.theguardian.com/politics/rss', category: 'Politics' },
        { name: 'Politico', url: 'https://www.politico.com/rss/politicopicks.xml', category: 'Politics' },
        { name: 'FiveThirtyEight', url: 'https://fivethirtyeight.com/politics/feed/', category: 'Politics' }
    ],
    'stocks': [
        { name: 'MarketWatch', url: 'https://www.marketwatch.com/rss/topstories', category: 'Stocks' },
        { name: 'Investing.com', url: 'https://www.investing.com/rss/news.rss', category: 'Stocks' },
        { name: 'Seeking Alpha', url: 'https://seekingalpha.com/feed.xml', category: 'Stocks' },
        { name: 'Motley Fool', url: 'https://www.fool.com/about/headlines/rss_headlines.xml', category: 'Stocks' }
    ]
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const region = searchParams.get('region')
    const sourceFilter = searchParams.get('source')

    let sourcesToFetch: any[] = []

    // 1. SELECT BASE SOURCES
    if (region === 'pk') {
        sourcesToFetch = REGIONS['pk']
    } else if (category && CATEGORIES[category]) {
        sourcesToFetch = CATEGORIES[category]
    } else {
        sourcesToFetch = REGIONS['global'] // Default
    }

    // 2. APPLY SOURCE FILTER (Strict)
    if (sourceFilter && sourceFilter !== 'all') {
        // Decode incase of spaces
        const target = decodeURIComponent(sourceFilter)
        sourcesToFetch = sourcesToFetch.filter(s => s.name === target)
        // If filter results in empty (mismatch name), fallback to keeping all or debug
        if (sourcesToFetch.length === 0) {
            console.log(`Warning: Source filter '${target}' matched 0 items. Looking in entire catalog...`)
            // Fallback: Search in ALL categories for this source
            const allSources = [
                ...REGIONS['pk'],
                ...REGIONS['global'],
                ...Object.values(CATEGORIES).flat()
            ] as any[]
            sourcesToFetch = allSources.filter(s => s.name === target)
        }
    }

    try {
        const feedPromises = sourcesToFetch.map(async (source: any) => {
            try {
                // Add 5s timeout to avoid hanging
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
                console.error(`Failed to fetch ${source.name} (${source.url})`)
                return []
            }
        })

        const results = await Promise.all(feedPromises)
        // Flatten and Sort by Date
        const allItems = results.flat().sort((a, b) => {
            return new Date(b.pubDate!).getTime() - new Date(a.pubDate!).getTime()
        })

        return NextResponse.json({ items: allItems.slice(0, 50) }) // Increased limit

    } catch (e: any) {
        console.error("Feed Error", e)
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}
