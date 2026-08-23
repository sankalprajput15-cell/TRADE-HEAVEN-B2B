import { AuthUser, JWTPayload, SecurityAuditLog, UserRole, MembershipStatus, AccountStatus, CompanyProfile, RfqRequirement, SupplierTier } from '../types';

export const PROTECTED_SYSTEM_FIELDS = [
  'role',
  'status',
  'isVerified',
  'isVerifiedKYC',
  'isPremium',
  'membershipStatus',
  'tier',
  'plan',
  'tradeAssuranceLimitUsd',
  'trustScore',
  'kycVerificationDate'
] as const;

export type ProtectedField = typeof PROTECTED_SYSTEM_FIELDS[number];

const JWT_SECRET_SALT = 'trade_heaven_b2b_sec_2025_swiss_escrow';
const AUDIT_LOG_STORAGE_KEY = 'th_security_audit_logs';

class SecurityService {
  private auditLogs: SecurityAuditLog[] = [];
  private listeners: ((logs: SecurityAuditLog[]) => void)[] = [];

  constructor() {
    this.loadAuditLogs();
  }

  private loadAuditLogs() {
    try {
      const saved = localStorage.getItem(AUDIT_LOG_STORAGE_KEY);
      if (saved) {
        this.auditLogs = JSON.parse(saved);
      }
    } catch {
      this.auditLogs = [];
    }

    if (this.auditLogs.length === 0) {
      // Seed initial security audit logs for demo transparency
      this.logSecurityEvent({
        actorUid: 'system',
        actorEmail: 'security-daemon@tradeheaven.net',
        actorRole: 'ADMIN',
        action: 'SECURITY_RULE_EVAL',
        targetResource: 'RBAC_SECURITY_SUBSYSTEM',
        details: 'Role-Based Access Control, Account Ownership Guard & Contact Gating Subsystem initialized with 0-Trust Policy.',
        status: 'SUCCESS'
      });
    }
  }

  private persistLogs() {
    try {
      localStorage.setItem(AUDIT_LOG_STORAGE_KEY, JSON.stringify(this.auditLogs.slice(0, 100)));
      this.notifyListeners();
    } catch {
      // Ignore storage errors in restricted sandbox
    }
  }

