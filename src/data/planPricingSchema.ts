/**
 * Database Schema Architecture: Plans, Features, PlanFeatures, UserSubscriptions, and ModelRateLimits
 * Compatible with Prisma ORM, PostgreSQL, Cloud SQL, and MySQL.
 */

export const PRISMA_SCHEMA_CODE = `// =========================================================================
// Prisma Schema Definition for SaaS Plan & Pricing Engine
// =========================================================================

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum PlanStatus {
  ACTIVE
  ARCHIVED
  DRAFT
  BETA
}

enum BillingCycle {
  MONTHLY
  ANNUAL
}

enum SubscriptionStatus {
  ACTIVE
  PAST_DUE
  CANCELED
  TRIALING
  INCOMPLETE
  UNPAID
}

enum FeatureCategory {
  MODELS
  GROUNDING_TOOLS
  DEVELOPER_TOOLS
  ENTERPRISE_SLA
  COMPLIANCE
}

enum GeminiModelTier {
  FREE
  STARTER
  PRO
  ENTERPRISE
}

// 1. Core Plans Table
model Plan {
  id                      String             @id @default(cuid())
  name                    String             @db.VarChar(100)
  slug                    String             @unique @db.VarChar(100)
  description             String?            @db.Text
  status                  PlanStatus         @default(ACTIVE)
  tierBadge               String             @default("STARTER") @db.VarChar(50)
  isPopular               Boolean            @default(false)
  displayOrder            Int                @default(0)

  // Billing Cycles & Currency (Stored in cents/cents-equivalent or Decimal)
  monthlyPriceCents       Int                @default(0) // e.g. 2900 = $29.00
  annualPriceCents        Int                @default(0) // e.g. 29000 = $290.00
  discountPercentage      Decimal            @default(0.0) @db.Decimal(5, 2)
  currency                String             @default("USD") @db.VarChar(3)

  // Token & Usage Allocations
  tokenQuotaMonthly       BigInt             @default(5000000) // Input + Output quota
  rpm                     Int                @default(15)      // Requests Per Minute
  rpd                     Int                @default(1500)    // Requests Per Day
  tpm                     Int?               @default(100000)  // Tokens Per Minute
  maxContextWindow        Int                @default(128000)  // Tokens max context
  maxOutputTokens         Int                @default(8192)    // Max completion output
  maxConcurrentRequests   Int                @default(5)

  // Allowed Gemini Model Identifiers (JSON array of strings)
  allowedModels           Json               @default("[]")

  // Stripe & Payment Gateway Identifiers
  stripeProductId         String?            @unique @db.VarChar(100)
  stripePriceIdMonthly    String?            @db.VarChar(100)
  stripePriceIdAnnual     String?            @db.VarChar(100)
  previousStripePriceIds  String[]           @default([]) // Grandfathering history
  paddlePlanId            String?            @db.VarChar(100)

  // Relationships
  planFeatures            PlanFeature[]
  modelRateLimits         ModelRateLimit[]
  userSubscriptions       UserSubscription[]
  stripeSyncLogs          StripeSyncLog[]

  createdAt               DateTime           @default(now())
  updatedAt               DateTime           @updatedAt

  @@index([status, displayOrder])
  @@index([slug])
  @@map("plans")
}

// 2. Features Dictionary Table
model Feature {
  id                  String           @id @default(cuid())
  key                 String           @unique @db.VarChar(100) // e.g. 'web_search_grounding'
  name                String           @db.VarChar(150)
  description         String?          @db.Text
  category            FeatureCategory  @default(DEVELOPER_TOOLS)
  isAddon             Boolean          @default(false)
  addonPriceMonthlyCents Int?          @default(0)
  iconName            String?          @db.VarChar(50)

  // Relationships
  planFeatures        PlanFeature[]

  createdAt           DateTime         @default(now())
  updatedAt           DateTime         @updatedAt

  @@index([category])
  @@map("features")
}

// 3. PlanFeatures Join & Matrix Table
model PlanFeature {
  id          String   @id @default(cuid())
  planId      String
  featureKey  String
  isIncluded  Boolean  @default(true)
  quotaLimit  Int?     // Optional numeric quota if applicable
  quotaUnit   String?  @db.VarChar(50) // e.g. 'searches/mo', 'calls/day'
  metadata    Json?    @default("{}")

  // Relations
  plan        Plan     @relation(fields: [planId], references: [id], onDelete: Cascade)
  feature     Feature  @relation(fields: [featureKey], references: [key], onDelete: Cascade)

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@unique([planId, featureKey])
  @@index([planId])
  @@index([featureKey])
  @@map("plan_features")
}

// 4. ModelRateLimits Table (Granular Gemini Model Throttling per Plan)
model ModelRateLimit {
  id                   String    @id @default(cuid())
  planId               String
  modelId              String    @db.VarChar(100) // e.g. 'gemini-2.5-pro'
  rpm                  Int       @default(60)     // Requests Per Minute for this model
  rpd                  Int       @default(5000)   // Requests Per Day for this model
  tpm                  Int       @default(500000) // Tokens Per Minute for this model
  tpd                  BigInt?                    // Tokens Per Day
  maxConcurrent        Int       @default(5)
  isPriorityQueue      Boolean   @default(false)  // Dedicated low-latency queue
  latencySlaMs         Int?                       // Guaranteed response SLA target

  plan                 Plan      @relation(fields: [planId], references: [id], onDelete: Cascade)

  createdAt            DateTime  @default(now())
  updatedAt            DateTime  @updatedAt

  @@unique([planId, modelId])
  @@index([planId])
  @@index([modelId])
  @@map("model_rate_limits")
}

// 5. UserSubscriptions Table
model UserSubscription {
  id                        String              @id @default(cuid())
  userId                    String              @db.VarChar(100)
  userEmail                 String              @db.VarChar(255)
  userName                  String?             @db.VarChar(150)
  planId                    String
  status                    SubscriptionStatus  @default(ACTIVE)
  billingCycle              BillingCycle        @default(MONTHLY)
  
  currentPeriodStart        DateTime
  currentPeriodEnd          DateTime
  cancelAtPeriodEnd         Boolean             @default(false)
  canceledAt                DateTime?

  // Stripe Subscription & Grandfathered Price Locking
  stripeSubscriptionId      String?             @unique @db.VarChar(100)
  stripeCustomerId          String?             @db.VarChar(100)
  stripePriceId             String              @db.VarChar(100) // Preserves locked grandfathered price
  
  // Custom Overrides for VIP/Custom Deals
  customTokenQuotaOverride  BigInt?
  customRpmOverride         Int?

  // Current Usage Cache
  tokensUsedThisPeriod      BigInt              @default(0)
  requestsCountThisPeriod   Int                 @default(0)

  plan                      Plan                @relation(fields: [planId], references: [id], onDelete: Restrict)

  createdAt                 DateTime            @default(now())
  updatedAt                 DateTime            @updatedAt

  @@index([userId])
  @@index([userEmail])
  @@index([planId])
  @@index([status])
  @@index([stripeCustomerId])
  @@map("user_subscriptions")
}

// 6. Stripe & Gateway Sync Audit Logs
model StripeSyncLog {
  id                 String   @id @default(cuid())
  planId             String?
  eventType          String   @db.VarChar(100)
  status             String   @db.VarChar(50) // SUCCESS, FAILED
  details            String   @db.Text
  stripePriceId      String?  @db.VarChar(100)
  stripeProductId    String?  @db.VarChar(100)
  previousPriceCents Int?
  newPriceCents      Int?
  payloadJson        Json?

  plan               Plan?    @relation(fields: [planId], references: [id], onDelete: SetNull)

  createdAt          DateTime @default(now())

  @@index([planId])
  @@index([eventType])
  @@map("stripe_sync_logs")
}
`;

