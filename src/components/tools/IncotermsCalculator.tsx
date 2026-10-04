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
  ArrowRight,
  X,
  HelpCircle,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';

interface Props {
  selectedCurrency: Currency;
}

interface IncotermGuideInfo {
  code: string;
  name: string;
  category: string;
  definition: string;
  riskTransfer: string;
  costTransfer: string;
  sellerObligations: string[];
  buyerObligations: string[];
  diagramSteps: { step: string; responsible: 'Seller' | 'Buyer' }[];
}

const INCOTERMS_GUIDE_DATA: Record<string, IncotermGuideInfo> = {
  EXW: {
    code: 'EXW',
    name: 'Ex-Works (Ex Works)',
    category: 'Any Mode of Transport',
    definition: 'The seller makes the goods available at their premises or another named place. The buyer bears all risks and costs involved in taking the goods from the seller’s premises to the desired destination.',
    riskTransfer: 'Risk transfers from seller to buyer as soon as goods are placed at the buyer’s disposal at the named place (e.g. factory/warehouse).',
    costTransfer: 'Buyer pays for loading, export customs, main freight, import customs, and destination delivery.',
    sellerObligations: ['Provide goods conforming to sales contract', 'Packaging and labeling for transport'],
    buyerObligations: ['Load goods at factory', 'Export & Import customs clearance', 'Main carriage & Insurance', 'All risks from factory door'],
    diagramSteps: [
      { step: 'Factory / Warehouse (Seller premises)', responsible: 'Seller' },
      { step: 'Loading at Factory', responsible: 'Buyer' },
      { step: 'Export Customs', responsible: 'Buyer' },
      { step: 'Main Carriage (Ocean / Air)', responsible: 'Buyer' },
      { step: 'Import Customs & Delivery', responsible: 'Buyer' }
    ]
  },
  FOB: {
    code: 'FOB',
    name: 'Free on Board',
    category: 'Sea & Inland Waterway Transport',
    definition: 'The seller delivers the goods on board the vessel nominated by the buyer at the named port of shipment or procures the goods already so delivered.',
    riskTransfer: 'Risk transfers from seller to buyer when the goods are on board the vessel at the port of shipment.',
    costTransfer: 'Seller pays for export clearance and loading onto the ship. Buyer pays for ocean freight, insurance, and import.',
    sellerObligations: ['Export customs clearance', 'Deliver goods on board vessel at origin port'],
    buyerObligations: ['Nominate vessel & pay ocean freight', 'Marine insurance', 'Import clearance & destination delivery'],
    diagramSteps: [
      { step: 'Factory & Inland Transit to Port', responsible: 'Seller' },
      { step: 'Export Customs & Port Handling', responsible: 'Seller' },
      { step: 'Loading on Vessel (Risk Transfer Point)', responsible: 'Seller' },
      { step: 'Ocean Freight & Insurance', responsible: 'Buyer' },
      { step: 'Import Customs & Final Delivery', responsible: 'Buyer' }
    ]
  },
  CFR: {
    code: 'CFR',
    name: 'Cost and Freight',
    category: 'Sea & Inland Waterway Transport',
    definition: 'The seller delivers the goods on board the vessel or procures the goods already so delivered. The risk of loss of or damage to the goods passes when the goods are on board the vessel.',
    riskTransfer: 'Risk transfers when goods are loaded on board the vessel at origin port (same as FOB), but seller pays freight to destination port.',
    costTransfer: 'Seller pays for export clearance, origin handling, and ocean freight to destination port. Buyer pays for marine insurance and import.',
    sellerObligations: ['Export clearance', 'Deliver goods on board vessel', 'Contract and pay for carriage to destination port'],
    buyerObligations: ['Marine cargo insurance (recommended)', 'Import customs clearance', 'Destination port handling & trucking'],
    diagramSteps: [
      { step: 'Origin Inland & Export Customs', responsible: 'Seller' },
      { step: 'Loading on Vessel (Risk Transfer Point)', responsible: 'Seller' },
      { step: 'Ocean Freight to Destination Port', responsible: 'Seller' },
      { step: 'Marine Cargo Insurance', responsible: 'Buyer' },
      { step: 'Import Customs & Delivery', responsible: 'Buyer' }
    ]
  },
  CIF: {
    code: 'CIF',
    name: 'Cost, Insurance and Freight',
    category: 'Sea & Inland Waterway Transport',
    definition: 'The seller delivers the goods on board the vessel or procures the goods already so delivered. The seller must also contract for and pay the costs and freight necessary to bring the goods to the named port of destination, plus minimum marine insurance.',
    riskTransfer: 'Risk transfers when goods are on board the vessel at origin port (seller bears freight & minimum insurance cost up to destination).',
    costTransfer: 'Seller pays export clearance, ocean freight, and minimum marine insurance. Buyer pays import tariff and destination trucking.',
    sellerObligations: ['Export clearance', 'Ocean freight', 'Marine cargo insurance (Clause C / 110%)'],
    buyerObligations: ['Import customs clearance', 'Destination port handling', 'Final inland transport'],
    diagramSteps: [
      { step: 'Origin Inland & Export Customs', responsible: 'Seller' },
      { step: 'Loading on Vessel (Risk Transfer)', responsible: 'Seller' },
      { step: 'Ocean Freight & Marine Insurance', responsible: 'Seller' },
      { step: 'Import Customs Clearance', responsible: 'Buyer' },
      { step: 'Final Delivery to Warehouse', responsible: 'Buyer' }
    ]
  },
  DDP: {
    code: 'DDP',
    name: 'Delivered Duty Paid',
    category: 'Any Mode of Transport',
    definition: 'The seller delivers the goods when the goods are placed at the disposal of the buyer, cleared for import on the arriving means of transport ready for unloading at the named place of destination.',
    riskTransfer: 'Risk transfers from seller to buyer only when the goods are delivered and ready for unloading at the buyer’s named destination.',
    costTransfer: 'Seller bears all risks and costs including export duties, ocean freight, marine insurance, import customs tariffs, and final delivery to door.',
    sellerObligations: ['100% of transport, freight, insurance', 'Export & Import customs clearance and duty payment', 'Delivery to buyer door'],
    buyerObligations: ['Unloading goods at destination warehouse (unless agreed otherwise)'],
    diagramSteps: [
      { step: 'Origin Factory & Export Clearance', responsible: 'Seller' },
      { step: 'Ocean / Air Main Carriage & Insurance', responsible: 'Seller' },
      { step: 'Import Customs Clearance & Tariff Duty', responsible: 'Seller' },
      { step: 'Destination Terminal Handling & Trucking', responsible: 'Seller' },
      { step: 'Delivery to Buyer Door (Risk Transfer Point)', responsible: 'Seller' }
    ]
  }
};

