import { NextResponse } from 'next/server'
import { supabase } from '@/lib/db'

// GET - Fetch all items in read later queue
export async function GET() {
    try {
        const { data, error } = await supabase
            .from('read_later')
            .select('*')
            .order('added_at', { ascending: false })

        if (error) {
            console.error("Queue fetch error:", error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ items: data || [] })
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}

// POST - Add item to read later queue
export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { title, link, snippet, source, category, pubDate } = body

        if (!title || !link) {
            return NextResponse.json({ error: 'Title and Link required' }, { status: 400 })
        }

        // Check if already in queue (avoid duplicates)
        const { data: existing } = await supabase
            .from('read_later')
            .select('id')
            .eq('link', link)
            .single()

        if (existing) {
            return NextResponse.json({
                success: true,
                message: 'Already in queue',
                item: existing
            })
        }

        const { data, error } = await supabase
            .from('read_later')
            .insert([{
                title,
                link,
                snippet,
                source,
                category,
                published_at: pubDate || new Date().toISOString()
            }])
            .select()
            .single()

        if (error) {
            console.error("Queue insert error:", error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ success: true, item: data })
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 400 })
    }
}

// DELETE - Remove item from queue
export async function DELETE(request: Request) {
    try {
        const { id, link } = await request.json()

        if (!id && !link) {
            return NextResponse.json({ error: 'ID or Link required' }, { status: 400 })
        }

        let query = supabase.from('read_later').delete()

        if (id) {
            query = query.eq('id', id)
        } else {
            query = query.eq('link', link)
        }

        const { error } = await query

        if (error) {
            console.error("Queue delete error:", error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ success: true })
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}
