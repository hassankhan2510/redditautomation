const Parser = require('rss-parser');
const parser = new Parser({
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
});


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

const CATEGORIES = {
    'business': [
        { name: 'CNBC', url: 'https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=10001147', category: 'Business' },
        { name: 'Yahoo Finance', url: 'https://finance.yahoo.com/news/rssindex', category: 'Business' },
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
        { name: 'Stripe Eng', url: 'https://stripe.com/blog/feed.rss', category: 'Engineering' },
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
        { name: 'a16z Crypto', url: 'https://web3.a16z.com/feed', category: 'Crypto' }, // Fixed URL
        { name: 'Decrypt', url: 'https://decrypt.co/feed', category: 'Crypto' },
        { name: 'The Block', url: 'https://www.theblockcrypto.com/feed', category: 'Crypto' } // Fixed URL
    ],
    'philosophy': [
        { name: 'Daily Nous', url: 'https://dailynous.com/feed/', category: 'Philosophy' }, // HTTPS
        { name: 'Philosophy Now', url: 'https://philosophynow.org/rss', category: 'Philosophy' },
        { name: 'Aeon', url: 'https://aeon.co/feed.rss', category: 'Philosophy' },
        { name: 'Stanford Encyclopedia', url: 'https://plato.stanford.edu/rss/sep.xml', category: 'Philosophy' }
    ],
    'history': [
        { name: 'History Today', url: 'https://www.historytoday.com/feed/rss.xml', category: 'History' },
        { name: 'History Extra', url: 'https://www.historyextra.com/feed/', category: 'History' },
        { name: 'Smithsonian', url: 'https://www.smithsonianmag.com/rss/history/', category: 'History' },
        { name: 'History Net', url: 'https://historynet.com/topic/military-history/feed/', category: 'History' }
    ],
    'politics': [
        { name: 'BBC Politics', url: 'https://feeds.bbci.co.uk/news/politics/rss.xml', category: 'Politics' },
        { name: 'The Guardian', url: 'https://www.theguardian.com/politics/rss', category: 'Politics' },
        { name: 'Politico', url: 'https://rss.politico.com/politics.xml', category: 'Politics' },
        { name: 'FiveThirtyEight', url: 'https://fivethirtyeight.com/politics/feed/', category: 'Politics' }
    ],
    'stocks': [
        { name: 'MarketWatch', url: 'https://www.marketwatch.com/rss/topstories', category: 'Stocks' },
        { name: 'Investing.com', url: 'https://www.investing.com/rss/news.rss', category: 'Stocks' },
        { name: 'Seeking Alpha', url: 'https://seekingalpha.com/feed.xml', category: 'Stocks' },
        { name: 'Motley Fool', url: 'https://www.fool.com/about/headlines/rss_headlines.xml', category: 'Stocks' }
    ]
}

async function verify() {
    console.log("Verifying Feeds...\n");

    const ALL_SOURCES = { ...REGIONS, ...CATEGORIES };

    for (const [category, sources] of Object.entries(ALL_SOURCES)) {
        console.log(`--- ${category.toUpperCase()} ---`);
        for (const source of sources) {
            try {
                process.stdout.write(`Testing [${source.name}] ${source.url}... `);
                const feed = await parser.parseURL(source.url);
                console.log(`✅ OK (${feed.items.length} items)`);
            } catch (e) {
                console.log(`❌ FAIL: ${e.message}`);
                // Try to print more info if available
                if (e.code) console.log(`   Code: ${e.code}`);
            }
        }
        console.log("");
    }
}

verify();
