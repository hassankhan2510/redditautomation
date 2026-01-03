-- Run this query in your Supabase SQL Editor

create table if not exists saved_articles (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text not null,
  link text not null,
  source text,
  snippet text
);

-- Optional: Enable RLS (Row Level Security) if you have authentication
-- alter table saved_articles enable row level security;
-- create policy "Public Access" on saved_articles for all using (true);
