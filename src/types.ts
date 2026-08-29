export type UserRole = 'BUYER' | 'SUPPLIER' | 'ADMIN' | 'VERIFIER';
export type PaymentTerms = 'trade protection' | 'LC_AT_SIGHT' | 'TT_30_70' | 'DP_DA' | string;

export interface PaymentCheckoutData {
  planId: string;
  title: string;
  description: string;
  amountUsd: number;
  type: 'MEMBERSHIP' | 'ESCROW_DEPOSIT' | 'SAMPLE_ORDER' | 'AUDIT_PACKAGE' | string;
  supplierCompany?: string;
}

export interface EscrowMilestone {
  title: string;
  percentage: number;
  amountUsd: number;
  status: 'PENDING' | 'PENDING_APPROVAL' | 'RELEASED';
}

export interface EscrowTransaction {
  id: string;
  rfqId?: string;
  productTitle: string;
  buyerCompany: string;
  supplierCompany: string;
  totalAmountUsd: number;
  depositAmountUsd: number;
  incoterm: Incoterm;
  portOfDestination: string;
  status: 'HELD_IN_ESCROW' | 'RELEASED' | 'DISPUTED' | 'PRODUCTION_ACTIVE';
  milestones: EscrowMilestone[];
  createdAt: string;
}

export interface NegotiationMessage {
  id: string;
  senderId?: string;
  senderRole: 'BUYER' | 'SUPPLIER';
  senderName: string;
  senderCompany?: string;
  content?: string;
  message?: string;
  timestamp: string;
  proposedPriceUsd?: number;
  proposedIncoterm?: Incoterm;
  attachment?: {
    type: 'PROFORMA_INVOICE' | 'SPEC_SHEET' | 'COUNTER_OFFER' | 'CERTIFICATE' | string;
    title: string;
    valueSummary?: string;
  };
}

export interface NegotiationThread {
  id: string;
  rfqId?: string;
  productId?: string;
  productTitle: string;
  buyerId?: string;
  buyerName?: string;
  buyerCompany: string;
  supplierId?: string;
  supplierName?: string;
  supplierCompany?: string;
  currentPriceUsd?: number;
  orderQuantity?: number;
  currentIncoterm?: Incoterm;
  destinationPort?: string;
  status?: 'IN_PROGRESS' | 'AGREED' | 'DISPATCHED_TO_ESCROW' | string;
  agreedPriceUsd?: number;
  agreedQuantity?: number;
  agreedIncoterm?: Incoterm;
  escrowStatus?: 'NONE' | 'FUNDS_LOCKED' | 'PRODUCTION_IN_PROGRESS' | 'SHIPPED' | 'FUNDS_RELEASED';
  messages: NegotiationMessage[];
  lastUpdated?: string;
}

export type MembershipStatus = 'free' | 'paid' | 'expired' | 'grace_period';
export type AccountStatus = 'ACTIVE' | 'SUSPENDED' | 'PENDING';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  password?: string;
  companyName: string;
  country: string;
  role: UserRole;
  status?: AccountStatus;
  tier?: SupplierTier;
  avatarUrl?: string;
  isVerified: boolean;
  isVerifiedAdmin?: boolean;
  isPremium?: boolean;
  membershipStatus?: MembershipStatus;
  plan?: string;
  token?: string;
  joinedDate?: string;
  unlockedContactsCount?: number;
  phone?: string;
}

export interface JWTPayload {
  uid: string;
  email: string;
  name: string;
  role: UserRole;
  isPremium: boolean;
  membershipStatus: MembershipStatus;
  status: AccountStatus;
  isVerified: boolean;
  tier?: SupplierTier;
  companyName: string;
  iat: number;
  exp: number;
  iss: string;
}

