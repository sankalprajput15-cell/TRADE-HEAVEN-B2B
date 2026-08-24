import React, { useState } from 'react';
import { AuthUser } from '../../types';
import { SafeImage } from '../common/SafeImage';
import { api } from '../../services/apiService';
import { securityService } from '../../services/securityService';
import { bigrockApi } from '../../services/bigrockApi';
import { 
  X, 
  LogIn, 
  ShieldCheck, 
  Lock, 
  Mail, 
  User, 
  Building2, 
  Globe,
  CheckCircle2,
  AlertCircle,
  Copy,
  Crown,
  Key,
  UserPlus,
  Landmark,
  SlidersHorizontal,
  Database,
  ArrowRight,
  Eye,
  EyeOff,
  Sparkles
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentUser: AuthUser | null;
  onLogin: (user: AuthUser) => void;
  onLogout: () => void;
  initialMode?: 'LOGIN' | 'REGISTER' | 'WORK_WITH_US';
  onNavigate?: (view: any) => void;
}

export const AuthModal: React.FC<Props> = ({
  isOpen,
  onClose,
  currentUser,
  onLogin,
  onLogout,
  initialMode = 'LOGIN',
  onNavigate
}) => {
  const [authMode, setAuthMode] = useState<'LOGIN' | 'REGISTER' | 'WORK_WITH_US'>(initialMode);

  React.useEffect(() => {
    if (isOpen && initialMode) {
      setAuthMode(initialMode);
    }
  }, [isOpen, initialMode]);
  
  // Login Form States (Empty by default, no prefilled credentials)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Registration Form States
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regCompany, setRegCompany] = useState('');
  const [regCountry, setRegCountry] = useState('United States');
  const [regAccountType, setRegAccountType] = useState<'BUYER' | 'SUPPLIER'>('BUYER');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [copiedToken, setCopiedToken] = useState(false);
  const [showToken, setShowToken] = useState(false);

  if (!isOpen) return null;

  // Production Sign-In Form Handler (Strictly sends { email, password } to backend)
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const cleanEmail = email.trim();
    if (!cleanEmail || !password) {
      setError('Please enter both corporate email and password.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.login(cleanEmail, password);
      if (res.success && res.user) {
        onLogin(res.user);
        const isAdminUser = res.user.role === 'ADMIN' || res.user.email?.toLowerCase() === 'yr943334@gmail.com' || res.user.email?.toLowerCase() === 'admin@tradeheaven.net';
        setSuccess(
          isAdminUser 
            ? `Admin session verified. Entering Administrator Control Center...`
            : `Authenticated successfully as ${res.user.name} (${res.user.role}).`
        );
        setTimeout(() => {
          setSuccess(null);
          onClose();
          if (isAdminUser && onNavigate) {
            onNavigate('CLIENT_ADMIN');
          }
        }, 750);
      } else {
        setError(res.message || 'Invalid email or password. Access denied.');
      }
    } catch {
      setError('An error occurred during authentication. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Production Business Registration Form Handler
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const cleanEmail = regEmail.trim();
    if (!cleanEmail || !regPassword || !regName.trim() || !regCompany.trim()) {
      setError('Please complete all required fields.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.register({
        email: cleanEmail,
        password: regPassword,
        name: regName.trim(),
        companyName: regCompany.trim(),
        country: regCountry.trim(),
        accountType: regAccountType
      });

      if (res.success && res.user) {
        // Sync registration to BigRock MySQL database
        await bigrockApi.upsertUser({
          name: regName.trim(),
          email: cleanEmail,
          role: regAccountType,
          company_name: regCompany.trim(),
          country: regCountry.trim(),
          status: 'ACTIVE',
          is_verified: false,
          is_premium: false
        });

        onLogin(res.user);
        setSuccess('Business account registered and synced to live database successfully.');
        setTimeout(() => {
          setSuccess(null);
          onClose();
        }, 850);
      } else {
        setError(res.message || 'Registration failed. Please check your information.');
      }
    } catch {
      setError('Registration service unavailable. Please retry.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyTokenToClipboard = () => {
    if (currentUser?.token) {
      navigator.clipboard.writeText(currentUser.token);
      setCopiedToken(true);
      setTimeout(() => setCopiedToken(false), 2000);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-950/70 backdrop-blur-xs overflow-hidden font-sans"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl w-full max-w-md max-h-[calc(100dvh-1.5rem)] sm:max-h-[calc(100dvh-3rem)] flex flex-col shadow-2xl relative text-slate-900 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-white/90 hover:text-white transition-colors cursor-pointer shadow-sm"
          aria-label="Close authentication modal"
          title="Close Modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 sm:p-6 shrink-0 pr-14">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Secure Enterprise Authentication</span>
          </div>
          <h2 className="text-lg sm:text-xl font-black text-white leading-tight">
            {currentUser 
              ? 'Verified Account Credentials' 
              : (authMode === 'LOGIN' 
                  ? 'Corporate Sign In' 
                  : (authMode === 'REGISTER' ? 'Register Free Account' : 'Work With Us (Partner Vetting)'))}
          </h2>
          <p className="text-xs text-slate-300 mt-1 font-normal leading-relaxed">
            {currentUser 
              ? 'Zero-trust authorization active. Session claims validated by server.' 
              : (authMode === 'REGISTER'
                  ? '100% Free Forever • Zero Subscription Fee • Connect with Real Buyers & Suppliers.'
                  : (authMode === 'WORK_WITH_US' 
                      ? 'Enterprise KYC & Verification Onboarding to trade with real, genuine global partners.'
                      : 'Sign in to access corporate RFQs, wholesale supplier catalogs, and escrow services.'))}
          </p>
        </div>

        {/* ACTIVE SESSION VIEW (When Logged In) */}
        {currentUser ? (
          <div className="p-4 sm:p-6 space-y-5 flex-1 overflow-y-auto">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl overflow-hidden bg-slate-200 border border-slate-300 shrink-0">
                <SafeImage src={currentUser.avatarUrl} alt={currentUser.name} className="w-full h-full object-cover" />
              </div>
              <div className="space-y-0.5 min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-sm text-slate-900 truncate">{currentUser.name}</h3>
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                    currentUser.role === 'ADMIN'
                      ? 'bg-amber-100 text-amber-900 border border-amber-300'
                      : 'bg-blue-100 text-blue-900 border border-blue-200'
                  }`}>
                    {currentUser.role}
                  </span>
                  {currentUser.isPremium ? (
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center gap-1">
                      <Crown className="w-3 h-3 text-emerald-700" /> Paid Member
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                      Free Tier
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-500 font-mono truncate">{currentUser.email}</div>
                <div className="text-xs text-slate-600 font-medium truncate">{currentUser.companyName || 'Enterprise Trading'} • {currentUser.country || 'Global'}</div>
              </div>
            </div>

            {/* Account Security Snapshot */}
            <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 space-y-2.5 text-xs">
              <div className="font-bold text-indigo-950 flex items-center justify-between">
                <span>Server-Controlled Identity:</span>
                <span className="font-mono text-[10px] text-indigo-700 bg-white px-2 py-0.5 rounded border border-indigo-200 font-semibold">
                  UID: {currentUser.id}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2.5 bg-white rounded-xl border border-indigo-100">
                  <span className="text-slate-500 block text-[10px]">Verification Status:</span>
                  <span className="font-bold text-emerald-700 uppercase">{currentUser.status || 'ACTIVE'}</span>
                </div>
                <div className="p-2.5 bg-white rounded-xl border border-indigo-100">
                  <span className="text-slate-500 block text-[10px]">Contact Data Gating:</span>
                  <span className="font-bold text-slate-900">
                    {currentUser.role === 'ADMIN' || currentUser.isPremium ? 'Unmasked Direct Access' : 'Masked (Upgrade Required)'}
                  </span>
                </div>
              </div>

              {/* JWT Session Token Inspector */}
              <div className="pt-2 border-t border-indigo-100/80">
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="font-bold text-slate-700 flex items-center gap-1">
                    <Key className="w-3.5 h-3.5 text-indigo-600" />
                    Verifiable Server JWT
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowToken(!showToken)}
                    className="text-[10px] text-blue-600 font-bold hover:underline cursor-pointer"
                  >
                    {showToken ? 'Hide Signature' : 'Inspect Token'}
                  </button>
                </div>

                {showToken && (
                  <div className="relative mt-1.5">
                    <pre className="p-2.5 bg-slate-900 text-emerald-400 rounded-xl text-[10px] font-mono break-all max-h-24 overflow-y-auto whitespace-pre-wrap">
                      {currentUser.token || securityService.generateSessionToken(currentUser)}
                    </pre>
                    <button
                      type="button"
                      onClick={copyTokenToClipboard}
                      className="absolute top-2 right-2 px-2 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded text-[9px] font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Copy className="w-3 h-3" />
                      <span>{copiedToken ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Admin Dedicated Control Center Quick Access (Visible only when logged in as ADMIN) */}
            {currentUser?.role === 'ADMIN' && (
              <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-amber-950 font-black text-xs">
                    <Landmark className="w-4 h-4 text-amber-600" />
                    <span>Administrator Control Center</span>
                  </div>
                  <span className="text-[10px] bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded font-black uppercase tracking-wider">
                    Full Access
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      if (onNavigate) onNavigate('CLIENT_ADMIN');
                    }}
                    className="p-3 rounded-xl bg-white hover:bg-amber-100/50 border border-amber-200 text-left transition-all group cursor-pointer shadow-2xs"
                  >
                    <div className="flex items-center justify-between font-bold text-slate-900 text-xs">
                      <span className="flex items-center gap-1.5 text-amber-900">
                        <Landmark className="w-3.5 h-3.5 text-amber-600" />
                        Admin &amp; Treasury
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-600 group-hover:translate-x-0.5 transition-all" />
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Manage RBAC users, custodial escrow vaults, and data gating.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      if (onNavigate) onNavigate('CMS_MANAGEMENT');
                    }}
                    className="p-3 rounded-xl bg-white hover:bg-amber-100/50 border border-amber-200 text-left transition-all group cursor-pointer shadow-2xs"
                  >
                    <div className="flex items-center justify-between font-bold text-slate-900 text-xs">
                      <span className="flex items-center gap-1.5 text-amber-900">
                        <SlidersHorizontal className="w-3.5 h-3.5 text-amber-600" />
                        Full Site CMS Editor
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-600 group-hover:translate-x-0.5 transition-all" />
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Edit site copy, hero banners, WhatsApp numbers, and categories.
                    </p>
                  </button>
                </div>
              </div>
            )}

            <button
              onClick={() => {
                onLogout();
                onClose();
              }}
              className="w-full py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs transition-colors cursor-pointer"
            >
              Sign Out of Session
            </button>
          </div>
        ) : (
          <div className="p-4 sm:p-6 space-y-4 flex-1 overflow-y-auto">
            {/* Mode Switcher: Sign In vs Register Free vs Work With Us */}
            <div className="grid grid-cols-3 bg-slate-100 p-1 rounded-xl gap-1 text-[11px] font-bold">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('LOGIN');
                  setError(null);
                  setSuccess(null);
                }}
                className={`py-2 rounded-lg transition-all text-center cursor-pointer ${
                  authMode === 'LOGIN' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('REGISTER');
                  setError(null);
                  setSuccess(null);
                }}
                className={`py-2 rounded-lg transition-all text-center cursor-pointer ${
                  authMode === 'REGISTER' ? 'bg-white text-blue-700 font-black shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Register Free
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('WORK_WITH_US');
                  setError(null);
                  setSuccess(null);
                }}
                className={`py-2 rounded-lg transition-all text-center cursor-pointer flex items-center justify-center gap-1 ${
                  authMode === 'WORK_WITH_US' ? 'bg-white text-emerald-700 font-black shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                <span>Onboard / Work</span>
              </button>
            </div>

            {/* Zero Cost Assurance Banner */}
            {authMode === 'REGISTER' && (
              <div className="p-2.5 rounded-xl bg-blue-50/80 border border-blue-200 text-blue-900 text-[11px] flex items-center justify-between">
                <span className="font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                  100% Free Forever
                </span>
                <span className="text-[10px] text-blue-700 bg-white px-2 py-0.5 rounded-md border border-blue-200 font-semibold">
                  No Credit Card Required
                </span>
              </div>
            )}

            {authMode === 'WORK_WITH_US' && (
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-2 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Trade With Real &amp; Genuine Businesses</span>
                </div>
                <p className="text-[11px] text-emerald-900/90 leading-relaxed">
                  Looking to onboard as an audited factory or corporate importer with tax verification &amp; escrow assurance?
                </p>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    if (onNavigate) onNavigate('ONBOARD_WITH_US');
                  }}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                >
                  <span>Open Full Onboard With Us Portal</span>
                  <Crown className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{success}</span>
              </div>
            )}

            {/* PRODUCTION SIGN-IN FORM: ONLY EMAIL & PASSWORD */}
            {authMode === 'LOGIN' && (
              <form onSubmit={handleSignIn} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Corporate / Work Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      required
                      autoComplete="email"
                      placeholder="name@company.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-blue-500 focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-bold text-slate-700">Account Password</label>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-[11px] text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      {showPassword ? (
                        <>
                          <EyeOff className="w-3 h-3" />
                          <span>Hide</span>
                        </>
                      ) : (
                        <>
                          <Eye className="w-3 h-3" />
                          <span>Show</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      autoComplete="current-password"
                      placeholder="••••••••••••"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-10 py-2 text-slate-900 font-medium focus:outline-none focus:border-blue-500 focus:bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-sm cursor-pointer disabled:opacity-50"
                >
                  <LogIn className="w-4 h-4" />
                  <span>{isLoading ? 'Verifying Credentials...' : 'Sign In'}</span>
                </button>
              </form>
            )}

            {/* PRODUCTION BUSINESS REGISTRATION FORM */}
            {authMode === 'REGISTER' && (
              <form onSubmit={handleRegister} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Full Name *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. David Sterling"
                      value={regName}
                      onChange={e => setRegName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-blue-500 focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Corporate Work Email *</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      required
                      placeholder="david.sterling@company.com"
                      value={regEmail}
                      onChange={e => setRegEmail(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-blue-500 focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-bold text-slate-700">Account Password *</label>
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className="text-[11px] text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      {showRegPassword ? (
                        <>
                          <EyeOff className="w-3 h-3" />
                          <span>Hide</span>
                        </>
                      ) : (
                        <>
                          <Eye className="w-3 h-3" />
                          <span>Show</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      required
                      autoComplete="new-password"
                      placeholder="••••••••••••"
                      value={regPassword}
                      onChange={e => setRegPassword(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-10 py-2 text-slate-900 font-medium focus:outline-none focus:border-blue-500 focus:bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                    >
                      {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Company Name *</label>
                    <div className="relative">
                      <Building2 className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. Sterling Corp"
                        value={regCompany}
                        onChange={e => setRegCompany(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-2.5 py-2 text-slate-900 font-medium focus:outline-none focus:border-blue-500 focus:bg-white text-[11px]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Country / HQ</label>
                    <div className="relative">
                      <Globe className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
                      <input
                        type="text"
                        placeholder="e.g. Germany"
                        value={regCountry}
                        onChange={e => setRegCountry(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-2.5 py-2 text-slate-900 font-medium focus:outline-none focus:border-blue-500 focus:bg-white text-[11px]"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Trading Intent</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setRegAccountType('BUYER')}
                      className={`p-2.5 rounded-xl border font-bold text-left transition-all cursor-pointer ${
                        regAccountType === 'BUYER'
                          ? 'border-blue-600 bg-blue-50 text-blue-900 ring-1 ring-blue-600'
                          : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div className="font-bold text-xs">Buyer</div>
                      <div className="text-[10px] text-slate-500 font-normal">Source goods &amp; post RFQs</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRegAccountType('SUPPLIER')}
                      className={`p-2.5 rounded-xl border font-bold text-left transition-all cursor-pointer ${
                        regAccountType === 'SUPPLIER'
                          ? 'border-blue-600 bg-blue-50 text-blue-900 ring-1 ring-blue-600'
                          : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div className="font-bold text-xs">Supplier</div>
                      <div className="text-[10px] text-slate-500 font-normal">Factory &amp; catalog export</div>
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-sm cursor-pointer disabled:opacity-50 mt-2"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>{isLoading ? 'Registering...' : 'Complete Business Registration'}</span>
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
