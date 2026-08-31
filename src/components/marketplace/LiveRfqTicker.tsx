import React, { useEffect, useState } from 'react';
import { MOCK_RFQS } from '../../data/mockData';
import { RfqRequirement } from '../../types';
import { Radio, ArrowRight, ShieldCheck, Clock } from 'lucide-react';
import { getFreshRfqDate } from '../../utils/rfqDateUtils';

interface Props {
  rfqs?: RfqRequirement[];
  onSelectRfq: (rfq: RfqRequirement) => void;
}

export const LiveRfqTicker: React.FC<Props> = ({ rfqs = MOCK_RFQS, onSelectRfq }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const displayList = rfqs && rfqs.length > 0 ? rfqs : MOCK_RFQS;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % displayList.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [displayList.length]);

  const activeRfq = displayList[currentIndex % displayList.length] || displayList[0];

  if (!activeRfq) return null;

  return (
    <div id="live-rfq-ticker" className="bg-amber-50/70 border-y border-amber-200/80 py-1.5 px-3 sm:px-4 lg:px-8 text-xs flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
      <div className="flex items-center gap-2 overflow-hidden flex-1 min-w-0">
        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 font-bold border border-rose-200 shrink-0 uppercase tracking-wider text-[9px] sm:text-[10px]">
          <Radio className="w-2.5 h-2.5 sm:w-3 sm:h-3 animate-pulse text-rose-600 shrink-0" />
          <span className="hidden sm:inline">Live Leads</span>
          <span className="sm:hidden">RFQ</span>
        </div>
        <div className="flex items-center gap-1.5 overflow-hidden text-slate-700 min-w-0">
          <span className="font-bold text-slate-900 truncate text-[11px] sm:text-xs">
            {activeRfq.productName}
          </span>
          <span className="text-slate-400 hidden sm:inline">•</span>
          <span className="text-emerald-700 font-mono font-bold text-[11px] sm:text-xs hidden sm:inline shrink-0">
            Qty: {activeRfq.targetQuantity.toLocaleString()} {activeRfq.quantityUnit}
          </span>
          <span className="text-slate-400 hidden md:inline">•</span>
          <span className="text-slate-600 text-xs hidden md:inline shrink-0">
            Dest: <span className="text-slate-800 font-semibold">{activeRfq.destinationPort}</span>
          </span>
          <span className="text-slate-400 hidden lg:inline">•</span>
          <span className="text-amber-800 text-[10px] font-mono font-bold hidden lg:inline bg-amber-100/70 px-1.5 py-0.5 rounded shrink-0">
            {activeRfq.preferredIncoterm}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-[10px] sm:text-[11px] text-slate-500 hidden md:flex items-center gap-1">
          <Clock className="w-3 h-3 text-slate-400 shrink-0" /> Posted {getFreshRfqDate(activeRfq)} by <strong className="text-slate-700 truncate max-w-[120px]">{activeRfq.buyerCompany}</strong> ({activeRfq.buyerCountry})
        </span>
        <button
          onClick={() => onSelectRfq(activeRfq)}
          className="flex items-center gap-1 text-blue-700 hover:text-blue-800 font-bold text-[10px] sm:text-xs transition-colors bg-white px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md border border-amber-300 shadow-2xs shrink-0 cursor-pointer"
        >
          <span>Quote</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
