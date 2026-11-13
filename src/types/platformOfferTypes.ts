export type PlatformCampaignType = 'OFFER' | 'BANNER' | 'ANNOUNCEMENT';

export type PlatformCampaignPlacement = 'TOP_RIBBON' | 'HERO_BANNER' | 'BOTH' | 'EMAIL_ONLY';

export type PlatformCampaignTheme =
  | 'SLATE_DARK'
  | 'INDIGO_ROYAL'
  | 'EMERALD_TRUST'
  | 'AMBER_GOLD'
  | 'CRIMSON_ALERT';

export type PlatformCampaignEmailAudience =
  | 'ALL_CLIENTS'
  | 'SUPPLIERS_ONLY'
  | 'BUYERS_ONLY'
  | 'ADMIN_PREVIEW'
  | 'CUSTOM';

export interface PlatformOfferAnnouncement {
  id: string;
  type: PlatformCampaignType;
  title: string;
  badgeLabel: string;
  message: string;
  ctaLabel: string;
  ctaView: string;
  ctaUrl?: string;
  promoCode?: string;
  discountPercent?: number;
  bannerImageUrl?: string;
  placement: PlatformCampaignPlacement;
  themePreset: PlatformCampaignTheme;
  isActive: boolean;
  startsAt?: string;
  expiresAt?: string;
  emailSubject?: string;
  emailIntro?: string;
  lastEmailedAt?: string;
  lastEmailCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface PlatformCampaignBatchReceipt {
  recipient: string;
  success: boolean;
  enforcedDelayMs?: number;
  messageId?: string;
  dispatchedAt?: string;
  error?: string;
}

export interface PlatformCampaignBatchStatus {
  campaignId: string | null;
  campaignTitle: string;
  isRunning: boolean;
  totalRecipients: number;
  processedCount: number;
  deliveredCount: number;
  failedCount: number;
  currentRecipient: string | null;
  launchedAt: string | null;
  completedAt: string | null;
  receipts: PlatformCampaignBatchReceipt[];
}
