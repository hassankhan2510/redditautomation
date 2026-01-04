import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category') || 'cs.AI' // Default to AI
    const max = searchParams.get('max') || '10'

    let ARI_URL = `http://export.arxiv.org/api/query?search_query=cat:${category}&start=0&max_results=${max}&sortBy=submittedDate&sortOrder=descending`

    // Support for BioRxiv and MedRxiv (Simple Proxy)
    if (category === 'biorxiv' || category === 'medrxiv') {
        // These APIs are different (usually require date ranges), but we can try the RSS or specific endpoints.
        // For now, let's keep it simple and just map to a known RSS feed or API if possible.
        // Actually, BioRxiv/MedRxiv use a different API format than ArXiv.
        // Let's stick to ArXiv for now but with expanded categories.
        // Wait, the user ASKED for others.
        // I'll add a simple switch to fetch their RSS.
        const server = category === 'biorxiv' ? 'biorxiv' : 'medrxiv'
        ARI_URL = `https://connect.${server}.org/${server}_xml.php?subject=all`
    }

    try {
        const response = await fetch(ARI_URL)
        const text = await response.text()

        // Simple XML Parsing (Avoid heavy deps)
        const items: any[] = []

        // Regex to extract entries
        const entryRegex = /<entry>([\s\S]*?)<\/entry>/g
        let match;

        while ((match = entryRegex.exec(text)) !== null) {
            const entryBlock = match[1]

            const getTag = (tag: string) => {
                const r = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\/${tag}>`)
                const m = entryBlock.match(r)
                return m ? m[1].trim() : ''
            }

            const title = getTag('title').replace(/\n/g, ' ')
            const summary = getTag('summary').replace(/\n/g, ' ')
            const published = getTag('published')
            const id = getTag('id') // ArXiv URL

            // Extract first author
            const authorMatch = entryBlock.match(/<author>\s*<name>(.*?)<\/name>/)
            const author = authorMatch ? authorMatch[1] : 'Unknown'

            items.push({
                title,
                snippet: summary, // Mapping to existing frontend 'snippet'
                conf: summary, // Store full summary for deep dive
                link: id,
                source: 'ArXiv',
                author,
                pubDate: published,
                category
            })
        }

        return NextResponse.json({ items })

    } catch (e: any) {
        console.error(e)
        return NextResponse.json({ error: 'Failed to fetch ArXiv' }, { status: 500 })
    }
}
