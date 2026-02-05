import { NextResponse } from 'next/server'
import { getOrGenerateExplanation } from '@/lib/research'

export async function POST(request: Request) {
    try {
        const { url, category, title } = await request.json()

        if (!url) {
            return NextResponse.json({ error: "URL is required" }, { status: 400 })
        }

        const result = await getOrGenerateExplanation(url, category, title)

        return NextResponse.json(result)

    } catch (e: any) {
        console.error("❌ Explain API Error:", e)
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}