export const IncotermsCalculator: React.FC<Props> = ({ selectedCurrency }) => {
  const [exwPrice, setExwPrice] = useState<number>(10000);
  const [originTrucking, setOriginTrucking] = useState<number>(650);
  const [exportCustoms, setExportCustoms] = useState<number>(350);
  const [oceanFreight, setOceanFreight] = useState<number>(2400);
  const [marineInsurance, setMarineInsurance] = useState<number>(180);
  const [importDutyRate, setImportDutyRate] = useState<number>(5.5);
  const [destPortHandling, setDestPortHandling] = useState<number>(450);
  const [destFinalDelivery, setDestFinalDelivery] = useState<number>(850);

  const [isQuickGuideOpen, setIsQuickGuideOpen] = useState<boolean>(false);
  const [selectedGuideTerm, setSelectedGuideTerm] = useState<string>('CIF');

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

  const openQuickGuideFor = (termCode: string) => {
    setSelectedGuideTerm(termCode);
    setIsQuickGuideOpen(true);
  };

  const currentGuide = INCOTERMS_GUIDE_DATA[selectedGuideTerm] || INCOTERMS_GUIDE_DATA['CIF'];

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
        <button
          onClick={() => openQuickGuideFor('CIF')}
          className="px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer shrink-0"
        >
          <HelpCircle className="w-4 h-4" />
          <span>Incoterms Quick Guide &amp; Risk Diagram</span>
        </button>
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
              <div className="p-3.5 bg-slate-800/80 rounded-2xl border border-slate-700 flex items-center justify-between group">
                <div>
                  <div className="font-bold text-sm text-white flex items-center gap-2">
                    <span>EXW (Ex-Works)</span>
                    <button 
                      onClick={() => openQuickGuideFor('EXW')}
                      className="text-[10px] text-blue-400 hover:text-blue-300 underline font-normal cursor-pointer"
                    >
                      Guide &amp; Risk
                    </button>
                  </div>
                  <div className="text-[10px] text-slate-400">Buyer assumes all origin transit &amp; customs</div>
                </div>
                <div className="font-mono font-black text-slate-200 text-base">
                  {formatPrice(exwPrice)}
                </div>
              </div>

              {/* FOB */}
              <div className="p-3.5 bg-slate-800/80 rounded-2xl border border-slate-700 flex items-center justify-between group">
                <div>
                  <div className="font-bold text-sm text-blue-400 flex items-center gap-2">
                    <span>FOB (Free on Board)</span>
                    <button 
                      onClick={() => openQuickGuideFor('FOB')}
                      className="text-[10px] text-blue-400 hover:text-blue-300 underline font-normal cursor-pointer"
                    >
                      Guide &amp; Risk
                    </button>
                  </div>
                  <div className="text-[10px] text-slate-400">Factory pays inland freight + export clearance</div>
                </div>
                <div className="font-mono font-black text-blue-400 text-base">
                  {formatPrice(fobTotal)}
                </div>
              </div>

              {/* CIF */}
              <div className="p-3.5 bg-slate-800/80 rounded-2xl border border-emerald-500/50 flex items-center justify-between group">
                <div>
                  <div className="font-bold text-sm text-emerald-400 flex items-center gap-2">
                    <span>CIF (Cost, Insurance &amp; Freight)</span>
                    <button 
                      onClick={() => openQuickGuideFor('CIF')}
                      className="text-[10px] text-blue-400 hover:text-blue-300 underline font-normal cursor-pointer"
                    >
                      Guide &amp; Risk
                    </button>
                  </div>
                  <div className="text-[10px] text-slate-400">Factory pays ocean vessel + marine cargo insurance</div>
                </div>
                <div className="font-mono font-black text-emerald-400 text-base">
                  {formatPrice(cifTotal)}
                </div>
              </div>

              {/* DDP */}
              <div className="p-4 bg-gradient-to-r from-amber-500/20 to-amber-600/20 rounded-2xl border border-amber-400/40 flex items-center justify-between group">
                <div>
                  <div className="font-bold text-sm text-amber-300 flex items-center gap-2">
                    <span>DDP (Delivered Duty Paid - Door)</span>
                    <button 
                      onClick={() => openQuickGuideFor('DDP')}
                      className="text-[10px] text-blue-300 hover:text-white underline font-normal cursor-pointer"
                    >
                      Guide &amp; Risk
                    </button>
                  </div>
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
              Standard commercial practice for container ocean freight is <strong>FOB</strong> or <strong>CIF</strong>. Click any term above or open the <strong>Quick Guide</strong> to review risk transfer points before finalizing contracts.
            </p>
          </div>
        </div>
      </div>

      {/* INCOTERMS QUICK GUIDE MODAL */}
      {isQuickGuideOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white p-6 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-300 font-black">
                  📖
                </div>
                <div>
                  <h2 className="text-lg font-black tracking-tight text-white">Incoterms® 2020 Quick Guide</h2>
                  <p className="text-xs text-slate-300">Brief definitions, risk transfer points &amp; responsibility diagrams</p>
                </div>
              </div>
              <button
                onClick={() => setIsQuickGuideOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Term Selector Tabs */}
            <div className="bg-slate-100 p-2 border-b border-slate-200 flex items-center gap-1.5 overflow-x-auto shrink-0">
              {Object.keys(INCOTERMS_GUIDE_DATA).map(code => {
                const item = INCOTERMS_GUIDE_DATA[code];
                const isActive = selectedGuideTerm === code;
                return (
                  <button
                    key={code}
                    onClick={() => setSelectedGuideTerm(code)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-white hover:bg-slate-200 text-slate-700 border border-slate-200'
                    }`}
                  >
                    {code} - {item.name.split(' ')[0]}
                  </button>
                );
              })}
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700">
              {/* Term Title & Category */}
              <div className="bg-blue-50/70 border border-blue-200/80 rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-600 text-white font-black text-[10px]">
                    {currentGuide.code}
                  </span>
                  <span className="text-[11px] font-bold text-blue-900 bg-white px-2.5 py-0.5 rounded-lg border border-blue-200">
                    {currentGuide.category}
                  </span>
                </div>
                <h3 className="text-base font-black text-slate-900">{currentGuide.name}</h3>
                <p className="text-slate-700 font-medium leading-relaxed">{currentGuide.definition}</p>
              </div>

              {/* Risk & Cost Transfer Highlight */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-1.5">
                  <div className="font-bold text-amber-900 flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Risk Transfer Point</span>
                  </div>
                  <p className="text-[11px] text-amber-800 leading-relaxed font-medium">{currentGuide.riskTransfer}</p>
                </div>

                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 space-y-1.5">
                  <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Cost Responsibility</span>
                  </div>
                  <p className="text-[11px] text-emerald-800 leading-relaxed font-medium">{currentGuide.costTransfer}</p>
                </div>
              </div>

              {/* Risk-Transfer Step-by-Step Diagram */}
              <div className="space-y-3">
                <h4 className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Globe2 className="w-4 h-4 text-blue-600" />
                  <span>Transit &amp; Risk-Transfer Step-by-Step Flow</span>
                </h4>
                <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  {currentGuide.diagramSteps.map((stepItem, idx) => {
                    const isSeller = stepItem.responsible === 'Seller';
                    return (
                      <div key={idx} className="flex items-center justify-between gap-3 p-2.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-[10px] shrink-0 font-mono">
                            {idx + 1}
                          </span>
                          <span className="font-bold text-slate-800 truncate">{stepItem.step}</span>
                        </div>
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider shrink-0 ${
                          isSeller 
                            ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                            : 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                        }`}>
                          {stepItem.responsible}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Obligations Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="font-bold text-slate-900 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                    <span>Seller Key Duties</span>
                  </div>
                  <ul className="space-y-1.5">
                    {currentGuide.sellerObligations.map((obl, i) => (
                      <li key={i} className="text-[11px] text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 flex items-start gap-1.5">
                        <span className="text-blue-600 font-bold">•</span>
                        <span>{obl}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-2">
                  <div className="font-bold text-slate-900 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Buyer Key Duties</span>
                  </div>
                  <ul className="space-y-1.5">
                    {currentGuide.buyerObligations.map((obl, i) => (
                      <li key={i} className="text-[11px] text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 flex items-start gap-1.5">
                        <span className="text-indigo-600 font-bold">•</span>
                        <span>{obl}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 p-4 border-t border-slate-200 flex items-center justify-between">
              <span className="text-[11px] text-slate-500 font-medium">
                Published by International Chamber of Commerce (ICC) Incoterms® 2020.
              </span>
              <button
                onClick={() => setIsQuickGuideOpen(false)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Close Guide
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
