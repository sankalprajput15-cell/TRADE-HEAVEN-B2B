/**
 * Global Automatic Viewport & Layout Containment Engine
 *
 * Continuously ensures that any dynamic content, tables, flex rows, grid panels,
 * form controls, media, or floating popovers rendered inside the application stay
 * cleanly inside their parent layout and viewport boundaries across all screen sizes.
 */

const SKIP_TAGS = new Set([
  'HTML',
  'HEAD',
  'BODY',
  'SCRIPT',
  'STYLE',
  'META',
  'LINK',
  'SVG',
  'PATH',
  'CIRCLE',
  'RECT',
  'LINE',
  'POLYGON',
  'POLYLINE',
  'OPTION',
  'OPTGROUP',
  'BR',
  'HR'
]);

function isIntentionalHorizontalScroller(el: HTMLElement, computed: CSSStyleDeclaration): boolean {
  if (
    el.classList.contains('no-scrollbar') ||
    el.classList.contains('overflow-x-auto') ||
    el.classList.contains('overflow-x-scroll') ||
    el.hasAttribute('data-allow-horizontal-scroll')
  ) {
    return true;
  }
  return computed.overflowX === 'auto' || computed.overflowX === 'scroll';
}

function hasScrollableAncestorBeforeMain(el: HTMLElement, rootBoundary: HTMLElement): boolean {
  let curr: HTMLElement | null = el.parentElement;
  while (curr && curr !== rootBoundary && curr !== document.body) {
    const cs = window.getComputedStyle(curr);
    if (isIntentionalHorizontalScroller(curr, cs)) {
      return true;
    }
    curr = curr.parentElement;
  }
  return false;
}

