/**
 * Domain loader - fetches domains from multiple GitHub sources at runtime
 * Keeps package size small by fetching from remote sources
 * Merges domains from multiple sources for comprehensive coverage
 * 
 * Sources:
 * 1. IntegerAlex/disposable-email-detector - JSON format with ~184k domains
 * 2. disposable-email-domains/disposable-email-domains - Plain text blocklist format
 * 
 * Both sources are fetched in parallel and merged/deduplicated for maximum coverage
 */

/**
 * Multiple domain sources for maximum coverage
 * Aggregates from all major public datasets
 */
/**
 * All domain sources for maximum coverage
 * Aggregates from 9 major public datasets
 */
const DOMAINS_URLS = {
  // Primary: disposable-email-domains (most used, community maintained)
  primary: 'https://raw.githubusercontent.com/disposable-email-domains/disposable-email-domains/main/disposable_email_blocklist.conf',
  // IntegerAlex disposable-email-detector (JSON format, large dataset ~185k)
  detector: 'https://raw.githubusercontent.com/IntegerAlex/disposable-email-detector/refs/heads/main/index.json',
  // ivolo disposable-email-domains (additional coverage)
  ivolo: 'https://raw.githubusercontent.com/ivolo/disposable-email-domains/master/index.json',
  // martenson disposable-email-domains (legacy providers)
  martenson: 'https://raw.githubusercontent.com/martenson/disposable-email-domains/master/disposable_email_blocklist.conf',
  // Mailchecker list
  mailchecker: 'https://raw.githubusercontent.com/FGRibreau/mailchecker/master/list.txt',
  // sajjadh47 - Over 100k domains
  sajjadh47: 'https://raw.githubusercontent.com/sajjadh47/disposable-email-domains-list/master/domains.json',
  // WebSnifferHQ disposable-email-domains
  websniffer: 'https://raw.githubusercontent.com/WebSnifferHQ/disposable-email-domains/main/disposable-email-domains.txt',
  // groundcat disposable-email-domain-list (MX validated)
  groundcat: 'https://raw.githubusercontent.com/groundcat/disposable-email-domain-list/master/domains.json',
  // disposable/disposable (updated every 24h)
  disposableMain: 'https://raw.githubusercontent.com/disposable/disposable-email-domains/master/domains.txt',
};

let cachedDomains: readonly string[] | null = null;
let loadPromise: Promise<readonly string[]> | null = null;

/**
 * Fetch domains from JSON source
 */
async function fetchDomainsFromJson(url: string): Promise<string[]> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      return [];
    }
    const data: any = await response.json();
    if (Array.isArray(data)) {
      return data.map((d: string) => d.toLowerCase().trim()).filter(Boolean);
    }
    if (data && typeof data === 'object' && 'domains' in data && Array.isArray(data.domains)) {
      return data.domains.map((d: string) => d.toLowerCase().trim()).filter(Boolean);
    }
    return [];
  } catch (error) {
    return [];
  }
}

/**
 * Fetch domains from plain text source
 */
async function fetchDomainsFromText(url: string): Promise<string[]> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      return [];
    }
    const text = await response.text();
    // Parse plain text - one domain per line
    return text
      .split('\n')
      .map((line) => line.trim().toLowerCase())
      .filter((line) => line && !line.startsWith('#') && !line.startsWith('//') && line.includes('.') && line.length > 3);
  } catch (error) {
    return [];
  }
}

/**
 * Normalize domain
 */
function normalizeDomain(domain: string): string {
  return domain
    .toLowerCase()
    .trim()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .split('/')[0]
    .split('?')[0]
    .split('#')[0];
}

/**
 * Validate domain format
 */
function isValidDomain(domain: string): boolean {
  if (!domain || domain.length < 3) return false;
  if (!domain.includes('.')) return false;
  if (domain.startsWith('.') || domain.endsWith('.')) return false;
  if (domain.includes(' ')) return false;
  const domainRegex = /^[a-z0-9]([a-z0-9\-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9\-]{0,61}[a-z0-9])?)*\.[a-z]{2,}$/i;
  return domainRegex.test(domain);
}

/**
 * Fetch and merge domains from ALL sources for maximum coverage
 */
