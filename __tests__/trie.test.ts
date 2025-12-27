/**
 * Tests for Trie data structure
 */

import { DomainTrie } from '../src/utils/trie';

describe('DomainTrie', () => {
  let trie: DomainTrie;

  beforeEach(() => {
    trie = new DomainTrie();
  });

  describe('insert', () => {
    it('should insert domains correctly', () => {
      trie.insert('example.com');
      expect(trie.hasDomain('example.com')).toBe(true);
    });

    it('should handle multiple domains', () => {
      trie.insert('example.com');
      trie.insert('test.com');
      trie.insert('demo.org');
      
      expect(trie.hasDomain('example.com')).toBe(true);
      expect(trie.hasDomain('test.com')).toBe(true);
      expect(trie.hasDomain('demo.org')).toBe(true);
    });
  });

  describe('hasDomain', () => {
    it('should find exact domain matches', () => {
      trie.insert('example.com');
      expect(trie.hasDomain('example.com')).toBe(true);
      expect(trie.hasDomain('test.com')).toBe(false);
    });

    it('should find subdomain matches', () => {
      trie.insert('example.com');
      
      // Subdomain should match
      expect(trie.hasDomain('subdomain.example.com')).toBe(true);
      expect(trie.hasDomain('mail.subdomain.example.com')).toBe(true);
    });

    it('should handle case insensitivity', () => {
      trie.insert('Example.COM');
      expect(trie.hasDomain('example.com')).toBe(true);
      expect(trie.hasDomain('EXAMPLE.COM')).toBe(true);
      expect(trie.hasDomain('ExAmPlE.CoM')).toBe(true);
    });
  });

  describe('fromDomains', () => {
    it('should create trie from domain array', () => {
      const domains = ['example.com', 'test.com', 'demo.org'];
      const newTrie = DomainTrie.fromDomains(domains);
      
      expect(newTrie.hasDomain('example.com')).toBe(true);
      expect(newTrie.hasDomain('test.com')).toBe(true);
      expect(newTrie.hasDomain('demo.org')).toBe(true);
    });

    it('should handle large domain lists', () => {
      const domains = Array.from({ length: 1000 }, (_, i) => `domain${i}.com`);
      const newTrie = DomainTrie.fromDomains(domains);
      
      expect(newTrie.hasDomain('domain0.com')).toBe(true);
      expect(newTrie.hasDomain('domain999.com')).toBe(true);
      expect(newTrie.hasDomain('subdomain.domain0.com')).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('should handle single label domains', () => {
      trie.insert('localhost');
      expect(trie.hasDomain('localhost')).toBe(true);
    });

    it('should handle domains with many subdomains', () => {
      trie.insert('example.com');
      expect(trie.hasDomain('a.b.c.d.e.f.g.example.com')).toBe(true);
    });

    it('should not match partial domain names', () => {
      trie.insert('example.com');
      expect(trie.hasDomain('example')).toBe(false);
      expect(trie.hasDomain('com')).toBe(false);
    });
  });
});

