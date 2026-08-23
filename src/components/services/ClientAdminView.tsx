import React, { useState, useEffect } from 'react';
import { Currency, PaymentTerms, AuthUser, UserRole, MembershipStatus, AccountStatus, SecurityAuditLog } from '../../types';
import { CURRENCY_RATES } from '../../data/mockData';
import { api } from '../../services/apiService';
import { securityService } from '../../services/securityService';
import { 
  Landmark, 
  ShieldCheck, 
  CreditCard, 
  FileText, 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  Send, 
  Sparkles, 
  Building2, 
  Lock, 
  RefreshCw, 
  AlertCircle, 
  ShieldAlert, 
  UserCheck, 
  Users, 
  Sliders, 
  KeyRound, 
  Activity, 
  Unlock, 
  Crown,
  Eye,
  EyeOff,
  Terminal,
  Zap
} from 'lucide-react';

interface Props {
  selectedCurrency: Currency;
  onOpenPaymentCheckout: (data: any) => void;
  currentUser?: AuthUser | null;
  onUpdateCurrentUser?: (updated: AuthUser) => void;
}

export const ClientAdminView: React.FC<Props> = ({
  selectedCurrency,
  onOpenPaymentCheckout,
  currentUser = null,
  onUpdateCurrentUser
}) => {
  const [activeTab, setActiveTab] = useState<'RBAC_USERS' | 'PROFILE_SECURITY' | 'AUDIT_LOGS' | 'TREASURY'>('RBAC_USERS');
  
  // Treasury Form State
  const [wireReference, setWireReference] = useState('');
  const [senderBank, setSenderBank] = useState('Deutsche Bank Frankfurt');
  const [transferAmount, setTransferAmount] = useState(25000);
  const [purpose, setPurpose] = useState('Escrow Deposit for RFQ #RFQ-2025-8901');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);

  // RBAC & User Management State
  const [usersList, setUsersList] = useState<AuthUser[]>([]);
  const [auditLogs, setAuditLogs] = useState<SecurityAuditLog[]>([]);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Self Profile Edit Form State
  const [editName, setEditName] = useState(currentUser?.name || 'David Sterling');
  const [editCompany, setEditCompany] = useState(currentUser?.companyName || 'Sterling Global Procurement Corp');
  const [editCountry, setEditCountry] = useState(currentUser?.country || 'United States');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const curr = CURRENCY_RATES.find(c => c.code === selectedCurrency) || CURRENCY_RATES[0];

  const formatPrice = (usd: number) => {
    const converted = usd * curr.rateToUSD;
    return `${curr.symbol}${converted.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  };

  const loadData = async () => {
    const users = await api.getAllUsers(currentUser);
    setUsersList(users);
    setAuditLogs(securityService.getAuditLogs());
  };

  useEffect(() => {
    loadData();
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      setEditName(currentUser.name);
      setEditCompany(currentUser.companyName || '');
      setEditCountry(currentUser.country || '');
    }
  }, [currentUser]);

  const handleWireSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmissionSuccess(true);
      setWireReference('');
      loadData();
    }, 800);
  };

  // Admin Privilege Mutation Handler
  const handleAdminPrivilegeToggle = async (
    targetUserId: string,
    field: 'isPremium' | 'membershipStatus' | 'role' | 'status' | 'isVerified',
    value: any
  ) => {
    if (!currentUser || currentUser.role !== 'ADMIN') {
      setActionMessage({
        type: 'error',
        text: '403 Forbidden: Only verified ADMIN role can alter user privileges & membership states.'
      });
      return;
    }

    const updates: any = { [field]: value };
    if (field === 'isPremium' && value === true) {
      updates.membershipStatus = 'paid';
    } else if (field === 'isPremium' && value === false) {
      updates.membershipStatus = 'free';
    }

    const res = await api.adminUpdateUserPrivileges(targetUserId, updates, currentUser);
    if (res.success) {
      setActionMessage({
        type: 'success',
        text: res.message || 'Privilege updated successfully'
      });
      loadData();
      if (onUpdateCurrentUser && currentUser.id === targetUserId && res.data) {
        onUpdateCurrentUser(res.data);
      }
    } else {
      setActionMessage({
        type: 'error',
        text: res.error || 'Failed to update privileges'
      });
    }

    setTimeout(() => setActionMessage(null), 4000);
  };

  // Self Profile Update Handler
  const handleSaveSelfProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setIsSavingProfile(true);

    const res = await api.updateUserProfile(
      currentUser.id,
      {
        name: editName,
        companyName: editCompany,
        country: editCountry
      },
      currentUser
    );

    setIsSavingProfile(false);

    if (res.success && res.data) {
      setActionMessage({
        type: 'success',
        text: 'Profile updated securely in adherence to Account Ownership rules.'
      });
      if (onUpdateCurrentUser) {
        onUpdateCurrentUser(res.data);
      }
      loadData();
    } else {
      setActionMessage({
        type: 'error',
        text: res.error || 'Profile update rejected'
      });
    }
    setTimeout(() => setActionMessage(null), 4000);
  };

  // Test Unauthorized Mutation (Exploit Simulation)
  const handleTestExploitAttempt = async () => {
    if (!currentUser) return;

    setActionMessage({
      type: 'error',
      text: 'Simulating unauthorized malicious payload: Attempting self-elevation to ADMIN & isPremium: true...'
    });

    // Directly attempt to push protected keys through update API
    const maliciousPayload: any = {
      role: 'ADMIN',
      isPremium: true,
      membershipStatus: 'paid',
      isVerified: true
    };

    const res = await api.updateUserProfile(currentUser.id, maliciousPayload, currentUser);
    if (!res.success) {
      setActionMessage({
        type: 'error',
        text: `🛡️ Security Enforcement Triggered: [403 Forbidden] ${res.error}`
      });
    } else {
      setActionMessage({
        type: 'success',
        text: 'Request permitted because current caller is already an authorized Master Admin.'
      });
    }

    loadData();
    setTimeout(() => setActionMessage(null), 6000);
  };

  const isAdmin = currentUser?.role === 'ADMIN';

  return (
    <div id="client-admin-treasury-root" className="space-y-6">
      {/* Top Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 lg:p-10 shadow-xl relative overflow-hidden">
        <div className="max-w-3xl space-y-2.5 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold border border-amber-400/30">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Zero-Trust RBAC, Data Gating &amp; Swiss Treasury Console</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white">
            Enterprise Security &amp; Client Admin Console
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
            Enforce role-based access control, server-side contact data gating for paid memberships, account ownership validation, and real-time security audit trails.
          </p>
        </div>

        {/* User Identity Chip */}
        <div className="mt-6 flex items-center gap-3 flex-wrap text-xs bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/10 w-fit">
          <div className="flex items-center gap-1.5 font-bold">
            <span className="text-slate-300">Active Identity:</span>
            <span className="text-white font-mono bg-black/40 px-2 py-0.5 rounded text-[11px] font-bold">
              {currentUser?.name || 'Guest'} (UID: {currentUser?.id || 'guest-anon'})
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-300">Role:</span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
              currentUser?.role === 'ADMIN' ? 'bg-amber-400 text-slate-950' : 'bg-blue-500 text-white'
            }`}>
              {currentUser?.role || 'GUEST'}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-300">Membership:</span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
              currentUser?.isPremium ? 'bg-emerald-400 text-slate-950' : 'bg-slate-700 text-slate-200'
            }`}>
              {currentUser?.isPremium ? 'PAID PREMIUM' : 'FREE TIER'}
            </span>
          </div>
        </div>
      </div>

      {/* Global Action Message Banner */}
      {actionMessage && (
        <div className={`p-4 rounded-2xl border text-xs font-bold flex items-center justify-between gap-3 shadow-md animate-in fade-in ${
          actionMessage.type === 'error' 
            ? 'bg-rose-50 border-rose-200 text-rose-800' 
            : 'bg-emerald-50 border-emerald-200 text-emerald-800'
        }`}>
          <div className="flex items-center gap-2">
            {actionMessage.type === 'error' ? (
              <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            )}
            <span>{actionMessage.text}</span>
          </div>
          <button 
            onClick={() => setActionMessage(null)}
            className="text-[10px] uppercase font-bold text-slate-500 hover:text-slate-900 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('RBAC_USERS')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'RBAC_USERS'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>RBAC Users &amp; Membership Status</span>
          <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">
            {usersList.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('PROFILE_SECURITY')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'PROFILE_SECURITY'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>Account Ownership &amp; Field Protection</span>
        </button>

        <button
          onClick={() => setActiveTab('AUDIT_LOGS')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'AUDIT_LOGS'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Security Audit Trail</span>
          <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-amber-400 text-slate-950 font-black">
            {auditLogs.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('TREASURY')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'TREASURY'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <Landmark className="w-4 h-4" />
          <span>Treasury Wire Settlement</span>
        </button>
      </div>

      {/* TAB 1: RBAC USER DIRECTORY & MEMBERSHIP STATUS CONTROLS */}
      {activeTab === 'RBAC_USERS' && (
        <div className="space-y-5">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-blue-600" />
                  Registered Corporate Accounts &amp; Authorization Matrix
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Admins can toggle paid membership tiers to unlock unmasked phone/email contacts and adjust security clearance.
                </p>
              </div>

              {!isAdmin && (
                <div className="px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-bold flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Admin Mode Required for Mutation</span>
                </div>
              )}
            </div>

            {/* Users Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase text-[10px]">
                    <th className="p-3">User &amp; Organization</th>
                    <th className="p-3">Unique User ID (UID)</th>
                    <th className="p-3">Role</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Membership Tier</th>
                    <th className="p-3 text-right">Admin Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {usersList.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Name & Org */}
                      <td className="p-3">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <span>{user.name}</span>
                          {user.isPremium && (
                            <Crown className="w-3 h-3 text-amber-500" title="Paid Premium Member" />
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500">{user.email}</div>
                        <div className="text-[10px] text-slate-400">{user.companyName}</div>
                      </td>

                      {/* Verified UID */}
                      <td className="p-3 font-mono text-[11px] text-slate-600">
                        <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {user.id}
                        </span>
                      </td>

                      {/* Role Selector */}
                      <td className="p-3">
                        {isAdmin ? (
                          <select
                            value={user.role}
                            onChange={(e) => handleAdminPrivilegeToggle(user.id, 'role', e.target.value as UserRole)}
                            className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 font-bold text-[11px] text-slate-800 cursor-pointer focus:outline-none"
                          >
                            <option value="ADMIN">ADMIN</option>
                            <option value="BUYER">BUYER</option>
                            <option value="SUPPLIER">SUPPLIER</option>
                            <option value="VERIFIER">VERIFIER</option>
                          </select>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-blue-100 text-blue-800">
                            {user.role}
                          </span>
                        )}
                      </td>

                      {/* Account Status */}
                      <td className="p-3">
                        {isAdmin ? (
                          <select
                            value={user.status || 'ACTIVE'}
                            onChange={(e) => handleAdminPrivilegeToggle(user.id, 'status', e.target.value as AccountStatus)}
                            className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 font-bold text-[11px] text-slate-800 cursor-pointer focus:outline-none"
                          >
                            <option value="ACTIVE">ACTIVE</option>
                            <option value="SUSPENDED">SUSPENDED</option>
                            <option value="PENDING_VERIFICATION">PENDING</option>
                          </select>
                        ) : (
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                            user.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {user.status || 'ACTIVE'}
                          </span>
                        )}
                      </td>

                      {/* Membership & Gating */}
                      <td className="p-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                              user.isPremium || user.membershipStatus === 'paid'
                                ? 'bg-amber-400 text-slate-950 shadow-2xs'
                                : 'bg-slate-100 text-slate-600 border border-slate-200'
                            }`}>
                              {user.membershipStatus === 'paid' || user.isPremium ? 'PAID (UNMASKED)' : 'FREE (MASKED)'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Admin Toggle Action */}
                      <td className="p-3 text-right">
                        {isAdmin ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => handleAdminPrivilegeToggle(user.id, 'isPremium', !user.isPremium)}
                              className={`px-3 py-1.5 rounded-xl font-black text-[10px] flex items-center gap-1 transition-all cursor-pointer ${
                                user.isPremium
                                  ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                                  : 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-xs'
                              }`}
                            >
                              {user.isPremium ? (
                                <>
                                  <EyeOff className="w-3 h-3" />
                                  <span>Revoke Premium</span>
                                </>
                              ) : (
                                <>
                                  <Crown className="w-3 h-3" />
                                  <span>Grant Premium</span>
                                </>
                              )}
                            </button>
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">Restricted</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ACCOUNT OWNERSHIP & FIELD PROTECTION VALIDATOR */}
      {activeTab === 'PROFILE_SECURITY' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Profile Editor */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-5 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-blue-600" />
                  Account Profile &amp; Protected Fields
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Authenticated users may edit personal info. System authorization fields are immutable to non-admins.
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveSelfProfile} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Editable: Full Name */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Contact Full Name</label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-bold text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>

                {/* Editable: Company Name */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Company Legal Name</label>
                  <input
                    type="text"
                    required
                    value={editCompany}
                    onChange={(e) => setEditCompany(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-bold text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>

                {/* Editable: Country */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Country Jurisdiction</label>
                  <input
                    type="text"
                    required
                    value={editCountry}
                    onChange={(e) => setEditCountry(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-bold text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>

                {/* Immutable System Field: User UID */}
                <div>
                  <label className="block font-bold text-slate-500 mb-1 flex items-center justify-between">
                    <span>Verified User UID (Immutable)</span>
                    <Lock className="w-3 h-3 text-slate-400" />
                  </label>
                  <input
                    type="text"
                    disabled
                    value={currentUser?.id || 'user-buyer-001'}
                    className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2.5 font-mono text-[11px] text-slate-500 font-bold cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Protected System Authorization Fields Box */}
              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-2">
                <div className="flex items-center justify-between text-xs font-black text-amber-950">
                  <span className="flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-amber-600" />
                    Protected System Authorization Fields (Server-Enforced)
                  </span>
                  <span className="text-[10px] font-mono uppercase bg-amber-200 px-2 py-0.5 rounded text-amber-900">
                    403 Protected
                  </span>
                </div>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  The following keys (<code>['role', 'status', 'isVerified', 'isPremium', 'membershipStatus', 'tier']</code>) cannot be modified by standard users or suppliers.
                </p>

                <div className="grid grid-cols-3 gap-2 pt-2 text-[10px] font-mono">
                  <div className="p-2 bg-white rounded-lg border border-amber-200">
                    <span className="text-slate-400 block text-[9px]">Role:</span>
                    <strong className="text-slate-800">{currentUser?.role || 'BUYER'}</strong>
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-amber-200">
                    <span className="text-slate-400 block text-[9px]">isPremium:</span>
                    <strong className="text-slate-800">{String(currentUser?.isPremium ?? false)}</strong>
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-amber-200">
                    <span className="text-slate-400 block text-[9px]">Status:</span>
                    <strong className="text-slate-800">{currentUser?.status || 'ACTIVE'}</strong>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm cursor-pointer disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isSavingProfile ? 'Enforcing Write Validation...' : 'Save Authorized Fields'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Exploit Simulator & Ownership Sandbox */}
          <div className="lg:col-span-5 bg-slate-900 text-white rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-amber-400" />
                Security Rule Exploit Tester
              </h3>
              <span className="text-[10px] bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded font-mono font-bold border border-rose-500/30">
                0-Trust Guard
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed font-normal">
              Click below to send a mock client-side request attempting to bypass UI controls and modify system authorization fields (elevating role to <code>ADMIN</code> or modifying <code>isPremium</code> without payment).
            </p>

            <div className="p-3 bg-slate-800/90 rounded-2xl border border-slate-700 space-y-1 font-mono text-[11px]">
              <div className="text-slate-400">// Malicious Payload Simulated:</div>
              <div className="text-emerald-400">
                {`PATCH /api/user/${currentUser?.id || 'user-buyer-001'} {
  "role": "ADMIN",
  "isPremium": true,
  "membershipStatus": "paid"
}`}
              </div>
            </div>

            <button
              type="button"
              onClick={handleTestExploitAttempt}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
            >
              <Zap className="w-4 h-4 text-amber-300" />
              <span>Simulate Privilege Escalation Attack</span>
            </button>

            <div className="pt-2 text-[11px] text-slate-400 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Server-side validator intercepts payload and yields 403 Forbidden with immutable audit log.</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: IMMUTABLE SECURITY AUDIT TRAIL */}
      {activeTab === 'AUDIT_LOGS' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-600" />
                Immutable System Security &amp; Authorization Audit Trail
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                All login sessions, data access attempts, 403 Forbidden rejections, and administrative privilege mutations are cryptographically logged.
              </p>
            </div>

            <button
              onClick={() => {
                securityService.clearAuditLogs();
                loadData();
              }}
              className="text-[11px] font-bold text-slate-500 hover:text-rose-600 transition-colors cursor-pointer"
            >
              Reset Audit History
            </button>
          </div>

          <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-1">
            {auditLogs.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No security incidents logged in current session.
              </div>
            ) : (
              auditLogs.map((log) => (
                <div
                  key={log.id}
                  className={`p-3.5 rounded-2xl border text-xs space-y-1.5 transition-all ${
                    log.status === 'FORBIDDEN_403'
                      ? 'bg-rose-50/80 border-rose-200 text-rose-950'
                      : log.action === 'PRIVILEGE_ELEVATION_ATTEMPT_BLOCKED'
                      ? 'bg-amber-50 border-amber-200 text-amber-950'
                      : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2 font-mono font-bold text-[11px]">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                        log.status === 'FORBIDDEN_403' 
                          ? 'bg-rose-600 text-white' 
                          : log.status === 'SUCCESS' 
                          ? 'bg-emerald-600 text-white' 
                          : 'bg-amber-500 text-slate-950'
                      }`}>
                        {log.status}
                      </span>
                      <span className="font-bold">{log.action}</span>
                    </div>

                    <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                      <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                      <span className="bg-slate-200/80 px-1.5 py-0.5 rounded text-slate-700 font-bold">
                        {log.actorRole}
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] leading-relaxed font-normal">
                    {log.details}
                  </p>

                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-1 border-t border-slate-200/60">
                    <span>Target: {log.targetResource}</span>
                    <span>Actor UID: {log.actorUid}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 4: SWIFT WIRE SETTLEMENT & ESCROW BILLING */}
      {activeTab === 'TREASURY' && (
        <div className="space-y-6">
          {/* Financial Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1.5">
              <span className="text-xs text-slate-500 font-semibold">Total Escrow Balance</span>
              <div className="text-2xl font-black text-slate-900 font-mono">{formatPrice(128500)}</div>
              <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Swiss Escrow Vault
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1.5">
              <span className="text-xs text-slate-500 font-semibold">Active Letters of Credit</span>
              <div className="text-2xl font-black text-blue-600 font-mono">{formatPrice(75000)}</div>
              <span className="text-[11px] text-slate-500 font-medium">1 Irrevocable L/C Active</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1.5">
              <span className="text-xs text-slate-500 font-semibold">Pending Wire Confirmations</span>
              <div className="text-2xl font-black text-amber-600 font-mono">1 Transfer</div>
              <span className="text-[11px] text-amber-700 font-medium">SWIFT MT103 In-Review</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1.5">
              <span className="text-xs text-slate-500 font-semibold">Assurance Limit Tier</span>
              <div className="text-2xl font-black text-emerald-600 font-mono">$500,000</div>
              <span className="text-[11px] text-slate-500 font-medium">Enterprise Tier 1</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Wire Submission Left */}
            <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-5 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-blue-600" />
                  Submit SWIFT Wire / Wire Transfer Confirmation
                </h3>
                <span className="text-xs text-slate-500 font-mono font-bold">24-48h Clearance</span>
              </div>

              {submissionSuccess ? (
                <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-200 text-center space-y-3">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                  <h4 className="font-bold text-slate-900">Wire Confirmation Received!</h4>
                  <p className="text-xs text-emerald-800 leading-relaxed font-medium">
                    Our Swiss treasury desk has received your SWIFT MT103 submission and is reconciling with incoming clearing rails.
                  </p>
                  <button
                    onClick={() => setSubmissionSuccess(false)}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Submit Another Transfer
                  </button>
                </div>
              ) : (
                <form onSubmit={handleWireSubmit} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">SWIFT Reference / UTR Number *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g., SWIFT-DEUT-8930219"
                        value={wireReference}
                        onChange={e => setWireReference(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-mono font-bold text-slate-900 focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Remitting Bank Name</label>
                      <input
                        type="text"
                        value={senderBank}
                        onChange={e => setSenderBank(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-bold text-slate-900 focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Transfer Amount (USD)</label>
                      <input
                        type="number"
                        required
                        min="100"
                        value={transferAmount}
                        onChange={e => setTransferAmount(parseFloat(e.target.value) || 0)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-mono font-bold text-slate-900 focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Allocation Purpose</label>
                      <input
                        type="text"
                        value={purpose}
                        onChange={e => setPurpose(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-semibold text-slate-900 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>{isSubmitting ? 'Verifying SWIFT Details...' : 'Notify Treasury Desk of Wire Transfer'}</span>
                  </button>
                </form>
              )}
            </div>

            {/* Official Banking Details Right */}
            <div className="lg:col-span-5 bg-slate-900 text-white rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Landmark className="w-4 h-4 text-amber-400" />
                  Official Escrow Wire Settlement Details
                </h3>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-black border border-emerald-500/30">
                  Active Vault
                </span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 space-y-0.5">
                  <span className="text-[10px] text-slate-400 font-semibold">Beneficiary Name:</span>
                  <div className="font-bold text-white">TRADE HEAVEN GLOBAL ESCROW HOLDINGS SA</div>
                </div>

                <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 space-y-0.5">
                  <span className="text-[10px] text-slate-400 font-semibold">Depository Bank:</span>
                  <div className="font-bold text-white">UBS Switzerland AG, Zurich Head Office</div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 space-y-0.5">
                    <span className="text-[10px] text-slate-400 font-semibold">SWIFT / BIC Code:</span>
                    <div className="font-mono font-bold text-amber-300">UBSWCHZH80A</div>
                  </div>
                  <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 space-y-0.5">
                    <span className="text-[10px] text-slate-400 font-semibold">Clearing Currency:</span>
                    <div className="font-mono font-bold text-white">USD, EUR, GBP, CHF</div>
                  </div>
                </div>

                <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 space-y-0.5">
                  <span className="text-[10px] text-slate-400 font-semibold">IBAN Account (USD Master Vault):</span>
                  <div className="font-mono font-bold text-emerald-400 text-xs truncate">CH93 0023 0230 4910 9481 0</div>
                </div>
              </div>

              <div className="pt-2 text-[11px] text-slate-400 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Includes reference tracking for instantaneous account allocation.</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
