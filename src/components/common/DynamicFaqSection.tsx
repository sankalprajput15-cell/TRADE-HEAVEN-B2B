import React, { useState, useEffect } from 'react';
import { bigrockApi, DbFaq } from '../../services/bigrockApi';
import { 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  Search, 
  ShieldCheck, 
  MessageSquare, 
  Filter, 
  RefreshCw, 
  PlusCircle 
} from 'lucide-react';

interface Props {
  onOpenContactModal?: () => void;
  className?: string;
}

export const DynamicFaqSection: React.FC<Props> = ({ onOpenContactModal, className = '' }) => {
  const [faqs, setFaqs] = useState<DbFaq[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [openFaqId, setOpenFaqId] = useState<string | number | null>('faq-1');

  const fetchFaqs = async () => {
    setIsLoading(true);
    try {
      const data = await bigrockApi.fetchFaqs();
      setFaqs(data);
      if (data.length > 0 && !openFaqId) {
        setOpenFaqId(data[0].id || 'faq-1');
      }
    } catch (err) {
      console.warn('FAQ fetch fallback active');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  const categories = ['ALL', ...Array.from(new Set(faqs.map(f => f.category || 'General')))];

  const filteredFaqs = faqs.filter(faq => {
    const matchCategory = activeCategory === 'ALL' || faq.category === activeCategory;
    const matchSearch = searchQuery === '' || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  const toggleFaq = (id?: string | number) => {
    if (id === undefined || id === null) return;
    setOpenFaqId(prev => (prev === id ? null : id));
  };

  return (
    <div id="dynamic-faq-section" className={`bg-white border border-slate-200 rounded-3xl p-6 sm:p-9 lg:p-10 shadow-sm space-y-8 ${className}`}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Live Dynamic Knowledge Base &amp; FAQ</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
            Frequently Asked Questions &amp; Trade Assurance Guide
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 font-normal">
            Everything you need to know about international wholesale sourcing, Swiss trade protection release protocols, and verified factory compliance.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-72 shrink-0">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search questions..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
        <span className="text-slate-400 font-bold text-[11px] flex items-center gap-1 shrink-0 mr-1">
          <Filter className="w-3.5 h-3.5" /> Topic:
        </span>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3.5 py-1.5 rounded-full font-bold transition-all shrink-0 cursor-pointer text-xs ${
              activeCategory === cat
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Accordion List / Loading State */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl animate-pulse flex flex-col gap-2">
              <div className="h-4 bg-slate-200 rounded w-2/3"></div>
              <div className="h-3 bg-slate-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : filteredFaqs.length === 0 ? (
        <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
          <HelpCircle className="w-8 h-8 text-slate-400 mx-auto" />
          <p className="text-xs text-slate-600 font-bold">No questions found matching your filter criteria.</p>
          <button
            onClick={() => {
              setActiveCategory('ALL');
              setSearchQuery('');
            }}
            className="text-xs text-blue-600 font-bold hover:underline"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredFaqs.map((faq, index) => {
            const faqId = faq.id || `faq-idx-${index}`;
            const isOpen = openFaqId === faqId;

            return (
              <div
                key={faqId}
                className={`border rounded-2xl transition-all overflow-hidden ${
                  isOpen
                    ? 'border-blue-500 bg-blue-50/20 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(faqId)}
                  className="w-full p-4 sm:p-5 flex items-center justify-between gap-4 text-left cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono shrink-0">
                      {faq.category || 'General'}
                    </span>
                    <span className="font-bold text-sm sm:text-base text-slate-900">
                      {faq.question}
                    </span>
                  </div>
                  <div className="shrink-0 p-1.5 rounded-lg bg-slate-100 text-slate-600">
                    {isOpen ? <ChevronUp className="w-4 h-4 text-blue-600" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>

                {isOpen && (
                  <div className="px-4 sm:px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100">
                    <p className="pt-2">{faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Still Have Questions CTA */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <div className="font-bold text-sm text-white flex items-center justify-center sm:justify-start gap-1.5">
            <MessageSquare className="w-4 h-4 text-blue-400" />
            <span>Have a specific trade inquiry or custom requirement?</span>
          </div>
          <p className="text-xs text-slate-300">
            Submit your question directly to our trade specialists. We respond within 2 to 4 hours.
          </p>
        </div>

        {onOpenContactModal && (
          <button
            onClick={onOpenContactModal}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shrink-0 cursor-pointer shadow-md transition-colors"
          >
            Ask Sourcing Desk
          </button>
        )}
      </div>
    </div>
  );
};
