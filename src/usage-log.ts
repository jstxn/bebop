import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { fileExists } from './fs-utils';

export interface UsageRecord {
  timestamp: string;
  tool: string;
  sessionId?: string | null;
  input: {
    chars: number;
    words: number;
  };
  compiled: {
    chars: number;
    words: number;
  };
  originalTokens: number;
  compiledTokens: number;
  savingsTokens: number;
  savingsPct: number;
  ruleCount: number;
  packs: string[];
  context?: {
    project: string;
    framework: string | null;
    service: string | null;
  };
}

export interface UsageSummary {
  tool: string | null;
  sessionId?: string | null;
  totalPrompts: number;
  totalOriginalTokens: number;
  totalCompiledTokens: number;
  totalSavingsTokens: number;
  averageSavingsPct: number;
  firstSeen: string | null;
  lastSeen: string | null;
}

export interface SessionInfo {
  id: string;
  startedAt: string;
}

export interface UsageFilters {
  tool?: string;
  sessionId?: string | null;
  since?: string;
}

export function getRegistryPath(registryPath?: string): string {
  return registryPath || process.env.BEBOP_REGISTRY || path.join(os.homedir(), '.bebop');
}

export function getUsageLogPath(registryPath?: string): string {
  return path.join(getRegistryPath(registryPath), 'logs', 'usage.jsonl');
}

export function getSessionStatePath(registryPath?: string): string {
  return path.join(getRegistryPath(registryPath), 'logs', 'sessions.json');
}

export async function appendUsage(record: UsageRecord, registryPath?: string): Promise<void> {
  const logPath = getUsageLogPath(registryPath);
  await fs.mkdir(path.dirname(logPath), { recursive: true });
  await fs.appendFile(logPath, `${JSON.stringify(record)}\n`, 'utf8');
}

export async function startSession(tool: string, registryPath?: string): Promise<SessionInfo> {
  const sessionId = `session_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const info: SessionInfo = { id: sessionId, startedAt: new Date().toISOString() };
  const state = await readSessionState(registryPath);
  state[tool] = info;
  await writeSessionState(state, registryPath);
  return info;
}

export async function getActiveSession(tool: string, registryPath?: string): Promise<SessionInfo | null> {
  const state = await readSessionState(registryPath);
  return state[tool] || null;
}

export async function endSession(tool: string, registryPath?: string): Promise<{ summary: UsageSummary | null; session: SessionInfo | null }> {
  const state = await readSessionState(registryPath);
  const session = state[tool] || null;
  if (!session) {
    return { summary: null, session: null };
  }

  const records = await readUsageRecords({ tool, sessionId: session.id }, registryPath);
  const summary = summarizeUsage(records, tool, session.id);
  delete state[tool];
  await writeSessionState(state, registryPath);
  return { summary, session };
}

export async function readUsageRecords(filters: UsageFilters = {}, registryPath?: string): Promise<UsageRecord[]> {
  const logPath = getUsageLogPath(registryPath);
  if (!(await fileExists(logPath))) {
    return [];
  }

  const raw = await fs.readFile(logPath, 'utf8');
  const lines = raw.split(/\n/).filter(Boolean);
  const since = filters.since ? Date.parse(filters.since) : null;

  const records: UsageRecord[] = [];
  for (const line of lines) {
    try {
      const record = JSON.parse(line) as UsageRecord;
      if (filters.tool && record.tool !== filters.tool) continue;
      if (filters.sessionId !== undefined && record.sessionId !== filters.sessionId) continue;
      if (since && Date.parse(record.timestamp) < since) continue;
      records.push(record);
    } catch {
      // skip invalid lines
    }
  }

  return records;
}

export function summarizeUsage(records: UsageRecord[], tool: string | null, sessionId?: string | null): UsageSummary {
  let totalOriginalTokens = 0;
  let totalCompiledTokens = 0;
  let totalSavingsTokens = 0;
  let totalSavingsPct = 0;

  let firstSeen: string | null = null;
  let lastSeen: string | null = null;

  for (const record of records) {
    totalOriginalTokens += record.originalTokens;
    totalCompiledTokens += record.compiledTokens;
    totalSavingsTokens += record.savingsTokens;
    totalSavingsPct += record.savingsPct;

    if (!firstSeen || record.timestamp < firstSeen) {
      firstSeen = record.timestamp;
    }
    if (!lastSeen || record.timestamp > lastSeen) {
      lastSeen = record.timestamp;
    }
  }

  const totalPrompts = records.length;
  const averageSavingsPct = totalPrompts > 0 ? totalSavingsPct / totalPrompts : 0;

  return {
    tool,
    sessionId: sessionId || null,
    totalPrompts,
    totalOriginalTokens,
    totalCompiledTokens,
    totalSavingsTokens,
    averageSavingsPct: Number(averageSavingsPct.toFixed(1)),
    firstSeen,
    lastSeen,
  };
}

export function formatSummary(summary: UsageSummary): string {
  if (summary.totalPrompts === 0) {
    return 'No Bebop usage recorded.';
  }

  const lines: string[] = [];
  lines.push('Bebop usage summary');
  if (summary.tool) {
    lines.push(`Tool: ${summary.tool}`);
  }
  if (summary.sessionId) {
    lines.push(`Session: ${summary.sessionId}`);
  }
  lines.push(`Prompts: ${summary.totalPrompts}`);
  lines.push(`Original tokens: ${summary.totalOriginalTokens}`);
  lines.push(`Compiled tokens: ${summary.totalCompiledTokens}`);
  lines.push(`Tokens saved: ${summary.totalSavingsTokens}`);
  lines.push(`Average savings: ${summary.averageSavingsPct}%`);
  if (summary.firstSeen) {
    lines.push(`First: ${summary.firstSeen}`);
  }
  if (summary.lastSeen) {
    lines.push(`Last: ${summary.lastSeen}`);
  }

  return lines.join('\n');
}

export function countWords(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

async function readSessionState(registryPath?: string): Promise<Record<string, SessionInfo>> {
  const statePath = getSessionStatePath(registryPath);
  if (!(await fileExists(statePath))) {
    return {};
  }
  try {
    const raw = await fs.readFile(statePath, 'utf8');
    const parsed = JSON.parse(raw) as Record<string, SessionInfo>;
    return parsed || {};
  } catch {
    return {};
  }
}

async function writeSessionState(state: Record<string, SessionInfo>, registryPath?: string): Promise<void> {
  const statePath = getSessionStatePath(registryPath);
  await fs.mkdir(path.dirname(statePath), { recursive: true });
  await fs.writeFile(statePath, JSON.stringify(state, null, 2), 'utf8');
}
