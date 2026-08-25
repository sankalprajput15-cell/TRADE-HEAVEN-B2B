/**
 * Trade Heaven - Multi-step RFQ Submission Modal
 * Features:
 * 1. Automatic draft persistence in localStorage ('trade_heaven_rfq_draft')
 * 2. Instant optimistic UI sync upon submission
 * 3. Direct integration with api.php & MySQL backend
 */

import React, { useState, useEffect } from 'react';
import { X, ArrowRight, ArrowLeft, CheckCircle2, ShieldCheck, Upload, AlertCircle, Loader2, Sparkles, Building, Globe, DollarSign, Package } from 'lucide-react';
import { RFQ } from '../types';
import { apiClient } from '../services/apiClient';

interface PostRFQModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (newRfq: RFQ) => void;
  prefillCategory?: string;
}

const DRAFT_KEY = 'trade_heaven_rfq_draft';

const CATEGORIES = [
  'Industrial Machinery & CNC',
  'Electronics & Semiconductors',
  'Apparel, Textiles & Fabrics',
  'Solar Energy & Clean Tech',
  'Metals, Alloys & Raw Materials',
  'Chemicals & Plastics',
  'Automotive & Transportation',
  'Agriculture & Food Commodities',
  'Medical Equipment & Pharma',
  'Packaging & Printing'
];

const INCOTERMS = ['FOB', 'CIF', 'EXW', 'DDP', 'CFR', 'FCA'];
const UNITS = ['Pieces', 'Sets', 'Metric Tons', 'Kilograms', 'Meters', 'Containers (20ft)', 'Containers (40ft HQ)', 'Boxes', 'Liters'];

