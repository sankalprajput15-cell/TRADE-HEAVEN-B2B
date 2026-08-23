import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageCircle, 
  Send, 
  Bot, 
  X, 
  Minimize2, 
  Maximize2, 
  Headphones, 
  ShieldCheck, 
  ExternalLink, 
  User, 
  RefreshCw, 
  Check, 
  CornerDownLeft,
  ChevronDown,
  HelpCircle,
  Clock,
  PhoneCall,
  Globe2,
  Lock,
  Mail,
  MessageSquare
} from 'lucide-react';
import { api } from '../../services/apiService';
import { AuthUser } from '../../types';
import { OFFICIAL_WHATSAPP_DATA } from './TradeHeavenSocialBar';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai' | 'system';
  text: string;
  timestamp: string;
  senderName?: string;
  isStreaming?: boolean;
}

interface Props {
  currentUser?: AuthUser | null;
  defaultOpen?: boolean;
  onOpenRfqModal?: () => void;
  onOpenStorefront?: (companyId: string) => void;
  onOpenContactModal?: () => void;
}

const QUICK_PROMPTS = [
  "Submit ticket to help@tradeheaven.net",
  "Connect with trade specialist on WhatsApp (+91 8532934479)",
  "How do I submit an RFQ to get factory quotes?",
  "How does Trade Assurance Escrow protect my deposit?",
  "What is the difference between FOB and CIF shipping?"
];

