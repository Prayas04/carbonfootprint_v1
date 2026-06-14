/**
 * Auth API service — login, register, and user profile.
 */
import api, { setTokens, clearTokens } from './client.js';

export async function login(email, password) {
  const data = await api.post('/auth/login', { email, password });
  setTokens(data.access_token, data.refresh_token);
  return data;
}

export async function register(email, password, fullName) {
  const data = await api.post('/auth/register', {
    email,
    password,
    full_name: fullName,
  });
  return data;
}

export async function getMe() {
  return api.get('/auth/me');
}

export function logout() {
  clearTokens();
}
