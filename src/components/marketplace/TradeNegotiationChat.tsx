import React, { useState } from 'react';
import { NegotiationThread, Incoterm, Currency, NegotiationMessage } from '../../types';
import { MOCK_NEGOTIATIONS, CURRENCY_RATES } from '../../data/mockData';
import { OFFICIAL_WHATSAPP_DATA } from '../common/TradeHeavenSocialBar';
import { 
  MessageSquare, 
  Send, 
  ShieldCheck, 
  FileText, 
  Building, 
  Truck, 
  DollarSign, 
  CheckCircle2, 
  Clock, 
  Lock, 
  AlertCircle,
  Package,
  Layers,
  Sparkles,
  ExternalLink,
  MessageCircle
} from 'lucide-react';

interface Props {
  selectedCurrency: Currency;
  onInitiateEscrow: (thread: NegotiationThread) => void;
}

export const TradeNegotiationChat: React.FC<Props> = ({
  selectedCurrency,
  onInitiateEscrow
}) => {
  const [threads, setThreads] = useState<NegotiationThread[]>(MOCK_NEGOTIATIONS);
  const [activeThreadId, setActiveThreadId] = useState<string>(MOCK_NEGOTIATIONS[0]?.id || '');
  const [replyText, setReplyText] = useState('');
  const [counterPriceUsd, setCounterPriceUsd] = useState<number>(0);
  const [isCounterOfferOpen, setIsCounterOfferOpen] = useState(false);

  const activeThread = (threads || []).find(t => t.id === activeThreadId) || (threads && threads[0]) || {
    id: 'th-default',
    rfqId: 'rfq-default',
    rfqTitle: 'Commodity Procurement',
    supplierId: 'supp-default',
    supplierName: 'Verified Supplier',
    supplierCompany: 'Global Trading Partner',
    supplierCountry: 'Global',
    buyerId: 'buyer-default',
    buyerName: 'Procurement Officer',
    buyerCompany: 'Enterprise Buyer',
    status: 'ACTIVE',
    targetPriceUsd: 100,
    incoterm: 'FOB',
    destinationPort: 'Hamburg Port',
    quantity: 100,
    unit: 'Units',
    lastUpdated: new Date().toISOString(),
    messages: []
  } as any;
  const curr = (CURRENCY_RATES || []).find(c => c.code === selectedCurrency) || CURRENCY_RATES?.[0] || { code: 'USD', symbol: '$', rateToUSD: 1 };

  const formatPrice = (usd: number) => {
    const converted = usd * curr.rateToUSD;
    return `${curr.symbol}${converted.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() && !counterPriceUsd) return;

    const newMsg: NegotiationMessage = {
      id: `msg-${Date.now()}`,
      senderRole: 'BUYER',
      senderName: 'Procurement Director',
      senderCompany: activeThread.buyerCompany,
      content: replyText || `Counter-offer proposed at $${counterPriceUsd} USD / Unit (${activeThread.currentIncoterm}).`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      proposedPriceUsd: counterPriceUsd > 0 ? counterPriceUsd : undefined,
      proposedIncoterm: counterPriceUsd > 0 ? activeThread.currentIncoterm : undefined
    };

    const updatedThreads = threads.map(t => {
      if (t.id === activeThread.id) {
        return {
          ...t,
          currentPriceUsd: counterPriceUsd > 0 ? counterPriceUsd : t.currentPriceUsd,
          messages: [...t.messages, newMsg]
        };
      }
      return t;
    });

    setThreads(updatedThreads);
    setReplyText('');
    setCounterPriceUsd(0);
    setIsCounterOfferOpen(false);
  };

  return (
    <div id="negotiation-room-hub" className="space-y-6">
      {/* Top Header */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">
            <Lock className="w-3.5 h-3.5" />
            <span>Encrypted B2B Contract Negotiation &amp; Proforma Room</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            Trade Negotiation Desk &amp; Escrow Dispatch
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl font-normal">
            Direct real-time communication channel with factory sales directors. Finalize FOB/CIF terms, production schedules, and dispatch binding Proforma Invoices into neutral Swiss escrow.
          </p>
        </div>

        {/* WhatsApp Direct */}
        <a
          href={OFFICIAL_WHATSAPP_DATA.url}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-3 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-2xs shrink-0"
        >
          <MessageCircle className="w-4 h-4" />
          <span>Live WhatsApp Mediation</span>
        </a>
      </div>

      {/* Negotiation Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Active Negotiation Rooms */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between px-2">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Negotiation Rooms ({threads.length})
            </span>
            <span className="text-[11px] text-slate-500 font-mono">Live Session</span>
          </div>

          <div className="space-y-2.5">
            {(threads || []).map(thread => {
              const isSelected = thread.id === activeThread?.id;
              const msgs = thread?.messages || [];
              const lastMessage = msgs[msgs.length - 1];

              return (
                <div
                  key={thread.id}
                  onClick={() => setActiveThreadId(thread.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-50/70 border-blue-500 shadow-md ring-2 ring-blue-500/20'
                      : 'bg-white border-slate-200 hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
                          {thread.status}
                        </span>
                        <span className="text-xs font-mono font-bold text-slate-500">{thread.currentIncoterm}</span>
                      </div>
                      <h4 className="font-bold text-sm text-slate-900 truncate mt-1">
                        {thread.productTitle}
                      </h4>
                      <div className="text-xs text-slate-600 flex items-center gap-1">
                        <Building className="w-3 h-3 text-slate-400" />
                        <span className="truncate">{thread.supplierCompany}</span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-xs font-black text-emerald-700 font-mono">
                        {formatPrice(thread.currentPriceUsd)}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {thread.orderQuantity.toLocaleString()} Units
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-200 text-[11px] text-slate-500 truncate italic">
                    "{lastMessage?.content || 'No messages yet'}"
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Active Chat & Commercial Term Sheet */}
        <div className="lg:col-span-8 space-y-4">
          {activeThread && (
            <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm flex flex-col">
              {/* Header Term Sheet */}
              <div className="bg-slate-900 text-white p-5 sm:p-6 border-b border-slate-800">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="text-xs text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      Active Commercial Negotiation • Room #{activeThread.id}
                    </div>
                    <h2 className="text-lg sm:text-xl font-black text-white mt-1">
                      {activeThread.productTitle}
                    </h2>
                    <div className="flex items-center gap-2 text-xs text-slate-300 mt-1">
                      <span>Buyer: <strong>{activeThread.buyerCompany}</strong></span>
                      <span>•</span>
                      <span>Manufacturer: <strong>{activeThread.supplierCompany}</strong></span>
                    </div>
                  </div>

                  <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/15 text-right shrink-0">
                    <div className="text-[10px] text-slate-300 uppercase font-bold">Current Agreed Volume Value</div>
                    <div className="text-lg font-black text-emerald-400 font-mono">
                      {formatPrice(activeThread.currentPriceUsd * activeThread.orderQuantity)}
                    </div>
                    <div className="text-[10px] text-slate-300 font-mono">
                      {formatPrice(activeThread.currentPriceUsd)} / Unit ({activeThread.currentIncoterm})
                    </div>
                  </div>
                </div>
              </div>

              {/* Chat Thread Messages */}
              <div className="p-6 space-y-4 max-h-[420px] overflow-y-auto bg-slate-50">
                {(activeThread?.messages || []).map(msg => {
                  const isBuyer = msg.senderRole === 'BUYER';
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isBuyer ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-center gap-2 text-[10px] text-slate-500 mb-1 px-1">
                        <span className="font-bold text-slate-700">{msg.senderName} ({msg.senderCompany})</span>
                        <span>•</span>
                        <span className="font-mono">{msg.timestamp}</span>
                      </div>

                      <div
                        className={`p-4 rounded-2xl max-w-lg text-xs leading-relaxed shadow-xs ${
                          isBuyer
                            ? 'bg-blue-600 text-white rounded-tr-xs'
                            : 'bg-white text-slate-900 border border-slate-200 rounded-tl-xs'
                        }`}
                      >
                        <p>{msg.content}</p>

                        {msg.proposedPriceUsd && (
                          <div className={`mt-2.5 p-2 rounded-xl border text-[11px] font-mono font-bold flex items-center justify-between ${
                            isBuyer ? 'bg-blue-700 border-blue-500 text-amber-300' : 'bg-emerald-50 border-emerald-300 text-emerald-900'
                          }`}>
                            <span>Formal Price Proposal:</span>
                            <span>{formatPrice(msg.proposedPriceUsd)} / Unit ({msg.proposedIncoterm || activeThread.currentIncoterm})</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Chat Input & Counter Offer Form */}
              <div className="p-4 sm:p-5 bg-white border-t border-slate-200 space-y-3">
                {isCounterOfferOpen && (
                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                    <div className="text-xs font-bold text-slate-800">Propose New Counter-Offer Rate</div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] text-slate-500 font-semibold mb-1">Target Price (USD/Unit)</label>
                        <input
                          type="number"
                          step="0.01"
                          placeholder="e.g. 24.50"
                          value={counterPriceUsd || ''}
                          onChange={e => setCounterPriceUsd(parseFloat(e.target.value) || 0)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <div className="flex items-end">
                        <span className="text-xs text-slate-600 font-medium">
                          Trade Term: <strong>{activeThread.currentIncoterm} ({activeThread.destinationPort})</strong>
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Type legal message, custom packaging instruction, or delivery milestone request..."
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white"
                  />

                  <button
                    type="button"
                    onClick={() => setIsCounterOfferOpen(!isCounterOfferOpen)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                      isCounterOfferOpen ? 'bg-amber-100 border-amber-300 text-amber-900' : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    Counter-Price
                  </button>

                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send</span>
                  </button>
                </form>

                {/* Final Escrow Action Button */}
                <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Locked agreement terms generate a verified Proforma Invoice (P/I).</span>
                  </div>

                  <button
                    onClick={() => onInitiateEscrow(activeThread)}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Lock Terms &amp; Open Escrow Checkout</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
