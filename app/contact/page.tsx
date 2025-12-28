"use client"

import { Mail, Linkedin, Instagram, ArrowUpRight } from "lucide-react"

export default function ContactPage() {
    return (
        <div className="container mx-auto py-16 px-4 max-w-2xl text-center animate-in fade-in zoom-in-95">

            <h1 className="text-4xl font-bold mb-6">Get in Touch</h1>
            <p className="text-xl text-muted-foreground mb-12">
                Interested in building scalable AI systems? Let's connect.
            </p>

            <div className="space-y-4">

                {/* EMAIL */}
                <a href="mailto:alhassankhan2004@gmail.com" className="flex items-center p-4 bg-card border rounded-xl hover:border-primary/50 hover:shadow-lg transition group">
                    <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-full text-red-600 mr-4">
                        <Mail size={24} />
                    </div>
                    <div className="text-left flex-1">
                        <div className="font-bold text-sm text-muted-foreground uppercase">Email</div>
                        <div className="font-medium">alhassankhan2004@gmail.com</div>
                    </div>
                </a>

                {/* LINKEDIN */}
                <a href="https://www.linkedin.com/in/hassankhan5100" target="_blank" className="flex items-center p-4 bg-card border rounded-xl hover:border-blue-500/50 hover:shadow-lg transition group">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full text-blue-600 mr-4">
                        <Linkedin size={24} />
                    </div>
                    <div className="text-left flex-1">
                        <div className="font-bold text-sm text-muted-foreground uppercase">LinkedIn</div>
                        <div className="font-medium">linkedin.com/in/hassankhan5100</div>
                    </div>
                    <ArrowUpRight className="opacity-0 group-hover:opacity-100 transition text-muted-foreground" />
                </a>

                {/* INSTAGRAM */}
                <a href="https://www.instagram.com/hassankhan_5100" target="_blank" className="flex items-center p-4 bg-card border rounded-xl hover:border-pink-500/50 hover:shadow-lg transition group">
                    <div className="p-3 bg-pink-100 dark:bg-pink-900/20 rounded-full text-pink-600 mr-4">
                        <Instagram size={24} />
                    </div>
                    <div className="text-left flex-1">
                        <div className="font-bold text-sm text-muted-foreground uppercase">Instagram</div>
                        <div className="font-medium">@hassankhan_5100</div>
                    </div>
                    <ArrowUpRight className="opacity-0 group-hover:opacity-100 transition text-muted-foreground" />
                </a>

            </div>

        </div>
    )
}
