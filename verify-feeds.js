const Parser = require('rss-parser');
const parser = new Parser({
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
});

const CANDIDATES = {
    business: [
        'https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=10001147', // CNBC Business
        'https://finance.yahoo.com/news/rssindex', // Yahoo Finance
        'https://www.entrepreneur.com/latest.rss', // Entrepreneur
        'https://www.businessrecorder.com/feeds/feed.php?cat=business', // PK Business
        'https://profit.pakistantoday.com.pk/feed/' // Profit PK
    ],
    tech: [
        'https://techcrunch.com/feed/',
        'https://arstechnica.com/feed/',
        'https://www.wired.com/feed/rss'
    ],
    politics: [
        'http://rss.cnn.com/rss/cnn_allpolitics.rss',
        'https://www.politico.com/rss/politicopicks.xml',
        'https://feeds.bbci.co.uk/news/politics/rss.xml'
    ],
    stock: [
        'https://www.investing.com/rss/news.rss',
        'https://www.marketwatch.com/rss/topstories'
    ]
};

async function verify() {
    console.log("Verifying Feeds...\n");

    for (const [category, urls] of Object.entries(CANDIDATES)) {
        console.log(`--- ${category.toUpperCase()} ---`);
        for (const url of urls) {
            try {
                process.stdout.write(`Testing ${url}... `);
                const feed = await parser.parseURL(url);
                console.log(`✅ OK (${feed.items.length} items)`);
                // console.log(`   Sample: ${feed.items[0].title}`);
            } catch (e) {
                console.log(`❌ FAIL: ${e.message}`);
            }
        }
        console.log("");
    }
}

verify();
