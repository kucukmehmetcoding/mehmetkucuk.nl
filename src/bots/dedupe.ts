import crypto from 'crypto';

/**
 * Custom SimHash implementation for text similarity detection
 * Works with Node.js 22+ (no external dependencies)
 */
class SimHash {
  private hashBits: number = 64;

  /**
   * Generate a simhash for the given text
   */
  hash(text: string): string {
    if (!text || text.trim().length === 0) {
      return '0'.repeat(16); // Return zero hash for empty text
    }

    // Tokenize text into words/features
    const tokens = this.tokenize(text);
    if (tokens.length === 0) {
      return '0'.repeat(16);
    }

    // Initialize vector for bit counting
    const vector: number[] = new Array(this.hashBits).fill(0);

    // For each token, compute its hash and update vector
    for (const token of tokens) {
      const tokenHash = this.hashToken(token);
      for (let i = 0; i < this.hashBits; i++) {
        const bit = (tokenHash >> BigInt(this.hashBits - 1 - i)) & BigInt(1);
        vector[i] += bit === BigInt(1) ? 1 : -1;
      }
    }

    // Convert vector to hash
    let hash = BigInt(0);
    for (let i = 0; i < this.hashBits; i++) {
      if (vector[i] > 0) {
        hash |= BigInt(1) << BigInt(this.hashBits - 1 - i);
      }
    }

    return hash.toString(16).padStart(16, '0');
  }

  /**
   * Tokenize text into words
   */
  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2);
  }

  /**
   * Hash a single token to 64-bit value
   */
  private hashToken(token: string): bigint {
    const hash = crypto.createHash('md5').update(token).digest('hex');
    return BigInt('0x' + hash.slice(0, 16));
  }
}

const simhash = new SimHash();

export function computeFingerprint(title: string, site: string, publishedAt?: Date | string) {
  return crypto.createHash('sha256').update(`${title}|${site}|${publishedAt ?? ''}`).digest('hex');
}

export function computeSimHash(text: string): string {
  return simhash.hash(text);
}

export function hammingDistance(a: string, b: string) {
  let distance = 0;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) distance++;
  }
  return distance;
}

export function looksDuplicate(existingHashes: string[], candidate: string, threshold = 3) {
  return existingHashes.some((hash) => hammingDistance(hash, candidate) <= threshold);
}
