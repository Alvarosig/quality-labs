// Shared config for all test layers (e2e, api, bdd)
// Uses env vars with fallback defaults — same source of truth as playwright.config.ts

export const BASE_URL = process.env.BASE_URL || 'https://conduit.bondaracademy.com';
export const API_URL = process.env.API_URL || 'https://conduit-api.bondaracademy.com';
