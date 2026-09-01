import React, { useState, useMemo } from 'react';
import {
  FileText,
  ShieldCheck,
  Building2,
  Lock,
  Search,
  Scale,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  HelpCircle,
  Copy,
  Check,
  Printer,
  ChevronDown,
  ChevronUp,
  Globe,
  DollarSign,
  CreditCard,
  Ban,
  Clock,
  ExternalLink,
  Mail,
  Phone,
  MessageCircle,
  MapPin,
  FileCheck,
  UserCheck,
  Share2,
  ShieldAlert
} from 'lucide-react';
import { ActiveView } from '../../types';
import { OFFICIAL_WHATSAPP_DATA } from '../common/TradeHeavenSocialBar';

interface Props {
  onNavigate?: (view: ActiveView | string) => void;
  onOpenContactModal?: (config?: any) => void;
}

interface TermsSection {
  id: string;
  number: string;
  title: string;
  badge: string;
  icon: React.ElementType;
  summary: string;
  content: React.ReactNode;
}

export const TermsOfUseView: React.FC<Props> = ({
  onNavigate,
  onOpenContactModal
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    'preamble': true,
    'definitions': true,
    'eligibility': true,
    'posting-rules': true,
    'refund-cancellation': true,
    'liability': true
  });

  const toggleSection = (id: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const expandAll = () => {
    const allExpanded: Record<string, boolean> = {};
    sections.forEach(s => {
      allExpanded[s.id] = true;
    });
    setExpandedSections(allExpanded);
  };

  const collapseAll = () => {
    setExpandedSections({});
  };

  const sections: TermsSection[] = [
    {
      id: 'preamble',
      number: '1',
      title: 'Important Notice & Condition of Access',
      badge: 'Mandatory Agreement',
      icon: AlertCircle,
      summary: 'Reading and accepting the Terms of Use and Privacy Policy are required conditions for accessing Trade Heaven.',
      content: (
        <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl space-y-2">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-xs uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>THIS IS IMPORTANT — PLEASE READ CAREFULLY</span>
            </div>
            <p className="text-xs text-amber-900 leading-relaxed font-medium">
              This website requires consideration for and as a condition of allowing you access. Reading and accepting the "Terms of Use" and reading and accepting the provisions of the "Privacy Policy" of this website are required considerations for the website granting you the right to visit, read, register, or interact with it.
            </p>
          </div>
          <p>
            All persons and business entities are denied access to this site unless they read and accept these <strong>Terms of Use</strong> and the <strong>Privacy Policy</strong>.
          </p>
          <p>
            By viewing, visiting, using, or interacting with this website or with any banner, pop-up, or advertising that appears on it, you are agreeing to all the provisions of this Terms of Use agreement and the Privacy Policy of this website.
          </p>
          <p>
            This website reserves the right to deny access to any person, IP address, or viewer for any legitimate reason. Under the terms of the Privacy Policy, which you accept as a condition for viewing, the website is permitted to collect and store technical data and user information for the purposes of security, fraud exclusion, service delivery, and analytics.
          </p>
          <p className="text-xs text-slate-500 italic">
            The Terms of Use agreement may change from time to time. Visitors have an affirmative duty, as part of the consideration for permission to view this website, to keep themselves informed of updates.
          </p>
        </div>
      )
    },
    {
      id: 'definitions',
      number: '2',
      title: 'Key Definitions & Interpretations',
      badge: 'Legal Definitions',
      icon: FileText,
      summary: 'Definitions of Trade Heaven, Tradeheaven ECOM Solution LLP, Content Types, Users, and the "Verified" stamp.',
      content: (
        <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <strong className="text-slate-900 text-xs flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-blue-600" />
                <span>Company / Website</span>
              </strong>
              <p className="text-xs text-slate-600">
                <strong>Tradeheaven ECOM Solution LLP</strong> is the registered legal entity that owns and operates the network of sites, including <strong>Trade Heaven</strong> (TradeHeaven.com). The company, its website, agents, owners, operators, and employees are collectively referred to as "Website", "Trade Heaven", or "Company".
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <strong className="text-slate-900 text-xs flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-blue-600" />
                <span>Website Content</span>
              </strong>
              <p className="text-xs text-slate-600">
                Any information, UI layout, text, graphics, video, hyperlinks, trade tools, buy leads, catalogs, and databases published on the website, whether generated by the platform or submitted by third parties.
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <strong className="text-slate-900 text-xs flex items-center gap-1.5">
                <Share2 className="w-3.5 h-3.5 text-blue-600" />
                <span>Third Party Content</span>
              </strong>
              <p className="text-xs text-slate-600">
                All content submitted by users or third parties, including company names, addresses, tax IDs, product descriptions, photos, pricing, and communication messages.
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <strong className="text-slate-900 text-xs flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                <span>Users &amp; Membership Types</span>
              </strong>
              <p className="text-xs text-slate-600">
                <strong>Visitors:</strong> Persons viewing the site. <strong>Registered Members:</strong> Users with a login profile. <strong>Paid Members:</strong> Members whose premium subscription payment has been accepted.
              </p>
            </div>
          </div>

          <div className="p-4 bg-blue-50/80 border border-blue-200 rounded-2xl space-y-2">
            <div className="flex items-center gap-2 text-blue-900 font-bold text-xs uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4 text-blue-600" />
              <span>Scope of the "Verified" Stamp</span>
            </div>
            <p className="text-xs text-slate-800 leading-relaxed">
              The <strong>"Verified"</strong> badge or stamp visible on Buy Leads, RFQs, or Supplier Profiles signifies that personnel from Trade Heaven have reviewed submitted registration documents (e.g. GSTIN / MCA registration) or spoken directly with the lead owner to confirm genuine commercial buying/selling intent. <strong>It should not be misconstrued as an unconditional financial guarantee or government endorsement towards the counter-party.</strong> Users are advised to perform standard international trade due diligence (e.g., sample testing, escrow, or third-party inspection) before transacting.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'general-platform',
      number: '3',
      title: 'General Platform Role & Independent Relationship',
      badge: 'Platform Role',
      icon: Scale,
      summary: 'Trade Heaven is a neutral B2B matchmaking venue; no agency, partnership, or employment relationship is created.',
      content: (
        <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
          <p>
            This website is an online B2B marketplace and information platform whereby registered buyers, suppliers, and trade intermediaries interact with each other. Trade Heaven has no direct or indirect role or financial custody in the terms, conditions, specifications, delivery schedules, or pricing agreed upon between individual users.
          </p>
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 space-y-1">
            <strong>No Agency or Employment:</strong> This agreement does not create any form of partnership, joint venture, agency, franchiser-franchisee, employer-employee, or buyer-seller relationship between any user and Trade Heaven or Tradeheaven ECOM Solution LLP.
          </div>
          <p className="text-xs text-slate-500">
            Headings in this agreement are provided for ease of reference only and in no way define, limit, or construe the legal scope of each clause.
          </p>
        </div>
      )
    },
    {
      id: 'eligibility',
      number: '4',
      title: 'User Eligibility, Sanctions & Verification Mandates',
      badge: 'Eligibility & Sanctions',
      icon: ShieldCheck,
      summary: 'Legal capacity to contract, international sanctions compliance, and live KYC/video verification requirements.',
      content: (
        <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
          <p>
            Only individuals and corporate representatives who have attained legal majority (18+ years of age or competent under native laws) to enter legally binding contracts are permitted to register and utilize this website.
          </p>
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-blue-600" />
              <span>Right to Demand KYC &amp; Video Verification</span>
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Trade Heaven reserves the absolute right to request any Registered Member (Free or Paid) to provide official KYC (Know Your Customer) documents, including statutory Tax ID / GSTIN, Certificate of Incorporation, or Government Photo ID. Additionally, Trade Heaven may, at its sole discretion, request an account owner to complete a live video call verification (via WhatsApp, Google Meet, or equivalent) to confirm identity before activating or continuing services.
            </p>
          </div>

          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl space-y-2">
            <h4 className="text-xs font-bold text-rose-900 uppercase tracking-wider flex items-center gap-1.5">
              <Ban className="w-4 h-4 text-rose-600" />
              <span>Strict Sanctions &amp; Debarment Compliance</span>
            </h4>
            <p className="text-xs text-rose-950 leading-relaxed">
              You may only access this website if you and the entity you represent are not domiciled in, registered in, or conducting prohibited business with territories subject to comprehensive economic trade embargoes (including North Korea, Cuba, Iran, Syria, and Crimea) or listed on denied parties lists enforced by the United Nations Security Council, US OFAC/BIS, European Union, or UK HM Treasury. By accessing this platform, you certify compliance with all applicable export control and trade sanction laws.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'posting-rules',
      number: '5',
      title: 'Rules for Posting Information & Prohibited Content',
      badge: 'Content Standards',
      icon: Lock,
      summary: 'Public availability of business postings, zero tolerance for fraud, defamation, IP infringements, and prohibited items.',
      content: (
        <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
          <p>
            Any business information submitted by a user for public display (e.g. company profiles, catalogs, trade leads, and RFQ requirements) will be publicly available on the website. By submitting data, users grant Trade Heaven an irrevocable, worldwide, royalty-free license to host, display, and format such listings for commercial matchmaking.
          </p>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
              All Users Agree That Submitted Information Will Not:
            </h4>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-slate-700 pt-1">
              <li className="flex items-start gap-1.5">
                <Ban className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                <span>Violate statutory regulations or international laws.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <Ban className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                <span>Contain fraudulent schemes or deceptive trade offers.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <Ban className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                <span>Infringe patents, trademarks, copyrights, or trade secrets.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <Ban className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                <span>Contain defamatory, libelous, threatening, or harassing copy.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <Ban className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                <span>Promote adult products, obscenities, or harm to minors.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <Ban className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                <span>Introduce computer viruses, trojans, or malicious scripts.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <Ban className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                <span>Solicit competitors or scrape directory emails for mass spam.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <Ban className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                <span>List items prohibited in our Product Listing Policy.</span>
              </li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: 'accessing-info',
      number: '6',
      title: 'Single-User Accounts, Anti-Scraping & Geolocation Integrity',
      badge: 'Account Security',
      icon: UserCheck,
      summary: 'Prohibition of account credential sharing, automated scraping bots, and simultaneous multi-country logins.',
      content: (
        <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
          <p>
            Data on Trade Heaven is provided exclusively for finding interested commercial trade counter-parties. Users have no right to broadcast, systematically copy, scrape, compile, or resell the directory in any commercial database format.
          </p>
          <div className="space-y-3">
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <strong className="text-slate-900 text-xs">Single Use Account Policy:</strong>
              <p className="text-xs text-slate-600">
                All accounts (Free and Paid) are single-user enterprise accounts. Sharing credentials with unauthorized third parties or resellers is strictly prohibited and triggers automatic administrative suspension.
              </p>
            </div>
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <strong className="text-slate-900 text-xs">Geolocation &amp; Account Location Integrity:</strong>
              <p className="text-xs text-slate-600">
                When a business profile is registered from a specific location, it is monitored for consistent enterprise usage. If an account is accessed from disparate geographical locations indicative of unauthorized account resale or proxy hijacking, the account is subject to immediate suspension.
              </p>
            </div>
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <strong className="text-slate-900 text-xs">Automated Extraction Ban:</strong>
              <p className="text-xs text-slate-600">
                Automated data retrieval via spiders, crawlers, scrapers, or bot scripts without explicit written authorization is categorically prohibited and subject to legal prosecution.
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'transactions-risk',
      number: '7',
      title: 'Transactions Between Users & Assumption of Risk',
      badge: 'Commercial Risk',
      icon: DollarSign,
      summary: 'Users assume all commercial risk in international transactions; mandatory due diligence advisory.',
      content: (
        <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
          <p>
            Users acknowledge that cross-border wholesale commerce involves commercial risks, including potential misrepresentation of goods, shipping delays, customs inspections, exchange rate fluctuations, and contract disputes.
          </p>
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-950 space-y-2">
            <div className="font-bold flex items-center gap-1.5 text-amber-900 uppercase">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>User Responsibility &amp; Due Diligence</span>
            </div>
            <p>
              Users assume full commercial responsibility for verifying buyer/supplier credentials, arranging cargo insurance, agreeing upon precise Incoterms 2020 definitions, conducting factory inspections, and utilizing secure escrow payment channels. Trade Heaven assumes no financial liability for contractual defaults between trading parties.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'spam-fraud',
      number: '8',
      title: 'Zero Tolerance Policy: Fraud, Scams & Harassment',
      badge: 'Zero Tolerance',
      icon: ShieldAlert,
      summary: 'Immediate permanent termination for advance fee fraud, phishing, abusive behavior, and dynamic IP blocklists.',
      content: (
        <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
          <p>
            Trade Heaven operates a strict zero-tolerance policy against fraudulent behavior, phishing scams, 419 advance fee schemes, fake sample requests, and abusive conduct in communication channels.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl space-y-1">
              <strong className="text-rose-900 text-xs">Immediate Account Revocation:</strong>
              <p className="text-xs text-rose-800">
                Any member discovered running fraudulent solicitations or scraping user emails will be permanently banned with zero refunds on remaining subscription time.
              </p>
            </div>
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl space-y-1">
              <strong className="text-rose-900 text-xs">Dynamic 403 IP Threat Blocks:</strong>
              <p className="text-xs text-rose-800">
                We employ real-time security partner threat feeds to block high-risk geographical origins associated with systematic B2B fraud and automated spam attacks.
              </p>
            </div>
          </div>
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600">
            <strong>Unsubscribe SLA:</strong> Users may unsubscribe from general trade alerts at any time. Unsubscribe requests are processed within <strong>7 business days</strong>, and all marketing communications cease within <strong>15 business days</strong>.
          </div>
        </div>
      )
    },
    {
      id: 'delivery-policy',
      number: '9',
      title: 'Online Service Delivery Policy',
      badge: 'Service Delivery',
      icon: Clock,
      summary: 'Immediate digital activation and access to premium trade tools upon confirmed payment.',
      content: (
        <div className="space-y-3 text-xs sm:text-sm text-slate-700 leading-relaxed">
          <p>
            Trade Heaven is an online digital information platform. Upon successful payment authorization, all subscription benefits (including RFQ access, supplier directory rankings, catalog uploads, and Key Account Manager assistance) are delivered and initiated digitally over the Internet.
          </p>
          <p>
            No physical shipping of goods is involved for platform membership services. Members gain instant digital access to the features corresponding to their selected tier.
          </p>
        </div>
      )
    },
    {
      id: 'refund-cancellation',
      number: '10',
      title: 'Refund & Cancellation Policy',
      badge: 'Refund Terms',
      icon: CreditCard,
      summary: '60-day satisfaction refund policy for qualifying 6+ month memberships paid via Credit/Debit Card/Online Gateways.',
      content: (
        <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-2">
            <div className="font-bold text-emerald-950 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>60-Day Satisfaction Policy for Annual/Bi-Annual Plans</span>
            </div>
            <p className="text-xs text-emerald-900 leading-relaxed">
              Trade Heaven operates a <strong>60-day satisfaction refund policy</strong> for cases where a Paid Member who has activated a membership of <strong>six (6) months or longer</strong> is not satisfied with the service and submits a formal written refund request within 60 days of plan activation.
            </p>
          </div>

          <div className="space-y-2 text-xs text-slate-700">
            <h4 className="font-bold text-slate-900 uppercase tracking-wider">
              Refund Eligibility Conditions:
            </h4>
            <ul className="space-y-1.5 pl-2">
              <li className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                <span>Applies exclusively to payments made via authorized <strong>Credit Card, Debit Card, or Online Payment Gateways</strong>.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                <span>Does <strong>not</strong> apply to offline bank wire transfers, cheques, or demand drafts.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                <span>Does <strong>not</strong> apply to short-term plans (monthly or quarterly subscriptions lasting under six months).</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                <span>Cancellation requests prior to membership activation are processed within <strong>7 working days</strong>.</span>
              </li>
            </ul>
          </div>
          <p className="text-xs text-slate-500">
            For full details, please refer to our dedicated{' '}
            <button
              onClick={() => onNavigate && onNavigate('REFUND_POLICY')}
              className="text-blue-600 font-bold hover:underline cursor-pointer"
            >
              Return &amp; Refund Policy
            </button>.
          </p>
        </div>
      )
    },
    {
      id: 'client-websites',
      number: '11',
      title: 'Storefront & Subdomain Intellectual Property',
      badge: 'Storefront IP',
      icon: Globe,
      summary: 'Ownership of custom domains by client; platform code and infrastructure remain exclusive property of the Company.',
      content: (
        <div className="space-y-3 text-xs sm:text-sm text-slate-700 leading-relaxed">
          <p>
            When Trade Heaven designs, hosts, or configures a dedicated company showcase or subdomain for a member, the member retains full ownership of their registered brand name and domain.
          </p>
          <p>
            The underlying marketplace code, templates, databases, and microservices remain the exclusive intellectual property of <strong>Tradeheaven ECOM Solution LLP</strong>. Members receive a non-exclusive, revocable license to utilize the storefront while their subscription is active.
          </p>
        </div>
      )
    },
    {
      id: 'liability',
      number: '12',
      title: 'Disclaimer of Warranties & Limitation of Liability',
      badge: 'Liability Cap',
      icon: Scale,
      summary: 'Services provided "AS IS" / "AS AVAILABLE"; total liability capped at maximum USD $10.',
      content: (
        <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
          <div className="p-4 bg-slate-900 text-slate-200 rounded-2xl font-mono text-[11px] leading-relaxed space-y-2">
            <div className="text-amber-400 font-bold uppercase tracking-wider">
              DISCLAIMER OF WARRANTIES ("AS IS" &amp; "AS AVAILABLE")
            </div>
            <p>
              THE FEATURES AND SERVICES ON THIS WEBSITE ARE PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS, AND TRADE HEAVEN EXPRESSLY DISCLAIMS ANY AND ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO ANY WARRANTIES OF CONDITION, QUALITY, DURABILITY, PERFORMANCE, ACCURACY, RELIABILITY, MERCHANTABILITY, OR FITNESS FOR A PARTICULAR PURPOSE.
            </p>
          </div>

          <p>
            Trade Heaven makes no representations or warranties about the validity, correctness, stability, or completeness of third-party trade listings or buyer requirements.
          </p>

          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 space-y-1">
            <strong>Maximum Liability Ceiling:</strong> You expressly agree that no matter what damage or loss may result directly or indirectly from your use of this website, the absolute maximum cumulative liability of Trade Heaven and Tradeheaven ECOM Solution LLP shall not exceed <strong>USD $10 (Ten US Dollars)</strong> or the equivalent amount in Indian Rupees.
          </div>
        </div>
      )
    },
    {
      id: 'earnings-disclaimer',
      number: '13',
      title: 'Disclaimers on Results, Incomes & Success Stories',
      badge: 'No Income Guarantee',
      icon: DollarSign,
      summary: 'Case studies and testimonials illustrate past individual experiences; no guarantee of specific sales volume.',
      content: (
        <div className="space-y-3 text-xs sm:text-sm text-slate-700 leading-relaxed">
          <p>
            Any success stories, export volume case studies, or testimonial figures featured in promotional materials reflect individual achievements under specific market circumstances.
          </p>
          <p>
            International trade outcomes depend upon numerous dynamic variables, including product pricing, cargo quality, export tariffs, customer responsiveness, and market demand. <strong>Nothing on Trade Heaven should be construed as a "get-rich-quick" scheme or a guarantee of specific commercial revenue.</strong>
          </p>
        </div>
      )
    },
    {
      id: 'indemnity',
      number: '14',
      title: 'User Indemnification Obligations',
      badge: 'Indemnity',
      icon: ShieldCheck,
      summary: 'Users agree to indemnify Trade Heaven against damages, claims, or regulatory penalties arising from user violations.',
      content: (
        <div className="space-y-3 text-xs sm:text-sm text-slate-700 leading-relaxed">
          <p>
            As a condition of using this website, you agree to indemnify, defend, and hold harmless <strong>Tradeheaven ECOM Solution LLP</strong>, its partners, officers, employees, and agents from and against any and all claims, damages, liabilities, losses, costs, or legal expenses (including reasonable attorney fees) arising from your violation of this Agreement, infringement of third-party intellectual property, or improper conduct during trade negotiations.
          </p>
        </div>
      )
    },
    {
      id: 'ip-rights',
      number: '15',
      title: 'Intellectual Property Ownership',
      badge: 'Copyright',
      icon: Lock,
      summary: 'All software, branding, and designs are copyrighted by Tradeheaven ECOM Solution LLP.',
      content: (
        <div className="space-y-3 text-xs sm:text-sm text-slate-700 leading-relaxed">
          <p>
            <strong>Tradeheaven ECOM Solution LLP</strong> is the sole owner and lawful licensee of all intellectual property, trademarks, trade dress, and software code embodied within the Trade Heaven marketplace. All rights not expressly granted herein are reserved.
          </p>
          <p className="text-xs text-slate-500">
            © 2025–2026 Tradeheaven ECOM Solution LLP. All rights reserved.
          </p>
        </div>
      )
    },
    {
      id: 'governing-law',
      number: '16',
      title: 'Governing Law & Legal Jurisdiction',
      badge: 'Jurisdiction',
      icon: Scale,
      summary: 'Subject exclusively to the laws of India and the jurisdiction of competent courts in Uttar Pradesh / New Delhi.',
      content: (
        <div className="space-y-3 text-xs sm:text-sm text-slate-700 leading-relaxed">
          <p>
            This Agreement shall be governed by and construed in accordance with the laws of <strong>India</strong>.
          </p>
          <p>
            If any dispute, controversy, or claim concerning this Agreement is brought before a court of law, the user and Trade Heaven agree that the sole and exclusive legal jurisdiction shall lie with the competent courts of <strong>Uttar Pradesh / New Delhi, India</strong>.
          </p>
        </div>
      )
    },
    {
      id: 'contact-corporate',
      number: '17',
      title: 'Official Corporate Notices & Inquiries',
      badge: 'Contact & Notices',
      icon: MapPin,
      summary: 'Registered office details and direct customer compliance escalation lines.',
      content: (
        <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
          <p>
            For any legal notices, compliance queries, or terms inquiries, please contact our corporate desk:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-slate-900 font-black text-xs uppercase tracking-wider">
                <Building2 className="w-4 h-4 text-blue-600" />
                <span>Registered Legal Entity</span>
              </div>
              <div className="font-bold text-slate-900 text-sm">
                Tradeheaven ECOM Solution LLP
              </div>
              <div className="text-xs text-slate-600 space-y-1">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <span>
                    B-18424, Gauri Ganj, Auraiya Road, In Front Of Anshik Motor, Dibiyapur, Auraiya, Uttar Pradesh - 206244, India.
                  </span>
                </div>
                <div className="pt-1 text-[11px] text-slate-500">
                  Govt. Registered LLP (MCA) • GST Compliant Entity
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-slate-900 font-black text-xs uppercase tracking-wider">
                <Mail className="w-4 h-4 text-blue-600" />
                <span>Compliance &amp; Support Channels</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-slate-500">Help Desk:</span>
                  <a href="mailto:help@tradeheaven.net" className="font-mono font-bold text-blue-600 hover:underline">
                    help@tradeheaven.net
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500">Corporate Inquiries:</span>
                  <a href="mailto:support@tradeheaven.net" className="font-mono font-bold text-blue-600 hover:underline">
                    support@tradeheaven.net
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500">Official WhatsApp:</span>
                  <a 
                    href={OFFICIAL_WHATSAPP_DATA.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="font-mono font-bold text-emerald-600 hover:underline inline-flex items-center gap-1"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>{OFFICIAL_WHATSAPP_DATA.phone}</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }
  ];

  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return sections;
    const q = searchQuery.toLowerCase();
    return sections.filter(sec => {
      const matchTitle = sec.title.toLowerCase().includes(q);
      const matchBadge = sec.badge.toLowerCase().includes(q);
      const matchSummary = sec.summary.toLowerCase().includes(q);
      return matchTitle || matchBadge || matchSummary;
    });
  }, [searchQuery, sections]);

  const handleCopyTerms = () => {
    const textToCopy = `TRADE HEAVEN - TERMS OF USE AGREEMENT\nLegal Entity: Tradeheaven ECOM Solution LLP\nRegistered Office: B-18424, Gauri Ganj, Auraiya Road, In Front Of Anshik Motor, Dibiyapur, Auraiya, Uttar Pradesh - 206244, India\nWebsite: https://tradeheaven.com/?view=TERMS_OF_USE\nContact: help@tradeheaven.net | Phone/WhatsApp: ${OFFICIAL_WHATSAPP_DATA.phone}\n\nImportant Summary:\n- Access to Trade Heaven is subject to accepting these Terms of Use and the Privacy Policy.\n- Trade Heaven is a neutral B2B information and matchmaking platform; users conduct their own due diligence.\n- Zero tolerance for fraud, spam, advance-fee scams, and prohibited items.\n- 60-day satisfaction refund policy applies to qualifying 6+ month plans paid via Online Gateways/Cards.\n- Legal jurisdiction: Uttar Pradesh / New Delhi, India.`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div id="terms-of-use-view-root" className="max-w-5xl mx-auto space-y-8 pb-16 px-4 sm:px-6">
      
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
        <span className="text-slate-900 font-bold">Terms of Use</span>
      </div>

      {/* Hero Header Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-10 lg:p-12 shadow-2xl border border-slate-800">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-500/30">
              <Building2 className="w-3.5 h-3.5 text-blue-400" />
              <span>Tradeheaven ECOM Solution LLP</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Govt. Registered LLP (MCA) • GST Compliant</span>
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
            Terms of Use Agreement
          </h1>

          <p className="text-xs sm:text-sm lg:text-base text-slate-300 max-w-3xl leading-relaxed font-normal">
            Please read these Terms of Use carefully. By visiting, browsing, registering, or transacting on <strong>Trade Heaven</strong> (operated by <strong>Tradeheaven ECOM Solution LLP</strong>), you agree to be bound by all provisions set forth herein.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3 text-xs">
            <button
              onClick={handleCopyTerms}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer backdrop-blur-xs border border-white/10"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-300" />}
              <span>{copied ? 'Summary Copied!' : 'Copy Summary'}</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer backdrop-blur-xs border border-white/10"
            >
              <Printer className="w-3.5 h-3.5 text-slate-300" />
              <span>Print Agreement</span>
            </button>
            <span className="text-slate-400 hidden sm:inline">•</span>
            <span className="text-slate-400 font-mono text-[11px]">
              Effective Date: August 2026
            </span>
          </div>
        </div>
      </div>

      {/* Summary Highlight Pillars */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1.5">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Scale className="w-4 h-4" />
          </div>
          <h3 className="font-black text-slate-900 text-xs sm:text-sm">Neutral Marketplace</h3>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Trade Heaven connects global businesses; counterparties conduct their own due diligence.
          </p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CreditCard className="w-4 h-4" />
          </div>
          <h3 className="font-black text-slate-900 text-xs sm:text-sm">60-Day Refund Policy</h3>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Available on 6+ month memberships paid via card or authorized online payment gateways.
          </p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1.5">
          <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
            <Ban className="w-4 h-4" />
          </div>
          <h3 className="font-black text-slate-900 text-xs sm:text-sm">Zero Fraud Tolerance</h3>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Immediate ban and dynamic IP blocks for spamming, advance fee scams, or prohibited listings.
          </p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1.5">
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <UserCheck className="w-4 h-4" />
          </div>
          <h3 className="font-black text-slate-900 text-xs sm:text-sm">Single User Accounts</h3>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Strict ban on credential reselling, scraper bots, and unauthorized multi-location proxy logins.
          </p>
        </div>
      </div>

      {/* Search & Section Controls */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Terms of Use Articles &amp; Clauses
            </h2>
            <p className="text-xs text-slate-500">
              Browse or search specific contractual articles governing usage of the Trade Heaven portal.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative min-w-[240px] sm:min-w-[280px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search terms (e.g. refund, liability, verified, spam)..."
                className="w-full pl-9.5 pr-4 py-2 text-xs rounded-xl bg-white border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-xs"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>

            <button
              onClick={expandAll}
              className="px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shrink-0 cursor-pointer"
            >
              Expand All
            </button>
            <button
              onClick={collapseAll}
              className="px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shrink-0 cursor-pointer"
            >
              Collapse
            </button>
          </div>
        </div>

        {searchQuery && (
          <div className="text-xs text-slate-500">
            Showing clauses matching <span className="font-bold text-slate-900">"{searchQuery}"</span> ({filteredSections.length} articles found)
          </div>
        )}
      </div>

      {/* Accordion List */}
      <div className="space-y-4">
        {filteredSections.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Search className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-800">No matching terms article found</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Try searching with different keywords like "refund", "verified", "liability", "spam", or "sanctions".
            </p>
            <button
              onClick={() => setSearchQuery('')}
              className="px-4 py-1.5 bg-blue-600 text-white font-bold text-xs rounded-xl hover:bg-blue-700 transition-colors cursor-pointer"
            >
              Reset Search Filter
            </button>
          </div>
        ) : (
          filteredSections.map((sec) => {
            const Icon = sec.icon;
            const isExpanded = expandedSections[sec.id] || Boolean(searchQuery);

            return (
              <div
                key={sec.id}
                id={`terms-section-${sec.id}`}
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs transition-all hover:border-slate-300"
              >
                <div
                  onClick={() => toggleSection(sec.id)}
                  className="p-4 sm:p-5 flex items-start sm:items-center justify-between gap-4 cursor-pointer select-none bg-slate-50/60 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-start sm:items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-xs text-blue-600">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm sm:text-base font-black text-slate-900">
                          {sec.number}. {sec.title}
                        </h3>
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                          {sec.badge}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {sec.summary}
                      </p>
                    </div>
                  </div>

                  <div className="text-slate-400 hover:text-slate-600 transition-colors shrink-0 pt-1 sm:pt-0">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>

                {isExpanded && (
                  <div className="p-5 sm:p-6 border-t border-slate-100 bg-white">
                    {sec.content}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Cross-Link Policy Banners */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
        <div 
          onClick={() => onNavigate && onNavigate('PRIVACY_POLICY')}
          className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer space-y-2 group"
        >
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold group-hover:bg-blue-600 group-hover:text-white transition-colors">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <h4 className="font-bold text-slate-900 text-xs sm:text-sm">Privacy Policy</h4>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Review how Tradeheaven ECOM Solution LLP safeguards your business data and handles deletion requests.
          </p>
        </div>

        <div 
          onClick={() => onNavigate && onNavigate('PRODUCT_LISTING_POLICY')}
          className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer space-y-2 group"
        >
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold group-hover:bg-amber-600 group-hover:text-white transition-colors">
            <FileCheck className="w-4 h-4" />
          </div>
          <h4 className="font-bold text-slate-900 text-xs sm:text-sm">Product Listing Policy</h4>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Understand prohibited trade items, medical device clearances, IPR rules, and sanctions guidelines.
          </p>
        </div>

        <div 
          onClick={() => onNavigate && onNavigate('REFUND_POLICY')}
          className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer space-y-2 group"
        >
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold group-hover:bg-emerald-600 group-hover:text-white transition-colors">
            <CreditCard className="w-4 h-4" />
          </div>
          <h4 className="font-bold text-slate-900 text-xs sm:text-sm">Return &amp; Refund Policy</h4>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Learn about our 60-day satisfaction guarantee terms, payment methods, and cancellation procedures.
          </p>
        </div>
      </div>

      {/* Corporate Compliance Desk Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-9 space-y-6 shadow-xl">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-500/30">
            <Building2 className="w-3.5 h-3.5" />
            <span>Corporate Compliance Desk</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white">
            Need Legal Clarification or Account Assistance?
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
            Our compliance and customer success team at <strong>Tradeheaven ECOM Solution LLP</strong> is ready to assist you with contract inquiries, member verification, or dispute assistance.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
            <div className="text-slate-400 font-bold uppercase text-[10px]">Official Help Desk Email</div>
            <div className="font-mono text-sm font-bold text-blue-300">
              help@tradeheaven.net
            </div>
            <p className="text-slate-400 text-[11px]">
              Direct support for compliance, member onboarding, and account escalations.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
            <div className="text-slate-400 font-bold uppercase text-[10px]">Official WhatsApp Escalation</div>
            <div className="font-mono text-sm font-bold text-emerald-300">
              {OFFICIAL_WHATSAPP_DATA.phone}
            </div>
            <p className="text-slate-400 text-[11px]">
              Live chat support with customer success representatives.
            </p>
          </div>
        </div>

        <div className="pt-2 flex flex-wrap gap-3">
          {onOpenContactModal && (
            <button
              onClick={() => onOpenContactModal({ targetType: 'GENERAL', targetTitle: 'Terms of Use & Legal Inquiry' })}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition-all shadow-md cursor-pointer flex items-center gap-2"
            >
              <Mail className="w-4 h-4" />
              <span>Contact Compliance Desk</span>
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
              onClick={() => onNavigate('HOMEPAGE')}
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Globe className="w-4 h-4" />
              <span>Explore Marketplace</span>
            </button>
          )}
        </div>
      </div>

    </div>
  );
};
