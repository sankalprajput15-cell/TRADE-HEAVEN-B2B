import { 
  GeminiModelMeta, 
  FeatureFlagDefinition, 
  SaaSPlan, 
  ModelRateLimitRule, 
  UserSubscriptionRecord, 
  StripeSyncEvent,
  PlanPricingMetrics 
} from '../types/planPricingTypes';

export const GEMINI_MODELS_CATALOG: GeminiModelMeta[] = [
  {
    id: 'gemini-2.5-pro',
    name: 'Pro 2.5 (Flagship)',
    codename: 'models/gemini-2.5-pro',
    contextWindowTokens: 2000000,
    maxOutputTokens: 8192,
    modalities: ['TEXT', 'IMAGE', 'AUDIO', 'VIDEO', 'PDF', 'CODE'],
    minTierRequired: 'PRO',
    defaultRpm: 300,
    defaultRpd: 50000,
    costPer1mInputUsd: 1.25,
    costPer1mOutputUsd: 5.00,
    description: 'Flagship reasoning and multimodal model with deep analysis, 2M context window, and native audio/visual comprehension.'
  },
  {
    id: 'gemini-2.5-flash',
    name: 'Flash 2.5 (High Speed)',
    codename: 'models/gemini-2.5-flash',
    contextWindowTokens: 1000000,
    maxOutputTokens: 8192,
    modalities: ['TEXT', 'IMAGE', 'AUDIO', 'VIDEO', 'PDF', 'CODE'],
    minTierRequired: 'STARTER',
    defaultRpm: 1000,
    defaultRpd: 150000,
    costPer1mInputUsd: 0.15,
    costPer1mOutputUsd: 0.60,
    description: 'Ultra-fast, high-throughput model optimized for low-latency agentic loops, coding, and real-time inference.'
  },
  {
    id: 'gemini-2.0-flash-thinking-exp',
    name: 'Flash Thinking (Reasoning)',
    codename: 'models/gemini-2.0-flash-thinking-exp-01-21',
    contextWindowTokens: 1000000,
    maxOutputTokens: 65536,
    modalities: ['TEXT', 'CODE', 'IMAGE'],
    minTierRequired: 'PRO',
    defaultRpm: 120,
    defaultRpd: 10000,
    costPer1mInputUsd: 0.20,
    costPer1mOutputUsd: 0.80,
    description: 'Specialized reasoning model that outputs visible Chain-of-Thought deliberation steps for complex math and architecture.',
    isThinkingModel: true
  },
  {
    id: 'gemini-1.5-pro',
    name: 'Pro 1.5 (Standard)',
    codename: 'models/gemini-1.5-pro',
    contextWindowTokens: 2000000,
    maxOutputTokens: 8192,
    modalities: ['TEXT', 'IMAGE', 'AUDIO', 'VIDEO', 'PDF', 'CODE'],
    minTierRequired: 'STARTER',
    defaultRpm: 360,
    defaultRpd: 30000,
    costPer1mInputUsd: 1.25,
    costPer1mOutputUsd: 5.00,
    description: 'Battle-tested 2M token context model for massive codebase repository parsing and complex multi-document synthesis.'
  },
  {
    id: 'gemini-1.5-flash',
    name: 'Flash 1.5 (Efficient)',
    codename: 'models/gemini-1.5-flash',
    contextWindowTokens: 1000000,
    maxOutputTokens: 8192,
    modalities: ['TEXT', 'IMAGE', 'AUDIO', 'VIDEO', 'PDF', 'CODE'],
    minTierRequired: 'FREE',
    defaultRpm: 15,
    defaultRpd: 1500,
    costPer1mInputUsd: 0.075,
    costPer1mOutputUsd: 0.30,
    description: 'Lightweight, rapid response workhorse model ideal for classification, summarization, and interactive chat.'
  },
  {
    id: 'text-embedding-004',
    name: 'Text Embedding 004',
    codename: 'models/text-embedding-004',
    contextWindowTokens: 2048,
    maxOutputTokens: 768,
    modalities: ['TEXT'],
    minTierRequired: 'FREE',
    defaultRpm: 1500,
    defaultRpd: 500000,
    costPer1mInputUsd: 0.025,
    costPer1mOutputUsd: 0.0,
    description: 'High-density 768-dimensional semantic embeddings for vector search, RAG retrieval, and classification clusters.'
  },
  {
    id: 'imagen-3.0-generate-002',
    name: 'Imagen 3 Generation',
    codename: 'models/imagen-3.0-generate-002',
    contextWindowTokens: 512,
    maxOutputTokens: 1024,
    modalities: ['IMAGE'],
    minTierRequired: 'PRO',
    defaultRpm: 60,
    defaultRpd: 2500,
    costPer1mInputUsd: 0.03,
    costPer1mOutputUsd: 0.03,
    description: 'Photorealistic image generation model with precision typographic text rendering and aspect ratio customization.'
  }
];

