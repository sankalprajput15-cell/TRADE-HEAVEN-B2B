import React, { useState, useEffect, useRef } from 'react';
import { 
  NegotiationThread, 
  Incoterm, 
  Currency, 
  NegotiationMessage, 
  AuthUser 
} from '../../types';
import { CURRENCY_RATES } from '../../data/mockData';
import { OFFICIAL_WHATSAPP_DATA } from '../common/TradeHeavenSocialBar';
import { ProformaInvoiceModal } from '../modals/ProformaInvoiceModal';
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
  ExternalLink,
  MessageCircle,
  Search,
  Filter,
  ArrowLeft,
  Paperclip,
  Check,
  Sparkles,
  Plus,
  X,
  BadgeCheck,
  ChevronRight,
  Sliders,
  Globe,
  Printer,
  Download,
  Eye,
  RefreshCw,
  PhoneCall,
  Calendar
} from 'lucide-react';

interface Props {
  selectedCurrency: Currency;
  onInitiateEscrow: (thread: NegotiationThread) => void;
  currentUser?: AuthUser | null;
  onOpenStorefront?: (supplierId: string) => void;
  onOpenBuyerProfile?: (buyerId: string) => void;
  onNavigate?: (view: any) => void;
  onOpenContactModal?: (config?: any) => void;
}

