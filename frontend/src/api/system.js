/**
 * System Status API service.
 */
import api from './client.js';

export async function getSystemStatus() {
  return api.get('/system');
}

export async function getSubsystems() {
  return api.get('/system/subsystems');
}

export async function getEndpoints() {
  return api.get('/system/endpoints');
}

export async function getPreferences() {
  return api.get('/system/preferences');
}

export async function updatePreferences(prefs) {
  return api.put('/system/preferences', prefs);
}

export async function getLogs() {
  return api.get('/system/logs');
}
