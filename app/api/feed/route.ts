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

const CATEGORIES = {
    'business': [
        { name: 'CNBC', url: 'https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=10001147', category: 'Business' },
        { name: 'Yahoo Finance', url: 'https://finance.yahoo.com/news/rssindex', category: 'Business' },
        { name: 'Entrepreneur', url: 'https://www.entrepreneur.com/latest.rss', category: 'Business' },
        { name: 'Forbes', url: 'https://www.forbes.com/feeds/pop/feed.xml', category: 'Business' },
        { name: 'Business Insider', url: 'https://feeds.businessinsider.com/custom/type/top-stories', category: 'Biz' },
        { name: 'HBR', url: 'https://feeds.hbr.org/harvardbusinessreview', category: 'Mgmt' }
    ],
    'tech': [
        { name: 'TechCrunch', url: 'https://techcrunch.com/feed/', category: 'Tech' },
        { name: 'Wired', url: 'https://www.wired.com/feed/rss', category: 'Tech' },
        { name: 'Ars Technica', url: 'https://arstechnica.com/feed/', category: 'Tech' },
        { name: 'The Verge', url: 'https://www.theverge.com/rss/index.xml', category: 'Tech' },
        { name: 'Engadget', url: 'https://www.engadget.com/rss.xml', category: 'Gadgets' },
        { name: 'Hackaday', url: 'https://hackaday.com/blog/feed/', category: 'Maker' }
    ],
    'launch': [
        { name: 'Product Hunt', url: 'https://www.producthunt.com/feed', category: 'Launch' },
        { name: 'Indie Hackers', url: 'https://feed.indiehackers.com', category: 'Launch' },
        { name: 'BetaList', url: 'https://betalist.com/feed', category: 'Startup' },
        { name: 'Y Combinator News', url: 'https://news.ycombinator.com/rss', category: 'YC' }
    ],
    'video': [
        { name: 'Y Combinator', url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCcefcZRL2oaA_uBNeo5UOWg', category: 'Video' },
        { name: 'Slidebean', url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UC4QZ_LsYcvcqPBeAf3Uw91Q', category: 'Video' },
        { name: 'Fireship', url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCsBjURrPoezykLs9EqgamOA', category: 'Video' },
        { name: 'Matthew Berman', url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UC-bFzsWciODiXeNwlMhhPTA', category: 'Video' },
        { name: 'ColdFusion', url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UC4QZ_LsYcvcqPBeAf3Uw91Q', category: 'Docu' },
        { name: 'Veritasium', url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCHnyfMqiRRG1u-2MsSQLbXA', category: 'Science' }
    ],
    'newsletter': [
        { name: 'Lennys Newsletter', url: 'https://www.lennysnewsletter.com/feed', category: 'Growth' },
        { name: 'The Pragmatic Engineer', url: 'https://blog.pragmaticengineer.com/rss/', category: 'Eng' },
        { name: 'TheSequence', url: 'https://thesequence.substack.com/feed', category: 'AI' },
        { name: 'ByteByteGo', url: 'https://blog.bytebytego.com/feed', category: 'Arch' },
        { name: 'Stratechery', url: 'https://stratechery.com/feed/', category: 'Strat' },
        { name: 'Benedict Evans', url: 'https://ben-evans.com/benedictevans?format=rss', category: 'Trends' }
    ],
    'viral': [
        { name: 'r/SaaS (Top)', url: 'https://www.reddit.com/r/SaaS/top/.rss?t=day', category: 'SaaS' },
        { name: 'r/Entrepreneur (Top)', url: 'https://www.reddit.com/r/Entrepreneur/top/.rss?t=day', category: 'Biz' },
        { name: 'r/Singularity (Top)', url: 'https://www.reddit.com/r/Singularity/top/.rss?t=day', category: 'AI' },
        { name: 'r/InternetIsBeautiful', url: 'https://www.reddit.com/r/InternetIsBeautiful/top/.rss?t=day', category: 'Cool' },
        { name: 'r/Futurology', url: 'https://www.reddit.com/r/Futurology/top/.rss?t=day', category: 'Future' },
        { name: 'r/DataIsBeautiful', url: 'https://www.reddit.com/r/dataisbeautiful/top/.rss?t=day', category: 'Data' }
    ],
    'philosophy': [
        { name: 'Daily Nous', url: 'https://dailynous.com/feed/', category: 'Phil' },
        { name: 'Philosophy Now', url: 'https://philosophynow.org/feed', category: 'Phil' },
        { name: 'Aeon Essays', url: 'https://aeon.co/feed.rss', category: 'Deep' },
        { name: 'Brain Pickings', url: 'https://www.themarginalian.org/feed/', category: 'Soul' },
        { name: 'Nautilus', url: 'https://nautil.us/feed/', category: 'SciPhil' }
    ],
    'blog': [
        { name: 'Paul Graham', url: 'http://www.aaronsw.com/2002/feeds/pgessays.rss', category: 'PG' },
        { name: 'Sam Altman', url: 'https://blog.samaltman.com/rss', category: 'Sam' },
        { name: 'Seth Godin', url: 'https://seths.blog/feed/', category: 'Mktg' },
        { name: 'Vitalik Buterin', url: 'https://vitalik.ca/feed.xml', category: 'Crypto' },
        { name: 'Naval Ravikant', url: 'https://nav.al/feed', category: 'Wisdom' }
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
    else if (category === 'video') sourcesToFetch = CATEGORIES['video']
    else if (category === 'newsletter') sourcesToFetch = CATEGORIES['newsletter']
    else if (category === 'viral') sourcesToFetch = CATEGORIES['viral']
    else if (category === 'philosophy') sourcesToFetch = CATEGORIES['philosophy']
    else if (category === 'blog') sourcesToFetch = CATEGORIES['blog']

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
