-- Run this in Supabase -> SQL Editor (in your existing JTM Supabase project,
-- so you don't need a 3rd/4th free project). These are separate from your
-- Nova "members" table on purpose - this is a separate subscription.

CREATE TABLE podcast_members (
  email TEXT PRIMARY KEY,
  name TEXT,
  password_hash TEXT,
  status TEXT DEFAULT 'active',   -- 'active' or 'inactive'
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE podcast_courses (
  id TEXT PRIMARY KEY,            -- e.g. 'jtm-challenge'
  title TEXT NOT NULL,
  description TEXT,
  sort_order INT DEFAULT 0
);

CREATE TABLE podcast_episodes (
  id TEXT PRIMARY KEY,            -- e.g. 'jtm-challenge-01'
  course_id TEXT REFERENCES podcast_courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  module_number INT NOT NULL,
  audio_url TEXT,                 -- fill in once episodes are recorded
  duration_seconds INT DEFAULT 0,
  sort_order INT DEFAULT 0
);

CREATE TABLE podcast_progress (
  email TEXT REFERENCES podcast_members(email) ON DELETE CASCADE,
  episode_id TEXT REFERENCES podcast_episodes(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT false,
  position_seconds INT DEFAULT 0,
  updated_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (email, episode_id)
);

-- Sample course + modules so the app has something to show immediately.
-- Swap audio_url for real files once recorded (upload to Supabase Storage
-- or anywhere public, then update these rows - no rebuild needed).
INSERT INTO podcast_courses (id, title, description, sort_order) VALUES
('jtm-challenge', 'The JTM Challenge', 'A 14-day introduction to journal tapping for anxious children.', 1);

INSERT INTO podcast_episodes (id, course_id, title, module_number, audio_url, duration_seconds, sort_order) VALUES
('jtm-challenge-01', 'jtm-challenge', 'Welcome & How This Works', 1, NULL, 0, 1),
('jtm-challenge-02', 'jtm-challenge', 'Understanding the Nervous System', 2, NULL, 0, 2),
('jtm-challenge-03', 'jtm-challenge', 'Your First Tapping Session', 3, NULL, 0, 3);
