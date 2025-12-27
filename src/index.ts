/**
 * temp-email-guard
 * A powerful TypeScript package to detect and guard against temporary email addresses
 * Fetches domains from GitHub at runtime to keep package size small
 */

import { loadDomains, getCachedDomains, isDomainsLoaded, clearCache as clearLoaderCache } from './data/loader';
import { DomainTrie } from './utils/trie';
import { isDisposableByDNS } from './utils/dns-detector';

/**
 * Internal state for domains
 */
let TEMP_EMAIL_DOMAINS_SET: Set<string> | null = null;
let TEMP_EMAIL_DOMAINS_TRIE: DomainTrie | null = null;
let TEMP_EMAIL_DOMAINS_ARRAY: readonly string[] | null = null;

/**
 * Pre-compiled regex for email validation (faster than creating new regex each time)
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Simple LRU cache for recently checked domains (max 1000 entries)
 * Speeds up repeated lookups of the same domains
 */
const DOMAIN_CACHE = new Map<string, boolean>();
const MAX_CACHE_SIZE = 1000;

/**
 * Add to cache with LRU eviction
 */
function cacheResult(domain: string, result: boolean): void {
  // Remove oldest entry if cache is full
  if (DOMAIN_CACHE.size >= MAX_CACHE_SIZE) {
    const firstKey = DOMAIN_CACHE.keys().next().value;
    if (firstKey !== undefined) {
      DOMAIN_CACHE.delete(firstKey);
    }
  }
  DOMAIN_CACHE.set(domain, result);
}

/**
 * Initialize domains from fetched data
 */
function initializeDomains(domains: readonly string[]): void {
  TEMP_EMAIL_DOMAINS_SET = new Set(domains);
  TEMP_EMAIL_DOMAINS_TRIE = DomainTrie.fromDomains(domains);
  TEMP_EMAIL_DOMAINS_ARRAY = domains;
}

/**
 * Ensure domains are loaded (auto-initialize on first use)
 */
async function ensureDomainsLoaded(): Promise<void> {
  if (isDomainsLoaded()) {
    return;
  }

  const domains = await loadDomains();
  if (!TEMP_EMAIL_DOMAINS_SET) {
    initializeDomains(domains);
  }
}

/**
 * Get domains array (synchronous, returns empty array if not loaded)
 * For async version, use initialize() then getTempEmailDomains()
 */
export function getTempEmailDomains(): readonly string[] {
  return TEMP_EMAIL_DOMAINS_ARRAY || [];
}

/**
 * Get domains array (async, ensures domains are loaded first)
 */
export async function getTempEmailDomainsAsync(): Promise<readonly string[]> {
  await ensureDomainsLoaded();
  return TEMP_EMAIL_DOMAINS_ARRAY || [];
}

/**
 * Backward compatibility - returns domains array
 * Note: Will be empty until initialize() is called
 * @deprecated Use getTempEmailDomains() or getTempEmailDomainsAsync() instead
 */
export const TEMP_EMAIL_DOMAINS = getTempEmailDomains();

/**
 * Clear all caches (useful for testing)
 */
export function clearCache(): void {
  TEMP_EMAIL_DOMAINS_SET = null;
  TEMP_EMAIL_DOMAINS_TRIE = null;
  TEMP_EMAIL_DOMAINS_ARRAY = null;
  DOMAIN_CACHE.clear();
  clearLoaderCache();
}

// Re-export DNS detector functions
export { isDisposableByDNS, clearDNSCache } from './utils/dns-detector';

// Re-export DNS detector functions
export { isDisposableByDNS, clearDNSCache as clearDNSCache } from './utils/dns-detector';

/**
 * Initialize the package (loads domains from GitHub)
 * Call this before using isTempEmail for best performance
 * @returns Promise that resolves when domains are loaded
 */
export async function initialize(): Promise<void> {
  await ensureDomainsLoaded();
}

/**
 * Validation result interface
 */
export interface ValidationResult {
  isValid: boolean;
  isTempEmail: boolean;
  error: string | null;
}

/**
 * Check if an email address is from a temporary email service
 * Uses optimized Trie structure for fast domain and subdomain matching
 * Optimized for millions of domains - O(m) where m is domain length
 * 
 * Note: Domains are auto-loaded on first use. For best performance, call initialize() first.
 * 
 * @param email - The email address to check
 * @returns True if the email is from a temporary email service
 */
export function isTempEmail(email: string): boolean {
  // Fast early exit for invalid input
  if (!email || typeof email !== 'string') {
    return false;
  }

  // Auto-initialize if not loaded (synchronous check, will return false if not loaded)
  if (!TEMP_EMAIL_DOMAINS_SET || !TEMP_EMAIL_DOMAINS_TRIE) {
    const cached = getCachedDomains();
    if (cached) {
      initializeDomains(cached);
    } else {
      return false;
    }
  }

  // Optimized domain extraction using indexOf (faster than split)
  const atIndex = email.indexOf('@');
  if (atIndex === -1 || atIndex === email.length - 1) {
    return false;
  }

  // Extract domain directly (avoid creating array with split)
  let domain = email.slice(atIndex + 1).toLowerCase().trim();
  
  // Early exit for empty domain
  if (!domain) {
    return false;
  }

  // Check cache first (O(1) lookup for repeated domains)
  const cachedResult = DOMAIN_CACHE.get(domain);
  if (cachedResult !== undefined) {
    return cachedResult;
  }

  // At this point, we know they're initialized
  const domainsSet = TEMP_EMAIL_DOMAINS_SET!;
  const domainsTrie = TEMP_EMAIL_DOMAINS_TRIE!;

  let result = false;

  // Fast O(1) exact match lookup using Set (fastest for exact matches)
  if (domainsSet.has(domain)) {
    result = true;
  } else {
    // Use Trie for efficient subdomain matching
    // Optimized Trie handles subdomain checking in O(m) time where m is domain length
    result = domainsTrie.hasDomain(domain);
  }

  // Cache the result for future lookups
  cacheResult(domain, result);
  return result;
}

/**
 * Async version that ensures domains are loaded
 * @param email - The email address to check
 * @returns Promise that resolves to true if the email is from a temporary email service
 */
export async function isTempEmailAsync(email: string): Promise<boolean> {
  await ensureDomainsLoaded();
  return isTempEmail(email);
}

/**
 * Validate email format and check if it's a temporary email
 * 
 * Note: Domains are auto-loaded on first use. For best performance, call initialize() first.
 * 
 * @param email - The email address to validate
 * @returns Validation result with isValid and isTempEmail flags
 */
export function validateEmail(email: string): ValidationResult {
  if (!email || typeof email !== 'string') {
    return {
      isValid: false,
      isTempEmail: false,
      error: 'Email is required and must be a string',
    };
  }

  // Use pre-compiled regex for faster validation
  const isValidFormat = EMAIL_REGEX.test(email);

  if (!isValidFormat) {
    return {
      isValid: false,
      isTempEmail: false,
      error: 'Invalid email format',
    };
  }

  const isTemp = isTempEmail(email);

  return {
    isValid: true,
    isTempEmail: isTemp,
    error: isTemp ? 'Email is from a temporary email service' : null,
  };
}

/**
 * Async version that ensures domains are loaded
 * @param email - The email address to validate
 * @returns Promise that resolves to validation result
 */
export async function validateEmailAsync(email: string): Promise<ValidationResult> {
  await ensureDomainsLoaded();
  return validateEmail(email);
}