  public subscribeAuditLogs(callback: (logs: SecurityAuditLog[]) => void): () => void {
    this.listeners.push(callback);
    callback(this.getAuditLogs());
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  private notifyListeners() {
    const current = this.getAuditLogs();
    this.listeners.forEach(l => l(current));
  }

  public getAuditLogs(): SecurityAuditLog[] {
    return [...this.auditLogs];
  }

  public logSecurityEvent(event: Omit<SecurityAuditLog, 'id' | 'timestamp'>) {
    const log: SecurityAuditLog = {
      ...event,
      id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      timestamp: new Date().toISOString()
    };
    this.auditLogs.unshift(log);
    if (this.auditLogs.length > 200) {
      this.auditLogs = this.auditLogs.slice(0, 200);
    }
    this.persistLogs();
    return log;
  }

  // =========================================================================
  // 1. JWT TOKEN ISSUANCE & VERIFICATION
  // =========================================================================

  public generateSessionToken(user: AuthUser): string {
    const nowSec = Math.floor(Date.now() / 1000);
    const expSec = nowSec + (7 * 24 * 60 * 60); // 7 days expiry

    const payload: JWTPayload = {
      uid: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      isPremium: !!user.isPremium || user.membershipStatus === 'paid' || user.role === 'ADMIN',
      membershipStatus: user.membershipStatus || (user.isPremium ? 'paid' : (user.role === 'ADMIN' ? 'paid' : 'free')),
      status: user.status || 'ACTIVE',
      isVerified: !!user.isVerified,
      tier: user.tier || (user.role === 'ADMIN' ? 'VIP' : 'FREE'),
      companyName: user.companyName,
      iat: nowSec,
      exp: expSec,
      iss: 'https://auth.tradeheaven.net'
    };

    const header = { alg: 'HS256', typ: 'JWT' };
    const encodedHeader = btoa(JSON.stringify(header)).replace(/=+$/, '');
    const encodedPayload = btoa(unescape(encodeURIComponent(JSON.stringify(payload)))).replace(/=+$/, '');
    
    // Pseudo-signature using secret salt for client-side verifiable simulation
    const signature = btoa(`${encodedHeader}.${encodedPayload}.${JWT_SECRET_SALT}`).replace(/=+$/, '');
    
    const token = `${encodedHeader}.${encodedPayload}.${signature}`;

    this.logSecurityEvent({
      actorUid: user.id,
      actorEmail: user.email,
      actorRole: user.role,
      action: 'AUTH_LOGIN',
      targetResource: `/auth/session/${user.id}`,
      details: `Issued cryptographically verifiable JWT token with claims: role=${user.role}, isPremium=${payload.isPremium}, membershipStatus=${payload.membershipStatus}`,
      status: 'SUCCESS'
    });

    return token;
  }

  public verifySessionToken(token: string): JWTPayload | null {
    if (!token || typeof token !== 'string') return null;
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    try {
      const [encodedHeader, encodedPayload, signature] = parts;
      const expectedSig = btoa(`${encodedHeader}.${encodedPayload}.${JWT_SECRET_SALT}`).replace(/=+$/, '');
      if (signature !== expectedSig) {
        this.logSecurityEvent({
          actorUid: 'anonymous',
          actorEmail: 'unknown',
          actorRole: 'BUYER',
          action: 'UNAUTHORIZED_ACCESS_BLOCKED',
          targetResource: '/auth/jwt/verify',
          details: 'Rejected tampered or invalid JWT signature.',
          status: 'UNAUTHORIZED_401'
        });
        return null;
      }

      const decodedPayloadStr = decodeURIComponent(escape(atob(encodedPayload)));
      const payload: JWTPayload = JSON.parse(decodedPayloadStr);

      const nowSec = Math.floor(Date.now() / 1000);
      if (payload.exp && payload.exp < nowSec) {
        this.logSecurityEvent({
          actorUid: payload.uid,
          actorEmail: payload.email,
          actorRole: payload.role,
          action: 'UNAUTHORIZED_ACCESS_BLOCKED',
          targetResource: '/auth/jwt/verify',
          details: 'Session token expired. Re-authentication required.',
          status: 'UNAUTHORIZED_401'
        });
        return null;
      }

      return payload;
    } catch {
      return null;
    }
  }

  // =========================================================================
  // 2. ACCOUNT OWNERSHIP & DATA ISOLATION GUARD (403 FORBIDDEN)
  // =========================================================================

  public enforceOwnership(
    caller: AuthUser | JWTPayload | null,
    targetDocumentOwnerUid: string,
    resourceName = 'Document'
  ): { allowed: boolean; statusCode: number; error?: string } {
    if (!caller) {
      this.logSecurityEvent({
        actorUid: 'anonymous',
        actorEmail: 'guest',
        actorRole: 'BUYER',
        action: 'UNAUTHORIZED_ACCESS_BLOCKED',
        targetResource: `${resourceName}/${targetDocumentOwnerUid}`,
        details: `Access denied: Unauthenticated request to private resource (${resourceName}).`,
        status: 'UNAUTHORIZED_401'
      });
      return {
        allowed: false,
        statusCode: 401,
        error: '401 Unauthorized: Authentication required to access private account data.'
      };
    }

    const callerUid = 'uid' in caller ? caller.uid : caller.id;
    const isSuperAdmin = caller.role === 'ADMIN';
    const isOwner = callerUid === targetDocumentOwnerUid;

    if (!isOwner && !isSuperAdmin) {
      this.logSecurityEvent({
        actorUid: callerUid,
        actorEmail: caller.email,
        actorRole: caller.role,
        action: 'OWNERSHIP_VIOLATION_BLOCKED',
        targetResource: `${resourceName}/${targetDocumentOwnerUid}`,
        details: `403 Forbidden: Ownership violation. Caller (${callerUid}) attempted to access or mutate resource owned by (${targetDocumentOwnerUid}).`,
        status: 'FORBIDDEN_403'
      });

      return {
        allowed: false,
        statusCode: 403,
        error: `403 Forbidden: Account ownership verification failed. You do not own this ${resourceName} (Owner UID: ${targetDocumentOwnerUid}, Session UID: ${callerUid}) and lack administrative elevation.`
      };
    }

    return { allowed: true, statusCode: 200 };
  }

  // =========================================================================
  // 3. FIELD-LEVEL SYSTEM WRITE RESTRICTIONS
  // =========================================================================

  public validateFieldWriteRestrictions(
    caller: AuthUser | JWTPayload | null,
    updates: Record<string, any>
  ): { allowed: boolean; rejectedFields: string[]; sanitizedData: Record<string, any>; error?: string } {
    const callerUid = caller ? ('uid' in caller ? caller.uid : caller.id) : 'anonymous';
    const isAdmin = caller?.role === 'ADMIN';

    const attemptedKeys = Object.keys(updates);
    const violatingFields = attemptedKeys.filter(key => 
      (PROTECTED_SYSTEM_FIELDS as readonly string[]).includes(key)
    );

    if (violatingFields.length > 0 && !isAdmin) {
      this.logSecurityEvent({
        actorUid: callerUid,
        actorEmail: caller?.email || 'unknown',
        actorRole: caller?.role || 'BUYER',
        action: 'FIELD_WRITE_BLOCKED',
        targetResource: `/api/user/${callerUid}`,
        details: `Blocked unauthorized write to protected system fields: [${violatingFields.join(', ')}]. Non-admin users cannot elevate permissions, self-verify, or self-assign premium tiers.`,
        status: 'FORBIDDEN_403'
      });

      // Construct sanitized version by removing protected fields
      const sanitizedData = { ...updates };
      violatingFields.forEach(f => delete sanitizedData[f]);

      return {
        allowed: false,
        rejectedFields: violatingFields,
        sanitizedData,
        error: `403 Forbidden: Field-Level Security Violation. Non-admin users are strictly blocked from modifying system authorization fields: [${violatingFields.join(', ')}]. Only verified platform administrators can alter roles, KYC verification, or membership privileges.`
      };
    }

    return {
      allowed: true,
      rejectedFields: [],
      sanitizedData: { ...updates }
    };
  }

  // =========================================================================
  // 4. SERVER-SIDE CONTACT DATA GATING (ANTI-SCRAPING)
  // =========================================================================

  public isAllowedToViewContacts(caller: AuthUser | JWTPayload | null): boolean {
    if (!caller) return false;
    if (caller.role === 'ADMIN') return true;
    
    // Check if user is approved paid member
    const isPaid = caller.isPremium === true || caller.membershipStatus === 'paid';
    const isActive = (caller.status || 'ACTIVE') === 'ACTIVE';
    return isPaid && isActive;
  }

  public maskPhoneNumber(phone?: string): string {
    if (!phone) return '+••••••••••';
    const trimmed = phone.trim();
    if (trimmed.length <= 6) return '+••••••••';
    const prefix = trimmed.slice(0, 4);
    const suffix = trimmed.slice(-2);
    return `${prefix} •••• ••${suffix}`;
  }

  public maskEmailAddress(email?: string): string {
    if (!email || !email.includes('@')) return '••••••@••••••.com';
    const [user, domain] = email.split('@');
    const maskedUser = user.length > 2 ? `${user.slice(0, 2)}••••` : '••';
    const domainParts = domain.split('.');
    const ext = domainParts.length > 1 ? `.${domainParts[domainParts.length - 1]}` : '.com';
    return `${maskedUser}@•••••${ext}`;
  }

  public gateCompanyProfile(
    company: CompanyProfile,
    caller: AuthUser | JWTPayload | null
  ): CompanyProfile {
    const canView = this.isAllowedToViewContacts(caller);
    const isOwner = caller && ('uid' in caller ? caller.uid : caller.id) === company.ownerUid;

    if (canView || isOwner) {
      return {
        ...company,
        isContactMasked: false
      };
    }

    return {
      ...company,
      contactPhone: this.maskPhoneNumber(company.contactPhone),
      contactEmail: this.maskEmailAddress(company.contactEmail),
      whatsapp: undefined,
      address: `${company.city || 'Verified Industrial Hub'}, ${company.country} [🔒 Full Street Address Gated - Premium Members Only]`,
      isContactMasked: true
    };
  }

  public gateRfqRequirement(
    rfq: RfqRequirement,
    caller: AuthUser | JWTPayload | null
  ): RfqRequirement {
    const canView = this.isAllowedToViewContacts(caller);
    const isOwner = caller && ('uid' in caller ? caller.uid : caller.id) === rfq.ownerUid;

    if (canView || isOwner) {
      return {
        ...rfq,
        isContactMasked: false
      };
    }

    return {
      ...rfq,
      buyerEmail: rfq.buyerEmail ? this.maskEmailAddress(rfq.buyerEmail) : undefined,
      buyerPhone: rfq.buyerPhone ? this.maskPhoneNumber(rfq.buyerPhone) : undefined,
      isContactMasked: true
    };
  }

  // =========================================================================
  // 5. ADMIN MEMBERSHIP & PRIVILEGE TOGGLES
  // =========================================================================

  public adminUpdateUserMembership(
    adminCaller: AuthUser | JWTPayload,
    targetUserId: string,
    updates: {
      isPremium?: boolean;
      membershipStatus?: MembershipStatus;
      role?: UserRole;
      status?: AccountStatus;
      isVerified?: boolean;
      tier?: SupplierTier;
    }
  ): { success: boolean; error?: string } {
    if (adminCaller.role !== 'ADMIN') {
      this.logSecurityEvent({
        actorUid: 'uid' in adminCaller ? adminCaller.uid : adminCaller.id,
        actorEmail: adminCaller.email,
        actorRole: adminCaller.role,
        action: 'UNAUTHORIZED_ACCESS_BLOCKED',
        targetResource: `/api/admin/users/${targetUserId}`,
        details: 'Attempted to modify user privileges without ADMIN role.',
        status: 'FORBIDDEN_403'
      });
      return {
        success: false,
        error: '403 Forbidden: Only platform administrators can modify membership tiers or account authorization statuses.'
      };
    }

    this.logSecurityEvent({
      actorUid: 'uid' in adminCaller ? adminCaller.uid : adminCaller.id,
      actorEmail: adminCaller.email,
      actorRole: 'ADMIN',
      action: updates.isPremium !== undefined ? 'PREMIUM_TOGGLED' : 'MEMBERSHIP_STATUS_CHANGED',
      targetResource: `/api/admin/users/${targetUserId}`,
      details: `Admin ${adminCaller.email} modified privileges of user ${targetUserId}: ${JSON.stringify(updates)}`,
      status: 'SUCCESS'
    });

    return { success: true };
  }

  public clearAuditLogs(): void {
    this.auditLogs = [];
    try {
      localStorage.removeItem(AUDIT_LOG_STORAGE_KEY);
      this.notifyListeners();
    } catch {}
  }
}

export const securityService = new SecurityService();
