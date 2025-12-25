import { NextResponse } from 'next/server'
import { supabase } from '@/lib/db'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const ideaId = searchParams.get('ideaId')

    let query = supabase
        .from('post_drafts')
        .select(`
        *,
        subreddits ( name ),
        post_ideas ( title )
    `)
        .order('created_at', { ascending: false })

    if (ideaId) {
        query = query.eq('post_idea_id', ideaId)
    }

    const { data, error } = await query

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
}

export async function PATCH(request: Request) {
    try {
        const { id, status, scheduled_for } = await request.json()

        const updates: any = {}
        if (status) {
            if (!['approved', 'rejected', 'draft', 'posted'].includes(status)) {
                return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
            }
            updates.status = status
        }
        if (scheduled_for !== undefined) {
            updates.scheduled_for = scheduled_for
        }

        const { data, error } = await supabase
            .from('post_drafts')
            .update(updates)
            .eq('id', id)
            .select()
            .single()

        if (error) throw error

        return NextResponse.json(data)
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}
