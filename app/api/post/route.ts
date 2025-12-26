import { NextResponse } from 'next/server'
import { supabase } from '@/lib/db'

export async function POST(request: Request) {
    try {
        const { draftId } = await request.json()

        // 1. Fetch Draft and Subreddit context
        const { data: draft, error: fetchError } = await supabase
            .from('post_drafts')
            .select(`*, subreddits(*)`)
            .eq('id', draftId)
            .single()

        if (fetchError || !draft) throw new Error('Draft not found')

        // 2. Update Status to 'posted'
        await supabase.from('post_drafts').update({ status: 'posted' }).eq('id', draft.id)

        // 3. Log to History (Manual Entry)
        // We don't have a real Reddit ID, so we use 'manual' or a placeholder
        await supabase.from('post_history').insert({
            subreddit: draft.subreddits.name,
            reddit_post_id: 'manual-' + Date.now(),
            posted_at: new Date().toISOString()
        })

        return NextResponse.json({ success: true })

    } catch (e: any) {
        console.error(e)
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}
