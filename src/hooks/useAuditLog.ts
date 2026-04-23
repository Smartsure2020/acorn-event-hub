import { useState, useCallback } from "react";

export interface AuditEntry {
  id: string;
  action: string;
  actor: string;
  actorRole: string;
  payload: Record<string, unknown>;
  timestamp: string;
}

// In-memory store for the session — in prod, write to Supabase audit_log table
const _log: AuditEntry[] = [];

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