const INITIAL_NEGOTIATION_ROOMS: NegotiationThread[] = [
  {
    id: 'thread-9901',
    rfqId: 'rfq-2026-901',
    productTitle: 'Commercial 5.12kWh LiFePO4 Server Rack Batteries (500 Units)',
    buyerId: 'user-nordic-marcus',
    buyerName: 'Marcus Vance',
    buyerCompany: 'Nordic Clean Energy Solutions AB',
    supplierId: 'comp-shenzhen-batt',
    supplierName: 'Elena Zhao (Sales Director)',
    supplierCompany: 'ApexPower Energy Tech Co., Ltd.',
    currentPriceUsd: 670,
    orderQuantity: 500,
    currentIncoterm: 'CIF',
    destinationPort: 'Gothenburg Port, Sweden',
    status: 'AGREED',
    agreedPriceUsd: 670,
    agreedQuantity: 500,
    agreedIncoterm: 'CIF',
    escrowStatus: 'FUNDS_LOCKED',
    lastUpdated: 'Just now',
    messages: [
      {
        id: 'msg-1',
        senderRole: 'BUYER',
        senderName: 'Marcus Vance',
        senderCompany: 'Nordic Clean Energy Solutions AB',
        content: 'Hello Elena, we reviewed your quote for 500 units of 51.2V 100Ah battery modules. Can you offer CIF Gothenburg at $665/unit if we commit to an additional 300 units in Q4?',
        timestamp: '10:14 AM'
      },
      {
        id: 'msg-2',
        senderRole: 'SUPPLIER',
        senderName: 'Elena Zhao',
        senderCompany: 'ApexPower Energy Tech Co., Ltd.',
        content: 'Hello Marcus! Thank you for the update. Given current lithium cell raw material indices, the best volume price we can offer for 500 units CIF Gothenburg is $670/unit including marine insurance. We will include 2% complimentary spare BMS boards.',
        timestamp: '11:45 AM',
        proposedPriceUsd: 670,
        proposedIncoterm: 'CIF',
        attachment: {
          type: 'COUNTER_OFFER',
          title: 'Official Counter-Offer: $670.00 / Unit (CIF Gothenburg)',
          valueSummary: 'Total: $335,000.00 USD (Includes 500 units + 10 spare BMS boards)'
        }
      },
      {
        id: 'msg-3',
        senderRole: 'BUYER',
        senderName: 'Marcus Vance',
        senderCompany: 'Nordic Clean Energy Solutions AB',
        content: 'That works for us. Please issue the Proforma Invoice with 30% T/T deposit and 70% against B/L copy, with Trade Protection Certificate enabled.',
        timestamp: '12:20 PM'
      },
      {
        id: 'msg-4',
        senderRole: 'SUPPLIER',
        senderName: 'Elena Zhao',
        senderCompany: 'ApexPower Energy Tech Co., Ltd.',
        content: 'Wonderful! The signed Proforma Invoice PI-TH-8891-2026 has been issued and attached. Trade Protection Swiss Escrow deposit link is ready.',
        timestamp: '12:35 PM',
        attachment: {
          type: 'PROFORMA_INVOICE',
          title: 'Proforma Invoice PI-TH-8891-2026.pdf',
          valueSummary: 'Total: $335,000.00 USD | Initial Deposit: $100,500.00 USD (30%)'
        }
      }
    ]
  },
  {
    id: 'thread-9902',
    rfqId: 'rfq-2026-902',
    productTitle: '5-Axis High Precision CNC Vertical Machining Center (12 Units)',
    buyerId: 'user-aero-deutschland',
    buyerName: 'Dr. Henrik Weber',
    buyerCompany: 'Bavaria Aerospace Components AG',
    supplierId: 'comp-hans-cnc',
    supplierName: 'Klaus Fischer (Export VP)',
    supplierCompany: 'KUKA Precision Engineering GmbH',
    currentPriceUsd: 84500,
    orderQuantity: 12,
    currentIncoterm: 'FOB',
    destinationPort: 'Hamburg Port, Germany',
    status: 'IN_PROGRESS',
    escrowStatus: 'NONE',
    lastUpdated: '15m ago',
    messages: [
      {
        id: 'msg-201',
        senderRole: 'BUYER',
        senderName: 'Dr. Henrik Weber',
        senderCompany: 'Bavaria Aerospace Components AG',
        content: 'Good morning Klaus. We are expanding our Munich turbine machining cell. For 12 units of the VMC-850-5AX model, we require Heidenhain TNC-640 controllers and Renishaw RMP60 probing probes.',
        timestamp: '09:00 AM'
      },
      {
        id: 'msg-202',
        senderRole: 'SUPPLIER',
        senderName: 'Klaus Fischer',
        senderCompany: 'KUKA Precision Engineering GmbH',
        content: 'Guten Tag Dr. Weber. We can supply the VMC-850-5AX with optical linear scales and Heidenhain controllers at $84,500/unit FOB Hamburg. Factory testing report by TÜV Rheinland is included.',
        timestamp: '09:42 AM',
        proposedPriceUsd: 84500,
        proposedIncoterm: 'FOB'
      },
      {
        id: 'msg-203',
        senderRole: 'BUYER',
        senderName: 'Dr. Henrik Weber',
        senderCompany: 'Bavaria Aerospace Components AG',
        content: 'Can you guarantee delivery of the first 4 units within 45 days of Swiss Escrow deposit confirmation?',
        timestamp: '10:05 AM'
      }
    ]
  },
  {
    id: 'thread-9903',
    rfqId: 'rfq-2026-903',
    productTitle: '100% Organic Aegean Denim Fabric (15,000 Meters)',
    buyerId: 'user-mode-paris',
    buyerName: 'Camille Laurent',
    buyerCompany: 'Atelier Mode Paris SARL',
    supplierId: 'comp-anatolian-textile',
    supplierName: 'Mehmet Demir (Global Trade Head)',
    supplierCompany: 'Anatolian Organic Yarns & Fabrics A.S.',
    currentPriceUsd: 3.95,
    orderQuantity: 15000,
    currentIncoterm: 'CIF',
    destinationPort: 'Antwerp Port, Belgium',
    status: 'IN_PROGRESS',
    escrowStatus: 'NONE',
    lastUpdated: '1h ago',
    messages: [
      {
        id: 'msg-301',
        senderRole: 'BUYER',
        senderName: 'Camille Laurent',
        senderCompany: 'Atelier Mode Paris SARL',
        content: 'Bonjour Mehmet, we received the 5-meter sample roll in Paris. The indigo color fastness and hand-feel are excellent. We are ready to place 15,000 meters.',
        timestamp: 'Yesterday 14:10'
      },
      {
        id: 'msg-302',
        senderRole: 'SUPPLIER',
        senderName: 'Mehmet Demir',
        senderCompany: 'Anatolian Organic Yarns & Fabrics A.S.',
        content: 'Wonderful news Camille! For 15,000m roll stock CIF Antwerp, our certified GOTS Organic denim is $3.95/meter. We can ship in 20-foot container within 18 days.',
        timestamp: 'Yesterday 16:30',
        proposedPriceUsd: 3.95,
        proposedIncoterm: 'CIF'
      }
    ]
  },
  {
    id: 'thread-9904',
    rfqId: 'rfq-2026-904',
    productTitle: 'Semi-Slick Competition Racing Tyres 265/35R18 (800 Units)',
    buyerId: 'user-california-track',
    buyerName: 'Jason Miller',
    buyerCompany: 'TrackPro Racing Supply LLC (California)',
    supplierId: 'comp-apex-motorsport',
    supplierName: 'Sheng Li (Factory Director)',
    supplierCompany: 'Apex Motorsport Components',
    currentPriceUsd: 118,
    orderQuantity: 800,
    currentIncoterm: 'DDP',
    destinationPort: 'Long Beach Port, USA',
    status: 'AGREED',
    agreedPriceUsd: 118,
    agreedQuantity: 800,
    agreedIncoterm: 'DDP',
    escrowStatus: 'FUNDS_LOCKED',
    lastUpdated: 'Yesterday',
    messages: [
      {
        id: 'msg-401',
        senderRole: 'BUYER',
        senderName: 'Jason Miller',
        senderCompany: 'TrackPro Racing Supply LLC',
        content: 'Hi Sheng, our racers loved the 200TW compound on Laguna Seca tests. Need 800 units DDP Long Beach with custom sidewall branding.',
        timestamp: 'Aug 28 08:30'
      },
      {
        id: 'msg-402',
        senderRole: 'SUPPLIER',
        senderName: 'Sheng Li',
        senderCompany: 'Apex Motorsport Components',
        content: 'Hi Jason, custom laser mold tooling is complete. $118/unit DDP Long Beach with all import duties and warehouse delivery included. Proforma Invoice generated.',
        timestamp: 'Aug 28 11:15',
        proposedPriceUsd: 118,
        proposedIncoterm: 'DDP',
        attachment: {
          type: 'PROFORMA_INVOICE',
          title: 'Proforma Invoice PI-TH-9904-2026.pdf',
          valueSummary: 'Total: $94,400.00 USD | DDP Warehouse Delivered'
        }
      }
    ]
  }
];

