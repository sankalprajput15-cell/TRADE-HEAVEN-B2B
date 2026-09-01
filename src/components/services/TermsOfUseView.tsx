import React, { useState, useMemo, useEffect, useRef } from 'react';
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
  ShieldAlert,
  ListOrdered,
  BookOpen,
  Bookmark,
  ArrowUp,
  Link as LinkIcon,
  Eye,
  SlidersHorizontal,
  Compass
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
  category: string;
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
  const [copiedAnchorId, setCopiedAnchorId] = useState<string | null>(null);
  const [fontSizeMode, setFontSizeMode] = useState<'standard' | 'large' | 'compact'>('standard');
  const [readingProgress, setReadingProgress] = useState(0);
  const [activeSectionId, setActiveSectionId] = useState<string>('preamble');
  const [showMobileToc, setShowMobileToc] = useState(false);
  const [highlightedSectionId, setHighlightedSectionId] = useState<string | null>(null);

  // Accordion expanded state - all open by default for optimal readability & indexing
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    'preamble': true,
    'definitions': true,
    'general-platform': true,
    'eligibility': true,
    'posting-rules': true,
    'accessing-info': true,
    'transactions-risk': true,
    'spam-fraud': true,
    'delivery-policy': true,
    'refund-cancellation': true,
    'client-websites': true,
    'liability': true,
    'earnings-disclaimer': true,
    'indemnity': true,
    'ip-rights': true,
    'governing-law': true,
    'contact-corporate': true
  });

  const sections: TermsSection[] = [
    {
      id: 'preamble',
      number: '1',
      title: 'Important Notice & Condition of Access',
      category: 'Preamble & Scope',
      badge: 'Mandatory Agreement',
      icon: AlertCircle,
      summary: 'Reading and accepting the Terms of Use and Privacy Policy are required considerations for accessing Trade Heaven.',
      content: (
        <div className="space-y-4 text-slate-700 leading-relaxed">
          <div className="not-prose p-4.5 bg-amber-50/90 border border-amber-200/90 rounded-2xl space-y-2.5 shadow-2xs">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-xs uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>THIS IS IMPORTANT — PLEASE READ CAREFULLY</span>
            </div>
            <p className="text-xs sm:text-sm text-amber-950 leading-relaxed font-medium">
              This website requires consideration for and as a condition of allowing you access. Reading and accepting the "Terms of Use" and reading and accepting the provisions of the "Privacy Policy" of this website are required considerations for the website granting you the right to visit, read, register, or interact with it.
            </p>
          </div>
          <p>
            All persons and business entities are denied access to this site unless they read and accept these <strong>Terms of Use</strong> and the <strong>Privacy Policy</strong>.
          </p>
          <p>
            By viewing, visiting, using, or interacting with this website or with any banner, pop-up, or advertising that appears on it, you are agreeing to all the provisions of this Terms of Use policy and the Privacy Policy of this website.
          </p>
          <p>
            This website reserves the right to deny access to any person, IP address, or viewer for any legitimate reason. Under the terms of the Privacy Policy, which you accept as a condition for viewing, the website is permitted to collect and store technical data and user information for the purposes of security, fraud exclusion, service delivery, and analytics.
          </p>
          <p className="text-slate-500 italic text-xs">
            The Terms of Use agreement may change from time to time. Visitors have an affirmative duty, as part of the consideration for permission to view this website, to keep themselves informed of updates.
          </p>
        </div>
      )
    },
    {
      id: 'definitions',
      number: '2',
      title: 'Key Definitions & Interpretations',
      category: 'Preamble & Scope',
      badge: 'Legal Definitions',
      icon: FileText,
      summary: 'Definitions of Trade Heaven, Tradeheaven ECOM Solution LLP, Website Content, Users, and the "Verified" stamp.',
      content: (
        <div className="space-y-4 text-slate-700 leading-relaxed">
          <p>
            Throughout this Agreement, specific terms carry defined legal and operational meanings:
          </p>
          <div className="not-prose grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
            <div className="p-4 bg-slate-50/80 border border-slate-200/90 rounded-2xl space-y-1.5 shadow-2xs">
              <strong className="text-slate-900 text-xs font-bold flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-blue-600" />
                <span>Company / Website</span>
              </strong>
              <p className="text-xs text-slate-600 leading-relaxed">
                <strong>Tradeheaven ECOM Solution LLP</strong> is the registered legal entity that owns and operates the network of sites, which includes <strong>Trade Heaven</strong> (TradeHeaven.com). This website, its agents, owners, operators, and employees are referred to collectively herein as "Website", "Trade Heaven", or "Company".
              </p>
            </div>

            <div className="p-4 bg-slate-50/80 border border-slate-200/90 rounded-2xl space-y-1.5 shadow-2xs">
              <strong className="text-slate-900 text-xs font-bold flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-blue-600" />
                <span>Website Content</span>
              </strong>
              <p className="text-xs text-slate-600 leading-relaxed">
                Any information and/or data published at the website, including its design, UI layout, text, graphics, videos, web pages, hyperlinks, trade leads, buy leads, trade offers, and advertisements.
              </p>
            </div>

            <div className="p-4 bg-slate-50/80 border border-slate-200/90 rounded-2xl space-y-1.5 shadow-2xs">
              <strong className="text-slate-900 text-xs font-bold flex items-center gap-1.5">
                <Share2 className="w-3.5 h-3.5 text-blue-600" />
                <span>Third Party Content</span>
              </strong>
              <p className="text-xs text-slate-600 leading-relaxed">
                All content provided or submitted by users or third parties, including company names, addresses, contact details, company profile descriptions, catalogs, inquiries, and paid write-ups.
              </p>
            </div>

            <div className="p-4 bg-slate-50/80 border border-slate-200/90 rounded-2xl space-y-1.5 shadow-2xs">
              <strong className="text-slate-900 text-xs font-bold flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                <span>Users &amp; Membership Types</span>
              </strong>
              <p className="text-xs text-slate-600 leading-relaxed">
                <strong>Visitors:</strong> Persons viewing the site. <strong>Registered Members:</strong> Users with a voluntary profile login. <strong>Paid Members:</strong> Registered members whose payment is verified and accepted.
              </p>
            </div>
          </div>

          <div className="not-prose p-4.5 bg-blue-50/80 border border-blue-200 rounded-2xl space-y-2">
            <div className="flex items-center gap-2 text-blue-900 font-bold text-xs uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Scope &amp; Clarification of the "Verified" Stamp</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-800 leading-relaxed">
              The <strong>"Verified"</strong> stamp visible on Buy Leads or RFQs signifies that personnel from this Website have called the Lead owner and spoken to him/her to confirm commercial buying intent or reviewed statutory registry filings. <strong>It should not be misconstrued as an unconditional financial guarantee or certificate of authenticity towards the Lead Poster.</strong> Users are strongly advised to conduct standard international trade due diligence before transacting business.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'general-platform',
      number: '3',
      title: 'General Platform Role & Independent Relationship',
      category: 'Preamble & Scope',
      badge: 'Platform Role',
      icon: Scale,
      summary: 'Trade Heaven is a neutral B2B platform; no agency, partnership, or employment relationship is created.',
      content: (
        <div className="space-y-4 text-slate-700 leading-relaxed">
          <p>
            This website is an online web-based B2B platform whereby registered buyers, suppliers, and trade intermediaries interact with each other at or through the website. The Website has no direct or indirect role to play between different users or the terms and conditions of any negotiation, sales, purchase, or dealings.
          </p>
          <div className="not-prose p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-700 space-y-1">
            <strong className="text-slate-900 font-bold">No Agency or Partnership:</strong> This agreement does not create any form of partnership, joint venture, agency, franchiser-franchisee, employer-employee, and/or buyer-seller relationship between any user and the website or Tradeheaven ECOM Solution LLP.
          </div>
          <p className="text-slate-500 text-xs">
            The headings given in this agreement are for the purpose of reference only and in no way define, limit, construe, or describe the scope or extent of such section.
          </p>
        </div>
      )
    },
    {
      id: 'eligibility',
      number: '4',
      title: 'User Eligibility, Sanctions & Verification Mandates',
      category: 'Eligibility & Standards',
      badge: 'Eligibility & Sanctions',
      icon: ShieldCheck,
      summary: 'Legal capacity to contract, international sanctions compliance, and live KYC/video verification requirements.',
      content: (
        <div className="space-y-4 text-slate-700 leading-relaxed">
          <p>
            Only those Users who have attained the age of entering into a legal contract with others are allowed to visit and use this website. By using this website, it is assumed that a user is competent to form legally binding contracts under applicable laws of their native country.
          </p>
          <div className="not-prose p-4.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 shadow-2xs">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-blue-600" />
              <span>Right to Demand KYC &amp; Video Verification</span>
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              The website reserves its right to ask any Registered Member — both Free Members as well as Paid Members — to duly provide KYC (Know Your Customer) documentation to establish the authenticity and legal existence of the business entity a member represents. Additionally, the website may at its sole discretion demand to see suitable Identity Proof documents and ask a Free or Paid Member to complete live video call verification (on WhatsApp, Google Meet, or equivalent) of the account owner at any time with or without prior notice.
            </p>
          </div>

          <div className="not-prose p-4.5 bg-rose-50/90 border border-rose-200 rounded-2xl space-y-2">
            <h4 className="text-xs font-bold text-rose-900 uppercase tracking-wider flex items-center gap-1.5">
              <Ban className="w-4 h-4 text-rose-600" />
              <span>Strict International Sanctions &amp; Trade Embargoes</span>
            </h4>
            <p className="text-xs sm:text-sm text-rose-950 leading-relaxed">
              You can only use this website if and only if you or the business entity you represent is not domiciled or registered in or does business with any company belonging to any country or territory (including North Korea, Cuba, Iran, Syria, and Crimea) that is the subject or target of any U.S. or other national government financial and economic sanctions or trade embargoes (including US OFAC, BIS, United Nations Security Council, European Union, or UK HM Treasury).
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'posting-rules',
      number: '5',
      title: 'Rules for Posting Information & Prohibited Submissions',
      category: 'Eligibility & Standards',
      badge: 'Content Rules',
      icon: Lock,
      summary: 'Public availability of business postings, zero tolerance for fraud, defamation, IP infringements, and prohibited items.',
      content: (
        <div className="space-y-4 text-slate-700 leading-relaxed">
          <p>
            Users agree, as a condition of viewing, that any information relating thereto will be publicly available at the website for viewing by anyone who visits or uses Website. Any information submitted by User shall become the exclusive property of the Website and may be used, without further permission, for commercial use without additional consideration of any kind.
          </p>

          <div className="not-prose p-4.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 shadow-2xs">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
              All Users Warrant and Agree That Submitted Information Will NOT:
            </h4>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs text-slate-700 pt-1">
              <li className="flex items-start gap-2">
                <Ban className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                <span>Violate any applicable law, statute, or regulation.</span>
              </li>
              <li className="flex items-start gap-2">
                <Ban className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                <span>Contain fraudulent information or make fraudulent offers.</span>
              </li>
              <li className="flex items-start gap-2">
                <Ban className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                <span>Be defamatory, libelous, unlawfully threatening or harassing.</span>
              </li>
              <li className="flex items-start gap-2">
                <Ban className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                <span>Be obscene or contain pornography or sex-related merchandising.</span>
              </li>
              <li className="flex items-start gap-2">
                <Ban className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                <span>Promote discrimination based on race, sex, religion, age, or nationality.</span>
              </li>
              <li className="flex items-start gap-2">
                <Ban className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                <span>Contain computer viruses, trojans, or destructive script codes.</span>
              </li>
              <li className="flex items-start gap-2">
                <Ban className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                <span>Solicit business in connection with commercial activity competing with this site.</span>
              </li>
              <li className="flex items-start gap-2">
                <Ban className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                <span>Post un-related inquiries, spam trade leads, or cross-industry solicitations.</span>
              </li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: 'accessing-info',
      number: '6',
      title: 'Accessing Data, Single-User Accounts & Anti-Scraping',
      category: 'Eligibility & Standards',
      badge: 'Account Security',
      icon: UserCheck,
      summary: 'Prohibition of account credential sharing, automated scraping bots, and simultaneous multi-country logins.',
      content: (
        <div className="space-y-4 text-slate-700 leading-relaxed">
          <p>
            Users agree that the data on this website can be used for finding interested counter-parties only and they have no right to use the information published at this website in a commercial manner; they have no right to broadcast it, copy it, save it, print it, sell it, or compile any portion of the content.
          </p>
          <div className="not-prose space-y-3">
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <strong className="text-slate-900 text-xs font-bold">Single Use Account Policy:</strong>
              <p className="text-xs text-slate-600">
                All user accounts on the website, whether paid or free, are single use accounts only. You are prohibited from sharing your account credentials with any other individual or business entity. Violation leads to immediate administrative suspension and permanent blocking.
              </p>
            </div>
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <strong className="text-slate-900 text-xs font-bold">Geolocation Integrity:</strong>
              <p className="text-xs text-slate-600">
                When you create a business profile from one location, it is assumed the account will be accessed from the same location throughout its lifecycle. Subsequent logins from disparate geographical regions or unrelated entities will result in permanent account blocking without appeal.
              </p>
            </div>
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <strong className="text-slate-900 text-xs font-bold">Automated Retrieval Ban:</strong>
              <p className="text-xs text-slate-600">
                Users are categorically prohibited from systematic or automated retrieval of content to create or compile a directory or database (whether manually or through spiders, robots, or scripts).
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
      category: 'Risk & Platform Conduct',
      badge: 'Commercial Risk',
      icon: DollarSign,
      summary: 'Users assume all commercial risk in international transactions; mandatory due diligence advisory.',
      content: (
        <div className="space-y-4 text-slate-700 leading-relaxed">
          <p>
            Users are hereby made aware that there may be risks of dealing with people acting under false pretenses at this website. Users are advised and encouraged to take due precautions while dealing with other users of the website.
          </p>
          <div className="not-prose p-4.5 bg-amber-50 border border-amber-200 rounded-2xl text-xs sm:text-sm text-amber-950 space-y-2">
            <div className="font-bold flex items-center gap-1.5 text-amber-900 uppercase text-xs tracking-wider">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Full Assumption of Transactional Risk</span>
            </div>
            <p className="leading-relaxed">
              The users acknowledge the risks of purchase and sale transactions when using the Site, and fully assume the risks of liability or harm of any kind in connection with such transactions. Such risks include mis-representation of products and services, fraudulent schemes, unsatisfactory quality, defective products, delay in delivery or payment, and transportation mishaps.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'spam-fraud',
      number: '8',
      title: 'Zero Tolerance Policy: Fraud, Scams & Unsubscribe SLA',
      category: 'Risk & Platform Conduct',
      badge: 'Zero Tolerance',
      icon: ShieldAlert,
      summary: 'Immediate permanent termination for advance fee fraud, phishing, abusive behavior, and dynamic IP blocklists.',
      content: (
        <div className="space-y-4 text-slate-700 leading-relaxed">
          <p>
            This website has a zero tolerance policy towards fraudsters, scammers, advance-fee lottery schemes, and inappropriate communication.
          </p>
          <div className="not-prose grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl space-y-1.5">
              <strong className="text-rose-900 text-xs font-bold">Zero Tolerance for Scams &amp; Spam:</strong>
              <p className="text-xs text-rose-800 leading-relaxed">
                If a user is found running fraudulent schemes or harvesting email addresses, their account will be immediately suspended with no refund for unused portions of membership.
              </p>
            </div>
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl space-y-1.5">
              <strong className="text-rose-900 text-xs font-bold">Special Note on 419 &amp; Sample Scams:</strong>
              <p className="text-xs text-rose-800 leading-relaxed">
                Access is dynamically blocked to high-risk IP origins. A "403 Forbidden" status indicates originating network designation as high risk by security threat partners.
              </p>
            </div>
          </div>
          <div className="not-prose p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700">
            <strong>Unsubscribe SLA:</strong> User unsubscribe notifications are processed within <strong>7 working days</strong>, and all promotional correspondence ceases within <strong>15 working days</strong>.
          </div>
        </div>
      )
    },
    {
      id: 'delivery-policy',
      number: '9',
      title: 'Online Service Delivery Policy',
      category: 'Risk & Platform Conduct',
      badge: 'Service Delivery',
      icon: Clock,
      summary: 'Immediate digital activation and access to premium trade tools upon confirmed payment.',
      content: (
        <div className="space-y-3 text-slate-700 leading-relaxed">
          <p>
            On activation of subscription or membership, all the services by this website are started online. Thus delivery of the services by this website is completely online.
          </p>
          <p>
            A user, subscriber, or member can start using all the services provided by this website instantly upon activation of membership via the Internet and electronic notifications.
          </p>
        </div>
      )
    },
    {
      id: 'refund-cancellation',
      number: '10',
      title: 'Refund & Cancellation Policy',
      category: 'Billing & IP',
      badge: 'Refund Terms',
      icon: CreditCard,
      summary: '60-day satisfaction refund policy for qualifying 6+ month memberships paid via Credit/Debit Card/PayPal/Online Gateways.',
      content: (
        <div className="space-y-4 text-slate-700 leading-relaxed">
          <div className="not-prose p-4.5 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-2">
            <div className="font-bold text-emerald-950 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>60-Day Satisfaction Refund Policy for 6+ Month Plans</span>
            </div>
            <p className="text-xs sm:text-sm text-emerald-900 leading-relaxed">
              This website operates under a <strong>60-day no-questions-asked refund policy</strong> for cases where a Paid Member, who has activated a membership of <strong>six (6) months or longer</strong>, is not satisfied with the services provided and files a written request for a refund.
            </p>
          </div>

          <div className="not-prose space-y-2 text-xs sm:text-sm text-slate-700">
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-xs">
              Refund Eligibility &amp; Method Conditions:
            </h4>
            <ul className="space-y-1.5 pl-2">
              <li className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                <span>Applies exclusively to payments made using <strong>Credit Card, Debit Card, or PayPal / Online Gateways</strong>.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                <span>Payments made via Cheque, Demand Drafts, or Wire Transfers are not eligible for a refund under this policy.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                <span>Monthly and quarterly payments (under 6 months duration) do not fall under this refund policy.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                <span>Pre-activation cancellation requests are refunded within <strong>7 working days</strong>.</span>
              </li>
            </ul>
          </div>
          <p className="text-xs text-slate-500">
            For additional details, visit our dedicated{' '}
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
      category: 'Billing & IP',
      badge: 'Storefront IP',
      icon: Globe,
      summary: 'Ownership of custom domains by client; underlying marketplace code and templates remain exclusive property of the Company.',
      content: (
        <div className="space-y-3 text-slate-700 leading-relaxed">
          <p>
            When this website designs, develops, hosts, or maintains a showcase website for a user (“Client Website”), the user will continue to be the owner of the domain name registered in their name.
          </p>
          <p>
            The website’s underlying code, structure, databases, frameworks, and technical setup used to build and run the Client Website remain the exclusive intellectual property of <strong>Tradeheaven ECOM Solution LLP</strong>.
          </p>
          <p>
            The User is given a limited right to use the website while their service relationship is active. If services are terminated, the right to use the code ends and cannot be transferred or shared.
          </p>
        </div>
      )
    },
    {
      id: 'liability',
      number: '12',
      title: 'Disclaimer of Warranties & Limitation of Liability',
      category: 'Legal & Governance',
      badge: 'Liability Cap',
      icon: Scale,
      summary: 'Services provided "AS IS" / "AS AVAILABLE"; total liability capped at maximum USD $10.',
      content: (
        <div className="space-y-4 text-slate-700 leading-relaxed">
          <div className="not-prose p-4.5 bg-slate-900 text-slate-200 rounded-2xl font-mono text-[11px] sm:text-xs leading-relaxed space-y-2 shadow-sm">
            <div className="text-amber-400 font-bold uppercase tracking-wider">
              DISCLAIMER OF WARRANTIES ("AS IS" &amp; "AS AVAILABLE")
            </div>
            <p>
              THE FEATURES AND SERVICES ON THIS WEBSITE ARE PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS, AND THIS WEBSITE HEREBY EXPRESSLY DISCLAIMS ANY AND ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO ANY WARRANTIES OF CONDITION, QUALITY, DURABILITY, PERFORMANCE, ACCURACY, RELIABILITY, MERCHANTABILITY OR FITNESS FOR A PARTICULAR PURPOSE.
            </p>
          </div>

          <p>
            THIS WEBSITE MAKES NO REPRESENTATIONS OR WARRANTIES ABOUT THE VALIDITY, ACCURACY, CORRECTNESS, RELIABILITY, QUALITY, STABILITY, COMPLETENESS OR CURRENTNESS OF ANY INFORMATION PROVIDED ON OR THROUGH THE SITE.
          </p>

          <div className="not-prose p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-700 space-y-1">
            <strong className="text-slate-900 font-bold">Absolute Maximum Liability:</strong> User expressly agrees that the absolute maximum extent of this site's liability shall be an amount no greater than <strong>USD $10 (US DOLLARS TEN ONLY)</strong> or the equivalent in Indian National Rupees.
          </div>
        </div>
      )
    },
    {
      id: 'earnings-disclaimer',
      number: '13',
      title: 'Disclaimers on Results, Incomes & Success Stories',
      category: 'Legal & Governance',
      badge: 'No Income Guarantee',
      icon: DollarSign,
      summary: 'Case studies and testimonials illustrate past individual experiences; no guarantee of specific sales volume.',
      content: (
        <div className="space-y-3 text-slate-700 leading-relaxed">
          <p>
            If claims about results from using this service or if claims about income or earnings resulting from the use of this service are made (like success stories, happy customers, etc.), such claims are true for the persons who made the claims.
          </p>
          <p>
            However, User cannot simply rely on these statements as being duplicable because many factors affect results, including market conditions, pricing, export tariffs, and diligence. <strong>Nothing promoted on this website should be construed as a "Get rich quick" scheme.</strong>
          </p>
        </div>
      )
    },
    {
      id: 'indemnity',
      number: '14',
      title: 'User Indemnification Obligations',
      category: 'Legal & Governance',
      badge: 'Indemnity',
      icon: ShieldCheck,
      summary: 'Users agree to indemnify Trade Heaven against damages, claims, or regulatory penalties arising from user violations.',
      content: (
        <div className="space-y-3 text-slate-700 leading-relaxed">
          <p>
            User agrees that in the event he causes damage of any nature, which the Website is required to pay for, the User, as a condition of viewing, promises to reimburse the Website for all costs, liabilities, damages, and legal expenses.
          </p>
        </div>
      )
    },
    {
      id: 'ip-rights',
      number: '15',
      title: 'Intellectual Property Ownership',
      category: 'Legal & Governance',
      badge: 'Copyright',
      icon: Lock,
      summary: 'All software, branding, and designs are copyrighted by Tradeheaven ECOM Solution LLP.',
      content: (
        <div className="space-y-3 text-slate-700 leading-relaxed">
          <p>
            <strong>Tradeheaven ECOM Solution LLP</strong> is the sole owner or lawful licensee of all the rights to the website and its content. The website content embodies trade secrets and intellectual property rights protected under worldwide copyright and other laws.
          </p>
          <p className="text-xs text-slate-500">
            All content on this web site is the copyright of Tradeheaven ECOM Solution LLP except third party content and links to third party websites.
          </p>
        </div>
      )
    },
    {
      id: 'governing-law',
      number: '16',
      title: 'Governing Law & Jurisdiction',
      category: 'Legal & Governance',
      badge: 'Jurisdiction',
      icon: Scale,
      summary: 'Subject exclusively to the laws of India and the jurisdiction of competent courts in Uttar Pradesh / New Delhi.',
      content: (
        <div className="space-y-3 text-slate-700 leading-relaxed">
          <p>
            If any matter concerning this agreement shall be brought before a court of law, user agrees that the sole and proper jurisdiction shall be the competent courts of <strong>Uttar Pradesh / New Delhi, India</strong>.
          </p>
          <p>
            User agrees that the applicable law to be applied shall, in all cases, be the laws of the Republic of India.
          </p>
        </div>
      )
    },
    {
      id: 'contact-corporate',
      number: '17',
      title: 'Official Corporate Notices & Inquiries',
      category: 'Legal & Governance',
      badge: 'Contact & Notices',
      icon: MapPin,
      summary: 'Registered office details and direct customer compliance escalation lines.',
      content: (
        <div className="space-y-4 text-slate-700 leading-relaxed">
          <p>
            For any legal notices, compliance queries, or terms inquiries, please contact our corporate desk:
          </p>

          <div className="not-prose grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <div className="pt-1 text-[11px] text-slate-500 font-medium">
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

  // Auto-Generated Table of Contents List based on document headers
  const autoGeneratedToc = useMemo(() => {
    return sections.map(sec => ({
      id: sec.id,
      number: sec.number,
      title: sec.title,
      category: sec.category,
      badge: sec.badge,
      icon: sec.icon
    }));
  }, [sections]);

  // Grouped TOC categories
  const tocCategories = useMemo(() => {
    const cats: Record<string, typeof autoGeneratedToc> = {};
    autoGeneratedToc.forEach(item => {
      if (!cats[item.category]) cats[item.category] = [];
      cats[item.category].push(item);
    });
    return Object.entries(cats);
  }, [autoGeneratedToc]);

  // Reading progress scroll tracker & ScrollSpy for active section
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const currentProgress = (window.scrollY / totalHeight) * 100;
        setReadingProgress(Math.min(100, Math.max(0, currentProgress)));
      }

      // Determine active section based on scroll position
      const headerOffset = 180;
      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(`terms-section-${sections[i].id}`);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= headerOffset) {
            setActiveSectionId(sections[i].id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [sections]);

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

  const scrollToSection = (id: string) => {
    // Ensure section is expanded
    setExpandedSections(prev => ({ ...prev, [id]: true }));
    setActiveSectionId(id);
    setShowMobileToc(false);

    // Highlight target section briefly
    setHighlightedSectionId(id);
    setTimeout(() => setHighlightedSectionId(null), 2500);

    const el = document.getElementById(`terms-section-${id}`);
    if (el) {
      const yOffset = -90;
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const copyAnchorLink = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}${window.location.pathname}?view=TERMS_OF_USE#terms-section-${id}`;
    navigator.clipboard.writeText(url);
    setCopiedAnchorId(id);
    setTimeout(() => setCopiedAnchorId(null), 2000);
  };

  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return sections;
    const q = searchQuery.toLowerCase();
    return sections.filter(sec => {
      const matchTitle = sec.title.toLowerCase().includes(q);
      const matchBadge = sec.badge.toLowerCase().includes(q);
      const matchSummary = sec.summary.toLowerCase().includes(q);
      const matchCategory = sec.category.toLowerCase().includes(q);
      return matchTitle || matchBadge || matchSummary || matchCategory;
    });
  }, [searchQuery, sections]);

  const handleCopyTerms = () => {
    const textToCopy = `TRADE HEAVEN - TERMS OF USE AGREEMENT\nLegal Entity: Tradeheaven ECOM Solution LLP\nRegistered Office: B-18424, Gauri Ganj, Auraiya Road, In Front Of Anshik Motor, Dibiyapur, Auraiya, Uttar Pradesh - 206244, India\nWebsite: https://tradeheaven.com/?view=TERMS_OF_USE\nContact: help@tradeheaven.net | Phone/WhatsApp: ${OFFICIAL_WHATSAPP_DATA.phone}\n\nImportant Highlights:\n- Consideration for access: acceptance of Terms of Use and Privacy Policy is required.\n- Trade Heaven is an independent B2B information & matchmaking platform.\n- Zero tolerance for fraudulent schemes, 419 sample scams, scraping, and prohibited items.\n- 60-day satisfaction refund policy applies to qualifying 6+ month memberships paid via Cards/PayPal/Online Gateways.\n- Single user account policy with strict geolocation verification.\n- Governing Law: Laws of India (Uttar Pradesh / New Delhi jurisdiction).`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  // Typography prose sizing helper
  const proseSizeClasses = {
    standard: 'prose-sm sm:prose-base',
    large: 'prose-base sm:prose-lg',
    compact: 'prose-xs sm:prose-sm'
  }[fontSizeMode];

  return (
    <div id="terms-of-use-view-root" className="relative max-w-7xl mx-auto pb-20 px-4 sm:px-6 lg:px-8">
      
      {/* Top Fixed Reading Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1.5 bg-slate-100 z-50">
        <div 
          className="h-full bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500 transition-all duration-150"
          style={{ width: `${readingProgress}%` }}
        />
      </div>

      {/* Breadcrumb Navigation */}
      <div className="flex items-center justify-between gap-2 text-xs text-slate-500 font-medium pt-3 pb-2">
        <div className="flex items-center gap-2">
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

        {/* Reader Typography Controls */}
        <div className="hidden sm:flex items-center gap-2 text-xs bg-white border border-slate-200 rounded-xl px-2.5 py-1 shadow-2xs">
          <span className="text-slate-400 font-medium flex items-center gap-1">
            <SlidersHorizontal className="w-3 h-3" />
            <span>Text Size:</span>
          </span>
          <button
            onClick={() => setFontSizeMode('compact')}
            className={`px-2 py-0.5 rounded-md font-semibold cursor-pointer transition-colors ${
              fontSizeMode === 'compact' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            A-
          </button>
          <button
            onClick={() => setFontSizeMode('standard')}
            className={`px-2 py-0.5 rounded-md font-semibold cursor-pointer transition-colors ${
              fontSizeMode === 'standard' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            A
          </button>
          <button
            onClick={() => setFontSizeMode('large')}
            className={`px-2 py-0.5 rounded-md font-semibold cursor-pointer transition-colors ${
              fontSizeMode === 'large' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            A+
          </button>
        </div>
      </div>

      {/* Hero Header Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-10 lg:p-12 shadow-2xl border border-slate-800 my-4">
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

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white font-display">
            Terms of Use Agreement
          </h1>

          <p className="text-xs sm:text-sm lg:text-base text-slate-300 max-w-3xl leading-relaxed font-normal">
            Please read these Terms of Use carefully. By visiting, browsing, registering, or transacting on <strong>Trade Heaven</strong> (operated by <strong>Tradeheaven ECOM Solution LLP</strong>), you agree to be bound by all provisions set forth in this document and the Privacy Policy.
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
            <div className="flex items-center gap-2 text-slate-300 text-xs font-medium">
              <span className="flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                <span>17 Articles</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                <span>~8 min read</span>
              </span>
              <span>•</span>
              <span className="text-slate-400 font-mono text-[11px]">
                Last Revised: August 2026
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Highlight Pillars */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-6">
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

      {/* Main Layout Grid: Left Sticky TOC (Desktop) + Right Document Articles */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* ========================================================
            AUTO-GENERATED TABLE OF CONTENTS (STICKY DESKTOP SIDEBAR)
           ======================================================== */}
        <aside className="hidden lg:block lg:col-span-4 sticky top-20 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4.5 space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <ListOrdered className="w-4 h-4 text-blue-600" />
                <span>Table of Contents</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                17 Headers
              </span>
            </div>

            <p className="text-[11px] text-slate-500 leading-tight">
              Auto-generated from document headers. Click any section to jump directly.
            </p>

            {/* Quick Search inside TOC */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter clauses..."
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg bg-slate-50 border border-slate-200 focus:outline-hidden focus:ring-1 focus:ring-blue-500 focus:bg-white text-slate-800"
              />
            </div>

            {/* Scrollable Grouped Categories */}
            <div className="max-h-[calc(100vh-320px)] overflow-y-auto pr-1 space-y-3.5 custom-scrollbar text-xs">
              {tocCategories.map(([categoryName, items]) => (
                <div key={categoryName} className="space-y-1">
                  <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-2 py-0.5">
                    {categoryName}
                  </div>
                  <div className="space-y-0.5">
                    {items.map((item) => {
                      const isActive = activeSectionId === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => scrollToSection(item.id)}
                          className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-start gap-2 text-xs transition-all cursor-pointer ${
                            isActive
                              ? 'bg-blue-50 font-bold text-blue-700 border-l-3 border-blue-600 shadow-2xs'
                              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                          }`}
                        >
                          <span className={`text-[10px] font-mono shrink-0 px-1 rounded ${
                            isActive ? 'bg-blue-200/60 text-blue-800' : 'bg-slate-100 text-slate-500'
                          }`}>
                            {item.number}
                          </span>
                          <span className="line-clamp-1 leading-snug">{item.title}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Actions at bottom of TOC */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
              <button
                onClick={expandAll}
                className="text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
              >
                Expand All
              </button>
              <span className="text-slate-300">•</span>
              <button
                onClick={collapseAll}
                className="text-slate-500 hover:text-slate-700 cursor-pointer"
              >
                Collapse All
              </button>
              <span className="text-slate-300">•</span>
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
              >
                <ArrowUp className="w-3 h-3" />
                <span>Top</span>
              </button>
            </div>
          </div>
        </aside>

        {/* ========================================================
            DOCUMENT ARTICLES & PROSE CONTENT (RIGHT COLUMN)
           ======================================================== */}
        <main className="lg:col-span-8 space-y-6">

          {/* Search & Global Section Controls */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600 shrink-0" />
                <div>
                  <h2 className="text-base sm:text-lg font-black text-slate-900">
                    Articles &amp; Contractual Terms
                  </h2>
                  <p className="text-xs text-slate-500">
                    Governing all interactions, memberships, and transactions on Trade Heaven.
                  </p>
                </div>
              </div>

              {/* Mobile Table of Contents Button */}
              <button
                onClick={() => setShowMobileToc(!showMobileToc)}
                className="lg:hidden px-3 py-1.5 text-xs font-bold text-blue-600 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <ListOrdered className="w-4 h-4" />
                <span>{showMobileToc ? 'Close Table of Contents' : 'Table of Contents (17)'}</span>
              </button>
            </div>

            {/* Mobile TOC Drawer / Accordion */}
            {showMobileToc && (
              <div className="lg:hidden p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5 max-h-80 overflow-y-auto">
                <div className="text-xs font-bold text-slate-900 flex items-center justify-between">
                  <span>Auto-Generated Table of Contents:</span>
                  <span className="text-[10px] text-slate-500">Tap to jump</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs">
                  {autoGeneratedToc.map(item => (
                    <button
                      key={item.id}
                      onClick={() => scrollToSection(item.id)}
                      className="text-left p-2 rounded-lg bg-white border border-slate-200/80 hover:bg-blue-50 text-slate-700 flex items-center gap-2 cursor-pointer"
                    >
                      <span className="font-mono text-[10px] font-bold text-blue-600 bg-blue-50 px-1 rounded">
                        {item.number}
                      </span>
                      <span className="truncate">{item.title}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Search input for mobile / tablets */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search keywords across all terms (e.g. refund, liability, verified, spam, sanctions)..."
                className="w-full pl-9 pr-8 py-2 text-xs rounded-xl bg-slate-50 border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white shadow-2xs"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>

            {searchQuery && (
              <div className="text-xs text-slate-500 flex items-center justify-between pt-1">
                <span>
                  Showing results matching <span className="font-bold text-slate-900">"{searchQuery}"</span> ({filteredSections.length} of {sections.length} articles found)
                </span>
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-blue-600 font-bold hover:underline cursor-pointer"
                >
                  Reset Filter
                </button>
              </div>
            )}
          </div>

          {/* ========================================================
              ACCORDION ARTICLES WITH TAILWIND PROSE TYPOGRAPHY
             ======================================================== */}
          <div className="space-y-4">
            {filteredSections.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
                <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <Search className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-800">No matching terms article found</h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Try searching with broader terms like "refund", "verified", "liability", "sanctions", or "intellectual property".
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
                const isHighlighted = highlightedSectionId === sec.id;
                const isAnchorCopied = copiedAnchorId === sec.id;

                return (
                  <article
                    key={sec.id}
                    id={`terms-section-${sec.id}`}
                    className={`bg-white border rounded-2xl overflow-hidden shadow-xs transition-all duration-300 ${
                      isHighlighted
                        ? 'ring-3 ring-blue-500/50 border-blue-400 shadow-md'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {/* Header Bar */}
                    <div
                      onClick={() => toggleSection(sec.id)}
                      className="p-4 sm:p-5 flex items-start sm:items-center justify-between gap-4 cursor-pointer select-none bg-slate-50/60 hover:bg-slate-50 transition-colors group"
                    >
                      <div className="flex items-start sm:items-center gap-3.5">
                        <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-xs text-blue-600 group-hover:bg-blue-50 group-hover:border-blue-200 transition-colors">
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-sm sm:text-base font-black text-slate-900 font-display flex items-center gap-1.5">
                              <span>{sec.number}. {sec.title}</span>
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

                      <div className="flex items-center gap-2 shrink-0 pt-1 sm:pt-0">
                        {/* Copy Section Anchor Link */}
                        <button
                          onClick={(e) => copyAnchorLink(sec.id, e)}
                          title="Copy Direct Link to this Article"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                        >
                          {isAnchorCopied ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <LinkIcon className="w-3.5 h-3.5" />
                          )}
                        </button>

                        <div className="text-slate-400 hover:text-slate-600 transition-colors">
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </div>
                      </div>
                    </div>

                    {/* Article Content with Tailwind Prose Classes */}
                    {isExpanded && (
                      <div className="p-5 sm:p-7 border-t border-slate-100 bg-white">
                        <div className={`prose prose-slate max-w-none ${proseSizeClasses} prose-p:leading-relaxed prose-headings:font-display prose-headings:font-bold prose-strong:text-slate-900 prose-a:text-blue-600 hover:prose-a:underline`}>
                          {sec.content}
                        </div>
                      </div>
                    )}
                  </article>
                );
              })
            )}
          </div>

          {/* Cross-Link Policy Banners */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
            <div 
              onClick={() => onNavigate && onNavigate('PRIVACY_POLICY')}
              className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer space-y-2 group shadow-2xs"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-slate-900 text-xs sm:text-sm font-display">Privacy Policy</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Review how Tradeheaven ECOM Solution LLP safeguards your business data and handles deletion requests.
              </p>
            </div>

            <div 
              onClick={() => onNavigate && onNavigate('PRODUCT_LISTING_POLICY')}
              className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer space-y-2 group shadow-2xs"
            >
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold group-hover:bg-amber-600 group-hover:text-white transition-colors">
                <FileCheck className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-slate-900 text-xs sm:text-sm font-display">Product Listing Policy</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Understand prohibited trade items, medical device clearances, IPR rules, and sanctions guidelines.
              </p>
            </div>

            <div 
              onClick={() => onNavigate && onNavigate('REFUND_POLICY')}
              className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer space-y-2 group shadow-2xs"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <CreditCard className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-slate-900 text-xs sm:text-sm font-display">Return &amp; Refund Policy</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Learn about our 60-day satisfaction guarantee terms, payment methods, and cancellation procedures.
              </p>
            </div>
          </div>

          {/* Corporate Compliance Desk Contact Banner */}
          <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-9 space-y-6 shadow-xl mt-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-500/30">
                <Building2 className="w-3.5 h-3.5" />
                <span>Corporate Compliance Desk</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white font-display">
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

        </main>
      </div>

    </div>
  );
};
