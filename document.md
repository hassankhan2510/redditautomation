# Reddit Community‑Aware Posting System (Production‑Ready Design)

This document defines a **real, deployable system** to post **community‑specific Reddit posts** from a single idea, without copy‑paste, without n8n, using a **coding agent**, hosted **free on Vercel**, with a **free database**.

No toy assumptions. This is how you avoid bans and actually use it daily.

---

## 1. System Goal

Build a system that:

* Takes **one idea / update** from you
* Generates **distinct, subreddit‑native posts**
* Enforces **semantic difference** between posts
* Respects **subreddit rules**
* Requires **human approval** before posting
* Posts slowly and safely

This is a **content assistant**, not a spam bot.

---

## 2. High‑Level Architecture

Frontend (Vercel)
→ API Layer (Vercel Serverless Functions)
→ AI Generation Layer (Coding Agent)
→ Validation & Similarity Guard
→ Database (Free)
→ Reddit API (PRAW)

---

## 3. Technology Choices (Free‑Only)

### Frontend

* Next.js (App Router)
* Hosted on **Vercel Free Tier**

### Backend

* Vercel Serverless Functions (Node or Python)

### AI / Coding Agent

* OpenRouter (free models)
* One **Coding Agent** responsible for:

  * Reading subreddit profile
  * Generating post
  * Self‑critiquing output

### Database (Free)

Choose **ONE**:

**Option A: Supabase (recommended)**

* Free Postgres
* Auth (optional)
* Works well with Vercel

**Option B: Neon**

* Serverless Postgres
* Very lightweight

No Firebase (rate limits + vendor lock).

### Reddit Integration

* Official Reddit API
* PRAW (Python) or Snoowrap (Node)

---

## 4. Core Data Models

### 4.1 Subreddit Profile Table

Stores rules and tone per community.

```
subreddits
- id
- name
- audience_type
- tone
- links_allowed (bool)
- self_promo_level (low/medium/high)
- preferred_length
- required_flair
- banned_phrases[]
- ending_style
```

This is **manual input**. Do NOT auto‑scrape rules.

---

### 4.2 Post Idea Table

```
post_ideas
- id
- title
- core_idea
- technical_depth (1–5)
- goal (discussion / feedback / help)
- created_at
```

---

### 4.3 Generated Drafts Table

```
post_drafts
- id
- post_idea_id
- subreddit_id
- content
- similarity_score
- status (draft / approved / posted)
```

---

### 4.4 Posting History

```
post_history
- id
- subreddit
- reddit_post_id
- posted_at
- upvotes
- comments
```

---

## 5. Pre-Build Research Requirement (MANDATORY)

Before writing any code, the coding agent **must research each target subreddit** and create a **separate static configuration entry** for it.

The agent must:

* Review subreddit rules
* Identify self-promotion tolerance
* Identify link policy (post vs comments)
* Identify common post formats (question, discussion, showcase)
* Identify banned phrases or behaviors

The output of this research is a **version-controlled config file** (JSON or TS) used by the system at runtime.

No subreddit may be posted to unless it exists in this config.

---

### Required Subreddit Research List

#### AI / ML Focused

* r/MachineLearning
* r/learnmachinelearning
* r/artificial
* r/ChatGPT
* r/MachineLearningJobs

#### Software Development

* r/learnprogramming
* r/programming
* r/webdev
* r/cscareerquestions
* r/learnpython

#### Project Showcases / Side Projects

* r/SideProject
* r/coding
* r/algorithms
* r/compsci
* r/developers

#### Remote Jobs / Freelance

* r/RemoteJobs
* r/forhire
* r/developersPak
* r/WorkOnline
* r/hiring

#### Additional Niche

* r/devops
* r/datascience
* r/reactjs
* r/node
* r/startups

Each subreddit must have an **independent config object**.

---

## 6. Coding Agent Design (Critical)

This is NOT a simple prompt.

### Agent Responsibilities

For each subreddit:

1. Read subreddit profile
2. Re‑frame the idea for that audience
3. Generate a **native Reddit post**
4. Critique its own output:

   * Does it sound promotional?
   * Does it violate rules?
   * Is it distinct from other drafts?
5. Revise if needed

This loop runs **before** you see the draft.

---

## 6. Prompt Structure (Agent‑Level)

### System Prompt (Fixed)

You are a Reddit user posting naturally in a specific community. You must never reuse structure, phrasing, or intent from posts written for other subreddits. Your goal is discussion, not promotion.

---

### Subreddit Context Injection

Injected dynamically:

* Audience
* Tone
* Allowed links
* Typical post style
* Ending expectations

---

### Self‑Critique Prompt (Mandatory)

After generation, the agent runs:

* Identify promotional language
* Identify reused structure
* Check rule violations
* Rewrite if any are found

No self‑critique = unsafe.

---

## 7. Semantic Similarity Guard

Before approval:

