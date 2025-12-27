/**
 * DNS-based disposable email detection
 * Uses MX record analysis to identify disposable email providers
 * Complements domain list approach for unknown domains
 */

import { promises as dns } from 'dns';

/**
 * Known disposable email MX server patterns
 * Many disposable email services share the same MX servers
 */
const DISPOSABLE_MX_PATTERNS = [
  'mailinator.com',
  'guerrillamail',
  'tempmail',
  'throwaway',
  '10minutemail',
  'yopmail',
  'mohmal',
  'getnada',
  'maildrop',
  'trashmail',
  'dispostable',
  'mintemail',
  'fakeinbox',
  'sharklasers',
  'spamgourmet',
  'mailcatch',
  'inboxkitten',
  'mailmoat',
  'mailnesia',
  'mytrashmail',
  'putthisinyourspamdatabase',
  'spambox',
  'tempinbox',
  'tempmailaddress',
  'throwawaymail',
  'tmpmail',
  'trashmailer',
  'getairmail',
  'meltmail',
  'emailondeck',
  'fakemailgenerator',
];

/**
 * Cache for MX lookups to avoid repeated DNS queries
 */
const mxCache = new Map<string, { mx: string[] | null; timestamp: number }>();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Get MX records for a domain
 */
async function getMXRecords(domain: string): Promise<string[] | null> {
  try {
    // Check cache first
    const cached = mxCache.get(domain);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.mx;
    }

    // Perform DNS lookup
    const mxRecords = await dns.resolveMx(domain);
    const mxHosts = mxRecords.map((record) => record.exchange.toLowerCase());

    // Cache the result
    mxCache.set(domain, { mx: mxHosts, timestamp: Date.now() });

    return mxHosts;
  } catch (error) {
    // Domain doesn't have MX records or DNS lookup failed
    mxCache.set(domain, { mx: null, timestamp: Date.now() });
    return null;
  }
}

/**
 * Check if MX records match disposable email patterns
 */
function matchesDisposablePattern(mxHosts: string[]): boolean {
  const mxString = mxHosts.join(' ').toLowerCase();
  
  return DISPOSABLE_MX_PATTERNS.some((pattern) => {
    return mxHosts.some((mx) => mx.includes(pattern));
  });
}

/**
 * Check if domain is disposable using DNS MX records
 * This is a complementary method to domain list checking
 * 
 * @param domain - The domain to check
 * @returns Promise that resolves to true if MX records suggest disposable email
 */
export async function isDisposableByDNS(domain: string): Promise<boolean> {
  if (!domain || !domain.includes('.')) {
    return false;
  }

  try {
    const mxHosts = await getMXRecords(domain);
    
    if (!mxHosts || mxHosts.length === 0) {
      // No MX records - might be disposable (many temp services don't have proper MX)
      return false; // Don't assume disposable without MX records
    }

    // Check if MX records match known disposable patterns
    return matchesDisposablePattern(mxHosts);
  } catch (error) {
    // DNS lookup failed - can't determine
    return false;
  }
}

/**
 * Clear DNS cache
 */
export function clearDNSCache(): void {
  mxCache.clear();
}

/**
 * Get cached MX records (for testing/debugging)
 */
export function getCachedMX(domain: string): string[] | null {
  const cached = mxCache.get(domain);
  return cached?.mx || null;
}

