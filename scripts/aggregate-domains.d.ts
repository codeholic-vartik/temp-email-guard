/**
 * Domain Aggregator Script
 * Fetches domains from multiple sources and creates a unified dataset
 */
interface DomainSource {
    name: string;
    url: string;
    type: 'json' | 'text' | 'txt';
    transform?: (data: any) => string[];
}
declare const DOMAIN_SOURCES: DomainSource[];
/**
 * Aggregate all domains from all sources
 */
declare function aggregateAllDomains(): Promise<string[]>;
export { aggregateAllDomains, DOMAIN_SOURCES };
//# sourceMappingURL=aggregate-domains.d.ts.map