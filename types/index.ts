export interface Subreddit {
    id: string
    name: string
    audience_type: string
    tone: string
    links_allowed: boolean
    self_promo_level: 'low' | 'medium' | 'high'
    preferred_length: string
    required_flair: string
    banned_phrases: string[]
    ending_style: string
    created_at: string
}

export interface PostIdea {
    id: string
    title: string
    core_idea: string
    technical_depth: number
    goal: string
    created_at: string
}

export interface PostDraft {
    id: string
    post_idea_id: string
    subreddit_id: string
    content: string
    similarity_score: number
    status: 'draft' | 'approved' | 'posted'
    scheduled_for?: string
    created_at: string
    subreddit?: Subreddit // Joined
}

export interface PostHistory {
    id: string
    subreddit: string
    reddit_post_id: string
    posted_at: string
    upvotes: number
    comments: number
}
