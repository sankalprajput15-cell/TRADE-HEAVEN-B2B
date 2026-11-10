import React, { useState, useEffect } from 'react';
import { AuthUser } from '../../types';
import { SafeImage } from '../common/SafeImage';
import { apiClient } from '../../services/apiClient';
import { securityService } from '../../services/securityService';
import { useAuth } from '../../context/AuthContext';
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
  ArrowRight,
  Eye,
  EyeOff,
  Wallet,
  PlusCircle,
  MessageCircle,
  RefreshCw,
  UserCheck
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
  const [authMode, setAuthMode] = useState<'LOGIN' | 'LOGIN_OTP' | 'REGISTER' | 'WORK_WITH_US' | 'FORGOT_PASSWORD' | 'RESET_PASSWORD'>(initialMode);

  useEffect(() => {
    if (isOpen && initialMode) {
      setAuthMode(initialMode);
    }
  }, [isOpen, initialMode]);
  
  // Login Form States (Locally Isolated)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // 2-Step Login OTP Verification States (Sent to Registered User's Email)
  const [loginOtpCode, setLoginOtpCode] = useState('');
  const [loginOtpSent, setLoginOtpSent] = useState(false);
  const [isSendingLoginOtp, setIsSendingLoginOtp] = useState(false);
  const [pendingOtpEmail, setPendingOtpEmail] = useState('');
  const [pendingMaskedEmail, setPendingMaskedEmail] = useState('');

  // Forgot / Reset Password States
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState<string | null>(null);
  const [resetTokenInput, setResetTokenInput] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [resetSuccess, setResetSuccess] = useState<string | null>(null);
  
  // Registration Form States (Locally Isolated)
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regCompany, setRegCompany] = useState('');
  const [regCountry, setRegCountry] = useState('United States');
  const [regAccountType, setRegAccountType] = useState<'BUYER' | 'SUPPLIER'>('BUYER');
  const [regOtpCode, setRegOtpCode] = useState('');
  const [regOtpSent, setRegOtpSent] = useState(false);
  const [isSendingRegOtp, setIsSendingRegOtp] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [copiedToken, setCopiedToken] = useState(false);
  const [showToken, setShowToken] = useState(false);

  const { login, verifyLoginOtp, resendLoginOtp } = useAuth();

  const whatsappResetUrl = `https://wa.me/918532934479?text=${encodeURIComponent(
    `Hello Trade Heaven Support, I need assistance with password reset / OTP verification for my corporate account${(forgotEmail || pendingOtpEmail || email) ? ` (${(forgotEmail || pendingOtpEmail || email).trim()})` : ''}.`
  )}`;

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setForgotSuccess(null);
    setIsLoading(true);
    try {
      const res = await apiClient.sendResetCode(forgotEmail);
      if (res.success) {
        setForgotSuccess(
          res.message ||
            `Automated 6-digit OTP sent from noreply@tradeheaven.net to your registered email ${forgotEmail.trim()}.`
        );
        setAuthMode('RESET_PASSWORD');
      } else {
        setError(res.message);
      }
    } catch (err) {
      setError('Network communication failure. Please contact Trade Heaven on WhatsApp for instant support.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!forgotEmail) return;
    setError(null);
    setIsLoading(true);
    try {
      const res = await apiClient.sendResetCode(forgotEmail);
      if (res.success) {
        setForgotSuccess(`New 6-digit OTP dispatched automatically from noreply@tradeheaven.net to ${forgotEmail.trim()}.`);
      } else {
        setError(res.message);
      }
    } catch {
      setError('Could not resend OTP. Please contact Trade Heaven on WhatsApp below.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResetSuccess(null);
    setIsLoading(true);
    try {
      const res = await apiClient.resetPassword(forgotEmail, resetTokenInput, resetNewPassword);
      if (res.success) {
        setResetSuccess(res.message);
        setTimeout(() => {
          setAuthMode('LOGIN');
          setEmail(forgotEmail);
          setPassword(resetNewPassword);
          setResetSuccess(null);
        }, 1800);
      } else {
        setError(res.message);
      }
    } catch (err) {
      setError('Network communication failure. Please contact Trade Heaven on WhatsApp for instant password reset.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  // Handler for 'Send OTP' button inside the Sign-In Form
  const handleSendLoginOtpClick = async () => {
    setError(null);
    setSuccess(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !password) {
      setError('Please enter both your registered email and password before clicking Send OTP.');
      return;
    }

    setIsSendingLoginOtp(true);
    try {
      const res = await apiClient.sendAuthOtp({
        email: cleanEmail,
        password,
        mode: 'LOGIN'
      });
      if (res.success) {
        setLoginOtpSent(true);
        setPendingOtpEmail(res.email || cleanEmail);
        setPendingMaskedEmail(res.maskedEmail || cleanEmail);
        setSuccess(
          res.message ||
            `6-digit verification code sent to your registered email (${res.maskedEmail || cleanEmail}) via noreply@tradeheaven.net.`
        );
      } else {
        setError(res.message || 'Unable to send OTP. Only registered accounts with valid credentials can receive a login OTP.');
      }
    } catch (err: any) {
      setError(err?.message || 'Network error while dispatching login OTP.');
    } finally {
      setIsSendingLoginOtp(false);
    }
  };

  // Handler for 'Send OTP' button inside the Registration Form
  const handleSendRegisterOtpClick = async () => {
    setError(null);
    setSuccess(null);

    const cleanEmail = regEmail.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError('Please enter a valid corporate email address before clicking Send OTP.');
      return;
    }

    setIsSendingRegOtp(true);
    try {
      const res = await apiClient.sendAuthOtp({
        email: cleanEmail,
        name: regName.trim() || undefined,
        mode: 'REGISTER',
        accountType: regAccountType
      });
      if (res.success) {
        setRegOtpSent(true);
        setSuccess(
          res.message ||
            `6-digit verification code sent to ${res.maskedEmail || cleanEmail} via noreply@tradeheaven.net. Enter it below to complete registration.`
        );
      } else {
        setError(res.message || 'Unable to send registration OTP. Please check your email address.');
      }
    } catch (err: any) {
      setError(err?.message || 'Network error while dispatching registration OTP.');
    } finally {
      setIsSendingRegOtp(false);
    }
  };

  // Production Sign-In Form Handler (Requires 6-Digit Email OTP Verification)
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !password) {
      setError('Please enter both your registered corporate email and password.');
      return;
    }

    const cleanOtp = loginOtpCode.trim();
    if (!cleanOtp || cleanOtp.length !== 6) {
      if (!loginOtpSent) {
        await handleSendLoginOtpClick();
        return;
      }
      setError('Please enter the 6-digit OTP verification code sent to your registered email before signing in.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await login(cleanEmail, password, cleanOtp);
      if (res.success && res.requiresOtp) {
        setLoginOtpSent(true);
        setPendingOtpEmail(res.email || cleanEmail);
        setPendingMaskedEmail(res.maskedEmail || cleanEmail);
        setLoginOtpCode('');
        setSuccess(
          res.message ||
            `6-digit security OTP has been sent to your registered email (${res.maskedEmail || cleanEmail}). Enter it below to complete sign-in.`
        );
      } else if (res.success && res.user) {
        onLogin(res.user);
        const isAdminUser = res.user.role === 'ADMIN' && res.user.isVerifiedAdmin === true;
        setSuccess(
          isAdminUser 
            ? `Admin OTP session verified. Entering Administrator Control Center...`
            : `Authenticated successfully as ${res.user.name} (${res.user.role}).`
        );
        setTimeout(() => {
          setSuccess(null);
          setLoginOtpCode('');
          setLoginOtpSent(false);
          onClose();
          if (isAdminUser && onNavigate) {
            onNavigate('CLIENT_ADMIN');
          }
        }, 750);
      } else {
        setError(res.error || 'Access denied. Invalid credentials or 6-digit OTP code.');
      }
    } catch (err: any) {
      setError(err?.message || 'An error occurred during authentication. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify 6-Digit OTP Sent to Registered User's Email
  const handleVerifyLoginOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const targetEmail = (pendingOtpEmail || email).trim().toLowerCase();
    const cleanOtp = loginOtpCode.trim();
    if (!targetEmail || cleanOtp.length !== 6) {
      setError('Please enter the 6-digit OTP sent to your registered email address.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await verifyLoginOtp(targetEmail, cleanOtp);
      if (res.success && res.user) {
        onLogin(res.user);
        const isAdminUser = res.user.role === 'ADMIN' && res.user.isVerifiedAdmin === true;
        setSuccess(
          isAdminUser
            ? 'Registered Admin 2FA OTP verified. Opening Administrator Control Center...'
            : `2FA OTP verified! Signed in as ${res.user.name} (${res.user.role}).`
        );
        setTimeout(() => {
          setSuccess(null);
          setLoginOtpCode('');
          setLoginOtpSent(false);
          onClose();
          if (isAdminUser && onNavigate) {
            onNavigate('CLIENT_ADMIN');
          }
        }, 750);
      } else {
        setError(res.error || 'Invalid or expired 6-digit OTP code.');
      }
    } catch (err: any) {
      setError(err?.message || 'OTP verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendLoginOtp = async () => {
    const targetEmail = (pendingOtpEmail || email).trim().toLowerCase();
    if (!targetEmail) return;
    setError(null);
    setSuccess(null);
    setIsLoading(true);
    try {
      const res = await resendLoginOtp(targetEmail);
      if (res.success) {
        setSuccess(res.message || `A fresh 6-digit OTP has been sent to ${pendingMaskedEmail || targetEmail}.`);
      } else {
        setError(res.message || 'Could not resend OTP. Please sign in again.');
      }
    } catch {
      setError('Network error while resending OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  // Production Business Registration Form Handler (Requires 6-Digit Email OTP Verification)
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const cleanEmail = regEmail.trim().toLowerCase();
    if (!cleanEmail || !regPassword || !regName.trim() || !regCompany.trim()) {
      setError('Please complete all required fields.');
      return;
    }

    const cleanOtp = regOtpCode.trim();
    if (!cleanOtp || cleanOtp.length !== 6) {
      setError('Please click "Send OTP" and enter the 6-digit verification code sent to your email before completing registration.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await apiClient.register({
        email: cleanEmail,
        password: regPassword,
        otp: cleanOtp,
        name: regName.trim(),
        company_name: regCompany.trim(),
        country: regCountry.trim(),
        role: regAccountType === 'SUPPLIER' ? 'supplier' : 'buyer',
        accountType: regAccountType
      });

      if (res.success && res.user) {
        onLogin(res.user);
        setSuccess('6-digit Email OTP verified! Business account registered successfully.');
        setTimeout(() => {
          setSuccess(null);
          setRegOtpCode('');
          setRegOtpSent(false);
          onClose();
        }, 850);
      } else {
        setError(res.error || res.message || 'Registration failed. Please check your information and 6-digit OTP code.');
      }
    } catch (err: any) {
      setError(err?.message || 'Registration service unavailable. Please retry.');
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
              : (authMode === 'LOGIN_OTP'
                  ? '2-Step Registered Email OTP Verification'
                  : (authMode === 'LOGIN' 
                      ? 'Corporate Sign In (2FA Protected)' 
                      : (authMode === 'REGISTER' ? 'Register Free Account' : 'Work With Us (Partner Vetting)')))}
          </h2>
          <p className="text-xs text-slate-300 mt-1 font-normal leading-relaxed">
            {currentUser 
              ? 'Zero-trust authorization active. Session claims validated by server.' 
              : (authMode === 'LOGIN_OTP'
                  ? `Enter the 6-digit OTP dispatched to your registered email (${pendingMaskedEmail || pendingOtpEmail}) to verify your identity.`
                  : (authMode === 'REGISTER'
                      ? '100% Free Forever • Zero Subscription Fee • Connect with Real Buyers & Suppliers.'
                      : (authMode === 'WORK_WITH_US' 
                          ? 'Enterprise KYC & Verification Onboarding to trade with real, genuine global partners.'
                          : 'Strict 2-Factor Email OTP verification is enforced for all registered users and administrators.')))}
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

              {/* JWT Session Token Inspector (Admin Only) */}
              {currentUser.role === 'ADMIN' && (
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
              )}
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
                      Manage RBAC users, custodial trade protection vaults, and data gating.
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

            {/* Wallet Funds Top-Up & Mediation Quick Access */}
            <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                  <Wallet className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Wallet Funds Top-Up &amp; Escrow</span>
                </div>
                <p className="text-[11px] text-emerald-800 mt-0.5">
                  Add funds to buyer wallet (`creditBuyerDeposit`), lock escrow, or withdraw to bank.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onNavigate) onNavigate('MEDIATOR_ENGINE');
                  setTimeout(() => {
                    window.dispatchEvent(
                      new CustomEvent('tradeheaven_open_mediation_stage', {
                        detail: { stage: 'TOPUP' }
                      })
                    );
                  }, 60);
                }}
                className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shrink-0 cursor-pointer shadow-xs"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Funds Top-Up</span>
              </button>
            </div>

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
                  Looking to onboard as an audited factory or corporate importer with tax verification &amp; trade protection assurance?
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
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 space-y-2">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
                <div className="pt-1.5 border-t border-rose-200/80 flex items-center justify-between gap-2">
                  <span className="text-[11px] text-rose-800 font-medium">Having trouble signing in or receiving OTP?</span>
                  <a
                    href={whatsappResetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shrink-0 transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Contact Trade Heaven on WhatsApp</span>
                  </a>
                </div>
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
                {/* 1-Click Select Verified Supplier Profile (Admin Only) */}
                {currentUser?.role === 'ADMIN' && (
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/90 space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
                      <span className="flex items-center gap-1.5">
                        <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                        <span>Select Supplier Profile to Login (Admin Tool):</span>
                      </span>
                      <span className="text-[10px] text-slate-500 font-normal">Auto-fills credentials</span>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setEmail('ezekiahali355@gmail.com');
                          setPassword('Ezekiah@2026');
                        }}
                        className={`p-2 text-left rounded-xl border transition-all cursor-pointer ${
                          email === 'ezekiahali355@gmail.com'
                            ? 'bg-blue-50 border-blue-400 ring-1 ring-blue-300'
                            : 'bg-white hover:bg-slate-100/80 border-slate-200'
                        }`}
                      >
                        <div className="font-bold text-slate-900 text-xs truncate">Ali Charley Ezekiah</div>
                        <div className="text-[10px] text-slate-500 truncate">ACE Intermediary</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEmail('melissa@mpcommoditybrokers.com');
                          setPassword('Password@123');
                        }}
                        className={`p-2 text-left rounded-xl border transition-all cursor-pointer ${
                          email.includes('melissa')
                            ? 'bg-blue-50 border-blue-400 ring-1 ring-blue-300'
                            : 'bg-white hover:bg-slate-100/80 border-slate-200'
                        }`}
                      >
                        <div className="font-bold text-slate-900 text-xs truncate">Melissa Prezios</div>
                        <div className="text-[10px] text-slate-500 truncate">MP Commodity Brokers</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEmail('mjohnson@atlanticpowerequip.com');
                          setPassword('Atlantic@2026');
                        }}
                        className={`p-2 text-left rounded-xl border transition-all cursor-pointer ${
                          email.includes('atlanticpowerequip')
                            ? 'bg-blue-50 border-blue-400 ring-1 ring-blue-300'
                            : 'bg-white hover:bg-slate-100/80 border-slate-200'
                        }`}
                      >
                        <div className="font-bold text-slate-900 text-xs truncate">Mark Johnson</div>
                        <div className="text-[10px] text-slate-500 truncate">Atlantic Power &amp; Equip</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEmail('randy@midforkcap.com');
                          setPassword('Randy@2026');
                        }}
                        className={`p-2 text-left rounded-xl border transition-all cursor-pointer ${
                          email.includes('midforkcap')
                            ? 'bg-blue-50 border-blue-400 ring-1 ring-blue-300'
                            : 'bg-white hover:bg-slate-100/80 border-slate-200'
                        }`}
                      >
                        <div className="font-bold text-slate-900 text-xs truncate">Mr. Randy</div>
                        <div className="text-[10px] text-slate-500 truncate">Middle Fox LLC</div>
                      </button>
                    </div>
                  </div>
                )}

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

                {/* 6-Digit Email OTP Verification Section with 'Send OTP' Button */}
                <div className="p-3 rounded-xl bg-indigo-50/70 border border-indigo-200/90 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <label className="font-bold text-indigo-950 text-[11px] flex items-center gap-1.5">
                      <Key className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      <span>6-Digit Email Verification Code (OTP) *</span>
                    </label>
                    <button
                      type="button"
                      onClick={handleSendLoginOtpClick}
                      disabled={isSendingLoginOtp || isLoading}
                      data-testid="auth-login-send-otp-btn"
                      className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs disabled:opacity-50 shrink-0"
                    >
                      <Mail className="w-3 h-3" />
                      <span>
                        {isSendingLoginOtp
                          ? 'Sending OTP...'
                          : loginOtpSent
                          ? 'Resend OTP'
                          : 'Send OTP'}
                      </span>
                    </button>
                  </div>

                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]{6}"
                    maxLength={6}
                    placeholder="Enter 6-digit OTP sent to your email"
                    value={loginOtpCode}
                    onChange={e => setLoginOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    data-testid="auth-login-otp-input"
                    className="w-full bg-white border border-indigo-200 rounded-xl px-3 py-2 text-slate-900 font-mono text-center text-sm font-black tracking-[0.35em] focus:outline-none focus:border-indigo-600"
                  />

                  <p className="text-[10px] text-indigo-900/80 leading-snug">
                    {loginOtpSent
                      ? `OTP dispatched from noreply@tradeheaven.net to ${pendingMaskedEmail || email}. Enter the 6-digit code above to sign in.`
                      : 'Click "Send OTP" to receive a 6-digit verification code on your registered email address.'}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-0.5">
                  <button
                    type="button"
                    onClick={() => {
                      if (email && !forgotEmail) setForgotEmail(email);
                      setAuthMode('FORGOT_PASSWORD');
                      setError(null);
                      setSuccess(null);
                      setForgotSuccess(null);
                    }}
                    className="text-blue-600 hover:text-blue-700 font-bold text-[11px] cursor-pointer"
                  >
                    Forgot password? (Auto OTP via noreply@tradeheaven.net)
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || loginOtpCode.trim().length !== 6}
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-sm cursor-pointer disabled:opacity-50"
                >
                  <LogIn className="w-4 h-4" />
                  <span>{isLoading ? 'Verifying OTP & Signing In...' : 'Verify OTP & Sign In'}</span>
                </button>

                {/* Login UI WhatsApp Support Link for Any Sign-In / OTP Issues */}
                <div className="p-3 rounded-xl bg-emerald-50/90 border border-emerald-200 flex items-center justify-between gap-2.5">
                  <div className="min-w-0">
                    <div className="font-bold text-emerald-950 text-[11px]">
                      Encountering login or OTP issues?
                    </div>
                    <div className="text-[10px] text-emerald-800 truncate">
                      Instant password reset &amp; account support (+91 8532934479)
                    </div>
                  </div>
                  <a
                    href={whatsappResetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] flex items-center gap-1.5 shrink-0 shadow-2xs transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Contact Trade Heaven on WhatsApp</span>
                  </a>
                </div>
              </form>
            )}

            {/* 2-STEP REGISTERED EMAIL OTP VERIFICATION VIEW */}
            {authMode === 'LOGIN_OTP' && (
              <form onSubmit={handleVerifyLoginOtpSubmit} className="space-y-4 text-xs">
                <div className="p-3.5 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-950 space-y-1.5">
                  <div className="font-black text-xs flex items-center gap-1.5 text-indigo-900">
                    <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>Registered Email 2FA Security Check</span>
                  </div>
                  <p className="text-[11px] text-indigo-900/90 leading-relaxed">
                    To protect your account against unauthorized access, a 6-digit One-Time Password (OTP) has been sent from{' '}
                    <span className="font-mono font-bold">noreply@tradeheaven.net</span> to your registered email{' '}
                    <span className="font-mono font-bold text-indigo-950">{pendingMaskedEmail || pendingOtpEmail}</span>.
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-bold text-slate-700">
                      Enter 6-Digit Email OTP Code *
                    </label>
                    <button
                      type="button"
                      onClick={handleResendLoginOtp}
                      disabled={isLoading}
                      className="text-[11px] text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Resend OTP to Email</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]{6}"
                    required
                    maxLength={6}
                    autoFocus
                    placeholder="••••••"
                    value={loginOtpCode}
                    onChange={e => setLoginOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-slate-900 font-mono text-center text-base font-black tracking-[0.4em] focus:outline-none focus:border-blue-600 focus:bg-white"
                  />
                  <p className="text-[10px] text-slate-500 mt-1 text-center">
                    Valid for 10 minutes • Sent strictly to your registered email address
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || loginOtpCode.trim().length !== 6}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-sm cursor-pointer disabled:opacity-50"
                >
                  <Key className="w-4 h-4" />
                  <span>{isLoading ? 'Verifying 6-Digit OTP...' : 'Verify OTP & Complete Sign In'}</span>
                </button>

                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('LOGIN');
                      setLoginOtpCode('');
                      setError(null);
                      setSuccess(null);
                    }}
                    className="text-slate-600 hover:text-slate-900 font-bold text-xs cursor-pointer"
                  >
                    ← Back to Email &amp; Password
                  </button>
                </div>
              </form>
            )}

            {/* FORGOT PASSWORD VIEW */}
            {authMode === 'FORGOT_PASSWORD' && (
              <form onSubmit={handleForgotPasswordSubmit} className="space-y-4 text-xs">
                <div className="text-center pb-1">
                  <h3 className="text-base font-black text-slate-900">Automated Password Reset (OTP)</h3>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    Enter your corporate email to receive an automated 6-digit verification code from{' '}
                    <span className="font-mono font-bold text-slate-800">noreply@tradeheaven.net</span>.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-blue-50/80 border border-blue-200 text-[11px] text-blue-950 space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-blue-900">
                    <Mail className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>Automated Delivery: noreply@tradeheaven.net</span>
                  </div>
                  <p className="text-blue-800/90 leading-relaxed">
                    Your 6-digit OTP is generated and dispatched automatically—no manual forwarding wait. Please also check your Spam/Junk folder.
                  </p>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Corporate Work Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      required
                      placeholder="name@company.com"
                      value={forgotEmail}
                      onChange={e => setForgotEmail(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-blue-500 focus:bg-white"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-sm cursor-pointer disabled:opacity-50"
                >
                  <Key className="w-4 h-4" />
                  <span>{isLoading ? 'Dispatching Automated OTP...' : 'Send 6-Digit OTP (noreply@tradeheaven.net)'}</span>
                </button>

                {/* Direct WhatsApp Support Fallback Card */}
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-black text-emerald-950 text-xs flex items-center gap-1.5">
                      <MessageCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>OTP Not Reaching Your Inbox?</span>
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-200/80 text-emerald-900">
                      24/7 Instant Help
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-900 leading-relaxed">
                    If your corporate mail firewall blocks automated emails from <span className="font-mono font-semibold">noreply@tradeheaven.net</span>, contact Trade Heaven on WhatsApp for an instant password reset solution:
                  </p>
                  <a
                    href={whatsappResetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Contact Trade Heaven on WhatsApp (+91 8532934479)</span>
                  </a>
                </div>

                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={() => setAuthMode('LOGIN')}
                    className="text-slate-600 hover:text-slate-900 font-bold text-xs cursor-pointer"
                  >
                    Back to Sign In
                  </button>
                </div>
              </form>
            )}

            {/* RESET PASSWORD VIEW */}
            {authMode === 'RESET_PASSWORD' && (
              <form onSubmit={handleResetPasswordSubmit} className="space-y-3.5 text-xs">
                <div className="text-center pb-1">
                  <h3 className="text-base font-black text-slate-900">Verify OTP &amp; Set New Password</h3>
                  <p className="text-slate-500 text-[11px]">
                    Dispatched from <span className="font-mono font-bold text-slate-700">noreply@tradeheaven.net</span> to{' '}
                    <span className="font-bold text-slate-800">{forgotEmail}</span>
                  </p>
                </div>

                {forgotSuccess && (
                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 text-[11px] space-y-1.5">
                    <div className="font-bold flex items-center gap-1.5 text-emerald-800">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{forgotSuccess}</span>
                    </div>
                  </div>
                )}

                {resetSuccess ? (
                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-800 text-xs font-bold text-center">
                    {resetSuccess} Redirecting to sign in...
                  </div>
                ) : (
                  <>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block font-bold text-slate-700">6-Digit Verification Code (OTP)</label>
                        <button
                          type="button"
                          onClick={handleResendOtp}
                          disabled={isLoading}
                          className="text-[11px] text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1 cursor-pointer disabled:opacity-50"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>Resend OTP</span>
                        </button>
                      </div>
                      <input
                        type="text"
                        required
                        maxLength={6}
                        placeholder="123456"
                        value={resetTokenInput}
                        onChange={e => setResetTokenInput(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono text-center text-sm tracking-widest focus:outline-none focus:border-blue-500 focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">New Password * (min 6 characters)</label>
                      <input
                        type="password"
                        required
                        minLength={6}
                        placeholder="••••••••••••"
                        value={resetNewPassword}
                        onChange={e => setResetNewPassword(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-blue-500 focus:bg-white"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-sm cursor-pointer disabled:opacity-50"
                    >
                      <span>{isLoading ? 'Updating Password...' : 'Update Password & Sign In'}</span>
                    </button>
                  </>
                )}

                {/* WhatsApp Instant Support Fallback */}
                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1.5">
                  <div className="font-bold text-emerald-950 text-[11px] flex items-center gap-1.5">
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Need Help Resetting Your Password?</span>
                  </div>
                  <p className="text-[11px] text-emerald-900 leading-relaxed">
                    If the OTP from <span className="font-mono font-semibold">noreply@tradeheaven.net</span> hasn&apos;t arrived, contact Trade Heaven on WhatsApp for an immediate solution:
                  </p>
                  <a
                    href={whatsappResetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp Trade Heaven (+91 8532934479)</span>
                  </a>
                </div>

                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={() => setAuthMode('LOGIN')}
                    className="text-slate-600 hover:text-slate-900 font-bold text-xs cursor-pointer"
                  >
                    Back to Sign In
                  </button>
                </div>
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

                {/* 6-Digit Email OTP Verification Section with 'Send OTP' Button for Registration */}
                <div className="p-3 rounded-xl bg-indigo-50/70 border border-indigo-200/90 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <label className="font-bold text-indigo-950 text-[11px] flex items-center gap-1.5">
                      <Key className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      <span>6-Digit Email Verification Code (OTP) *</span>
                    </label>
                    <button
                      type="button"
                      onClick={handleSendRegisterOtpClick}
                      disabled={isSendingRegOtp || isLoading}
                      data-testid="auth-register-send-otp-btn"
                      className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs disabled:opacity-50 shrink-0"
                    >
                      <Mail className="w-3 h-3" />
                      <span>
                        {isSendingRegOtp
                          ? 'Sending OTP...'
                          : regOtpSent
                          ? 'Resend OTP'
                          : 'Send OTP'}
                      </span>
                    </button>
                  </div>

                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]{6}"
                    required
                    maxLength={6}
                    placeholder="Enter 6-digit OTP sent to your email"
                    value={regOtpCode}
                    onChange={e => setRegOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    data-testid="auth-register-otp-input"
                    className="w-full bg-white border border-indigo-200 rounded-xl px-3 py-2 text-slate-900 font-mono text-center text-sm font-black tracking-[0.35em] focus:outline-none focus:border-indigo-600"
                  />

                  <p className="text-[10px] text-indigo-900/80 leading-snug">
                    {regOtpSent
                      ? `OTP sent from noreply@tradeheaven.net to ${regEmail.trim()}. Enter the 6-digit code above to complete registration.`
                      : 'Click "Send OTP" to verify your corporate email address before completing registration.'}
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || regOtpCode.trim().length !== 6}
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-sm cursor-pointer disabled:opacity-50 mt-2"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>{isLoading ? 'Verifying OTP & Registering...' : 'Verify OTP & Complete Business Registration'}</span>
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