export const FEATURE_DEFINITIONS_CATALOG: FeatureFlagDefinition[] = [
  // 1. Models & Compute
  {
    key: 'access_gemini_2_5_pro',
    name: 'Pro Model 2.5 Access',
    description: 'Full production access to flagship 2M token context model.',
    category: 'MODELS',
    iconName: 'Cpu'
  },
  {
    key: 'access_flash_thinking',
    name: 'Flash Thinking Reasoning Engine',
    description: 'Chain-of-thought visible reasoning traces for deep problem-solving.',
    category: 'MODELS',
    iconName: 'Brain'
  },
  {
    key: 'multimodal_audio_video',
    name: 'Multimodal Audio & Video Ingestion',
    description: 'Direct ingestion of MP4, WAV, MP3, and high-resolution PDF document streams.',
    category: 'MODELS',
    iconName: 'Film'
  },
  {
    key: 'imagen_3_generation',
    name: 'High-Res Image Synthesis',
    description: 'Generate high-definition 1:1, 16:9, and 9:16 generative image assets.',
    category: 'MODELS',
    iconName: 'Image'
  },

  // 2. Grounding & Tools
  {
    key: 'web_search_grounding',
    name: 'Web Search Live Grounding',
    description: 'Live real-time factual web verification with citations and dynamic URLs.',
    category: 'GROUNDING_TOOLS',
    iconName: 'Globe'
  },
  {
    key: 'code_execution_sandbox',
    name: 'Python Code Execution Sandbox',
    description: 'Automated sandboxed Python runtime for data visualization and computation.',
    category: 'GROUNDING_TOOLS',
    iconName: 'Terminal'
  },
  {
    key: 'function_calling_json',
    name: 'Structured JSON & Function Calling',
    description: 'Deterministic tool calling and strict OpenAPI schema JSON outputs.',
    category: 'GROUNDING_TOOLS',
    iconName: 'Code'
  },

  // 3. Developer Tools & Config
  {
    key: 'custom_system_prompts',
    name: 'Custom System Instructions',
    description: 'Persistent persona framing and guardrail enforcement in inference calls.',
    category: 'DEVELOPER_TOOLS',
    iconName: 'Settings'
  },
  {
    key: 'fine_tuning_lora',
    name: 'Custom Model Fine-Tuning (LoRA)',
    description: 'Upload custom JSONL datasets to create adapter weights on foundation base models.',
    category: 'DEVELOPER_TOOLS',
    isAddon: true,
    addonPriceMonthlyUsd: 150,
    iconName: 'Wrench'
  },
  {
    key: 'batch_inference_api',
    name: 'Batch Async Inference API',
    description: '50% discounted asynchronous bulk prompt processing for offline pipelines.',
    category: 'DEVELOPER_TOOLS',
    iconName: 'Layers'
  },

  // 4. Enterprise SLA & Support
  {
    key: 'priority_queue_sla',
    name: 'Dedicated Low-Latency Priority Queue',
    description: 'Sub-300ms time-to-first-token routing bypassing standard public queues.',
    category: 'ENTERPRISE_SLA',
    iconName: 'Zap'
  },
  {
    key: 'sla_99_95_uptime',
    name: '99.95% Guaranteed Availability SLA',
    description: 'Financial uptime guarantee with automated credit restitution policies.',
    category: 'ENTERPRISE_SLA',
    iconName: 'ShieldCheck'
  },
  {
    key: 'dedicated_slack_concierge',
    name: 'Dedicated Private Slack/Discord Channel',
    description: 'Direct 24/7 access to AI Solutions Architects and Google Cloud engineering.',
    category: 'ENTERPRISE_SLA',
    iconName: 'MessageSquare'
  },

  // 5. Compliance & Security
  {
    key: 'zero_data_retention',
    name: 'Zero Customer Data Retention (ZDR)',
    description: 'Guaranteed customer prompts & completions are never used for model training.',
    category: 'COMPLIANCE',
    iconName: 'Lock'
  },
  {
    key: 'hipaa_soc2_baa',
    name: 'SOC 2 Type II & HIPAA BAA Agreement',
    description: 'Signed Business Associate Agreement for healthcare and enterprise workloads.',
    category: 'COMPLIANCE',
    iconName: 'FileCheck'
  },
  {
    key: 'vpc_private_link',
    name: 'Dedicated VPC Private Service Connect',
    description: 'Direct private peering into Google Cloud infrastructure without traversing public internet.',
    category: 'COMPLIANCE',
    isAddon: true,
    addonPriceMonthlyUsd: 200,
    iconName: 'Network'
  }
];

