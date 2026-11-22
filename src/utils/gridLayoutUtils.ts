import type { SectionGridLayoutConfig, SiteSectionLayouts, HomepageDisplayConfig } from '../data/defaultSiteContent';
import { DEFAULT_HOMEPAGE_DISPLAY_CONFIG, DEFAULT_SITE_SECTION_LAYOUTS } from '../data/defaultSiteContent';

/**
 * Static Tailwind responsive grid column classes for 1 to 6 desktop columns.
 * Never use template interpolation like `lg:grid-cols-${n}` because Tailwind
 * only emits classes that exist as static string literals in source files.
 */
const RESPONSIVE_GRID_COLS_MAP: Record<number, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
  5: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5',
  6: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6'
};

/**
 * Slightly narrower grid map used inside directory views that also have a left filter sidebar.
 */
const SIDEBAR_GRID_COLS_MAP: Record<number, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  5: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5',
  6: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 2xl:grid-cols-6'
};

export function clampGridInt(value: unknown, min: number, max: number, fallback: number): number {
  const num = Number(value);
  if (!Number.isFinite(num)) return fallback;
  return Math.max(min, Math.min(max, Math.round(num)));
}

export function getResponsiveGridColsClass(columns: number, hasSidebar = false): string {
  const safeCols = clampGridInt(columns, 1, 6, 4);
  return hasSidebar
    ? SIDEBAR_GRID_COLS_MAP[safeCols] || SIDEBAR_GRID_COLS_MAP[3]
    : RESPONSIVE_GRID_COLS_MAP[safeCols] || RESPONSIVE_GRID_COLS_MAP[4];
}

export function resolveSectionLayout(
  raw: Partial<SectionGridLayoutConfig> | undefined | null,
  fallback: SectionGridLayoutConfig
): SectionGridLayoutConfig {
  const columns = clampGridInt(raw?.columns, 1, 6, fallback.columns);
  const rows = clampGridInt(raw?.rows, 1, 10, fallback.rows);
  const layoutMode: 'GRID' | 'CAROUSEL' =
    raw?.layoutMode === 'CAROUSEL' || raw?.layoutMode === 'GRID'
      ? raw.layoutMode
      : fallback.layoutMode || 'GRID';
  const autoSyncCount =
    typeof raw?.autoSyncCount === 'boolean'
      ? raw.autoSyncCount
      : Boolean(fallback.autoSyncCount);
  const computedCount = autoSyncCount && layoutMode === 'GRID' ? columns * rows : raw?.itemCount;
  const itemCount = clampGridInt(computedCount, 1, 60, fallback.itemCount);
  const autoSlide =
    typeof raw?.autoSlide === 'boolean' ? raw.autoSlide : fallback.autoSlide !== false;
  const autoSlideIntervalMs = clampGridInt(
    raw?.autoSlideIntervalMs,
    1500,
    20000,
    fallback.autoSlideIntervalMs || 4500
  );

  return {
    layoutMode,
    columns,
    rows,
    itemCount,
    autoSyncCount,
    autoSlide,
    autoSlideIntervalMs
  };
}

export function mergeHomepageDisplayConfig(
  raw?: Partial<HomepageDisplayConfig> | null
): HomepageDisplayConfig {
  const rawLayouts = (raw?.sectionLayouts || {}) as Partial<SiteSectionLayouts>;
  return {
    ...DEFAULT_HOMEPAGE_DISPLAY_CONFIG,
    ...(raw || {}),
    pinnedProductIds: Array.isArray(raw?.pinnedProductIds)
      ? raw.pinnedProductIds
      : DEFAULT_HOMEPAGE_DISPLAY_CONFIG.pinnedProductIds,
    hiddenProductIds: Array.isArray(raw?.hiddenProductIds)
      ? raw.hiddenProductIds
      : DEFAULT_HOMEPAGE_DISPLAY_CONFIG.hiddenProductIds,
    pinnedRfqIds: Array.isArray(raw?.pinnedRfqIds)
      ? raw.pinnedRfqIds
      : DEFAULT_HOMEPAGE_DISPLAY_CONFIG.pinnedRfqIds,
    hiddenRfqIds: Array.isArray(raw?.hiddenRfqIds)
      ? raw.hiddenRfqIds
      : DEFAULT_HOMEPAGE_DISPLAY_CONFIG.hiddenRfqIds,
    pinnedSupplierIds: Array.isArray(raw?.pinnedSupplierIds)
      ? raw.pinnedSupplierIds
      : DEFAULT_HOMEPAGE_DISPLAY_CONFIG.pinnedSupplierIds,
    hiddenSupplierIds: Array.isArray(raw?.hiddenSupplierIds)
      ? raw.hiddenSupplierIds
      : DEFAULT_HOMEPAGE_DISPLAY_CONFIG.hiddenSupplierIds,
    pinnedCategoryIds: Array.isArray(raw?.pinnedCategoryIds)
      ? raw.pinnedCategoryIds
      : DEFAULT_HOMEPAGE_DISPLAY_CONFIG.pinnedCategoryIds || [],
    hiddenCategoryIds: Array.isArray(raw?.hiddenCategoryIds)
      ? raw.hiddenCategoryIds
      : DEFAULT_HOMEPAGE_DISPLAY_CONFIG.hiddenCategoryIds || [],
    sectionVisibility: {
      ...DEFAULT_HOMEPAGE_DISPLAY_CONFIG.sectionVisibility,
      ...(raw?.sectionVisibility || {})
    },
    sectionLayouts: {
      featuredProducts: resolveSectionLayout(
        rawLayouts.featuredProducts,
        DEFAULT_SITE_SECTION_LAYOUTS.featuredProducts
      ),
      recentRfqs: resolveSectionLayout(
        rawLayouts.recentRfqs,
        DEFAULT_SITE_SECTION_LAYOUTS.recentRfqs
      ),
      categoryShowcase: resolveSectionLayout(
        rawLayouts.categoryShowcase,
        DEFAULT_SITE_SECTION_LAYOUTS.categoryShowcase
      ),
      verifiedSuppliers: resolveSectionLayout(
        rawLayouts.verifiedSuppliers,
        DEFAULT_SITE_SECTION_LAYOUTS.verifiedSuppliers
      ),
      productsDirectory: resolveSectionLayout(
        rawLayouts.productsDirectory,
        DEFAULT_SITE_SECTION_LAYOUTS.productsDirectory
      ),
      buyLeadsDirectory: resolveSectionLayout(
        rawLayouts.buyLeadsDirectory,
        DEFAULT_SITE_SECTION_LAYOUTS.buyLeadsDirectory
      ),
      suppliersDirectory: resolveSectionLayout(
        rawLayouts.suppliersDirectory,
        DEFAULT_SITE_SECTION_LAYOUTS.suppliersDirectory
      )
    }
  };
}
