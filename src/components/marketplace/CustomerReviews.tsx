import React, { useEffect, useState } from 'react';

const GOOGLE_PROFILE_LINK = "https://share.google/qxbpaPySH7JnLryA5";

const reviewsDataset = [
  {
    name: "M. Preeti Rapheal",
    text: "M. Preeti is the Relationship Manager for our account. We had a conversation for more than an hour today, during which she optimized our entire export catalog. Trade Heaven's team is dedicated and extremely helpful.",
    imageUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop&q=80",
    region: "IN"
  },
  {
    name: "Aravind AK",
    text: "We recently upgraded our company profile to the Gold Plan on Trade Heaven, and the experience has been phenomenal. The RFQ matching system delivers genuine wholesale buyer leads consistently.",
    imageUrl: "https://images.unsplash.com/photo-1500048993953-d23a436266cf?w=100&h=100&fit=crop&q=80",
    region: "IN"
  },
  {
    name: "RIFQI IHZA MAHENDRA",
    text: "Very great platform for direct cross-border trade. Escrow protection and verified exporter seals make closing overseas bulk deals straightforward and worry-free.",
    imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&q=80",
    region: "OTHER"
  },
  {
    name: "William FamazeHK",
    text: "Excellent B2B platform with prompt professional support. Connected with verified European agricultural buyers within our first two weeks on Trade Heaven.",
    imageUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&h=100&fit=crop&q=80",
    region: "OTHER"
  },
  {
    name: "Kamaljeet Singh",
    text: "It is always nice working with Aarti; she is always finding solutions to any logistics query. Looks like she is a real asset to the Trade Heaven platform! Highly recommended.",
    imageUrl: "https://images.unsplash.com/photo-1566492031516-e824c7853b0e?w=100&h=100&fit=crop&q=80",
    region: "IN"
  },
  {
    name: "Sarah Jenkins",
    text: "Outstanding sourcing network. We procured two 40ft containers of premium textiles directly from certified Indian manufacturers at unbeatable factory prices.",
    imageUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop&q=80",
    region: "US"
  },
  {
    name: "David Chen",
    text: "Trade Heaven has simplified our international supply chain. The verified seller directory and fast RFQ turnaround time save our procurement team days of manual vetting.",
    imageUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop&q=80",
    region: "US"
  },
  {
    name: "Tariq Al-Mansoor",
    text: "As a GCC importer, authenticity is everything. The Trade Heaven assurance system gives us complete transparency on product grades, lab certificates, and dispatch timelines.",
    imageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&q=80",
    region: "OTHER"
  },
  {
    name: "Elena Rostova",
    text: "Upgraded our supplier subscription last month. The dedicated account assistance and high search visibility have significantly increased our export order volume.",
    imageUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&q=80",
    region: "OTHER"
  },
  {
    name: "Carlos Mendoza",
    text: "Best B2B trade marketplace for industrial tools and agro-machinery. Fast messaging, verified buyer credentials, and clean user interface throughout the entire lifecycle.",
    imageUrl: "https://images.unsplash.com/photo-1552058544-f2b08422138a?w=100&h=100&fit=crop&q=80",
    region: "OTHER"
  },
  {
    name: "Vikram Malhotra",
    text: "Trade Heaven provides exceptional value for Indian exporters aiming for global markets. Their lead filtering filters out spam so we only speak to genuine buyers ready to transact.",
    imageUrl: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100&h=100&fit=crop&q=80",
    region: "IN"
  },
  {
    name: "Liam O'Connor",
    text: "Seamless cross-border transaction experience. Customer support is always on standby to assist with trade documentation, letters of credit, and billing queries.",
    imageUrl: "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=100&h=100&fit=crop&q=80",
    region: "OTHER"
  },
  {
    name: "Priya Sharma",
    text: "The RFQ matching system on Trade Heaven is unparalleled. Within 48 hours of posting our requirements, we received quotes from three highly-rated manufacturers.",
    imageUrl: "https://images.unsplash.com/photo-1607990281513-2c110a25bd8c?w=100&h=100&fit=crop&q=80",
    region: "IN"
  },
  {
    name: "Ahmed Hassan",
    text: "Very reliable marketplace. We have been sourcing electronics through Trade Heaven for a year now and have never faced any issues with seller verification.",
    imageUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&h=100&fit=crop&q=80",
    region: "OTHER"
  },
  {
    name: "Maria Gonzalez",
    text: "Trade Heaven is a lifesaver for small businesses looking to import globally. Their interface is user-friendly and the escrow service is very reassuring.",
    imageUrl: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=100&h=100&fit=crop&q=80",
    region: "OTHER"
  },
  {
    name: "Kenji Tanaka",
    text: "Outstanding selection of verified suppliers. We found a great partner for our automotive parts division in Europe thanks to Trade Heaven's extensive database.",
    imageUrl: "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=100&h=100&fit=crop&q=80",
    region: "OTHER"
  },
  {
    name: "Isabella Rossi",
    text: "I highly recommend Trade Heaven for anyone in the wholesale fashion industry. Sourcing premium fabrics has never been this efficient and secure.",
    imageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&q=80",
    region: "OTHER"
  },
  {
    name: "John Smith",
    text: "The account managers are incredibly proactive. They helped us set up our exporter profile and we started receiving quality inquiries almost immediately.",
    imageUrl: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&h=100&fit=crop&q=80",
    region: "US"
  },
  {
    name: "Ayesha Khan",
    text: "Trade Heaven's verified buyer seal is a game-changer. It builds trust instantly, which is crucial for closing large international deals.",
    imageUrl: "https://images.unsplash.com/photo-1594744803329-e58b31de215f?w=100&h=100&fit=crop&q=80",
    region: "IN"
  },
  {
    name: "Robert Mueller",
    text: "The logistics integration on Trade Heaven makes tracking shipments a breeze. Everything from procurement to delivery is handled on one platform.",
    imageUrl: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=100&h=100&fit=crop&q=80",
    region: "US"
  },
  {
    name: "Mei Ling",
    text: "Excellent platform for expanding our market reach. Trade Heaven's global exposure has opened up new opportunities for our manufacturing business.",
    imageUrl: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=100&h=100&fit=crop&q=80",
    region: "OTHER"
  },
  {
    name: "Oliver Brown",
    text: "The customer service is top-notch. Any issues with customs or documentation are resolved quickly with the help of the Trade Heaven support team.",
    imageUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop&q=80",
    region: "US"
  },
  {
    name: "Fatima Ali",
    text: "We use Trade Heaven for all our wholesale medical supplies. The supplier verification process gives us the confidence we need for critical imports.",
    imageUrl: "https://images.unsplash.com/photo-1589156280159-27698a70f29e?w=100&h=100&fit=crop&q=80",
    region: "OTHER"
  },
  {
    name: "Dmitry Ivanov",
    text: "Trade Heaven has the best RFQ system I've used. It's easy to specify requirements and the quotes we receive are always competitive.",
    imageUrl: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=100&h=100&fit=crop&q=80",
    region: "OTHER"
  },
  {
    name: "Chloe Martin",
    text: "The platform's interface is very intuitive. Even for a newcomer to global trade, Trade Heaven makes the process straightforward and manageable.",
    imageUrl: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=100&h=100&fit=crop&q=80",
    region: "US"
  },
  {
    name: "Aliya Rahman",
    text: "I appreciate the transparency Trade Heaven offers. The ability to see supplier credentials and track records helps in making informed decisions.",
    imageUrl: "https://images.unsplash.com/photo-1614283233556-f35b0c801ef1?w=100&h=100&fit=crop&q=80",
    region: "IN"
  },
  {
    name: "Thomas Wilson",
    text: "A very robust B2B marketplace. We've successfully sourced industrial machinery through Trade Heaven without any hiccups. Highly recommended.",
    imageUrl: "https://images.unsplash.com/photo-1480455624313-e29b44bbfde1?w=100&h=100&fit=crop&q=80",
    region: "US"
  },
  {
    name: "Ananya Patel",
    text: "Trade Heaven's global trade corridors feature is brilliant. It simplifies understanding logistics and helps us plan our supply chain better.",
    imageUrl: "https://images.unsplash.com/photo-1619380061814-58f03707f082?w=100&h=100&fit=crop&q=80",
    region: "IN"
  },
  {
    name: "Michael Chang",
    text: "The VIP supplier plan was a great investment. Our product visibility skyrocketed and we are now connecting with buyers we couldn't reach before.",
    imageUrl: "https://images.unsplash.com/photo-1507591064344-4c6b10ec85aa?w=100&h=100&fit=crop&q=80",
    region: "OTHER"
  },
  {
    name: "Sofia Costa",
    text: "Secure and reliable. The escrow service ensures that both buyers and sellers are protected, which is essential in international trade.",
    imageUrl: "https://images.unsplash.com/photo-1587614382346-4ec70e388b28?w=100&h=100&fit=crop&q=80",
    region: "OTHER"
  },
  {
    name: "Hassan Mahmoud",
    text: "Trade Heaven has transformed how we do business. The direct access to verified manufacturers means better prices and higher quality products for our clients.",
    imageUrl: "https://images.unsplash.com/photo-1522529599102-193c0d76b5b6?w=100&h=100&fit=crop&q=80",
    region: "OTHER"
  },
  {
    name: "Emma Davis",
    text: "The dedicated account managers at Trade Heaven are phenomenal. They truly understand our business needs and constantly help us optimize our sourcing strategy.",
    imageUrl: "https://images.unsplash.com/photo-1548142813-c348350df52b?w=100&h=100&fit=crop&q=80",
    region: "US"
  }
];

