import { supabase } from '../../lib/supabase-client';
import { API_BASE } from './config';

// Register a new user with retry logic
export async function registerUser({ name, email, phone, password }, retryCount = 0) {
  const MAX_RETRIES = 2;
  const TIMEOUT = 60000; // 60 seconds
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);
    
    const res = await fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, phone, password }),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Registration failed (HTTP ${res.status})`);
    }
    
    const data = await res.json();
    return data.user;
  } catch (err) {
    // Retry on network errors or timeouts
    if ((err.name === 'AbortError' || err.message.includes('fetch')) && retryCount < MAX_RETRIES) {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2s before retry
      return registerUser({ name, email, phone, password }, retryCount + 1);
    }
    
    if (err.name === 'AbortError') {
      throw new Error('Connection timeout. Please check your internet and try again.');
    }
    throw err;
  }
}

// Login with email or phone and password
export async function loginUser({ username, password }) {
  let emailToUse = username;
  // If not an email, treat as phone number and look up email
  if (!/^[^@]+@[^@]+\.[^@]+$/.test(username)) {
    // Look up email by phone
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('phone', username)
      .single();
    if (error || !data?.id) throw new Error('Phone number not found');
    // Now get the user's email from auth.users
    const { data: userData, error: userError } = await supabase
      .from('auth.users')
      .select('email')
      .eq('id', data.id)
      .single();
    if (userError || !userData?.email) throw new Error('User email not found');
    emailToUse = userData.email;
  }
  // Now login with email and password
  const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
    email: emailToUse,
    password
  });
  if (loginError) throw loginError;
  return loginData.user;
}

// Fetch user profile by user ID
export async function getUserProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error) throw error;
  return data;
} 