async function fetchDomains(): Promise<readonly string[]> {
  // Fetch from all 9 sources in parallel for maximum speed and coverage
  const [
    primaryDomains,
    detectorDomains,
    ivoloDomains,
    martensonDomains,
    mailcheckerDomains,
    sajjadh47Domains,
    websnifferDomains,
    groundcatDomains,
    disposableMainDomains,
  ] = await Promise.all([
    fetchDomainsFromText(DOMAINS_URLS.primary),
    fetchDomainsFromJson(DOMAINS_URLS.detector),
    fetchDomainsFromJson(DOMAINS_URLS.ivolo).catch(() => []),
    fetchDomainsFromText(DOMAINS_URLS.martenson).catch(() => []),
    fetchDomainsFromText(DOMAINS_URLS.mailchecker).catch(() => []),
    fetchDomainsFromJson(DOMAINS_URLS.sajjadh47).catch(() => []),
    fetchDomainsFromText(DOMAINS_URLS.websniffer).catch(() => []),
    fetchDomainsFromJson(DOMAINS_URLS.groundcat).catch(() => []),
    fetchDomainsFromText(DOMAINS_URLS.disposableMain).catch(() => []),
  ]);

  // Merge and deduplicate using Set
  const mergedSet = new Set<string>();
  
  // Add domains from all 9 sources with normalization and duplicate removal
  [
    ...primaryDomains,
    ...detectorDomains,
    ...ivoloDomains,
    ...martensonDomains,
    ...mailcheckerDomains,
    ...sajjadh47Domains,
    ...websnifferDomains,
    ...groundcatDomains,
    ...disposableMainDomains,
  ].forEach((domain) => {
    const normalized = normalizeDomain(domain);
    if (isValidDomain(normalized)) {
      mergedSet.add(normalized);
    }
  });

  // Convert to sorted array for consistency
  const merged = Array.from(mergedSet).sort();

  if (merged.length === 0) {
    throw new Error('No domains could be loaded from any source');
  }

  return merged;
}

/**
 * Try to load domains from local JSON file (faster, no network)
 * Works in Node.js environment only
 * Falls back to fetching from URLs if file doesn't exist
 */
async function loadDomainsFromFile(): Promise<string[] | null> {
  // Only works in Node.js environment
  if (typeof process === 'undefined' || !process.versions?.node) {
    return null;
  }

  try {
    // Use dynamic import to avoid issues in browser environments
    const fs = await import('fs');
    const path = await import('path');
    const { fileURLToPath } = await import('url');
    
    // Try multiple possible paths
    const possiblePaths = [
      path.join(process.cwd(), 'data', 'all-domains.json'),
      path.join(__dirname, '../../data/all-domains.json'),
      path.join(__dirname, '../data/all-domains.json'),
    ];

    for (const jsonPath of possiblePaths) {
      try {
        if (fs.existsSync(jsonPath)) {
          const fileContent = fs.readFileSync(jsonPath, 'utf-8');
          const domains = JSON.parse(fileContent);
          if (Array.isArray(domains) && domains.length > 0) {
            console.log(`✅ Loaded ${domains.length.toLocaleString()} domains from local JSON file`);
            return domains.map((d: string) => d.toLowerCase().trim()).filter(Boolean);
          }
        }
      } catch (error) {
        // Try next path
        continue;
      }
    }
    
    return null;
  } catch (error) {
    // File system not available (browser environment), continue to URL fetch
    return null;
  }
}

/**
 * Load domains - tries local JSON file first, then falls back to URLs
 * @returns Promise that resolves to the domains array
 */
export async function loadDomains(): Promise<readonly string[]> {
  // Return cached if available
  if (cachedDomains) {
    return cachedDomains;
  }

  // Return existing promise if already loading
  if (loadPromise) {
    return loadPromise;
  }

  // Start loading - try local file first, then URLs
  loadPromise = (async () => {
    // Try to load from local JSON file first (faster, no network)
    // This works when running locally or when data/ folder is available
    const fileDomains = await loadDomainsFromFile();
    
    if (fileDomains && fileDomains.length > 0) {
      console.log(`📦 Using local JSON file (${fileDomains.length.toLocaleString()} domains)`);
      cachedDomains = fileDomains;
      return fileDomains;
    }
    
    // Fallback to fetching from URLs if file doesn't exist
    // This is the default for published npm packages
    console.log('🌐 Fetching domains from GitHub URLs...');
    const urlDomains = await fetchDomains();
    console.log(`✅ Loaded ${urlDomains.length.toLocaleString()} domains from URLs`);
    cachedDomains = urlDomains;
    return urlDomains;
  })();

  return loadPromise;
}

/**
 * Get cached domains (returns null if not loaded yet)
 */
export function getCachedDomains(): readonly string[] | null {
  return cachedDomains;
}

/**
 * Check if domains are loaded
 */
export function isDomainsLoaded(): boolean {
  return cachedDomains !== null;
}

/**
 * Clear cache (useful for testing or forcing reload)
 */
export function clearCache(): void {
  cachedDomains = null;
  loadPromise = null;
}