export interface SecurityAuditLog {
  id: string;
  timestamp: string;
  actorUid: string;
  actorEmail: string;
  actorRole: UserRole;
  action: 'AUTH_LOGIN' | 'AUTH_LOGOUT' | 'UNAUTHORIZED_ACCESS_BLOCKED' | 'FIELD_WRITE_BLOCKED' | 'OWNERSHIP_VIOLATION_BLOCKED' | 'PREMIUM_TOGGLED' | 'MEMBERSHIP_STATUS_CHANGED' | 'CONTACT_REVEALED' | 'PROFILE_UPDATED' | 'SECURITY_RULE_EVAL';
  targetResource: string;
  details: string;
  status: 'SUCCESS' | 'FORBIDDEN_403' | 'UNAUTHORIZED_401' | 'DENIED';
  ipAddress?: string;
}

export type SupplierTier = 'FREE' | 'SILVER' | 'GOLD' | 'VIP';
export type Incoterm = 'EXW' | 'FOB' | 'CIF' | 'CFR' | 'DDP' | 'FCA' | 'CIP';
export type Currency = 'USD' | 'EUR' | 'GBP' | 'CNY' | 'INR' | 'AED' | 'JPY';

export interface CurrencyRate {
  code: Currency;
  symbol: string;
  rateToUSD: number;
  name: string;
}

export interface CompanyProfile {
  id: string;
  ownerUid?: string;
  companyName: string;
  legalRegistrationNumber: string;
  country: string;
  city: string;
  address: string;
  establishedYear: number;
  businessType: 'Manufacturer' | 'Trading Company' | 'Wholesaler' | 'Exporter' | 'Brokerage';
  tier: SupplierTier;
  status?: 'ACTIVE' | 'PENDING_REVIEW' | 'SUSPENDED';
  isVerifiedKYC: boolean;
  kycVerificationDate?: string;
  trustScore: number; // 0 - 100
  responseRate: string; // e.g., '98.5%'
  avgResponseTime: string; // e.g., '< 2 hours'
  totalEmployees: string;
  annualRevenueUsd: string;
  mainMarkets?: string[];
  certifications?: string[]; // e.g., ['ISO 9001:2015', 'CE', 'RoHS', 'FDA', 'SGS Audited']
  factorySizeSqM: number;
  productionLines: number;
  logoUrl: string;
  bannerUrl: string;
  description: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  whatsapp?: string;
  isContactMasked?: boolean;
  tradeAssuranceLimitUsd: number;
  completedOrdersCount: number;
}

export interface VolumePriceTier {
  minUnits: number;
  maxUnits?: number; // undefined = and above
  priceUsd: number;
}

export interface ProductSpecification {
  name: string;
  value: string;
}

export interface Product {
  id: string;
  supplierId: string;
  supplierName: string;
  supplierCountry: string;
  supplierTier: SupplierTier;
  supplierTrustScore: number;
  title: string;
  category: string;
  subCategory: string;
  images: string[];
  description: string;
  priceTiers?: VolumePriceTier[];
  fobPriceUsd?: number;
  moq: number;
  moqUnit: string; // 'Pieces', 'Metric Tons', 'Cartons', 'Sets', 'Kg'
  sampleAvailable?: boolean;
  samplePriceUsd?: number;
  leadTimeDays: number;
  supportedIncoterms: Incoterm[];
  specifications?: ProductSpecification[];
  packagingDetails?: string;
  portOfDispatch?: string;
  certifications?: string[];
  customizationAvailable?: boolean;
  supplyAbilityPerMonth?: string;
  featured?: boolean;
  createdDate: string;
  ownerEmail?: string;
  ownerId?: string;
}

export interface RfqRequirement {
  id: string;
  ownerUid?: string;
  buyerId?: string;
  buyerName: string;
  buyerCompany: string;
  buyerEmail?: string;
  buyerPhone?: string;
  buyerCountry: string;
  buyerVerified: boolean;
  isContactMasked?: boolean;
  productName: string;
  category: string;
  targetQuantity: number;
  quantityUnit: string;
  targetPriceUsd?: number;
  targetDeliveryDate?: string;
  preferredIncoterm: Incoterm;
  destinationPort: string;
  paymentTerms: string; // e.g. 'L/C at sight', '30% T/T Deposit + 70% B/L', 'Trade Protection Certificate'
  detailedRequirements: string;
  detailedDescription?: string;
  shippingMethod?: string;
  urgency: 'URGENT' | 'STANDARD' | 'LONG_TERM_CONTRACT';
  quotesCount: number;
  postedDate: string;
  expiryDate: string;
  status: 'OPEN' | 'MATCHED' | 'CLOSED';
  matchedSupplierCount: number;
  spamScore: number; // 0 to 100 (low is good)
}

