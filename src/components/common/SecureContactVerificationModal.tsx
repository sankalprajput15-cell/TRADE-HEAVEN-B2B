import React, { useState, useEffect } from 'react';
import { Lock, ShieldCheck, CheckCircle2, Eye, Loader2, X, AlertCircle, LogIn, Building, Phone, Mail } from 'lucide-react';
import { AuthUser } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentUser: AuthUser | null;
  resourceTitle: string;
  onVerified: () => void;
}

export const SecureContactVerificationModal: React.FC<Props> = ({
  isOpen,
  onClose,
  currentUser,
  resourceTitle,
  onVerified,
}) => {
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [companyName, setCompanyName] = useState<string>('');
  const [verificationStep, setVerificationStep] = useState<'FORM' | 'VERIFYING' | 'SUCCESS'>('FORM');
  const [statusMessage, setStatusMessage] = useState<string>('Initiating trust handshake protocol...');
  const [errorMsg, setErrorMsg] = useState<string>('');

  useEffect(() => {
    if (currentUser) {
      setEmail(currentUser.email || '');
      setCompanyName(currentUser.companyName || '');
    }
  }, [currentUser]);

  useEffect(() => {
    if (verificationStep === 'VERIFYING') {
      const timers = [
        setTimeout(() => setStatusMessage('Analyzing domain compliance & email validity...'), 800),
        setTimeout(() => setStatusMessage('Consulting corporate registrar registry...'), 1600),
        setTimeout(() => setStatusMessage('Registering secure lead token for routing...'), 2400),
        setTimeout(() => {
          setVerificationStep('SUCCESS');
          onVerified();
        }, 3200)
      ];
      return () => timers.forEach(t => clearTimeout(t));
    }
  }, [verificationStep, onVerified]);

  if (!isOpen) return null;

  const handleRunVerification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !phone || !companyName) {
      setErrorMsg('Please complete all fields to establish a secure clearance channel.');
      return;
    }
    setErrorMsg('');
    setVerificationStep('VERIFYING');
  };

  const handleTriggerLogin = () => {
    onClose();
    window.dispatchEvent(new CustomEvent('tradeheaven_navigate', { detail: 'AUTH_LOGIN' }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200" id="secure-contact-verification-modal">
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 max-w-md w-full shadow-2xl relative space-y-6 animate-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-50 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {!currentUser ? (
          /* Authentication Gate Screen */
          <div className="text-center space-y-5 py-4">
            <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto border border-amber-100 shadow-xs">
              <Lock className="w-6 h-6 animate-bounce" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-black text-slate-900 tracking-tight">Login Required for Access</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                Direct supply-chain contact channels and unmasked phone lines are secured under TradeHeaven security regulations. Please sign in to verify your buyer identity.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <button
                type="button"
                onClick={handleTriggerLogin}
                className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md hover:shadow-lg"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In to Your Account</span>
              </button>
              <p className="text-[10px] text-slate-400">
                Don't have an account? Sign in options support rapid business registration.
              </p>
            </div>
          </div>
        ) : (
          /* Verification Sourcing Flow for Logged-In User */
          <>
            {verificationStep === 'FORM' && (
              <form onSubmit={handleRunVerification} className="space-y-5">
                <div className="space-y-2 text-center">
                  <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto border border-blue-100 shadow-xs">
                    <ShieldCheck className="w-7 h-7" />
                  </div>
                  <h3 className="text-lg font-black text-slate-900 tracking-tight">Secure Direct Line Sourcing</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Verify your active corporate credentials to request official unmasked direct access to <span className="font-bold text-blue-600">{resourceTitle}</span>.
                  </p>
                </div>

                {errorMsg && (
                  <div className="p-3 rounded-2xl bg-red-50 text-red-700 text-xs flex items-start gap-1.5 border border-red-100">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div className="space-y-3.5 text-xs">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span>Enterprise Email Address</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. procurement@firm.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-hidden font-semibold text-slate-800 bg-slate-50/50 transition-all"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>Corporate Phone Number</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. +1 555-019-2834"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-hidden font-semibold text-slate-800 bg-slate-50/50 transition-all"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-slate-400" />
                      <span>Company Name / Organization</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Apex Industrial Sourcing Ltd"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-hidden font-semibold text-slate-800 bg-slate-50/50 transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md hover:shadow-lg"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Establish Secure Connection</span>
                </button>
              </form>
            )}

            {verificationStep === 'VERIFYING' && (
              <div className="py-8 flex flex-col items-center text-center space-y-4">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                <div className="space-y-1.5">
                  <h4 className="text-base font-bold text-slate-900">Establishing Secure Clearance</h4>
                  <p className="text-xs text-slate-500 font-medium max-w-[260px] leading-relaxed">
                    {statusMessage}
                  </p>
                </div>
              </div>
            )}

            {verificationStep === 'SUCCESS' && (
              <div className="py-4 flex flex-col items-center text-center space-y-5 animate-in zoom-in-95">
                <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center border border-emerald-100 shadow-xs">
                  <CheckCircle2 className="w-7 h-7 animate-ping-once" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-black text-slate-900 tracking-tight">Direct Line Clearance Approved</h3>
                  <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
                    Your organization's procurement clearance tokens have been successfully generated. Direct contact channels are now fully unmasked.
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="px-6 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm transition-all w-full cursor-pointer shadow-md"
                >
                  Proceed to Contact Details
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