export const SQL_DDL_CODE = `-- =========================================================================
-- PostgreSQL / Cloud SQL Relational DDL & Check Constraints
-- SaaS Plan & Pricing Management
-- =========================================================================

-- 1. Create Enums
CREATE TYPE plan_status AS ENUM ('ACTIVE', 'ARCHIVED', 'DRAFT', 'BETA');
CREATE TYPE billing_cycle AS ENUM ('MONTHLY', 'ANNUAL');
CREATE TYPE subscription_status AS ENUM ('ACTIVE', 'PAST_DUE', 'CANCELED', 'TRIALING', 'INCOMPLETE', 'UNPAID');
CREATE TYPE feature_category AS ENUM ('MODELS', 'GROUNDING_TOOLS', 'DEVELOPER_TOOLS', 'ENTERPRISE_SLA', 'COMPLIANCE');

-- 2. Plans Table
CREATE TABLE IF NOT EXISTS plans (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    status plan_status DEFAULT 'ACTIVE' NOT NULL,
    tier_badge VARCHAR(50) DEFAULT 'STARTER' NOT NULL,
    is_popular BOOLEAN DEFAULT FALSE NOT NULL,
    display_order INT DEFAULT 0 NOT NULL,
    
    -- Pricing in cents / safe integer precision
    monthly_price_cents INT NOT NULL CHECK (monthly_price_cents >= 0),
    annual_price_cents INT NOT NULL CHECK (annual_price_cents >= 0),
    discount_percentage NUMERIC(5,2) DEFAULT 0.00 CHECK (discount_percentage >= 0 AND discount_percentage <= 100),
    currency VARCHAR(3) DEFAULT 'USD' NOT NULL,
    
    -- Token & Quota Allocations
    token_quota_monthly BIGINT NOT NULL CHECK (token_quota_monthly > 0),
    rpm INT NOT NULL CHECK (rpm > 0),
    rpd INT NOT NULL CHECK (rpd > 0),
    tpm INT DEFAULT 100000,
    max_context_window INT NOT NULL CHECK (max_context_window >= 32768),
    max_output_tokens INT NOT NULL CHECK (max_output_tokens >= 1024),
    max_concurrent_requests INT DEFAULT 5 NOT NULL,
    
    -- Model Access
    allowed_models JSONB DEFAULT '[]'::jsonb NOT NULL,
    
    -- Stripe IDs
    stripe_product_id VARCHAR(100) UNIQUE,
    stripe_price_id_monthly VARCHAR(100),
    stripe_price_id_annual VARCHAR(100),
    previous_stripe_price_ids TEXT[] DEFAULT ARRAY[]::TEXT[],
    paddle_plan_id VARCHAR(100),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX idx_plans_status_order ON plans(status, display_order);
CREATE INDEX idx_plans_slug ON plans(slug);

-- 3. Features Table
CREATE TABLE IF NOT EXISTS features (
    id VARCHAR(64) PRIMARY KEY,
    key VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    category feature_category DEFAULT 'DEVELOPER_TOOLS' NOT NULL,
    is_addon BOOLEAN DEFAULT FALSE NOT NULL,
    addon_price_monthly_cents INT DEFAULT 0,
    icon_name VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX idx_features_category ON features(category);

-- 4. Plan Features Matrix Table
CREATE TABLE IF NOT EXISTS plan_features (
    id VARCHAR(64) PRIMARY KEY,
    plan_id VARCHAR(64) NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
    feature_key VARCHAR(100) NOT NULL REFERENCES features(key) ON DELETE CASCADE,
    is_included BOOLEAN DEFAULT TRUE NOT NULL,
    quota_limit INT,
    quota_unit VARCHAR(50),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT uq_plan_feature UNIQUE(plan_id, feature_key)
);

CREATE INDEX idx_plan_features_plan_id ON plan_features(plan_id);
CREATE INDEX idx_plan_features_feature_key ON plan_features(feature_key);

-- 5. Model Rate Limits Table
CREATE TABLE IF NOT EXISTS model_rate_limits (
    id VARCHAR(64) PRIMARY KEY,
    plan_id VARCHAR(64) NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
    model_id VARCHAR(100) NOT NULL,
    rpm INT NOT NULL CHECK (rpm > 0),
    rpd INT NOT NULL CHECK (rpd > 0),
    tpm INT NOT NULL CHECK (tpm > 0),
    tpd BIGINT,
    max_concurrent INT DEFAULT 5 NOT NULL,
    is_priority_queue BOOLEAN DEFAULT FALSE NOT NULL,
    latency_sla_ms INT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT uq_plan_model UNIQUE(plan_id, model_id)
);

CREATE INDEX idx_model_rate_limits_plan ON model_rate_limits(plan_id);
CREATE INDEX idx_model_rate_limits_model ON model_rate_limits(model_id);

-- 6. User Subscriptions Table
CREATE TABLE IF NOT EXISTS user_subscriptions (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(100) NOT NULL,
    user_email VARCHAR(255) NOT NULL,
    user_name VARCHAR(150),
    plan_id VARCHAR(64) NOT NULL REFERENCES plans(id) ON DELETE RESTRICT,
    status subscription_status DEFAULT 'ACTIVE' NOT NULL,
    billing_cycle billing_cycle DEFAULT 'MONTHLY' NOT NULL,
    current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    cancel_at_period_end BOOLEAN DEFAULT FALSE NOT NULL,
    canceled_at TIMESTAMP WITH TIME ZONE,
    
    stripe_subscription_id VARCHAR(100) UNIQUE,
    stripe_customer_id VARCHAR(100),
    stripe_price_id VARCHAR(100) NOT NULL, -- Locks in the active price point (Grandfathering)
    
    custom_token_quota_override BIGINT,
    custom_rpm_override INT,
    
    tokens_used_this_period BIGINT DEFAULT 0 NOT NULL,
    requests_count_this_period INT DEFAULT 0 NOT NULL,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX idx_user_subscriptions_user ON user_subscriptions(user_id);
CREATE INDEX idx_user_subscriptions_email ON user_subscriptions(user_email);
CREATE INDEX idx_user_subscriptions_plan ON user_subscriptions(plan_id);
CREATE INDEX idx_user_subscriptions_status ON user_subscriptions(status);

-- 7. Stripe Sync & Audit Logs Table
CREATE TABLE IF NOT EXISTS stripe_sync_logs (
    id VARCHAR(64) PRIMARY KEY,
    plan_id VARCHAR(64) REFERENCES plans(id) ON DELETE SET NULL,
    event_type VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL,
    details TEXT NOT NULL,
    stripe_price_id VARCHAR(100),
    stripe_product_id VARCHAR(100),
    previous_price_cents INT,
    new_price_cents INT,
    payload_json JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX idx_stripe_sync_plan ON stripe_sync_logs(plan_id);
CREATE INDEX idx_stripe_sync_event ON stripe_sync_logs(event_type);
`;

export const PRISMA_SCHEMA_DEFINITION = PRISMA_SCHEMA_CODE;
export const SQL_DDL_DEFINITION = SQL_DDL_CODE;
