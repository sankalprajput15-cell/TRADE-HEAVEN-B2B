import React, { useState } from 'react';
import { Currency, UserRole, ActiveView, AuthUser, Product } from '../../types';
import { TradeHeavenLogo } from '../common/TradeHeavenLogo';
import { GlobalSearch } from '../common/GlobalSearch';
import { NotificationBell } from './NotificationBell';
import { SafeImage } from '../common/SafeImage';
import { 
  ShoppingBag, 
  Building2, 
  FileText, 
  Calculator, 
  PlusCircle, 
  LogIn, 
  UserPlus, 
  User, 
  LayoutDashboard, 
  ShieldCheck, 
  LogOut, 
  ChevronDown 
} from 'lucide-react';

interface Props {
  activeView: ActiveView;
  setActiveView?: (view: ActiveView) => void;
  onNavigate?: (view: ActiveView | string, options?: any) => void;
  selectedCurrency: Currency;
  setSelectedCurrency?: (curr: Currency) => void;
  onCurrencyChange?: (curr: Currency) => void;
  currentUser: AuthUser | null;
  currentUserRole?: UserRole;
  setCurrentUserRole?: (role: UserRole) => void;
  onOpenCreateRfq?: () => void;
  onOpenBackendManager?: () => void;
  onOpenDbModal?: () => void;
  onOpenAuthModal: () => void;
  onOpenRegisterFree?: () => void;
  onOpenOnboardModal?: () => void;
  onOpenContactModal?: () => void;
  onLogout?: () => void;
  unreadMessagesCount?: number;
  products?: Product[];
  onSelectProduct?: (product: Product) => void;
  onNavigateToCategory?: (category: string, subcategory?: string) => void;
  onNavigateToSearch?: (query: string) => void;
}

export const Header: React.FC<Props> = ({
  activeView,
  setActiveView,
  onNavigate,
  selectedCurrency,
  setSelectedCurrency,
  onCurrencyChange,
  currentUser,
  currentUserRole = currentUser?.role || 'BUYER',
  setCurrentUserRole,
  onOpenCreateRfq,
  onOpenBackendManager,
  onOpenDbModal,
  onOpenAuthModal,
  onOpenRegisterFree,
  onOpenOnboardModal,
  onOpenContactModal,
  onLogout,
  unreadMessagesCount = 0,
  products = [],
  onSelectProduct,
  onNavigateToCategory,
  onNavigateToSearch
}) => {
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleNavClick = (view: ActiveView | string) => {
    if (onNavigate) {
      onNavigate(view);
    } else if (setActiveView) {
      setActiveView(view as ActiveView);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = () => {
    if (onLogout) onLogout();
  };

  const isAdmin = currentUser?.role === 'ADMIN' || currentUserRole === 'ADMIN';

  return (
    <header className="w-full bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        
        {/* Left: Logo */}
        <div className="flex items-center shrink-0">
          <button
            onClick={() => handleNavClick('HOMEPAGE')}
            className="text-left focus:outline-none cursor-pointer flex items-center gap-2"
          >
            <TradeHeavenLogo size="sm" subtitle="B2B Marketplace" />
          </button>
        </div>

        {/* Center: Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          <button
            onClick={() => handleNavClick('HOMEPAGE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              activeView === 'HOMEPAGE' || activeView === 'MARKETPLACE_HOME'
                ? 'bg-blue-50 text-blue-600'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Home
          </button>
          <button
            onClick={() => handleNavClick('PRODUCT_DIRECTORY')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              activeView === 'PRODUCT_DIRECTORY'
                ? 'bg-blue-50 text-blue-600'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Products
          </button>
          <button
            onClick={() => handleNavClick('SUPPLIERS_DIRECTORY')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              activeView === 'SUPPLIERS_DIRECTORY'
                ? 'bg-blue-50 text-blue-600'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Suppliers
          </button>
          <button
            onClick={() => handleNavClick('BUY_LEADS')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              activeView === 'BUY_LEADS'
                ? 'bg-blue-50 text-blue-600'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Buy Leads
          </button>
          <button
            onClick={() => handleNavClick('PREMIUM_SERVICES')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              activeView === 'PREMIUM_SERVICES' || activeView === 'PREMIUM_MEMBERSHIP'
                ? 'bg-blue-50 text-blue-600'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Services
          </button>
        </nav>

        {/* Right: Search Bar & Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden xl:block w-64">
            <GlobalSearch 
              onNavigate={handleNavClick} 
              products={products}
              selectedCurrency={selectedCurrency}
              onSelectProduct={onSelectProduct}
              onNavigateToCategory={onNavigateToCategory}
              onNavigateToSearch={onNavigateToSearch}
            />
          </div>

          <NotificationBell onNavigate={handleNavClick} />

          {/* Post RFQ Button */}
          <button
            onClick={onOpenCreateRfq}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-1.5 rounded-xl text-xs transition-colors shadow-xs shrink-0 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline">Post RFQ</span>
          </button>

          {/* Authentication State */}
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl px-2.5 py-1.5 transition-colors text-left cursor-pointer"
              >
                <div className="w-6 h-6 rounded-full overflow-hidden bg-slate-300 shrink-0">
                  <SafeImage src={currentUser.avatarUrl} alt={currentUser.name} className="w-full h-full object-cover" />
                </div>
                <span className="text-xs font-bold text-slate-800 hidden md:inline truncate max-w-[100px]">
                  {currentUser.name}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-500 shrink-0" />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 text-slate-800">
                  <div className="p-2.5 bg-slate-50 rounded-xl mb-1 border border-slate-100">
                    <div className="font-bold text-xs text-slate-900 truncate">{currentUser.name}</div>
                    <div className="text-[10px] text-slate-500 font-mono truncate">{currentUser.email}</div>
                  </div>
                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      handleNavClick(currentUser.role === 'SUPPLIER' ? 'VENDOR_PROFILE' : 'BUYER_PROFILE');
                    }}
                    className="w-full px-3 py-2 text-left text-xs font-bold hover:bg-slate-100 rounded-xl flex items-center gap-2 text-slate-700 cursor-pointer"
                  >
                    <LayoutDashboard className="w-4 h-4 text-blue-600" />
                    <span>Dashboard</span>
                  </button>
                  {isAdmin && (
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        handleNavClick('CLIENT_ADMIN');
                      }}
                      className="w-full px-3 py-2 text-left text-xs font-bold hover:bg-slate-100 rounded-xl flex items-center gap-2 text-purple-700 cursor-pointer"
                    >
                      <ShieldCheck className="w-4 h-4 text-purple-600" />
                      <span>Admin Control Center</span>
                    </button>
                  )}
                  <div className="border-t border-slate-100 my-1 pt-1">
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        handleLogout();
                      }}
                      className="w-full px-3 py-2 text-left text-xs font-bold hover:bg-rose-50 text-rose-600 rounded-xl flex items-center gap-2 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                onClick={onOpenAuthModal}
                className="flex items-center gap-1 bg-slate-900 hover:bg-slate-800 text-white font-bold px-3 py-1.5 rounded-xl text-xs transition-colors cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};
