/**
 * Trade4Deals / Trade Heaven - Multi-step RFQ Submission Modal
 *
 * Requirements:
 * 1. Auto-save form progress into localStorage under 'rfq_form_draft' with a 400ms debounce.
 * 2. When the user clicks Submit:
 *    - Send payload via apiClient.submitRfq().
 *    - On success, call parent callback onRfqCreated(newRfq) to immediately prepend the new item.
 *    - Purge localStorage.removeItem('rfq_form_draft').
 *    - Close modal and show success feedback.
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  ShieldCheck, 
  AlertCircle, 
  Loader2, 
  FileText, 
  DollarSign, 
  Package, 
  Globe, 
  Building 
} from 'lucide-react';
import { RFQ } from '../types';
import { apiClient } from '../services/apiClient';

interface PostRFQModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (newRfq: RFQ) => void;
  onRfqCreated?: (newRfq: RFQ) => void;
  prefillCategory?: string;
}

const DRAFT_KEY = 'rfq_form_draft';

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
  onRfqCreated,
  prefillCategory
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    // Step 1: Product Specs
    title: '',
    category: prefillCategory || 'Industrial Machinery & CNC',
    quantity: '1000',
    unit: 'Pieces',
    targetPrice: '25',
    specifications: '',

    // Step 2: Logistics & Trade Terms
    incoterms: 'FOB',
    destinationPort: 'Port of Hamburg',

    // Step 3: Buyer & Company Profile
    buyer_name: '',
    buyer_company: '',
    buyer_email: '',
    buyer_phone: '',
    buyer_country: 'United States'
  });

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Restore draft from localStorage under 'rfq_form_draft' on open
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
            buyer_name: u.name || prev.buyer_name,
            buyer_email: u.email || prev.buyer_email,
            buyer_company: u.companyName || u.company || prev.buyer_company,
            buyer_phone: u.phone || prev.buyer_phone,
            buyer_country: u.country || prev.buyer_country
          }));
        }
      }
    } catch {}
  }, [isOpen]);

  // Auto-save form progress into localStorage under 'rfq_form_draft' with a 400ms debounce
  useEffect(() => {
    if (!isOpen || isSubmitted) return;

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(formData));
      } catch {}
    }, 400);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [formData, isOpen, isSubmitted]);

  if (!isOpen) return null;

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    setErrorMessage('');
    if (step === 1) {
      if (!formData.title.trim()) {
        setErrorMessage('Please enter the exact product or commodity title.');
        return;
      }
      if (!formData.quantity || Number(formData.quantity) <= 0) {
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

    if (!formData.buyer_name.trim()) {
      setErrorMessage('Please enter your procurement contact name.');
      return;
    }
    if (!formData.buyer_email.trim() || !formData.buyer_email.includes('@')) {
      setErrorMessage('Please enter a valid corporate email address.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        title: formData.title,
        category: formData.category,
        quantity: formData.quantity,
        unit: formData.unit,
        targetPrice: formData.targetPrice,
        incoterms: formData.incoterms,
        destinationPort: formData.destinationPort,
        specifications: formData.specifications || `Procurement requirement for ${formData.quantity} ${formData.unit} of ${formData.title}. Target terms: ${formData.incoterms} to ${formData.destinationPort}.`,
        buyer_name: formData.buyer_name,
        buyer_country: formData.buyer_country,
        buyer_email: formData.buyer_email,
        buyer_company: formData.buyer_company || formData.buyer_name,
        buyer_phone: formData.buyer_phone
      };

      const result = await apiClient.submitRfq(payload);

      if (result.success && result.data) {
        const newRfq = result.data;

        // 3. Purge localStorage.removeItem('rfq_form_draft')
        try {
          localStorage.removeItem(DRAFT_KEY);
        } catch {}

        setIsSubmitted(true);

        // 2. Call parent callback onRfqCreated(newRfq) / onSuccess(newRfq)
        if (onRfqCreated) {
          onRfqCreated(newRfq);
        } else if (onSuccess) {
          onSuccess(newRfq);
        }

        // Trigger window event for any independent listener
        window.dispatchEvent(new CustomEvent('tradeheaven_rfq_created', { detail: newRfq }));

        // 4. Close modal after brief success presentation
        setTimeout(() => {
          setIsSubmitted(false);
          setStep(1);
          onClose();
        }, 1500);
      } else {
        setErrorMessage(result.message || 'Failed to persist RFQ to MySQL database.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Network communication error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="post-rfq-modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div id="post-rfq-modal-container" className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-8">
        {/* Header */}
        <div className="bg-slate-900 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Broadcast Sourcing RFQ (Buy Lead)</h2>
              <p className="text-xs text-slate-400">Direct persistence to MySQL via api.php • Verified B2B Suppliers</p>
            </div>
          </div>
          <button
            id="post-rfq-close-btn"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Progress Step Bar */}
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
          <div id="post-rfq-success-card" className="p-10 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4 animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900">RFQ Saved to MySQL Database!</h3>
            <p className="text-sm text-slate-600 mt-2 max-w-md">
              Your sourcing requirement is permanently saved and will remain visible across page reloads.
            </p>
            <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <span>Verified suppliers can now submit competitive binding quotations.</span>
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
                    Product Title / Commodity Name *
                  </label>
                  <input
                    id="rfq-input-title"
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleChange('title', e.target.value)}
                    placeholder="e.g. Grade 316 Stainless Steel Heavy Coils, 580W Solar Panels"
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
                      id="rfq-select-category"
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
                      Target Price (USD)
                    </label>
                    <div className="relative">
                      <DollarSign className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <input
                        id="rfq-input-price"
                        type="text"
                        value={formData.targetPrice}
                        onChange={(e) => handleChange('targetPrice', e.target.value)}
                        placeholder="e.g. 25.00"
                        className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                      Quantity *
                    </label>
                    <input
                      id="rfq-input-quantity"
                      type="text"
                      value={formData.quantity}
                      onChange={(e) => handleChange('quantity', e.target.value)}
                      placeholder="e.g. 1000"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                      Unit
                    </label>
                    <select
                      id="rfq-select-unit"
                      value={formData.unit}
                      onChange={(e) => handleChange('unit', e.target.value)}
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
                    Specifications & Technical Requirements
                  </label>
                  <textarea
                    id="rfq-textarea-specifications"
                    rows={3}
                    value={formData.specifications}
                    onChange={(e) => handleChange('specifications', e.target.value)}
                    placeholder="Enter detailed technical specs, certifications (CE, ISO, SGS), packaging, or delivery requirements..."
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
                      Incoterms (ICC Standards)
                    </label>
                    <select
                      id="rfq-select-incoterms"
                      value={formData.incoterms}
                      onChange={(e) => handleChange('incoterms', e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                    >
                      {INCOTERMS.map(term => (
                        <option key={term} value={term}>{term}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                      Destination Port / City *
                    </label>
                    <input
                      id="rfq-input-destination-port"
                      type="text"
                      value={formData.destinationPort}
                      onChange={(e) => handleChange('destinationPort', e.target.value)}
                      placeholder="e.g. Port of Los Angeles, Hamburg, Nhava Sheva"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                      required
                    />
                  </div>
                </div>

                <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-2xl flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-blue-900">
                    <span className="font-bold">MySQL Cloud Persistence:</span> All posted requirements are committed via prepared PDO statements directly to the central B2B marketplace database.
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
                      Buyer Name *
                    </label>
                    <input
                      id="rfq-input-buyer-name"
                      type="text"
                      value={formData.buyer_name}
                      onChange={(e) => handleChange('buyer_name', e.target.value)}
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
                      id="rfq-input-buyer-company"
                      type="text"
                      value={formData.buyer_company}
                      onChange={(e) => handleChange('buyer_company', e.target.value)}
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
                      id="rfq-input-buyer-email"
                      type="email"
                      value={formData.buyer_email}
                      onChange={(e) => handleChange('buyer_email', e.target.value)}
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
                      id="rfq-input-buyer-phone"
                      type="tel"
                      value={formData.buyer_phone}
                      onChange={(e) => handleChange('buyer_phone', e.target.value)}
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
                    id="rfq-input-buyer-country"
                    type="text"
                    value={formData.buyer_country}
                    onChange={(e) => handleChange('buyer_country', e.target.value)}
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
                  id="rfq-btn-back"
                  type="button"
                  onClick={() => setStep((step - 1) as any)}
                  className="px-5 py-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-semibold flex items-center gap-2 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
              ) : (
                <div />
              )}

              {step < 3 ? (
                <button
                  id="rfq-btn-continue"
                  type="button"
                  onClick={handleNext}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-blue-500/20 cursor-pointer"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  id="rfq-btn-submit"
                  type="submit"
                  disabled={isSubmitting}
                  className="px-7 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving to MySQL...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Submit RFQ to Database</span>
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
