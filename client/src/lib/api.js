// Base URL of the Obsidian Circuit API (server/). Override with REACT_APP_API_URL.
export const API_URL = (process.env.REACT_APP_API_URL || 'http://localhost:1000').replace(/\/+$/, '');
