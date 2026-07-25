# JTM Private Podcast Web App — Setup Guide

## 1. Database (do this first)
Open your **existing JTM Supabase project** → SQL Editor → paste and run everything in `schema.sql`.
This creates 4 new tables (`podcast_members`, `podcast_courses`, `podcast_episodes`, `podcast_progress`) —
completely separate from Nova's `members` table, so the two subscriptions never mix.

The SQL also inserts one sample course (The JTM Challenge, 3 modules) so the app has something to
show straight away. Audio URLs are left blank — you'll fill those in once episodes are recorded.

## 2. Adding a member manually (until Skool automation is set up)
Since accounts aren't automated yet, add someone by hand:
1. Generate a bcrypt hash for their password (any online bcrypt generator, or ask me and I'll generate one)
2. In Supabase → Table Editor → `podcast_members` → insert a row: `email`, `name`, `password_hash`, `status: active`

## 3. Deploy
Same drag-and-drop workflow as your other JTM sites:
1. Drag all these files into your GitHub repo (keep the `netlify/functions` folder structure intact)
2. Netlify auto-deploys
3. In Netlify → Site settings → Environment variables, make sure these are set (same values as your
   other JTM Netlify site uses):
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`

## 4. Adding real episodes later
Audio is hosted on **Cloudflare R2** (free, no bandwidth charges), not Supabase or GitHub.

- Bucket: `jtm-podcast-audio`
- Public base URL: `https://pub-e6016fb3e7ac4f34bc87edaa8a532265.r2.dev`

Once an episode is recorded:
1. Go to the `jtm-podcast-audio` bucket in Cloudflare → **Upload**
2. Click the uploaded file to get its full public link (base URL + filename, e.g.
   `https://pub-e6016fb3e7ac4f34bc87edaa8a532265.r2.dev/module-1.mp3`)
3. In Supabase → `podcast_episodes` table, paste that link into that row's `audio_url` column
4. No rebuild or redeploy needed — the app reads courses fresh every time someone logs in

Note: this is currently the free "Public Development URL" (rate-limited, fine for testing and
early members). Once there's real regular listener traffic, switch the bucket to a custom domain
(e.g. `audio.thejournaltappingmethod.co.uk`) in R2 settings — same process, just a nicer/more
reliable URL, and everything already in `audio_url` would need updating to match.

## 5. Adding a whole new course
Insert a new row into `podcast_courses`, then insert its modules into `podcast_episodes` with
matching `course_id`. It'll show up in the sidebar automatically.

## What's NOT built yet (on purpose, per your answers)
- Skool → Supabase automation (Zapier/webhook) — flagged for later, so members are added manually for now
- Payment/checkout — not needed, since access comes via Skool membership, not a separate purchase

## Ongoing: adding a new episode to an existing course
No code changes ever needed - just two steps:
1. Upload the audio file to the `jtm-podcast-audio` R2 bucket → copy its public link
2. Supabase → Table Editor → `podcast_episodes` → **Insert row**:
   - `id`: unique code, e.g. `jtm-signature-method-04`
   - `course_id`: must exactly match the course it belongs to, e.g. `jtm-signature-method`
   - `title`: the real module name members will see
   - `module_number`: `4`, `5`, `6`... (controls play order)
   - `audio_url`: paste the R2 link
   - `duration_seconds`: optional, can leave blank

Refresh the app afterward - it reads courses fresh every time someone logs in.

## Ongoing: adding a whole new course
1. Design/upload a thumbnail (square, used in sidebar + home cards) and optionally a
   banner (wide image, used on the course's own page - falls back to a plain style if left blank)
   to the R2 bucket
2. Supabase → `podcast_courses` → **Insert row**:
   - `id`: unique code, e.g. `nervous-system-lens`
   - `title`, `description`
   - `thumbnail_url`: the square cover image link
   - `banner_url`: the wide banner image link (optional)
   - `sort_order`: `2`, `3`... (controls order shown)
3. Add its episodes the same way as above, using this course's `id` as the `course_id`

## Renaming a course or episode ID later
Titles are safe to edit directly in Table Editor any time. IDs are different - they're
referenced by other tables (episodes reference their course's id, progress records
reference episode ids), so renaming an id needs a small SQL script rather than a plain
cell edit, or it'll error. Ask me for one whenever you need it - it's a quick, safe script
each time.
