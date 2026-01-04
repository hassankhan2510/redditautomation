import { NextResponse } from 'next/server'
import { supabase } from '@/lib/db'

export async function GET() {
    const { data, error } = await supabase
        .from('saved_research')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ items: data })
}

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { title, link, snippet, source, category, pubDate } = body

        if (!title || !link) {
            return NextResponse.json({ error: 'Title and Link required' }, { status: 400 })
        }

        const { data, error } = await supabase
            .from('saved_research')
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
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ success: true, item: data })
    } catch (e) {
        return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }
}

export async function DELETE(request: Request) {
    try {
        const { id } = await request.json()
        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })

        const { error } = await supabase
            .from('saved_research')
            .delete()
            .eq('id', id)

        if (error) return NextResponse.json({ error: error.message }, { status: 500 })

        return NextResponse.json({ success: true })
    } catch (e) {
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}
