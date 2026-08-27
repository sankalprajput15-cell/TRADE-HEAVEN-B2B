export interface ArchitecturePillar {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  summary: string;
  sections: {
    title: string;
    description: string;
    codeSnippet?: {
      language: string;
      code: string;
      filename?: string;
    };
    diagramType?: 'topology' | 'rbac' | 'db_schema' | 'api_flow' | 'incoterms' | 'roadmap';
    keyPoints?: string[];
  }[];
}

export const ARCHITECTURE_PILLARS: ArchitecturePillar[] = [
  {
    id: 'pillar-1',
    number: 1,
    title: 'High-Level Architecture & Tech Stack Selection',
    subtitle: 'Distributed Multi-Tier Topology, Global Edge Latency & Security Hardening',
    summary: 'A resilient, low-latency, multi-tenant B2B architecture designed for global trade transactions, sub-100ms catalog search, fault-tolerant message streaming, and ISO 27001 / GDPR compliance.',
    sections: [
      {
        title: '1.1 Production-Grade Technology Stack',
        description: 'Selected enterprise stack optimized for extreme read throughput, faceted multi-attribute search, strict transactional integrity for escrows, and real-time cross-border negotiation.',
        keyPoints: [
          'Frontend: Next.js 15 / React 19 SPA with Tailwind CSS v4, Motion animations, Lucide icons, and TanStack Query for server-state synchronization.',
          'API Gateway & Edge: Cloudflare Enterprise + Kong API Gateway for rate limiting, SSL termination, geo-routing, and DDoS mitigation.',
          'Backend Microservices: Node.js (TypeScript) + Go 1.23 for high-throughput RFQ matching & messaging services, Express/Fastify modular services.',
          'Relational Primary Storage: PostgreSQL 16 with Citus extension for multi-tenant horizontal sharding and read replicas in US-East, EU-Central, and AP-East.',
          'Search & Discovery: OpenSearch 2.14 / Elasticsearch 8.x with custom B2B analyzers for Product Classifications, MOQ ranges, and company synonyms.',
          'In-Memory Caching: Redis 7.2 Cluster with Redis Sentinel for session caching, rate limiting, and real-time live lead ticker pub/sub.',
          'Asynchronous Message Broker: Apache Kafka / RabbitMQ for event-driven decoupled pipelines (KYC verification events, RFQ supplier broadcast, email/WhatsApp notifications).',
          'Real-Time WebSocket Gateway: Socket.io with Redis adapter on dedicated Node.js clusters for instant buyer-supplier trade negotiations.'
        ],
        codeSnippet: {
          language: 'typescript',
          filename: 'infrastructure/system-topology.config.ts',
          code: `// Trade Heaven - Core System Architecture Topology
export const SYSTEM_TOPOLOGY = {
  edge: {
    cdn: 'Cloudflare Enterprise with Tiered Edge Caching',
    waf: 'Cloudflare WAF with OWASP Core Ruleset + Custom B2B Scraper Shield',
    geoRouting: 'Anycast DNS with latency-based routing to nearest edge pop'
  },
  gateway: {
    type: 'Kong API Gateway (OpenID Connect / JWT validation, Rate Limiting 120 req/min)',
    protocols: ['HTTP/2', 'HTTP/3 (QUIC)', 'WSS (Secure WebSockets)']
  },
  microservices: {
    authService: { runtime: 'Node.js / Express', port: 4001, responsibilities: ['SSO', 'RBAC', '2FA', 'OAuth2'] },
    catalogService: { runtime: 'Node.js / Fastify', port: 4002, responsibilities: ['Products', 'Categories', 'FOB Tiers'] },
    searchService: { runtime: 'Go 1.23', port: 4003, responsibilities: ['OpenSearch Proxy', 'Faceted Aggregation'] },
    rfqMatchEngine: { runtime: 'Go 1.23 (gRPC)', port: 4004, responsibilities: ['Automated Supplier Scoring & Distribution'] },
    chatNegotiation: { runtime: 'Node.js (Socket.io)', port: 4005, responsibilities: ['Negotiation Threads', 'Proforma Generator'] },
    billingService: { runtime: 'Node.js', port: 4006, responsibilities: ['Stripe / PayPal / trade protection / Tier Upgrades'] }
  },
  databases: {
    primaryRelational: 'PostgreSQL 16 (Patroni HA with async multi-region streaming replication)',
    cacheLayer: 'Redis 7.2 Cluster (6 nodes with auto-failover and persistence RDB+AOF)',
    searchEngine: 'OpenSearch Cluster (3 Master + 6 Data Nodes, Multi-AZ)'
  }
};`
        }
      }
    ]
  }
];
