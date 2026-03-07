"use client"

import { useState, useEffect } from "react"
import { Loader2, BookOpen, Brain, FileText, CheckCircle2, BookmarkPlus } from "lucide-react"
import { toast } from "sonner"
import { OnDemandInput } from "@/components/OnDemandInput"
import { ArticleChat } from "@/components/ArticleChat"

export default function Home() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<any>(null)
  const [onDemandResult, setOnDemandResult] = useState<{ title: string, explanation: string, isUrl: boolean } | null>(null)
  const [savingId, setSavingId] = useState<string | null>(null)

  useEffect(() => {
    const fetchDailyPackage = async () => {
      try {
        const res = await fetch('/api/briefing')
        if (!res.ok) {
          const errorData = await res.json()
          throw new Error(errorData.error || "Failed to load")
        }
        const json = await res.json()
        setData(json)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchDailyPackage()
  }, [])

  const handleSave = async (title: string, explanation: string, link: string, id: string) => {
    setSavingId(id)
    try {
      const res = await fetch('/api/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, explanation, sourceUrl: link })
      })
      if (res.ok) toast.success("Saved to Library")
      else toast.error("Failed to save")
    } catch {
      toast.error("Error saving")
    } finally {
      setSavingId(null)
    }
  }

  const SimpleMarkdown = ({ text }: { text: string }) => {
    if (!text) return null
    const lines = text.split('\n')
    return (
      <div className="space-y-4 text-gray-800 dark:text-gray-200 leading-relaxed text-lg font-serif">
        {lines.map((line, i) => {
          if (line.startsWith('# ')) return <h1 key={i} className="text-3xl font-bold mt-8 mb-4 font-sans text-foreground">{line.replace('# ', '')}</h1>
          if (line.startsWith('## ')) return <h2 key={i} className="text-2xl font-bold mt-8 mb-4 font-sans text-foreground">{line.replace('## ', '')}</h2>
          if (line.startsWith('### ')) return <h3 key={i} className="text-xl font-bold mt-6 mb-3 font-sans text-foreground">{line.replace('### ', '')}</h3>
          if (line.trim().startsWith('- ')) {
            const content = line.trim().substring(2);
            const parts = content.split(/(\*\*.*?\*\*)/g);
            return (
              <li key={i} className="ml-6 list-disc mb-2">
                {parts.map((part, index) => part.startsWith('**') && part.endsWith('**') ? <strong key={index} className="font-semibold text-foreground">{part.slice(2, -2)}</strong> : <span key={index}>{part}</span>)}
              </li>
            )
          }
          if (line.trim() === '') return <div key={i} className="h-2"></div>
          const parts = line.split(/(\*\*.*?\*\*)/g);
          return (
            <p key={i} className="mb-4">
              {parts.map((part, index) => part.startsWith('**') && part.endsWith('**') ? <strong key={index} className="font-semibold text-foreground">{part.slice(2, -2)}</strong> : <span key={index}>{part}</span>)}
            </p>
          )
        })}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F9F9F7] dark:bg-[#121212]">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400 mb-4" />
        <p className="text-gray-500 font-medium">Assembling your daily knowledge...</p>
      </div>
    )
  }

  if (error && !data) {
    return (
      <div className="min-h-screen flex flex-col items-center pt-32 px-4 bg-[#F9F9F7] dark:bg-[#121212]">
        <OnDemandInput onResult={(t, e, u) => setOnDemandResult({ title: t, explanation: e, isUrl: u })} />
        <div className="bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 p-6 rounded-lg max-w-md border border-red-100 dark:border-red-900/30 w-full">
          <p className="font-semibold mb-2">Notice</p>
          <p className="text-sm">{error}</p>
          <p className="text-xs mt-4 opacity-70">The cron job runs at 7:00 AM PKT.</p>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-[#F9F9F7] dark:bg-[#121212] py-8 md:py-16 selection:bg-gray-200 dark:selection:bg-gray-800">
      <article className="max-w-3xl mx-auto px-6 md:px-0">

        {/* On Demand Input at Top */}
        <div className="mb-16">
          <OnDemandInput onResult={(t, e, u) => setOnDemandResult({ title: t, explanation: e, isUrl: u })} />
        </div>

        {/* On Demand Result Block */}
        {onDemandResult && (
          <section className="mb-24 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-full">
                <Brain className="w-6 h-6 text-gray-700 dark:text-gray-300" />
              </div>
              <h2 className="text-3xl font-bold font-sans">Deep Explain Result</h2>
            </div>
            <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl p-8 md:p-12 shadow-sm border border-gray-100 dark:border-gray-800 relative">
              <button
                onClick={() => handleSave(onDemandResult.title, onDemandResult.explanation, onDemandResult.isUrl ? onDemandResult.title : 'Topic', 'demand-1')}
                disabled={savingId === 'demand-1'}
                className="absolute top-8 right-8 p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                {savingId === 'demand-1' ? <Loader2 className="w-5 h-5 animate-spin" /> : <BookmarkPlus className="w-5 h-5" />}
              </button>
              <div className="mb-8 border-l-4 border-gray-300 dark:border-gray-700 pl-6 pr-12">
                <h3 className="text-2xl font-bold text-foreground mb-2 break-words">{onDemandResult.title}</h3>
                <p className="text-gray-500 italic">First Principles Explanation</p>
              </div>
              <SimpleMarkdown text={onDemandResult.explanation} />

              {/* Chat Integration */}
              <ArticleChat articleContent={onDemandResult.title} previousExplanation={onDemandResult.explanation} />
            </div>
          </section>
        )}

        {data && (
          <>
            {/* Daily Header */}
            <header className="mb-20 text-center md:text-left border-b border-gray-200 dark:border-gray-800 pb-12">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-500 mb-6">
                <CheckCircle2 size={16} />
                Daily Learning Package
              </div>
              <h1 className="text-5xl md:text-6xl font-black tracking-tight text-foreground mb-6 font-sans">
                Today's Curriculum.
              </h1>
              <p className="text-xl text-gray-500 font-serif italic">
                {new Date(data.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </header>

            {/* Section 1: Book */}
            {data.book && (
              <section className="mb-24">
                <div className="flex items-center gap-4 mb-8">
                  <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-full">
                    <BookOpen className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                  </div>
                  <h2 className="text-3xl font-bold font-sans">Book of the Day</h2>
                </div>
                <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl p-8 md:p-12 shadow-sm border border-gray-100 dark:border-gray-800 relative">
                  <button
                    onClick={() => handleSave(data.book.title, data.book.explanation, 'Book', 'book-1')}
                    disabled={savingId === 'book-1'}
                    className="absolute top-8 right-8 p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    {savingId === 'book-1' ? <Loader2 className="w-5 h-5 animate-spin" /> : <BookmarkPlus className="w-5 h-5" />}
                  </button>
                  <div className="mb-8 border-l-4 border-gray-300 dark:border-gray-700 pl-6 pr-12">
                    <h3 className="text-2xl font-bold text-foreground mb-2">{data.book.title}</h3>
                    <p className="text-gray-500 italic">Deep Summary & Mental Models</p>
                  </div>
                  <SimpleMarkdown text={data.book.explanation} />
                  <ArticleChat articleContent={data.book.title} previousExplanation={data.book.explanation} />
                </div>
              </section>
            )}

            {/* Section 2: Deep Topics */}
            {data.topics && data.topics.length > 0 && (
              <section className="mb-24">
                <div className="flex items-center gap-4 mb-8">
                  <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-full">
                    <Brain className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                  </div>
                  <h2 className="text-3xl font-bold font-sans">Deep Topics</h2>
                </div>

                <div className="space-y-12">
                  {data.topics.map((topic: any, idx: number) => (
                    <div key={idx} className="bg-white dark:bg-[#1A1A1A] rounded-2xl p-8 md:p-12 shadow-sm border border-gray-100 dark:border-gray-800 relative">
                      <button
                        onClick={() => handleSave(topic.title, topic.explanation, 'Deep Topic', `topic-${idx}`)}
                        disabled={savingId === `topic-${idx}`}
                        className="absolute top-8 right-8 p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                      >
                        {savingId === `topic-${idx}` ? <Loader2 className="w-5 h-5 animate-spin" /> : <BookmarkPlus className="w-5 h-5" />}
                      </button>
                      <div className="mb-8 border-l-4 border-gray-300 dark:border-gray-700 pl-6 pr-12">
                        <h3 className="text-2xl font-bold text-foreground mb-2">{topic.title}</h3>
                        <p className="text-gray-500 italic">First Principles Explanation</p>
                      </div>
                      <SimpleMarkdown text={topic.explanation} />
                      <ArticleChat articleContent={topic.title} previousExplanation={topic.explanation} />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Section 3: ArXiv Papers */}
            {data.papers && data.papers.length > 0 && (
              <section className="mb-24">
                <div className="flex items-center gap-4 mb-8">
                  <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-full">
                    <FileText className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                  </div>
                  <h2 className="text-3xl font-bold font-sans">Cutting-Edge Research</h2>
                </div>

                <div className="space-y-12">
                  {data.papers.map((paper: any, idx: number) => (
                    <div key={idx} className="bg-white dark:bg-[#1A1A1A] rounded-2xl p-8 md:p-12 shadow-sm border border-gray-100 dark:border-gray-800 relative">
                      <button
                        onClick={() => handleSave(paper.title, paper.explanation, paper.link, `paper-${idx}`)}
                        disabled={savingId === `paper-${idx}`}
                        className="absolute top-8 right-8 p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                      >
                        {savingId === `paper-${idx}` ? <Loader2 className="w-5 h-5 animate-spin" /> : <BookmarkPlus className="w-5 h-5" />}
                      </button>
                      <div className="mb-8 border-l-4 border-gray-300 dark:border-gray-700 pl-6 pr-12">
                        <h3 className="text-2xl font-bold text-foreground mb-2">{paper.title}</h3>
                        {paper.link && (
                          <a href={paper.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium">
                            View Source Document
                          </a>
                        )}
                      </div>
                      <SimpleMarkdown text={paper.explanation} />
                      <ArticleChat articleContent={paper.title} previousExplanation={paper.explanation} />
                    </div>
                  ))}
                </div>
              </section>
            )}

            <footer className="mt-32 pt-12 border-t border-gray-200 dark:border-gray-800 text-center text-gray-400 font-serif italic pb-20">
              You have finished today's curriculum. Rest and absorb. <br /> The next package arrives at 7:00 AM.
            </footer>
          </>
        )}
      </article>
    </main>
  )
}