export const INITIAL_SAAS_PLANS: SaaSPlan[] = [];

export const INITIAL_MODEL_RATE_LIMITS: ModelRateLimitRule[] = [
  // Free Developer
  {
    id: 'limit-free-flash',
    planId: 'plan-free-dev',
    modelId: 'gemini-1.5-flash',
    rpm: 15,
    rpd: 1500,
    tpm: 100000,
    tpd: 5000000,
    maxConcurrent: 2,
    isPriorityQueue: false
  },
  {
    id: 'limit-free-embed',
    planId: 'plan-free-dev',
    modelId: 'text-embedding-004',
    rpm: 60,
    rpd: 5000,
    tpm: 200000,
    tpd: 10000000,
    maxConcurrent: 5,
    isPriorityQueue: false
  },

  // Starter
  {
    id: 'limit-starter-25flash',
    planId: 'plan-starter-ai',
    modelId: 'gemini-2.5-flash',
    rpm: 60,
    rpd: 10000,
    tpm: 500000,
    tpd: 35000000,
    maxConcurrent: 8,
    isPriorityQueue: false
  },
  {
    id: 'limit-starter-15pro',
    planId: 'plan-starter-ai',
    modelId: 'gemini-1.5-pro',
    rpm: 30,
    rpd: 3000,
    tpm: 250000,
    tpd: 15000000,
    maxConcurrent: 4,
    isPriorityQueue: false
  },

  // Pro AI Studio
  {
    id: 'limit-pro-25pro',
    planId: 'plan-pro-ai',
    modelId: 'gemini-2.5-pro',
    rpm: 300,
    rpd: 50000,
    tpm: 2000000,
    tpd: 180000000,
    maxConcurrent: 25,
    isPriorityQueue: true,
    latencySlaMs: 450
  },
  {
    id: 'limit-pro-thinking',
    planId: 'plan-pro-ai',
    modelId: 'gemini-2.0-flash-thinking-exp',
    rpm: 120,
    rpd: 10000,
    tpm: 800000,
    tpd: 50000000,
    maxConcurrent: 10,
    isPriorityQueue: true,
    latencySlaMs: 600
  },
  {
    id: 'limit-pro-25flash',
    planId: 'plan-pro-ai',
    modelId: 'gemini-2.5-flash',
    rpm: 1000,
    rpd: 150000,
    tpm: 4000000,
    tpd: 180000000,
    maxConcurrent: 50,
    isPriorityQueue: true,
    latencySlaMs: 250
  },

  // Enterprise Scale
  {
    id: 'limit-ent-25pro',
    planId: 'plan-enterprise-scale',
    modelId: 'gemini-2.5-pro',
    rpm: 1500,
    rpd: 250000,
    tpm: 10000000,
    tpd: 1000000000,
    maxConcurrent: 100,
    isPriorityQueue: true,
    latencySlaMs: 280
  },
  {
    id: 'limit-ent-thinking',
    planId: 'plan-enterprise-scale',
    modelId: 'gemini-2.0-flash-thinking-exp',
    rpm: 500,
    rpd: 50000,
    tpm: 4000000,
    tpd: 400000000,
    maxConcurrent: 40,
    isPriorityQueue: true,
    latencySlaMs: 400
  }
];

