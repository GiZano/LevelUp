import * as Crypto from 'expo-crypto';

/** Genera un UUID v4 usando expo-crypto */
export function generateId(): string {
  return Crypto.randomUUID();
}
