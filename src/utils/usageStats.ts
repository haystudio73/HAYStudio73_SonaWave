export interface UsageStats {
  visitCount: number;
  exportCount: number;
  formatCounts: {
    mp4: number;
    mov: number;
    webm: number;
  };
  lastVisitAt?: string | null;
  lastExportAt?: string | null;
}

export function formatCompactCounter(value: number): string {
  if (!Number.isFinite(value) || value < 0) return '0';
  const n = Math.floor(value);
  if (n <= 10000) return n.toLocaleString();
  if (n >= 1_000_000_000) {
    const scaled = n / 1_000_000_000;
    const formatted = (scaled >= 100 ? scaled.toFixed(0) : scaled.toFixed(1)).replace(/\.0$/, '');
    return `${formatted}B`;
  }
  if (n >= 1_000_000) {
    const scaled = n / 1_000_000;
    if (scaled >= 999.95) return '1B';
    const formatted = (scaled >= 100 ? scaled.toFixed(0) : scaled.toFixed(1)).replace(/\.0$/, '');
    return `${formatted}M`;
  }
  const scaled = n / 1_000;
  if (scaled >= 999.95) return '1M';
  const formatted = (scaled >= 100 ? scaled.toFixed(0) : scaled.toFixed(1)).replace(/\.0$/, '');
  return `${formatted}K`;
}

// Guard against React StrictMode double-mount incrementing visits twice per page load
let visitPromise: Promise<UsageStats | null> | null = null;

export function recordAppVisit(): Promise<UsageStats | null> {
  if (!visitPromise) {
    visitPromise = fetch('/api/stats/visit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    })
      .then((res) => (res.ok ? (res.json() as Promise<UsageStats>) : null))
      .catch(() => null);
  }
  return visitPromise;
}

export async function fetchUsageStats(): Promise<UsageStats | null> {
  try {
    const res = await fetch('/api/stats', { cache: 'no-store' });
    if (!res.ok) return null;
    return (await res.json()) as UsageStats;
  } catch {
    return null;
  }
}

export async function recordVideoExport(
  format?: string,
  resolution?: string
): Promise<UsageStats | null> {
  try {
    const res = await fetch('/api/stats/export', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ format, resolution }),
    });
    if (!res.ok) return null;
    return (await res.json()) as UsageStats;
  } catch {
    return null;
  }
}
