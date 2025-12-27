/**
 * Optimized Trie data structure for fast domain matching
 * Supports reverse domain matching (e.g., com.tempmail.subdomain)
 */

interface TrieNode {
  children: Map<string, TrieNode>;
  isEnd: boolean;
}

export class DomainTrie {
  private root: TrieNode;

  constructor() {
    this.root = { children: new Map(), isEnd: false };
  }

  /**
   * Insert a domain into the trie
   * Domains are stored in reverse order for efficient suffix matching
   * e.g., "tempmail.com" -> "com.tempmail"
   * Domains are normalized to lowercase
   */
  insert(domain: string): void {
    const normalizedDomain = domain.toLowerCase();
    const reversedParts = normalizedDomain.split('.').reverse();
    let node = this.root;

    for (const part of reversedParts) {
      if (!node.children.has(part)) {
        node.children.set(part, { children: new Map(), isEnd: false });
      }
      node = node.children.get(part)!;
    }

    node.isEnd = true;
  }

  /**
   * Check if domain or any of its suffixes exist in the trie
   * This efficiently checks subdomains
   * e.g., "subdomain.tempmail.com" will match "tempmail.com"
   * 
   * Optimized algorithm: Check all possible suffixes with early exit
   * For "subdomain.tempmail.com", check:
   * - "subdomain.tempmail.com" (full domain)
   * - "tempmail.com" (suffix)
   * - "com" (suffix)
   * Domain is normalized to lowercase
   */
  hasDomain(domain: string): boolean {
    const normalizedDomain = domain.toLowerCase();
    const reversedParts = normalizedDomain.split('.').reverse();
    const partsLength = reversedParts.length;
    
    // Optimized: Check all possible suffixes with early exit
    for (let start = 0; start < partsLength; start++) {
      let node = this.root;
      
      // Try to match from this starting position
      for (let i = start; i < partsLength; i++) {
        const part = reversedParts[i];
        const childNode = node.children.get(part);
        
        // Early exit if no match
        if (!childNode) {
          break;
        }
        
        node = childNode;
        
        // Early exit if we found a match
        if (node.isEnd) {
          return true;
        }
      }
      
      // Check if we matched all parts and reached an end node
      if (node.isEnd) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Build trie from array of domains
   */
  static fromDomains(domains: readonly string[]): DomainTrie {
    const trie = new DomainTrie();
    for (const domain of domains) {
      trie.insert(domain);
    }
    return trie;
  }
}

