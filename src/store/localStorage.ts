// ============================================================
// localStorage Persistence
// ============================================================

import type { AppState } from './types';

const STORAGE_KEY = 'cyberpulse_state_v1';

export function saveState(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('CyberPulse: Failed to save state to localStorage', e);
  }
}

export function loadState(): AppState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AppState;
  } catch (e) {
    console.warn('CyberPulse: Failed to load state from localStorage', e);
    return null;
  }
}

export function clearState(): void {
  localStorage.removeItem(STORAGE_KEY);
}
