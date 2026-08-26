import React, { useState } from 'react';
import { Incoterm, Currency } from '../../types';
import { CURRENCY_RATES } from '../../data/mockData';
import { 
  Calculator, 
  Globe2, 
  Truck, 
  Ship, 
  ShieldCheck, 
  Layers, 
  CheckCircle2, 
  Info,
  DollarSign,
  ArrowRight
} from 'lucide-react';

interface Props {
  selectedCurrency: Currency;
}

export const IncotermsCalculator: React.FC<Props> = ({ selectedCurrency }) => {
  const [exwPrice, setExwPrice] = useState<number>(10000);
  const [originTrucking, setOriginTrucking] = useState<number>(650);
  const [exportCustoms, setExportCustoms] = useState<number>(350);
  const [oceanFreight, setOceanFreight] = useState<number>(2400);
  const [marineInsurance, setMarineInsurance] = useState<number>(180);
  const [importDutyRate, setImportDutyRate] = useState<number>(5.5);
  const [destPortHandling, setDestPortHandling] = useState<number>(450);
  const [destFinalDelivery, setDestFinalDelivery] = useState<number>(850);

  const curr = (CURRENCY_RATES || []).find(c => c && c.code === selectedCurrency) || CURRENCY_RATES?.[0] || { code: 'USD', symbol: '$', rateToUSD: 1 };

  // Calculated Incoterms totals
  const fobTotal = exwPrice + originTrucking + exportCustoms;
  const cfrTotal = fobTotal + oceanFreight;
  const cifTotal = cfrTotal + marineInsurance;
  const dutyAmount = (cifTotal * importDutyRate) / 100;
  const ddpTotal = cifTotal + dutyAmount + destPortHandling + destFinalDelivery;

  const formatPrice = (usd: number) => {
    const converted = usd * curr.rateToUSD;
    return `${curr.symbol}${converted.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  };

  return (
    <div id="incoterms-calculator-root" className="space-y-6">
      {/* Top Header */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">
            <Calculator className="w-3.5 h-3.5" />
            <span>ICC Incoterms 2020 &amp; Landed Cost Modeling Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            Incoterms 2020 Landed Cost &amp; Freight Calculator
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl font-normal">
            Model factory Ex-Works (EXW), FOB port dispatch, CIF sea-freight with marine insurance, and final door-to-door DDP landed cost.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Input Controls Left */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-sm">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-200">
            <Layers className="w-4 h-4 text-blue-600" />
            1. Cost Inputs (USD Equivalent)
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Factory Ex-Works (EXW) Product Total
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 font-mono">$</span>
                <input
                  type="number"
                  value={exwPrice}
                  onChange={e => setExwPrice(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-7 pr-3 py-2 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Origin Inland Drayage</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 font-mono">$</span>
                  <input
                    type="number"
                    value={originTrucking}
                    onChange={e => setOriginTrucking(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-7 pr-3 py-2 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-slate-700 font-bold mb-1">Export Customs Clearance</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 font-mono">$</span>
                  <input
                    type="number"
                    value={exportCustoms}
                    onChange={e => setExportCustoms(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-7 pr-3 py-2 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Sea Freight (FCL Container)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 font-mono">$</span>
                  <input
                    type="number"
                    value={oceanFreight}
                    onChange={e => setOceanFreight(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-7 pr-3 py-2 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-slate-700 font-bold mb-1">Marine Cargo Insurance (110%)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 font-mono">$</span>
                  <input
                    type="number"
                    value={marineInsurance}
                    onChange={e => setMarineInsurance(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-7 pr-3 py-2 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-2 border-t border-slate-100">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Import Tariff (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={importDutyRate}
                  onChange={e => setImportDutyRate(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-bold mb-1">Destination Handling (THC)</label>
                <input
                  type="number"
                  value={destPortHandling}
                  onChange={e => setDestPortHandling(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-bold mb-1">Final Delivery to Door</label>
                <input
                  type="number"
                  value={destFinalDelivery}
                  onChange={e => setDestFinalDelivery(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Calculated Term Matrix Right */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                Incoterms 2020 Cost Ladder
              </span>
              <span className="text-[11px] text-slate-400 font-mono">Currency: {curr.code}</span>
            </div>

            <div className="space-y-3">
              {/* EXW */}
              <div className="p-3.5 bg-slate-800/80 rounded-2xl border border-slate-700 flex items-center justify-between">
                <div>
                  <div className="font-bold text-sm text-white">EXW (Ex-Works)</div>
                  <div className="text-[10px] text-slate-400">Buyer assumes all origin transit &amp; customs</div>
                </div>
                <div className="font-mono font-black text-slate-200 text-base">
                  {formatPrice(exwPrice)}
                </div>
              </div>

              {/* FOB */}
              <div className="p-3.5 bg-slate-800/80 rounded-2xl border border-slate-700 flex items-center justify-between">
                <div>
                  <div className="font-bold text-sm text-blue-400">FOB (Free on Board)</div>
                  <div className="text-[10px] text-slate-400">Factory pays inland freight + export clearance</div>
                </div>
                <div className="font-mono font-black text-blue-400 text-base">
                  {formatPrice(fobTotal)}
                </div>
              </div>

              {/* CIF */}
              <div className="p-3.5 bg-slate-800/80 rounded-2xl border border-emerald-500/50 flex items-center justify-between">
                <div>
                  <div className="font-bold text-sm text-emerald-400">CIF (Cost, Insurance &amp; Freight)</div>
                  <div className="text-[10px] text-slate-400">Factory pays ocean vessel + marine cargo insurance</div>
                </div>
                <div className="font-mono font-black text-emerald-400 text-base">
                  {formatPrice(cifTotal)}
                </div>
              </div>

              {/* DDP */}
              <div className="p-4 bg-gradient-to-r from-amber-500/20 to-amber-600/20 rounded-2xl border border-amber-400/40 flex items-center justify-between">
                <div>
                  <div className="font-bold text-sm text-amber-300">DDP (Delivered Duty Paid - Door)</div>
                  <div className="text-[10px] text-slate-300">Full landed cost incl. import tariffs &amp; door delivery</div>
                </div>
                <div className="font-mono font-black text-amber-300 text-lg">
                  {formatPrice(ddpTotal)}
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-blue-50 rounded-2xl border border-blue-200 text-xs text-blue-950 space-y-1">
            <div className="font-bold flex items-center gap-1.5">
              <Info className="w-4 h-4 text-blue-600" />
              Recommendation for International Importers
            </div>
            <p className="text-[11px] leading-relaxed text-blue-800 font-medium">
              Standard commercial practice for container ocean freight is <strong>FOB</strong> or <strong>CIF</strong>. For first-time shipments, Trade Heaven Escrow covers 100% of CIF value until Bill of Lading verification.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
