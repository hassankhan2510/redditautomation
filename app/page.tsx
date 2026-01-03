"use client"

import Link from "next/link"
import { ArrowRight, Rocket, Repeat, BarChart3, Search, Zap, LayoutTemplate, Sparkles, MessageSquare } from "lucide-react"

export default function Home() {
  return (
    <main className="flex flex-col min-h-screen">

      {/* HERO SECTION */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-background z-0" />
        <div className="container px-4 md:px-6 relative z-10 text-center">
          <div className="inline-flex items-center rounded-full border px-3 py-1 text-sm text-muted-foreground mb-6 bg-background/50 backdrop-blur">
            <span className="flex h-2 w-2 rounded-full bg-green-500 mr-2" />
            v2.0 is Live: Social Listening & Remix Engine
          </div>
          <h1 className="text-4xl md:text-7xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70 mb-6">
            Scale Your Brand. <br className="hidden md:block" />
            <span className="text-primary">Solo.</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-[600px] mx-auto mb-10">
            The all-in-one Growth OS for solopreneurs. Repurpose content, find high-intent leads, and create viral visuals in seconds.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/ideas" className="inline-flex h-12 items-center justify-center rounded-lg bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
              Start Creating <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <Link href="/scout" className="inline-flex h-12 items-center justify-center rounded-lg border border-input bg-background px-8 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
              Find Leads
            </Link>
          </div>
        </div>
      </section>

      {/* FEATURE GRID */}
      <section className="py-20 bg-secondary/20">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight mb-4">Your Growth Arsenal</h2>
            <p className="text-muted-foreground max-w-[500px] mx-auto">Do the work of a 5-person marketing team, by yourself.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

            {/* CARD 1: STUDIO */}
            <Link href="/studio" className="group relative overflow-hidden rounded-2xl border bg-card p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <LayoutTemplate size={120} />
              </div>
              <div className="mb-6 p-4 bg-gradient-to-br from-blue-500/10 to-violet-500/10 w-fit rounded-xl text-blue-500">
                <LayoutTemplate size={32} />
              </div>
              <h3 className="text-2xl font-bold mb-3">Universal Studio</h3>
              <p className="text-muted-foreground mb-4">The single command center for content. Generate Videos, Carousels, Threads, and Posts from one idea.</p>
              <span className="text-sm font-bold text-blue-500 flex items-center gap-1 group-hover:gap-2 transition-all">
                Enter Studio <ArrowRight size={14} />
              </span>
            </Link>

            {/* CARD 2: RADAR */}
            <Link href="/radar" className="group relative overflow-hidden rounded-2xl border bg-card p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <BarChart3 size={120} />
              </div>
              <div className="mb-6 p-4 bg-gradient-to-br from-green-500/10 to-teal-500/10 w-fit rounded-xl text-green-500">
                <BarChart3 size={32} />
              </div>
              <h3 className="text-2xl font-bold mb-3">Opportunity Radar</h3>
              <p className="text-muted-foreground mb-4">A split-screen intelligence dashboard. See high-value Contracts and viral Leads in real-time.</p>
              <span className="text-sm font-bold text-green-500 flex items-center gap-1 group-hover:gap-2 transition-all">
                Scan Market <ArrowRight size={14} />
              </span>
            </Link>

            {/* CARD 3: BRAIN */}
            <Link href="/feed" className="group relative overflow-hidden rounded-2xl border bg-card p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Search size={120} />
              </div>
              <div className="mb-6 p-4 bg-gradient-to-br from-amber-500/10 to-orange-500/10 w-fit rounded-xl text-amber-500">
                <Search size={32} />
              </div>
              <h3 className="text-2xl font-bold mb-3">Deep Intelligence</h3>
              <p className="text-muted-foreground mb-4">Research engine powered by the Neutral Explainer. Turn complex papers into simple mental models.</p>
              <span className="text-sm font-bold text-amber-500 flex items-center gap-1 group-hover:gap-2 transition-all">
                Start Research <ArrowRight size={14} />
              </span>
            </Link>

          </div>
        </div>
      </section>
    </main>
  )
}