* Embed all drafts (same idea)
* Compute cosine similarity
* If similarity > 0.75 → regenerate

This prevents Reddit pattern detection.

Free embedding models via OpenRouter are sufficient.

---

## 8. Posting Rules Engine

Hard‑coded safety limits:

* 1 post per day (global)
* 1 post per subreddit per 7 days
* No links in post body by default
* Links allowed only if subreddit allows

If rules fail → block posting.

---

## 9. Approval Workflow (Required)

1. Drafts generated
2. UI shows:

   * Subreddit name
   * Draft content
   * Similarity score
3. You can:

   * Edit
   * Approve
   * Reject
4. Only **approved** drafts can be posted

---

## 10. Reddit Posting Flow

1. Approved draft enters queue
2. Serverless function checks rate limits
3. Post submitted via Reddit API
4. Post ID saved
5. Comment & upvote tracking starts

Replies are **manual only**.

---

## 11. Hosting on Vercel (Reality Check)

### What works on Free Tier

* Next.js frontend
* API routes
* Cron (limited)

### What to avoid

* Long‑running background jobs
* High‑frequency posting

Posting frequency here is low → safe.

---

## 12. Security & Account Safety

* Use a **real aged Reddit account**
* Never post identical links
* Warm up account manually
* Use environment variables for API keys

Automation does not protect bad behavior.

---

## 14. What This System Is NOT

* Not a spam bot
* Not a growth hack
* Not anonymous

It is a **personal branding assistant**.

---

## 15. CODING AGENT BUILD INSTRUCTIONS (COPY–PASTE PROMPT)

This section is written **explicitly for a coding agent** (Cursor / Copilot / Claude Code / GPT-4 Code). You give this **as-is** and start building. No interpretation needed.

---

### MASTER BUILD PROMPT (USE THIS)

You are a senior full-stack engineer building a **production-ready Reddit posting assistant**. The goal is to generate **community-specific Reddit posts** from a single idea, without copy-paste, while avoiding bans.

#### HARD CONSTRAINTS

* Reddit only (no LinkedIn, no X)
* Must run on **Vercel free tier**
* Must NOT use n8n
* Must use a **free Postgres database** (Supabase or Neon)
* Must use OpenRouter for LLM access
* Must include human approval before posting
* Must enforce subreddit-specific rules
* Must prevent semantic similarity between posts

If any constraint is violated, stop and correct.

---

### TECH STACK (DO NOT CHANGE)

Frontend:

* Next.js (App Router)

Backend:

* Vercel Serverless Functions

Database:

* Supabase Postgres (preferred)

AI:

* OpenRouter (free models only)

Reddit:

* Official Reddit API

---

### REQUIRED FEATURES (BUILD ALL)

1. UI to create a **Post Idea**
2. UI to manage **Subreddit Profiles** (rules, tone, links allowed)
3. Coding-agent-driven generator that:

   * Reads post idea
   * Reads subreddit profile
   * Generates a unique Reddit-native post
   * Runs self-critique and rewrites if needed
4. Semantic similarity check between drafts
5. Draft approval UI
6. Safe Reddit posting with rate limits
7. Posting history dashboard

---

### DATA MODELS (MUST IMPLEMENT)

Tables:

* subreddits
* post_ideas
* post_drafts
* post_history

Use schemas defined earlier in this document.

---

### AI GENERATION LOGIC (MANDATORY)

For EACH subreddit:

1. Generate post draft
2. Run self-critique prompt:

   * Is this promotional?
   * Does it reuse structure?
   * Does it violate subreddit rules?
3. Rewrite until clean
4. Save similarity score

Do NOT skip critique.

---

### SIMILARITY GUARD

* Embed all drafts for the same idea
* If cosine similarity > 0.75, regenerate
* Store similarity score in DB

---

### POSTING RULES (HARD-CODE)

* Max 1 Reddit post per day total
* Max 1 post per subreddit per 7 days
* No links unless subreddit allows

Block posting if violated.

---

### REDDIT SAFETY RULES

* No automated replies
* No cross-posting
* No identical titles

---

### PROJECT STRUCTURE (FOLLOW EXACTLY)

/app
/page.tsx
/ideas
/subreddits
/drafts
/history

/app/api
/generate
/similarity
/approve
/post

/lib
db.ts
reddit.ts
llm.ts
similarity.ts

---

### BUILD ORDER

1. Database + models
2. CRUD UIs
3. AI generation
4. Similarity check
5. Approval flow
6. Reddit posting
7. Safety checks

---

### DEFINITION OF DONE

* Drafts differ meaningfully across subreddits
* No post is auto-published without approval
* System runs fully on Vercel free tier

Do not simplify. Build exactly as specified.

---

## Final Reality Statement

This prompt is sufficient for a coding agent to build the system end-to-end. If implemented faithfully, the result is **production-usable**, Reddit-safe, and not a toy.
