#!/usr/bin/env node

/**
 * Standalone benchmark script
 * Run with: node benchmark.js
 */

const { initialize, isTempEmail, validateEmail, getTempEmailDomains } = require('./dist/index.js');

async function runBenchmarks() {
  console.log('🚀 Initializing temp-email-guard...\n');
  const initStart = performance.now();
  await initialize();
  const initEnd = performance.now();
  console.log(`✅ Initialized in ${(initEnd - initStart).toFixed(2)}ms\n`);

  const domains = getTempEmailDomains();
  console.log(`📊 Loaded ${domains.length.toLocaleString()} domains\n`);
  console.log('='.repeat(60));
  console.log('PERFORMANCE BENCHMARKS');
  console.log('='.repeat(60) + '\n');

  // Benchmark 1: Single lookup
  console.log('📈 Benchmark 1: Single Temp Email Lookup');
  const iterations1 = 100000;
  const start1 = performance.now();
  for (let i = 0; i < iterations1; i++) {
    isTempEmail('test@0-180.com');
  }
  const end1 = performance.now();
  const time1 = end1 - start1;
  console.log(`   Iterations: ${iterations1.toLocaleString()}`);
  console.log(`   Total time: ${time1.toFixed(2)}ms`);
  console.log(`   Average: ${(time1 / iterations1).toFixed(4)}ms per lookup`);
  console.log(`   Throughput: ${Math.round(iterations1 / (time1 / 1000)).toLocaleString()} lookups/sec\n`);

  // Benchmark 2: Multiple domains
  console.log('📈 Benchmark 2: Multiple Temp Email Lookups');
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
  const iterations2 = 10000;
  const start2 = performance.now();
  for (let i = 0; i < iterations2; i++) {
    testEmails.forEach((email) => isTempEmail(email));
  }
  const end2 = performance.now();
  const time2 = end2 - start2;
  const totalLookups2 = testEmails.length * iterations2;
  console.log(`   Test emails: ${testEmails.length}`);
  console.log(`   Iterations: ${iterations2.toLocaleString()}`);
  console.log(`   Total lookups: ${totalLookups2.toLocaleString()}`);
  console.log(`   Total time: ${time2.toFixed(2)}ms`);
  console.log(`   Average: ${(time2 / totalLookups2).toFixed(4)}ms per lookup`);
  console.log(`   Throughput: ${Math.round(totalLookups2 / (time2 / 1000)).toLocaleString()} lookups/sec\n`);

  // Benchmark 3: Mixed emails
  console.log('📈 Benchmark 3: Mixed Email Lookups (50% temp, 50% normal)');
  const mixedEmails = [
    'test@0-180.com',
    'user@gmail.com',
    'demo@10minutemail.com',
    'sample@yahoo.com',
    'check@mailinator.com',
    'verify@outlook.com',
    'temp@throwaway.email',
    'fake@company.com',
    'spam@getnada.com',
    'test@definitelynotreal12345.com',
  ];
  const iterations3 = 10000;
  const start3 = performance.now();
  for (let i = 0; i < iterations3; i++) {
    mixedEmails.forEach((email) => isTempEmail(email));
  }
  const end3 = performance.now();
  const time3 = end3 - start3;
  const totalLookups3 = mixedEmails.length * iterations3;
  console.log(`   Test emails: ${mixedEmails.length}`);
  console.log(`   Iterations: ${iterations3.toLocaleString()}`);
  console.log(`   Total lookups: ${totalLookups3.toLocaleString()}`);
  console.log(`   Total time: ${time3.toFixed(2)}ms`);
  console.log(`   Average: ${(time3 / totalLookups3).toFixed(4)}ms per lookup`);
  console.log(`   Throughput: ${Math.round(totalLookups3 / (time3 / 1000)).toLocaleString()} lookups/sec\n`);

  // Benchmark 4: Validation
  console.log('📈 Benchmark 4: Email Validation');
  const validationEmails = [
    'test@0-180.com',
    'user@definitelynotreal12345.com',
    'invalid-email',
    'demo@10minutemail.com',
  ];
  const iterations4 = 10000;
  const start4 = performance.now();
  for (let i = 0; i < iterations4; i++) {
    validationEmails.forEach((email) => validateEmail(email));
  }
  const end4 = performance.now();
  const time4 = end4 - start4;
  const totalValidations = validationEmails.length * iterations4;
  console.log(`   Test emails: ${validationEmails.length}`);
  console.log(`   Iterations: ${iterations4.toLocaleString()}`);
  console.log(`   Total validations: ${totalValidations.toLocaleString()}`);
  console.log(`   Total time: ${time4.toFixed(2)}ms`);
  console.log(`   Average: ${(time4 / totalValidations).toFixed(4)}ms per validation`);
  console.log(`   Throughput: ${Math.round(totalValidations / (time4 / 1000)).toLocaleString()} validations/sec\n`);

  // Benchmark 5: Large scale
  console.log('📈 Benchmark 5: Large Scale (1000 domains)');
  const sampleSize = Math.min(1000, domains.length);
  const sampleDomains = domains.slice(0, sampleSize);
  const largeScaleEmails = sampleDomains.map((domain) => `test@${domain}`);
  const iterations5 = 10;
  const start5 = performance.now();
  for (let i = 0; i < iterations5; i++) {
    largeScaleEmails.forEach((email) => isTempEmail(email));
  }
  const end5 = performance.now();
  const time5 = end5 - start5;
  const totalLookups5 = largeScaleEmails.length * iterations5;
  console.log(`   Test domains: ${sampleSize.toLocaleString()}`);
  console.log(`   Iterations: ${iterations5}`);
  console.log(`   Total lookups: ${totalLookups5.toLocaleString()}`);
  console.log(`   Total time: ${time5.toFixed(2)}ms`);
  console.log(`   Average: ${(time5 / totalLookups5).toFixed(4)}ms per lookup`);
  console.log(`   Throughput: ${Math.round(totalLookups5 / (time5 / 1000)).toLocaleString()} lookups/sec\n`);

  console.log('='.repeat(60));
  console.log('✅ All benchmarks completed!');
  console.log('='.repeat(60));
}

runBenchmarks().catch(console.error);

