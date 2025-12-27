/**
 * Domain Aggregator Script
 * Fetches domains from multiple sources and creates a unified dataset
 */

import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';

interface DomainSource {
  name: string;
  url: string;
  type: 'json' | 'text' | 'txt';
  transform?: (data: any) => string[];
}

const DOMAIN_SOURCES: DomainSource[] = [
  // Primary source - disposable-email-domains
  {
    name: 'disposable-email-domains',
    url: 'https://raw.githubusercontent.com/disposable-email-domains/disposable-email-domains/main/disposable_email_blocklist.conf',
    type: 'text',
  },
  // IntegerAlex disposable-email-detector (JSON) - Large dataset
  {
    name: 'disposable-email-detector',
    url: 'https://raw.githubusercontent.com/IntegerAlex/disposable-email-detector/refs/heads/main/index.json',
    type: 'json',
  },
  // ivolo disposable-email-domains
  {
    name: 'ivolo-disposable',
    url: 'https://raw.githubusercontent.com/ivolo/disposable-email-domains/master/index.json',
    type: 'json',
  },
  // martenson disposable-email-domains
  {
    name: 'martenson-disposable',
    url: 'https://raw.githubusercontent.com/martenson/disposable-email-domains/master/disposable_email_blocklist.conf',
    type: 'text',
  },
  // Mailchecker
  {
    name: 'mailchecker',
    url: 'https://raw.githubusercontent.com/FGRibreau/mailchecker/master/list.txt',
    type: 'text',
  },
  // sajjadh47 - Over 100k domains, multiple formats
  {
    name: 'sajjadh47-disposable',
    url: 'https://raw.githubusercontent.com/sajjadh47/disposable-email-domains-list/master/domains.json',
    type: 'json',
  },
  // WebSnifferHQ disposable-email-domains
  {
    name: 'websniffer-disposable',
    url: 'https://raw.githubusercontent.com/WebSnifferHQ/disposable-email-domains/main/disposable-email-domains.txt',
    type: 'text',
  },
  // groundcat disposable-email-domain-list (MX validated)
  {
    name: 'groundcat-disposable',
    url: 'https://raw.githubusercontent.com/groundcat/disposable-email-domain-list/master/domains.json',
    type: 'json',
  },
  // disposable/disposable (updated every 24h)
  {
    name: 'disposable-main',
    url: 'https://raw.githubusercontent.com/disposable/disposable-email-domains/master/domains.txt',
    type: 'text',
  },
];

/**
 * Fetch domains from a source
 */