export function runAutoLayoutContainmentPass(): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  const root = document.getElementById('root');
  if (!root) return;

  const vw = document.documentElement.clientWidth || window.innerWidth;
  if (!vw || vw <= 0) return;

  // 1. Ensure wide tables always scroll cleanly inside their parent wrapper instead of blowing out layout
  const tables = root.querySelectorAll('table');
  tables.forEach(tableEl => {
    const table = tableEl as HTMLElement;
    const parent = table.parentElement;
    if (!parent) return;
    const parentStyle = window.getComputedStyle(parent);
    if (!isIntentionalHorizontalScroller(parent, parentStyle) && table.offsetWidth > parent.clientWidth + 2) {
      if (parent.style.overflowX !== 'auto') parent.style.overflowX = 'auto';
      if (parent.style.maxWidth !== '100%') parent.style.maxWidth = '100%';
      if (parent.style.minWidth !== '0px') parent.style.minWidth = '0px';
    }
  });

  // 2. Keep all elements inside <main> and <footer> within parent/viewport width automatically
  const regionList = root.querySelectorAll('main, footer');
  regionList.forEach(regionNode => {
    const regionEl = regionNode as HTMLElement;
    const regionRect = regionEl.getBoundingClientRect();
    const maxRight = Math.min(vw, regionRect.right > 0 ? regionRect.right : vw);

    if (regionEl.style.minWidth !== '0px') regionEl.style.minWidth = '0px';
    if (regionEl.style.maxWidth !== '100%') regionEl.style.maxWidth = '100%';

    const elements = regionEl.querySelectorAll('*');
    for (let i = 0; i < elements.length; i++) {
      const el = elements[i] as HTMLElement;
      if (SKIP_TAGS.has(el.tagName)) continue;
      const cs = window.getComputedStyle(el);
      if (cs.position === 'fixed' || cs.display === 'none') continue;
      if (el.offsetParent === null) continue;
      if (isIntentionalHorizontalScroller(el, cs)) continue;
      if (hasScrollableAncestorBeforeMain(el, regionEl)) continue;

      const rect = el.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) continue;

      const parent = el.parentElement;
      const parentRect = parent ? parent.getBoundingClientRect() : null;
      const parentStyle = parent ? window.getComputedStyle(parent) : null;
      const parentClips =
        parentStyle && (parentStyle.overflowX === 'hidden' || parentStyle.overflowX === 'clip');

      const overflowsViewport = rect.right > maxRight + 2 || rect.left < -2;
      const overflowsParent =
        Boolean(parentRect && parentRect.width > 0 && rect.right > parentRect.right + 2 && !parentClips);
      const overflowsOwnBox = el.scrollWidth > el.clientWidth + 3 && el.clientWidth > 0;

      if (!overflowsViewport && !overflowsParent && !overflowsOwnBox) continue;

      if (el.tagName === 'SELECT' || el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        if (el.style.minWidth !== '0px') el.style.minWidth = '0px';
        if (el.style.maxWidth !== '100%') el.style.maxWidth = '100%';
      } else if (el.tagName === 'BUTTON' || el.tagName === 'A' || el.tagName === 'SPAN') {
        if (overflowsViewport || overflowsParent) {
          if (el.style.minWidth !== '0px') el.style.minWidth = '0px';
          if (el.style.maxWidth !== '100%') el.style.maxWidth = '100%';
          if (cs.whiteSpace === 'nowrap') el.style.whiteSpace = 'normal';
          if (el.style.overflowWrap !== 'anywhere') el.style.overflowWrap = 'anywhere';
        }
      } else if (cs.display === 'flex' || cs.display === 'inline-flex') {
        if (el.style.minWidth !== '0px') el.style.minWidth = '0px';
        if (el.style.maxWidth !== '100%') el.style.maxWidth = '100%';
        if (cs.flexWrap === 'nowrap' && (overflowsOwnBox || overflowsViewport || overflowsParent)) {
          el.style.flexWrap = 'wrap';
        }
      } else if (cs.display === 'grid' || cs.display === 'inline-grid') {
        if (el.style.minWidth !== '0px') el.style.minWidth = '0px';
        if (el.style.maxWidth !== '100%') el.style.maxWidth = '100%';
      } else if (overflowsViewport || overflowsParent) {
        if (el.style.minWidth !== '0px') el.style.minWidth = '0px';
        if (el.style.maxWidth !== '100%') el.style.maxWidth = '100%';
        if (el.style.overflowWrap !== 'anywhere') el.style.overflowWrap = 'anywhere';
      }

      // Walk up immediate non-scrolling flex/grid ancestors so none retain min-width:auto
      let anc: HTMLElement | null = parent;
      let depth = 0;
      while (anc && anc !== regionEl && depth < 6) {
        const aStyle = window.getComputedStyle(anc);
        if (isIntentionalHorizontalScroller(anc, aStyle)) break;
        if (aStyle.display.includes('flex') || aStyle.display.includes('grid')) {
          if (anc.style.minWidth !== '0px') anc.style.minWidth = '0px';
          if (anc.style.maxWidth !== '100%') anc.style.maxWidth = '100%';
        }
        anc = anc.parentElement;
        depth++;
      }
    }
  });

  // 3. Keep floating dropdowns/popovers within viewport horizontal edges
  const floatingCandidates = root.querySelectorAll<HTMLElement>(
    '[role="menu"], [role="listbox"], .z-50, .z-\\[100\\], .z-\\[9998\\], .z-\\[9999\\]'
  );
  floatingCandidates.forEach(el => {
    const cs = window.getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden') return;
    if (cs.position !== 'absolute' && cs.position !== 'fixed') return;
    // Skip full-viewport backdrops (inset-0)
    if (el.classList.contains('inset-0')) return;

    const rect = el.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;

    if (rect.width > vw - 16) {
      el.style.maxWidth = `${Math.max(240, vw - 16)}px`;
    }
    const updatedRect = el.getBoundingClientRect();
    if (updatedRect.right > vw - 8 && cs.position === 'absolute') {
      el.style.right = '0px';
      el.style.left = 'auto';
    } else if (updatedRect.left < 8 && cs.position === 'absolute') {
      el.style.left = '0px';
      el.style.right = 'auto';
    }
  });
}

export function installGlobalAutoLayoutContainment(): () => void {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return () => {};
  }

  let rafId = 0;
  let running = false;

  const schedulePass = () => {
    if (running || rafId) return;
    rafId = window.requestAnimationFrame(() => {
      rafId = 0;
      running = true;
      try {
        runAutoLayoutContainmentPass();
      } finally {
        running = false;
      }
    });
  };

  schedulePass();

  const root = document.getElementById('root') || document.body;
  const mutationObserver = new MutationObserver(mutations => {
    if (running) return;
    const hasRelevantMutation = mutations.some(
      m => m.type === 'childList' || (m.type === 'attributes' && m.attributeName === 'class')
    );
    if (hasRelevantMutation) {
      schedulePass();
    }
  });

  mutationObserver.observe(root, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['class']
  });

  const resizeObserver =
    typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => schedulePass()) : null;
  resizeObserver?.observe(document.documentElement);

  window.addEventListener('resize', schedulePass, { passive: true });
  window.visualViewport?.addEventListener('resize', schedulePass, { passive: true });

  return () => {
    if (rafId) window.cancelAnimationFrame(rafId);
    mutationObserver.disconnect();
    resizeObserver?.disconnect();
    window.removeEventListener('resize', schedulePass);
    window.visualViewport?.removeEventListener('resize', schedulePass);
  };
}
