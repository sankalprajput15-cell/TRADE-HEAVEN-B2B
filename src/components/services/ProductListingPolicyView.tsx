import React, { useState, useMemo } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  FileText,
  Search,
  CheckCircle2,
  XCircle,
  Ban,
  Scale,
  Pill,
  Copyright,
  Gem,
  Coins,
  Cigarette,
  Wine,
  FileX,
  Footprints,
  Landmark,
  Globe,
  Mail,
  MessageCircle,
  ExternalLink,
  Printer,
  Copy,
  Check,
  ArrowRight,
  Sparkles,
  HelpCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { ActiveView } from '../../types';
import { OFFICIAL_WHATSAPP_DATA } from '../common/TradeHeavenSocialBar';

interface Props {
  onNavigate?: (view: ActiveView | string) => void;
  onOpenContactModal?: (config?: any) => void;
}

interface PolicyCategory {
  id: string;
  title: string;
  shortDesc: string;
  icon: React.ElementType;
  colorClass: string;
  badgeBg: string;
  prohibitedItems: string[];
  notes?: string;
}

export const ProductListingPolicyView: React.FC<Props> = ({
  onNavigate,
  onOpenContactModal
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const policyCategories: PolicyCategory[] = [
    {
      id: 'drugs',
      title: 'Illegal Drugs, Precursors & Drug Paraphernalia',
      shortDesc: 'Narcotics, psychoactive substances, controlled chemicals and processing equipment.',
      icon: Pill,
      colorClass: 'text-rose-600',
      badgeBg: 'bg-rose-50 text-rose-700 border-rose-200',
      prohibitedItems: [
        'Any and all listing or sale of narcotics, tranquilizers, psychotropic drugs, natural drugs, synthetic drugs, steroids, and other controlled substances is barred.',
        'The listing or sale of all drug precursor chemicals is strictly not allowed.',
        'Drug paraphernalia, extraction equipment, illicit manufacturing kits, or smoking pipes designed for illegal substances.'
      ],
      notes: 'Violations will result in immediate permanent account termination and referral to law enforcement agencies.'
    },
    {
      id: 'medical',
      title: 'Medical Drugs and Devices',
      shortDesc: 'Prescription pharmaceuticals, unapproved medical devices, and regulated ingestion supplements.',
      icon: ShieldAlert,
      colorClass: 'text-red-600',
      badgeBg: 'bg-red-50 text-red-700 border-red-200',
      prohibitedItems: [
        'The posting of prescription drugs, psychotropic drugs, and narcotics is strictly prohibited.',
        'The listing or sale of orally administered or ingested sexual enhancement foods and supplements is prohibited.',
        'Prescription drugs or devices, controlled substances, unapproved drugs, and unapproved medical devices without verifiable FDA / CE / ISO 13485 clearance.'
      ]
    },
    {
      id: 'ipr',
      title: 'Intellectual Property Rights (IPR) Infringing Products',
      shortDesc: 'Replicas, fake brand logos, counterfeit components, and unauthorized copies.',
      icon: Copyright,
      colorClass: 'text-amber-600',
      badgeBg: 'bg-amber-50 text-amber-800 border-amber-200',
      prohibitedItems: [
        'Replica and Counterfeit Items are strictly not permitted to be posted under any circumstances.',
        'Unauthorized Copies of Intellectual Property (pirated software, cloned industrial blueprints, brand knockoffs) are not allowed to be listed.',
        'OEM branded parts without verified trademark authorization or distributor proof.'
      ]
    },
    {
      id: 'precious_metals',
      title: 'Gold Dust, Bullion & Conflict Minerals',
      shortDesc: 'Raw gold dust, bullion bars, rough diamonds, and non-compliant mined materials.',
      icon: Gem,
      colorClass: 'text-amber-600',
      badgeBg: 'bg-amber-50 text-amber-700 border-amber-200',
      prohibitedItems: [
        'Listings that offer the sale or buying of gold dust, gold bullion, silver, and other raw precious metals (not including finished commercial jewelry) are prohibited.',
        'Rough diamonds and "conflict minerals" (Tantalum, Tin, Tungsten, Gold - 3TG) originating from non-compliant or sanctioned conflict areas may not be listed under Dodd-Frank Act & OECD guidance.'
      ]
    },
    {
      id: 'currency',
      title: 'Counterfeit Currency & Stamps',
      shortDesc: 'Forged banknotes, counterfeit numismatics, fake postage stamps, and replica money.',
      icon: Coins,
      colorClass: 'text-purple-600',
      badgeBg: 'bg-purple-50 text-purple-700 border-purple-200',
      prohibitedItems: [
        'Counterfeit currency, fake banknotes, forged treasury bonds, and novelty replica banknotes resembling legal tender.',
        'Counterfeit stamps, fraudulent tax stamps, fake postage marks, and revenue tokens.'
      ]
    },
    {
      id: 'tobacco',
      title: 'Tobacco Products & Nicotine E-Liquids',
      shortDesc: 'Cigars, cigarettes, loose leaves, hookah tobacco, and nicotine vaping fluids.',
      icon: Cigarette,
      colorClass: 'text-orange-600',
      badgeBg: 'bg-orange-50 text-orange-700 border-orange-200',
      prohibitedItems: [
        'The posting of tobacco products, including but not limited to cigars, cigarettes, cigarette tobacco, pipe tobacco, hookah tobacco, chewing tobacco, and tobacco leaf is strictly prohibited.',
        'The posting of electronic cigarettes and accessories is permitted; however, nicotine and other liquids (e-liquids / vape juices) for use in electronic cigarettes is forbidden.'
      ]
    },
    {
      id: 'alcohol',
      title: 'Alcoholic Beverages',
      shortDesc: 'Distilled spirits, beer, wine, whiskey, vodka, liqueurs, and commercial alcohol.',
      icon: Wine,
      colorClass: 'text-indigo-600',
      badgeBg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      prohibitedItems: [
        'The posting of alcoholic beverages, including but not limited to Beer, Wine, Whisky, Gin, Vodka, and Rum is strictly prohibited on Trade Heaven B2B marketplace.'
      ]
    },
    {
      id: 'fake_docs',
      title: 'Fake Documents & Government Credentials',
      shortDesc: 'Counterfeit degrees, passports, transit licenses, government IDs, and diplomas.',
      icon: FileX,
      colorClass: 'text-rose-600',
      badgeBg: 'bg-rose-50 text-rose-700 border-rose-200',
      prohibitedItems: [
        'Academic degrees, diplomas, transcripts, or test completion certificates.',
        'Government and transit documents, passports, visas, national identity cards, driver’s licenses, and customs clearance stamps.',
        'Forged inspection reports, fake SGS/TÜV certificates, and doctored bank statements.'
      ]
    },
    {
      id: 'wildlife',
      title: 'Wildlife & Related Animal Parts',
      shortDesc: 'CITES-restricted animal pelts, bones, ivory, tusks, organs, and endangered flora.',
      icon: Footprints,
      colorClass: 'text-emerald-700',
      badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      prohibitedItems: [
        'Animal pelts, skins, hides of protected species, internal organs, teeth, claws, shells, bones, tusks, ivory, and shark fins.',
        'Live endangered animals, wildlife specimens, and endangered timber species under CITES Appendices I, II & III.'
      ]
    },
    {
      id: 'financial',
      title: 'Financial Services & Investment Instruments',
      shortDesc: 'Money transfers, unverified bank guarantees, personal loans, and speculative fundraising.',
      icon: Landmark,
      colorClass: 'text-blue-600',
      badgeBg: 'bg-blue-50 text-blue-700 border-blue-200',
      prohibitedItems: [
        'Financial services, including personal money transfers, unauthorized third-party issuing of bank guarantees (BG) and Standby Letters of Credit (SBLC).',
        'Loans, micro-credit financing schemes, cryptocurrency investment schemes, pyramid fundraising, and funding for personal investment purposes.'
      ]
    },
    {
      id: 'others',
      title: 'Other Strictly Prohibited Items',
      shortDesc: 'Weapons, adult content, personal data lists, hacking software, and illegal services.',
      icon: Ban,
      colorClass: 'text-slate-700',
      badgeBg: 'bg-slate-100 text-slate-800 border-slate-300',
      prohibitedItems: [
        'Adult subscription services, erotic/adult chatting services, and pornographic or erotic content (pictures, videos, DVDs, magazines, toys, etc.).',
        'Contracts and tickets (airline tickets, event passes, confidential commercial agreements).',
        'Credit cards, credit repair services, loan applications, and collection agency services.',
        'Firearms, ammunition, high-capacity magazines, stun guns, air guns, silencers, and military tactical weapons.',
        'Human body parts, fluids, organs, and remains.',
        'Job postings, recruiting advertisements, and employment solicitations (Trade Heaven is strictly for product trade).',
        'Lottery tickets, raffles, sweepstakes, and gambling/contest equipment.',
        'Mailing lists, consumer databases, personal identity databases, and private contact lists.',
        'Posts promoting hatred, racism, xenophobia, religious persecution, or images showcasing nudity/violence.',
        'Requests for donations, charitable appeals, or non-commercial crowdfunding.',
        'Sanctioned and prohibited military dual-use items.',
        'Software - Unauthorized, pirated, OEM, or bundled cracked copies of software.',
        'Spyware, Spamware, keyloggers, e-mail advertising harvesters, opt-in spam lists, or mass commercial messaging bypass systems.'
      ]
    },
    {
      id: 'sanctions',
      title: 'Restricted Sanctioned Countries & Jurisdictions',
      shortDesc: 'Compliance with UN, US OFAC, EU, and international embargo lists.',
      icon: Globe,
      colorClass: 'text-slate-900',
      badgeBg: 'bg-slate-900 text-white border-slate-700',
      prohibitedItems: [
        'In addition to the above product listing policy, Trade Heaven does not allow users to sign up, list products, or transact from any country that is on the US OFAC, EU, UN, or other international trade sanctions lists.',
        'Any user profile or company storefront registered from such geographic locations will be automatically suspended or deleted without prior notice to preserve international regulatory compliance.'
      ]
    }
  ];

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return policyCategories;
    const query = searchQuery.toLowerCase();
    return policyCategories.filter(cat => {
      const matchTitle = cat.title.toLowerCase().includes(query);
      const matchDesc = cat.shortDesc.toLowerCase().includes(query);
      const matchItems = cat.prohibitedItems.some(item => item.toLowerCase().includes(query));
      return matchTitle || matchDesc || matchItems;
    });
  }, [searchQuery]);

  const handleCopyPolicy = () => {
    const textToCopy = `TRADE HEAVEN - PRODUCT LISTING POLICY\nhttps://tradeheaven.com/?view=PRODUCT_LISTING_POLICY\n\nThis Product Listing Policy describes the terms of listing your products on TradeHeaven.com. Please read carefully before registering your product(s) on TradeHeaven.com.\n\nYou may not post, sell or buy any item that is restricted or prohibited by a federal, state or local law in any country or jurisdiction on TradeHeaven.com.\n\nTrade Heaven does not permit buying or selling of products that are illegal, infringe upon the intellectual property rights of others, or may easily be used for illegal purposes.\n\nFor questions or to report a violation: help@tradeheaven.net`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div id="product-listing-policy-root" className="max-w-5xl mx-auto space-y-8 pb-16 px-4 sm:px-6">
      
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs text-slate-500 font-medium pt-2">
        <button 
          onClick={() => onNavigate && onNavigate('HOMEPAGE')}
          className="hover:text-blue-600 transition-colors cursor-pointer"
        >
          Trade Heaven
        </button>
        <span>/</span>
        <span className="text-slate-700">Legal &amp; Compliance</span>
        <span>/</span>
        <span className="text-slate-900 font-bold">Product Listing Policy</span>
      </div>

      {/* Hero Header Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white rounded-3xl p-6 sm:p-10 lg:p-12 shadow-2xl border border-slate-800">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-red-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/20 text-red-300 text-xs font-black border border-red-500/30">
              <Ban className="w-3.5 h-3.5 text-red-400" />
              <span>Mandatory Marketplace Rule</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold border border-blue-500/30">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              <span>International Trade Compliance Standard</span>
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
            Product Listing Policy
          </h1>

          <p className="text-xs sm:text-sm lg:text-base text-slate-300 max-w-3xl leading-relaxed font-normal">
            This Product Listing Policy describes the terms of listing your products on <strong>TradeHeaven.com</strong>. Please read carefully before registering your products, posting selling leads, or submitting buying requirements on Trade Heaven.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3 text-xs">
            <button
              onClick={handleCopyPolicy}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer backdrop-blur-xs border border-white/10"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Policy Copied!' : 'Copy Summary'}</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer backdrop-blur-xs border border-white/10"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Policy</span>
            </button>
            <span className="text-slate-400 hidden sm:inline">•</span>
            <span className="text-slate-400 font-mono text-[11px]">
              Last Updated: August 2026
            </span>
          </div>
        </div>
      </div>

      {/* Overview & Key Rules Box */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
            <Scale className="w-5 h-5" />
          </div>
          <h3 className="font-black text-slate-900 text-sm">Legal &amp; Jurisdictional Rule</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            You may not post, sell or buy any item that is restricted or prohibited by a federal, state, national, or local law in any country or jurisdiction on <strong>TradeHeaven.com</strong>.
          </p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <h3 className="font-black text-slate-900 text-sm">Member Responsibility</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            As a member of Trade Heaven, you are responsible for ensuring that the products you have posted are legal, permissible, and fully compliant with trade and customs regulations.
          </p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <h3 className="font-black text-slate-900 text-sm">Enforcement Rights</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Trade Heaven reserves the right to remove non-compliant listings without prior notice and disable the accounts of members who continue to violate this policy.
          </p>
        </div>
      </div>

      {/* Core Policy Statement Card */}
      <div className="bg-amber-500/10 border border-amber-300/60 rounded-3xl p-6 sm:p-8 space-y-4 text-slate-900">
        <div className="flex items-center gap-2.5 text-amber-900 font-black text-sm">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
          <span>Notice of Strict Enforcement &amp; Zero Tolerance</span>
        </div>
        <p className="text-xs sm:text-sm text-slate-800 leading-relaxed">
          Please be aware that <strong>Trade Heaven</strong> does not permit buying or selling of products that are illegal, infringe upon the intellectual property rights of others, or may easily be used for illegal or fraudulent purposes.
        </p>
        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
          Before posting any product, selling lead, and/or buy lead, you need to make sure that your trading items are <strong>NOT</strong> against this Product Listing Policy. <strong>Trade Heaven</strong> reserves the right to remove any products listed by a user that violate this policy without providing any intimation to users. <strong>Trade Heaven</strong> also reserves the right to disable the accounts of any members who continue to violate the Product Posting Policy after having been warned.
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
              <Ban className="w-5 h-5 text-rose-600" />
              Prohibited Products &amp; Categories
            </h2>
            <p className="text-xs text-slate-500">
              The following categories and items are strictly forbidden from being listed on Trade Heaven:
            </p>
          </div>

          <div className="relative min-w-[260px] sm:min-w-[300px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search prohibited items, e.g. tobacco, gold, drugs..."
              className="w-full pl-9.5 pr-4 py-2 text-xs rounded-xl bg-white border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {searchQuery && (
          <div className="text-xs text-slate-500">
            Showing results matching <span className="font-bold text-slate-900">"{searchQuery}"</span> ({filteredCategories.length} categories found)
          </div>
        )}
      </div>

      {/* Prohibited Categories Grid */}
      <div className="space-y-4">
        {filteredCategories.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Search className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-800">No matching prohibited category found</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              If an item is not explicitly listed here, it must still comply with all federal, state, and international trade laws.
            </p>
            <button
              onClick={() => setSearchQuery('')}
              className="px-4 py-1.5 bg-blue-600 text-white font-bold text-xs rounded-xl hover:bg-blue-700 transition-colors"
            >
              Reset Search Filter
            </button>
          </div>
        ) : (
          filteredCategories.map((cat, idx) => {
            const Icon = cat.icon;
            const isExpanded = expandedCategory === cat.id || Boolean(searchQuery);

            return (
              <div
                key={cat.id}
                id={`policy-category-${cat.id}`}
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs transition-all hover:border-slate-300"
              >
                <div 
                  onClick={() => setExpandedCategory(expandedCategory === cat.id ? null : cat.id)}
                  className="p-4 sm:p-5 flex items-start sm:items-center justify-between gap-4 cursor-pointer select-none bg-slate-50/50 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-start sm:items-center gap-3.5">
                    <div className={`w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-xs ${cat.colorClass}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-black text-slate-400 font-mono">
                          #{String(idx + 1).padStart(2, '0')}
                        </span>
                        <h3 className="text-sm sm:text-base font-black text-slate-900">
                          {cat.title}
                        </h3>
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md border ${cat.badgeBg}`}>
                          Prohibited
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {cat.shortDesc}
                      </p>
                    </div>
                  </div>

                  <div className="text-slate-400 hover:text-slate-600 transition-colors shrink-0 pt-1 sm:pt-0">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>

                {isExpanded && (
                  <div className="p-4 sm:p-6 border-t border-slate-100 bg-white space-y-3">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Forbidden Items &amp; Conditions
                    </div>
                    <ul className="space-y-2 text-xs sm:text-sm text-slate-700">
                      {cat.prohibitedItems.map((item, i) => (
                        <li key={i} className="flex items-start gap-2.5">
                          <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                          <span className="leading-relaxed">{item}</span>
                        </li>
                      ))}
                    </ul>

                    {cat.notes && (
                      <div className="mt-3 p-3 bg-red-50 rounded-xl border border-red-200 text-xs text-red-800 font-medium">
                        <strong>Policy Note:</strong> {cat.notes}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Enforcement & Reporting Section */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-9 space-y-6 shadow-xl">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-500/30">
            <Mail className="w-3.5 h-3.5" />
            <span>Marketplace Integrity &amp; Dispute Desk</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white">
            Report a Non-Compliant Product or Listing
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
            If you come across any seller, product, selling offer, or buying request on Trade Heaven that violates this Product Listing Policy, please notify our compliance officers immediately.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
            <div className="text-slate-400 font-bold uppercase text-[10px]">Official Compliance Email</div>
            <div className="font-mono text-sm font-bold text-blue-300">
              help@tradeheaven.net
            </div>
            <p className="text-slate-400 text-[11px]">
              Response within 4–12 business hours by senior compliance officers.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
            <div className="text-slate-400 font-bold uppercase text-[10px]">Official WhatsApp Escalation</div>
            <div className="font-mono text-sm font-bold text-emerald-300">
              {OFFICIAL_WHATSAPP_DATA.phone}
            </div>
            <p className="text-slate-400 text-[11px]">
              Instant ticket creation and rapid escalation line.
            </p>
          </div>
        </div>

        <div className="pt-2 flex flex-wrap gap-3">
          {onOpenContactModal && (
            <button
              onClick={() => onOpenContactModal({ targetType: 'GENERAL', targetTitle: 'Product Listing Policy Inquiry' })}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition-all shadow-md cursor-pointer flex items-center gap-2"
            >
              <Mail className="w-4 h-4" />
              <span>Submit Compliance Ticket</span>
            </button>
          )}

          <a
            href={OFFICIAL_WHATSAPP_DATA.url}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs rounded-xl flex items-center gap-2 transition-all shadow-md"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Chat on WhatsApp</span>
          </a>

          {onNavigate && (
            <button
              onClick={() => onNavigate('REFUND_POLICY')}
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <FileText className="w-4 h-4" />
              <span>View Return &amp; Refund Policy</span>
            </button>
          )}
        </div>
      </div>

    </div>
  );
};
