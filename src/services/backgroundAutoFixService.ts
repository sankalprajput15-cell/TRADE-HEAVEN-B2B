import {
  autoFixSiteImages,
  SiteImageAutoFixItemInput,
  SiteImageAutoFixRowResult,
  UnifiedSiteImageTargetType
} from './siteImageControlService';
import { productImageManagerService } from './productImageManagerService';
import { isSyntheticSpecCardOrPlaceholder } from './visualProductImageService';

export type SiteImageTargetType = UnifiedSiteImageTargetType;

export interface BackgroundAutoFixItem extends SiteImageAutoFixItemInput {
  type: SiteImageTargetType;
}

export interface BackgroundAutoFixSessionChange {
  changedAt: number;
  action: 'UPLOAD' | 'AUTO_FIX' | 'URL';
  deletedOldCount: number;
}

export interface BackgroundAutoFixSnapshot {
  active: boolean;
  stopping: boolean;
  mode: 'idle' | 'server-job' | 'local-background';
  jobId: string;
  total: number;
  completed: number;
  fixed: number;
  failed: number;
  deletedOld: number;
  currentLabel: string;
  currentItemId: string;
  queuedIds: string[];
  sessionChanges: Record<string, BackgroundAutoFixSessionChange>;
  skippedItems: Record<string, { reason: string; at: number }>;
  totalDeletedFilesSession: number;
  lastCompletedNotice: {
    type: 'success' | 'error' | 'info';
    text: string;
    fixed: number;
    failed: number;
    total: number;
    deletedOld: number;
    at: number;
  } | null;
}

interface ServerJobPayload {
  jobId: string;
  active: boolean;
  cancelRequested: boolean;
  total: number;
  completed: number;
  fixed: number;
  failed: number;
  deletedOld: number;
  currentLabel: string;
  currentItemId: string;
  queuedIds: string[];
  results: SiteImageAutoFixRowResult[];
}

const STORAGE_KEY = 'tradeheaven_bg_autofix_state_v1';

type SnapshotListener = (snapshot: BackgroundAutoFixSnapshot) => void;

class BackgroundAutoFixService {
  private listeners = new Set<SnapshotListener>();
  private pollTimer: number | null = null;
  private localWorkerRunning = false;
  private localQueue: BackgroundAutoFixItem[] = [];
  private localStopRequested = false;
  private processedServerResultKeys = new Set<string>();
  private siteContentRefresher: (() => Promise<void>) | null = null;
  private bootHydrated = false;
  private lastServerOverridesSyncAt = 0;
  private lastSyncedFixedCount = 0;

  private state: BackgroundAutoFixSnapshot = {
    active: false,
    stopping: false,
    mode: 'idle',
    jobId: '',
    total: 0,
    completed: 0,
    fixed: 0,
    failed: 0,
    deletedOld: 0,
    currentLabel: '',
    currentItemId: '',
    queuedIds: [],
    sessionChanges: {},
    skippedItems: {},
    totalDeletedFilesSession: 0,
    lastCompletedNotice: null
  };

  constructor() {
    this.loadPersistedSession();
  }

