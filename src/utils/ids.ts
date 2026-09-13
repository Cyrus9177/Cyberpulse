import { nanoid } from 'nanoid';

/**
 * Generate a random unique ID.
 */
export function generateId(): string {
  return nanoid(12);
}

/**
 * Generate a transaction display ID like TX-00125.
 */
export function generateTransactionId(counter: number): string {
  return `TX-${String(counter).padStart(5, '0')}`;
}

/**
 * Generate a session display ID like S-1042.
 */
export function generateSessionId(counter: number): string {
  return `S-${String(counter).padStart(4, '0')}`;
}
