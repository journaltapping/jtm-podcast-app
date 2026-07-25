-- Run this in Supabase SQL Editor (adds to what's already there, doesn't touch existing data)

ALTER TABLE podcast_courses ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;

-- Optional: give your existing sample course a placeholder so you can see it working
-- (replace with a real uploaded image URL once you have one)
UPDATE podcast_courses
SET thumbnail_url = 'https://pub-e6016fb3e7ac4f34bc87edaa8a532265.r2.dev/jtm-challenge-cover.jpg'
WHERE id = 'jtm-challenge';
