const Parser = require('rss-parser');
const parser = new Parser();

const PK_FEEDS = [
    'https://www.dawn.com/feeds/home',
    'https://www.geo.tv/rss/1',
    'https://tribune.com.pk/feed',
    'https://www.thenews.com.pk/rss/1/1'
];

(async () => {
    console.log("Testing RSS Feeds...");
    for (const url of PK_FEEDS) {
        try {
            console.log(`\nFetching: ${url}`);
            const feed = await parser.parseURL(url);
            console.log(`✅ Success! Title: ${feed.title}`);
            console.log(`   Found ${feed.items.length} items.`);
            console.log(`   First item: ${feed.items[0]?.title}`);
        } catch (err) {
            console.error(`❌ Failed: ${url}`);
            console.error(`   Error: ${err.message}`);
        }
    }
})();
