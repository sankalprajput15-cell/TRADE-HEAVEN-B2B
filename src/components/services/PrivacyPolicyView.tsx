import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  Lock,
  FileText,
  Search,
  CheckCircle2,
  AlertCircle,
  Building2,
  MapPin,
  Mail,
  Phone,
  MessageCircle,
  Clock,
  Printer,
  Copy,
  Check,
  Eye,
  Database,
  CreditCard,
  BarChart3,
  Trash2,
  Globe,
  Cookie,
  Scale,
  ChevronDown,
  ChevronUp,
  FileCheck,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';
import { ActiveView } from '../../types';
import { OFFICIAL_WHATSAPP_DATA } from '../common/TradeHeavenSocialBar';

interface Props {
  onNavigate?: (view: ActiveView | string) => void;
  onOpenContactModal?: (config?: any) => void;
}

interface PolicySection {
  id: string;
  title: string;
  badge: string;
  icon: React.ElementType;
  summary: string;
  content: React.ReactNode;
}

export const PrivacyPolicyView: React.FC<Props> = ({
  onNavigate,
  onOpenContactModal
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    'company-entity': true,
    'info-collect': true,
    'how-we-use': true,
    'deletion-rights': true
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

  const sections: PolicySection[] = [
    {
      id: 'company-entity',
      title: '1. Corporate Ownership & Acceptance of Terms',
      badge: 'Ownership & Scope',
      icon: Building2,
      summary: 'Ownership by Tradeheaven ECOM Solution LLP and conditions of accessing the Trade Heaven B2B network.',
      content: (
        <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
          <p>
            This Privacy Policy describes the terms of commitment of <strong>Trade Heaven</strong> (available at <strong>TradeHeaven.com</strong> and associated subdomains/services) to your privacy and data security. Acceptance of the terms of this Privacy Policy is a pre-requisite to visit, register, or transact on this website. If you visit, access, or utilize this platform, you acknowledge and accept all terms of this Privacy Policy.
          </p>
          <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-2xl space-y-2">
            <div className="flex items-center gap-2 text-blue-900 font-bold text-xs uppercase tracking-wider">
              <Building2 className="w-4 h-4 text-blue-600" />
              <span>Owning &amp; Operating Legal Entity</span>
            </div>
            <p className="text-xs text-slate-800">
              <strong>Tradeheaven ECOM Solution LLP</strong> is the registered legal entity that owns and operates the network of B2B e-commerce websites and trade solutions, which includes <strong>Trade Heaven</strong>.
            </p>
          </div>
          <p>
            At Trade Heaven, we take your privacy seriously and will only use your personal and business information to administer your account and to provide the products and services you have requested from us. These services include, but are not limited to, connecting you with verified international wholesale buyers, suppliers, manufacturers, export-import brokers, and global trade intermediaries.
          </p>
        </div>
      )
    },
    {
      id: 'communications',
      title: '2. B2B Communications & Business Networking',
      badge: 'Communications',
      icon: Mail,
      summary: 'Promotional updates, commercial inquiry alerts, and verified matchmaking communications.',
      content: (
        <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
          <p>
            From time to time, Trade Heaven may contact you with details of trade promotions, platform updates, matchmaking recommendations, and special service offers. These communications may be delivered through <strong>Email, Post, Telephone, Text Messages (SMS), Instant Messaging (e.g., Official WhatsApp Business), and/or Automated Transactional Notifications</strong>.
          </p>
          <p>
            Since Trade Heaven is an international Business Advertising, Supplier Directory, and Trade Promotion marketplace, we facilitate passing your verified business details onto other enterprises and professional buyers who express explicit commercial interest in doing business with you or your organization.
          </p>
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>
              <strong>Privacy Protection Standard:</strong> Your direct contact information (such as private phone numbers or direct email addresses) is never sold to unauthorized mass marketing lists. Non-registered visitors can only send inquiries via our secure on-platform contact and RFQ forms without accessing your raw credentials.
            </span>
          </div>
        </div>
      )
    },
    {
      id: 'info-collect',
      title: '3. Information We Collect',
      badge: 'Data Collection',
      icon: Database,
      summary: 'Categorization of Business Information, Payment Data, and Technical/Statistical Information.',
      content: (
        <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
          <p>
            Trade Heaven collects information to facilitate cross-border B2B trade. The gathered information is classified into three core categories:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-1">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                <Building2 className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-slate-900 text-xs sm:text-sm">Business Information</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Contact details, business names, GST/tax registrations, company profile descriptions, catalogs, product photos, trade leads, and RFQ inquiries submitted voluntarily upon registration or through forms.
              </p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <CreditCard className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-slate-900 text-xs sm:text-sm">Payment Information</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Information relating to any subscription or escrow transaction made via card, net banking, or bank wire. All credit/debit card data is processed directly via PCI-DSS certified gateways and is <strong>never stored</strong> on our servers.
              </p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
              <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                <BarChart3 className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-slate-900 text-xs sm:text-sm">Statistical Information</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Visitor IP addresses, browser specifications, operating systems, session durations, referring URLs, and page navigation patterns collected to optimize marketplace performance.
              </p>
            </div>
          </div>
          <p className="text-xs text-slate-500 italic">
            Collectively, Business Information, Payment Information, and Statistical Information are designated as "Information Gathered".
          </p>
        </div>
      )
    },
    {
      id: 'how-we-use',
      title: '4. How We Use and Share Gathered Information',
      badge: 'Data Usage',
      icon: Globe,
      summary: 'Public business directory publication, payment gateway security, and statistical aggregation.',
      content: (
        <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
          <div className="space-y-3">
            <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-1.5">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-blue-700">
                A. Public Business Information
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Since Trade Heaven operates to maximize the international reach of registered sellers and buyers, all <strong>Business Information</strong> submitted for public display (such as company overview, export catalogs, product specifications, and trade leads) will be publicly accessible to internet users worldwide.
              </p>
              <p className="text-xs text-slate-500">
                <strong>Notice:</strong> Please exercise diligence to not submit proprietary trade secrets, unpatented designs, or confidential documents unless intended for public dissemination. We facilitate supplier vetting through statutory registration checks (such as MCA &amp; GSTIN records) and member-uploaded trade credentials.
              </p>
            </div>

            <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-1.5">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-emerald-700">
                B. Payment Information Security &amp; Non-Disclosure
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Payment details are strictly held confidential and are never disclosed to third parties unless required by judicial decree or banking regulatory mandates. Online payments are transmitted encrypted directly to bank payment gateways.
              </p>
            </div>

            <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-1.5">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-purple-700">
                C. Aggregated Statistical Information
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                We aggregate statistical metrics to enhance platform responsiveness, diagnose technical anomalies, and assess market demand. This data is processed on an anonymized, aggregate basis with analytic service providers without exposing private personal credentials.
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'disclosure',
      title: '5. Legal Disclosures & Compliance Exceptions',
      badge: 'Legal Disclosure',
      icon: Scale,
      summary: 'Circumstances under which Information Gathered may be legally disclosed.',
      content: (
        <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
          <p>
            <strong>Tradeheaven ECOM Solution LLP</strong> reserves the right to disclose Information Gathered when required to do so by applicable law, court order, subpoena, or governmental regulatory authority, or when we reasonably believe in good faith that such disclosure is necessary to:
          </p>
          <ul className="space-y-2 text-xs text-slate-700 pl-2">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
              <span>Comply with statutory legal obligations and international trade compliance directives.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
              <span>Enforce our Marketplace Terms of Use, Product Listing Policy, and Dispute Guidelines.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
              <span>Protect the safety, rights, integrity, and intellectual property of Trade Heaven, our members, or the general public against fraud or cyber threats.</span>
            </li>
          </ul>
        </div>
      )
    },
    {
      id: 'deletion-rights',
      title: '6. Modification & Account Deletion Requests',
      badge: 'User Rights & SLAs',
      icon: Trash2,
      summary: 'How to update your profile, terminate membership, and request data deletion within 48–72 business hours.',
      content: (
        <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
          <p>
            You maintain full control over your business listings and account data on Trade Heaven:
          </p>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="w-6 h-6 rounded-md bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                1
              </div>
              <div>
                <strong className="text-slate-900 text-xs">Self-Service Profile Modification:</strong>
                <p className="text-xs text-slate-600 mt-0.5">
                  You can modify or update your business profile, contact details, and catalog listings at any time by logging into your account dashboard.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="w-6 h-6 rounded-md bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                2
              </div>
              <div>
                <strong className="text-slate-900 text-xs">Membership Termination:</strong>
                <p className="text-xs text-slate-600 mt-0.5">
                  You can submit a formal request to terminate your membership directly from your private account settings.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="w-6 h-6 rounded-md bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                3
              </div>
              <div>
                <strong className="text-slate-900 text-xs">Direct Email Deletion Request:</strong>
                <p className="text-xs text-slate-600 mt-0.5">
                  You may email our Data Protection Desk at <a href="mailto:help@tradeheaven.net" className="text-blue-600 font-bold hover:underline">help@tradeheaven.net</a> providing the URLs/profile identifier you wish removed.
                </p>
              </div>
            </div>
          </div>

          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-emerald-900 text-xs font-semibold">
            <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              <strong>Resolution SLA:</strong> Once a verified request for information removal is received, Trade Heaven will process and execute the deletion within <strong>48 to 72 business hours</strong>.
            </span>
          </div>
        </div>
      )
    },
    {
      id: 'storage-duration',
      title: '7. Duration of Storage of Business Information',
      badge: 'Data Retention',
      icon: Clock,
      summary: 'Active directory profile retention until an explicit deletion request is executed.',
      content: (
        <div className="space-y-3 text-xs sm:text-sm text-slate-700 leading-relaxed">
          <p>
            Because Trade Heaven serves as a live global business directory and trade discovery service, your public company storefront and verified listings remain online in perpetuity to maintain business continuity, indexing, and buyer inquiry flow, or until such time as you make an explicit request to modify or delete your information.
          </p>
        </div>
      )
    },
    {
      id: 'hyperlinks',
      title: '8. Hyperlinks to Third-Party Websites',
      badge: 'External Links',
      icon: ExternalLink,
      summary: 'Disclaimer regarding external member storefronts and third-party web domains.',
      content: (
        <div className="space-y-3 text-xs sm:text-sm text-slate-700 leading-relaxed">
          <p>
            Our website may provide hyperlinks to external content, products, and services hosted by member companies, freight carriers, or financial institutions. Trade Heaven has no operational control over third-party websites and assumes no liability for their content, accuracy, or privacy practices. Users are advised to review the respective privacy policies and terms of service of any third-party website they visit.
          </p>
        </div>
      )
    },
    {
      id: 'cookies',
      title: '9. Cookies & Session Management',
      badge: 'Cookies',
      icon: Cookie,
      summary: 'Use of standard authentication, security, and preference cookies.',
      content: (
        <div className="space-y-3 text-xs sm:text-sm text-slate-700 leading-relaxed">
          <p>
            Trade Heaven utilizes industry-standard session and authentication cookies to maintain your login status, preserve currency preferences, and ensure seamless navigation across trade tools. You may configure your browser to decline cookies, although doing so may restrict access to interactive features such as the RFQ Hub and Buyer Inquiries desk.
          </p>
        </div>
      )
    },
    {
      id: 'security',
      title: '10. Data Security & Technical Safeguards',
      badge: 'Security Architecture',
      icon: Lock,
      summary: 'End-to-end SSL/TLS 256-bit encryption, role-based controls, and security standards.',
      content: (
        <div className="space-y-3 text-xs sm:text-sm text-slate-700 leading-relaxed">
          <p>
            We implement technical, physical, and administrative safeguards to protect data against unauthorized access, loss, or alteration. All electronic communications and transactions are protected via 256-bit SSL/TLS cryptographic encryption.
          </p>
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600">
            <strong>Security Disclaimer:</strong> While we enforce rigorous enterprise protection, no internet transmission can be guaranteed 100% immune from external threats. By utilizing the platform, users agree to maintain confidential custody of their login credentials.
          </div>
        </div>
      )
    },
    {
      id: 'revisions',
      title: '11. Policy Revisions & Continuous Updates',
      badge: 'Policy Revisions',
      icon: FileCheck,
      summary: 'Dynamic policy updates reflecting evolving international trade and data regulations.',
      content: (
        <div className="space-y-3 text-xs sm:text-sm text-slate-700 leading-relaxed">
          <p>
            This Privacy Policy is subject to continuous review and periodic updates to align with evolving regulatory frameworks and technological enhancements. Users are encouraged to review this page periodically. Continued usage of Trade Heaven after modifications indicates full acceptance of the updated terms.
          </p>
          <p className="text-xs font-mono text-slate-500">
            Current Version: 3.2 | Effective Date: August 2026
          </p>
        </div>
      )
    },
    {
      id: 'jurisdiction',
      title: '12. Governing Law & Jurisdiction',
      badge: 'Jurisdiction',
      icon: Scale,
      summary: 'Legal jurisdiction governed by the laws of India.',
      content: (
        <div className="space-y-3 text-xs sm:text-sm text-slate-700 leading-relaxed">
          <p>
            If any legal matter or dispute concerning this Privacy Policy is brought before a court of law, the visitor and Trade Heaven agree that the sole and exclusive legal jurisdiction shall reside with the competent courts of <strong>Uttar Pradesh / New Delhi, India</strong>, and shall be governed strictly by the applicable laws of <strong>India</strong>.
          </p>
        </div>
      )
    },
    {
      id: 'contact-officer',
      title: '13. Data Protection Desk & Registered Corporate Address',
      badge: 'Contact & Registered Office',
      icon: MapPin,
      summary: 'Official registered address for Tradeheaven ECOM Solution LLP and Data Protection Officer contacts.',
      content: (
        <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
          <p>
            For any privacy inquiries, data subject access requests, deletion verifications, or incident reports, please contact our designated Data Protection Desk:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-slate-900 font-black text-xs uppercase tracking-wider">
                <Building2 className="w-4 h-4 text-blue-600" />
                <span>Registered Corporate Entity</span>
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
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-slate-900 font-black text-xs uppercase tracking-wider">
                <Mail className="w-4 h-4 text-blue-600" />
                <span>Direct Support &amp; Escalations</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-slate-500">Official Help Desk:</span>
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

  const handleCopyPolicy = () => {
    const textToCopy = `TRADE HEAVEN - PRIVACY POLICY\nLegal Entity: Tradeheaven ECOM Solution LLP\nRegistered Address: B-18424, Gauri Ganj, Auraiya Road, In Front Of Anshik Motor, Dibiyapur, Auraiya, Uttar Pradesh - 206244, India\nWebsite: https://tradeheaven.com/?view=PRIVACY_POLICY\nContact: help@tradeheaven.net | Phone/WhatsApp: ${OFFICIAL_WHATSAPP_DATA.phone}\n\nThis Privacy Policy describes the terms of commitment of Trade Heaven to your privacy. Tradeheaven ECOM Solution LLP owns and operates Trade Heaven.\n\nKey Highlights:\n- Business Information is used to connect you with verified international B2B buyers and sellers.\n- Payment details are submitted directly to secure payment gateways and are never stored on our servers.\n- Profile modifications or deletion requests are executed within 48-72 business hours via help@tradeheaven.net.`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div id="privacy-policy-view-root" className="max-w-5xl mx-auto space-y-8 pb-16 px-4 sm:px-6">
      
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
        <span className="text-slate-900 font-bold">Privacy Policy</span>
      </div>

      {/* Hero Header Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white rounded-3xl p-6 sm:p-10 lg:p-12 shadow-2xl border border-slate-800">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-500/30">
              <Building2 className="w-3.5 h-3.5 text-blue-400" />
              <span>Tradeheaven ECOM Solution LLP</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Govt. Registered LLP (MCA) • GST Verified Entity</span>
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
            Privacy Policy
          </h1>

          <p className="text-xs sm:text-sm lg:text-base text-slate-300 max-w-3xl leading-relaxed font-normal">
            This Privacy Policy outlines our uncompromising commitment to protecting your privacy, securing B2B trade data, and maintaining transparent practices across the <strong>Trade Heaven</strong> ecosystem owned by <strong>Tradeheaven ECOM Solution LLP</strong>.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3 text-xs">
            <button
              onClick={handleCopyPolicy}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer backdrop-blur-xs border border-white/10"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Summary Copied!' : 'Copy Summary'}</span>
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

      {/* Trust & Guarantee Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1.5">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <h3 className="font-black text-slate-900 text-xs sm:text-sm">B2B Trade Focused</h3>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Data is strictly used to administer accounts and enable verified global matchmaking.
          </p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CreditCard className="w-4 h-4" />
          </div>
          <h3 className="font-black text-slate-900 text-xs sm:text-sm">Zero Card Storage</h3>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            All payments are processed directly via PCI-DSS gateways with 0 card retention.
          </p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1.5">
          <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <Clock className="w-4 h-4" />
          </div>
          <h3 className="font-black text-slate-900 text-xs sm:text-sm">48–72h Deletion SLA</h3>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Guaranteed prompt turnaround for profile deletion and membership cancellation.
          </p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1.5">
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Lock className="w-4 h-4" />
          </div>
          <h3 className="font-black text-slate-900 text-xs sm:text-sm">256-Bit SSL Safeguard</h3>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Enterprise grade encryption across all communications and data transfers.
          </p>
        </div>
      </div>

      {/* Search & Section Controls */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Policy Articles &amp; Data Provisions
            </h2>
            <p className="text-xs text-slate-500">
              Browse or search specific clauses regarding your privacy rights and data protections.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative min-w-[240px] sm:min-w-[280px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search clauses (e.g. cookies, deletion, payment)..."
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
            Showing results matching <span className="font-bold text-slate-900">"{searchQuery}"</span> ({filteredSections.length} clauses found)
          </div>
        )}
      </div>

      {/* Policy Clauses Accordion / Cards */}
      <div className="space-y-4">
        {filteredSections.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Search className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-800">No matching policy clause found</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Try searching with different keywords like "deletion", "cookies", "information", or "security".
            </p>
            <button
              onClick={() => setSearchQuery('')}
              className="px-4 py-1.5 bg-blue-600 text-white font-bold text-xs rounded-xl hover:bg-blue-700 transition-colors cursor-pointer"
            >
              Reset Search Filter
            </button>
          </div>
        ) : (
          filteredSections.map((sec, idx) => {
            const Icon = sec.icon;
            const isExpanded = expandedSections[sec.id] || Boolean(searchQuery);

            return (
              <div
                key={sec.id}
                id={`policy-section-${sec.id}`}
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
                          {sec.title}
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

      {/* Official Registered Office & Data Officer Desk */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-9 space-y-6 shadow-xl">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-500/30">
            <Building2 className="w-3.5 h-3.5" />
            <span>Corporate Compliance &amp; Data Rights Desk</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white">
            Have Questions or Need to Raise a Data Request?
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
            Our Data Protection Officers at <strong>Tradeheaven ECOM Solution LLP</strong> are available to assist with inquiries, account closures, and regulatory compliance queries.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
            <div className="text-slate-400 font-bold uppercase text-[10px]">Official Help Desk Email</div>
            <div className="font-mono text-sm font-bold text-blue-300">
              help@tradeheaven.net
            </div>
            <p className="text-slate-400 text-[11px]">
              Guaranteed SLA response within 48–72 business hours for deletion &amp; compliance requests.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
            <div className="text-slate-400 font-bold uppercase text-[10px]">Official WhatsApp Escalation</div>
            <div className="font-mono text-sm font-bold text-emerald-300">
              {OFFICIAL_WHATSAPP_DATA.phone}
            </div>
            <p className="text-slate-400 text-[11px]">
              Direct communication line with customer success and verification representatives.
            </p>
          </div>
        </div>

        <div className="pt-2 flex flex-wrap gap-3">
          {onOpenContactModal && (
            <button
              onClick={() => onOpenContactModal({ targetType: 'GENERAL', targetTitle: 'Privacy & Data Rights Request' })}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition-all shadow-md cursor-pointer flex items-center gap-2"
            >
              <Mail className="w-4 h-4" />
              <span>Submit Data Subject Request</span>
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
            <>
              <button
                onClick={() => onNavigate('PRODUCT_LISTING_POLICY')}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <FileText className="w-4 h-4" />
                <span>Product Listing Policy</span>
              </button>

              <button
                onClick={() => onNavigate('REFUND_POLICY')}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <FileText className="w-4 h-4" />
                <span>Return &amp; Refund Policy</span>
              </button>
            </>
          )}
        </div>
      </div>

    </div>
  );
};
