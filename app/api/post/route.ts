import { NextResponse } from 'next/server'
import { publishDraft } from '@/lib/poster'

export async function POST(request: Request) {
    try {
        const { draftId } = await request.json()
        const result = await publishDraft(draftId)
        return NextResponse.json(result)
    } catch (e: any) {
        console.error(e)
        // Differentiate errors? simple for now
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}
