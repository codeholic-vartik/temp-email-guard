# temp-email-guard

A powerful TypeScript package to detect and guard against temporary email addresses. Built with SWC for fast compilation and optimized with hybrid Set + Trie data structures for ultra-fast lookups, capable of handling millions of domains efficiently.

**Features:**
- 🚀 **188,000+ temporary email domains** aggregated from **9 major sources**:
  - [disposable-email-domains](https://github.com/disposable-email-domains/disposable-email-domains) (primary, community-maintained)
  - [disposable-email-detector](https://github.com/IntegerAlex/disposable-email-detector) (largest dataset ~185k)
  - [ivolo/disposable-email-domains](https://github.com/ivolo/disposable-email-domains) (additional coverage)
  - [martenson/disposable-email-domains](https://github.com/martenson/disposable-email-domains) (legacy providers)
  - [mailchecker](https://github.com/FGRibreau/mailchecker) (comprehensive list)
  - [sajjadh47/disposable-email-domains-list](https://github.com/sajjadh47/disposable-email-domains-list) (100k+ domains)
  - [WebSnifferHQ/disposable-email-domains](https://github.com/WebSnifferHQ/disposable-email-domains) (curated list)
  - [groundcat/disposable-email-domain-list](https://github.com/groundcat/disposable-email-domain-list) (MX validated)
  - [disposable/disposable-email-domains](https://github.com/disposable/disposable-email-domains) (updated every 24h)
- ⚡ **Ultra-fast lookups** - 1,000,000+ lookups/second using optimized Trie + Set hybrid approach
- 📦 **Super lightweight** - domains fetched from GitHub at runtime, keeping package size minimal
- 🔍 **Subdomain detection** - automatically detects subdomains of temp email services
- 💪 **Production ready** - handles 185k+ domains efficiently with sub-millisecond lookups
- 🌐 **Smart loading** - tries local JSON file first (fast), falls back to URLs (always works)
- 🔄 **Automatic aggregation** - merges and deduplicates domains from all sources
- 🤖 **Auto-updates** - GitHub Action runs daily to keep domain list current
- 🎯 **Maximum coverage** - industry-standard approach used by major SaaS platforms
- ⚡ **Fast startup** - loads from local file in ~1.4s vs ~2.3s from URLs

## Installation

```bash
npm install temp-email-guard
```

## Usage

### Recommended: Initialize First (Best Performance)

```javascript
const { initialize, isTempEmail, validateEmail } = require('temp-email-guard');

// Initialize - fetches domains from GitHub (cached after first load)
await initialize();

// Now use synchronous functions (super fast!)
const result1 = isTempEmail('user@0-180.com');
console.log(result1); // true

const result2 = isTempEmail('user@gmail.com');
console.log(result2); // false

// Validate email format and check if it's temporary
const validation = validateEmail('user@0-180.com');
console.log(validation);
// {
//   isValid: true,
//   isTempEmail: true,
//   error: 'Email is from a temporary email service'
// }
```

### Alternative: Use Async Functions

```javascript
const { isTempEmailAsync, validateEmailAsync } = require('temp-email-guard');

// Async functions automatically load domains on first use
const result = await isTempEmailAsync('user@0-180.com');
console.log(result); // true

const validation = await validateEmailAsync('user@0-180.com');
```

### TypeScript/ES Modules

```typescript
import { 
  initialize, 
  isTempEmail, 
  isTempEmailAsync,
  validateEmail, 
  validateEmailAsync,
  ValidationResult 
} from 'temp-email-guard';

// Recommended: Initialize first
await initialize();
const result: boolean = isTempEmail('user@0-180.com');

// Or use async version
const resultAsync: boolean = await isTempEmailAsync('user@0-180.com');
const validation: ValidationResult = await validateEmailAsync('user@0-180.com');
```

## Development

### Build

```bash
npm run build
```

### Watch Mode

```bash
npm run build:watch
```

### Aggregate Domains

Generate the local JSON file from all sources:

```bash
npm run aggregate
```

This creates `data/all-domains.json` which the package will use for faster loading.

## How Domain Loading Works

The package uses a **smart loading strategy**:

1. **First**: Tries to load from local `data/all-domains.json` file (if available)
   - ✅ **Faster**: ~1.4 seconds
   - ✅ **No network**: Works offline
   - ✅ **Best for**: Local development, CI/CD

2. **Fallback**: Fetches from GitHub URLs if file doesn't exist
   - ✅ **Always works**: Even without local file
   - ✅ **Always fresh**: Gets latest from all 5 sources
   - ✅ **Best for**: Published npm packages, browser environments

**Result**: Fast when possible, always works as fallback!

## API

### `initialize(): Promise<void>`

Initializes the package by fetching domains from GitHub. Call this once before using synchronous functions for best performance. Domains are cached in memory after first load.

**Returns:**
- `Promise<void>`: Resolves when domains are loaded and ready

### `isTempEmail(email: string): boolean`

Checks if an email address is from a known temporary email service. Uses optimized hybrid approach: Set for O(1) exact matches and Trie for O(m) subdomain matching where m is domain length.

**Note:** Returns `false` if domains haven't been loaded yet. Call `initialize()` first or use `isTempEmailAsync()`.

**Parameters:**
- `email` (string): The email address to check

**Returns:**
- `boolean`: `true` if the email is from a temporary email service, `false` otherwise

### `isTempEmailAsync(email: string): Promise<boolean>`

Async version that ensures domains are loaded before checking.

**Parameters:**
- `email` (string): The email address to check

**Returns:**
- `Promise<boolean>`: Resolves to `true` if the email is from a temporary email service

### `validateEmail(email: string): ValidationResult`

Validates email format and checks if it's a temporary email.

**Note:** Returns `isTempEmail: false` if domains haven't been loaded yet. Call `initialize()` first or use `validateEmailAsync()`.

**Parameters:**
- `email` (string): The email address to validate

**Returns:**
- `ValidationResult`: An object with the following properties:
  - `isValid` (boolean): Whether the email format is valid
  - `isTempEmail` (boolean): Whether the email is from a temporary email service
  - `error` (string|null): Error message if validation fails

### `validateEmailAsync(email: string): Promise<ValidationResult>`

Async version that ensures domains are loaded before validating.

**Parameters:**
- `email` (string): The email address to validate

**Returns:**
- `Promise<ValidationResult>`: Validation result with domain check

## Performance

- **Hybrid Approach**: Uses `Set` for O(1) exact match lookups + `Trie` for efficient subdomain matching
- **Optimized for Scale**: Handles 184,904+ domains efficiently with O(m) lookup where m is domain length
- **Trie Data Structure**: Custom optimized Trie for fast domain and subdomain suffix matching
- **Memory Efficient**: Trie structure minimizes memory footprint while maintaining fast lookups
- **Super Lightweight**: Domains fetched from GitHub at runtime - package size is minimal
- **Runtime Caching**: Domains cached in memory after first fetch - subsequent lookups are instant
- **Compiled with SWC**: Fast compilation for development
- **Production Ready**: Optimized for high-performance production use

### Performance Characteristics

- **Exact Match**: O(1) using Set
- **Subdomain Match**: O(m) using Trie where m is domain length
- **Memory**: Efficient storage with Trie structure
- **Scalability**: Handles 184,904+ domains without performance degradation
- **Package Size**: Minimal - domains fetched from GitHub, not bundled
- **Domain Database**: Merged from multiple sources:
  - [disposable-email-detector](https://github.com/IntegerAlex/disposable-email-detector) (JSON)
  - [disposable-email-domains](https://github.com/disposable-email-domains/disposable-email-domains) (blocklist)
- **Parallel Fetching**: Fetches from both sources simultaneously for speed
- **Automatic Deduplication**: Merges and deduplicates domains from all sources

## License

ISC

