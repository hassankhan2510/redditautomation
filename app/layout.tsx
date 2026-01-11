import { Footer } from "@/components/footer"
import { Navbar } from "@/components/navbar";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DeepResearch | AI-Powered Knowledge Assistant",
  description: "Turn complex articles, papers, and news into clear, actionable insights with AI-powered analysis.",
  keywords: ["research", "AI", "analysis", "papers", "news", "knowledge"],
  authors: [{ name: "DeepResearch" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <Navbar />
          <main className="flex-1 pt-24">
            {children}
          </main>
          <Toaster richColors position="bottom-right" />
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
