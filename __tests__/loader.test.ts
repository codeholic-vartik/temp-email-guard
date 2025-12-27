/**
 * Tests for domain loader functionality
 */

import {
  loadDomains,
  getCachedDomains,
  isDomainsLoaded,
  clearCache,
} from '../src/data/loader';

describe('Domain Loader', () => {
  beforeEach(() => {
    clearCache();
  });

  describe('loadDomains', () => {
    it('should fetch domains from remote sources', async () => {
      const domains = await loadDomains();
      expect(domains.length).toBeGreaterThan(0);
      expect(domains.length).toBeGreaterThan(100000);
      expect(Array.isArray(domains)).toBe(true);
    }, 30000);

    it('should cache domains after first load', async () => {
      const domains1 = await loadDomains();
      const domains2 = await loadDomains();
      
      expect(domains1).toBe(domains2); // Same reference (cached)
      expect(domains1.length).toBe(domains2.length);
    }, 30000);

    it('should merge domains from both sources', async () => {
      const domains = await loadDomains();
      
      // Check for domains from JSON source
      expect(domains).toContain('0-180.com');
      
      // Check for domains from text source
      expect(domains).toContain('0-mail.com');
    }, 30000);

    it('should deduplicate domains from multiple sources', async () => {
      const domains = await loadDomains();
      const uniqueDomains = new Set(domains);
      
      // Should have no duplicates
      expect(domains.length).toBe(uniqueDomains.size);
    }, 30000);

    it('should normalize domains to lowercase', async () => {
      const domains = await loadDomains();
      
      // All domains should be lowercase
      domains.forEach((domain) => {
        expect(domain).toBe(domain.toLowerCase());
      });
    }, 30000);
  });

  describe('getCachedDomains', () => {
    it('should return null if domains not loaded', () => {
      expect(getCachedDomains()).toBeNull();
    });

    it('should return domains after loading', async () => {
      await loadDomains();
      const cached = getCachedDomains();
      
      expect(cached).not.toBeNull();
      expect(cached!.length).toBeGreaterThan(0);
    }, 30000);
  });

  describe('isDomainsLoaded', () => {
    it('should return false before loading', () => {
      expect(isDomainsLoaded()).toBe(false);
    });

    it('should return true after loading', async () => {
      await loadDomains();
      expect(isDomainsLoaded()).toBe(true);
    }, 30000);
  });

  describe('clearCache', () => {
    it('should clear cached domains', async () => {
      await loadDomains();
      expect(isDomainsLoaded()).toBe(true);
      
      clearCache();
      expect(isDomainsLoaded()).toBe(false);
      expect(getCachedDomains()).toBeNull();
    }, 30000);
  });
});