export type RFQ = RfqRequirement;

export interface SupplierQuote {
  id: string;
  rfqId: string;
  supplierId: string;
  supplierName: string;
  supplierTier: SupplierTier;
  supplierCountry?: string;
  supplierTrustScore?: number;
  unitPriceUsd: number;
  totalAmountUsd: number;
  offeredIncoterm: Incoterm;
  incoterm?: Incoterm;
  portOfLoading: string;
  dispatchPort?: string;
  leadTimeDays: number;
  productionLeadTimeDays?: number;
  estimatedTransitDays?: number;
  shippingMethod?: string;
  validityDays: number;
  paymentTerms: string;
  sampleOffered: boolean;
  notes: string;
  technicalNotes?: string;
  submittedDate: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'UNDER_NEGOTIATION';
}

export type ChatMessage = NegotiationMessage;

export interface KycVerificationRecord {
  id: string;
  companyId: string;
  companyName: string;
  country: string;
  registrationNumber: string;
  taxId: string;
  documents: {
    type: string;
    fileName: string;
    verified: boolean;
  }[];
  auditAgentNotes: string;
  status: 'PENDING' | 'UNDER_REVIEW' | 'VERIFIED' | 'REJECTED';
  submittedAt: string;
  tierRequested: SupplierTier;
}

export interface BankAccountDetails {
  id: string;
  label: string;
  currency: Currency | string;
  bankName: string;
  swiftBic: string;
  ibanAccountNumber: string;
  beneficiaryName: string;
  routingCode: string;
  branchAddress: string;
  intermediaryBank?: string;
  intermediarySwift?: string;
  isPrimaryForCurrency: boolean;
  status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE' | 'DEPRECATED';
}

export interface PaidClientRecord {
  id: string;
  companyId?: string;
  companyName: string;
  tier: SupplierTier | string;
  status: 'ACTIVE' | 'GRACE_PERIOD' | 'EXPIRED' | 'PENDING_APPROVAL' | string;
  startsAt?: string;
  renewsAt?: string;
  renewalDate?: string;
  amountPaidUsd?: number;
  totalPaidUsd?: number;
  ltvUsd?: number;
  quoteCreditsRemaining: number;
  paymentMethod: 'WIRE_TRANSFER' | 'STRIPE_CC' | 'ESCROW_WALLET' | 'PAYPAL' | string;
  contactPerson: string;
  contactEmail?: string;
  email?: string;
  country: string;
  autoRenew?: boolean;
  lastInvoiceRef?: string;
  assignedAccountManager?: string;
  logoUrl?: string;
}

export interface PaymentTransaction {
  id: string;
  clientId: string;
  clientName: string;
  type: 'SUBSCRIPTION' | 'ESCROW_DEPOSIT' | 'CREDIT_PACK' | 'AUDIT_FEE';
  amountUsd: number;
  currency: Currency;
  date: string;
  status: 'COMPLETED' | 'PENDING' | 'REFUNDED' | 'FAILED';
  invoiceRef: string;
  paymentMethod: 'WIRE_TRANSFER' | 'STRIPE_CC' | 'ESCROW_WALLET' | 'PAYPAL';
  notes?: string;
  verifiedByAdmin?: string;
}

export interface SubscriptionPlanConfig {
  id: SupplierTier;
  name: string;
  priceAnnualUsd: number;
  priceMonthlyUsd: number;
  dailyLeadQuota: number;
  catalogLimit: number | 'UNLIMITED';
  trustBadge: string;
  escrowDiscountPercent: number;
  priorityPlacement: string;
  dedicatedManager: boolean;
  apiAccess: boolean;
  features: string[];
}

