import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import type { Request, Response } from 'express';
import Database from 'better-sqlite3';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 3000);
const DATA_DIR = path.resolve(__dirname, 'data');
const DB_PATH = path.join(DATA_DIR, 'usage_stats.sqlite');

fs.mkdirSync(DATA_DIR, { recursive: true });

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('busy_timeout = 5000');

db.exec(`
  CREATE TABLE IF NOT EXISTS usage_counters (
    key TEXT PRIMARY KEY,
    value INTEGER NOT NULL DEFAULT 0,
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS usage_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_type TEXT NOT NULL,
    format TEXT,
    resolution TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

const ensureCounterStmt = db.prepare(`
  INSERT OR IGNORE INTO usage_counters (key, value, updated_at)
  VALUES (?, 0, datetime('now'))
`);

for (const key of [
  'total_visits',
  'total_exports',
  'mp4_exports',
  'mov_exports',
  'webm_exports',
]) {
  ensureCounterStmt.run(key);
}

const getCountersStmt = db.prepare(`
  SELECT key, value FROM usage_counters
`);

const getLastEventStmt = db.prepare(`
  SELECT created_at FROM usage_events
  WHERE event_type = ?
  ORDER BY id DESC
  LIMIT 1
`);

const incrementCounterStmt = db.prepare(`
  INSERT INTO usage_counters (key, value, updated_at)
  VALUES (?, 1, datetime('now'))
  ON CONFLICT(key) DO UPDATE SET
    value = value + 1,
    updated_at = datetime('now')
`);

const insertEventStmt = db.prepare(`
  INSERT INTO usage_events (event_type, format, resolution, created_at)
  VALUES (?, ?, ?, datetime('now'))
`);

export interface UsageStatsPayload {
  visitCount: number;
  exportCount: number;
  formatCounts: {
    mp4: number;
    mov: number;
    webm: number;
  };
  lastVisitAt: string | null;
  lastExportAt: string | null;
}

function readUsageStats(): UsageStatsPayload {
  const rows = getCountersStmt.all() as Array<{ key: string; value: number }>;
  const map: Record<string, number> = {};
  for (const row of rows) {
    map[row.key] = Number(row.value || 0);
  }

  const lastVisitRow = getLastEventStmt.get('visit') as { created_at: string } | undefined;
  const lastExportRow = getLastEventStmt.get('export') as { created_at: string } | undefined;

  return {
    visitCount: map['total_visits'] ?? 0,
    exportCount: map['total_exports'] ?? 0,
    formatCounts: {
      mp4: map['mp4_exports'] ?? 0,
      mov: map['mov_exports'] ?? 0,
      webm: map['webm_exports'] ?? 0,
    },
    lastVisitAt: lastVisitRow?.created_at ?? null,
    lastExportAt: lastExportRow?.created_at ?? null,
  };
}

const recordVisitTx = db.transaction((): UsageStatsPayload => {
  incrementCounterStmt.run('total_visits');
  insertEventStmt.run('visit', null, null);
  return readUsageStats();
});

const recordExportTx = db.transaction((format: string | null, resolution: string | null): UsageStatsPayload => {
  incrementCounterStmt.run('total_exports');
  if (format === 'mp4' || format === 'mov' || format === 'webm') {
    incrementCounterStmt.run(`${format}_exports`);
  }
  insertEventStmt.run('export', format, resolution);
  return readUsageStats();
});

async function startServer(): Promise<void> {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/stats', (_req: Request, res: Response) => {
    try {
      const stats = readUsageStats();
      res.json(stats);
    } catch (err) {
      console.error('Failed to read usage stats:', err);
      res.status(500).json({ error: 'Failed to read usage stats' });
    }
  });

  app.post('/api/stats/visit', (_req: Request, res: Response) => {
    try {
      const stats = recordVisitTx();
      res.json(stats);
    } catch (err) {
      console.error('Failed to record visit:', err);
      res.status(500).json({ error: 'Failed to record visit' });
    }
  });

  app.post('/api/stats/export', (req: Request, res: Response) => {
    try {
      const rawFormat = typeof req.body?.format === 'string' ? req.body.format.toLowerCase().trim() : null;
      const validFormat = rawFormat === 'mp4' || rawFormat === 'mov' || rawFormat === 'webm' ? rawFormat : null;
      const rawResolution = typeof req.body?.resolution === 'string' ? req.body.resolution.slice(0, 16) : null;
      const stats = recordExportTx(validFormat, rawResolution);
      res.json(stats);
    } catch (err) {
      console.error('Failed to record export:', err);
      res.status(500).json({ error: 'Failed to record export' });
    }
  });

  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT} (SQLite: ${DB_PATH})`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