  private loadPersistedSession() {
    if (typeof window === 'undefined') return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        this.state = {
          ...this.state,
          jobId: typeof parsed.jobId === 'string' ? parsed.jobId : '',
          sessionChanges:
            parsed.sessionChanges && typeof parsed.sessionChanges === 'object' ? parsed.sessionChanges : {},
          skippedItems:
            parsed.skippedItems && typeof parsed.skippedItems === 'object' ? parsed.skippedItems : {},
          totalDeletedFilesSession: Number(parsed.totalDeletedFilesSession || 0) || 0,
          lastCompletedNotice: parsed.lastCompletedNotice || null
        };
      }
    } catch {
      // Ignore storage errors
    }
  }

  private persistSession() {
    if (typeof window === 'undefined') return;
    try {
      // Trim sessionChanges / skippedItems maps to latest 500 entries so localStorage stays compact
      const trimMap = <T,>(obj: Record<string, T>): Record<string, T> => {
        const entries = Object.entries(obj);
        if (entries.length <= 500) return obj;
        return Object.fromEntries(entries.slice(-500));
      };
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          jobId: this.state.jobId,
          sessionChanges: trimMap(this.state.sessionChanges),
          skippedItems: trimMap(this.state.skippedItems),
          totalDeletedFilesSession: this.state.totalDeletedFilesSession,
          lastCompletedNotice: this.state.lastCompletedNotice
        })
      );
    } catch {
      // Ignore quota errors
    }
  }

  private emit() {
    this.persistSession();
    const snap = this.getSnapshot();
    for (const listener of this.listeners) {
      try {
        listener(snap);
      } catch {
        // Ignore individual subscriber errors
      }
    }
  }

  public getSnapshot(): BackgroundAutoFixSnapshot {
    return {
      ...this.state,
      queuedIds: [...this.state.queuedIds],
      sessionChanges: { ...this.state.sessionChanges },
      skippedItems: { ...this.state.skippedItems }
    };
  }

  public subscribe(listener: SnapshotListener): () => void {
    this.listeners.add(listener);
    listener(this.getSnapshot());
    return () => {
      this.listeners.delete(listener);
    };
  }

  public registerSiteContentRefresher(refresher: (() => Promise<void>) | null) {
    this.siteContentRefresher = refresher;
  }

  public dismissNotice() {
    if (!this.state.lastCompletedNotice) return;
    this.state.lastCompletedNotice = null;
    this.emit();
  }

  public clearSkippedItem(id: string) {
    if (!id || !this.state.skippedItems[id]) return;
    const next = { ...this.state.skippedItems };
    delete next[id];
    this.state.skippedItems = next;
    this.emit();
  }

  public clearAllSkipped() {
    if (Object.keys(this.state.skippedItems).length === 0) return;
    this.state.skippedItems = {};
    this.emit();
  }

  public recordManualSessionChange(
    entries: Array<{
      id: string;
      deletedOldCount?: number;
      action: 'UPLOAD' | 'AUTO_FIX' | 'URL';
    }>
  ) {
    if (entries.length === 0) return;
    const now = Date.now();
    const nextChanges = { ...this.state.sessionChanges };
    const nextSkipped = { ...this.state.skippedItems };
    let deletedDelta = 0;

    for (const e of entries) {
      const del = Number(e.deletedOldCount || 0) || 0;
      deletedDelta += del;
      nextChanges[e.id] = {
        changedAt: now,
        action: e.action,
        deletedOldCount: del
      };
      delete nextSkipped[e.id];
    }

    this.state.sessionChanges = nextChanges;
    this.state.skippedItems = nextSkipped;
    this.state.totalDeletedFilesSession += deletedDelta;
    this.emit();
  }

  private applyProcessedResultRows(rows: SiteImageAutoFixRowResult[]) {
    if (!Array.isArray(rows) || rows.length === 0) return;
    const now = Date.now();
    const snapshotEntries: Array<{
      id: string;
      url: string;
      updatedAt: string;
      updatedBy: string;
      locked: boolean;
      serverVerified: boolean;
      deletedOldUrls?: string[];
    }> = [];
    let needsSiteContentRefresh = false;
    let deletedCountDelta = 0;

    for (const r of rows) {
      if (!r?.id) continue;
      const resKey = `${this.state.jobId || 'local'}::${r.id}::${r.updatedAt || r.newUrl || r.error || ''}`;
      if (this.processedServerResultKeys.has(resKey)) continue;
      this.processedServerResultKeys.add(resKey);

      if (r.success && r.newUrl && !isSyntheticSpecCardOrPlaceholder(r.newUrl)) {
        const delList = Array.isArray(r.deletedOldUrls) ? r.deletedOldUrls : [];
        deletedCountDelta += delList.length;
        this.state.sessionChanges[r.id] = {
          changedAt: now,
          action: 'AUTO_FIX',
          deletedOldCount: delList.length
        };
        delete this.state.skippedItems[r.id];

        const upperType = String(r.type || '').toUpperCase();
        if (upperType === 'CATEGORY' || upperType === 'HERO_SLIDE' || upperType === 'SITE_ASSET') {
          needsSiteContentRefresh = true;
        }

        snapshotEntries.push({
          id: r.id,
          url: r.newUrl,
          updatedAt: r.updatedAt || new Date(now).toISOString(),
          updatedBy: 'admin-manual',
          locked: true,
          serverVerified: true,
          deletedOldUrls: delList
        });
      } else {
        this.state.skippedItems[r.id] = {
          reason: r.error || 'Auto-fix skipped item (open inspector to pick from ~20 Alibaba/Google/Web photos).',
          at: now
        };
      }
    }

    if (deletedCountDelta > 0) {
      this.state.totalDeletedFilesSession += deletedCountDelta;
    }

    if (snapshotEntries.length > 0) {
      productImageManagerService.applyServerOverrideSnapshot(snapshotEntries);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('tradeheaven_product_images_updated'));
        window.dispatchEvent(new Event('tradeheaven_products_updated'));
      }
      if (needsSiteContentRefresh && this.siteContentRefresher) {
        void this.siteContentRefresher().catch(() => {});
      }
    }
  }

  private applyServerJobPayload(job: ServerJobPayload | null, opts?: { emitNoticeOnFinish?: boolean }) {
    if (!job) return;
    const wasActive = this.state.active && this.state.jobId === job.jobId;
    const prevFixed = this.state.fixed;
    if (this.state.jobId !== job.jobId) {
      this.processedServerResultKeys.clear();
      this.lastSyncedFixedCount = 0;
    }

    this.state.jobId = job.jobId;
    this.state.mode = job.active ? 'server-job' : 'idle';
    this.state.active = Boolean(job.active);
    this.state.stopping = Boolean(job.active && job.cancelRequested);
    this.state.total = Number(job.total || 0);
    this.state.completed = Number(job.completed || 0);
    this.state.fixed = Number(job.fixed || 0);
    this.state.failed = Number(job.failed || 0);
    this.state.deletedOld = Number(job.deletedOld || 0);
    this.state.currentLabel = String(job.currentLabel || '');
    this.state.currentItemId = String(job.currentItemId || '');
    this.state.queuedIds = Array.isArray(job.queuedIds)
      ? job.currentItemId && job.active
        ? Array.from(new Set([job.currentItemId, ...job.queuedIds]))
        : [...job.queuedIds]
      : [];

    if (Array.isArray(job.results)) {
      this.applyProcessedResultRows(job.results);
    }

    const jobJustFinished = wasActive && !job.active;
    const fixedAdvanced = this.state.fixed > prevFixed || this.state.fixed > this.lastSyncedFixedCount;
    const nowMs = Date.now();
    if (
      jobJustFinished ||
      (fixedAdvanced && nowMs - this.lastServerOverridesSyncAt >= 5000)
    ) {
      this.lastServerOverridesSyncAt = nowMs;
      this.lastSyncedFixedCount = this.state.fixed;
      void productImageManagerService
        .syncFromServer(true, false, { bypassCooldown: true, emitEvenIfUnchanged: true })
        .then(() => {
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('tradeheaven_product_images_updated'));
            window.dispatchEvent(new Event('tradeheaven_products_updated'));
          }
        })
        .catch(() => {});
    }

    if (jobJustFinished) {
      this.state.lastCompletedNotice = {
        type: job.fixed > 0 ? 'success' : job.failed > 0 ? 'error' : 'info',
        text: job.cancelRequested
          ? `Background Auto-Fix stopped: fixed ${job.fixed} of ${job.total} items (${job.deletedOld} old server files permanently deleted).`
          : `Background Auto-Fix finished: ${job.fixed} fixed, ${job.failed} skipped/failed, ${job.deletedOld} old server files permanently deleted.`,
        fixed: job.fixed,
        failed: job.failed,
        total: job.total,
        deletedOld: job.deletedOld,
        at: Date.now()
      };
    } else if (opts?.emitNoticeOnFinish && !job.active && job.completed > 0 && !this.state.lastCompletedNotice) {
      this.state.lastCompletedNotice = {
        type: job.fixed > 0 ? 'success' : 'error',
        text: `Background Auto-Fix finished: ${job.fixed} fixed, ${job.failed} skipped/failed, ${job.deletedOld} old server files permanently deleted.`,
        fixed: job.fixed,
        failed: job.failed,
        total: job.total,
        deletedOld: job.deletedOld,
        at: Date.now()
      };
    }

    this.emit();

    if (job.active) {
      this.ensurePollingServerJob();
    } else {
      this.stopPollingServerJob();
    }
  }

  private ensurePollingServerJob() {
    if (typeof window === 'undefined' || this.pollTimer !== null) return;
    this.pollTimer = window.setInterval(() => {
      void this.pollServerJobOnce();
    }, 1300);
  }

  private stopPollingServerJob() {
    if (typeof window !== 'undefined' && this.pollTimer !== null) {
      window.clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
  }

  public async pollServerJobOnce(): Promise<void> {
    try {
      const res = await fetch('/api/v1/admin/site-images/auto-fix-jobs/current', {
        cache: 'no-store',
        headers: { Accept: 'application/json' }
      });
      if (!res.ok) return;
      const json = await res.json().catch(() => null);
      if (json?.success && json.job) {
        this.applyServerJobPayload(json.job);
      }
    } catch {
      // Transient network error while navigating; keep polling cleanly
    }
  }

  public async hydrateFromServerOnBoot(): Promise<void> {
    if (this.bootHydrated) return;
    this.bootHydrated = true;
    await this.pollServerJobOnce();
  }

  public async enqueue(items: BackgroundAutoFixItem[]): Promise<void> {
    if (!Array.isArray(items) || items.length === 0) return;

    this.state.lastCompletedNotice = null;
    // Clear stale skipped status for any items being re-queued so fresh retries display cleanly
    const nextSkipped = { ...this.state.skippedItems };
    let skippedChanged = false;
    for (const it of items) {
      if (it?.id && nextSkipped[it.id]) {
        delete nextSkipped[it.id];
        skippedChanged = true;
      }
    }
    if (skippedChanged) {
      this.state.skippedItems = nextSkipped;
      this.emit();
    }

    // 1. Try submitting to the persistent server-side background job queue first
    try {
      const res = await fetch('/api/v1/admin/site-images/auto-fix-jobs', {
        method: 'POST',
        cache: 'no-store',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ items })
      });
      const json = await res.json().catch(() => null);
      if (res.ok && json?.success && json.job) {
        this.applyServerJobPayload(json.job);
        return;
      }
    } catch {
      // Fall back to module-level browser background runner below
    }

    // 2. Resilient fallback: module-level SPA background runner (never tied to React component unmount!)
    const existingIds = new Set<string>(this.localQueue.map(q => q.id));
    if (this.state.currentItemId && this.state.active) {
      existingIds.add(this.state.currentItemId);
    }

    const toAppend = items.filter(it => it?.id && !existingIds.has(it.id));
    if (toAppend.length === 0 && this.localWorkerRunning) return;

    if (!this.localWorkerRunning) {
      this.localStopRequested = false;
      this.localQueue = [...items];
      this.state.jobId = `local-bg-${Date.now()}`;
      this.state.mode = 'local-background';
      this.state.active = true;
      this.state.stopping = false;
      this.state.total = this.localQueue.length;
      this.state.completed = 0;
      this.state.fixed = 0;
      this.state.failed = 0;
      this.state.deletedOld = 0;
      this.state.currentItemId = this.localQueue[0].id;
      this.state.currentLabel = this.localQueue[0].title;
      this.state.queuedIds = this.localQueue.map(q => q.id);
      this.emit();
      void this.runLocalBackgroundWorker();
    } else {
      this.localQueue.push(...toAppend);
      this.state.total += toAppend.length;
      this.state.queuedIds = Array.from(
        new Set([...(this.state.currentItemId ? [this.state.currentItemId] : []), ...this.localQueue.map(q => q.id)])
      );
      this.emit();
    }
  }

  private async runLocalBackgroundWorker() {
    if (this.localWorkerRunning) return;
    this.localWorkerRunning = true;
    try {
      while (!this.localStopRequested && this.localQueue.length > 0) {
        const target = this.localQueue.shift();
        if (!target) break;
        this.state.currentItemId = target.id;
        this.state.currentLabel = target.title;
        this.state.queuedIds = [target.id, ...this.localQueue.map(q => q.id)];
        this.emit();

        try {
          const json = await autoFixSiteImages([target]);
          const resList = Array.isArray(json?.results) ? json.results : [];
          const match = resList.find(r => r.id === target.id) || resList[0];
          this.state.completed += 1;

          if (match?.success && match?.newUrl) {
            this.state.fixed += 1;
            const delCount = Array.isArray(match.deletedOldUrls) ? match.deletedOldUrls.length : 0;
            this.state.deletedOld += delCount;
            this.applyProcessedResultRows([match]);
          } else {
            this.state.failed += 1;
            this.applyProcessedResultRows([
              {
                id: target.id,
                type: target.type,
                success: false,
                error: match?.error || 'Auto-fix skipped item (open inspector to pick from ~20 photos).'
              }
            ]);
          }
        } catch (err: any) {
          this.state.completed += 1;
          this.state.failed += 1;
          this.applyProcessedResultRows([
            {
              id: target.id,
              type: target.type,
              success: false,
              error: err?.message || 'Background auto-fix request failed for this item.'
            }
          ]);
        }

        this.state.queuedIds = this.localQueue.map(q => q.id);
        this.emit();
      }
    } finally {
      const wasStopped = this.localStopRequested;
      this.localWorkerRunning = false;
      this.localStopRequested = false;
      this.localQueue = [];
      this.state.active = false;
      this.state.stopping = false;
      this.state.mode = 'idle';
      this.state.currentItemId = '';
      this.state.currentLabel = '';
      this.state.queuedIds = [];
      this.state.lastCompletedNotice = {
        type: this.state.fixed > 0 ? 'success' : 'error',
        text: wasStopped
          ? `Background Auto-Fix stopped: fixed ${this.state.fixed} of ${this.state.total} items (${this.state.deletedOld} old server files permanently deleted).`
          : `Background Auto-Fix finished: ${this.state.fixed} fixed, ${this.state.failed} skipped/failed, ${this.state.deletedOld} old server files permanently deleted.`,
        fixed: this.state.fixed,
        failed: this.state.failed,
        total: this.state.total,
        deletedOld: this.state.deletedOld,
        at: Date.now()
      };
      this.emit();
    }
  }

  public async stop() {
    if (!this.state.active) return;
    this.state.stopping = true;
    this.emit();

    if (this.state.mode === 'server-job') {
      try {
        const res = await fetch('/api/v1/admin/site-images/auto-fix-jobs/stop', {
          method: 'POST',
          cache: 'no-store',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' }
        });
        const json = await res.json().catch(() => null);
        if (res.ok && json?.success && json.job) {
          this.applyServerJobPayload(json.job);
          return;
        }
      } catch {
        // Ignore network errors
      }
    }

    this.localStopRequested = true;
    this.localQueue = [];
  }
}

export const backgroundAutoFixService = new BackgroundAutoFixService();
