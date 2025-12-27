# Data Sources

This package aggregates disposable email domains from **9 major public sources** for maximum coverage.

## Active Sources

### 1. disposable-email-domains (Primary)
- **Repository**: https://github.com/disposable-email-domains/disposable-email-domains
- **Format**: Plain text blocklist
- **Size**: ~5,000 domains
- **Status**: ✅ Active
- **Why**: Most widely used, community-maintained, primary reference

### 2. disposable-email-detector
- **Repository**: https://github.com/IntegerAlex/disposable-email-detector
- **Format**: JSON
- **Size**: ~185,000 domains
- **Status**: ✅ Active
- **Why**: Largest single dataset, comprehensive coverage

### 3. ivolo/disposable-email-domains
- **Repository**: https://github.com/ivolo/disposable-email-domains
- **Format**: JSON
- **Size**: ~122,000 domains
- **Status**: ✅ Active
- **Why**: Different contributors, unique domains not in other lists

### 4. martenson/disposable-email-domains
- **Repository**: https://github.com/martenson/disposable-email-domains
- **Format**: Plain text blocklist
- **Size**: ~5,000 domains
- **Status**: ✅ Active
- **Why**: Legacy providers, older services

### 5. mailchecker
- **Repository**: https://github.com/FGRibreau/mailchecker
- **Format**: Plain text
- **Size**: ~56,000 domains
- **Status**: ✅ Active
- **Why**: Comprehensive, well-maintained, used by many projects

### 6. sajjadh47/disposable-email-domains-list
- **Repository**: https://github.com/sajjadh47/disposable-email-domains-list
- **Format**: JSON
- **Size**: ~103,000 domains
- **Status**: ✅ Active
- **Why**: Large dataset, over 100k domains, multiple formats

### 7. WebSnifferHQ/disposable-email-domains
- **Repository**: https://github.com/WebSnifferHQ/disposable-email-domains
- **Format**: Plain text
- **Size**: ~600 domains
- **Status**: ✅ Active
- **Why**: Curated list, regularly updated, quality over quantity

### 8. groundcat/disposable-email-domain-list
- **Repository**: https://github.com/groundcat/disposable-email-domain-list
- **Format**: JSON
- **Size**: ~27,000 domains
- **Status**: ✅ Active
- **Why**: MX record validated, ensures accuracy, cleaned dataset

### 9. disposable/disposable-email-domains
- **Repository**: https://github.com/disposable/disposable-email-domains
- **Format**: Plain text
- **Size**: Varies
- **Status**: ✅ Active
- **Why**: Updated every 24 hours, actively maintained

## Aggregation Results

- **Total domains fetched**: ~575,000+ (from all 9 sources)
- **Duplicates removed**: ~387,000
- **Invalid domains removed**: ~1,000
- **After deduplication**: **188,186 unique domains**
- **Unique TLDs**: 947
- **Coverage**: Maximum from all major public sources
- **Deduplication**: 100% effective (0 duplicates in final dataset)

## Update Frequency

- **GitHub Action**: Runs daily at 2 AM UTC
- **Manual**: Run `npm run aggregate` anytime
- **Runtime**: Fetches from all sources when `initialize()` is called

## Source Reliability

All sources are:
- ✅ Publicly available on GitHub
- ✅ Community-maintained
- ✅ Regularly updated
- ✅ Free to use
- ✅ Trusted by the community

## Adding New Sources

To add a new source, edit:
1. `scripts/aggregate-domains.ts` - Add to `DOMAIN_SOURCES` array
2. `src/data/loader.ts` - Add URL to `DOMAINS_URLS` object
3. Update this file with source information

## Notes

- Some sources may occasionally be unavailable (network issues, rate limits)
- The aggregation script handles failures gracefully
- Missing sources don't break the aggregation process
- Final dataset is always deduplicated and validated

