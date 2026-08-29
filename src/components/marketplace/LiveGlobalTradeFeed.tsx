import React, { useState, useEffect } from 'react';
import { RfqRequirement } from '../../types';

interface TradeLeadItem {
  product: string;
  qty: string;
  location: string;
  leadId?: string;
  timeAgo?: string;
}

const DEFAULT_TRADE_LEADS: TradeLeadItem[] = [
  { product: 'Automotive Diesel EN590 10PPM', qty: '50,000 MT', location: 'Rotterdam, Netherlands', leadId: 'RFQ-GL-89201' },
  { product: '1121 Basmati Rice (Steam/Sella)', qty: '500 MT', location: 'Dubai, UAE', leadId: 'RFQ-GL-89203' },
  { product: 'Aviation Kerosene Jet Fuel A1', qty: '2,000,000 BBL', location: 'Jurong, Singapore', leadId: 'RFQ-GL-89202' },
  { product: 'Urea 46% Fertilizer Prilled', qty: '25,000 MT', location: 'Mundra, India', leadId: 'RFQ-GL-89204' },
  { product: 'Virgin Fuel Oil D6', qty: '100,000,000 Gallons', location: 'Houston, USA', leadId: 'RFQ-GL-89209' },
  { product: 'Copper Ore / Cathodes 99.99%', qty: '3,000 MT', location: 'Shanghai, China', leadId: 'RFQ-GL-89206' },
  { product: 'Light Cycle Oil (LCO)', qty: '40,000 MT', location: 'Busan, South Korea', leadId: 'RFQ-GL-89216' },
  { product: 'Aluminium Wire Scrap 99.7%', qty: '250 MT', location: 'Qingdao, China', leadId: 'RFQ-GL-89205' },
  { product: 'Raw Natural Tossa Jute Fiber', qty: '10 x 40ft Containers', location: 'Mersin, Turkey', leadId: 'RFQ-GL-89207' },
  { product: 'Multi-Crop Combine Harvesters', qty: '25 Units', location: 'Alexandria, Egypt', leadId: 'RFQ-GL-89208' }
];

interface Props {
  onSelectLead?: (lead: TradeLeadItem) => void;
  className?: string;
}

