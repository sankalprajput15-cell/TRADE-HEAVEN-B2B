/**
 * Lightweight Viewport & Table Layout Containment Utility
 *
 * Keeps wide <table> elements horizontally scrollable inside their wrapper
 * without ever scanning all DOM nodes or interleaving forced reflows on
 * MutationObserver / class changes.
 */

function isIntentionalHorizontalScroller(el: HTMLElement): boolean {
  return (
    el.classList.contains('no-scrollbar') ||
    el.classList.contains('overflow-x-auto') ||
    el.classList.contains('overflow-x-scroll') ||
    el.hasAttribute('data-allow-horizontal-scroll')
  );
}

export function runAutoLayoutContainmentPass(): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  const root = document.getElementById('root');
  if (!root) return;

  const tables = root.querySelectorAll('table');
  if (tables.length === 0) return;

  // Batch DOM reads first to prevent forced synchronous layout thrashing
  const parentsToWrap: HTMLElement[] = [];
  for (let i = 0; i < tables.length; i++) {
    const table = tables[i] as HTMLElement;
    const parent = table.parentElement;
    if (!parent || isIntentionalHorizontalScroller(parent)) continue;
    if (table.offsetWidth > parent.clientWidth + 2) {
      parentsToWrap.push(parent);
    }
  }

  // Batch DOM writes after reads
  for (let i = 0; i < parentsToWrap.length; i++) {
    const parent = parentsToWrap[i];
    if (parent.style.overflowX !== 'auto') parent.style.overflowX = 'auto';
    if (parent.style.maxWidth !== '100%') parent.style.maxWidth = '100%';
    if (parent.style.minWidth !== '0px') parent.style.minWidth = '0px';
  }
}

export function installGlobalAutoLayoutContainment(): () => void {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return () => {};
  }

  let timeoutId: number | null = null;

  const schedulePass = () => {
    if (timeoutId !== null) return;
    timeoutId = window.setTimeout(() => {
      timeoutId = null;
      runAutoLayoutContainmentPass();
    }, 400);
  };

  // Run once after initial paint and on window resize only (zero MutationObserver thrash)
  schedulePass();
  window.addEventListener('resize', schedulePass, { passive: true });

  return () => {
    if (timeoutId !== null) {
      window.clearTimeout(timeoutId);
      timeoutId = null;
    }
    window.removeEventListener('resize', schedulePass);
  };
}
