// Global fetch wrapper that automatically adds auth headers for API calls
// This file must be imported FIRST in main.tsx to patch global fetch

const API_URL = (import.meta.env.VITE_API_URL || 'https://speech.vileen.pl').replace(/\/$/, '');

function getPassword(): string {
  return localStorage.getItem('speech_practice_password') || '';
}

// Check if URL is our API endpoint
function isApiUrl(url: string): boolean {
  return url.includes('/api/') || url.startsWith(API_URL);
}

// Store original fetch
const originalFetch = window.fetch;

// Patch global fetch
window.fetch = async function(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  const url = input.toString();
  
  // Only add auth headers for API calls
  if (isApiUrl(url)) {
    const password = getPassword();
    
    // Merge headers
    const newInit: RequestInit = {
      ...init,
      headers: {
        ...(init?.headers || {}),
        'x-password': password,
      },
    };
    
    return originalFetch(input, newInit);
  }
  
  // Non-API calls use original fetch
  return originalFetch(input, init);
};

console.log('🔐 API auth interceptor installed');
