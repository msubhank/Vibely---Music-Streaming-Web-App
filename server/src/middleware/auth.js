import { supabaseAdmin } from '../supabase.js';

export const requireAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or malformed Authorization header' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid or expired session token' });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('Authentication verification error:', err);
    return res.status(500).json({ error: 'Failed to authenticate user' });
  }
};

