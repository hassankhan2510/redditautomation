-- DeepResearch Database Schema
-- Run this in Supabase SQL Editor

-- Saved Research Items (Library)
create table if not exists saved_research (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  link text not null,
  snippet text,
  source text,
  category text,
  published_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Read Later Queue (Temporary)
create table if not exists read_later (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  link text not null unique,
  snippet text,
  source text,
  category text,
  published_at timestamp with time zone,
  added_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Explanation Cache (Avoid re-analyzing same articles)
create table if not exists explanation_cache (
  id uuid default gen_random_uuid() primary key,
  url_hash text not null unique, -- MD5 hash of URL
  url text not null,
  category text,
  explanation text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Chat History (For Chat with Article feature)
create table if not exists chat_history (
  id uuid default gen_random_uuid() primary key,
  article_url text not null,
  messages jsonb not null default '[]',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Indexes for performance
create index if not exists idx_saved_research_created_at on saved_research(created_at desc);
create index if not exists idx_read_later_added_at on read_later(added_at desc);
create index if not exists idx_explanation_cache_url_hash on explanation_cache(url_hash);
create index if not exists idx_chat_history_article_url on chat_history(article_url);
