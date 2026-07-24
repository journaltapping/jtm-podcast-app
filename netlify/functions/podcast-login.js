const bcrypt = require('bcryptjs');

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
    const { email, password } = JSON.parse(event.body || '{}');
    if (!email || !password) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Email and password are required.' }) };
    }

    const emailLower = email.toLowerCase().trim();

    const res = await fetch(
      `${process.env.SUPABASE_URL}/rest/v1/podcast_members?email=eq.${encodeURIComponent(emailLower)}&select=*`,
      {
        headers: {
          apikey: process.env.SUPABASE_ANON_KEY,
          Authorization: `Bearer ${process.env.SUPABASE_ANON_KEY}`,
        },
      }
    );
    const members = await res.json();
    const userData = members[0];

    if (!userData) {
      return { statusCode: 401, headers, body: JSON.stringify({ error: 'No account found with that email address.' }) };
    }

    const match = await bcrypt.compare(password, userData.password_hash);
    if (!match) {
      return { statusCode: 401, headers, body: JSON.stringify({ error: 'Incorrect password. Please try again.' }) };
    }

    if (userData.status !== 'active') {
      return { statusCode: 403, headers, body: JSON.stringify({ error: 'Your membership is not active.' }) };
    }

    const token = Buffer.from(JSON.stringify({
      email: userData.email,
      name: userData.name,
      loginTime: Date.now(),
    })).toString('base64');

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ ok: true, token, email: userData.email, name: userData.name }),
    };
  } catch (err) {
    console.error('Podcast login error:', err.message);
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Login failed. Please try again.' }) };
  }
};
