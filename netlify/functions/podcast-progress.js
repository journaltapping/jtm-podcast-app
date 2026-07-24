exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const { email, episode_id, position_seconds, completed } = JSON.parse(event.body || '{}');
    if (!email || !episode_id) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing email or episode_id.' }) };
    }

    const res = await fetch(`${process.env.SUPABASE_URL}/rest/v1/podcast_progress`, {
      method: 'POST',
      headers: {
        apikey: process.env.SUPABASE_ANON_KEY,
        Authorization: `Bearer ${process.env.SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'resolution=merge-duplicates',
      },
      body: JSON.stringify({
        email: email.toLowerCase().trim(),
        episode_id,
        position_seconds: position_seconds || 0,
        completed: !!completed,
        updated_at: new Date().toISOString(),
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(JSON.stringify(err));
    }

    return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
  } catch (err) {
    console.error('Podcast progress error:', err.message);
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Could not save progress.' }) };
  }
};
