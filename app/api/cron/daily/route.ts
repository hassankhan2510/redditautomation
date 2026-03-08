import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateCompletion } from '@/lib/llm';
import { BOOKS, TOPICS } from '@/lib/content';
import { BOOK_PROMPT, TOPIC_PROMPT, PAPER_PROMPT } from '@/lib/prompts';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!; // use service_role key ideally to bypass RLS, but anon works if insert is public
const supabase = createClient(supabaseUrl, supabaseKey);

export const maxDuration = 60; // Set to maximum allowed on Vercel Hobby tier
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    // Optionally secure the cron route with an authorization header checking against a CRON_SECRET
    // const authHeader = request.headers.get('authorization');
    // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) { return new Response('Unauthorized', { status: 401 }); }

    try {
        console.log("🚀 Starting Daily Knowledge Engine Generation...");
        const startTime = Date.now();

        // 1. Select 1 Book & 2 Topics deterministically based on the Date (Day of Year)
        // This ensures the same content is picked if the cron retries on the same day.
        const startOfYear = new Date(new Date().getFullYear(), 0, 0);
        const diff = new Date().getTime() - startOfYear.getTime();
        const oneDay = 1000 * 60 * 60 * 24;
        const dayOfYear = Math.floor(diff / oneDay);

        const selectedBook = BOOKS[dayOfYear % BOOKS.length];
        const selectedTopic1 = TOPICS[(dayOfYear * 2) % TOPICS.length];
        const selectedTopic2 = TOPICS[(dayOfYear * 2 + 1) % TOPICS.length];

        // 2. Fetch 2 Latest ArXiv Papers
        const arxivUrl = 'http://export.arxiv.org/api/query?search_query=cat:cs.AI&start=0&max_results=2&sortBy=submittedDate&sortOrder=descending';
        const arxivRes = await fetch(arxivUrl).then(res => res.text());

        const arxivEntries = [...arxivRes.matchAll(/<entry>([\s\S]*?)<\/entry>/g)].slice(0, 2);
        const papers = arxivEntries.map(entry => {
            return {
                title: entry[1].match(/<title>([\s\S]*?)<\/title>/)?.[1].replace(/\n/g, ' ').trim() || "Paper",
                link: entry[1].match(/<id>([\s\S]*?)<\/id>/)?.[1] || "",
                snippet: entry[1].match(/<summary>([\s\S]*?)<\/summary>/)?.[1].replace(/\n/g, ' ').slice(0, 1000) || ""
            }
        });

        console.log(`📚 Generating analysis for: Book, 2 Topics, 2 Papers...`);

        // 3. Generate Analysis in Parallel
        const [bookAnalysis, topic1Analysis, topic2Analysis, paper1Analysis, paper2Analysis] = await Promise.all([
            generateCompletion(BOOK_PROMPT, `Please provide a deep analysis of this book:\n${selectedBook}`),
            generateCompletion(TOPIC_PROMPT, `Please explain this complex topic from first principles:\n${selectedTopic1}`),
            generateCompletion(TOPIC_PROMPT, `Please explain this complex topic from first principles:\n${selectedTopic2}`),
            papers[0] ? generateCompletion(PAPER_PROMPT, `Analyze this research paper:\nTitle: ${papers[0].title}\nSummary: ${papers[0].snippet}`) : Promise.resolve(""),
            papers[1] ? generateCompletion(PAPER_PROMPT, `Analyze this research paper:\nTitle: ${papers[1].title}\nSummary: ${papers[1].snippet}`) : Promise.resolve("")
        ]);

        // 4. Construct the Daily Package
        const dailyPackage = {
            date: new Date().toISOString(),
            book: {
                title: selectedBook,
                explanation: bookAnalysis
            },
            topics: [
                { title: selectedTopic1, explanation: topic1Analysis },
                { title: selectedTopic2, explanation: topic2Analysis }
            ],
            papers: [
                papers[0] ? { title: papers[0].title, link: papers[0].link, explanation: paper1Analysis } : null,
                papers[1] ? { title: papers[1].title, link: papers[1].link, explanation: paper2Analysis } : null
            ].filter(Boolean)
        };

        // 5. Save to Database
        const { error } = await supabase.from('briefings').insert({
            type: 'daily_learning',
            title: `Daily Deep Learning - ${new Date().toLocaleDateString()}`,
            link: 'cron-generated', // placeholder since it's a bundle
            content: dailyPackage // Storing the full JSON structure in the 'content' column
        });

        if (error) {
            console.error("❌ DB Insert Error:", error);
            throw new Error(`Failed to save to database: ${error.message}`);
        }

        console.log(`✅ Daily Knowledge Engine complete in ${Date.now() - startTime}ms`);
        return NextResponse.json({ success: true, message: "Daily learning package generated successfully." });

    } catch (error: any) {
        console.error("❌ Cron Job Failed:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