export const LiveGlobalTradeFeed: React.FC<Props> = ({ onSelectLead, className = '' }) => {
  const MIN = 5687;
  const MAX = 23098;
  const getRandom = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

  const [metrics, setMetrics] = useState({
    buyers: 16420,
    rfqs: 21830,
    inquiries: 8590
  });

  const [currentLeadIndex, setCurrentLeadIndex] = useState(0);
  const [opacity, setOpacity] = useState(1);
  const [leadTimeAgo, setLeadTimeAgo] = useState('Just now');

  // Realistic random real-time updates for top metric counters
  useEffect(() => {
    const buyersInterval = setInterval(() => {
      setMetrics(prev => {
        const delta = Math.floor(Math.random() * 31) - 10;
        let nextVal = prev.buyers + delta;
        if (nextVal < MIN) nextVal = MIN + 15;
        if (nextVal > MAX) nextVal = MAX - 15;
        return { ...prev, buyers: nextVal };
      });
    }, 4500);

    const rfqsInterval = setInterval(() => {
      setMetrics(prev => {
        const delta = Math.floor(Math.random() * 31) - 10;
        let nextVal = prev.rfqs + delta;
        if (nextVal < MIN) nextVal = MIN + 15;
        if (nextVal > MAX) nextVal = MAX - 15;
        return { ...prev, rfqs: nextVal };
      });
    }, 6000);

    const inquiriesInterval = setInterval(() => {
      setMetrics(prev => {
        const delta = Math.floor(Math.random() * 31) - 10;
        let nextVal = prev.inquiries + delta;
        if (nextVal < MIN) nextVal = MIN + 15;
        if (nextVal > MAX) nextVal = MAX - 15;
        return { ...prev, inquiries: nextVal };
      });
    }, 3000);

    return () => {
      clearInterval(buyersInterval);
      clearInterval(rfqsInterval);
      clearInterval(inquiriesInterval);
    };
  }, []);

  // Cycle leads with smooth opacity fade
  useEffect(() => {
    const cycleInterval = setInterval(() => {
      setOpacity(0);
      setTimeout(() => {
        setCurrentLeadIndex(prev => (prev + 1) % DEFAULT_TRADE_LEADS.length);
        const mins = Math.floor(Math.random() * 4) + 1;
        setLeadTimeAgo(`${mins}m ago`);
        setOpacity(1);
      }, 300);
    }, 4000);

    return () => clearInterval(cycleInterval);
  }, []);

  const activeLead = DEFAULT_TRADE_LEADS[currentLeadIndex];

  return (
    <div
      id="trade-heaven-live-global-feed"
      className={`mx-auto w-full max-w-[900px] rounded-[10px] p-4 sm:p-5 shadow-2xl transition-all duration-300 ${className}`}
      style={{
        background: '#0b1329',
        color: '#e2e8f0',
        boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      }}
    >
      {/* Top Live Metric Counters */}
      <div
        className="grid grid-cols-3 gap-3 border-b pb-3.5 mb-3.5 text-center"
        style={{ borderColor: '#1e293b' }}
      >
        <div id="metric-live-buyers">
          <span className="block text-[10px] sm:text-[11px] uppercase tracking-wider font-semibold" style={{ color: '#94a3b8' }}>
            Live Buyers Online
          </span>
          <div
            id="stat-buyers"
            className="text-base sm:text-xl font-bold tracking-tight mt-0.5"
            style={{ color: '#38bdf8' }}
          >
            {metrics.buyers.toLocaleString()}
          </div>
        </div>

        <div id="metric-active-rfqs">
          <span className="block text-[10px] sm:text-[11px] uppercase tracking-wider font-semibold" style={{ color: '#94a3b8' }}>
            Active RFQs
          </span>
          <div
            id="stat-rfqs"
            className="text-base sm:text-xl font-bold tracking-tight mt-0.5"
            style={{ color: '#4ade80' }}
          >
            {metrics.rfqs.toLocaleString()}
          </div>
        </div>

        <div id="metric-inquiries-today">
          <span className="block text-[10px] sm:text-[11px] uppercase tracking-wider font-semibold" style={{ color: '#94a3b8' }}>
            Inquiries Today
          </span>
          <div
            id="stat-inquiries"
            className="text-base sm:text-xl font-bold tracking-tight mt-0.5"
            style={{ color: '#fbbf24' }}
          >
            {metrics.inquiries.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Live Trade Lead Feed Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span
            className="inline-block h-2 w-2 rounded-full animate-pulse"
            style={{
              backgroundColor: '#22c55e',
              boxShadow: '0 0 8px rgba(34, 197, 94, 0.8)'
            }}
          />
          <span
            className="text-xs font-semibold uppercase tracking-wider"
            style={{ color: '#cbd5e1' }}
          >
            Live Buying Leads &amp; Inquiries
          </span>
        </div>
        <span className="text-[11px]" style={{ color: '#64748b' }}>
          Real-time Stream
        </span>
      </div>

      {/* Animated Lead Box */}
      <div
        id="lead-container"
        onClick={() => onSelectLead?.(activeLead)}
        className="flex items-center justify-between gap-3 rounded-[6px] px-3.5 py-2.5 min-h-[48px] cursor-pointer transition-all duration-300 hover:brightness-110"
        style={{
          background: '#131f37',
          borderLeft: '3px solid #38bdf8',
          opacity: opacity,
          transition: 'opacity 0.3s ease'
        }}
      >
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-2">
            <span
              id="lead-product"
              className="font-semibold text-sm truncate"
              style={{ color: '#f8fafc' }}
            >
              {activeLead.product}
            </span>
            <span
              id="lead-qty"
              className="text-xs font-medium shrink-0"
              style={{ color: '#94a3b8' }}
            >
              • {activeLead.qty}
            </span>
          </div>
          <div
            id="lead-country"
            className="text-[11px] font-medium mt-0.5 truncate"
            style={{ color: '#38bdf8' }}
          >
            📍 Buyer from {activeLead.location}
          </div>
        </div>

        <span
          id="lead-time"
          className="text-[11px] shrink-0 font-medium"
          style={{ color: '#64748b', whiteSpace: 'nowrap' }}
        >
          {leadTimeAgo}
        </span>
      </div>
    </div>
  );
};
