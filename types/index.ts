// types/index.ts - TypeScript interfaces for DeepResearch

export interface FeedItem {
    title: string
    link: string
    snippet: string
    source: string
    category: string
    pubDate?: string
    author?: string
}

export interface SavedItem extends FeedItem {
    id: string
    published_at?: string
    created_at: string
}

export interface QueueItem extends FeedItem {
    id: string
    added_at: string
}

export interface ChatMessage {
    role: 'user' | 'assistant'
    content: string
    timestamp?: string
}

export interface ChatSession {
    articleUrl: string
    articleTitle: string
    explanation: string
    messages: ChatMessage[]
}

export interface ExplanationCache {
    id: string
    url_hash: string
    url: string
    category: string
    explanation: string
    created_at: string
}

export interface ApiResponse<T> {
    data?: T
    error?: string
    success: boolean
}

// Filter types
export type FilterCategory =
    | 'global'
    | 'pk'
    | 'business'
    | 'tech'
    | 'launch'
    | 'engineering'
    | 'growth'
    | 'crypto'
    | 'science'
    | 'philosophy'
    | 'history'
    | 'politics'
    | 'stocks'

export type ViewMode = 'feed' | 'saved' | 'queue'

// Component Props
export interface ArticleCardProps {
    item: FeedItem | SavedItem | QueueItem
    isSelected: boolean
    onSelect: () => void
    onSave?: () => void
    onDelete?: () => void
    onQueue?: () => void
    viewMode: ViewMode
}

export interface DeepExplainProps {
    item: FeedItem
    explanation: string
    isLoading: boolean
    onClose: () => void
    onDownloadPdf: () => void
    onStartChat: () => void
}

export interface ChatPanelProps {
    session: ChatSession
    onSendMessage: (message: string) => void
    isLoading: boolean
}
