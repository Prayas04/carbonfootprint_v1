/**
 * Insights API service.
 */
import api from './client.js'

export async function getInsights() {
  return api.get('/insights')
}
