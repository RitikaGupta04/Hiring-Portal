// Centralized API base URL for frontend -> backend requests
// Set VITE_API_BASE_URL in Vercel/Env for production backend URL (e.g., https://your-api.onrender.com)
export const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
