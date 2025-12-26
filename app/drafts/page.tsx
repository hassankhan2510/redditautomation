"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { ExternalLink, Check, Copy } from "lucide-react"

function DraftsContent() {
    const searchParams = useSearchParams()
    const ideaId = searchParams.get('ideaId')

    const [drafts, setDrafts] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    const fetchDrafts = async () => {
        setLoading(true)
        try {
            const url = ideaId ? `/api/drafts?ideaId=${ideaId}` : '/api/drafts'
            const res = await fetch(url)
            if (res.ok) {
                const data = await res.json()
                setDrafts(data)
            }
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchDrafts()
    }, [ideaId])

    const updateStatus = async (id: string, status: string) => {
        // Optimistic update
        setDrafts(drafts.map(d => d.id === id ? { ...d, status } : d))

        // For 'posted', call the specialized route that also logs history
        if (status === 'posted') {
            await fetch('/api/post', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ draftId: id })
            })
        } else {
            // Standard status update
            await fetch('/api/drafts', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, status })
            })
        }
        fetchDrafts()
    }

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text)
        alert("Copied to clipboard!")
    }

    const getSubmitUrl = (subreddit: string, title: string, body: string) => {
        const baseUrl = `https://www.reddit.com/r/${subreddit}/submit`
        const params = new URLSearchParams({
            title: title || "",
            text: body || ""
        })
        return `${baseUrl}?${params.toString()}`
    }

    // Helper to parse title/body
    const parseContent = (content: string) => {
        const lines = content.split('\n')
        let title = lines[0].replace(/^Title:?\s*/i, '').trim()
        let body = lines.slice(1).join('\n').replace(/^Body:?\s*/i, '').trim()
        title = title.replace(/^"|"$/g, '')
        return { title, body }
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Draft Review & Planner</h1>

            {loading ? (
                <p>Loading drafts...</p>
            ) : drafts.length === 0 ? (
                <p>No drafts found.</p>
            ) : (
                <div className="grid gap-6">
                    {drafts.map(draft => {
                        const { title, body } = parseContent(draft.content)
                        return (
                            <div key={draft.id} className={`border p-6 rounded-lg ${draft.status === 'posted' ? 'bg-green-50 border-green-200 opacity-75' : 'bg-card'}`}>
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h2 className="font-bold text-lg flex items-center gap-2">
                                            r/{draft.subreddits?.name}
                                            {draft.status === 'posted' && <span className="text-xs bg-green-200 text-green-800 px-2 py-0.5 rounded">Posted</span>}
                                        </h2>
                                        <p className="text-xs text-gray-500">From Idea: {draft.post_ideas?.title}</p>
                                    </div>
                                    <div className="space-x-2 flex">
                                        {draft.status === 'draft' && (
                                            <button onClick={() => updateStatus(draft.id, 'approved')} className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">Approve</button>
                                        )}
                                        {draft.status !== 'rejected' && draft.status !== 'posted' && (
                                            <button onClick={() => updateStatus(draft.id, 'rejected')} className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700">Reject</button>
                                        )}
                                    </div>
                                </div>

                                <div className="bg-zinc-50 p-4 rounded border dark:bg-zinc-900 mb-4">
                                    <div className="mb-2 font-bold flex justify-between">
                                        <span>{title}</span>
                                        <button onClick={() => copyToClipboard(title)} title="Copy Title" className="text-gray-500 hover:text-black">
                                            <Copy size={16} />
                                        </button>
                                    </div>
                                    <hr className="my-2" />
                                    <div className="text-sm whitespace-pre-wrap flex justify-between items-start gap-4">
                                        <div className="flex-1">{body}</div>
                                        <button onClick={() => copyToClipboard(body)} title="Copy Body" className="text-gray-500 hover:text-black mt-1">
                                            <Copy size={16} />
                                        </button>
                                    </div>
                                </div>

                                {draft.status === 'approved' && (
                                    <div className="flex items-center gap-4 border-t pt-4">
                                        <a
                                            href={getSubmitUrl(draft.subreddits?.name, title, body)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded font-bold hover:bg-orange-700 transition-colors"
                                        >
                                            <ExternalLink size={16} /> Open Reddit Submit
                                        </a>

                                        <button
                                            onClick={() => updateStatus(draft.id, 'posted')}
                                            className="flex items-center gap-2 px-4 py-2 border border-green-600 text-green-600 rounded font-medium hover:bg-green-50 transition-colors"
                                        >
                                            <Check size={16} /> Mark as Posted
                                        </button>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}

export default function DraftsPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <DraftsContent />
            <div className="fixed bottom-4 right-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 shadow-lg max-w-sm" role="alert">
                <p className="font-bold">Manual Mode Active</p>
                <p className="text-sm">Reddit API is disabled. Use "Open Reddit Submit" to post, then click "Mark as Posted" to track.</p>
            </div>
        </Suspense>
    )
}