export const PostRFQModal: React.FC<PostRFQModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  prefillCategory
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    // Step 1: Product Specs
    productName: '',
    category: prefillCategory || 'Industrial Machinery & CNC',
    targetQuantity: 1000,
    quantityUnit: 'Pieces',
    targetPriceUsd: 25,
    detailedRequirements: '',

    // Step 2: Logistics & Trade Terms
    incoterm: 'FOB',
    destinationPort: 'Port of Hamburg',
    paymentTerms: 'Trade Assurance Escrow (Swiss Vault)',
    urgency: 'STANDARD',

    // Step 3: Buyer & Company Profile
    buyerName: '',
    buyerCompany: '',
    buyerEmail: '',
    buyerPhone: '',
    buyerCountry: 'United States'
  });

  // Restore draft from localStorage or user session on open
  useEffect(() => {
    if (!isOpen) return;

    try {
      const savedDraft = localStorage.getItem(DRAFT_KEY);
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft);
        setFormData(prev => ({ ...prev, ...parsed }));
      } else {
        // Pre-fill buyer details from logged-in user if available
        const userStr = localStorage.getItem('tradeheaven_user') || localStorage.getItem('th_session_user');
        if (userStr) {
          const u = JSON.parse(userStr);
          setFormData(prev => ({
            ...prev,
            buyerName: u.name || prev.buyerName,
            buyerEmail: u.email || prev.buyerEmail,
            buyerCompany: u.companyName || prev.buyerCompany,
            buyerPhone: u.phone || prev.buyerPhone,
            buyerCountry: u.country || prev.buyerCountry
          }));
        }
      }
    } catch {}
  }, [isOpen]);

  // Persist draft on changes
  useEffect(() => {
    if (isOpen && !isSubmitted) {
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(formData));
      } catch {}
    }
  }, [formData, isOpen, isSubmitted]);

  if (!isOpen) return null;

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    setErrorMessage('');
    if (step === 1) {
      if (!formData.productName.trim()) {
        setErrorMessage('Please enter the exact product or commodity name.');
        return;
      }
      if (!formData.targetQuantity || formData.targetQuantity <= 0) {
        setErrorMessage('Please enter a valid procurement quantity.');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!formData.destinationPort.trim()) {
        setErrorMessage('Please specify your destination discharge port or city.');
        return;
      }
      setStep(3);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.buyerName.trim()) {
      setErrorMessage('Please enter your procurement contact name.');
      return;
    }
    if (!formData.buyerEmail.trim() || !formData.buyerEmail.includes('@')) {
      setErrorMessage('Please enter a valid corporate email address.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        product_name: formData.productName,
        title: `Buy Lead RFQ: ${formData.targetQuantity} ${formData.quantityUnit} of ${formData.productName}`,
        category: formData.category,
        quantity: Number(formData.targetQuantity),
        quantity_unit: formData.quantityUnit,
        target_price: Number(formData.targetPriceUsd),
        incoterm: formData.incoterm,
        destination_port: formData.destinationPort,
        payment_terms: formData.paymentTerms,
        requirements: formData.detailedRequirements || `Procurement of ${formData.productName}. Target quantity: ${formData.targetQuantity} ${formData.quantityUnit}. Incoterm: ${formData.incoterm}.`,
        buyer_name: formData.buyerName,
        buyer_company: formData.buyerCompany || formData.buyerName,
        buyer_email: formData.buyerEmail,
        buyer_phone: formData.buyerPhone,
        buyer_country: formData.buyerCountry,
        status: 'OPEN'
      };

      const result = await apiClient.submitRfq(payload);

      if (result.success && result.data) {
        // Clear draft
        try {
          localStorage.removeItem(DRAFT_KEY);
        } catch {}

        setIsSubmitted(true);

        // Optimistic UI state update in parent
        if (onSuccess) {
          onSuccess(result.data);
        }

        setTimeout(() => {
          setIsSubmitted(false);
          setStep(1);
          onClose();
        }, 1800);
      } else {
        setErrorMessage(result.message || 'Failed to submit RFQ to database.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Network communication error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-8">
        {/* Header */}
        <div className="bg-slate-900 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Broadcast Sourcing RFQ (Buy Lead)</h2>
              <p className="text-xs text-slate-400">Free broadcast to 50,000+ audited manufacturers & exporters</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="grid grid-cols-3 bg-slate-100 border-b border-slate-200 text-xs font-semibold">
          <div className={`py-2.5 px-4 text-center border-r border-slate-200 ${step === 1 ? 'bg-blue-50 text-blue-700 font-bold' : step > 1 ? 'text-emerald-700 bg-emerald-50' : 'text-slate-500'}`}>
            1. Product Specs
          </div>
          <div className={`py-2.5 px-4 text-center border-r border-slate-200 ${step === 2 ? 'bg-blue-50 text-blue-700 font-bold' : step > 2 ? 'text-emerald-700 bg-emerald-50' : 'text-slate-500'}`}>
            2. Logistics & Terms
          </div>
          <div className={`py-2.5 px-4 text-center ${step === 3 ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-500'}`}>
            3. Buyer Profile
          </div>
        </div>

        {/* Success Screen */}
        {isSubmitted ? (
          <div className="p-10 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4 animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900">RFQ Published to Live Network!</h3>
            <p className="text-sm text-slate-600 mt-2 max-w-md">
              Your sourcing requirement has been saved into the Trade Heaven database and broadcasted to verified global suppliers.
            </p>
            <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <span>Quotes will be filtered for ISO compliance and routed to your dashboard.</span>
            </div>
          </div>
        ) : (
          <form onSubmit={step === 3 ? handleSubmit : (e) => { e.preventDefault(); handleNext(); }} className="p-6 sm:p-8 space-y-6">
            {errorMessage && (
              <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Step 1: Product Specs */}
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                    Product / Commodity Name *
                  </label>
                  <input
                    type="text"
                    value={formData.productName}
                    onChange={(e) => handleChange('productName', e.target.value)}
                    placeholder="e.g. 5-Axis CNC Milling Center, Grade A Arabica Coffee Beans, 500W Solar Panels"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                      Industry Category
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => handleChange('category', e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                    >
                      {CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                      Target Unit Price (USD)
                    </label>
                    <div className="relative">
                      <DollarSign className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <input
                        type="number"
                        step="0.01"
                        value={formData.targetPriceUsd}
                        onChange={(e) => handleChange('targetPriceUsd', Number(e.target.value))}
                        className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                      Required Quantity *
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.targetQuantity}
                      onChange={(e) => handleChange('targetQuantity', Number(e.target.value))}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                      Quantity Unit
                    </label>
                    <select
                      value={formData.quantityUnit}
                      onChange={(e) => handleChange('quantityUnit', e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                    >
                      {UNITS.map(u => (
                        <option key={u} value={u}>{u}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                    Detailed Technical Specifications & Packaging
                  </label>
                  <textarea
                    rows={3}
                    value={formData.detailedRequirements}
                    onChange={(e) => handleChange('detailedRequirements', e.target.value)}
                    placeholder="Specify certifications needed (CE, ISO, FDA), material grades, packaging requirements, or custom branding..."
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>
              </div>
            )}

            {/* Step 2: Logistics & Terms */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                      Preferred Incoterm (ICC Rules)
                    </label>
                    <select
                      value={formData.incoterm}
                      onChange={(e) => handleChange('incoterm', e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                    >
                      {INCOTERMS.map(term => (
                        <option key={term} value={term}>{term}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                      Destination Port / Delivery City *
                    </label>
                    <input
                      type="text"
                      value={formData.destinationPort}
                      onChange={(e) => handleChange('destinationPort', e.target.value)}
                      placeholder="e.g. Port of Los Angeles, Rotterdam, Nhava Sheva"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                    Payment & Escrow Protection
                  </label>
                  <select
                    value={formData.paymentTerms}
                    onChange={(e) => handleChange('paymentTerms', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  >
                    <option value="Trade Assurance Escrow (Swiss Vault)">Trade Assurance Escrow (Swiss Vault) - 0% Fee</option>
                    <option value="Irrevocable LC at Sight (Tier 1 Bank)">Irrevocable LC at Sight (Tier 1 Bank)</option>
                    <option value="30% TT Deposit, 70% against BL Copy">30% TT Deposit, 70% against BL Copy</option>
                    <option value="100% CAD (Cash Against Documents)">100% CAD (Cash Against Documents)</option>
                  </select>
                </div>

                <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-2xl flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-blue-900">
                    <span className="font-bold">Trade Heaven Escrow Guarantee:</span> Your funds remain securely held in segregated Swiss banking vault accounts until Bill of Lading and SGS Quality Inspections are confirmed.
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Buyer & Company Profile */}
            {step === 3 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                      Contact / Buyer Name *
                    </label>
                    <input
                      type="text"
                      value={formData.buyerName}
                      onChange={(e) => handleChange('buyerName', e.target.value)}
                      placeholder="e.g. Alex Morgan"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                      Company Name *
                    </label>
                    <input
                      type="text"
                      value={formData.buyerCompany}
                      onChange={(e) => handleChange('buyerCompany', e.target.value)}
                      placeholder="e.g. Pacific Logistics Corp"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                      Corporate Email *
                    </label>
                    <input
                      type="email"
                      value={formData.buyerEmail}
                      onChange={(e) => handleChange('buyerEmail', e.target.value)}
                      placeholder="procurement@company.com"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                      Phone / WhatsApp
                    </label>
                    <input
                      type="tel"
                      value={formData.buyerPhone}
                      onChange={(e) => handleChange('buyerPhone', e.target.value)}
                      placeholder="+1 (555) 019-2834"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                    Buyer Country
                  </label>
                  <input
                    type="text"
                    value={formData.buyerCountry}
                    onChange={(e) => handleChange('buyerCountry', e.target.value)}
                    placeholder="e.g. United States, Germany, United Kingdom"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>
              </div>
            )}

            {/* Footer Navigation */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={() => setStep((step - 1) as any)}
                  className="px-5 py-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-semibold flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
              ) : (
                <div />
              )}

              {step < 3 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-blue-500/20"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-7 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-500/20"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Broadcasting to MySQL...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Publish Sourcing RFQ</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
