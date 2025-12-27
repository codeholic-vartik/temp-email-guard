/**
 * Tests for temp-email-guard main functionality
 */

import {
  initialize,
  isTempEmail,
  isTempEmailAsync,
  validateEmail,
  validateEmailAsync,
  getTempEmailDomains,
  getTempEmailDomainsAsync,
  clearCache,
} from '../src/index';
import { clearCache as clearLoaderCache } from '../src/data/loader';

// Clear cache before each test
beforeEach(() => {
  clearCache();
  clearLoaderCache();
});

describe('temp-email-guard', () => {
  describe('initialize', () => {
    it('should load domains from remote sources', async () => {
      await initialize();
      const domains = getTempEmailDomains();
      expect(domains.length).toBeGreaterThan(0);
      expect(domains.length).toBeGreaterThan(100000); // Should have 100k+ domains
    }, 30000);

    it('should cache domains after first load', async () => {
      await initialize();
      const domains1 = getTempEmailDomains();
      
      // Clear cache but domains should still be in memory
      clearLoaderCache();
      
      // Should still have domains (cached in index.ts)
      const domains2 = getTempEmailDomains();
      expect(domains2.length).toBe(domains1.length);
    }, 30000);
  });

  describe('isTempEmail', () => {
    beforeEach(async () => {
      await initialize();
    });

    it('should return true for known temp email domains', () => {
      expect(isTempEmail('test@0-180.com')).toBe(true);
      expect(isTempEmail('test@0-mail.com')).toBe(true);
      expect(isTempEmail('user@10minutemail.com')).toBe(true);
    });

    it('should return false for normal email domains', () => {
      expect(isTempEmail('test@gmail.com')).toBe(false);
      expect(isTempEmail('user@yahoo.com')).toBe(false);
      expect(isTempEmail('test@outlook.com')).toBe(false);
      expect(isTempEmail('user@company.com')).toBe(false);
    });

    it('should return false for invalid emails', () => {
      expect(isTempEmail('')).toBe(false);
      expect(isTempEmail('notanemail')).toBe(false);
      expect(isTempEmail('@domain.com')).toBe(false);
      expect(isTempEmail('user@')).toBe(false);
    });

    it('should handle case insensitivity', () => {
      expect(isTempEmail('TEST@0-180.COM')).toBe(true);
      expect(isTempEmail('Test@0-Mail.Com')).toBe(true);
    });

    it('should handle whitespace', () => {
      expect(isTempEmail('  test@0-180.com  ')).toBe(true);
      expect(isTempEmail('\ttest@0-mail.com\n')).toBe(true);
    });
  });

  describe('isTempEmailAsync', () => {
    it('should auto-initialize and return true for temp emails', async () => {
      const result = await isTempEmailAsync('test@0-180.com');
      expect(result).toBe(true);
    }, 30000);

    it('should auto-initialize and return false for normal emails', async () => {
      const result = await isTempEmailAsync('test@gmail.com');
      expect(result).toBe(false);
    }, 30000);
  });

  describe('validateEmail', () => {
    beforeEach(async () => {
      await initialize();
    });

    it('should validate email format correctly', () => {
      const result1 = validateEmail('test@definitelynotreal12345.com');
      expect(result1.isValid).toBe(true);
      expect(result1.isTempEmail).toBe(false);
      expect(result1.error).toBeNull();

      const result2 = validateEmail('invalid-email');
      expect(result2.isValid).toBe(false);
      expect(result2.isTempEmail).toBe(false);
      expect(result2.error).toBe('Invalid email format');
    });

    it('should detect temp emails in validation', () => {
      const result = validateEmail('test@0-180.com');
      expect(result.isValid).toBe(true);
      expect(result.isTempEmail).toBe(true);
      expect(result.error).toBe('Email is from a temporary email service');
    });

    it('should handle empty or invalid input', () => {
      const result1 = validateEmail('');
      expect(result1.isValid).toBe(false);
      expect(result1.isTempEmail).toBe(false);
      expect(result1.error).toBe('Email is required and must be a string');

      const result2 = validateEmail(null as any);
      expect(result2.isValid).toBe(false);
      expect(result2.error).toBe('Email is required and must be a string');
    });
  });

  describe('validateEmailAsync', () => {
    it('should auto-initialize and validate emails', async () => {
      const result1 = await validateEmailAsync('test@0-180.com');
      expect(result1.isValid).toBe(true);
      expect(result1.isTempEmail).toBe(true);

      const result2 = await validateEmailAsync('test@gmail.com');
      expect(result2.isValid).toBe(true);
      expect(result2.isTempEmail).toBe(false);
    }, 30000);
  });

  describe('getTempEmailDomains', () => {
    it('should return empty array if not initialized', () => {
      const domains = getTempEmailDomains();
      expect(domains).toEqual([]);
    });

    it('should return domains after initialization', async () => {
      await initialize();
      const domains = getTempEmailDomains();
      expect(domains.length).toBeGreaterThan(0);
      expect(Array.isArray(domains)).toBe(true);
    }, 30000);
  });

  describe('getTempEmailDomainsAsync', () => {
    it('should auto-initialize and return domains', async () => {
      const domains = await getTempEmailDomainsAsync();
      expect(domains.length).toBeGreaterThan(0);
      expect(domains.length).toBeGreaterThan(100000);
    }, 30000);
  });

  describe('edge cases', () => {
    beforeEach(async () => {
      await initialize();
    });

    it('should handle subdomain matching', () => {
      // If a domain like "0-180.com" is in the list, 
      // "subdomain.0-180.com" should also be detected
      // This tests the Trie subdomain matching
      expect(isTempEmail('test@subdomain.0-180.com')).toBe(true); // Subdomain should match
      expect(isTempEmail('test@mail.0-mail.com')).toBe(true); // Subdomain should match
    });

    it('should handle special characters in email', () => {
      expect(isTempEmail('test+tag@0-180.com')).toBe(true);
      expect(isTempEmail('test.user@0-mail.com')).toBe(true);
    });

    it('should handle very long emails', () => {
      const longEmail = 'a'.repeat(100) + '@0-180.com';
      expect(isTempEmail(longEmail)).toBe(true);
    });
  });
});

