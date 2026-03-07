"use client"

import Link from 'next/link'
import { ModeToggle } from "@/components/mode-toggle"
import { BookOpen } from "lucide-react"

export function Navbar() {
    return (
        <header className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-gray-800 bg-[#F9F9F7]/80 dark:bg-[#121212]/80 backdrop-blur-md">
            <div className="container mx-auto max-w-4xl px-6 h-16 flex items-center justify-between">
                <Link href="/" className="font-serif font-black text-xl flex items-center gap-3 text-foreground tracking-tight">
                    <BookOpen size={20} className="text-gray-900 dark:text-gray-100" />
                    DeepLearning
                </Link>

                <div className="flex items-center gap-6">
                    <Link href="/library" className="text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors font-sans text-sm font-medium">
                        Library
                    </Link>
                    <ModeToggle />
                </div>
            </div>
        </header>
    )
}
