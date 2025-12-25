"use client"

import { useEffect, useState } from "react"

export default function TimelinePage() {
    const [drafts, setDrafts] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editDate, setEditDate] = useState("")

    const fetchDrafts = async () => {
        setLoading(true)
        try {
            // Re-using drafts API which returns all drafts. We might want to filter or sort client side.
            const res = await fetch('/api/drafts')
            if (res.ok) {
                const data = await res.json()
                // Sort by schedule or creation
                setDrafts(data.sort((a: any, b: any) =>
                    new Date(a.scheduled_for || a.created_at).getTime() - new Date(b.scheduled_for || b.created_at).getTime()
                ))
            }
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchDrafts()
    }, [])

    const handleSaveSchedule = async (id: string) => {
        try {
            const res = await fetch('/api/drafts', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, scheduled_for: editDate ? new Date(editDate).toISOString() : null })
            })
            if (res.ok) {
                setEditingId(null)
                fetchDrafts()
            }
        } catch (e) {
            console.error(e)
        }
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Post Timeline</h1>

            {loading ? (
                <p>Loading timeline...</p>
            ) : drafts.length === 0 ? (
                <p>No drafts found.</p>
            ) : (
                <div className="space-y-8 relative border-l-2 border-gray-200 ml-4 py-4">
                    {drafts.map(draft => {
                        const date = draft.scheduled_for ? new Date(draft.scheduled_for) : null
                        return (
                            <div key={draft.id} className="relative pl-8 mb-8">
                                {/* Dot */}
                                <div className={`absolute -left-[9px] top-1 h-4 w-4 rounded-full border-2 border-white ${date ? 'bg-blue-600' : 'bg-gray-300'}`}></div>

                                <div className="border p-4 rounded bg-card shadow-sm">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-bold">{draft.subreddits?.name}</h3>
                                        <div className="text-xs space-x-2">
                                            <span className={`px-2 py-0.5 rounded ${draft.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-gray-100'}`}>
                                                {draft.status}
                                            </span>
                                        </div>
                                    </div>

                                    <p className="text-sm text-gray-500 mb-2">{draft.post_ideas?.title}</p>

                                    <div className="flex items-center space-x-4 mt-4 text-sm">
                                        {editingId === draft.id ? (
                                            <div className="flex items-center space-x-2">
                                                <input
                                                    type="datetime-local"
                                                    className="border p-1 rounded"
                                                    value={editDate}
                                                    onChange={e => setEditDate(e.target.value)}
                                                />
                                                <button onClick={() => handleSaveSchedule(draft.id)} className="text-blue-600 hover:underline">Save</button>
                                                <button onClick={() => setEditingId(null)} className="text-gray-500 hover:underline">Cancel</button>
                                            </div>
                                        ) : (
                                            <>
                                                <span className={date ? "text-blue-600 font-medium" : "text-gray-400 italic"}>
                                                    {date ? date.toLocaleString() : "Unscheduled"}
                                                </span>
                                                <button
                                                    onClick={() => {
                                                        setEditingId(draft.id)
                                                        setEditDate(draft.scheduled_for ? new Date(draft.scheduled_for).toISOString().slice(0, 16) : "")
                                                    }}
                                                    className="text-gray-500 hover:text-black underline"
                                                >
                                                    Edit Schedule
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
