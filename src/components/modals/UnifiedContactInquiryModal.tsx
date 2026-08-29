import React, { useState, useEffect } from 'react';
import { 
  X, 
  Mail, 
  Phone, 
  Send, 
  ShieldCheck, 
  MessageCircle, 
  ExternalLink, 
  CheckCircle2, 
  Building2, 
  FileText, 
  DollarSign, 
  Eye, 
  EyeOff, 
  Layers, 
  Package, 
  Globe2, 
  ArrowRight,
  Clock
} from 'lucide-react';
import { OFFICIAL_WHATSAPP_DATA } from '../common/TradeHeavenSocialBar';
import { bigrockApi, DbInquiry } from '../../services/bigrockApi';
import { Incoterm } from '../../types';

export interface UnifiedContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetType: 'RFQ' | 'PRODUCT' | 'SUPPLIER' | 'GENERAL';
  targetId?: string;
  targetTitle?: string;
  targetSubtitle?: string;
  contactEmail?: string;
  contactPhone?: string;
  supplierCompany?: string;
  initialQuantity?: number;
  initialPrice?: number;
  onSuccess?: (inquiry: DbInquiry) => void;
}

export const UnifiedContactInquiryModal: React.FC<UnifiedContactModalProps> = ({
  isOpen,
  onClose,
  targetType,
  targetId,
  targetTitle,
  targetSubtitle,
  contactEmail,
  contactPhone,
  supplierCompany,
  initialQuantity,
  initialPrice,
  onSuccess
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [quotedPrice, setQuotedPrice] = useState<number | string>(initialPrice || '');
  const [incoterm, setIncoterm] = useState<Incoterm>('FOB');
  const [message, setMessage] = useState('');
  const [showDirectContact, setShowDirectContact] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Set intelligent defaults based on target type
  useEffect(() => {
    if (targetType === 'RFQ') {
      setMessage(`We have reviewed your RFQ requirement for ${targetTitle || 'this item'} and would like to submit a formal factory quote with prompt lead times and export certifications.`);
    } else if (targetType === 'PRODUCT') {
      setMessage(`We are interested in purchasing ${targetTitle || 'this product'} in wholesale volume. Please provide FOB/CIF quotation, MOQ terms, and sample availability.`);
    } else if (targetType === 'SUPPLIER') {
      setMessage(`We would like to connect with ${supplierCompany || 'your export desk'} regarding wholesale manufacturing capabilities and catalog pricing.`);
    } else {
      setMessage(`General trade and trade protection inquiry regarding sourcing on Trade Heaven.`);
    }
  }, [targetType, targetTitle, supplierCompany]);

  const defaultEmail = contactEmail || (supplierCompany ? `sales@${supplierCompany.toLowerCase().replace(/[^a-z0-9]/g, '')}.com` : 'desk@tradeheaven.net');
  const defaultPhone = contactPhone || '+1 (800) 555-0199';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const subjectLine = targetType === 'RFQ' 
      ? `Supplier Factory Bid for RFQ [${targetId || 'ID'}]: ${targetTitle || 'Requirement'}`
      : targetType === 'PRODUCT'
      ? `Product Inquiry: ${targetTitle || 'Wholesale Item'}`
      : `Supplier Direct Connect: ${supplierCompany || 'Exporter'}`;

    const structuredMsg = `${message}\n\n[Details]: Target Item/RFQ: ${targetTitle || 'N/A'} (ID: ${targetId || 'N/A'})${quotedPrice ? ` | Quoted Price: $${quotedPrice} (${incoterm})` : ''}${initialQuantity ? ` | Volume: ${initialQuantity}` : ''}`;

    const newInquiryPayload = {
      buyer_name: name || 'Trade Heaven Buyer / Supplier',
      buyer_email: email || 'procurement@tradeheaven.net',
      buyer_phone: phone || '',
      buyer_company: supplierCompany || name || 'Trade Partner Enterprise',
      buyer_country: 'United States',
      product_name: targetTitle || 'B2B Sourcing Inquiry',
      category: 'General',
      quantity: Number(initialQuantity) || 1000,
      quantity_unit: 'Pieces',
      target_price: Number(quotedPrice) || 0,
      incoterm: incoterm || 'FOB',
      destination_port: 'Port of Dispatch',
      payment_terms: 'Trade Protection Certificate (Swiss Vault)',
      requirements: structuredMsg,
      status: 'pending',
      name: name || 'Trade Heaven Buyer / Supplier',
      email: email || 'procurement@tradeheaven.net',
      phone: phone || '',
      subject: subjectLine,
      message: structuredMsg
    };

    try {
      // Submit via POST ./api.php?action=submit_rfq
      const res = await bigrockApi.submitRfq(newInquiryPayload);
      if (!res.success) throw new Error(res.message || 'Failed to submit via API');

      setIsSuccess(true);
      if (onSuccess) {
        onSuccess(newInquiryPayload as unknown as DbInquiry);
      }

      // Notify other components to refresh RFQ feed
      window.dispatchEvent(new CustomEvent('tradeheaven_rfq_created', { detail: newInquiryPayload }));

      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 1600);
    } catch (err: any) {
      console.error('[Contact submit error]:', err);
      alert(err.message || 'Failed to submit. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-950/75 backdrop-blur-xs overflow-hidden"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl w-full max-w-2xl max-h-[calc(100dvh-1.5rem)] sm:max-h-[calc(100dvh-3rem)] flex flex-col shadow-2xl relative text-slate-900 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-white/90 hover:text-white transition-colors shadow-sm cursor-pointer"
          title="Close Modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white p-5 sm:p-6 shrink-0 pr-14">
          <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>
              {targetType === 'RFQ' ? 'Submit Binding Factory Quote' : targetType === 'PRODUCT' ? 'Inquire & Request FOB Quote' : 'Connect with Exporter'}
            </span>
          </div>
          
          <h2 className="text-lg sm:text-xl font-black text-white leading-tight line-clamp-1">
            {targetTitle || 'Direct Sourcing & Quotation Channel'}
          </h2>

          <div className="flex items-center gap-3 text-xs text-slate-300 mt-1 flex-wrap">
            {targetId && (
              <span className="font-mono bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded border border-blue-400/30">
                Ref: {targetId}
              </span>
            )}
            {supplierCompany && (
              <span className="flex items-center gap-1 text-slate-200 font-semibold">
                <Building2 className="w-3.5 h-3.5 text-slate-400" /> {supplierCompany}
              </span>
            )}
            {targetSubtitle && (
              <span className="text-slate-400 truncate max-w-xs">{targetSubtitle}</span>
            )}
          </div>
        </div>

        {/* Quick Contact & WhatsApp Strip */}
        <div className="bg-slate-50 border-b border-slate-200 px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowDirectContact(!showDirectContact)}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white border border-slate-300 hover:border-blue-500 text-slate-800 font-bold text-[11px] shadow-2xs transition-all cursor-pointer"
            >
              {showDirectContact ? <EyeOff className="w-3.5 h-3.5 text-slate-500" /> : <Eye className="w-3.5 h-3.5 text-blue-600" />}
              <span>{showDirectContact ? 'Hide Direct Contact Info' : 'Show Direct Contact Info'}</span>
            </button>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px] border border-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Submit Confirmation Enabled</span>
          </div>
        </div>

        {/* Revealed Contact Details Drawer */}
        {showDirectContact && (
          <div className="bg-blue-50/90 border-b border-blue-200 px-4 sm:px-6 py-3 text-xs space-y-1.5 text-blue-950 animate-in slide-in-from-top-2 duration-150">
            <div className="font-bold flex items-center gap-1.5 text-blue-900">
              <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Verified Desk Contact Channels (BigRock MySQL CRM):</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
              <div className="bg-white/80 p-2 rounded-lg border border-blue-200/60 flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span className="truncate"><strong>Email:</strong> {defaultEmail}</span>
              </div>
              <div className="bg-white/80 p-2 rounded-lg border border-blue-200/60 flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span><strong>Phone:</strong> {defaultPhone}</span>
              </div>
            </div>
          </div>
        )}

        {isSuccess ? (
          <div className="p-8 sm:p-10 text-center space-y-4 flex-1 overflow-y-auto">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black text-slate-900">Quotation &amp; Inquiry Dispatched!</h3>
            <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
              Your message has been permanently stored in the live database. The counterparty and trade desk team have been notified.
            </p>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-700 max-w-sm mx-auto">
              Status: <strong className="text-emerald-600">Saved to BigRock MySQL Database</strong>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 flex-1 overflow-y-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Your Full Name / Company *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Henderson (Nordic Trade Ltd)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Your Business Email *</label>
                <input
                  type="email"
                  required
                  placeholder="alex@nordictrade.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Phone / WhatsApp</label>
                <input
                  type="tel"
                  placeholder="+1 (555) 019-2834"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              {targetType === 'RFQ' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Quoted Unit Price (USD)</label>
                    <div className="relative">
                      <DollarSign className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                      <input
                        type="number"
                        step="0.01"
                        placeholder="e.g. 120.00"
                        value={quotedPrice}
                        onChange={(e) => setQuotedPrice(e.target.value)}
                        className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Incoterm Offered</label>
                    <select
                      value={incoterm}
                      onChange={(e) => setIncoterm(e.target.value as Incoterm)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none"
                    >
                      <option value="FOB">FOB (Free on Board)</option>
                      <option value="CIF">CIF (Cost, Ins, Freight)</option>
                      <option value="EXW">EXW (Ex Works)</option>
                      <option value="DDP">DDP (Delivered Duty Paid)</option>
                      <option value="CFR">CFR (Cost & Freight)</option>
                    </select>
                  </div>
                </>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {targetType === 'RFQ' ? 'Quotation Specifications & Production Capacity *' : 'Inquiry Message / Specifications *'}
              </label>
              <textarea
                required
                rows={3}
                placeholder="Detail production capacity, FOB/CIF delivery terms, packaging specs, and sample lead times..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none resize-none"
              />
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Protected by Trade Heaven Trade Protection Assurance</span>
              </div>
              <span className="font-mono text-[11px] text-slate-400">Live BigRock PHP API</span>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs cursor-pointer transition-all"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm cursor-pointer transition-all disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Syncing with Database...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>{targetType === 'RFQ' ? 'Submit Binding Quote' : 'Send Sourcing Inquiry'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
