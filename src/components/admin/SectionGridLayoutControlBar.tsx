import React from 'react';
import {
  LayoutGrid,
  SlidersHorizontal,
  RotateCcw,
  ArrowRight,
  Columns,
  Rows,
  Hash,
  Play,
  Pause
} from 'lucide-react';
import type { SectionGridLayoutConfig } from '../../data/defaultSiteContent';
import { clampGridInt } from '../../utils/gridLayoutUtils';

interface SectionGridLayoutControlBarProps {
  title: string;
  subtitle?: string;
  sectionBadge?: string;
  value: SectionGridLayoutConfig;
  defaultValue: SectionGridLayoutConfig;
  supportsCarousel?: boolean;
  itemLabel?: string;
  maxColumns?: number;
  maxRows?: number;
  maxItems?: number;
  onChange: (next: SectionGridLayoutConfig) => void;
  onJumpToItemPicker?: () => void;
  jumpButtonLabel?: string;
}

export const SectionGridLayoutControlBar: React.FC<SectionGridLayoutControlBarProps> = ({
  title,
  subtitle,
  sectionBadge,
  value,
  defaultValue,
  supportsCarousel = false,
  itemLabel = 'items',
  maxColumns = 6,
  maxRows = 8,
  maxItems = 48,
  onChange,
  onJumpToItemPicker,
  jumpButtonLabel
}) => {
  const layoutMode: 'GRID' | 'CAROUSEL' =
    supportsCarousel && value.layoutMode === 'CAROUSEL' ? 'CAROUSEL' : 'GRID';
  const columns = clampGridInt(value.columns, 1, maxColumns, defaultValue.columns);
  const rows = clampGridInt(value.rows, 1, maxRows, defaultValue.rows);
  const autoSyncCount = value.autoSyncCount !== false && layoutMode === 'GRID';
  const itemCount = clampGridInt(
    autoSyncCount ? columns * rows : value.itemCount,
    1,
    maxItems,
    defaultValue.itemCount
  );
  const autoSlide = value.autoSlide !== false;

  const handleModeChange = (nextMode: 'GRID' | 'CAROUSEL') => {
    if (nextMode === 'CAROUSEL') {
      onChange({
        ...value,
        layoutMode: 'CAROUSEL',
        rows: 1,
        autoSyncCount: false,
        itemCount: Math.max(columns, itemCount)
      });
    } else {
      const nextRows = Math.max(1, rows);
      const nextCount = clampGridInt(columns * nextRows, 1, maxItems, itemCount);
      onChange({
        ...value,
        layoutMode: 'GRID',
        rows: nextRows,
        autoSyncCount: true,
        itemCount: nextCount
      });
    }
  };

  const handleColumnsChange = (nextColsRaw: number) => {
    const nextCols = clampGridInt(nextColsRaw, 1, maxColumns, columns);
    const nextItemCount =
      layoutMode === 'GRID' && autoSyncCount
        ? clampGridInt(nextCols * rows, 1, maxItems, itemCount)
        : itemCount;
    onChange({
      ...value,
      columns: nextCols,
      itemCount: nextItemCount
    });
  };

  const handleRowsChange = (nextRowsRaw: number) => {
    const nextRows = clampGridInt(nextRowsRaw, 1, maxRows, rows);
    // Increasing rows above 1 switches cleanly to GRID mode so all rows are displayed
    const nextMode: 'GRID' | 'CAROUSEL' = nextRows > 1 ? 'GRID' : layoutMode;
    const nextAutoSync = nextMode === 'GRID' ? (nextRows > 1 ? true : autoSyncCount) : false;
    const nextItemCount = nextAutoSync
      ? clampGridInt(columns * nextRows, 1, maxItems, itemCount)
      : itemCount;
    onChange({
      ...value,
      layoutMode: nextMode,
      rows: nextRows,
      autoSyncCount: nextAutoSync,
      itemCount: nextItemCount
    });
  };

  const handleItemCountChange = (nextCountRaw: number) => {
    const nextCount = clampGridInt(nextCountRaw, 1, maxItems, itemCount);
    const derivedRows =
      layoutMode === 'GRID' ? clampGridInt(Math.ceil(nextCount / columns), 1, maxRows, rows) : 1;
    onChange({
      ...value,
      rows: derivedRows,
      itemCount: nextCount,
      autoSyncCount: false
    });
  };

  const handleToggleAutoSync = () => {
    const nextAutoSync = !autoSyncCount;
    onChange({
      ...value,
      layoutMode: 'GRID',
      autoSyncCount: nextAutoSync,
      itemCount: nextAutoSync ? clampGridInt(columns * rows, 1, maxItems, itemCount) : itemCount
    });
  };

  const isDefault =
    layoutMode === (defaultValue.layoutMode || 'GRID') &&
    columns === defaultValue.columns &&
    rows === defaultValue.rows &&
    itemCount === defaultValue.itemCount &&
    autoSlide === (defaultValue.autoSlide !== false);

  const previewRowsCount = layoutMode === 'CAROUSEL' ? 1 : Math.min(rows, 4);
  const previewCellTotal = previewRowsCount * columns;

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/75 p-4 space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <LayoutGrid className="w-4 h-4 text-[#0F294D] shrink-0" />
            <h4 className="text-sm font-bold text-slate-900">{title}</h4>
            {sectionBadge && (
              <span className="text-[11px] font-mono text-slate-500">{sectionBadge}</span>
            )}
          </div>
          {subtitle && <p className="text-xs text-slate-600 mt-0.5">{subtitle}</p>}
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <span className="px-2.5 py-1 rounded-md bg-white border border-slate-200 text-xs font-semibold text-[#0F294D] tabular-nums">
            {layoutMode === 'CAROUSEL'
              ? `Carousel · ${columns} visible · ${itemCount} ${itemLabel}`
              : `${columns} cols × ${rows} row${rows === 1 ? '' : 's'} · ${itemCount} ${itemLabel}`}
          </span>

          {!isDefault && (
            <button
              type="button"
              onClick={() => onChange({ ...defaultValue })}
              className="px-2.5 py-1 rounded-md bg-white hover:bg-slate-100 text-slate-600 border border-slate-300 text-xs font-semibold inline-flex items-center gap-1 cursor-pointer whitespace-nowrap"
              title="Reset layout to default"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}

          {onJumpToItemPicker && (
            <button
              type="button"
              onClick={onJumpToItemPicker}
              className="px-2.5 py-1 rounded-md bg-[#0F294D] hover:bg-blue-900 text-white text-xs font-semibold inline-flex items-center gap-1 cursor-pointer whitespace-nowrap"
            >
              <span>{jumpButtonLabel || 'Select Items'}</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Controls Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        {/* Display Mode (Grid vs Carousel when supported) */}
        {supportsCarousel && (
          <div className="bg-white border border-slate-200 rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
              <span className="inline-flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
                <span>Display Mode</span>
              </span>
            </div>
            <div className="grid grid-cols-2 gap-1 p-0.5 bg-slate-100 rounded-md border border-slate-200">
              <button
                type="button"
                onClick={() => handleModeChange('GRID')}
                className={`px-2 py-1.5 rounded text-xs font-semibold cursor-pointer transition-colors ${
                  layoutMode === 'GRID'
                    ? 'bg-white text-[#0F294D] shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Multi-Row Grid
              </button>
              <button
                type="button"
                onClick={() => handleModeChange('CAROUSEL')}
                className={`px-2 py-1.5 rounded text-xs font-semibold cursor-pointer transition-colors ${
                  layoutMode === 'CAROUSEL'
                    ? 'bg-white text-[#0F294D] shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Carousel
              </button>
            </div>
            {layoutMode === 'CAROUSEL' && (
              <button
                type="button"
                onClick={() => onChange({ ...value, autoSlide: !autoSlide })}
                className={`w-full px-2.5 py-1 rounded-md border text-[11px] font-semibold inline-flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
                  autoSlide
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                {autoSlide ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
                <span>Auto-Slide: {autoSlide ? 'On' : 'Paused'}</span>
              </button>
            )}
          </div>
        )}

        {/* Columns Control */}
        <div className="bg-white border border-slate-200 rounded-lg p-3 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
            <span className="inline-flex items-center gap-1.5">
              <Columns className="w-3.5 h-3.5 text-slate-400" />
              <span>Columns (Desktop)</span>
            </span>
            <span className="font-mono font-bold text-[#0F294D] tabular-nums">{columns}</span>
          </div>
          <div className="flex items-center gap-1">
            {Array.from({ length: maxColumns }, (_, i) => i + 1).map(col => (
              <button
                key={col}
                type="button"
                onClick={() => handleColumnsChange(col)}
                className={`flex-1 py-1.5 rounded-md text-xs font-bold border transition-colors cursor-pointer tabular-nums ${
                  columns === col
                    ? 'bg-[#0F294D] text-white border-[#0F294D]'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {col}
              </button>
            ))}
          </div>
        </div>

        {/* Rows Control */}
        <div className="bg-white border border-slate-200 rounded-lg p-3 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
            <span className="inline-flex items-center gap-1.5">
              <Rows className="w-3.5 h-3.5 text-slate-400" />
              <span>Rows</span>
            </span>
            <span className="font-mono font-bold text-[#0F294D] tabular-nums">
              {layoutMode === 'CAROUSEL' ? '1 (Carousel)' : rows}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={rows <= 1}
              onClick={() => handleRowsChange(rows - 1)}
              className="w-8 h-8 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm disabled:opacity-40 cursor-pointer shrink-0"
              aria-label="Decrease rows"
            >
              −
            </button>
            <input
              type="number"
              min={1}
              max={maxRows}
              value={rows}
              onChange={e => handleRowsChange(Number(e.target.value))}
              className="w-full h-8 px-2 text-center text-xs font-bold text-slate-900 bg-white border border-slate-300 rounded-md tabular-nums focus:outline-none focus:ring-2 focus:ring-[#0F294D]/20 focus:border-[#0F294D]"
            />
            <button
              type="button"
              disabled={rows >= maxRows}
              onClick={() => handleRowsChange(rows + 1)}
              className="w-8 h-8 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm disabled:opacity-40 cursor-pointer shrink-0"
              aria-label="Increase rows"
            >
              +
            </button>
          </div>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4].filter(r => r <= maxRows).map(r => (
              <button
                key={r}
                type="button"
                onClick={() => handleRowsChange(r)}
                className={`flex-1 py-0.5 rounded text-[11px] font-semibold border cursor-pointer tabular-nums ${
                  rows === r && layoutMode === 'GRID'
                    ? 'bg-blue-50 text-[#0F294D] border-blue-300'
                    : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {r}R
              </button>
            ))}
          </div>
        </div>

        {/* Exact Item Count Control */}
        <div className="bg-white border border-slate-200 rounded-lg p-3 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
            <span className="inline-flex items-center gap-1.5">
              <Hash className="w-3.5 h-3.5 text-slate-400" />
              <span className="capitalize">Total {itemLabel}</span>
            </span>
            <span className="font-mono font-bold text-[#0F294D] tabular-nums">{itemCount}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={itemCount <= 1}
              onClick={() => handleItemCountChange(itemCount - 1)}
              className="w-8 h-8 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm disabled:opacity-40 cursor-pointer shrink-0"
              aria-label={`Decrease ${itemLabel}`}
            >
              −
            </button>
            <input
              type="number"
              min={1}
              max={maxItems}
              value={itemCount}
              onChange={e => handleItemCountChange(Number(e.target.value))}
              className="w-full h-8 px-2 text-center text-xs font-bold text-slate-900 bg-white border border-slate-300 rounded-md tabular-nums focus:outline-none focus:ring-2 focus:ring-[#0F294D]/20 focus:border-[#0F294D]"
            />
            <button
              type="button"
              disabled={itemCount >= maxItems}
              onClick={() => handleItemCountChange(itemCount + 1)}
              className="w-8 h-8 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm disabled:opacity-40 cursor-pointer shrink-0"
              aria-label={`Increase ${itemLabel}`}
            >
              +
            </button>
          </div>
          {layoutMode === 'GRID' && (
            <label className="flex items-center gap-1.5 text-[11px] text-slate-600 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={autoSyncCount}
                onChange={handleToggleAutoSync}
                className="rounded border-slate-300 text-[#0F294D] focus:ring-[#0F294D]"
              />
              <span>Auto-match Rows × Columns ({columns * rows})</span>
            </label>
          )}
        </div>
      </div>

      {/* Compact Visual Blueprint Strip */}
      <div className="flex items-center justify-between gap-3 pt-1">
        <div
          className="grid gap-1 flex-1 max-w-xs"
          style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
          aria-hidden="true"
        >
          {Array.from({ length: previewCellTotal }).map((_, idx) => {
            const active = idx < itemCount;
            return (
              <div
                key={idx}
                className={`h-2.5 rounded-xs ${
                  active ? 'bg-[#0F294D]/80' : 'bg-slate-200'
                }`}
              />
            );
          })}
        </div>
        <span className="text-[11px] text-slate-500 tabular-nums">
          {layoutMode === 'CAROUSEL'
            ? `Shows ${columns} per view, sliding across ${itemCount} selected ${itemLabel}`
            : `Displays up to ${itemCount} ${itemLabel} in ${columns} column${columns === 1 ? '' : 's'} × ${rows} row${rows === 1 ? '' : 's'}`}
        </span>
      </div>
    </div>
  );
};
