"use client"

import Link from "next/link"
import { ArrowRight, BookOpen, Search, Sparkles, Zap } from "lucide-react"

export default function Home() {
  return (
    <main className="flex flex-col min-h-screen">

      {/* HERO SECTION */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-background z-0" />
        <div className="container px-4 md:px-6 relative z-10 text-center">
          <div className="inline-flex items-center rounded-full border px-3 py-1 text-sm text-muted-foreground mb-6 bg-background/50 backdrop-blur">
            <span className="flex h-2 w-2 rounded-full bg-green-500 mr-2" />
            AI-Powered Research & Analysis
          </div>
          <h1 className="text-4xl md:text-7xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70 mb-6">
            Deep Research. <br className="hidden md:block" />
            <span className="text-primary">Simplified.</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-[600px] mx-auto mb-10">
            Your AI research assistant. Turn complex papers, news, and articles into clear, actionable insights.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/feed" className="inline-flex h-12 items-center justify-center rounded-lg bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
              Start Researching <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* FEATURE SECTION */}
      <section className="py-20 bg-secondary/20">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight mb-4">How It Works</h2>
            <p className="text-muted-foreground max-w-[500px] mx-auto">Research smarter, not harder.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">

            {/* CARD 1 */}
            <div className="group relative overflow-hidden rounded-2xl border bg-card p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Search size={120} />
              </div>
              <div className="mb-6 p-4 bg-gradient-to-br from-amber-500/10 to-orange-500/10 w-fit rounded-xl text-amber-500">
                <Search size={32} />
              </div>
              <h3 className="text-2xl font-bold mb-3">Curated Feeds</h3>
              <p className="text-muted-foreground">Access news, papers, and insights from 50+ trusted sources across tech, science, business, and more.</p>
            </div>

            {/* CARD 2 */}
            <div className="group relative overflow-hidden rounded-2xl border bg-card p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <BookOpen size={120} />
              </div>
              <div className="mb-6 p-4 bg-gradient-to-br from-blue-500/10 to-violet-500/10 w-fit rounded-xl text-blue-500">
                <BookOpen size={32} />
              </div>
              <h3 className="text-2xl font-bold mb-3">Deep Explain</h3>
              <p className="text-muted-foreground">One-click AI analysis that breaks down complex articles into clear, first-principles explanations.</p>
            </div>

            {/* CARD 3 */}
            <div className="group relative overflow-hidden rounded-2xl border bg-card p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Sparkles size={120} />
              </div>
              <div className="mb-6 p-4 bg-gradient-to-br from-green-500/10 to-teal-500/10 w-fit rounded-xl text-green-500">
                <Sparkles size={32} />
              </div>
              <h3 className="text-2xl font-bold mb-3">Save & Organize</h3>
              <p className="text-muted-foreground">Build your personal knowledge library. Save articles and access them anytime.</p>
            </div>

          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-20">
        <div className="container px-4 md:px-6 text-center">
          <div className="inline-flex items-center justify-center p-4 bg-primary/10 rounded-full text-primary mb-6">
            <Zap size={32} />
          </div>
          <h2 className="text-3xl font-bold tracking-tight mb-4">Ready to Research?</h2>
          <p className="text-muted-foreground max-w-[500px] mx-auto mb-8">
            Stop drowning in information. Start understanding it.
          </p>
          <Link href="/feed" className="inline-flex h-12 items-center justify-center rounded-lg bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90">
            Open Research Feed <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </section>

    </main>
  )
}
