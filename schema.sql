-- Subreddits Configuration
create table subreddits (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  audience_type text,
  tone text,
  links_allowed boolean default false,
  self_promo_level text, -- low, medium, high
  preferred_length text,
  required_flair text,
  banned_phrases text[],
  ending_style text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Post Ideas
create table post_ideas (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  core_idea text not null,
  technical_depth int, -- 1-5
  goal text, -- discussion, feedback, help
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Generated Drafts
create table post_drafts (
  id uuid default gen_random_uuid() primary key,
  post_idea_id uuid references post_ideas(id),
  subreddit_id uuid references subreddits(id),
  content text,
  similarity_score float,
  status text default 'draft', -- draft, approved, posted
  scheduled_for timestamp with time zone, -- NEW: For timeline
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Posting History
create table post_history (
  id uuid default gen_random_uuid() primary key,
  subreddit text,
  reddit_post_id text,
  posted_at timestamp with time zone default timezone('utc'::text, now()) not null,
  upvotes int default 0,
  comments int default 0
);
