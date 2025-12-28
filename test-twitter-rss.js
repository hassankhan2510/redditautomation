const Parser = require('rss-parser');
const parser = new Parser();

const INSTANCES = [
    'https://nitter.net',
    'https://nitter.poast.org',
    'https://nitter.privacydev.net',
    'https://nitter.lucabased.xyz'
];

const USER = 'elonmusk';

async function testFeeds() {
    console.log(`Testing feed fetch for user: ${USER}...`);

    for (const instance of INSTANCES) {
        const url = `${instance}/${USER}/rss`;
        try {
            console.log(`Trying: ${url}`);
            const feed = await parser.parseURL(url);
            console.log(`✅ SUCCESS: ${instance}`);
            console.log(`   Latest Tweet: ${feed.items[0].title}`);
            return; // Exit on first success
        } catch (e) {
            console.log(`❌ FAILED: ${instance} - ${e.message}`);
        }
    }
    console.log("All instances failed.");
}

testFeeds();