export const INITIAL_USER_SUBSCRIPTIONS: UserSubscriptionRecord[] = [
  {
    id: 'sub-001',
    userId: 'user-apex-ai-01',
    userEmail: 'dev@apexdynamics.com',
    userName: 'Brett Vance (Apex AI Engineering)',
    companyName: 'Apex Dynamics Inc.',
    planId: 'plan-pro-ai',
    planName: 'Pro AI Studio',
    status: 'ACTIVE',
    billingCycle: 'MONTHLY',
    currentPeriodStart: '2026-08-01T00:00:00Z',
    currentPeriodEnd: '2026-09-01T00:00:00Z',
    cancelAtPeriodEnd: false,
    stripeSubscriptionId: 'sub_1P9x45Km890aLs',
    stripeCustomerId: 'cus_R89kL04vbm',
    stripePriceId: 'price_1NqProStudioM_99',
    tokensUsedThisMonth: 114200000,
    monthlySpendUsd: 99,
    createdAt: '2025-05-12T10:00:00Z',
    updatedAt: '2026-08-01T00:00:00Z'
  },
  {
    id: 'sub-002',
    userId: 'user-kuka-02',
    userEmail: 'klaus.becker@kuka-robotics.de',
    userName: 'Dr. Klaus Becker',
    companyName: 'KUKA Robotics GmbH',
    planId: 'plan-enterprise-scale',
    planName: 'Enterprise Dedicated Scale',
    status: 'ACTIVE',
    billingCycle: 'ANNUAL',
    currentPeriodStart: '2026-01-15T00:00:00Z',
    currentPeriodEnd: '2027-01-15T00:00:00Z',
    cancelAtPeriodEnd: false,
    stripeSubscriptionId: 'sub_1P8a99Xw231mNs',
    stripeCustomerId: 'cus_K44mQ18ztt',
    stripePriceId: 'price_1NqEnterpriseY_4990',
    tokensUsedThisMonth: 642000000,
    monthlySpendUsd: 415.83,
    createdAt: '2025-01-15T08:00:00Z',
    updatedAt: '2026-01-15T08:00:00Z'
  },
  {
    id: 'sub-003',
    userId: 'user-nordic-03',
    userEmail: 'lars.nilsson@nordicenergy.se',
    userName: 'Lars Nilsson',
    companyName: 'Nordic Clean Energy Solutions AB',
    planId: 'plan-starter-ai',
    planName: 'Starter AI Studio',
    status: 'ACTIVE',
    billingCycle: 'MONTHLY',
    currentPeriodStart: '2026-08-10T00:00:00Z',
    currentPeriodEnd: '2026-09-10T00:00:00Z',
    cancelAtPeriodEnd: false,
    stripeSubscriptionId: 'sub_1Q0b12Jk554tYp',
    stripeCustomerId: 'cus_N99vX02aab',
    stripePriceId: 'price_1Old_starter_25', // Grandfathered price example!
    tokensUsedThisMonth: 28400000,
    monthlySpendUsd: 25,
    createdAt: '2025-03-10T14:20:00Z',
    updatedAt: '2026-08-10T14:20:00Z'
  },
  {
    id: 'sub-004',
    userId: 'user-shenzhen-04',
    userEmail: 'chen.wei@apexpower.cn',
    userName: 'Wei Chen',
    companyName: 'ApexPower Energy Tech Co.',
    planId: 'plan-pro-ai',
    planName: 'Pro AI Studio',
    status: 'ACTIVE',
    billingCycle: 'ANNUAL',
    currentPeriodStart: '2026-04-01T00:00:00Z',
    currentPeriodEnd: '2027-04-01T00:00:00Z',
    cancelAtPeriodEnd: false,
    stripeSubscriptionId: 'sub_1Q2c88Lm339kZq',
    stripeCustomerId: 'cus_S55mP88rww',
    stripePriceId: 'price_1NqProStudioY_990',
    tokensUsedThisMonth: 155000000,
    monthlySpendUsd: 82.50,
    createdAt: '2025-04-01T09:00:00Z',
    updatedAt: '2026-04-01T09:00:00Z'
  }
];

