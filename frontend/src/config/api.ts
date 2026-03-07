// Shared API configuration
export const API_URL = (import.meta.env.VITE_API_URL || 'https://trunk-sticks-connect-currency.trycloudflare.com').replace(/\/$/, '');

export const getPassword = () => localStorage.getItem('speech_practice_password') || '';
