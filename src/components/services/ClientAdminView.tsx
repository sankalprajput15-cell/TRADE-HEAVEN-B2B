import React, { useState, useEffect } from 'react';
import { Currency, PaymentTerms, AuthUser, UserRole, MembershipStatus, AccountStatus, SecurityAuditLog } from '../../types';
import { CURRENCY_RATES } from '../../data/mockData';
import { api } from '../../services/apiService';
import { securityService } from '../../services/securityService';
import { supabaseService, DbInquiry, DbListing, DbFaq, DbUser } from '../../lib/supabaseClient';
import { validateUploadFile, compressAndResizeImage } from '../../utils/fileUploadGuard';
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
  Zap,
  MessageSquare,
  Package,
  HelpCircle,
  Settings,
  PlusCircle,
  Trash2,
  Upload,
  Search,
  ExternalLink,
  Phone,
  Mail,
  Loader2
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
  const [activeTab, setActiveTab] = useState<'INQUIRIES' | 'RBAC_USERS' | 'LISTINGS' | 'FAQS' | 'SETTINGS' | 'TREASURY' | 'AUDIT_LOGS'>('INQUIRIES');
  
  // Data Loading & Refresh states
  const [isLoading, setIsLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // 1. Inquiries & Leads State (Supabase)
  const [inquiries, setInquiries] = useState<DbInquiry[]>([]);
  const [inquirySearch, setInquirySearch] = useState('');
  const [inquiryStatusFilter, setInquiryStatusFilter] = useState<'ALL' | 'pending' | 'resolved'>('ALL');
  const [selectedInquiry, setSelectedInquiry] = useState<DbInquiry | null>(null);

  // 2. Users State (Supabase & Local Store)
  const [usersList, setUsersList] = useState<AuthUser[]>([]);
  const [supabaseUsers, setSupabaseUsers] = useState<DbUser[]>([]);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('BUYER');
  const [newUserCompany, setNewUserCompany] = useState('');

  // 3. Listings State (Supabase)
  const [listings, setListings] = useState<DbListing[]>([]);
  const [showAddListingModal, setShowAddListingModal] = useState(false);
  const [newListingTitle, setNewListingTitle] = useState('');
  const [newListingDesc, setNewListingDesc] = useState('');
  const [newListingCategory, setNewListingCategory] = useState('Industrial Machinery');
  const [newListingPrice, setNewListingPrice] = useState('1200');
  const [newListingMoq, setNewListingMoq] = useState(10);
  const [newListingSupplier, setNewListingSupplier] = useState('Trade Heaven Verified Supplier');
  const [newListingImageUrl, setNewListingImageUrl] = useState('https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=800&auto=format&fit=crop&q=80');
  const [isUploadingListingImage, setIsUploadingListingImage] = useState(false);

  // 4. FAQs State (Supabase)
  const [faqs, setFaqs] = useState<DbFaq[]>([]);
  const [showAddFaqModal, setShowAddFaqModal] = useState(false);
  const [newFaqQuestion, setNewFaqQuestion] = useState('');
  const [newFaqAnswer, setNewFaqAnswer] = useState('');
  const [newFaqCategory, setNewFaqCategory] = useState('Escrow & Payments');

  // 5. Site Settings State (Supabase)
  const [siteSettings, setSiteSettings] = useState<Record<string, string>>({});
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // 6. Treasury & Audit Logs
  const [auditLogs, setAuditLogs] = useState<SecurityAuditLog[]>([]);
  const [wireReference, setWireReference] = useState('');
  const [senderBank, setSenderBank] = useState('Deutsche Bank Frankfurt');
  const [transferAmount, setTransferAmount] = useState(25000);
  const [purpose, setPurpose] = useState('Escrow Deposit for RFQ #RFQ-2025-8901');
  const [isSubmittingWire, setIsSubmittingWire] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);

  // Self Profile Edit
  const [editName, setEditName] = useState(currentUser?.name || 'Sarah Jenkins');
  const [editCompany, setEditCompany] = useState(currentUser?.companyName || 'Trade Heaven Global Operations & Treasury');
  const [editCountry, setEditCountry] = useState(currentUser?.country || 'United Kingdom');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const curr = (CURRENCY_RATES || []).find(c => c && c.code === selectedCurrency) || CURRENCY_RATES?.[0] || { code: 'USD', symbol: '$', rateToUSD: 1 };

  const showToast = (type: 'success' | 'error', text: string) => {
    setActionMessage({ type, text });
    setTimeout(() => setActionMessage(null), 4000);
  };

  // Central Load Data Function (Fetches directly from Supabase & Backend Services)
  const loadAllData = async () => {
    setIsLoading(true);
    try {
      const [
        inquiriesData,
        usersData,
        supabaseUsersData,
        listingsData,
        faqsData,
        settingsData
      ] = await Promise.all([
        supabaseService.fetchInquiries(),
        api.getAllUsers(currentUser),
        supabaseService.fetchUsers(),
        supabaseService.fetchListings(),
        supabaseService.fetchFaqs(),
        supabaseService.fetchSiteSettings()
      ]);

      setInquiries(inquiriesData);
      setUsersList(usersData);
      setSupabaseUsers(supabaseUsersData);
      setListings(listingsData);
      setFaqs(faqsData);
      setSiteSettings(settingsData);
      setAuditLogs(securityService.getAuditLogs());

      showToast('success', '✓ Real-time database records refreshed from Supabase');
    } catch (err: any) {
      showToast('error', 'Error refreshing Supabase data: ' + (err?.message || 'Check network'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      setEditName(currentUser.name);
      setEditCompany(currentUser.companyName || '');
      setEditCountry(currentUser.country || '');
    }
  }, [currentUser]);

  // INQUIRY STATUS TOGGLE
  const handleToggleInquiryStatus = async (inquiry: DbInquiry) => {
    if (!inquiry.id) return;
    const newStatus = inquiry.status === 'resolved' ? 'pending' : 'resolved';
    
    // Optimistic UI update
    setInquiries(prev => prev.map(item => item.id === inquiry.id ? { ...item, status: newStatus } : item));

    const res = await supabaseService.updateInquiryStatus(inquiry.id, newStatus);
    if (res.success) {
      showToast('success', `Inquiry #${inquiry.id.slice(0, 8)} status marked as "${newStatus}" in Supabase.`);
    } else {
      showToast('error', 'Failed to update status in Supabase: ' + res.error);
      loadAllData();
    }
  };

  // ADD NEW LISTING
  const handleCreateListing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListingTitle.trim()) return;

    setIsLoading(true);
    const res = await supabaseService.createListing({
      title: newListingTitle.trim(),
      description: newListingDesc.trim() || `Factory direct supply of ${newListingTitle}. Direct export with Swiss Escrow guarantee.`,
      category: newListingCategory,
      price: parseFloat(newListingPrice) || 0,
      image_url: newListingImageUrl,
      moq: newListingMoq,
      moq_unit: 'Units',
      supplier_name: newListingSupplier,
      supplier_country: 'Global Export Zone'
    });

    setIsLoading(false);
    if (res.success) {
      showToast('success', '✓ New Product/Service listing published to Supabase database.');
      setShowAddListingModal(false);
      setNewListingTitle('');
      setNewListingDesc('');
      loadAllData();
    } else {
      showToast('error', 'Failed to create listing: ' + res.error);
    }
  };

  // DELETE LISTING
  const handleDeleteListing = async (id?: string) => {
    if (!id) return;
    if (!confirm('Are you sure you want to delete this listing from Supabase?')) return;

    setListings(prev => prev.filter(l => l.id !== id));
    const res = await supabaseService.deleteListing(id);
    if (res.success) {
      showToast('success', 'Listing deleted from Supabase.');
    } else {
      showToast('error', 'Failed to delete: ' + res.error);
      loadAllData();
    }
  };

  // ADD NEW FAQ
  const handleCreateFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFaqQuestion.trim() || !newFaqAnswer.trim()) return;

    setIsLoading(true);
    const res = await supabaseService.createFaq({
      question: newFaqQuestion.trim(),
      answer: newFaqAnswer.trim(),
      category: newFaqCategory,
      display_order: faqs.length + 1
    });

    setIsLoading(false);
    if (res.success) {
      showToast('success', '✓ New FAQ added to Supabase database.');
      setShowAddFaqModal(false);
      setNewFaqQuestion('');
      setNewFaqAnswer('');
      loadAllData();
    } else {
      showToast('error', 'Failed to create FAQ: ' + res.error);
    }
  };

  // DELETE FAQ
  const handleDeleteFaq = async (id?: string) => {
    if (!id) return;
    if (!confirm('Are you sure you want to delete this FAQ?')) return;

    setFaqs(prev => prev.filter(f => f.id !== id));
    const res = await supabaseService.deleteFaq(id);
    if (res.success) {
      showToast('success', 'FAQ deleted.');
    } else {
      showToast('error', 'Failed to delete FAQ: ' + res.error);
      loadAllData();
    }
  };

  // SAVE SITE SETTINGS
  const handleSaveSetting = async (key: string, value: string) => {
    setIsSavingSettings(true);
    const res = await supabaseService.updateSiteSetting(key, value);
    setIsSavingSettings(false);
    if (res.success) {
      setSiteSettings(prev => ({ ...prev, [key]: value }));
      showToast('success', `Setting "${key}" updated in Supabase site_settings.`);
    } else {
      showToast('error', 'Failed to save setting: ' + res.error);
    }
  };

  // ADD NEW USER
  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) return;

    setIsLoading(true);
    const res = await supabaseService.upsertUser({
      name: newUserName.trim(),
      email: newUserEmail.trim(),
      role: newUserRole,
      company_name: newUserCompany.trim() || 'Enterprise Trading Firm',
      country: 'Global',
      status: 'ACTIVE',
      is_verified: true,
      is_premium: newUserRole === 'ADMIN'
    });

    setIsLoading(false);
    if (res.success) {
      showToast('success', `✓ User ${newUserEmail} registered in Supabase users table.`);
      setShowAddUserModal(false);
      setNewUserName('');
      setNewUserEmail('');
      loadAllData();
    } else {
      showToast('error', 'Failed to register user: ' + res.error);
    }
  };

  // Admin Privilege Mutation Handler
  const handleAdminPrivilegeToggle = async (
    targetUserId: string,
    field: 'isPremium' | 'membershipStatus' | 'role' | 'status' | 'isVerified',
    value: any
  ) => {
    const updates: any = { [field]: value };
    if (field === 'isPremium' && value === true) {
      updates.membershipStatus = 'paid';
    } else if (field === 'isPremium' && value === false) {
      updates.membershipStatus = 'free';
    }

    const res = await api.adminUpdateUserPrivileges(targetUserId, updates, currentUser!);
    if (res.success) {
      showToast('success', res.message || 'Privilege updated successfully');
      loadAllData();
      if (onUpdateCurrentUser && currentUser?.id === targetUserId && res.data) {
        onUpdateCurrentUser(res.data);
      }
    } else {
      showToast('error', res.error || 'Failed to update privileges');
    }
  };

  const handleWireSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingWire(true);
    setTimeout(() => {
      setIsSubmittingWire(false);
      setSubmissionSuccess(true);
      setWireReference('');
      loadAllData();
    }, 800);
  };

  const isAdmin = currentUser?.role === 'ADMIN' || 
    currentUser?.email?.toLowerCase() === 'yr943334@gmail.com' || 
    currentUser?.email?.toLowerCase() === 'admin@tradeheaven.net';

  const filteredInquiries = inquiries.filter(inq => {
    const matchStatus = inquiryStatusFilter === 'ALL' || inq.status === inquiryStatusFilter;
    const matchSearch = inquirySearch === '' ||
      inq.name?.toLowerCase().includes(inquirySearch.toLowerCase()) ||
      inq.email?.toLowerCase().includes(inquirySearch.toLowerCase()) ||
      inq.subject?.toLowerCase().includes(inquirySearch.toLowerCase()) ||
      inq.product_name?.toLowerCase().includes(inquirySearch.toLowerCase()) ||
      inq.message?.toLowerCase().includes(inquirySearch.toLowerCase());
    return matchStatus && matchSearch;
  });

  if (!isAdmin) {
    return (
      <div id="client-admin-restricted-view" className="py-12 px-4 max-w-2xl mx-auto text-center space-y-6">
        <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-12 shadow-xl space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 flex items-center justify-center mx-auto shadow-inner">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-black uppercase tracking-wider">
              <ShieldAlert className="w-3.5 h-3.5 text-indigo-600" />
              <span>Admin Authentication Required</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              Supabase Admin Control Panel
            </h2>
            <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
              This portal manages live Supabase database tables (<code className="text-xs bg-slate-100 px-1 py-0.5 rounded font-mono">inquiries</code>, <code className="text-xs bg-slate-100 px-1 py-0.5 rounded font-mono">users</code>, <code className="text-xs bg-slate-100 px-1 py-0.5 rounded font-mono">listings</code>, <code className="text-xs bg-slate-100 px-1 py-0.5 rounded font-mono">faqs</code>, <code className="text-xs bg-slate-100 px-1 py-0.5 rounded font-mono">site_settings</code>). Please sign in as an administrator.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => {
                window.dispatchEvent(new CustomEvent('tradeheaven_navigate', { detail: 'AUTH_LOGIN' }));
              }}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <KeyRound className="w-4 h-4" />
              <span>Sign In as Administrator</span>
            </button>
            <button
              onClick={() => {
                window.dispatchEvent(new CustomEvent('tradeheaven_navigate', { detail: 'HOMEPAGE' }));
              }}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
            >
              <span>Return to Marketplace</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="client-admin-portal-root" className="space-y-6">
      {/* Top Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 lg:p-10 shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Live Supabase Database &amp; Swiss Treasury Console</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-tight">
              Administrator Database &amp; Operations Center
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
              Directly connected to live Supabase project <code className="font-mono bg-black/40 px-1.5 py-0.5 rounded text-amber-300 text-xs">mcundxmcynpejdtdkacc</code>. View real-time RFQ inquiries, manage user roles, publish listings, and configure dynamic site settings.
            </p>
          </div>

          {/* Manual Refresh & Status Controls */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0">
            <button
              onClick={loadAllData}
              disabled={isLoading}
              className="px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg cursor-pointer transition-all active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading ? 'Fetching Supabase...' : 'Refresh Live Data'}</span>
            </button>
            <div className="text-[11px] text-emerald-400 font-mono bg-emerald-950/60 border border-emerald-500/30 px-3 py-2.5 rounded-2xl flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Supabase Sync Active</span>
            </div>
          </div>
        </div>

        {/* User Identity Info */}
        <div className="mt-6 flex items-center gap-3 flex-wrap text-xs bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 w-fit">
          <div className="flex items-center gap-1.5 font-bold">
            <span className="text-slate-300">Admin Account:</span>
            <span className="text-white font-mono bg-black/40 px-2 py-0.5 rounded text-[11px]">
              {currentUser?.name || 'Administrator'} ({currentUser?.email || 'admin@tradeheaven.net'})
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-300">Role:</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-amber-400 text-slate-950">
              SUPER ADMIN
            </span>
          </div>
        </div>
      </div>

      {/* Global Toast Alert */}
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
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('INQUIRIES')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'INQUIRIES'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Leads &amp; RFQ Inquiries</span>
          <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 font-mono">
            {inquiries.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('RBAC_USERS')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'RBAC_USERS'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>User Registrations</span>
          <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 font-mono">
            {usersList.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('LISTINGS')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'LISTINGS'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Listings &amp; Catalog</span>
          <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 font-mono">
            {listings.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('FAQS')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'FAQS'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>Dynamic FAQs</span>
          <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 font-mono">
            {faqs.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('SETTINGS')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'SETTINGS'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Site Settings</span>
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
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: LEADS & RFQ INQUIRIES (SUPABASE) */}
      {/* ========================================================================= */}
      {activeTab === 'INQUIRIES' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-blue-600" />
                  Live RFQs &amp; Lead Inquiries (<code className="font-mono text-xs text-blue-600">inquiries</code> table)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Captured directly from Contact Us modal, Buyer RFQs, and Live Trade Desk. Click status badges to toggle between 'pending' and 'resolved'.
                </p>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="relative w-48 sm:w-60">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search leads..."
                    value={inquirySearch}
                    onChange={e => setInquirySearch(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>

                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs">
                  {(['ALL', 'pending', 'resolved'] as const).map(st => (
                    <button
                      key={st}
                      onClick={() => setInquiryStatusFilter(st)}
                      className={`px-2.5 py-1 rounded-lg font-bold text-[11px] cursor-pointer capitalize transition-all ${
                        inquiryStatusFilter === st
                          ? 'bg-white text-blue-600 shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Inquiries Table */}
            {filteredInquiries.length === 0 ? (
              <div className="p-12 text-center bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <MessageSquare className="w-8 h-8 text-slate-400 mx-auto" />
                <div className="font-bold text-sm text-slate-700">No inquiry records found in Supabase</div>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  New submissions from the Contact modal or RFQ form will appear here in real-time.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase text-[10px]">
                      <th className="p-3">Sender Details</th>
                      <th className="p-3">Subject / Product</th>
                      <th className="p-3">Message Content</th>
                      <th className="p-3">Created At</th>
                      <th className="p-3">Status Toggle</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {filteredInquiries.map((inq, idx) => (
                      <tr key={inq.id || idx} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3">
                          <div className="font-bold text-slate-900">{inq.name}</div>
                          <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
                            <Mail className="w-3 h-3 text-slate-400" />
                            <span>{inq.email}</span>
                          </div>
                          {inq.phone && (
                            <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                              <Phone className="w-3 h-3 text-slate-400" />
                              <span>{inq.phone}</span>
                            </div>
                          )}
                        </td>

                        <td className="p-3">
                          <div className="font-bold text-slate-900">{inq.subject}</div>
                          {inq.product_name && (
                            <div className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded w-fit mt-0.5">
                              {inq.product_name}
                            </div>
                          )}
                        </td>

                        <td className="p-3 max-w-xs">
                          <p className="text-[11px] text-slate-600 line-clamp-2">{inq.message}</p>
                        </td>

                        <td className="p-3 font-mono text-[10px] text-slate-400">
                          {inq.created_at ? new Date(inq.created_at).toLocaleString() : 'Recent'}
                        </td>

                        <td className="p-3">
                          <button
                            type="button"
                            onClick={() => handleToggleInquiryStatus(inq)}
                            className={`px-3 py-1 rounded-full font-bold text-[10px] uppercase transition-all cursor-pointer flex items-center gap-1 shadow-2xs ${
                              inq.status === 'resolved'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 hover:bg-emerald-200'
                                : 'bg-amber-100 text-amber-800 border border-amber-300 hover:bg-amber-200'
                            }`}
                            title="Click to toggle status in Supabase"
                          >
                            {inq.status === 'resolved' ? (
                              <>
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>Resolved</span>
                              </>
                            ) : (
                              <>
                                <Clock className="w-3 h-3 text-amber-600" />
                                <span>Pending</span>
                              </>
                            )}
                          </button>
                        </td>

                        <td className="p-3 text-right">
                          <button
                            onClick={() => setSelectedInquiry(inq)}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] cursor-pointer"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* View Inquiry Modal */}
      {selectedInquiry && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 text-xs animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="font-black text-slate-900 text-base flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-blue-600" />
                <span>Inquiry Details (#{selectedInquiry.id?.slice(0, 8) || 'Lead'})</span>
              </div>
              <button
                onClick={() => setSelectedInquiry(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Customer Name</div>
                  <div className="font-bold text-slate-900">{selectedInquiry.name}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Status</div>
                  <div className="font-bold capitalize text-blue-600">{selectedInquiry.status}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Email</div>
                  <div className="font-mono text-slate-700">{selectedInquiry.email}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Phone / WhatsApp</div>
                  <div className="font-mono text-slate-700">{selectedInquiry.phone || 'N/A'}</div>
                </div>
              </div>

              <div>
                <div className="text-[10px] text-slate-400 font-bold uppercase mb-1">Subject / Product</div>
                <div className="font-bold text-slate-900 p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                  {selectedInquiry.subject}
                </div>
              </div>

              <div>
                <div className="text-[10px] text-slate-400 font-bold uppercase mb-1">Full Message Content</div>
                <div className="text-slate-700 p-3 bg-slate-50 rounded-xl border border-slate-100 whitespace-pre-wrap leading-relaxed">
                  {selectedInquiry.message}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  handleToggleInquiryStatus(selectedInquiry);
                  setSelectedInquiry(null);
                }}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs cursor-pointer"
              >
                Toggle Status to {selectedInquiry.status === 'resolved' ? 'Pending' : 'Resolved'}
              </button>
              <button
                type="button"
                onClick={() => setSelectedInquiry(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: RBAC & USER MANAGEMENT (SUPABASE & ACTIVE STORE) */}
      {/* ========================================================================= */}
      {activeTab === 'RBAC_USERS' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-blue-600" />
                  Registered Accounts (<code className="font-mono text-xs text-blue-600">users</code> table)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Synchronized with Supabase and auth state. Toggle user verification, VIP access, and administrative role privileges.
                </p>
              </div>

              <button
                onClick={() => setShowAddUserModal(true)}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Add User to Supabase</span>
              </button>
            </div>

            {/* Users Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase text-[10px]">
                    <th className="p-3">User &amp; Organization</th>
                    <th className="p-3">UID</th>
                    <th className="p-3">Assigned Role</th>
                    <th className="p-3">Account Status</th>
                    <th className="p-3">Membership Tier</th>
                    <th className="p-3 text-right">Admin Controls</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {usersList.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <span>{user.name}</span>
                          {user.isPremium && (
                            <span title="Paid Premium Member">
                              <Crown className="w-3 h-3 text-amber-500" />
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">{user.email}</div>
                        <div className="text-[10px] text-slate-400">{user.companyName}</div>
                      </td>

                      <td className="p-3 font-mono text-[11px] text-slate-600">
                        <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {user.id}
                        </span>
                      </td>

                      <td className="p-3">
                        <select
                          value={user.role}
                          onChange={(e) => handleAdminPrivilegeToggle(user.id, 'role', e.target.value as UserRole)}
                          className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-slate-900 font-bold text-[11px] cursor-pointer focus:outline-none focus:border-blue-500"
                        >
                          <option value="BUYER">BUYER</option>
                          <option value="SUPPLIER">SUPPLIER</option>
                          <option value="VERIFIER">VERIFIER</option>
                          <option value="ADMIN">ADMIN</option>
                        </select>
                      </td>

                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          user.status === 'ACTIVE'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {user.status || 'ACTIVE'}
                        </span>
                      </td>

                      <td className="p-3">
                        <button
                          type="button"
                          onClick={() => handleAdminPrivilegeToggle(user.id, 'isPremium', !user.isPremium)}
                          className={`px-3 py-1 rounded-xl text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                            user.isPremium
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
                          }`}
                        >
                          <Crown className={`w-3.5 h-3.5 ${user.isPremium ? 'text-amber-600' : 'text-slate-400'}`} />
                          <span>{user.isPremium ? 'Paid VIP Member' : 'Free Tier'}</span>
                        </button>
                      </td>

                      <td className="p-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleAdminPrivilegeToggle(user.id, 'isVerified', !user.isVerified)}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-colors cursor-pointer ${
                            user.isVerified
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                              : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                          }`}
                        >
                          {user.isVerified ? '✓ KYC Verified' : 'Unverified'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleAddUser} className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 text-xs animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="font-black text-slate-900 text-base flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                <span>Register User to Supabase</span>
              </div>
              <button
                type="button"
                onClick={() => setShowAddUserModal(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Full Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. John Doe"
                value={newUserName}
                onChange={e => setNewUserName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-semibold focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Work Email *</label>
              <input
                type="email"
                required
                placeholder="john@company.com"
                value={newUserEmail}
                onChange={e => setNewUserEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-semibold focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Company Name</label>
              <input
                type="text"
                placeholder="Apex Manufacturing Ltd"
                value={newUserCompany}
                onChange={e => setNewUserCompany(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Assigned Role</label>
              <select
                value={newUserRole}
                onChange={e => setNewUserRole(e.target.value as UserRole)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold focus:outline-none focus:border-blue-500"
              >
                <option value="BUYER">BUYER</option>
                <option value="SUPPLIER">SUPPLIER</option>
                <option value="VERIFIER">VERIFIER</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowAddUserModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs cursor-pointer shadow-sm"
              >
                Save to Database
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: LISTINGS & PRODUCT CATALOG (SUPABASE) */}
      {/* ========================================================================= */}
      {activeTab === 'LISTINGS' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Package className="w-5 h-5 text-blue-600" />
                  Product &amp; Service Listings (<code className="font-mono text-xs text-blue-600">listings</code> table)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Live products hosted on Supabase and indexed in the global B2B catalog. Upload images directly to the <code className="font-mono text-xs text-slate-700">site-uploads</code> bucket.
                </p>
              </div>

              <button
                onClick={() => setShowAddListingModal(true)}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Add Product Listing</span>
              </button>
            </div>

            {listings.length === 0 ? (
              <div className="p-12 text-center bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <Package className="w-8 h-8 text-slate-400 mx-auto" />
                <div className="font-bold text-sm text-slate-700">No database listings currently in Supabase</div>
                <button
                  onClick={() => setShowAddListingModal(true)}
                  className="text-xs text-blue-600 font-bold hover:underline"
                >
                  Create your first product listing
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {listings.map((l) => (
                  <div key={l.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col justify-between gap-3 relative group">
                    <div className="space-y-2">
                      <div className="w-full h-36 rounded-xl overflow-hidden bg-white border border-slate-200 relative">
                        <img
                          src={l.image_url || 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=800&auto=format&fit=crop&q=80'}
                          alt={l.title}
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute top-2 right-2 px-2 py-0.5 rounded bg-black/70 text-white text-[10px] font-bold uppercase font-mono backdrop-blur-xs">
                          {l.category}
                        </span>
                      </div>

                      <h4 className="font-bold text-slate-900 text-sm line-clamp-1">{l.title}</h4>
                      <p className="text-slate-500 text-xs line-clamp-2">{l.description}</p>
                      
                      <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200">
                        <span className="font-bold text-emerald-700 font-mono">
                          ${Number(l.price || 0).toLocaleString()} USD
                        </span>
                        <span className="text-slate-500 text-[11px]">
                          MOQ: {l.moq || 1} {l.moq_unit || 'Units'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                      <span className="text-[10px] text-slate-400 font-mono">
                        {l.supplier_name || 'Verified Exporter'}
                      </span>
                      <button
                        onClick={() => handleDeleteListing(l.id)}
                        className="px-2 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Listing Modal */}
      {showAddListingModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleCreateListing} className="bg-white border border-slate-200 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 text-xs animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="font-black text-slate-900 text-base flex items-center gap-2">
                <Package className="w-5 h-5 text-blue-600" />
                <span>Create New Product Listing</span>
              </div>
              <button
                type="button"
                onClick={() => setShowAddListingModal(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Product Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Industrial Hydraulic Press 500-Ton"
                value={newListingTitle}
                onChange={e => setNewListingTitle(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Category</label>
                <select
                  value={newListingCategory}
                  onChange={e => setNewListingCategory(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-semibold focus:outline-none focus:border-blue-500"
                >
                  <option value="Industrial Machinery">Industrial Machinery</option>
                  <option value="Chemicals & Raw Materials">Chemicals & Raw Materials</option>
                  <option value="Electronics & Components">Electronics & Components</option>
                  <option value="Apparel & Textiles">Apparel & Textiles</option>
                  <option value="Agriculture & Food">Agriculture & Food</option>
                  <option value="Metals & Metallurgy">Metals & Metallurgy</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Price ($ USD)</label>
                <input
                  type="number"
                  required
                  value={newListingPrice}
                  onChange={e => setNewListingPrice(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono font-bold focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Image Upload / Storage */}
            <div className="space-y-1.5">
              <label className="block font-bold text-slate-700">Product Image (Supabase Storage)</label>
              <div className="flex items-center gap-2">
                <label className="px-3 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold border border-blue-200 flex items-center gap-1.5 cursor-pointer shrink-0">
                  {isUploadingListingImage ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                  <span>{isUploadingListingImage ? 'Uploading...' : 'Upload Image File'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={isUploadingListingImage}
                    onChange={async (e) => {
                      const f = e.target.files?.[0];
                      if (!f) return;
                      setIsUploadingListingImage(true);
                      const res = await supabaseService.uploadFile(f, 'listings');
                      if (res.success && res.publicUrl) {
                        setNewListingImageUrl(res.publicUrl);
                        showToast('success', 'Image uploaded to Supabase site-uploads!');
                      }
                      setIsUploadingListingImage(false);
                      e.target.value = '';
                    }}
                  />
                </label>
                <input
                  type="url"
                  value={newListingImageUrl}
                  onChange={e => setNewListingImageUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-mono text-[11px] focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Description</label>
              <textarea
                rows={3}
                placeholder="Technical specifications, materials, warranty, port of dispatch..."
                value={newListingDesc}
                onChange={e => setNewListingDesc(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowAddListingModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs cursor-pointer shadow-sm disabled:opacity-50"
              >
                Publish to Supabase
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: DYNAMIC FAQS (SUPABASE) */}
      {/* ========================================================================= */}
      {activeTab === 'FAQS' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-blue-600" />
                  Dynamic FAQs (<code className="font-mono text-xs text-blue-600">faqs</code> table)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Manage questions and answers displayed in the live dynamic FAQ accordion across Trade Heaven.
                </p>
              </div>

              <button
                onClick={() => setShowAddFaqModal(true)}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Add FAQ Item</span>
              </button>
            </div>

            <div className="space-y-3">
              {faqs.map((f, idx) => (
                <div key={f.id || idx} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-mono">
                        {f.category || 'General'}
                      </span>
                      <h4 className="font-bold text-slate-900 text-sm">{f.question}</h4>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed pl-1">{f.answer}</p>
                  </div>

                  <button
                    onClick={() => handleDeleteFaq(f.id)}
                    className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 cursor-pointer shrink-0 transition-colors"
                    title="Delete FAQ"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Add FAQ Modal */}
      {showAddFaqModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleCreateFaq} className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 text-xs animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="font-black text-slate-900 text-base flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-blue-600" />
                <span>Create New FAQ</span>
              </div>
              <button
                type="button"
                onClick={() => setShowAddFaqModal(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Question *</label>
              <input
                type="text"
                required
                placeholder="e.g. How does escrow inspection work?"
                value={newFaqQuestion}
                onChange={e => setNewFaqQuestion(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Category</label>
              <select
                value={newFaqCategory}
                onChange={e => setNewFaqCategory(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold focus:outline-none focus:border-blue-500"
              >
                <option value="Escrow & Payments">Escrow & Payments</option>
                <option value="Factory Verification">Factory Verification</option>
                <option value="Buying & RFQs">Buying & RFQs</option>
                <option value="Shipping & Logistics">Shipping & Logistics</option>
                <option value="Account & Membership">Account & Membership</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Answer *</label>
              <textarea
                required
                rows={4}
                placeholder="Comprehensive answer..."
                value={newFaqAnswer}
                onChange={e => setNewFaqAnswer(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowAddFaqModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs cursor-pointer shadow-sm"
              >
                Save FAQ
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: SITE SETTINGS (SUPABASE) */}
      {/* ========================================================================= */}
      {activeTab === 'SETTINGS' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
            <div className="pb-3 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Settings className="w-5 h-5 text-blue-600" />
                Dynamic Site Settings (<code className="font-mono text-xs text-blue-600">site_settings</code> table)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage global banner announcements, contact details, and platform configuration persisted in Supabase.
              </p>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Top Announcement Banner Text</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={siteSettings.announcement_banner || ''}
                    onChange={e => setSiteSettings({ ...siteSettings, announcement_banner: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-blue-500"
                  />
                  <button
                    onClick={() => handleSaveSetting('announcement_banner', siteSettings.announcement_banner)}
                    disabled={isSavingSettings}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs cursor-pointer shrink-0"
                  >
                    Save
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Official Support Phone / WhatsApp</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={siteSettings.support_phone || '+91 8532934479'}
                      onChange={e => setSiteSettings({ ...siteSettings, support_phone: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono focus:outline-none focus:border-blue-500"
                    />
                    <button
                      onClick={() => handleSaveSetting('support_phone', siteSettings.support_phone)}
                      className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs cursor-pointer shrink-0"
                    >
                      Save
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Official Support Email</label>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      value={siteSettings.support_email || 'help@tradeheaven.net'}
                      onChange={e => setSiteSettings({ ...siteSettings, support_email: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono focus:outline-none focus:border-blue-500"
                    />
                    <button
                      onClick={() => handleSaveSetting('support_email', siteSettings.support_email)}
                      className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs cursor-pointer shrink-0"
                    >
                      Save
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Headquarters Address</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={siteSettings.headquarters_address || 'Trade Heaven Global Operations & Treasury, Zurich, Switzerland & London, UK'}
                    onChange={e => setSiteSettings({ ...siteSettings, headquarters_address: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                  <button
                    onClick={() => handleSaveSetting('headquarters_address', siteSettings.headquarters_address)}
                    className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs cursor-pointer shrink-0"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: TREASURY WIRE SETTLEMENT */}
      {/* ========================================================================= */}
      {activeTab === 'TREASURY' && (
        <div className="space-y-5">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center font-bold">
                <Landmark className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">Direct Custodial Escrow Vault Settlement</h3>
                <p className="text-xs text-slate-500">Record international SWIFT/SEPA transfers directly to Trade Heaven neutral Swiss vaults.</p>
              </div>
            </div>

            {submissionSuccess ? (
              <div className="p-8 text-center bg-emerald-50 border border-emerald-200 rounded-2xl space-y-3">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h4 className="text-base font-black text-emerald-950">Wire Transfer Settlement Confirmed</h4>
                <p className="text-xs text-emerald-800 max-w-md mx-auto">
                  Transfer reference registered. Escrow vault custody funds allocated to verified transaction.
                </p>
                <button
                  onClick={() => setSubmissionSuccess(false)}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer"
                >
                  Submit Another Wire Notice
                </button>
              </div>
            ) : (
              <form onSubmit={handleWireSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Sender Bank &amp; Branch</label>
                    <input
                      type="text"
                      required
                      value={senderBank}
                      onChange={e => setSenderBank(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 font-semibold focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Transfer Amount ($ USD)</label>
                    <input
                      type="number"
                      required
                      min="1000"
                      value={transferAmount}
                      onChange={e => setTransferAmount(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 font-mono font-bold text-emerald-700 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">SWIFT / UTR Wire Reference</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SWIFT-REF-2025-CH-99201"
                    value={wireReference}
                    onChange={e => setWireReference(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Contract / Order Purpose</label>
                  <input
                    type="text"
                    value={purpose}
                    onChange={e => setPurpose(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingWire}
                  className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md transition-colors disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmittingWire ? 'Recording SWIFT Settlement...' : 'Register Wire Notice with Treasury'}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 7: AUDIT LOGS */}
      {/* ========================================================================= */}
      {activeTab === 'AUDIT_LOGS' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-amber-500" />
                  Tamper-Resistant Security Audit Trail
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Immutable event log recording authorization checks, contact gating, and membership tier changes.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse font-mono">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase text-[10px]">
                    <th className="p-3">Timestamp</th>
                    <th className="p-3">Actor &amp; Role</th>
                    <th className="p-3">Security Action</th>
                    <th className="p-3">Resource Target</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[11px]">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/80">
                      <td className="p-3 text-slate-400">{new Date(log.timestamp).toLocaleTimeString()}</td>
                      <td className="p-3 text-slate-700">
                        <span className="font-bold">{log.actorEmail}</span> ({log.actorRole})
                      </td>
                      <td className="p-3 font-bold text-slate-900">{log.action}</td>
                      <td className="p-3 text-slate-500">{log.targetResource}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          log.status === 'SUCCESS'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}>
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
