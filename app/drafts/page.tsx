"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"

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
        await fetch('/api/drafts', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, status })
        })
        fetchDrafts()
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Draft Review</h1>

            {loading ? (
                <p>Loading drafts...</p>
            ) : drafts.length === 0 ? (
                <p>No drafts found.</p>
            ) : (
                <div className="grid gap-6">
                    {drafts.map(draft => (
                        <div key={draft.id} className={`border p-6 rounded-lg ${draft.status === 'approved' ? 'bg-green-50 border-green-200' : 'bg-card'}`}>
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h2 className="font-bold text-lg">{draft.subreddits?.name}</h2>
                                    <p className="text-xs text-gray-500">From Idea: {draft.post_ideas?.title}</p>
                                    {draft.similarity_score > 0.5 && (
                                        <span className="text-xs text-red-600 font-bold bg-red-100 px-2 py-0.5 rounded ml-2">
                                            High Similarity: {(draft.similarity_score * 100).toFixed(0)}%
                                        </span>
                                    )}
                                </div>
                                <div className="space-x-2">
                                    {draft.status !== 'approved' && (
                                        <button onClick={() => updateStatus(draft.id, 'approved')} className="px-3 py-1 bg-green-600 text-white rounded text-sm">Approve</button>
                                    )}
                                    {draft.status !== 'rejected' && (
                                        <button onClick={() => updateStatus(draft.id, 'rejected')} className="px-3 py-1 bg-red-600 text-white rounded text-sm">Reject</button>
                                    )}
                                </div>
                            </div>

                            <div className="prose max-w-none text-sm whitespace-pre-wrap bg-zinc-50 p-4 rounded border">
                                {draft.content}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default function DraftsPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <DraftsContent />
        </Suspense>
    )
}