export const TradeNegotiationChat: React.FC<Props> = ({
  selectedCurrency,
  onInitiateEscrow,
  currentUser,
  onOpenStorefront,
  onOpenBuyerProfile,
  onNavigate,
  onOpenContactModal
}) => {
  const [threads, setThreads] = useState<NegotiationThread[]>(INITIAL_NEGOTIATION_ROOMS);
  const [activeThreadId, setActiveThreadId] = useState<string>(INITIAL_NEGOTIATION_ROOMS[0].id);
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'IN_PROGRESS' | 'AGREED' | 'FUNDS_LOCKED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileView, setMobileView] = useState<'ROOMS' | 'CHAT'>('ROOMS');
  
  // Active chat state
  const [replyText, setReplyText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingSender, setTypingSender] = useState('');
  
  // Counter offer state
  const [isCounterOfferOpen, setIsCounterOfferOpen] = useState(false);
  const [counterPriceUsd, setCounterPriceUsd] = useState<number>(0);
  const [counterQuantity, setCounterQuantity] = useState<number>(0);
  const [counterIncoterm, setCounterIncoterm] = useState<Incoterm>('CIF');
  const [counterPort, setCounterPort] = useState('');
  const [counterNotes, setCounterNotes] = useState('');

  // Modals state
  const [selectedThreadForPi, setSelectedThreadForPi] = useState<NegotiationThread | null>(null);
  const [isNewRoomModalOpen, setIsNewRoomModalOpen] = useState(false);

  // New room form state
  const [newProductTitle, setNewProductTitle] = useState('');
  const [newSupplierCompany, setNewSupplierCompany] = useState('');
  const [newSupplierName, setNewSupplierName] = useState('');
  const [newQuantity, setNewQuantity] = useState(100);
  const [newPriceUsd, setNewPriceUsd] = useState(50);
  const [newIncoterm, setNewIncoterm] = useState<Incoterm>('CIF');
  const [newPort, setNewPort] = useState('Hamburg Port');
  const [newInitialMessage, setNewInitialMessage] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeThread = threads.find(t => t.id === activeThreadId) || threads[0] || INITIAL_NEGOTIATION_ROOMS[0];
  const curr = CURRENCY_RATES.find(c => c.code === selectedCurrency) || CURRENCY_RATES[0];

  const formatPrice = (usd: number) => {
    const converted = usd * curr.rateToUSD;
    return `${curr.symbol}${converted.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Sync counter-offer form defaults when active thread changes
  useEffect(() => {
    if (activeThread) {
      setCounterPriceUsd(activeThread.currentPriceUsd || 100);
      setCounterQuantity(activeThread.orderQuantity || 100);
      setCounterIncoterm(activeThread.currentIncoterm || 'CIF');
      setCounterPort(activeThread.destinationPort || '');
      setCounterNotes('');
    }
  }, [activeThreadId]);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeThread?.messages, isTyping]);

  // Filter threads
  const filteredThreads = threads.filter(thread => {
    const matchesStatus = 
      filterStatus === 'ALL' ? true :
      filterStatus === 'FUNDS_LOCKED' ? thread.escrowStatus === 'FUNDS_LOCKED' :
      thread.status === filterStatus;

    const matchesSearch = 
      thread.productTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      thread.supplierCompany?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      thread.buyerCompany.toLowerCase().includes(searchQuery.toLowerCase()) ||
      thread.id.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  // Handle selecting a room
  const handleSelectRoom = (threadId: string) => {
    setActiveThreadId(threadId);
    setMobileView('CHAT');
  };

  // Handle sending message
  const handleSendMessage = (e?: React.FormEvent, customText?: string) => {
    if (e) e.preventDefault();
    const text = (customText || replyText).trim();
    if (!text && !counterPriceUsd) return;

    const senderBuyerName = currentUser?.name || activeThread.buyerName || 'Marcus Vance';
    const senderBuyerCompany = currentUser?.companyName || activeThread.buyerCompany || 'Enterprise Buyer';

    const newMsg: NegotiationMessage = {
      id: `msg-${Date.now()}`,
      senderRole: 'BUYER',
      senderName: senderBuyerName,
      senderCompany: senderBuyerCompany,
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedThreads = threads.map(t => {
      if (t.id === activeThread.id) {
        return {
          ...t,
          lastUpdated: 'Just now',
          messages: [...t.messages, newMsg]
        };
      }
      return t;
    });

    setThreads(updatedThreads);
    setReplyText('');

    // Trigger realistic automated supplier response
    simulateSupplierResponse(activeThread.id, text, activeThread.supplierName || 'Elena Zhao', activeThread.supplierCompany || 'Verified Manufacturer');
  };

  // Handle submitting formal counter-offer
  const handleProposeCounterOffer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!counterPriceUsd || counterPriceUsd <= 0) return;

    const senderBuyerName = currentUser?.name || activeThread.buyerName || 'Marcus Vance';
    const senderBuyerCompany = currentUser?.companyName || activeThread.buyerCompany || 'Enterprise Buyer';
    const totalProposalUsd = counterPriceUsd * (counterQuantity || activeThread.orderQuantity || 100);

    const counterMsg: NegotiationMessage = {
      id: `msg-${Date.now()}`,
      senderRole: 'BUYER',
      senderName: senderBuyerName,
      senderCompany: senderBuyerCompany,
      content: counterNotes || `Formal Counter-Offer submitted for ${counterQuantity.toLocaleString()} Units @ $${counterPriceUsd.toFixed(2)} USD (${counterIncoterm} ${counterPort}).`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      proposedPriceUsd: counterPriceUsd,
      proposedIncoterm: counterIncoterm,
      attachment: {
        type: 'COUNTER_OFFER',
        title: `Buyer Counter-Offer: $${counterPriceUsd.toFixed(2)} / Unit (${counterIncoterm})`,
        valueSummary: `Proposed Total: $${totalProposalUsd.toLocaleString()} USD | Destination: ${counterPort || activeThread.destinationPort}`
      }
    };

    const updatedThreads = threads.map(t => {
      if (t.id === activeThread.id) {
        return {
          ...t,
          currentPriceUsd: counterPriceUsd,
          orderQuantity: counterQuantity || t.orderQuantity,
          currentIncoterm: counterIncoterm,
          destinationPort: counterPort || t.destinationPort,
          lastUpdated: 'Just now',
          messages: [...t.messages, counterMsg]
        };
      }
      return t;
    });

    setThreads(updatedThreads);
    setIsCounterOfferOpen(false);
    setReplyText('');

    // Supplier response to counter-offer
    simulateSupplierCounterResponse(activeThread.id, counterPriceUsd, counterIncoterm);
  };

  // Simulate supplier intelligent response
  const simulateSupplierResponse = (threadId: string, buyerText: string, supName: string, supCompany: string) => {
    setIsTyping(true);
    setTypingSender(supName);

    setTimeout(() => {
      let replyContent = `Thank you for your message. We have noted your request regarding "${buyerText.slice(0, 40)}...". Our factory engineers and logistics desk are preparing the schedule update.`;
      
      const lower = buyerText.toLowerCase();
      if (lower.includes('discount') || lower.includes('price') || lower.includes('cheaper')) {
        replyContent = `We appreciate your volume inquiry. For orders above MOQ, we can offer an optimized tiered rate with Swiss Escrow trade protection included.`;
      } else if (lower.includes('cif') || lower.includes('fob') || lower.includes('shipping') || lower.includes('port')) {
        replyContent = `Confirmed. We work with Maersk, MSC, and COSCO for ocean container freight with full marine insurance coverage to your destination port.`;
      } else if (lower.includes('lead time') || lower.includes('production') || lower.includes('days') || lower.includes('delivery')) {
        replyContent = `Current factory production cycle is estimated at 20-25 business days upon receipt of the 30% Swiss Escrow deposit confirmation.`;
      } else if (lower.includes('certificate') || lower.includes('test') || lower.includes('inspection') || lower.includes('sgs')) {
        replyContent = `Full ISO9001, CE, and Mill Test Certificates (MTC) will be provided alongside third-party pre-shipment inspection by SGS/TÜV.`;
      } else if (lower.includes('lock') || lower.includes('agree') || lower.includes('proforma') || lower.includes('escrow')) {
        replyContent = `Excellent! We have updated the official Proforma Invoice. Please proceed with the Trade Protection Swiss Escrow deposit to lock container production.`;
      }

      const supMsg: NegotiationMessage = {
        id: `msg-sup-${Date.now()}`,
        senderRole: 'SUPPLIER',
        senderName: supName,
        senderCompany: supCompany,
        content: replyContent,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setThreads(prev => prev.map(t => {
        if (t.id === threadId) {
          return {
            ...t,
            lastUpdated: 'Just now',
            messages: [...t.messages, supMsg]
          };
        }
        return t;
      }));

      setIsTyping(false);
    }, 1400);
  };

  // Simulate supplier counter-offer response
  const simulateSupplierCounterResponse = (threadId: string, proposedPrice: number, proposedIncoterm: Incoterm) => {
    setIsTyping(true);
    setTypingSender(activeThread.supplierName || 'Elena Zhao');

    setTimeout(() => {
      const supMsg: NegotiationMessage = {
        id: `msg-sup-${Date.now()}`,
        senderRole: 'SUPPLIER',
        senderName: activeThread.supplierName || 'Elena Zhao',
        senderCompany: activeThread.supplierCompany || 'Verified Manufacturer',
        content: `We accept your proposed terms of $${proposedPrice.toFixed(2)} / Unit (${proposedIncoterm}). We have locked these terms and issued official Proforma Invoice PI-TH-${Date.now().toString().slice(-4)}-2026.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        attachment: {
          type: 'PROFORMA_INVOICE',
          title: `Proforma Invoice PI-TH-${Date.now().toString().slice(-4)}-2026.pdf`,
          valueSummary: `Terms Locked: $${proposedPrice.toFixed(2)}/Unit (${proposedIncoterm}) | Trade Protection Protected`
        }
      };

      setThreads(prev => prev.map(t => {
        if (t.id === threadId) {
          return {
            ...t,
            status: 'AGREED',
            agreedPriceUsd: proposedPrice,
            agreedIncoterm: proposedIncoterm,
            agreedQuantity: t.orderQuantity,
            lastUpdated: 'Just now',
            messages: [...t.messages, supMsg]
          };
        }
        return t;
      }));

      setIsTyping(false);
    }, 1800);
  };

  // Handle accepting terms and generating Proforma Invoice directly
  const handleAcceptTermsDirectly = () => {
    const agreedPrice = activeThread.currentPriceUsd || 100;
    const agreedQty = activeThread.orderQuantity || 100;
    const agreedInc = activeThread.currentIncoterm || 'CIF';

    const supMsg: NegotiationMessage = {
      id: `msg-sup-${Date.now()}`,
      senderRole: 'SUPPLIER',
      senderName: activeThread.supplierName || 'Elena Zhao',
      senderCompany: activeThread.supplierCompany || 'Verified Manufacturer',
      content: `Commercial terms have been officially accepted! Proforma Invoice PI-TH-${activeThread.id.slice(-4)}-2026 is generated and sealed. Swiss Escrow custody is ready for deposit funding.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      attachment: {
        type: 'PROFORMA_INVOICE',
        title: `Proforma Invoice PI-TH-${activeThread.id.slice(-4)}-2026.pdf`,
        valueSummary: `Agreed: ${formatPrice(agreedPrice * agreedQty)} (${agreedQty} Units @ ${formatPrice(agreedPrice)} ${agreedInc})`
      }
    };

    setThreads(prev => prev.map(t => {
      if (t.id === activeThread.id) {
        return {
          ...t,
          status: 'AGREED',
          agreedPriceUsd: agreedPrice,
          agreedQuantity: agreedQty,
          agreedIncoterm: agreedInc,
          lastUpdated: 'Just now',
          messages: [...t.messages, supMsg]
        };
      }
      return t;
    }));
  };

  // Handle creating a new negotiation room
  const handleCreateNewRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductTitle.trim()) return;

    const newId = `thread-${Date.now().toString().slice(-4)}`;
    const newRoom: NegotiationThread = {
      id: newId,
      productTitle: newProductTitle.trim(),
      buyerCompany: currentUser?.companyName || 'Enterprise Procurement Corp',
      buyerName: currentUser?.name || 'Procurement Director',
      supplierCompany: newSupplierCompany.trim() || 'Global Verified Manufacturer Ltd.',
      supplierName: newSupplierName.trim() || 'Export Sales Director',
      currentPriceUsd: newPriceUsd || 100,
      orderQuantity: newQuantity || 100,
      currentIncoterm: newIncoterm || 'CIF',
      destinationPort: newPort || 'Hamburg Port',
      status: 'IN_PROGRESS',
      escrowStatus: 'NONE',
      lastUpdated: 'Just now',
      messages: [
        {
          id: `msg-init-${Date.now()}`,
          senderRole: 'BUYER',
          senderName: currentUser?.name || 'Procurement Director',
          senderCompany: currentUser?.companyName || 'Enterprise Procurement Corp',
          content: newInitialMessage.trim() || `Inquiry initiated for ${newQuantity.toLocaleString()} Units of ${newProductTitle} at target rate $${newPriceUsd}/Unit (${newIncoterm} ${newPort}).`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          proposedPriceUsd: newPriceUsd,
          proposedIncoterm: newIncoterm
        }
      ]
    };

    setThreads([newRoom, ...threads]);
    setActiveThreadId(newId);
    setIsNewRoomModalOpen(false);
    setMobileView('CHAT');

    // Reset form
    setNewProductTitle('');
    setNewSupplierCompany('');
    setNewSupplierName('');
    setNewInitialMessage('');
  };

  // Quick Action Reply Prompts
  const quickActions = [
    { label: '💸 5% Volume Discount', text: 'Can you offer a 5% volume discount if we increase the order volume to 2x capacity?' },
    { label: '🚢 Confirm CIF Terms', text: 'Please confirm CIF shipping terms with comprehensive marine insurance to our destination port.' },
    { label: '📜 Request Mill Test / SGS', text: 'Please provide the latest Mill Test Certificate (MTC) and third-party SGS inspection audit report.' },
    { label: '⏱️ Production Lead Time', text: 'What is the guaranteed production lead time upon Swiss Escrow deposit confirmation?' },
    { label: '🔒 Ready for Escrow', text: 'Terms look agreed. Please generate the final Proforma Invoice so we can lock Swiss Escrow deposit.' }
  ];

  return (
    <div id="negotiation-room-hub" className="space-y-6 animate-fadeIn text-slate-900">
      
      {/* Top Banner & Control Bar */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-7 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-black border border-blue-200">
              <Lock className="w-3.5 h-3.5" />
              <span>Encrypted B2B Commercial Negotiation &amp; Swiss Escrow Desk</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Trade Negotiation Hub &amp; Proforma Desk
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl font-normal leading-relaxed">
              Negotiate tiered volume pricing, Incoterms (FOB/CIF/DDP), and delivery milestones directly with verified factory export directors. Issue legally binding Proforma Invoices backed by 100% Swiss Escrow capital protection.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => setIsNewRoomModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>New Negotiation Room</span>
            </button>

            <a
              href={`${OFFICIAL_WHATSAPP_DATA.url}&text=${encodeURIComponent(`Hello Trade Heaven Mediation Desk, I need assistance with Commercial Negotiation Room #${activeThread.id} for ${activeThread.productTitle}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm shrink-0"
              title="Connect with TradeHeaven Official WhatsApp Mediation Desk"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Live WhatsApp Desk</span>
            </a>
          </div>
        </div>

        {/* Status Filters & Search Bar */}
        <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 sm:pb-0">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3" /> Filter:
            </span>
            {[
              { key: 'ALL', label: `All (${threads.length})` },
              { key: 'IN_PROGRESS', label: `Active (${threads.filter(t => t.status === 'IN_PROGRESS').length})` },
              { key: 'AGREED', label: `Agreed / P/I (${threads.filter(t => t.status === 'AGREED').length})` },
              { key: 'FUNDS_LOCKED', label: `Escrow Funded (${threads.filter(t => t.escrowStatus === 'FUNDS_LOCKED').length})` }
            ].map(tab => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setFilterStatus(tab.key as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  filterStatus === tab.key
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search product, room ID, supplier..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white"
            />
            {searchQuery && (
              <button 
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Negotiation Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Rooms Directory (Hidden on mobile when chat is active) */}
        <div className={`lg:col-span-4 space-y-3 ${mobileView === 'CHAT' ? 'hidden lg:block' : 'block'}`}>
          <div className="flex items-center justify-between px-2">
            <span className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
              Negotiation Rooms ({filteredThreads.length})
            </span>
            <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Sync
            </span>
          </div>

          <div className="space-y-3 max-h-[720px] overflow-y-auto pr-1">
            {filteredThreads.length === 0 ? (
              <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-8 text-center text-slate-500 space-y-2">
                <AlertCircle className="w-8 h-8 mx-auto text-slate-400" />
                <p className="text-xs font-bold text-slate-700">No negotiation rooms found</p>
                <p className="text-[11px] text-slate-500">Try adjusting your filter or search criteria.</p>
                <button
                  type="button"
                  onClick={() => { setFilterStatus('ALL'); setSearchQuery(''); }}
                  className="mt-2 text-xs text-blue-600 font-bold underline cursor-pointer"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              filteredThreads.map(thread => {
                const isSelected = thread.id === activeThread?.id;
                const msgs = thread?.messages || [];
                const lastMessage = msgs[msgs.length - 1];
                const totalValueUsd = (thread.agreedPriceUsd || thread.currentPriceUsd || 100) * (thread.orderQuantity || 100);

                return (
                  <div
                    key={thread.id}
                    onClick={() => handleSelectRoom(thread.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer relative group ${
                      isSelected
                        ? 'bg-blue-50/80 border-blue-500 shadow-md ring-2 ring-blue-500/20'
                        : 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-xs'
                    }`}
                  >
                    {/* Status Badges */}
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${
                          thread.status === 'AGREED' 
                            ? 'bg-emerald-100 text-emerald-900 border-emerald-300' 
                            : 'bg-amber-100 text-amber-900 border-amber-300'
                        }`}>
                          {thread.status === 'AGREED' ? 'Terms Agreed' : 'Negotiating'}
                        </span>

                        {thread.escrowStatus === 'FUNDS_LOCKED' && (
                          <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-blue-100 text-blue-900 border border-blue-300 flex items-center gap-0.5">
                            <ShieldCheck className="w-2.5 h-2.5" /> Escrow Locked
                          </span>
                        )}

                        <span className="text-[10px] font-mono font-bold text-slate-500">
                          {thread.agreedIncoterm || thread.currentIncoterm || 'CIF'}
                        </span>
                      </div>

                      <span className="text-[10px] text-slate-400 font-mono">
                        {thread.lastUpdated || 'Active'}
                      </span>
                    </div>

                    {/* Product Title */}
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
                      {thread.productTitle}
                    </h4>

                    {/* Counterpart Info */}
                    <div className="mt-1 flex items-center justify-between text-xs text-slate-600">
                      <div className="flex items-center gap-1 truncate max-w-[180px]">
                        <Building className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">{thread.supplierCompany}</span>
                      </div>

                      <div className="font-mono font-bold text-slate-900 text-right">
                        {formatPrice(totalValueUsd)}
                      </div>
                    </div>

                    {/* Last Snippet */}
                    <div className="mt-2.5 pt-2 border-t border-slate-200/80 text-[11px] text-slate-500 flex items-center justify-between gap-2">
                      <p className="truncate italic flex-1">
                        "{lastMessage?.content || 'No messages yet'}"
                      </p>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Active Conversation & Commercial Term Sheet */}
        <div className={`lg:col-span-8 space-y-4 ${mobileView === 'ROOMS' ? 'hidden lg:block' : 'block'}`}>
          {activeThread ? (
            <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm flex flex-col">
              
              {/* Active Room Header */}
              <div className="bg-slate-900 text-white p-5 sm:p-6 border-b border-slate-800">
                
                {/* Mobile Back Button */}
                <div className="flex lg:hidden items-center justify-between pb-3 mb-3 border-b border-slate-800">
                  <button
                    type="button"
                    onClick={() => setMobileView('ROOMS')}
                    className="flex items-center gap-1.5 text-xs font-bold text-blue-400 hover:text-blue-300 cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>All Negotiation Rooms ({threads.length})</span>
                  </button>
                  <span className="text-[10px] text-slate-400 font-mono">Room #{activeThread.id}</span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="text-xs text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      Active Commercial Negotiation • Room #{activeThread.id}
                      {activeThread.status === 'AGREED' && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-black border border-emerald-500/30">
                          Terms Agreed
                        </span>
                      )}
                    </div>
                    <h2 className="text-lg sm:text-xl font-black text-white leading-tight">
                      {activeThread.productTitle}
                    </h2>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300 pt-0.5">
                      <span>Buyer: <strong>{activeThread.buyerCompany}</strong></span>
                      <span>•</span>
                      <span>Supplier: <strong>{activeThread.supplierCompany}</strong></span>
                      <span>•</span>
                      <span className="text-blue-300 font-mono">Dest: {activeThread.destinationPort || 'Hamburg'}</span>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/15 shrink-0">
                    <div className="text-left sm:text-right">
                      <div className="text-[10px] text-slate-300 uppercase font-bold">Total Contract Value</div>
                      <div className="text-lg sm:text-xl font-black text-emerald-400 font-mono">
                        {formatPrice((activeThread.agreedPriceUsd || activeThread.currentPriceUsd || 100) * (activeThread.orderQuantity || 100))}
                      </div>
                    </div>
                    <div className="text-[10px] text-slate-300 font-mono text-right">
                      {formatPrice(activeThread.agreedPriceUsd || activeThread.currentPriceUsd || 100)} / Unit ({activeThread.agreedIncoterm || activeThread.currentIncoterm || 'CIF'})
                    </div>
                  </div>
                </div>

                {/* Quick Action Bar in Header */}
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedThreadForPi(activeThread)}
                      className="px-3 py-1.5 rounded-xl bg-blue-600/80 hover:bg-blue-600 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>View Proforma Invoice (P/I)</span>
                    </button>

                    {activeThread.status !== 'AGREED' && (
                      <button
                        type="button"
                        onClick={handleAcceptTermsDirectly}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600/80 hover:bg-emerald-600 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Accept Supplier Terms</span>
                      </button>
                    )}
                  </div>

                  <a
                    href={`${OFFICIAL_WHATSAPP_DATA.url}&text=${encodeURIComponent(`Trade Heaven Mediation: Room ${activeThread.id} for ${activeThread.productTitle}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-300 hover:text-emerald-400 flex items-center gap-1.5 transition-colors text-xs font-semibold"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
                    <span>Mediation Support</span>
                  </a>
                </div>
              </div>

              {/* Chat Thread Messages View */}
              <div 
                ref={chatContainerRef}
                className="p-4 sm:p-6 space-y-4 max-h-[460px] min-h-[300px] overflow-y-auto bg-slate-50 border-b border-slate-200"
              >
                {/* Security Anchor Notice */}
                <div className="flex items-center justify-center my-2">
                  <div className="px-3.5 py-1.5 rounded-full bg-slate-200/80 text-slate-600 text-[11px] font-semibold flex items-center gap-1.5 shadow-2xs">
                    <Lock className="w-3 h-3 text-emerald-600" />
                    <span>256-Bit Encrypted B2B Negotiation Room • Legally Binding Record</span>
                  </div>
                </div>

                {(activeThread?.messages || []).map((msg, idx) => {
                  const isBuyer = msg.senderRole === 'BUYER';
                  return (
                    <div
                      key={msg.id || idx}
                      className={`flex flex-col ${isBuyer ? 'items-end' : 'items-start'} animate-fadeIn`}
                    >
                      {/* Sender meta */}
                      <div className="flex items-center gap-2 text-[10px] text-slate-500 mb-1 px-1">
                        <span className="font-bold text-slate-700">
                          {msg.senderName} ({msg.senderCompany || (isBuyer ? 'Buyer' : 'Supplier')})
                        </span>
                        <span>•</span>
                        <span className="font-mono">{msg.timestamp}</span>
                      </div>

                      {/* Message Bubble */}
                      <div
                        className={`p-4 rounded-2xl max-w-lg text-xs leading-relaxed shadow-xs ${
                          isBuyer
                            ? 'bg-blue-600 text-white rounded-tr-xs'
                            : 'bg-white text-slate-900 border border-slate-200 rounded-tl-xs'
                        }`}
                      >
                        {msg.content && <p className="whitespace-pre-line">{msg.content}</p>}

                        {/* Price Proposal Highlight */}
                        {msg.proposedPriceUsd && (
                          <div className={`mt-2.5 p-2.5 rounded-xl border text-[11px] font-mono font-bold flex items-center justify-between ${
                            isBuyer 
                              ? 'bg-blue-700/80 border-blue-500 text-amber-300' 
                              : 'bg-emerald-50 border-emerald-300 text-emerald-900'
                          }`}>
                            <span className="flex items-center gap-1">
                              <DollarSign className="w-3.5 h-3.5" /> Formal Proposal:
                            </span>
                            <span>
                              {formatPrice(msg.proposedPriceUsd)} / Unit ({msg.proposedIncoterm || activeThread.currentIncoterm || 'CIF'})
                            </span>
                          </div>
                        )}

                        {/* Attachment Card */}
                        {msg.attachment && (
                          <div className={`mt-3 p-3 rounded-xl border flex items-center justify-between gap-3 ${
                            isBuyer 
                              ? 'bg-blue-700/90 border-blue-400 text-white' 
                              : 'bg-slate-50 border-slate-200 text-slate-900'
                          }`}>
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className={`p-2 rounded-lg ${isBuyer ? 'bg-blue-800 text-amber-300' : 'bg-blue-100 text-blue-700'} shrink-0`}>
                                <FileText className="w-4 h-4" />
                              </div>
                              <div className="min-w-0">
                                <div className="font-bold text-xs truncate">{msg.attachment.title}</div>
                                {msg.attachment.valueSummary && (
                                  <div className={`text-[10px] truncate ${isBuyer ? 'text-blue-200' : 'text-slate-500'}`}>
                                    {msg.attachment.valueSummary}
                                  </div>
                                )}
                              </div>
                            </div>

                            {msg.attachment.type === 'PROFORMA_INVOICE' ? (
                              <button
                                type="button"
                                onClick={() => setSelectedThreadForPi(activeThread)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 flex items-center gap-1 transition-colors cursor-pointer ${
                                  isBuyer ? 'bg-white text-blue-900 hover:bg-blue-50' : 'bg-blue-600 text-white hover:bg-blue-700'
                                }`}
                              >
                                <Eye className="w-3 h-3" />
                                <span>Inspect</span>
                              </button>
                            ) : msg.attachment.type === 'COUNTER_OFFER' ? (
                              <button
                                type="button"
                                onClick={() => setIsCounterOfferOpen(true)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 flex items-center gap-1 transition-colors cursor-pointer ${
                                  isBuyer ? 'bg-white text-blue-900 hover:bg-blue-50' : 'bg-emerald-600 text-white hover:bg-emerald-700'
                                }`}
                              >
                                <Sliders className="w-3 h-3" />
                                <span>Negotiate</span>
                              </button>
                            ) : null}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Typing Indicator */}
                {isTyping && (
                  <div className="flex flex-col items-start animate-fadeIn">
                    <div className="text-[10px] text-slate-500 mb-1 px-1 flex items-center gap-1.5">
                      <span className="font-bold text-blue-600">{typingSender || 'Supplier'}</span> is drafting commercial response...
                    </div>
                    <div className="px-4 py-3 rounded-2xl bg-white border border-slate-200 rounded-tl-xs flex items-center gap-1.5 shadow-xs">
                      <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce"></span>
                      <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce [animation-delay:0.2s]"></span>
                      <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce [animation-delay:0.4s]"></span>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Quick Action Reply Chips */}
              <div className="px-4 py-2 bg-slate-100/70 border-b border-slate-200 overflow-x-auto flex items-center gap-2 text-xs">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider shrink-0 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-500" /> Quick Prompts:
                </span>
                {quickActions.map((action, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendMessage(undefined, action.text)}
                    className="px-2.5 py-1 rounded-xl bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 hover:border-blue-300 font-medium text-[11px] whitespace-nowrap transition-all shadow-2xs cursor-pointer"
                  >
                    {action.label}
                  </button>
                ))}
              </div>

              {/* Counter-Offer Proposal Drawer */}
              {isCounterOfferOpen && (
                <div className="p-4 sm:p-5 bg-amber-50/50 border-b border-amber-200 space-y-4 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-amber-700" />
                      <h4 className="text-xs font-black text-amber-950 uppercase tracking-wider">
                        Propose Formal Counter-Offer Terms
                      </h4>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsCounterOfferOpen(false)}
                      className="p-1 rounded-lg hover:bg-amber-100 text-amber-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <form onSubmit={handleProposeCounterOffer} className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[10px] text-slate-600 font-bold uppercase mb-1">
                          Target Price (USD/Unit) *
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          required
                          value={counterPriceUsd || ''}
                          onChange={e => setCounterPriceUsd(parseFloat(e.target.value) || 0)}
                          className="w-full bg-white border border-amber-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-amber-500"
                          placeholder="e.g. 660.00"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] text-slate-600 font-bold uppercase mb-1">
                          Order Quantity (Units)
                        </label>
                        <input
                          type="number"
                          value={counterQuantity || ''}
                          onChange={e => setCounterQuantity(parseInt(e.target.value, 10) || 0)}
                          className="w-full bg-white border border-amber-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-amber-500"
                          placeholder="e.g. 500"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] text-slate-600 font-bold uppercase mb-1">
                          Trade Incoterm
                        </label>
                        <select
                          value={counterIncoterm}
                          onChange={e => setCounterIncoterm(e.target.value as Incoterm)}
                          className="w-full bg-white border border-amber-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-amber-500 cursor-pointer"
                        >
                          <option value="CIF">CIF (Cost, Insurance & Freight)</option>
                          <option value="FOB">FOB (Free On Board)</option>
                          <option value="DDP">DDP (Delivered Duty Paid)</option>
                          <option value="CFR">CFR (Cost & Freight)</option>
                          <option value="EXW">EXW (Ex Works)</option>
                          <option value="FCA">FCA (Free Carrier)</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] text-slate-600 font-bold uppercase mb-1">
                          Destination Port / City
                        </label>
                        <input
                          type="text"
                          value={counterPort}
                          onChange={e => setCounterPort(e.target.value)}
                          className="w-full bg-white border border-amber-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                          placeholder="e.g. Gothenburg Port, Sweden"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] text-slate-600 font-bold uppercase mb-1">
                          Special Requirements / Notes
                        </label>
                        <input
                          type="text"
                          value={counterNotes}
                          onChange={e => setCounterNotes(e.target.value)}
                          className="w-full bg-white border border-amber-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                          placeholder="e.g. Include 2% spare BMS boards and marine insurance"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <div className="text-xs text-slate-600">
                        Total Counter Value: <span className="font-mono font-bold text-emerald-700">{formatPrice(counterPriceUsd * (counterQuantity || activeThread.orderQuantity || 100))}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setIsCounterOfferOpen(false)}
                          className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-black flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Dispatch Counter-Offer</span>
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              )}

              {/* Chat Input & Action Bar */}
              <div className="p-4 sm:p-5 bg-white space-y-3">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Type message, legal packaging requirement, or shipping instruction..."
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                  />

                  <button
                    type="button"
                    onClick={() => setIsCounterOfferOpen(!isCounterOfferOpen)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                      isCounterOfferOpen 
                        ? 'bg-amber-100 border-amber-300 text-amber-900' 
                        : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                    }`}
                    title="Open Counter-Offer Form"
                  >
                    <Sliders className="w-3.5 h-3.5 text-amber-600" />
                    <span className="hidden sm:inline">Counter-Offer</span>
                  </button>

                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm cursor-pointer shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send</span>
                  </button>
                </form>

                {/* Final Trade Protection & Escrow Action Footer */}
                <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Swiss Escrow protects your deposit until verified delivery &amp; quality compliance.</span>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => setSelectedThreadForPi(activeThread)}
                      className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5 text-blue-600" />
                      <span>Proforma (P/I)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onInitiateEscrow(activeThread)}
                      className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Lock Escrow Deposit</span>
                    </button>
                  </div>
                </div>
              </div>

            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center text-slate-500 space-y-3">
              <MessageSquare className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">Select a Negotiation Room</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Choose an active commercial conversation from the left to view messages, negotiate Incoterms, and dispatch verified Proforma Invoices.
              </p>
            </div>
          )}
        </div>

      </div>

      {/* Proforma Invoice Modal */}
      {selectedThreadForPi && (
        <ProformaInvoiceModal
          thread={selectedThreadForPi}
          selectedCurrency={selectedCurrency}
          onClose={() => setSelectedThreadForPi(null)}
          onProceedToEscrow={(t) => {
            setSelectedThreadForPi(null);
            onInitiateEscrow(t);
          }}
        />
      )}

      {/* New Negotiation Room Creation Modal */}
      {isNewRoomModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative text-slate-900 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-blue-50 text-blue-600">
                  <Plus className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-black text-slate-900 text-base">Start New Negotiation Room</h3>
                  <p className="text-xs text-slate-500">Initiate direct trade channel with verified factory</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsNewRoomModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNewRoom} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Product / Commodity Title *
                </label>
                <input
                  type="text"
                  required
                  value={newProductTitle}
                  onChange={e => setNewProductTitle(e.target.value)}
                  placeholder="e.g. 5.12kWh LiFePO4 Server Batteries or Organic Cotton Yarn"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Supplier / Factory Company
                  </label>
                  <input
                    type="text"
                    value={newSupplierCompany}
                    onChange={e => setNewSupplierCompany(e.target.value)}
                    placeholder="e.g. ApexPower Energy Tech Co."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Contact Person / Title
                  </label>
                  <input
                    type="text"
                    value={newSupplierName}
                    onChange={e => setNewSupplierName(e.target.value)}
                    placeholder="e.g. Elena Zhao (Sales VP)"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Order Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newQuantity}
                    onChange={e => setNewQuantity(parseInt(e.target.value, 10) || 1)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Target Rate (USD)
                  </label>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={newPriceUsd}
                    onChange={e => setNewPriceUsd(parseFloat(e.target.value) || 1)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Incoterm
                  </label>
                  <select
                    value={newIncoterm}
                    onChange={e => setNewIncoterm(e.target.value as Incoterm)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white cursor-pointer"
                  >
                    <option value="CIF">CIF</option>
                    <option value="FOB">FOB</option>
                    <option value="DDP">DDP</option>
                    <option value="CFR">CFR</option>
                    <option value="EXW">EXW</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Destination Port / City
                </label>
                <input
                  type="text"
                  value={newPort}
                  onChange={e => setNewPort(e.target.value)}
                  placeholder="e.g. Gothenburg Port or Rotterdam Port"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Opening Commercial Message
                </label>
                <textarea
                  rows={3}
                  value={newInitialMessage}
                  onChange={e => setNewInitialMessage(e.target.value)}
                  placeholder="State your technical specifications, volume roadmap, and required certifications..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewRoomModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Launch Negotiation Room</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
