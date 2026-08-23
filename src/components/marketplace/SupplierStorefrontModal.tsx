import React, { useRef, useEffect } from 'react';
import { CompanyProfile, Product, Currency, AuthUser, DetailedVendorProfile } from '../../types';
import { MOCK_PRODUCTS } from '../../data/mockData';
import { VendorProfilePage } from '../vendor/VendorProfilePage';
import { X } from 'lucide-react';

interface Props {
  companyId?: string;
  company?: CompanyProfile | DetailedVendorProfile;
  products?: Product[];
  isOpen?: boolean;
  selectedCurrency: Currency;
  onClose: () => void;
  onSelectProduct: (product: Product) => void;
  onOpenCreateRfq?: () => void;
  currentUser?: AuthUser | null;
  onOpenUpgradeModal?: () => void;
  onNavigate?: (view: string) => void;
}

export const SupplierStorefrontModal: React.FC<Props> = ({
  companyId,
  company,
  products = MOCK_PRODUCTS,
  isOpen = true,
  selectedCurrency,
  onClose,
  onSelectProduct,
  onOpenCreateRfq,
  currentUser = null,
  onOpenUpgradeModal,
  onNavigate
}) => {
  const modalContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (modalContainerRef.current) {
      modalContainerRef.current.scrollTop = 0;
    }
  }, [companyId, company?.id]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-950/80 backdrop-blur-sm overflow-hidden animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-slate-50 border border-slate-200 rounded-3xl w-full max-w-6xl max-h-[calc(100dvh-1rem)] sm:max-h-[calc(100dvh-2.5rem)] flex flex-col overflow-hidden shadow-2xl relative text-slate-900">
        {/* Floating Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-40 p-2 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white backdrop-blur-md transition-all shadow-lg cursor-pointer"
          title="Close Vendor Profile"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Scrollable Modal Content */}
        <div ref={modalContainerRef} className="overflow-y-auto p-4 sm:p-6 flex-1">
          <VendorProfilePage
            companyId={companyId || company?.id || 'comp-apex-motorsport'}
            company={company as DetailedVendorProfile}
            products={products}
            selectedCurrency={selectedCurrency}
            onSelectProduct={(p) => {
              onClose();
              onSelectProduct(p);
            }}
            onOpenCreateRfq={() => {
              onClose();
              if (onOpenCreateRfq) onOpenCreateRfq();
            }}
            currentUser={currentUser}
            onOpenUpgradeModal={onOpenUpgradeModal}
            onNavigate={onNavigate}
            isModalView={true}
            onCloseModal={onClose}
          />
        </div>
      </div>
    </div>
  );
};
