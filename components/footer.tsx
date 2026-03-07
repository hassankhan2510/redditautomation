import Link from "next/link"

export function Footer() {
    return (
        <footer className="w-full border-t border-gray-200 dark:border-gray-800 bg-[#F9F9F7] dark:bg-[#121212] py-8 text-center text-sm text-gray-400 font-serif">
            <div className="container mx-auto px-6 max-w-4xl flex flex-col items-center gap-2">
                <p>&copy; {new Date().getFullYear()} DeepLearning Engine. Dedicated to pure knowledge.</p>
                <p className="text-xs opacity-70">Curriculum generated daily by AI.</p>
            </div>
        </footer>
    )
}
