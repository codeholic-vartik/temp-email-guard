# Test Suite

This directory contains comprehensive tests for the `temp-email-guard` package.

## Test Files

### `index.test.ts`
Tests for the main package functionality:
- Domain initialization
- Email validation (`isTempEmail`, `validateEmail`)
- Async functions (`isTempEmailAsync`, `validateEmailAsync`)
- Domain retrieval
- Edge cases (case insensitivity, whitespace, special characters)

### `loader.test.ts`
Tests for the domain loader:
- Fetching domains from remote sources
- Caching mechanism
- Merging domains from multiple sources
- Deduplication
- Cache management

### `trie.test.ts`
Tests for the Trie data structure:
- Domain insertion
- Domain matching
- Subdomain matching
- Case insensitivity
- Performance with large domain lists

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests with verbose output
npm run test:verbose
```

## Test Coverage

The test suite covers:
- ✅ Main API functions
- ✅ Domain loading and caching
- ✅ Trie data structure
- ✅ Edge cases and error handling
- ✅ Async operations
- ✅ Multiple source merging

## Notes

- Tests that fetch from remote sources have a 30-second timeout
- Tests clear cache between runs to ensure isolation
- All tests use real domain data from GitHub sources

