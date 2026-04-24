import { useCallback } from "react";

export interface AuditEntry {
  id: string;
  action: string;
  actor: string;
  actorRole: string;
  payload: Record<string, unknown>;
  timestamp: string;
}

const STORAGE_KEY = "acorn_audit_log";
const MAX_ENTRIES = 1000;

function loadFromStorage(): AuditEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AuditEntry[]) : [];
  } catch {
    return [];
  }
}

function saveToStorage(entries: AuditEntry[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(0, MAX_ENTRIES)));
  } catch {
    // localStorage quota exceeded or unavailable
  }
}

// Module-level log — hydrated from localStorage on first import
const _log: AuditEntry[] = loadFromStorage();

let _actor = "system";
let _actorRole = "viewer";

export function setAuditActor(name: string, role: string) {
  _actor = name;
  _actorRole = role;
}

export function appendAuditEntry(action: string, payload: Record<string, unknown> = {}) {
  const entry: AuditEntry = {
    id: crypto.randomUUID(),
    action,
    actor: _actor,
    actorRole: _actorRole,
    payload,
    timestamp: new Date().toISOString(),
  };
  _log.unshift(entry); // newest first
  saveToStorage(_log);
  return entry;
}

export function getAuditLog(): AuditEntry[] {
  return [..._log];
}

export function useAuditLog() {
  const logAction = useCallback((action: string, payload: Record<string, unknown> = {}) => {
    appendAuditEntry(action, payload);
  }, []);

  return { logAction };
}