export const INITIAL_STRIPE_SYNC_EVENTS: StripeSyncEvent[] = [
  {
    id: 'event-sync-001',
    planId: 'plan-pro-ai',
    planName: 'Pro AI Studio',
    eventType: 'PRICE_CREATED',
    status: 'SUCCESS',
    details: 'New Monthly Price created in Stripe Catalog ($99.00/mo). Old Price price_1Old_pro_89 preserved for grandfathered users.',
    stripePriceId: 'price_1NqProStudioM_99',
    stripeProductId: 'prod_gemini_pro_studio',
    previousPriceUsd: 89,
    newPriceUsd: 99,
    timestamp: '2026-02-20T09:15:00Z',
    rawPayloadPreview: '{"id": "price_1NqProStudioM_99", "product": "prod_gemini_pro_studio", "unit_amount": 9900, "currency": "usd", "recurring": {"interval": "month"}}'
  },
  {
    id: 'event-sync-002',
    planId: 'plan-enterprise-scale',
    planName: 'Enterprise Dedicated Scale',
    eventType: 'PRODUCT_UPDATED',
    status: 'SUCCESS',
    details: 'Stripe Product metadata updated with Pro 2.5 2M context quota allocation (1B tokens/mo, 1500 RPM).',
    stripeProductId: 'prod_gemini_enterprise_scale',
    timestamp: '2026-02-22T16:00:00Z',
    rawPayloadPreview: '{"id": "prod_gemini_enterprise_scale", "name": "Enterprise Dedicated Scale", "metadata": {"rpm": 1500, "token_quota": 1000000000}}'
  },
  {
    id: 'event-sync-003',
    planId: 'plan-starter-ai',
    planName: 'Starter AI Studio',
    eventType: 'WEBHOOK_RECEIVED',
    status: 'SUCCESS',
    details: 'Webhook invoice.payment_succeeded verified from Stripe IP. Period extended to 2026-09-10.',
    stripePriceId: 'price_1Old_starter_25',
    timestamp: '2026-08-10T14:20:00Z',
    rawPayloadPreview: '{"event": "invoice.payment_succeeded", "customer": "cus_N99vX02aab", "subscription": "sub_1Q0b12Jk554tYp", "amount_paid": 2500}'
  },
  {
    id: 'event-sync-004',
    eventType: 'CATALOG_SYNC_SUCCESS',
    status: 'SUCCESS',
    details: 'Bi-directional sync completed: 4 active plans, 8 Stripe price points, 4 webhook endpoints validated healthy.',
    timestamp: '2026-08-25T18:00:00Z',
    rawPayloadPreview: '{"synced_products": 4, "synced_prices": 8, "errors": 0, "latency_ms": 142}'
  }
];

export const INITIAL_PRICING_METRICS: PlanPricingMetrics = {
  totalPlans: 5,
  activePlans: 4,
  archivedPlans: 1,
  totalSubscribers: 10893,
  totalMonthlyRevenueUsd: 198450,
  annualRunRateUsd: 2381400,
  totalTokensAllocated: 1220000000,
  totalTokensConsumedThisMonth: 10669200000,
  tokenUtilizationRate: 68.4,
  stripeSyncStatus: 'HEALTHY',
  lastSyncedAt: '2026-08-26T02:00:00Z'
};
