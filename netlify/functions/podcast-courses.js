exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };

  try {
    const email = (event.queryStringParameters && event.queryStringParameters.email || '').toLowerCase().trim();
    if (!email) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing email.' }) };
    }

    const sbHeaders = {
      apikey: process.env.SUPABASE_ANON_KEY,
      Authorization: `Bearer ${process.env.SUPABASE_ANON_KEY}`,
    };

    const [coursesRes, episodesRes, progressRes] = await Promise.all([
      fetch(`${process.env.SUPABASE_URL}/rest/v1/podcast_courses?select=*&order=sort_order.asc`, { headers: sbHeaders }),
      fetch(`${process.env.SUPABASE_URL}/rest/v1/podcast_episodes?select=*&order=sort_order.asc`, { headers: sbHeaders }),
      fetch(`${process.env.SUPABASE_URL}/rest/v1/podcast_progress?email=eq.${encodeURIComponent(email)}&select=*`, { headers: sbHeaders }),
    ]);

    const courses = await coursesRes.json();
    const episodes = await episodesRes.json();
    const progress = await progressRes.json();

    const progressByEpisode = {};
    progress.forEach(p => { progressByEpisode[p.episode_id] = p; });

    const coursesWithEpisodes = courses.map(course => ({
      ...course,
      episodes: episodes
        .filter(ep => ep.course_id === course.id)
        .map(ep => ({ ...ep, progress: progressByEpisode[ep.id] || null })),
    }));

    return { statusCode: 200, headers, body: JSON.stringify({ ok: true, courses: coursesWithEpisodes }) };
  } catch (err) {
    console.error('Podcast courses error:', err.message);
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Could not load courses.' }) };
  }
};
