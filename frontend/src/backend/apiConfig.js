// Single source of truth for the backend's base URL. Previously this was
// hardcoded as https://eventx-backend-u79p.onrender.com in every one of the
// four service files below, which meant the frontend could never be pointed
// at a local backend without manually editing each file.
export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const API = (path) => `${API_BASE_URL}${path}`;