export const CustomerReviews: React.FC = () => {
  const [dailyReviews, setDailyReviews] = useState<any[]>([]);
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'IN' | 'US'>('ALL');

  // Deterministic Daily Seed Generator (Year * 10000 + Month * 100 + Date)
  const getDailySeed = () => {
    const now = new Date();
    return now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();
  };

  // Seeded Pseudorandom Number Generator
  const seededRandom = (seed: number) => {
    let x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  };

  // Avatar Color Palette Generator
  const getAvatarColor = (name: string) => {
    const colors = [
      'bg-red-500', 'bg-blue-600', 'bg-emerald-600', 'bg-amber-500',
      'bg-indigo-600', 'bg-purple-600', 'bg-rose-500', 'bg-teal-600',
      'bg-orange-500', 'bg-cyan-600'
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  // Dynamic Relative Time Calculation
  const getDynamicRelativeTime = (index: number, seed: number) => {
    const days = Math.floor(seededRandom(seed + index * 17) * 14) + 1; // 1 to 14 days
    if (days === 1) return "Yesterday on Google";
    return `${days} days ago on Google`;
  };

  useEffect(() => {
    // Shuffle dataset deterministically so reviews change once every 24 hours
    const getDailyShuffledReviews = (list: any[], count: number) => {
      let currentSeed = getDailySeed();
      let cloned = [...list];

      for (let i = cloned.length - 1; i > 0; i--) {
        const j = Math.floor(seededRandom(currentSeed++) * (i + 1));
        [cloned[i], cloned[j]] = [cloned[j], cloned[i]];
      }
      return cloned.slice(0, count);
    };

    setDailyReviews(getDailyShuffledReviews(reviewsDataset, 32));
  }, []);

  const seed = getDailySeed();

  const filteredReviews = dailyReviews.filter(review => {
    if (activeFilter === 'ALL') return true;
    return review.region === activeFilter;
  });

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Section Title */}
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
          What our customers say
        </h2>
      </div>

      {/* Main Container Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Top Google Filter Tabs */}
        <div className="flex items-center gap-x-2 sm:gap-x-6 px-4 sm:px-6 pt-5 border-b border-gray-200 text-xs sm:text-sm font-semibold overflow-x-auto scrollbar-none scroll-smooth">
          <button 
            onClick={() => setActiveFilter('ALL')}
            className={`pb-3 border-b-2 flex items-center gap-1.5 focus:outline-none whitespace-nowrap transition-all duration-150 ${
              activeFilter === 'ALL'
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            All Reviews <span className="text-gray-400 font-normal">4.8</span>
          </button>

          <button 
            onClick={() => setActiveFilter('IN')}
            className={`pb-3 border-b-2 flex items-center gap-1.5 focus:outline-none transition-all duration-150 whitespace-nowrap ${
              activeFilter === 'IN'
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            {/* Google 'G' Logo SVG */}
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Google India <span className="text-gray-400 font-normal">4.8</span>
          </button>

          <button 
            onClick={() => setActiveFilter('US')}
            className={`pb-3 border-b-2 flex items-center gap-1.5 focus:outline-none transition-all duration-150 whitespace-nowrap ${
              activeFilter === 'US'
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            {/* Google 'G' Logo SVG */}
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Google US <span className="text-gray-400 font-normal">4.8</span>
          </button>
        </div>

        {/* Overall Rating Summary & Write Review CTA */}
        <div className="px-6 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gray-50/50 border-b border-gray-200">
          <div>
            <span className="text-[13px] font-bold text-gray-800 tracking-wide block">Overall Rating</span>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-3xl font-extrabold text-gray-900">4.8</span>
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-4 h-4 text-amber-400 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-sm font-medium text-gray-500 ml-1">(840+)</span>
            </div>
          </div>

          <a href={GOOGLE_PROFILE_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center px-6 py-2.5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold rounded-full shadow-sm transition-all duration-150 transform active:scale-95 whitespace-nowrap">
            Write a Review
          </a>
        </div>

        {/* Dynamic Reviews Grid (Showing all reviews) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 p-4 sm:p-6 bg-gray-50/30 max-h-[800px] overflow-y-auto">
          {filteredReviews.map((review, index) => {
            const initial = review.name.trim().charAt(0).toUpperCase();
            const avatarBg = getAvatarColor(review.name);
            const timeText = getDynamicRelativeTime(index, seed);

            return (
              <a key={index} href={GOOGLE_PROFILE_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="group block bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col h-full text-left cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:border-gray-300">

                <div className="flex-grow">
                  {/* 5 Gold Stars */}
                  <div className="flex items-center gap-0.5 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-4 h-4 text-amber-400 fill-current" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>

                  {/* Review Snippet */}
                  <p className="text-[13px] text-gray-700 leading-relaxed line-clamp-4 overflow-hidden" style={{ display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical' }}>
                    {review.text}
                  </p>
                  <span className="text-[12px] text-blue-500 font-medium group-hover:underline mt-1 inline-block">
                    Read more
                  </span>
                </div>

                {/* Reviewer Info Footer */}
                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-3">
                  {/* User Initial Avatar or Profile Image */}
                  {review.imageUrl ? (
                    <img src={review.imageUrl} alt={review.name} className="w-9 h-9 rounded-full object-cover shrink-0 shadow-sm" />
                  ) : (
                    <div className={`w-9 h-9 rounded-full ${avatarBg} text-white flex items-center justify-center text-sm font-bold shrink-0 shadow-inner`}>
                      {initial}
                    </div>
                  )}

                  {/* User Name + Verified Badge + Dynamic Timestamp */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[13px] font-bold text-gray-900 truncate block">
                        {review.name}
                      </span>
                      {/* Verified Blue Checkmark SVG */}
                      <svg className="w-3.5 h-3.5 text-blue-500 shrink-0 fill-current" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                      </svg>
                    </div>
                    <span className="text-[11px] text-gray-400 block truncate mt-0.5">
                      {timeText}
                    </span>
                  </div>
                </div>

              </a>
            );
          })}
        </div>

      </div>
    </section>
  );
};
