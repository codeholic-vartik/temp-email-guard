# Performance Benchmarks

This document shows how to test and measure the performance of `temp-email-guard`.

## Quick Start

### Option 1: Standalone Benchmark Script (Recommended)

```bash
npm run benchmark
```

This runs a comprehensive benchmark suite and shows:
- Single lookup performance
- Multiple domain lookup performance
- Mixed email (temp + normal) performance
- Email validation performance
- Large scale performance (1000+ domains)

### Option 2: Jest Benchmark Tests

```bash
npm run test:benchmark
```

Runs benchmark tests as part of the test suite with detailed metrics.

## Performance Results (Optimized)

Based on benchmarks with **185,589 domains** after performance optimizations:

### ⚡ Performance Improvements
- **Multiple lookups**: 33% faster (130ms → 87ms)
- **Mixed emails**: 37% faster (150ms → 94ms)
- **Validation**: 26% faster (42ms → 31ms)
- **Large scale**: 79% faster (19ms → 4ms) 🚀

### Single Lookup
- **Average**: ~0.001ms per lookup
- **Throughput**: **1,000,000+ lookups/second**
- **Memory**: Efficient Trie + Set structure

### Multiple Domain Lookups
- **10 domains × 10,000 iterations**: ~87ms ⚡ (33% faster)
- **Average**: ~0.0009ms per lookup
- **Throughput**: **1,148,000+ lookups/second** 🚀

### Mixed Email Lookups (50% temp, 50% normal)
- **10 domains × 10,000 iterations**: ~94ms ⚡ (37% faster)
- **Average**: ~0.0009ms per lookup
- **Throughput**: **1,063,000+ lookups/second** 🚀

### Email Validation
- **4 emails × 10,000 iterations**: ~31ms ⚡ (26% faster)
- **Average**: ~0.0008ms per validation
- **Throughput**: **1,268,000+ validations/second** 🚀

### Large Scale (1000 domains)
- **1000 domains × 10 iterations**: ~4ms ⚡ (79% faster!)
- **Average**: ~0.0004ms per lookup
- **Throughput**: **2,335,000+ lookups/second** 🚀🚀

## Key Performance Features

✅ **Ultra-fast lookups**: O(1) for exact matches using Set  
✅ **Efficient subdomain matching**: O(m) using Trie where m is domain length  
✅ **LRU Cache**: 1000-entry cache for repeated domain lookups (instant for cached domains)  
✅ **Optimized domain extraction**: Uses indexOf instead of split for faster parsing  
✅ **Pre-compiled regex**: Email validation regex compiled once, reused many times  
✅ **Early exit optimizations**: Fast path for common cases  
✅ **Scalable**: Handles 185k+ domains without performance degradation  
✅ **Memory efficient**: Optimized data structures minimize memory usage

## Optimizations Applied

1. **LRU Cache**: Caches last 1000 checked domains for instant repeated lookups
2. **Optimized Domain Extraction**: Uses `indexOf` and `slice` instead of `split` (faster)
3. **Pre-compiled Regex**: Email validation regex compiled once at module load
4. **Trie Optimizations**: Early exit in Trie lookup algorithm
5. **Early Returns**: Fast path checks before expensive operations  

## Custom Benchmarking

You can create your own benchmarks by:

1. **Using the standalone script**: Edit `benchmark.js` to add your test cases
2. **Using Jest tests**: Add tests to `__tests__/benchmark.test.ts`
3. **Direct usage**: Import and test in your own code

### Example Custom Benchmark

```javascript
const { initialize, isTempEmail } = require('temp-email-guard');

async function customBenchmark() {
  await initialize();
  
  const emails = ['test@0-180.com', 'user@gmail.com', /* ... */];
  const iterations = 10000;
  
  const start = performance.now();
  for (let i = 0; i < iterations; i++) {
    emails.forEach(email => isTempEmail(email));
  }
  const end = performance.now();
  
  console.log(`Time: ${end - start}ms`);
  console.log(`Average: ${(end - start) / (emails.length * iterations)}ms`);
}

customBenchmark();
```

## Notes

- First initialization takes ~2 seconds (fetching from GitHub)
- Subsequent lookups are instant (domains cached in memory)
- Performance is consistent across different domain counts
- Subdomain matching is slightly slower but still very fast (<0.002ms)

