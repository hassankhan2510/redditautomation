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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

            {/* CARD 1: REPURPOSE */}
            <Link href="/repurpose" className="group relative overflow-hidden rounded-xl border bg-background p-6 hover:shadow-lg transition-all">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Repeat size={100} />
              </div>
              <div className="mb-4 p-3 bg-violet-100 dark:bg-violet-900/20 w-fit rounded-lg text-violet-600 dark:text-violet-400">
                <Repeat size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2">Content Repurposer</h3>
              <p className="text-muted-foreground text-sm">Turn one idea into a LinkedIn post, Tweet, and Reddit thread instantly.</p>
            </Link>

            {/* CARD 2: SCOUT */}
            <Link href="/scout" className="group relative overflow-hidden rounded-xl border bg-background p-6 hover:shadow-lg transition-all">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Search size={100} />
              </div>
              <div className="mb-4 p-3 bg-teal-100 dark:bg-teal-900/20 w-fit rounded-lg text-teal-600 dark:text-teal-400">
                <Search size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2">Lead Scout</h3>
              <p className="text-muted-foreground text-sm">Find customers asking for help in your niche on Reddit in real-time.</p>
            </Link>

            {/* CARD 3: REMIX */}
            <Link href="/remix" className="group relative overflow-hidden rounded-xl border bg-background p-6 hover:shadow-lg transition-all">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Zap size={100} />
              </div>
              <div className="mb-4 p-3 bg-pink-100 dark:bg-pink-900/20 w-fit rounded-lg text-pink-600 dark:text-pink-400">
                <Sparkles size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2">Remix Vault</h3>
              <p className="text-muted-foreground text-sm">Steal the structure of viral hits and rewrite them for your industry.</p>
            </Link>

            {/* CARD 4: CHARTS */}
            <Link href="/chart" className="group relative overflow-hidden rounded-xl border bg-background p-6 hover:shadow-lg transition-all">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <BarChart3 size={100} />
              </div>
              <div className="mb-4 p-3 bg-indigo-100 dark:bg-indigo-900/20 w-fit rounded-lg text-indigo-600 dark:text-indigo-400">
                <BarChart3 size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2">Chart Studio</h3>
              <p className="text-muted-foreground text-sm">Turn boring text statistics into viral-ready visuals.</p>
            </Link>

            {/* CARD 5: CAROUSEL */}
            <Link href="/carousel" className="group relative overflow-hidden rounded-xl border bg-background p-6 hover:shadow-lg transition-all">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <LayoutTemplate size={100} />
              </div>
              <div className="mb-4 p-3 bg-orange-100 dark:bg-orange-900/20 w-fit rounded-lg text-orange-600 dark:text-orange-400">
                <LayoutTemplate size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2">Carousel Maker</h3>
              <p className="text-muted-foreground text-sm">Generate PDF carousels for LinkedIn interaction.</p>
            </Link>

            {/* CARD 6: REPLY */}
            <Link href="/reply" className="group relative overflow-hidden rounded-xl border bg-background p-6 hover:shadow-lg transition-all">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <MessageSquare size={100} />
              </div>
              <div className="mb-4 p-3 bg-green-100 dark:bg-green-900/20 w-fit rounded-lg text-green-600 dark:text-green-400">
                <MessageSquare size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2">Reply Engine</h3>
              <p className="text-muted-foreground text-sm">Hijack viral conversations on X with high-status replies.</p>
            </Link>
            {/* CARD 7: VIDEO GHOST */}
            <Link href="/video" className="group relative overflow-hidden rounded-xl border bg-background p-6 hover:shadow-lg transition-all">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <LayoutTemplate size={100} />
              </div>
              <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/20 w-fit rounded-lg text-red-600 dark:text-red-400">
                <LayoutTemplate size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2">Video Ghost</h3>
              <p className="text-muted-foreground text-sm">Turn text into professional kinetic motion graphics instantly.</p>
            </Link>

          </div>
        </div>
      </section>
    </main>
  )
}
