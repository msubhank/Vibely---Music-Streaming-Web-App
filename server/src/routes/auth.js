import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { supabaseAdmin } from '../supabase.js';

const router = Router();

/**
 * GET /api/auth/me
 * Returns current authenticated user and profile
 */
router.get('/me', requireAuth, async (req, res) => {
  try {
    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', req.user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Failed to load profile:', error);
      return res.status(500).json({ error: 'Failed to retrieve user profile' });
    }

    res.json({
      user: {
        id: req.user.id,
        email: req.user.email,
        created_at: req.user.created_at,
      },
      profile: profile || null,
    });
  } catch (err) {
    console.error('Auth /me error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * PUT /api/auth/profile
 * Updates user profile (display_name, bio, avatar_url)
 */
router.put('/profile', requireAuth, async (req, res) => {
  const { display_name, bio, avatar_url } = req.body;

  try {
    const updates = {
      updated_at: new Date().toISOString(),
    };
    if (display_name !== undefined) updates.display_name = display_name;
    if (bio !== undefined) updates.bio = bio;
    if (avatar_url !== undefined) updates.avatar_url = avatar_url;

    const { data: updatedProfile, error } = await supabaseAdmin
      .from('profiles')
      .update(updates)
      .eq('id', req.user.id)
      .select()
      .single();

    if (error) {
      console.error('Failed to update profile:', error);
      return res.status(400).json({ error: error.message });
    }

    res.json({ profile: updatedProfile });
  } catch (err) {
    console.error('Auth update profile error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

