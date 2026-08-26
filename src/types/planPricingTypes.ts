import { Currency, UserRole } from '../types';
export type { Currency, UserRole };

export type PlanStatus = 'ACTIVE' | 'ARCHIVED' | 'DRAFT' | 'BETA';
export type BillingCycle = 'MONTHLY' | 'ANNUAL';

export type GeminiModelId = 
  | 'gemini-2.5-pro'
  | 'gemini-2.5-flash'
  | 'gemini-2.0-flash-thinking-exp'
  | 'gemini-1.5-pro'
  | 'gemini-1.5-flash'
  | 'text-embedding-004'
  | 'imagen-3.0-generate-002';

export interface GeminiModelMeta {
  id: GeminiModelId;
  name: string;
  codename: string;
  contextWindowTokens: number;
  maxOutputTokens: number;
  modalities: ('TEXT' | 'IMAGE' | 'AUDIO' | 'VIDEO' | 'PDF' | 'CODE')[];
  minTierRequired: 'FREE' | 'STARTER' | 'PRO' | 'ENTERPRISE';
  defaultRpm: number;
  defaultRpd: number;
  costPer1mInputUsd: number;
  costPer1mOutputUsd: number;
  description: string;
  isThinkingModel?: boolean;
}

export type PlanCategory = 'API_SAAS' | 'SUPPLIER_MEMBERSHIP' | 'BUYER_MEMBERSHIP';

export interface SaaSPlan {
  id: string;
  name: string;
  slug: string;
  description: string;
  status: PlanStatus;
  tierBadge: string;
  isPopular?: boolean;
  displayOrder: number;
  category?: PlanCategory;
  targetAudience?: string;
  featuresList?: string[]; // Direct list of bullet points for membership tiers
  
  // Billing & Pricing
  monthlyPriceUsd: number;
  annualPriceUsd: number;
  discountPercentage: number;
  currency: Currency;
  
  // Token & Usage Allocations
  tokenQuotaMonthly: number; // e.g. 150_000_000
  rpm: number; // Requests per minute
  rpd: number; // Requests per day
  tpm?: number; // Tokens per minute
  maxContextWindow: number; // e.g. 1_000_000 or 2_000_000
  maxOutputTokens: number; // e.g. 8192
  maxConcurrentRequests: number;
  
  // Model Access
  allowedModels: GeminiModelId[];
  
  // Feature flags assigned to this plan
  featureKeys: string[];
  
  // Stripe / Payment Gateway metadata
  stripeProductId?: string;
  stripePriceIdMonthly?: string;
  stripePriceIdAnnual?: string;
  previousStripePriceIds?: string[]; // Price versioning & grandfathering history
  paddlePlanId?: string;
  
  // Live Metrics
  activeSubscribersCount: number;
  monthlyTokenConsumption: number;
  
  createdAt: string;
  updatedAt: string;
}

export type FeatureCategory = 
  | 'MODELS'
  | 'GROUNDING_TOOLS'
  | 'DEVELOPER_TOOLS'
  | 'ENTERPRISE_SLA'
  | 'COMPLIANCE';

export interface FeatureFlagDefinition {
  key: string;
  name: string;
  description: string;
  category: FeatureCategory;
  isAddon?: boolean;
  addonPriceMonthlyUsd?: number;
  iconName?: string;
}

export interface PlanFeatureAssignment {
  id: string;
  planId: string;
  featureKey: string;
  isIncluded: boolean;
  quotaLimit?: number;
  quotaUnit?: string;
}

export interface ModelRateLimitRule {
  id: string;
  planId: string;
  modelId: GeminiModelId;
  rpm: number;
  rpd: number;
  tpm: number;
  tpd?: number;
  maxConcurrent: number;
  isPriorityQueue: boolean;
  latencySlaMs?: number;
}

export interface UserSubscriptionRecord {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  companyName?: string;
  planId: string;
  planName: string;
  status: 'ACTIVE' | 'PAST_DUE' | 'CANCELED' | 'TRIALING' | 'INCOMPLETE';
  billingCycle: BillingCycle;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  stripeSubscriptionId?: string;
  stripeCustomerId?: string;
  stripePriceId: string; // The specific Stripe Price ID locked in (grandfathered)
  customTokenQuotaOverride?: number;
  customRpmOverride?: number;
  tokensUsedThisMonth: number;
  monthlySpendUsd: number;
  createdAt: string;
  updatedAt: string;
}

export interface StripeSyncEvent {
  id: string;
  planId?: string;
  planName?: string;
  eventType: 
    | 'PRODUCT_CREATED'
    | 'PRODUCT_UPDATED'
    | 'PRICE_CREATED'
    | 'PRICE_ARCHIVED'
    | 'GRANDFATHERED_VERSION_CREATED'
    | 'WEBHOOK_RECEIVED'
    | 'CATALOG_SYNC_SUCCESS';
  status: 'SUCCESS' | 'FAILED' | 'PENDING';
  details: string;
  stripePriceId?: string;
  stripeProductId?: string;
  previousPriceUsd?: number;
  newPriceUsd?: number;
  timestamp: string;
  rawPayloadPreview?: string;
}

export interface PlanPricingMetrics {
  totalPlans: number;
  activePlans: number;
  archivedPlans: number;
  totalSubscribers: number;
  totalMonthlyRevenueUsd: number;
  annualRunRateUsd: number;
  totalTokensAllocated: number;
  totalTokensConsumedThisMonth: number;
  tokenUtilizationRate: number;
  stripeSyncStatus: 'HEALTHY' | 'SYNCING' | 'ERROR';
  lastSyncedAt: string;
}
