/**
 * Wallet API service.
 */
import api from './client.js';

export async function getWallet() {
  return api.get('/wallet');
}

export async function getTransactions() {
  return api.get('/wallet/transactions');
}

export async function createTransaction(txData) {
  return api.post('/wallet/transactions', txData);
}

export async function getBurnRate() {
  return api.get('/wallet/burn-rate');
}

export async function getGreenNodes() {
  return api.get('/wallet/green-nodes');
}
