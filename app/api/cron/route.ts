import { NextResponse } from 'next/server'
import { supabase } from '@/lib/db'
import { publishDraft } from '@/lib/poster'

export const dynamic = 'force-dynamic' // Ensure it's not cached

export async function GET() {
    try {
        // 1. Find approved drafts scheduled for NOW or past
        // status = approved AND scheduled_for <= NOW
        const now = new Date().toISOString()

        const { data: drafts, error } = await supabase
            .from('post_drafts')
            .select('id, scheduled_for')
            .eq('status', 'approved')
            .lte('scheduled_for', now)
            .not('scheduled_for', 'is', null) // Ensure it is scheduled
            .limit(5) // Process max 5 at a time to avoid timeouts

        if (error) throw error

        if (!drafts || drafts.length === 0) {
            return NextResponse.json({ message: 'No scheduled posts due.' })
        }

        const results = []

        // 2. Try to publish each
        for (const draft of drafts) {
            try {
                const res = await publishDraft(draft.id)
                results.push({ id: draft.id, status: 'posted', url: res.url })
            } catch (e: any) {
                console.error(`Failed to autopost ${draft.id}:`, e)
                results.push({ id: draft.id, status: 'failed', error: e.message })
            }
        }

        return NextResponse.json({ success: true, attempts: results })

    } catch (e: any) {
        console.error(e)
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}