export const TradeHeavenLiveChatWidget: React.FC<Props> = ({
  currentUser,
  defaultOpen = false,
  onOpenRfqModal,
  onOpenStorefront,
  onOpenContactModal
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [isMinimized, setIsMinimized] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [guestName, setGuestName] = useState<string>('');
  const [isEditingGuestName, setIsEditingGuestName] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Initialize messages
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'ai',
      senderName: 'Trade Heaven Concierge',
      text: `👋 **Welcome to Trade Heaven Global Trade Desk!**\n\nI am your 24/7 **Trade Concierge & Sourcing Specialist**.\n\nYou can ask about products, check verified factory suppliers, calculate shipping, or get assistance anytime without logging in.\n\n• **Direct Factory Sourcing:** 480,000+ audited manufacturers\n• **Instant RFQs:** Post buying requirements for free quotes\n• **Trade Assurance Escrow:** 100% capital protection\n• **Official WhatsApp Desk:** Connect directly at **+91 8532934479**`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom();
    }
  }, [messages, isOpen, isMinimized, isLoading]);

  useEffect(() => {
    if (!isOpen && messages.length > 1) {
      setUnreadCount(prev => prev + 1);
    }
  }, [messages]);

  const effectiveSenderName = currentUser?.name || guestName.trim() || 'Guest Trader';

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputMessage).trim();
    if (!query || isLoading) return;

    const userMsgId = 'msg-' + Date.now();
    const userMsg: ChatMessage = {
      id: userMsgId,
      sender: 'user',
      senderName: effectiveSenderName,
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Build conversation history
      const historyPayload = messages
        .filter(m => m.sender === 'user' || m.sender === 'ai')
        .slice(-6)
        .map(m => ({
          role: m.sender === 'user' ? ('user' as const) : ('model' as const),
          text: m.text
        }));

      const res = await api.sendAiChatMessage({
        message: query,
        history: historyPayload,
        senderName: effectiveSenderName,
        senderEmail: currentUser?.email,
        userRole: currentUser?.role || 'GUEST'
      });

      const aiReplyText = res.reply || "Thank you for reaching out! Our trade desk is reviewing your inquiry. You can also message us directly on WhatsApp at +91 8532934479.";

      const aiMsg: ChatMessage = {
        id: 'msg-ai-' + Date.now(),
        sender: 'ai',
        senderName: res.poweredBy || 'AI Trade Concierge',
        text: aiReplyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (err: any) {
      const fallbackAiMsg: ChatMessage = {
        id: 'msg-ai-err-' + Date.now(),
        sender: 'ai',
        senderName: 'AI Trade Concierge',
        text: `Thank you for your message! You can chat directly with our trade coordinators on WhatsApp at **+91 8532934479** for instant quotations and supplier verification.\n\n[Open WhatsApp Live Chat](${OFFICIAL_WHATSAPP_DATA.url})`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, fallbackAiMsg]);
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 'welcome-cleared',
        sender: 'ai',
        senderName: 'AI Trade Concierge',
        text: `Chat history cleared. I'm ready for your next question! You can ask about products, RFQs, suppliers, or connect via WhatsApp (+91 8532934479).`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  // Format markdown-like bold text & links
  const renderMessageContent = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, lineIdx) => {
      // Check for bullet lines
      const isBullet = line.trim().startsWith('•') || line.trim().startsWith('-');
      const formattedText = line.replace(/^[•-]\s*/, '');

      // Replace bold **words**
      const parts = formattedText.split(/(\*\*.*?\*\*|\[.*?\]\(.*?\))/g);

      return (
        <div key={lineIdx} className={`${isBullet ? 'flex items-start gap-1.5 ml-1 my-0.5' : 'my-1'}`}>
          {isBullet && <span className="text-amber-500 font-bold shrink-0">•</span>}
          <div className="flex-1 leading-relaxed">
            {parts.map((part, pIdx) => {
              if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={pIdx} className="font-bold text-slate-900">{part.slice(2, -2)}</strong>;
              }
              // Markdown link [text](url)
              const linkMatch = part.match(/^\[(.*?)\]\((.*?)\)$/);
              if (linkMatch) {
                const linkTitle = linkMatch[1];
                const linkHref = linkMatch[2];
                const isWhatsAppLink = linkHref.includes('wa.me') || linkHref.includes('whatsapp');

                return (
                  <a
                    key={pIdx}
                    href={linkHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center gap-1 font-bold underline px-1.5 py-0.5 rounded text-xs transition-colors ${
                      isWhatsAppLink 
                        ? 'bg-emerald-500 text-white hover:bg-emerald-600 no-underline shadow-2xs' 
                        : 'text-blue-600 hover:text-blue-800'
                    }`}
                  >
                    {isWhatsAppLink && <MessageCircle className="w-3 h-3" />}
                    <span>{linkTitle}</span>
                    <ExternalLink className="w-2.5 h-2.5 opacity-70" />
                  </a>
                );
              }
              return <span key={pIdx}>{part}</span>;
            })}
          </div>
        </div>
      );
    });
  };

  return (
    <div id="trade-heaven-live-chat-root" className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end pointer-events-none">
      
      {/* 1. CHAT WINDOW (WHEN EXPANDED) */}
      {isOpen && (
        <div 
          className={`pointer-events-auto bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden transition-all duration-300 w-[92vw] sm:w-[420px] mb-3 ${
            isMinimized ? 'h-14' : 'h-[580px] max-h-[85vh]'
          }`}
          style={{ boxShadow: '0 20px 40px -10px rgba(15, 23, 42, 0.25), 0 0 0 1px rgba(15, 23, 42, 0.08)' }}
        >
          {/* HEADER */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white px-4 py-3 flex items-center justify-between shrink-0 shadow-md">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-black shadow-sm">
                  <Headphones className="w-5 h-5 text-slate-950" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-900 animate-pulse"></span>
              </div>
              
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-xs sm:text-sm font-black text-white truncate">
                    Trade Heaven Global Desk
                  </h3>
                  <span className="bg-emerald-500/20 text-emerald-300 text-[9px] font-bold px-1.5 py-0.2 rounded border border-emerald-500/30 uppercase">
                    Live
                  </span>
                </div>
                <p className="text-[10px] text-slate-300 truncate flex items-center gap-1">
                  <span>24/7 Verified Sourcing Concierge</span>
                </p>
              </div>
            </div>

            {/* Header Controls */}
            <div className="flex items-center gap-1 shrink-0">
              {/* Direct WhatsApp Quick Header Button */}
              <a
                href={OFFICIAL_WHATSAPP_DATA.url}
                target="_blank"
                rel="noopener noreferrer"
                title={`Open Official WhatsApp (+91 8532934479)`}
                className="p-1.5 rounded-lg bg-emerald-600/90 hover:bg-emerald-500 text-white text-[11px] font-bold flex items-center gap-1 transition-all shadow-xs cursor-pointer"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span className="hidden sm:inline text-[10px]">WhatsApp</span>
              </a>

              {/* Minimize */}
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
                title={isMinimized ? "Expand Chat" : "Minimize Chat"}
              >
                {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
              </button>

              {/* Close */}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
                title="Close Chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* CHAT BODY (HIDDEN WHEN MINIMIZED) */}
          {!isMinimized && (
            <>
              {/* TOP ANONYMOUS GUEST & WHATSAPP STRIP */}
              <div className="bg-slate-50 border-b border-slate-200 px-3.5 py-2 flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-1.5 text-slate-600 min-w-0">
                  <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  {isEditingGuestName ? (
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        value={guestName}
                        onChange={e => setGuestName(e.target.value)}
                        placeholder="Your name or company"
                        className="text-[11px] border border-slate-300 rounded px-1.5 py-0.5 bg-white focus:outline-none focus:border-blue-500 w-32"
                        onKeyDown={e => e.key === 'Enter' && setIsEditingGuestName(false)}
                        autoFocus
                      />
                      <button
                        onClick={() => setIsEditingGuestName(false)}
                        className="text-[10px] bg-blue-600 text-white px-1.5 py-0.5 rounded font-bold cursor-pointer"
                      >
                        Set
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 truncate">
                      <span className="text-[11px] font-semibold text-slate-800 truncate">
                        {effectiveSenderName}
                      </span>
                      {!currentUser && (
                        <button
                          onClick={() => setIsEditingGuestName(true)}
                          className="text-[10px] text-blue-600 hover:underline shrink-0 ml-1 cursor-pointer"
                          title="Optional: Add your name"
                        >
                          (edit)
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Clear Chat, Email Support, and WhatsApp link */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {onOpenContactModal && (
                    <button
                      onClick={onOpenContactModal}
                      className="text-[10px] text-blue-700 hover:text-blue-800 font-bold flex items-center gap-1 bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded-full border border-blue-200 transition-colors cursor-pointer"
                      title="Submit Ticket to help@tradeheaven.net"
                    >
                      <Mail className="w-2.5 h-2.5" />
                      <span className="hidden sm:inline">Ticket</span>
                    </button>
                  )}
                  <a
                    href={OFFICIAL_WHATSAPP_DATA.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200"
                  >
                    <span>+91 8532934479</span>
                    <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                  </a>
                  <button
                    onClick={handleClearChat}
                    className="text-slate-400 hover:text-slate-600 p-1 rounded transition-colors cursor-pointer"
                    title="Clear Chat History"
                  >
                    <RefreshCw className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* MESSAGES SCROLL AREA */}
              <div className="flex-1 overflow-y-auto p-3.5 space-y-3 bg-gradient-to-b from-slate-50/50 to-white text-xs">
                {messages.map(msg => {
                  const isUser = msg.sender === 'user';
                  return (
                    <div
                      key={msg.id}
                      className={`flex gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}
                    >
                      {!isUser && (
                        <div className="w-7 h-7 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                          <Bot className="w-4 h-4" />
                        </div>
                      )}

                      <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs shadow-2xs ${
                        isUser
                          ? 'bg-blue-600 text-white rounded-tr-xs'
                          : 'bg-white text-slate-800 border border-slate-200/90 rounded-tl-xs'
                      }`}>
                        {/* Sender Label */}
                        {!isUser && (
                          <div className="flex items-center justify-between gap-2 pb-1 border-b border-slate-100 mb-1.5">
                            <span className="font-bold text-[10px] text-slate-900 flex items-center gap-1">
                              <Bot className="w-3 h-3 text-amber-500" />
                              <span>{msg.senderName || 'Trade Desk Assistant'}</span>
                            </span>
                            <span className="text-[9px] text-slate-400 font-mono">
                              {msg.timestamp}
                            </span>
                          </div>
                        )}

                        {/* Content */}
                        <div className="text-xs leading-relaxed break-words">
                          {renderMessageContent(msg.text)}
                        </div>

                        {/* Direct WhatsApp Callout Card inside AI message */}
                        {!isUser && msg.text.includes('+91 8532934479') && (
                          <div className="mt-2.5 p-2 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5">
                              <div className="w-6 h-6 rounded-lg bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-2xs">
                                <MessageCircle className="w-3.5 h-3.5" />
                              </div>
                              <div>
                                <div className="text-[10px] font-bold text-emerald-950">WhatsApp Trade Desk</div>
                                <div className="text-[9px] text-emerald-700 font-mono">+91 8532934479</div>
                              </div>
                            </div>
                            <a
                              href={OFFICIAL_WHATSAPP_DATA.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] flex items-center gap-1 transition-colors shrink-0 shadow-2xs"
                            >
                              <span>Chat Now</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          </div>
                        )}

                        {isUser && (
                          <div className="text-[9px] text-blue-200 text-right mt-1 font-mono">
                            {msg.timestamp}
                          </div>
                        )}
                      </div>

                      {isUser && (
                        <div className="w-7 h-7 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs font-bold text-[11px]">
                          {effectiveSenderName.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Typing Indicator */}
                {isLoading && (
                  <div className="flex gap-2 justify-start items-center text-xs text-slate-500">
                    <div className="w-7 h-7 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center shrink-0 shadow-2xs">
                      <Bot className="w-3.5 h-3.5 animate-pulse" />
                    </div>
                    <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-xs px-3 py-2 flex items-center gap-1.5 shadow-2xs">
                      <span className="text-[11px] font-medium text-slate-600">Trade Desk is responding</span>
                      <div className="flex gap-1 items-center ml-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '300ms' }}></span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* QUICK PROMPT SUGGESTIONS (HORIZONTAL CHIPS) */}
              <div className="px-3 py-1.5 bg-slate-50 border-t border-slate-200 overflow-x-auto no-scrollbar flex items-center gap-1.5 shrink-0">
                <span className="text-[10px] font-bold uppercase text-slate-400 shrink-0">
                  Suggestions:
                </span>
                {QUICK_PROMPTS.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(prompt)}
                    className="px-2 py-0.5 rounded-full bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-[10px] text-slate-700 hover:text-blue-700 whitespace-nowrap transition-all shadow-2xs shrink-0 cursor-pointer"
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              {/* INPUT FORM */}
              <form 
                onSubmit={e => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="p-2.5 bg-white border-t border-slate-200 flex items-center gap-2 shrink-0"
              >
                {/* Direct WhatsApp Action Button */}
                <a
                  href={OFFICIAL_WHATSAPP_DATA.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Chat directly on WhatsApp (+91 8532934479)"
                  className="w-9 h-9 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-200 flex items-center justify-center shrink-0 transition-colors cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                </a>

                {/* Input Text Box */}
                <div className="relative flex-1">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputMessage}
                    onChange={e => setInputMessage(e.target.value)}
                    placeholder="Type your sourcing question, RFQ, or product name..."
                    disabled={isLoading}
                    className="w-full text-xs bg-slate-50 border border-slate-300 focus:border-blue-500 focus:bg-white rounded-xl px-3 py-2 pr-8 focus:outline-none transition-all placeholder:text-slate-400"
                  />
                  {inputMessage.trim() && (
                    <button
                      type="button"
                      onClick={() => setInputMessage('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Send Button */}
                <button
                  type="submit"
                  disabled={!inputMessage.trim() || isLoading}
                  className="w-9 h-9 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:hover:bg-blue-600 text-white flex items-center justify-center shrink-0 transition-all shadow-sm cursor-pointer"
                  title="Send Message"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>

              {/* FOOTER NOTICE */}
              <div className="bg-slate-900 text-slate-400 px-3 py-1.5 text-[9px] flex items-center justify-between border-t border-slate-800">
                <span className="flex items-center gap-1 text-slate-300 font-medium">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  <span>256-Bit SSL Encrypted • 24/7 Global Trade Desk</span>
                </span>
                <span className="flex items-center gap-1 text-blue-400 font-mono">
                  help@tradeheaven.net
                </span>
              </div>
            </>
          )}
        </div>
      )}

      {/* 2. FLOATING ACTION BUTTONS DOCK (WHEN COLLAPSED OR EXPANDED) */}
      <div className="pointer-events-auto flex items-center gap-2.5">
        {/* DIRECT WHATSAPP FLOATING BUTTON - ICON ONLY */}
        <a
          id="floating-whatsapp-btn"
          href={OFFICIAL_WHATSAPP_DATA.url}
          target="_blank"
          rel="noopener noreferrer"
          title="WhatsApp: +91 8532934479"
          className="group relative w-12 h-12 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white flex items-center justify-center shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer border-2 border-white/40 hover:scale-110 active:scale-95 shrink-0"
        >
          <MessageCircle className="w-6 h-6 fill-white text-[#25D366]" />
          <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-white flex items-center justify-center">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          </span>
          
          {/* Floating Tooltip */}
          <div className="absolute bottom-full right-1/2 translate-x-1/2 mb-2.5 hidden group-hover:flex flex-col items-center pointer-events-none z-50">
            <div className="whitespace-nowrap bg-slate-950 text-white text-[11px] font-bold px-3 py-1.5 rounded-xl shadow-xl border border-slate-800 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#25D366]"></span>
              <span>WhatsApp: +91 85329 34479</span>
            </div>
            <div className="w-2 h-2 bg-slate-950 rotate-45 -mt-1 border-r border-b border-slate-800"></div>
          </div>
        </a>

        {/* 24/7 GLOBAL TRADE DESK TOGGLE BUTTON */}
        <button
          id="floating-ai-chat-toggle-btn"
          onClick={() => {
            setIsOpen(!isOpen);
            if (isMinimized) setIsMinimized(false);
            setUnreadCount(0);
          }}
          className={`relative flex items-center gap-2 px-4 py-2.5 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border hover:scale-105 ${
            isOpen
              ? 'bg-slate-900 text-white border-slate-700'
              : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white border-blue-400/30'
          }`}
          title="Open 24/7 Live Trade Desk"
        >
          <div className="relative">
            <MessageSquare className="w-5 h-5 text-white" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          </div>
          <div className="flex flex-col text-left">
            <span className="text-xs font-black tracking-wide leading-tight">
              {isOpen ? 'Close Desk' : '24/7 Trade Desk'}
            </span>
            <span className="text-[9px] text-blue-200 leading-none">
              Live Sourcing Support
            </span>
          </div>
          {/* Unread badge */}
          {unreadCount > 0 && !isOpen && (
            <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
              {unreadCount}
            </span>
          )}
        </button>
      </div>
    </div>
  );
};
