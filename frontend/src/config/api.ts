// Shared API configuration
// CRITICAL: This is the SINGLE SOURCE OF TRUTH for API URL
// All components must import and use this constant

const PRODUCTION_URL = 'https://speech.vileen.pl';

// Build-time env var (from .env.production or .env.local)
const envUrl = import.meta.env.VITE_API_URL;

// Runtime validation - cannot be empty/undefined
export const API_URL = (envUrl || PRODUCTION_URL).replace(/\/$/, '');

// Validation - throw early if misconfigured
if (!API_URL || API_URL === 'https://your-api-url.com') {
  console.error('❌ API_URL is not configured properly!');
  console.error('   Current value:', API_URL);
  console.error('   Check .env.production has correct VITE_API_URL');
}

// Log for debugging (remove in production if needed)
console.log('🔌 API_URL configured:', API_URL);

export const getPassword = () => localStorage.getItem('speech_practice_password') || '';

// NOTE: Global fetch interceptor in lib/api-interceptor.ts automatically adds x-password header
// This authFetch is kept for backward compatibility but is no longer necessary
export const authFetch = (url: string, options: RequestInit = {}) => {
  return fetch(url, options);
};
