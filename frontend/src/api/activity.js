/**
 * Activity Ledger API service.
 */
import api from './client.js';

export async function getMetrics() {
  return api.get('/activity/metrics');
}

export async function getEvents(params = {}) {
  const query = new URLSearchParams();
  if (params.page) query.set('page', params.page);
  if (params.per_page) query.set('per_page', params.per_page);
  if (params.date_from) query.set('date_from', params.date_from);
  if (params.date_to) query.set('date_to', params.date_to);
  if (params.mode) query.set('mode', params.mode);
  if (params.impact_min !== undefined && params.impact_min !== null) {
    query.set('impact_min', params.impact_min);
  }
  if (params.sort_by) query.set('sort_by', params.sort_by);
  if (params.sort_order) query.set('sort_order', params.sort_order);

  const qs = query.toString();
  return api.get(`/activity/events${qs ? `?${qs}` : ''}`);
}

export async function createEvent(eventData) {
  return api.post('/activity/events', eventData);
}

export async function updateEvent(id, eventData) {
  return api.put(`/activity/events/${id}`, eventData);
}

export async function deleteEvent(id) {
  return api.delete(`/activity/events/${id}`);
}
