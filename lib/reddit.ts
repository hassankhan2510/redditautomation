import Snoowrap from 'snoowrap'

const clientConfig = {
    userAgent: process.env.REDDIT_USER_AGENT || 'RedditPoster/1.0',
    clientId: process.env.REDDIT_CLIENT_ID,
    clientSecret: process.env.REDDIT_CLIENT_SECRET,
    username: process.env.REDDIT_USERNAME,
    password: process.env.REDDIT_PASSWORD,
}

// Lazy initialization if env vars are present
export const getRedditClient = () => {
    if (!clientConfig.clientId || !clientConfig.clientSecret) {
        throw new Error('Missing Reddit API credentials')
    }
    return new Snoowrap(clientConfig as any)
}

export async function checkFlair(subredditName: string) {
    // Utility to get flairs if needed
    const r = getRedditClient()
    return await r.getSubreddit(subredditName).link_flair_enabled
}
