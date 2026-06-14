/**
 * Dashboard API service.
 */
import api from './client.js';

export async function getDashboard() {
  return api.get('/dashboard');
}
