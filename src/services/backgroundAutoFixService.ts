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
  private lastServerProgressAtMs = 0;
  private lastServerCompletedCount = -1;
  private syncChannel: BroadcastChannel | null = null;

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
    if (typeof window !== 'undefined' && typeof BroadcastChannel !== 'undefined') {
      try {
        this.syncChannel = new BroadcastChannel('tradeheaven_bg_autofix_sync');
        this.syncChannel.onmessage = (ev) => {
          if (ev?.data?.type === 'snapshot' && ev.data.snapshot && !this.localWorkerRunning) {
            const incoming = ev.data.snapshot as BackgroundAutoFixSnapshot;
            this.state = { ...this.state, ...incoming };
            for (const listener of this.listeners) {
              try { listener(this.getSnapshot()); } catch {}
            }
          }
        };
      } catch {}
    }
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
    try {
      this.syncChannel?.postMessage({ type: 'snapshot', snapshot: snap });
    } catch {}
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
      this.lastServerProgressAtMs = Date.now();
      this.lastServerCompletedCount = Number(job.completed || 0);
    } else if (Number(job.completed || 0) !== this.lastServerCompletedCount) {
      this.lastServerProgressAtMs = Date.now();
      this.lastServerCompletedCount = Number(job.completed || 0);
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
      (fixedAdvanced && nowMs - this.lastServerOverridesSyncAt >= 45000)
    ) {
      this.lastServerOverridesSyncAt = nowMs;
      this.lastSyncedFixedCount = this.state.fixed;
      void productImageManagerService
        .syncFromServer(true, jobJustFinished, { bypassCooldown: true, emitEvenIfUnchanged: jobJustFinished })
        .then(() => {
          if (jobJustFinished && typeof window !== 'undefined') {
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

  private inFlightPoll = false;

  private ensurePollingServerJob() {
    if (typeof window === 'undefined' || this.pollTimer !== null) return;
    this.pollTimer = window.setInterval(() => {
      void this.pollServerJobOnce();
    }, 3000);
  }

  private stopPollingServerJob() {
    if (typeof window !== 'undefined' && this.pollTimer !== null) {
      window.clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
  }

  public async pollServerJobOnce(): Promise<void> {
    if (this.inFlightPoll) return;
    this.inFlightPoll = true;
    const ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const timer = ctrl ? setTimeout(() => ctrl.abort(), 12000) : null;
    try {
      const res = await fetch(`/api/v1/admin/site-images/auto-fix-jobs/current?_t=${Date.now()}`, {
        cache: 'no-store',
        headers: { Accept: 'application/json' },
        ...(ctrl ? { signal: ctrl.signal } : {})
      });
      if (!res.ok) return;
      const json = await res.json().catch(() => null);
      if (json?.success && json.job) {
        this.applyServerJobPayload(json.job);
      } else if (json?.success && !json.job && this.state.active && this.state.mode === 'server-job') {
        // Server has no active job (e.g., server restarted or job completed & cleared); immediately clear client ghost state so Chrome never stays stuck
        this.state.active = false;
        this.state.stopping = false;
        this.state.mode = 'idle';
        this.state.currentItemId = '';
        this.state.currentLabel = '';
        this.state.queuedIds = [];
        this.stopPollingServerJob();
        this.emit();
        void productImageManagerService
          .syncFromServer(true, true, { bypassCooldown: true, emitEvenIfUnchanged: true })
          .catch(() => {});
      }
    } catch {
      // Transient network error while navigating; keep polling cleanly
    } finally {
      if (timer) clearTimeout(timer);
      this.inFlightPoll = false;
    }
  }

  public async hydrateFromServerOnBoot(): Promise<void> {
    if (this.bootHydrated) return;
    this.bootHydrated = true;
    await this.pollServerJobOnce();
  }

  public async enqueue(rawItems: BackgroundAutoFixItem[]): Promise<void> {
    if (!Array.isArray(rawItems) || rawItems.length === 0) return;

    // Compact specifications & prioritize catalog items over site assets so large 3,400+ item queues transfer and start fast
    const items: BackgroundAutoFixItem[] = rawItems
      .filter(it => Boolean(it?.id) && it.id !== 'site-brand-logo')
      .map(it => ({
        ...it,
        specifications: it.specifications ? String(it.specifications).slice(0, 220) : undefined
      }));
    if (items.length === 0) return;

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

    // 1. Try submitting to the persistent server-side background job queue first (in 600-item chunks so large batches never hit body-size or proxy timeouts)
    let latestServerJob: ServerJobPayload | null = null;
    let serverAccepted = false;
    let sentFinalChunk = false;
    try {
      const CHUNK_SIZE = 600;
      const isStalledJob =
        this.state.active &&
        this.state.mode === 'server-job' &&
        Date.now() - (this.lastServerProgressAtMs || 0) > 10000;
      const isIdleFreshStart =
        !this.state.active || this.state.mode !== 'server-job' || isStalledJob || items.length >= 25;

      for (let i = 0; i < items.length; i += CHUNK_SIZE) {
        const chunk = items.slice(i, i + CHUNK_SIZE);
        const replaceExisting = isIdleFreshStart && i === 0;
        const deferStart = i + CHUNK_SIZE < items.length;

        let chunkDone = false;
        for (let attempt = 0; attempt < 2 && !chunkDone; attempt++) {
          const ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
          const timer = ctrl ? setTimeout(() => ctrl.abort(), 20000) : null;
          try {
            const res = await fetch('/api/v1/admin/site-images/auto-fix-jobs', {
              method: 'POST',
              cache: 'no-store',
              headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
              body: JSON.stringify({ items: chunk, replaceExisting, deferStart }),
              ...(ctrl ? { signal: ctrl.signal } : {})
            });
            const json = await res.json().catch(() => null);
            if (json?.useClientBatchMode || json?.unsupportedJobQueue) {
              // PHP/shared host without persistent job daemon — switch immediately to fast client batch mode
              serverAccepted = false;
              latestServerJob = null;
              i = items.length;
              break;
            }
            if (res.ok && json?.success && json.job) {
              latestServerJob = json.job;
              serverAccepted = true;
              chunkDone = true;
              if (!deferStart) sentFinalChunk = true;
              if (i === 0) {
                this.applyServerJobPayload(json.job);
              }
            } else {
              break;
            }
          } catch {
            if (attempt === 1) break;
          } finally {
            if (timer) clearTimeout(timer);
          }
        }
        if (!chunkDone) break;
      }

      // If an intermediate chunk failed after chunk 0 was accepted with deferStart=true, immediately nudge the server with deferStart=false so the worker starts right away
      if (serverAccepted && !sentFinalChunk && items.length > 0) {
        try {
          const res = await fetch('/api/v1/admin/site-images/auto-fix-jobs', {
            method: 'POST',
            cache: 'no-store',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify({ items: [items[0]], replaceExisting: false, deferStart: false })
          });
          const json = await res.json().catch(() => null);
          if (res.ok && json?.success && json.job) {
            latestServerJob = json.job;
          }
        } catch {
          // Server pendingChunkStartTimer will auto-start within 1.5s regardless
        }
      }
    } catch {
      // Fall back to module-level browser background runner ONLY if server never accepted the job
    }

    if (serverAccepted && latestServerJob) {
      this.applyServerJobPayload(latestServerJob);
      return;
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
      this.state.queuedIds = this.localQueue.slice(0, 100).map(q => q.id);
      this.emit();
      void this.runLocalBackgroundWorker();
    } else {
      this.localQueue.push(...toAppend);
      this.state.total += toAppend.length;
      this.state.queuedIds = Array.from(
        new Set([
          ...(this.state.currentItemId ? [this.state.currentItemId] : []),
          ...this.localQueue.slice(0, 100).map(q => q.id)
        ])
      );
      this.emit();
    }
  }

  private async runLocalBackgroundWorker() {
    if (this.localWorkerRunning) return;
    this.localWorkerRunning = true;
    const BATCH_SIZE = 10;
    const BATCH_TIMEOUT_MS = 38000;

    try {
      while (!this.localStopRequested && this.localQueue.length > 0) {
        const batch = this.localQueue.splice(0, BATCH_SIZE);
        if (batch.length === 0) break;

        this.state.currentItemId = batch[0].id;
        this.state.currentLabel =
          batch.length > 1 ? `${batch[0].title || batch[0].id} (+${batch.length - 1} in batch)` : batch[0].title || batch[0].id;
        this.state.queuedIds = [
          ...batch.map(b => b.id),
          ...this.localQueue.slice(0, 90).map(q => q.id)
        ];
        this.emit();

        let timeoutHandle: number | null = null;
        let resList: SiteImageAutoFixRowResult[] = [];
        try {
          const timeoutPromise = new Promise<{ __timedOut: true }>(resolve => {
            timeoutHandle = window.setTimeout(() => resolve({ __timedOut: true }), BATCH_TIMEOUT_MS);
          });
          const raceOut = await Promise.race([
            autoFixSiteImages(batch, { fastBatchMode: true }),
            timeoutPromise
          ]);
          if (timeoutHandle !== null) {
            window.clearTimeout(timeoutHandle);
            timeoutHandle = null;
          }
          if ((raceOut as any)?.__timedOut) {
            // Retry in smaller 3-item chunks on transient slow hosting response before ever skipping
            for (let si = 0; si < batch.length && !this.localStopRequested; si += 3) {
              const sub = batch.slice(si, si + 3);
              try {
                const subOut = await autoFixSiteImages(sub, { fastBatchMode: true });
                if (Array.isArray(subOut?.results)) resList.push(...subOut.results);
              } catch {
                for (const s of sub) {
                  resList.push({
                    id: s.id,
                    type: s.type,
                    success: false,
                    error: 'Server timed out while processing batch item.'
                  });
                }
              }
            }
          } else {
            resList = Array.isArray((raceOut as any)?.results) ? (raceOut as any).results : [];
          }
        } catch (err: any) {
          if (timeoutHandle !== null) {
            window.clearTimeout(timeoutHandle);
            timeoutHandle = null;
          }
          resList = batch.map(t => ({
            id: t.id,
            type: t.type,
            success: false,
            error: err?.message || 'Background auto-fix batch request failed.'
          }));
        }

        const byId = new Map<string, SiteImageAutoFixRowResult>();
        for (const r of resList) {
          if (r?.id) byId.set(String(r.id), r);
        }

        const normalizedRows: SiteImageAutoFixRowResult[] = [];
        for (const target of batch) {
          const match = byId.get(target.id);
          this.state.completed += 1;
          if (match?.success && match?.newUrl) {
            this.state.fixed += 1;
            const delCount = Array.isArray(match.deletedOldUrls) ? match.deletedOldUrls.length : 0;
            this.state.deletedOld += delCount;
            normalizedRows.push(match);
          } else {
            this.state.failed += 1;
            normalizedRows.push({
              id: target.id,
              type: target.type,
              success: false,
              error: match?.error || 'Auto-fix skipped item (open inspector to pick a photo).'
            });
          }
        }
        this.applyProcessedResultRows(normalizedRows);

        if (this.localQueue.length > 0) {
          this.state.currentItemId = this.localQueue[0].id;
          this.state.currentLabel = this.localQueue[0].title || this.localQueue[0].id;
        }
        this.state.queuedIds = this.localQueue.slice(0, 100).map(q => q.id);
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
      void productImageManagerService
        .syncFromServer(true, true, { bypassCooldown: true, emitEvenIfUnchanged: true })
        .catch(() => {});
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
