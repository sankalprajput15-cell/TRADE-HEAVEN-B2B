import React from 'react';
import { 
  Linkedin, 
  Youtube, 
  Instagram, 
  Facebook, 
  Globe2, 
  Star, 
  ShieldCheck, 
  ExternalLink,
  Users,
  Award,
  MessageCircle
} from 'lucide-react';

export const OFFICIAL_WHATSAPP_DATA = {
  phone: '+91 8532934479',
  formatted: '+91 85329 34479',
  raw: '918532934479',
  url: 'https://wa.me/918532934479?text=Hello%20Trade%20Heaven,%20I%20am%20inquiring%20about%20verified%20suppliers,%20RFQs,%20and%20B2B%20trade.'
};

export const SOCIAL_LINKS = [
  {
    name: 'WhatsApp',
    handle: '+91 8532934479',
    url: 'https://wa.me/918532934479?text=Hello%20Trade%20Heaven,%20I%20am%20inquiring%20about%20verified%20suppliers,%20RFQs,%20and%20B2B%20trade.',
    icon: MessageCircle,
    color: 'hover:bg-[#25D366] hover:text-white border-[#25D366]/30 hover:border-[#25D366] text-emerald-600',
    tag: 'Live 24/7 Trade Desk',
    badge: 'Chat Now'
  },
  {
    name: 'LinkedIn',
    handle: 'trade-heaven',
    url: 'https://www.linkedin.com/in/trade-heaven-957bb633a/',
    icon: Linkedin,
    color: 'hover:bg-[#0A66C2] hover:text-white border-[#0A66C2]/20 hover:border-[#0A66C2]',
    tag: 'B2B Network',
    badge: 'Connect'
  },
  {
    name: 'YouTube',
    handle: '@tradeheaven-ce1eo',
    url: 'https://www.youtube.com/@tradeheaven-ce1eo',
    icon: Youtube,
    color: 'hover:bg-[#FF0000] hover:text-white border-[#FF0000]/20 hover:border-[#FF0000]',
    tag: 'Trade Guides & Showcases',
    badge: 'Subscribe'
  },
  {
    name: 'Instagram',
    handle: '@tradeheavenb2b',
    url: 'https://www.instagram.com/tradeheavenb2b/',
    icon: Instagram,
    color: 'hover:bg-gradient-to-r hover:from-[#833AB4] hover:via-[#FD1D1D] hover:to-[#F77737] hover:text-white border-pink-500/20 hover:border-pink-500',
    tag: 'Daily Buy Leads & Expo',
    badge: 'Follow'
  },
  {
    name: 'Facebook',
    handle: 'Trade Heaven Official',
    url: 'https://www.facebook.com/profile.php?id=61569916454663&rdid=FOWfZ4cMTXhlv7x3&share_url=https://www.facebook.com/share/LUbcjNrkSFJmED5i/#',
    icon: Facebook,
    color: 'hover:bg-[#1877F2] hover:text-white border-[#1877F2]/20 hover:border-[#1877F2]',
    tag: 'Global Importers Group',
    badge: 'Join'
  }
];

interface Props {
  variant?: 'compact' | 'full' | 'banner';
  className?: string;
  onContactClick?: () => void;
}

export const TradeHeavenSocialBar: React.FC<Props> = ({
  variant = 'full',
  className = '',
  onContactClick
}) => {
  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-1.5 ${className}`}>
        {SOCIAL_LINKS.map(item => {
          const Icon = item.icon;
          return (
            <a
              key={item.name}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              title={`Visit Trade Heaven on ${item.name} (${item.handle})`}
              className={`w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center transition-all duration-200 border ${item.color} shadow-2xs`}
            >
              <Icon className="w-4 h-4" />
            </a>
          );
        })}
      </div>
    );
  }

  if (variant === 'banner') {
    return (
      <div className={`bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 border border-slate-800 shadow-xl ${className}`}>
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="space-y-1.5 text-center lg:text-left max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[11px] font-bold uppercase tracking-wider">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>Official Trade Heaven Global Community</span>
            </div>
            <h3 className="text-lg sm:text-2xl font-black text-white tracking-tight">
              Connect with Trade Heaven on Official Channels
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Stay updated with daily verified buy leads, export market intelligence, container freight rates, and international trade show highlights.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 w-full lg:w-auto shrink-0">
            {SOCIAL_LINKS.map(item => {
              const Icon = item.icon;
              return (
                <a
                  key={item.name}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 hover:border-white/30 text-white transition-all flex flex-col items-center justify-center text-center gap-1 group shadow-sm"
                >
                  <div className="w-9 h-9 rounded-xl bg-white/10 group-hover:scale-110 transition-transform flex items-center justify-center">
                    <Icon className="w-5 h-5 text-amber-300 group-hover:text-white transition-colors" />
                  </div>
                  <span className="text-xs font-bold">{item.name}</span>
                  <span className="text-[10px] text-slate-300 font-mono flex items-center gap-0.5">
                    <span>{item.badge}</span>
                    <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                  </span>
                </a>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Full detailed block
  return (
    <div className={`bg-white rounded-2xl sm:rounded-3xl border border-slate-200 p-5 sm:p-7 shadow-xs space-y-4 sm:space-y-5 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold text-[10px] uppercase border border-blue-200">
              Verified Social Network
            </span>
          </div>
          <h3 className="text-base sm:text-xl font-black text-slate-900 mt-1">
            Trade Heaven Official Media &amp; Exporter Network
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Follow our verified company pages for direct manufacturer catalogs, commodity price alerts, and trade advisory.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 shrink-0">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span className="font-semibold">Verified Official Links</span>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {SOCIAL_LINKS.map(item => {
          const Icon = item.icon;
          return (
            <a
              key={item.name}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 rounded-2xl bg-slate-50 hover:bg-white border border-slate-200 hover:border-blue-400 transition-all flex items-start gap-3 group shadow-2xs"
            >
              <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform text-slate-800 shadow-2xs">
                <Icon className="w-5 h-5 text-blue-600" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1">
                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    {item.name}
                  </h4>
                  <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-blue-600 transition-colors shrink-0" />
                </div>
                <div className="text-[10px] text-slate-500 truncate font-mono">
                  {item.handle}
                </div>
                <div className="mt-2 inline-block px-2 py-0.5 bg-white rounded-md text-[9px] font-bold text-slate-600 border border-slate-200">
                  {item.tag}
                </div>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
};