async function fetchDomainsFromSource(source: DomainSource): Promise<string[]> {
  try {
    console.log(`📥 Fetching from ${source.name}...`);
    const response = await fetch(source.url);
    
    if (!response.ok) {
      console.warn(`⚠️  Failed to fetch ${source.name}: ${response.statusText}`);
      return [];
    }

    let domains: string[] = [];

    if (source.type === 'json') {
      const data: any = await response.json();
      if (Array.isArray(data)) {
        domains = data.map((d: string) => d.toLowerCase().trim()).filter(Boolean);
      } else if (data && typeof data === 'object' && 'domains' in data && Array.isArray(data.domains)) {
        domains = data.domains.map((d: string) => d.toLowerCase().trim()).filter(Boolean);
      }
    } else {
      // Text format - one domain per line
      const text = await response.text();
      domains = text
        .split('\n')
        .map((line) => line.trim().toLowerCase())
        .filter((line) => {
          // Filter out comments, empty lines, and invalid domains
          return line && 
                 !line.startsWith('#') && 
                 !line.startsWith('//') &&
                 line.includes('.') &&
                 line.length > 3;
        });
    }

    // Apply custom transform if provided
    if (source.transform) {
      domains = source.transform(domains);
    }

    console.log(`✅ Fetched ${domains.length.toLocaleString()} domains from ${source.name}`);
    return domains;
  } catch (error) {
    console.warn(`⚠️  Error fetching ${source.name}:`, error instanceof Error ? error.message : String(error));
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
    .replace(/^https?:\/\//, '') // Remove http:// or https://
    .replace(/^www\./, '') // Remove www.
    .split('/')[0] // Remove paths
    .split('?')[0] // Remove query strings
    .split('#')[0]; // Remove fragments
}

/**
 * Validate domain format
 */
function isValidDomain(domain: string): boolean {
  if (!domain || domain.length < 3) return false;
  if (!domain.includes('.')) return false;
  if (domain.startsWith('.') || domain.endsWith('.')) return false;
  if (domain.includes(' ')) return false;
  
  // Basic domain regex
  const domainRegex = /^[a-z0-9]([a-z0-9\-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9\-]{0,61}[a-z0-9])?)*\.[a-z]{2,}$/i;
  return domainRegex.test(domain);
}

/**
 * Aggregate all domains from all sources
 */
async function aggregateAllDomains(): Promise<string[]> {
  console.log('🚀 Starting domain aggregation from multiple sources...\n');

  // Fetch from all sources in parallel
  const results = await Promise.all(
    DOMAIN_SOURCES.map((source) => fetchDomainsFromSource(source))
  );

  // Merge all domains
  const allDomains = results.flat();

  console.log(`\n📊 Total domains before deduplication: ${allDomains.length.toLocaleString()}`);

  // Step 1: Normalize all domains
  const normalizedDomains = allDomains.map(normalizeDomain);
  console.log(`   After normalization: ${normalizedDomains.length.toLocaleString()} domains`);

  // Step 2: Remove duplicates using Set (automatic deduplication)
  const uniqueDomains = new Set<string>();
  const invalidDomains: string[] = [];
  const duplicateCount = new Map<string, number>();

  for (const domain of normalizedDomains) {
    if (isValidDomain(domain)) {
      // Track duplicates for reporting
      if (uniqueDomains.has(domain)) {
        duplicateCount.set(domain, (duplicateCount.get(domain) || 1) + 1);
      } else {
        uniqueDomains.add(domain);
      }
    } else {
      invalidDomains.push(domain);
    }
  }

  // Step 3: Additional duplicate check - remove any remaining duplicates
  const finalUniqueSet = new Set<string>();
  for (const domain of uniqueDomains) {
    finalUniqueSet.add(domain); // Set automatically handles duplicates
  }

  // Convert to sorted array
  const finalDomains = Array.from(finalUniqueSet).sort();

  // Report deduplication stats
  const duplicatesRemoved = allDomains.length - finalDomains.length;
  console.log(`   Invalid domains removed: ${invalidDomains.length.toLocaleString()}`);
  console.log(`   Duplicates removed: ${duplicatesRemoved.toLocaleString()}`);
  console.log(`✅ Final unique domains: ${finalDomains.length.toLocaleString()}\n`);

  return finalDomains;
}

/**
 * Save domains to JSON file
 */
function saveDomainsToFile(domains: string[], outputPath: string): void {
  console.log(`💾 Saving to ${outputPath}...`);
  writeFileSync(outputPath, JSON.stringify(domains, null, 2), 'utf-8');
  console.log(`✅ Saved ${domains.length.toLocaleString()} domains to ${outputPath}\n`);
}

/**
 * Save domains to text file
 */
function saveDomainsToTextFile(domains: string[], outputPath: string): void {
  console.log(`💾 Saving to ${outputPath}...`);
  const content = domains.join('\n');
  writeFileSync(outputPath, content, 'utf-8');
  console.log(`✅ Saved ${domains.length.toLocaleString()} domains to ${outputPath}\n`);
}

/**
 * Generate statistics
 */
function generateStats(domains: string[]): void {
  console.log('📈 Statistics:');
  console.log(`   Total domains: ${domains.length.toLocaleString()}`);
  
  // Count by TLD
  const tldCounts = new Map<string, number>();
  domains.forEach((domain) => {
    const parts = domain.split('.');
    if (parts.length > 1) {
      const tld = parts[parts.length - 1];
      tldCounts.set(tld, (tldCounts.get(tld) || 0) + 1);
    }
  });

  const topTlds = Array.from(tldCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  console.log(`   Unique TLDs: ${tldCounts.size}`);
  console.log(`   Top 10 TLDs:`);
  topTlds.forEach(([tld, count]) => {
    console.log(`     .${tld}: ${count.toLocaleString()} domains`);
  });
  console.log('');
}

/**
 * Main function
 */
async function main() {
  try {
    const domains = await aggregateAllDomains();
    
    if (domains.length === 0) {
      console.error('❌ No domains found!');
      process.exit(1);
    }

    // Generate statistics
    generateStats(domains);

    // Save to multiple formats
    const dataDir = join(__dirname, '../data');
    const jsonPath = join(dataDir, 'all-domains.json');
    const txtPath = join(dataDir, 'all-domains.txt');

    saveDomainsToFile(domains, jsonPath);
    saveDomainsToTextFile(domains, txtPath);

    console.log('✅ Domain aggregation completed successfully!');
    console.log(`📦 Generated files:`);
    console.log(`   - ${jsonPath}`);
    console.log(`   - ${txtPath}`);
  } catch (error) {
    console.error('❌ Error during aggregation:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { aggregateAllDomains, DOMAIN_SOURCES };

