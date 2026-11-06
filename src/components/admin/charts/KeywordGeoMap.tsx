import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import { SeoGeoTraffic } from '../../../services/autoSeoEngine';
import { Globe, TrendingUp, TrendingDown, Minus, RefreshCw, Clock, Building2, Package } from 'lucide-react';

interface KeywordGeoMapProps {
  data: SeoGeoTraffic[];
  totalSessions: number;
  lastUpdatedAt?: string;
  nextScheduledUpdateAt?: string;
  onRefreshGeo?: () => void;
}

const TOPOJSON_NAME_ALIASES: Record<string, string[]> = {
  'United States': ['United States of America', 'United States', 'USA'],
  'United Kingdom': ['United Kingdom', 'Great Britain', 'UK'],
  'South Korea': ['South Korea', 'Korea', 'Republic of Korea'],
  'Russia': ['Russia', 'Russian Federation'],
  'Vietnam': ['Vietnam', 'Viet Nam'],
  'United Arab Emirates': ['United Arab Emirates', 'UAE'],
  'Turkey': ['Turkey', 'Türkiye']
};

export const KeywordGeoMap: React.FC<KeywordGeoMapProps> = ({
  data,
  totalSessions,
  lastUpdatedAt,
  nextScheduledUpdateAt,
  onRefreshGeo
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredCountry, setHoveredCountry] = useState<{
    name: string;
    traffic: number;
    keywords: number;
    suppliers: number;
    products: number;
  } | null>(null);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth || 800;
    const height = 400;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const projection = d3.geoMercator()
      .scale(width / 6.3)
      .translate([width / 2, height / 1.48]);

    const path = d3.geoPath().projection(projection);

    const maxTraffic = Math.max(...data.map(d => d.organicTraffic), 1000);
    const colorScale = d3.scaleThreshold<number, string>()
      .domain([
        Math.round(maxTraffic * 0.08),
        Math.round(maxTraffic * 0.2),
        Math.round(maxTraffic * 0.4),
        Math.round(maxTraffic * 0.65),
        Math.round(maxTraffic * 0.85)
      ])
      .range(['#dbeafe', '#93c5fd', '#60a5fa', '#3b82f6', '#2563eb', '#1d4ed8']);

    const lookupByTopoName = new Map<string, SeoGeoTraffic>();
    for (const item of data) {
      lookupByTopoName.set(item.countryName.toLowerCase(), item);
      const aliases = TOPOJSON_NAME_ALIASES[item.countryName];
      if (aliases) {
        for (const alias of aliases) {
          lookupByTopoName.set(alias.toLowerCase(), item);
        }
      }
    }

    let isMounted = true;

    d3.json('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json')
      .then((worldData: any) => {
        if (!isMounted || !worldData) return;
        const countries = topojson.feature(worldData, worldData.objects.countries) as any;

        svg.append('g')
          .selectAll('path')
          .data(countries.features)
          .enter()
          .append('path')
          .attr('d', path as any)
          .attr('fill', (d: any) => {
            const rawName = String(d?.properties?.name || '').toLowerCase();
            const matched = lookupByTopoName.get(rawName);
            return matched && matched.organicTraffic > 0 ? colorScale(matched.organicTraffic) : '#f1f5f9';
          })
          .attr('stroke', '#cbd5e1')
          .attr('stroke-width', 0.6)
          .style('cursor', 'pointer')
          .on('mouseover', function (_event, d: any) {
            const rawName = String(d?.properties?.name || '');
            const matched = lookupByTopoName.get(rawName.toLowerCase());
            d3.select(this)
              .attr('stroke', '#0f172a')
              .attr('stroke-width', 1.5);

            setHoveredCountry({
              name: matched?.countryName || rawName,
              traffic: matched?.organicTraffic || 0,
              keywords: matched?.keywordCount || 0,
              suppliers: matched?.suppliersCount || 0,
              products: matched?.productsCount || 0
            });
          })
          .on('mouseout', function () {
            d3.select(this)
              .attr('stroke', '#cbd5e1')
              .attr('stroke-width', 0.6);
            setHoveredCountry(null);
          });
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [data]);

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <Globe className="w-5 h-5 text-blue-600" />
            <h3 className="font-black text-slate-900 text-lg tracking-tight">
              Keyword Geo-Distribution Map (D3.js Global Trade Corridors)
            </h3>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-black uppercase tracking-wider">
              <Clock className="w-3 h-3" /> Auto-Runs Every 24h
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Computed from active Trade Heaven Country Portals ({data.length} nations), verified exporter directories, and indexed product keywords.
          </p>
        </div>

        <div className="flex items-center gap-4 flex-wrap">
          {onRefreshGeo && (
            <button
              type="button"
              onClick={onRefreshGeo}
              className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-black flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-blue-600" />
              <span>Recalculate Geo Data</span>
            </button>
          )}
          <div className="text-right">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Computed Organic Reach
            </div>
            <div className="text-xl font-black text-slate-900 font-mono tabular-nums tracking-tighter">
              {totalSessions.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Map Container */}
        <div
          ref={containerRef}
          className="xl:col-span-8 bg-slate-50/70 rounded-2xl border border-slate-200/80 overflow-hidden relative min-h-[400px]"
        >
          <svg
            ref={svgRef}
            className="w-full h-full"
            viewBox="0 0 800 400"
            preserveAspectRatio="xMidYMid meet"
          />

          {/* Interactive Country Hover Readout */}
          {hoveredCountry && (
            <div className="absolute top-4 right-4 bg-slate-900/95 text-white px-4 py-3 rounded-xl shadow-lg border border-slate-700 text-xs space-y-1 pointer-events-none">
              <div className="font-black text-sm text-sky-400">{hoveredCountry.name}</div>
              <div className="font-mono tabular-nums text-[11px] text-slate-200">
                Organic Reach: <span className="font-black text-white">{hoveredCountry.traffic.toLocaleString()}</span>
              </div>
              <div className="font-mono tabular-nums text-[11px] text-slate-300">
                Indexed Keywords: <span className="font-bold text-emerald-400">{hoveredCountry.keywords.toLocaleString()}</span>
              </div>
              {hoveredCountry.suppliers > 0 && (
                <div className="font-mono tabular-nums text-[10px] text-slate-400">
                  {hoveredCountry.suppliers.toLocaleString()} Suppliers • {hoveredCountry.products.toLocaleString()} Products
                </div>
              )}
            </div>
          )}

          {/* Legend & Daily Schedule Footer */}
          <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
            <div className="bg-white/95 backdrop-blur-xs p-3 rounded-xl border border-slate-200 space-y-1.5 shadow-2xs">
              <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                Portal Organic Density
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-slate-500">Low</span>
                <div className="flex gap-0.5">
                  {['#f1f5f9', '#dbeafe', '#93c5fd', '#60a5fa', '#3b82f6', '#2563eb', '#1d4ed8'].map(c => (
                    <div key={c} className="w-4 h-2.5 rounded-xs border border-slate-200/50" style={{ backgroundColor: c }} />
                  ))}
                </div>
                <span className="text-[10px] font-bold text-slate-700">High</span>
              </div>
            </div>

            {lastUpdatedAt && (
              <div className="bg-white/95 backdrop-blur-xs px-3 py-2 rounded-xl border border-slate-200 text-[10px] font-bold text-slate-600 font-mono tabular-nums shadow-2xs">
                Last Daily Sync: {new Date(lastUpdatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                {nextScheduledUpdateAt && (
                  <span className="text-slate-400 ml-2">
                    • Next: {new Date(nextScheduledUpdateAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* List Breakdown */}
        <div className="xl:col-span-4 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-widest">
              Active Country Portals ({data.length})
            </h4>
            <span className="text-[10px] font-bold text-slate-400">Live Portal Data</span>
          </div>
          <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1.5 custom-scrollbar">
            {[...data]
              .sort((a, b) => b.organicTraffic - a.organicTraffic)
              .map((country, idx) => (
                <div
                  key={`${country.countryCode}-${country.countryName}`}
                  className="group p-3 rounded-2xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center font-black text-[10px] text-slate-600 group-hover:bg-blue-600 group-hover:text-white shrink-0 font-mono tabular-nums">
                      {idx + 1}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-black text-slate-800 truncate flex items-center gap-1.5">
                        <span>{country.countryName}</span>
                        <span className="text-[10px] font-mono text-slate-400">({country.countryCode})</span>
                      </div>
                      <div className="text-[10px] font-bold text-slate-500 flex items-center gap-2 mt-0.5 font-mono tabular-nums">
                        <span>{country.keywordCount.toLocaleString()} KWs</span>
                        {country.suppliersCount !== undefined && (
                          <span className="inline-flex items-center gap-0.5 text-slate-400">
                            • <Building2 className="w-2.5 h-2.5" /> {country.suppliersCount.toLocaleString()}
                          </span>
                        )}
                        {country.productsCount !== undefined && (
                          <span className="inline-flex items-center gap-0.5 text-slate-400">
                            • <Package className="w-2.5 h-2.5" /> {country.productsCount.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xs font-black text-slate-900 font-mono tabular-nums">
                      {country.organicTraffic.toLocaleString()}
                    </div>
                    <div
                      className={`text-[9px] font-black flex items-center justify-end gap-0.5 ${
                        country.trend === 'up'
                          ? 'text-emerald-600'
                          : country.trend === 'down'
                          ? 'text-rose-600'
                          : 'text-slate-400'
                      }`}
                    >
                      {country.trend === 'up' ? (
                        <TrendingUp className="w-2.5 h-2.5" />
                      ) : country.trend === 'down' ? (
                        <TrendingDown className="w-2.5 h-2.5" />
                      ) : (
                        <Minus className="w-2.5 h-2.5" />
                      )}
                      {country.trend.toUpperCase()}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};
