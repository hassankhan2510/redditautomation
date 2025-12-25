import { supabase } from '@/lib/db'
import { getRedditClient } from '@/lib/reddit'

export async function publishDraft(draftId: string) {
    // 1. Fetch Draft and Subreddit context
    const { data: draft, error: fetchError } = await supabase
        .from('post_drafts')
        .select(`*, subreddits(*)`)
        .eq('id', draftId)
        .single()

    if (fetchError || !draft) throw new Error('Draft not found')

    // Status check: Allow 'approved' OR 'draft' if we are confident, but strictly 'approved' is safer.
    // If coming from cron, we check before calling, but good to double check.
    if (draft.status !== 'approved') throw new Error('Draft not approved')

    // 2. Safety Checks (Rate Limits)
    // Check Global Limit: 1 post per day
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const { count: globalCount } = await supabase
        .from('post_history')
        .select('*', { count: 'exact', head: true })
        .gte('posted_at', oneDayAgo)

    if (globalCount && globalCount >= 1) {
        throw new Error('Global limit reached: 1 post per day')
    }

    // Check Subreddit Limit: 1 post per 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    const { count: subCount } = await supabase
        .from('post_history')
        .select('*', { count: 'exact', head: true })
        .eq('subreddit', draft.subreddits.name)
        .gte('posted_at', sevenDaysAgo)

    if (subCount && subCount >= 1) {
        throw new Error(`Subreddit limit reached for ${draft.subreddits.name}: 1 post per week`)
    }

    // 3. Post to Reddit
    const r = getRedditClient()

    // Parse title and body
    const lines = draft.content.split('\n')
    let title = lines[0].replace(/^Title:?\s*/i, '').trim()
    let selftext = lines.slice(1).join('\n').replace(/^Body:?\s*/i, '').trim()

    // Clean up markdown quotes usually wrapped around title
    title = title.replace(/^"|"$/g, '')

    // @ts-ignore
    const submission = (await r.getSubreddit(draft.subreddits.name).submitSelfpost({
        title,
        text: selftext,
        subredditName: draft.subreddits.name
    })) as any

    // 4. Update History and Draft Status
    await supabase.from('post_history').insert({
        subreddit: draft.subreddits.name,
        reddit_post_id: submission.id,
        posted_at: new Date().toISOString()
    })

    await supabase.from('post_drafts').update({ status: 'posted' }).eq('id', draftId)

    return { success: true, url: submission.url }
}
