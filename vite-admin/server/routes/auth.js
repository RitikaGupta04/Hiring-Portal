import express from 'express';
import supabase from '../config/db.js';

const router = express.Router();

// POST /api/auth/register
// Creates a user with email confirmed immediately (no email confirmation flow)
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password } = req.body || {};
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Missing required fields: name, email, password' });
    }

    // Create user via Admin API with email_confirm=true to skip confirmation
    const { data: createData, error: createError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: name, phone }
    });

    if (createError) {
      // Handle typical conflict (email already registered)
      const status = createError.status || 400;
      return res.status(status).json({ error: createError.message || 'Failed to create user' });
    }

    const user = createData?.user;
    if (!user) {
      return res.status(500).json({ error: 'User not returned from admin.createUser' });
    }

    // Insert profile row
    const { error: profileError } = await supabase.from('profiles').insert({
      id: user.id,
      full_name: name,
      phone
    });
    if (profileError) {
      return res.status(500).json({ error: profileError.message || 'Failed to create profile' });
    }

    return res.status(201).json({ user: { id: user.id, email: user.email } });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Unexpected server error' });
  }
});

export default router;