export type BuyerTier = 'FREE' | 'SILVER' | 'GOLD' | 'VIP';

export interface BuyerWarehouse {
  id: string;
  name: string;
  location: string;
  country: string;
  capacitySqFt: number;
  destinationPort: string;
  customsBonded: boolean;
}

export interface DetailedBuyerProfile {
  id: string;
  ownerUid?: string;
  companyName: string;
  legalRegistrationNumber: string;
  dunsNumber?: string;
  taxVatNumber?: string;
  country: string;
  city: string;
  address: string;
  establishedYear: number;
  businessType: 'Corporate Importer' | 'Wholesale Distributor' | 'Retail Chain' | 'OEM Brand' | 'Government Contractor' | 'Trade House';
  tier: BuyerTier;
  isVerifiedKYC: boolean;
  kycVerificationDate?: string;
  trustScore: number; // 0 - 100
  responseRate?: string;
  avgResponseTime?: string;
  totalEmployees?: string;
  annualPurchasingVolumeUsd: string;
  importFrequency: string; // e.g., 'Monthly FCL Shipments'
  targetCategories: string[];
  preferredIncoterms: Incoterm[];
  preferredPaymentTerms: string[];
  activeRfqsCount: number;
  completedImportsCount: number;
  tradeAssuranceEscrowSecuredUsd: number;
  logoUrl: string;
  bannerUrl: string;
  description: string;
  contactPerson: string;
  contactDesignation?: string;
  contactEmail: string;
  contactPhone: string;
  whatsapp?: string;
  isContactMasked?: boolean;
  warehouses?: BuyerWarehouse[];
  complianceRequirements?: string[];
  recentRfqIds?: string[];
}

export type ActiveView = 
  | 'MARKETPLACE_HOME'
  | 'HOMEPAGE'
  | 'BUY_LEADS'
  | 'SUPPLIERS_DIRECTORY'
  | 'BUYERS_DIRECTORY'
  | 'PRODUCT_DIRECTORY'
  | 'POST_BUY_REQUIREMENT'
  | 'POST_SELL_OFFER'
  | 'PREMIUM_SERVICES'
  | 'PREMIUM_MEMBERSHIP'
  | 'INCOTERMS_CALCULATOR'
  | 'CMS_MANAGEMENT'
  | 'CLIENT_ADMIN'
  | 'PLAN_PRICING_ADMIN'
  | 'BULK_ENTITY_CRM'
  | 'RFQ_HUB'
  | 'NEGOTIATION_ROOM'
  | 'DASHBOARD'
  | 'ARCHITECTURE_BLUEPRINT'
  | 'TRADE_TOOLS'
  | 'REFUND_POLICY'
  | 'CONTACT_US'
  | 'ONBOARD_WITH_US'
  | 'ABOUT_US'
  | 'LANDING_PAGE'
  | 'VENDOR_PROFILE'
  | 'BUYER_PROFILE'
  | 'COUNTRY_HUB'
  | 'TRUST_SAFETY'
  | 'INSIGHTS';

export * from './types/planPricingTypes';

export interface ComplianceCertificate {
  id: string;
  name: string;
  category: 'QUALITY' | 'SAFETY' | 'ENVIRONMENT' | 'REGISTRATION' | 'FOOD_AGRICULTURE' | 'TRADE' | string;
  certificateNumber: string;
  issuingAuthority: string;
  issueDate: string;
  expiryDate: string;
  documentUrl: string;
  thumbnailUrl?: string;
  type: 'IMAGE' | 'PDF';
  verified: boolean;
  scope?: string;
  fileSizeMb?: number;
}

export interface FactoryTourImage {
  id: string;
  title: string;
  department: string;
  imageUrl: string;
  caption?: string;
  order?: number;
}

export interface MarketDistributionItem {
  market: string;
  percentage: number;
  topCountries?: string[];
}

export interface FactoryDetails {
  factorySizeSqM: number;
  productionLines: number;
  annualOutputUnits?: string;
  monthlyCapacity?: string;
  rdEngineersCount?: number;
  qaInspectorsCount?: number;
  qcProcedures?: string[];
  testingEquipment?: string[];
  tourGallery?: FactoryTourImage[];
}

