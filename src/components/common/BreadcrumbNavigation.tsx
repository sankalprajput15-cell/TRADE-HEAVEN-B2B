import React, { useMemo } from 'react';
import { ChevronRight, Home, ArrowLeft, Tag, Layers, Building2, ShieldCheck, Sparkles } from 'lucide-react';
import { ActiveView, Product, RfqRequirement } from '../../types';

export interface BreadcrumbItem {
  name: string;
  url: string;
  view?: ActiveView | string;
  onClick?: () => void;
  icon?: React.ReactNode;
  category?: string;
  search?: string;
  productId?: string;
}

export interface BreadcrumbNavigationProps {
  activeView: ActiveView | string;
  onNavigate: (view: ActiveView | string, options?: { search?: string; category?: string; subcategory?: string; productId?: string }) => void;
  selectedProduct?: Product | null;
  selectedRfq?: RfqRequirement | null;
  catalogCategory?: string;
  catalogSearch?: string;
  storefrontCompanyId?: string | null;
  selectedBuyerId?: string | null;
  onClearProduct?: () => void;
  onClearCategory?: () => void;
  onBack?: () => void;
}

export const BreadcrumbNavigation: React.FC<BreadcrumbNavigationProps> = ({
  activeView,
  onNavigate,
  selectedProduct,
  selectedRfq,
  catalogCategory,
  catalogSearch,
  storefrontCompanyId,
  selectedBuyerId,
  onClearProduct,
  onClearCategory,
  onBack
}) => {
  // If we are on the homepage, do not render breadcrumbs
  if (activeView === 'HOMEPAGE' || activeView === 'MARKETPLACE_HOME' || activeView === '/') {
    return null;
  }

  // Construct structured breadcrumb trail based on current application state
  const items: BreadcrumbItem[] = useMemo(() => {
    const list: BreadcrumbItem[] = [
      {
        name: 'Home',
        url: 'https://tradeheaven.net/',
        view: 'HOMEPAGE',
        onClick: () => onNavigate('HOMEPAGE'),
        icon: <Home className="w-3.5 h-3.5" />
      }
    ];

    switch (activeView) {
      case 'PRODUCT_DIRECTORY':
        list.push({
          name: 'Product Catalog',
          url: 'https://tradeheaven.net/?view=PRODUCT_DIRECTORY',
          view: 'PRODUCT_DIRECTORY',
          onClick: () => {
            if (selectedProduct && onClearProduct) {
              onClearProduct();
            } else if (catalogCategory && catalogCategory !== 'ALL' && onClearCategory) {
              onClearCategory();
            }
            onNavigate('PRODUCT_DIRECTORY');
          }
        });

        if (catalogCategory && catalogCategory !== 'ALL') {
          list.push({
            name: catalogCategory,
            url: `https://tradeheaven.net/?view=PRODUCT_DIRECTORY&category=${encodeURIComponent(catalogCategory)}`,
            view: 'PRODUCT_DIRECTORY',
            category: catalogCategory,
            onClick: () => {
              if (selectedProduct && onClearProduct) {
                onClearProduct();
              }
              onNavigate('PRODUCT_DIRECTORY', { category: catalogCategory });
            }
          });
        }

        if (catalogSearch) {
          list.push({
            name: `Search: "${catalogSearch}"`,
            url: `https://tradeheaven.net/?view=PRODUCT_DIRECTORY&search=${encodeURIComponent(catalogSearch)}`,
            view: 'PRODUCT_DIRECTORY'
          });
        }

        if (selectedProduct) {
          list.push({
            name: selectedProduct.title,
            url: `https://tradeheaven.net/?view=PRODUCT_DIRECTORY&productId=${encodeURIComponent(selectedProduct.id)}`,
            productId: selectedProduct.id
          });
        }
        break;

      case 'RFQ_HUB':
        list.push({
          name: 'Sourcing & RFQ Hub',
          url: 'https://tradeheaven.net/?view=RFQ_HUB',
          view: 'RFQ_HUB',
          onClick: () => onNavigate('RFQ_HUB')
        });
        if (selectedRfq) {
          list.push({
            name: selectedRfq.productName || selectedRfq.title || 'RFQ Details',
            url: `https://tradeheaven.net/?view=RFQ_HUB&rfqId=${encodeURIComponent(selectedRfq.id)}`
          });
        }
        break;

      case 'BUY_LEADS':
        list.push({
          name: 'Global Buy Leads',
          url: 'https://tradeheaven.net/?view=BUY_LEADS',
          view: 'BUY_LEADS',
          onClick: () => onNavigate('BUY_LEADS')
        });
        break;

      case 'SUPPLIERS_DIRECTORY':
        list.push({
          name: 'Verified Suppliers Directory',
          url: 'https://tradeheaven.net/?view=SUPPLIERS_DIRECTORY',
          view: 'SUPPLIERS_DIRECTORY',
          onClick: () => onNavigate('SUPPLIERS_DIRECTORY')
        });
        if (storefrontCompanyId) {
          list.push({
            name: 'Supplier Storefront',
            url: `https://tradeheaven.net/?view=SUPPLIERS_DIRECTORY&supplier=${encodeURIComponent(storefrontCompanyId)}`
          });
        }
        break;

      case 'BUYERS_DIRECTORY':
        list.push({
          name: 'Verified Buyers Directory',
          url: 'https://tradeheaven.net/?view=BUYERS_DIRECTORY',
          view: 'BUYERS_DIRECTORY',
          onClick: () => onNavigate('BUYERS_DIRECTORY')
        });
        if (selectedBuyerId) {
          list.push({
            name: 'Buyer Procurement Profile',
            url: `https://tradeheaven.net/?view=BUYERS_DIRECTORY&buyer=${encodeURIComponent(selectedBuyerId)}`
          });
        }
        break;

      case 'VENDOR_PROFILE':
        list.push({
          name: 'Verified Suppliers',
          url: 'https://tradeheaven.net/?view=SUPPLIERS_DIRECTORY',
          view: 'SUPPLIERS_DIRECTORY',
          onClick: () => onNavigate('SUPPLIERS_DIRECTORY')
        });
        list.push({
          name: 'Supplier Profile & Storefront',
          url: 'https://tradeheaven.net/?view=VENDOR_PROFILE',
          view: 'VENDOR_PROFILE'
        });
        break;

      case 'BUYER_PROFILE':
        list.push({
          name: 'Verified Buyers',
          url: 'https://tradeheaven.net/?view=BUYERS_DIRECTORY',
          view: 'BUYERS_DIRECTORY',
          onClick: () => onNavigate('BUYERS_DIRECTORY')
        });
        list.push({
          name: 'Buyer Profile',
          url: 'https://tradeheaven.net/?view=BUYER_PROFILE',
          view: 'BUYER_PROFILE'
        });
        break;

      case 'INSIGHTS':
        list.push({
          name: 'Trade Insights & Finance',
          url: 'https://tradeheaven.net/?view=INSIGHTS',
          view: 'INSIGHTS',
          onClick: () => onNavigate('INSIGHTS')
        });
        break;

      case 'INCOTERMS_CALCULATOR':
      case 'TRADE_TOOLS':
        list.push({
          name: 'Trade Tools & Calculators',
          url: 'https://tradeheaven.net/?view=INCOTERMS_CALCULATOR',
          view: 'INCOTERMS_CALCULATOR',
          onClick: () => onNavigate('INCOTERMS_CALCULATOR')
        });
        list.push({
          name: 'Incoterms 2020 Calculator & Risk Transfer Matrix',
          url: 'https://tradeheaven.net/?view=INCOTERMS_CALCULATOR'
        });
        break;

      case 'PREMIUM_MEMBERSHIP':
      case 'PREMIUM_SERVICES':
        list.push({
          name: 'Solutions & Pricing',
          url: 'https://tradeheaven.net/?view=PREMIUM_MEMBERSHIP',
          view: 'PREMIUM_MEMBERSHIP',
          onClick: () => onNavigate('PREMIUM_MEMBERSHIP')
        });
        list.push({
          name: 'Verified Supplier Membership Plans',
          url: 'https://tradeheaven.net/?view=PREMIUM_MEMBERSHIP'
        });
        break;

      case 'POST_SELL_OFFER':
        list.push({
          name: 'Seller Hub',
          url: 'https://tradeheaven.net/?view=POST_SELL_OFFER',
          view: 'POST_SELL_OFFER',
          onClick: () => onNavigate('POST_SELL_OFFER')
        });
        list.push({
          name: 'Post Cargo & Sell Offer',
          url: 'https://tradeheaven.net/?view=POST_SELL_OFFER'
        });
        break;

      case 'POST_BUY_REQUIREMENT':
        list.push({
          name: 'Buyer Hub',
          url: 'https://tradeheaven.net/?view=RFQ_HUB',
          view: 'RFQ_HUB',
          onClick: () => onNavigate('RFQ_HUB')
        });
        list.push({
          name: 'Post Sourcing RFQ',
          url: 'https://tradeheaven.net/?view=POST_BUY_REQUIREMENT'
        });
        break;

      case 'NEGOTIATION_ROOM':
        list.push({
          name: 'Trade Center',
          url: 'https://tradeheaven.net/?view=DASHBOARD',
          view: 'DASHBOARD',
          onClick: () => onNavigate('DASHBOARD')
        });
        list.push({
          name: 'Real-Time Negotiation Room',
          url: 'https://tradeheaven.net/?view=NEGOTIATION_ROOM'
        });
        break;

      case 'DASHBOARD':
        list.push({
          name: 'Enterprise Portal',
          url: 'https://tradeheaven.net/?view=DASHBOARD',
          view: 'DASHBOARD',
          onClick: () => onNavigate('DASHBOARD')
        });
        list.push({
          name: 'Trade Assurance & Account Dashboard',
          url: 'https://tradeheaven.net/?view=DASHBOARD'
        });
        break;

      case 'ABOUT_US':
        list.push({
          name: 'Company',
          url: 'https://tradeheaven.net/?view=ABOUT_US',
          view: 'ABOUT_US',
          onClick: () => onNavigate('ABOUT_US')
        });
        list.push({
          name: 'About Trade Heaven',
          url: 'https://tradeheaven.net/?view=ABOUT_US'
        });
        break;

      case 'TRUST_SAFETY':
        list.push({
          name: 'Trust & Governance',
          url: 'https://tradeheaven.net/?view=TRUST_SAFETY',
          view: 'TRUST_SAFETY',
          onClick: () => onNavigate('TRUST_SAFETY')
        });
        list.push({
          name: 'Escrow Protection & Factory Verification',
          url: 'https://tradeheaven.net/?view=TRUST_SAFETY'
        });
        break;

      case 'REFUND_POLICY':
        list.push({
          name: 'Legal & Policies',
          url: 'https://tradeheaven.net/?view=TERMS_OF_USE',
          view: 'TERMS_OF_USE',
          onClick: () => onNavigate('TERMS_OF_USE')
        });
        list.push({
          name: 'Return & 60-Day Refund Policy',
          url: 'https://tradeheaven.net/?view=REFUND_POLICY'
        });
        break;

      case 'PRODUCT_LISTING_POLICY':
        list.push({
          name: 'Legal & Policies',
          url: 'https://tradeheaven.net/?view=TERMS_OF_USE',
          view: 'TERMS_OF_USE',
          onClick: () => onNavigate('TERMS_OF_USE')
        });
        list.push({
          name: 'Product Listing Policy & Prohibited Items',
          url: 'https://tradeheaven.net/?view=PRODUCT_LISTING_POLICY'
        });
        break;

      case 'PRIVACY_POLICY':
        list.push({
          name: 'Legal & Policies',
          url: 'https://tradeheaven.net/?view=TERMS_OF_USE',
          view: 'TERMS_OF_USE',
          onClick: () => onNavigate('TERMS_OF_USE')
        });
        list.push({
          name: 'Privacy Statement & Data Subject Rights',
          url: 'https://tradeheaven.net/?view=PRIVACY_POLICY'
        });
        break;

      case 'TERMS_OF_USE':
        list.push({
          name: 'Legal & Policies',
          url: 'https://tradeheaven.net/?view=TERMS_OF_USE',
          view: 'TERMS_OF_USE',
          onClick: () => onNavigate('TERMS_OF_USE')
        });
        list.push({
          name: 'Terms of Use & User Agreement',
          url: 'https://tradeheaven.net/?view=TERMS_OF_USE'
        });
        break;

      case 'ONBOARD_WITH_US':
        list.push({
          name: 'Seller Hub',
          url: 'https://tradeheaven.net/?view=ONBOARD_WITH_US',
          view: 'ONBOARD_WITH_US',
          onClick: () => onNavigate('ONBOARD_WITH_US')
        });
        list.push({
          name: 'Supplier Fast-Track Onboarding',
          url: 'https://tradeheaven.net/?view=ONBOARD_WITH_US'
        });
        break;

      case 'COUNTRY_HUB':
        list.push({
          name: 'Global Sourcing',
          url: 'https://tradeheaven.net/?view=COUNTRY_HUB',
          view: 'COUNTRY_HUB',
          onClick: () => onNavigate('COUNTRY_HUB')
        });
        list.push({
          name: 'International Country Trade Hubs',
          url: 'https://tradeheaven.net/?view=COUNTRY_HUB'
        });
        break;

      case 'CLIENT_ADMIN':
        list.push({
          name: 'Admin Portal',
          url: 'https://tradeheaven.net/?view=CLIENT_ADMIN',
          view: 'CLIENT_ADMIN',
          onClick: () => onNavigate('CLIENT_ADMIN')
        });
        list.push({
          name: 'Treasury & Administrative Operations',
          url: 'https://tradeheaven.net/?view=CLIENT_ADMIN'
        });
        break;

      case 'BULK_ENTITY_CRM':
        list.push({
          name: 'Admin Portal',
          url: 'https://tradeheaven.net/?view=CLIENT_ADMIN',
          view: 'CLIENT_ADMIN',
          onClick: () => onNavigate('CLIENT_ADMIN')
        });
        list.push({
          name: 'Bulk Entity & Lead CRM',
          url: 'https://tradeheaven.net/?view=BULK_ENTITY_CRM'
        });
        break;

      case 'PLAN_PRICING_ADMIN':
        list.push({
          name: 'Admin Portal',
          url: 'https://tradeheaven.net/?view=CLIENT_ADMIN',
          view: 'CLIENT_ADMIN',
          onClick: () => onNavigate('CLIENT_ADMIN')
        });
        list.push({
          name: 'Plan & Pricing Engine',
          url: 'https://tradeheaven.net/?view=PLAN_PRICING_ADMIN'
        });
        break;

      case 'CMS_MANAGEMENT':
        list.push({
          name: 'Admin Portal',
          url: 'https://tradeheaven.net/?view=CLIENT_ADMIN',
          view: 'CLIENT_ADMIN',
          onClick: () => onNavigate('CLIENT_ADMIN')
        });
        list.push({
          name: 'Full-Site CMS Editor',
          url: 'https://tradeheaven.net/?view=CMS_MANAGEMENT'
        });
        break;

      case 'LANDING_PAGE':
        list.push({
          name: 'Overview',
          url: 'https://tradeheaven.net/?view=LANDING_PAGE'
        });
        break;

      default:
        list.push({
          name: String(activeView).replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase()),
          url: `https://tradeheaven.net/?view=${encodeURIComponent(activeView)}`
        });
        break;
    }

    return list;
  }, [
    activeView, 
    onNavigate, 
    selectedProduct, 
    selectedRfq, 
    catalogCategory, 
    catalogSearch, 
    storefrontCompanyId, 
    selectedBuyerId,
    onClearProduct,
    onClearCategory
  ]);

  // Generate Schema.org compliant BreadcrumbList JSON-LD object
  const schemaBreadcrumbList = useMemo(() => {
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      'itemListElement': items.map((item, index) => ({
        '@type': 'ListItem',
        'position': index + 1,
        'name': item.name,
        'item': item.url
      }))
    };
  }, [items]);

  const lastItemIndex = items.length - 1;

  return (
    <div id="tradeheaven-breadcrumb-container" className="w-full mb-4 sm:mb-6">
      {/* Schema.org BreadcrumbList JSON-LD injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaBreadcrumbList) }}
      />

      <nav
        aria-label="Breadcrumb"
        className="bg-white/95 backdrop-blur-xs border border-slate-200/90 rounded-2xl px-3.5 sm:px-5 py-2.5 shadow-xs flex items-center justify-between gap-3 text-xs sm:text-sm"
      >
        <ol
          className="flex items-center flex-wrap gap-1.5 sm:gap-2 min-w-0"
          itemScope
          itemType="https://schema.org/BreadcrumbList"
        >
          {items.map((item, index) => {
            const isLast = index === lastItemIndex;
            const isClickable = !isLast && (item.onClick || item.view);

            return (
              <li
                key={`${item.name}-${index}`}
                className="inline-flex items-center min-w-0"
                itemProp="itemListElement"
                itemScope
                itemType="https://schema.org/ListItem"
              >
                {index > 0 && (
                  <ChevronRight
                    aria-hidden="true"
                    className="w-3.5 h-3.5 text-slate-300 mx-1 flex-shrink-0"
                  />
                )}

                {isClickable ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      if (item.onClick) {
                        item.onClick();
                      } else if (item.view) {
                        onNavigate(item.view, { category: item.category, search: item.search, productId: item.productId });
                      }
                    }}
                    className="inline-flex items-center gap-1.5 text-slate-500 hover:text-blue-600 font-medium transition-colors cursor-pointer group focus:outline-hidden focus:text-blue-600"
                    itemProp="item"
                  >
                    {item.icon && (
                      <span className="text-slate-400 group-hover:text-blue-600 transition-colors flex-shrink-0">
                        {item.icon}
                      </span>
                    )}
                    <span itemProp="name" className="truncate max-w-[140px] sm:max-w-[200px]">
                      {item.name}
                    </span>
                  </button>
                ) : (
                  <span
                    className={`inline-flex items-center gap-1.5 font-semibold truncate ${
                      isLast ? 'text-slate-900 font-bold' : 'text-slate-700'
                    } max-w-[200px] sm:max-w-[320px] md:max-w-[480px]`}
                    aria-current={isLast ? 'page' : undefined}
                    itemProp="item"
                  >
                    {item.icon && (
                      <span className="text-slate-500 flex-shrink-0">
                        {item.icon}
                      </span>
                    )}
                    <span itemProp="name" className="truncate">
                      {item.name}
                    </span>
                  </span>
                )}

                <meta itemProp="position" content={String(index + 1)} />
              </li>
            );
          })}
        </ol>

        {/* Quick Return / Back Action for deep views */}
        {items.length > 2 && (
          <button
            type="button"
            onClick={() => {
              if (onBack) {
                onBack();
              } else if (items[lastItemIndex - 1]?.onClick) {
                items[lastItemIndex - 1].onClick!();
              } else if (items[lastItemIndex - 1]?.view) {
                onNavigate(items[lastItemIndex - 1].view!);
              } else {
                onNavigate('HOMEPAGE');
              }
            }}
            className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 bg-slate-100/80 hover:bg-slate-200/80 px-2.5 py-1 rounded-lg transition-colors flex-shrink-0 cursor-pointer"
            title="Go to previous section"
          >
            <ArrowLeft className="w-3 h-3" />
            <span>Back</span>
          </button>
        )}
      </nav>
    </div>
  );
};
