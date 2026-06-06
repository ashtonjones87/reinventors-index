# Reinventor Suite — Handover Document

**Prepared by:** Utkarsh Dubey
**For:** Ashton Jones
**Scope:** Reinventor's Mindset Index, Owner's Index, Retirement Index

Everything you need to maintain, update, or hand off this project to another developer.

---

## 1. The three products at a glance

| Product | Domain | What it is | Auth? | DB writes? |
|---|---|---|---|---|
| **Reinventor's Mindset Index** | reinventor.ai | Full coaching app — 16-question diagnostic + AI chat | Yes (Clerk Project A) | Yes |
| **Owner's Index** | ownerindex.ai | Same UI, business-dependency questions, Owner's Playbook coaching | Yes (Clerk Project B) | Yes |
| **Retirement Index** | retirementindex.ai *(once domain is purchased)* | Marketing landing page only — CTA sends visitors to reinventor.ai | No | No |

All three serve from one GitHub repo with three Vercel deployments.

---

## 2. Services + accounts

| Service | What it does | Login |
|---|---|---|
| **GitHub** | The code | `github.com/ashtonjones87/reinventors-index` |
| **Vercel** | Hosts the three sites (one project per domain) | vercel.com |
| **Clerk** | Sign-in / sign-up — two separate projects (Mindset + Owner's) | dashboard.clerk.com |
| **Supabase** | One shared database for both auth-using products | supabase.com |
| **Anthropic** | AI brain (Claude) — one account used by both chat apps | console.anthropic.com |
| **Namecheap** | Domain registrar (where domains are bought) | namecheap.com |

---

## 3. How the codebase decides which product to show

One repo, three Vercel projects, all pointing at the same code. Restaurant analogy:

- **One kitchen** = the GitHub repo (one code base for everything)
- **Three storefronts** = three Vercel projects, one per domain
- **The host at the door** = `proxy.ts` — reads the domain in the visitor's URL and stamps the request: "owner", "retirement", or "default (mindset)"
- Every page below reads that stamp and decides what to render

Each Vercel project also has its own **environment variables** (the Clerk keys for that domain, the site name, the favicon path). That is the only thing different between the three deployments.

---

## 4. Where do I edit it? Master lookup tables

### 4a. Wording / content changes — Reinventor's Mindset

| You want to change… | Edit this file |
|---|---|
| The 16 diagnostic questions | `lib/diagnostic.ts` → `DIAGNOSTIC_STATEMENTS` |
| Dimension intros before each block of 4 questions | `lib/diagnostic.ts` → `DIMENSION_FRAMINGS` |
| How the AI talks (system prompt) | `lib/prompts/base.ts` + `lib/prompts/overlays/unified.ts` |
| Pre-diagnostic chat welcome ("You're here because…") | `components/ChatWindow.tsx` — search `You're here because` |
| Post-diagnostic chat welcome ("What are you wrestling with?") | `components/ChatWindow.tsx` — search `wrestling with` |
| Privacy policy | `app/privacy/page.tsx` |
| Sign-up consent text / page layout | `app/(auth)/sign-up/[[...sign-up]]/page.tsx` |
| Sign-in page | `app/(auth)/sign-in/[[...sign-in]]/page.tsx` |
| Browser tab title ("The Reinventor's Mindset™ Index") | Vercel env var `NEXT_PUBLIC_SITE_NAME` |
| Favicon | env var `NEXT_PUBLIC_FAVICON` + image file in `public/` |

### 4b. Wording / content changes — Owner's Index

| You want to change… | Edit this file |
|---|---|
| The 16 diagnostic questions | `lib/diagnostic.ts` → `OWNER_DIAGNOSTIC_STATEMENTS` |
| Dimension intros before each block of 4 questions | `lib/diagnostic.ts` → `OWNER_DIMENSION_FRAMINGS` |
| Owner's Playbook system prompt / pillars | `lib/prompts/overlays/owner-operator.ts` |
| Privacy policy | `app/owner-privacy/page.tsx` |
| Sign-up framing ("How dependent is your business on you?") | `app/(auth)/sign-up/[[...sign-up]]/page.tsx` |
| Browser tab title ("The Owner's Index") | env var `NEXT_PUBLIC_SITE_NAME` on the Owner's Vercel project |
| Favicon | env var `NEXT_PUBLIC_FAVICON` + image file in `public/` |

### 4c. Wording / content changes — Retirement Index

| You want to change… | Edit this file |
|---|---|
| Hook headline, subhead, CTAs, button labels | `components/RetirementLanding.tsx` |
| Background image | `public/retirement-index.jpeg` |
| Tab title ("Retirement Index") | `app/page.tsx` → `generateMetadata` |
| Where the CTA links to | `components/RetirementLanding.tsx` (currently → reinventor.ai) |

### 4d. Scoring / logic — Reinventor's Mindset

| You want to change… | Edit this file |
|---|---|
| Adaptive Range Score formula | `lib/diagnostic.ts` → `scoreResponses` |
| Pole pairings per dimension (intuitive/analytical etc) | `lib/diagnostic.ts` → `scoreResponses` |
| How the AI is told about the user's scores | `lib/prompts/assembler.ts` → `formatRadarContext` |

### 4e. Scoring / logic — Owner's Index

| You want to change… | Edit this file |
|---|---|
| Owner's Index scoring formula | **Two files that MUST match:** `lib/diagnostic.ts` → `scoreOwnerResponses` (saves the math) **and** `lib/ownerIndex.ts` → `computeOwnerScores` (display + chat reads it back) |
| Founder Dependency Score / Watermark Strength formula | Same two files above |
| Band thresholds (Low / Moderate / High) | `lib/ownerIndex.ts` (the if-statements at the top) |
| Band colours (teal / amber / red) | `components/FounderDependencyMap.tsx` |
| Per-band narrative copy in "What does this mean?" | `components/OwnerScoreModal.tsx` |
| How the AI is told about the user's scores | `lib/prompts/assembler.ts` → `formatOwnerIndexContext` (shared with display via `computeOwnerScores`) |

### 4f. Scoring / logic — Shared (both products)

| You want to change… | Edit this file |
|---|---|
| Daily chat message cap (rate limit) | Vercel env var `CHAT_DAILY_LIMIT` (default 200) |
| Hard maximum messages per request / payload size | `app/api/chat/route.ts` → `MAX_MESSAGES`, `MAX_TOTAL_CHARS` |
| Domain → product routing | `proxy.ts` |
| Pre-diagnostic transition delay before diagnostic appears | `components/ChatWindow.tsx` → the `5000` ms value |
| "Back" button in the diagnostic | `components/DiagnosticFlow.tsx` |

### 4g. Display / styling — Reinventor's Mindset

| You want to change… | Edit this file |
|---|---|
| Brand header on chat page ("THE REINVENTOR'S MINDSET™ / Index") | `components/CompanionClient.tsx` — search `Reinventor's Mindset` |
| Mindset radar chart (the 8-pole spider) | `components/RadarChart.tsx` (rendered inside `RADAR OVERLAY` block of `CompanionClient.tsx`) |
| "Adaptive Range Score" card (post-diagnostic) | `components/CompanionClient.tsx` — search `Adaptive Range Score` |
| Loading screen ("Mapping your mindset…") | `components/DiagnosticFlow.tsx` |

### 4h. Display / styling — Owner's Index

| You want to change… | Edit this file |
|---|---|
| Brand header on chat page ("THE OWNER'S / Index") | `components/CompanionClient.tsx` — search `Owner's` |
| Founder Dependency Map (5 dimension cards) | `components/FounderDependencyMap.tsx` |
| "Founder Dependency Score" + "Watermark Strength" headline cards | `components/FounderDependencyMap.tsx` (subtext helpers `fdsSubtext`, `watermarkSubtext`) |
| "What does this mean?" decoded modal | `components/OwnerScoreModal.tsx` |
| Loading screen ("Mapping your dependencies…") | `components/DiagnosticFlow.tsx` |

### 4i. Display / styling — Shared (both products)

| You want to change… | Edit this file |
|---|---|
| Chat input bar + Send button | `components/ChatWindow.tsx` |
| Chat message bubbles | `components/MessageBubble.tsx` |
| Diagnostic question UI (statement card + 1-5 buttons + Back) | `components/DiagnosticFlow.tsx` |
| Action plans dropdown / modal | `components/ActionPlansDropdown.tsx` |
| Action plan PDF download (layout + footer) | `lib/actionPlanUtils.ts` |
| Save Action Plan / End Session controls | `components/SessionEndControls.tsx` |
| Global colours, fonts, page background | `app/layout.tsx` + `app/globals.css` |
| Loading screen "Index" splash | `app/home/loading.tsx` |

### 4j. Database / API — Shared

| You want to change… | Where |
|---|---|
| All database read/write code | `lib/supabase/queries.ts` |
| Chat with Claude (sends messages, enforces rate limit) | `app/api/chat/route.ts` |
| Submitting 16 diagnostic answers (scoring + save) | `app/api/diagnostic/route.ts` |
| Ending a chat session (creates summary + action plan) | `app/api/session-summary/route.ts` |
| Clerk webhook (creates Supabase user row on sign-up) | `app/api/webhooks/clerk/route.ts` |
| Action plans GET (fetches a user's saved plans) | `app/api/action-plans/route.ts` |

---

## 5. The Supabase database

One database shared by both auth-using products. Every row has a `product` column so you know which product it came from.

| Table | What's in it | `product` values |
|---|---|---|
| `users` | One row per Clerk user (email, name, created/deleted) | `reinventor`, `owner`, `owner-ironcove` |
| `diagnostics` | One row per completed 16-question diagnostic | same |
| `session_summaries` | One row per ended chat session (transcript + AI summary) | same |
| `action_plans` | Saved action plans, max 3 per user (oldest auto-deletes) | same |
| `chat_usage` | One row per user per day (`message_count`) — used by rate limit | same |

### Quick analytics queries

```sql
-- All Mindset users
SELECT * FROM users WHERE product = 'reinventor';

-- All Owner's Index users (includes ironcove referrals)
SELECT * FROM users WHERE product LIKE 'owner%';

-- Today's chat volume per product
SELECT product, SUM(message_count) FROM chat_usage
WHERE window_start >= CURRENT_DATE
GROUP BY product;
```

---

## 6. Per-Vercel-project quick reference

| Vercel project name | Domain | Clerk project | Required env vars |
|---|---|---|---|
| `reinventors-mindset-companion` | reinventor.ai | "Reinventor's Mindset" | Mindset Clerk keys + Supabase + Anthropic |
| `owner-index` | ownerindex.ai | "The Owner's Index" | Owner Clerk keys + Supabase + Anthropic + `NEXT_PUBLIC_SITE_NAME=The Owner's Index` + `NEXT_PUBLIC_FAVICON=/owner-icon.png` |
| `retirement-index` *(to create)* | retirementindex.ai | none | none strictly required — set `NEXT_PUBLIC_SITE_NAME=Retirement Index` if desired |

### Full env var checklist (for the auth-using projects)

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY    Clerk dashboard for that project
CLERK_SECRET_KEY                     Clerk dashboard for that project
CLERK_WEBHOOK_SECRET                 Clerk Webhooks page for that project
NEXT_PUBLIC_SUPABASE_URL             Same across all (from Supabase)
NEXT_PUBLIC_SUPABASE_ANON_KEY        Same across all
SUPABASE_SERVICE_ROLE_KEY            Same across all
ANTHROPIC_API_KEY                    Same across all
CRON_SECRET                          Any strong random string
NEXT_PUBLIC_SITE_NAME                Tab title for that domain
NEXT_PUBLIC_FAVICON                  Favicon path (e.g. /owner-icon.png)
CHAT_DAILY_LIMIT                     Optional, default 200
```

---

## 7. Safe-change workflow

For non-text changes, never edit directly in GitHub:

1. Developer makes the change on a branch and opens a **Pull Request**
2. Vercel automatically creates a **preview deployment** with a URL like `xyz.vercel.app` — open it, click around, verify
3. When happy → merge the PR → auto-deploys to all relevant production domains within ~60 seconds

For tiny text-only tweaks (typos, copy edits), you *can* edit straight in GitHub:

- Find the file (use the lookup tables above)
- Click the pencil icon
- Commit to `main`
- Vercel redeploys in ~60s
- Refresh the website

**Files you should never touch:** `package.json`, `package-lock.json`, anything in `lib/supabase/`, `proxy.ts`, `.env` files. These are wiring — wrong character and everything breaks.

---

## 8. "Something broke" emergency runbook

**Site down or showing an error:**

1. Vercel → the affected project → **Deployments** tab
2. Find the last green (successful) deployment above the broken one
3. Click its `···` menu → **Promote to Production**
4. Site rolls back within seconds
5. Tell a developer what change went live and roughly when

**Sign-in broken on one domain:**

99% chance the Clerk env vars on that Vercel project got swapped or deleted. Compare against Clerk dashboard → API Keys for that specific project.

**Data missing from Supabase:**

- Check Supabase → Table Editor first (might be a query bug, not lost data)
- If genuinely lost → Supabase Settings → Database → Backups → Restore

---


---

## 9. Things to mostly ignore

- `lib/prompts/summary.ts` — generates session JSON summary at end of chat
- `lib/prompts/assembler.ts` — assembles the system prompt sent to Claude
- `app/api/ping/route.ts` — automated keep-alive cron
- `app/api/purge-deleted/route.ts` — 30-day account deletion cron
- `lib/claude.ts` — connects to the Claude AI
- `lib/supabase/server.ts` — connects to the database
- `app/home/loading.tsx` — splash screen between page loads

Do not edit these without a developer planning the change.

---

## TL;DR

One GitHub repo. Three Vercel deployments share it. `proxy.ts` sniffs the domain and stamps every request. Pages read the stamp to decide what to render. The env-vars on each Vercel project supply the rest of each domain's identity (Clerk keys, site name, favicon). The database is shared with a `product` column to separate the two paying products. Need to change wording → use Section 4's lookup tables. Need to roll back → Vercel Deployments → Promote previous deployment.