export interface VendorContactDetails {
  avatarUrl?: string;
  name: string;
  designation: string;
  email: string;
  phone: string;
  whatsapp?: string;
  languages?: string[];
  timezone?: string;
  isVerified: boolean;
  responseTime?: string;
}

export interface DetailedVendorProfile extends CompanyProfile {
  tradeName?: string;
  taxVatNumber?: string;
  dunsNumber?: string;
  memberTierLabel?: string;
  origin?: string;
  yearsInBusiness?: number;
  tagline?: string;
  acceptedPaymentTerms?: string[];
  supportedIncotermsList?: Incoterm[];
  portsOfDispatch?: string[];
  marketDistribution?: MarketDistributionItem[];
  oemOdmCapabilities?: {
    oemServicesOffered: boolean;
    customLogoPrinting: boolean;
    customPackaging: boolean;
    sampleLeadTimeDays: number;
    prototype3DModeling?: boolean;
    reverseEngineering?: boolean;
  };
  contactPersonDetails?: VendorContactDetails;
  complianceCertificates?: ComplianceCertificate[];
  factoryDetails?: FactoryDetails;
  downloadableBrochureUrl?: string;
}

export interface MediaUploadValidationResult {
  valid: boolean;
  error?: string;
  formattedSize?: string;
}

export interface UploadedMediaItem {
  id: string;
  file?: File;
  previewUrl: string;
  name: string;
  sizeBytes: number;
  type: 'IMAGE' | 'PDF';
  category: 'LOGO' | 'BANNER' | 'PRODUCT' | 'CERTIFICATE' | 'FACTORY';
  title?: string;
  meta?: Record<string, string | number | boolean>;
  uploadedAt: string;
}

export interface VerifiedPartnerRegistration {
  id?: string;
  fullName: string;
  corporateEmail: string;
  phoneOrWhatsapp: string;
  companyName: string;
  websiteUrl?: string;
  country: string;
  city: string;
  roleIntent: 'GENUINE_BUYER' | 'VERIFIED_SUPPLIER' | 'TRADE_AGENT';
  businessType: 'Factory / Manufacturer' | 'OEM / ODM Exporter' | 'Corporate Importer' | 'Wholesale Distributor' | 'Trade House';
  legalRegistrationNumber: string;
  taxOrVatId: string;
  dunsNumber?: string;
  establishedYear: number;
  annualTradeVolumeUsd: string;
  primaryCategories: string[];
  certifications: string[];
  preferredIncoterms: Incoterm[];
  factoryAddress?: string;
  productionCapacityOrRequirement: string;
  verificationDocName?: string;
  agreedToVettingPolicy: boolean;
  status: 'VERIFIED' | 'PENDING_AUDIT';
  submittedAt: string;
}

// ==========================================
// CMS PERMISSIONS & ACCESS CONTROL TYPES
// ==========================================
export type CmsPermissionScope = 
  | 'ALL_ADMIN'
  | 'EDIT_CONTENT'
  | 'EDIT_PRICING'
  | 'EDIT_MEDIA'
  | 'PUBLISH_PRODUCTS'
  | 'MANAGE_PERMISSIONS';

export interface CmsAuthorizedUser {
  id: string;
  email: string;
  name: string;
  role: UserRole | string;
  companyName?: string;
  grantedBy: string; // e.g. 'Sarah Jenkins (Super Admin)'
  grantedAt: string;
  expiresAt?: string;
  scopes: CmsPermissionScope[];
  status: 'ACTIVE' | 'REVOKED' | 'EXPIRED';
  notes?: string;
}

export interface CmsAccessRequest {
  id: string;
  userId?: string;
  email: string;
  name: string;
  companyName?: string;
  role: UserRole | string;
  requestedScopes: CmsPermissionScope[];
  reason: string;
  requestedAt: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reviewedBy?: string;
  reviewedAt?: string;
}
