/**
 * Performance benchmarks for temp-email-guard
 * Tests lookup speed with multiple domains
 */

import {
  initialize,
  isTempEmail,
  validateEmail,
  getTempEmailDomains,
} from '../src/index';

describe('Performance Benchmarks', () => {
  beforeAll(async () => {
    // Initialize once before all benchmarks
    await initialize();
  }, 60000);

  describe('Single Lookup Performance', () => {
    it('should measure time for single temp email lookup', () => {
      const iterations = 10000;
      const start = performance.now();

      for (let i = 0; i < iterations; i++) {
        isTempEmail('test@0-180.com');
      }

      const end = performance.now();
      const totalTime = end - start;
      const avgTime = totalTime / iterations;

      console.log(`\n📊 Single Lookup Benchmark:`);
      console.log(`   Iterations: ${iterations.toLocaleString()}`);
      console.log(`   Total time: ${totalTime.toFixed(2)}ms`);
      console.log(`   Average per lookup: ${avgTime.toFixed(4)}ms`);
      console.log(`   Lookups per second: ${Math.round(iterations / (totalTime / 1000)).toLocaleString()}`);

      // Should be very fast - less than 0.1ms per lookup
      expect(avgTime).toBeLessThan(0.1);
    });

    it('should measure time for single normal email lookup', () => {
      const iterations = 10000;
      const start = performance.now();

      for (let i = 0; i < iterations; i++) {
        isTempEmail('test@definitelynotreal12345.com');
      }

      const end = performance.now();
      const totalTime = end - start;
      const avgTime = totalTime / iterations;

      console.log(`\n📊 Normal Email Lookup Benchmark:`);
      console.log(`   Iterations: ${iterations.toLocaleString()}`);
      console.log(`   Total time: ${totalTime.toFixed(2)}ms`);
      console.log(`   Average per lookup: ${avgTime.toFixed(4)}ms`);
      console.log(`   Lookups per second: ${Math.round(iterations / (totalTime / 1000)).toLocaleString()}`);

      expect(avgTime).toBeLessThan(0.1);
    });
  });

  describe('Multiple Domain Lookup Performance', () => {
    it('should measure time for multiple temp email lookups', () => {
      const testEmails = [
        'test@0-180.com',
        'user@0-mail.com',
        'demo@10minutemail.com',
        'sample@yopmail.com',
        'check@mailinator.com',
        'verify@guerrillamail.com',
        'temp@throwaway.email',
        'fake@temp-mail.org',
        'spam@getnada.com',
        'test@maildrop.cc',
      ];

      const iterations = 1000;
      const start = performance.now();

      for (let i = 0; i < iterations; i++) {
        testEmails.forEach((email) => {
          isTempEmail(email);
        });
      }

      const end = performance.now();
      const totalTime = end - start;
      const totalLookups = testEmails.length * iterations;
      const avgTime = totalTime / totalLookups;

      console.log(`\n📊 Multiple Temp Email Lookup Benchmark:`);
      console.log(`   Test emails: ${testEmails.length}`);
      console.log(`   Iterations: ${iterations.toLocaleString()}`);
      console.log(`   Total lookups: ${totalLookups.toLocaleString()}`);
      console.log(`   Total time: ${totalTime.toFixed(2)}ms`);
      console.log(`   Average per lookup: ${avgTime.toFixed(4)}ms`);
      console.log(`   Lookups per second: ${Math.round(totalLookups / (totalTime / 1000)).toLocaleString()}`);

      expect(avgTime).toBeLessThan(0.1);
    });

    it('should measure time for mixed email lookups', () => {
      const testEmails = [
        'test@0-180.com', // temp
        'user@gmail.com', // normal
        'demo@10minutemail.com', // temp
        'sample@yahoo.com', // normal
        'check@mailinator.com', // temp
        'verify@outlook.com', // normal
        'temp@throwaway.email', // temp
        'fake@company.com', // normal
        'spam@getnada.com', // temp
        'test@definitelynotreal12345.com', // normal
      ];

      const iterations = 1000;
      const start = performance.now();

      for (let i = 0; i < iterations; i++) {
        testEmails.forEach((email) => {
          isTempEmail(email);
        });
      }

      const end = performance.now();
      const totalTime = end - start;
      const totalLookups = testEmails.length * iterations;
      const avgTime = totalTime / totalLookups;

      console.log(`\n📊 Mixed Email Lookup Benchmark:`);
      console.log(`   Test emails: ${testEmails.length} (50% temp, 50% normal)`);
      console.log(`   Iterations: ${iterations.toLocaleString()}`);
      console.log(`   Total lookups: ${totalLookups.toLocaleString()}`);
      console.log(`   Total time: ${totalTime.toFixed(2)}ms`);
      console.log(`   Average per lookup: ${avgTime.toFixed(4)}ms`);
      console.log(`   Lookups per second: ${Math.round(totalLookups / (totalTime / 1000)).toLocaleString()}`);

      expect(avgTime).toBeLessThan(0.1);
    });
  });

  describe('Validation Performance', () => {
    it('should measure time for email validation', () => {
      const testEmails = [
        'test@0-180.com',
        'user@definitelynotreal12345.com',
        'invalid-email',
        'demo@10minutemail.com',
      ];

      const iterations = 1000;
      const start = performance.now();

      for (let i = 0; i < iterations; i++) {
        testEmails.forEach((email) => {
          validateEmail(email);
        });
      }

      const end = performance.now();
      const totalTime = end - start;
      const totalValidations = testEmails.length * iterations;
      const avgTime = totalTime / totalValidations;

      console.log(`\n📊 Email Validation Benchmark:`);
      console.log(`   Test emails: ${testEmails.length}`);
      console.log(`   Iterations: ${iterations.toLocaleString()}`);
      console.log(`   Total validations: ${totalValidations.toLocaleString()}`);
      console.log(`   Total time: ${totalTime.toFixed(2)}ms`);
      console.log(`   Average per validation: ${avgTime.toFixed(4)}ms`);
      console.log(`   Validations per second: ${Math.round(totalValidations / (totalTime / 1000)).toLocaleString()}`);

      expect(avgTime).toBeLessThan(0.2);
    });
  });

  describe('Large Scale Performance', () => {
    it('should handle large number of lookups efficiently', () => {
      const domains = getTempEmailDomains();
      const sampleSize = Math.min(1000, domains.length);
      const sampleDomains = domains.slice(0, sampleSize);

      const testEmails = sampleDomains.map((domain) => `test@${domain}`);
      const iterations = 10;

      const start = performance.now();

      for (let i = 0; i < iterations; i++) {
        testEmails.forEach((email) => {
          isTempEmail(email);
        });
      }

      const end = performance.now();
      const totalTime = end - start;
      const totalLookups = testEmails.length * iterations;
      const avgTime = totalTime / totalLookups;

      console.log(`\n📊 Large Scale Benchmark:`);
      console.log(`   Test domains: ${sampleSize.toLocaleString()}`);
      console.log(`   Iterations: ${iterations}`);
      console.log(`   Total lookups: ${totalLookups.toLocaleString()}`);
      console.log(`   Total time: ${totalTime.toFixed(2)}ms`);
      console.log(`   Average per lookup: ${avgTime.toFixed(4)}ms`);
      console.log(`   Lookups per second: ${Math.round(totalLookups / (totalTime / 1000)).toLocaleString()}`);

      expect(avgTime).toBeLessThan(0.1);
    });
  });

  describe('Subdomain Matching Performance', () => {
    it('should measure time for subdomain lookups', () => {
      const testEmails = [
        'test@subdomain.0-180.com',
        'user@mail.0-mail.com',
        'demo@www.10minutemail.com',
        'sample@api.yopmail.com',
      ];

      const iterations = 1000;
      const start = performance.now();

      for (let i = 0; i < iterations; i++) {
        testEmails.forEach((email) => {
          isTempEmail(email);
        });
      }

      const end = performance.now();
      const totalTime = end - start;
      const totalLookups = testEmails.length * iterations;
      const avgTime = totalTime / totalLookups;

      console.log(`\n📊 Subdomain Matching Benchmark:`);
      console.log(`   Test emails: ${testEmails.length}`);
      console.log(`   Iterations: ${iterations.toLocaleString()}`);
      console.log(`   Total lookups: ${totalLookups.toLocaleString()}`);
      console.log(`   Total time: ${totalTime.toFixed(2)}ms`);
      console.log(`   Average per lookup: ${avgTime.toFixed(4)}ms`);
      console.log(`   Lookups per second: ${Math.round(totalLookups / (totalTime / 1000)).toLocaleString()}`);

      expect(avgTime).toBeLessThan(0.2); // Subdomain matching is slightly slower
    });
  });
});

