/**
 * Crypto utility that works in both development and production environments
 */

/**
 * Creates a secure hash using SHA-256
 * 
 * @param input The string to hash
 * @returns A SHA-256 hash as hex string
 */
export async function createSecureHash(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
} 