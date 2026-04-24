import { useState, useEffect } from "react";

export interface TaskComment {
  id: string;
  author: string;
  role: string;
  body: string;
  createdAt: string;
}

export interface TaskDocument {
  id: string;
  name: string;
  size: string;
  uploadedBy: string;
  uploadedAt: string;
  url?: string; // blob URL — session-only, not persisted
}

export interface SignOffRecord {
  signedBy: string;
  role: string;
  signedAt: string;
  notes: string;
}

function key(prefix: string, taskId: string) {
  return `acorn_task_${prefix}_${taskId}`;
}

function load<T>(storageKey: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(storageKey);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function save(storageKey: string, value: unknown) {
  try {
    localStorage.setItem(storageKey, JSON.stringify(value));
  } catch {
    // quota exceeded or unavailable
  }
}

export function useTaskPersistence(taskId: string | undefined) {
  const [comments, setComments] = useState<TaskComment[]>([]);
  const [documents, setDocuments] = useState<TaskDocument[]>([]);
  const [signOff, setSignOffState] = useState<SignOffRecord | null>(null);

  useEffect(() => {
    if (!taskId) return;
    setComments(load<TaskComment[]>(key("comments", taskId), []));
    // Reload doc metadata without blob URLs (they don't survive a refresh)
    setDocuments(load<Omit<TaskDocument, "url">[]>(key("docs", taskId), []).map((d) => ({ ...d, url: undefined })));
    setSignOffState(load<SignOffRecord | null>(key("signoff", taskId), null));
  }, [taskId]);

  function addComment(comment: TaskComment) {
    if (!taskId) return;
    setComments((prev) => {
      const next = [...prev, comment];
      save(key("comments", taskId), next);
      return next;
    });
  }

  function addDocuments(docs: TaskDocument[]) {
    if (!taskId) return;
    setDocuments((prev) => {
      const next = [...prev, ...docs];
      // Strip blob URLs before persisting — they expire with the session
      save(key("docs", taskId), next.map(({ url: _url, ...d }) => d));
      return next;
    });
  }

  function removeDocument(id: string) {
    if (!taskId) return;
    setDocuments((prev) => {
      const next = prev.filter((d) => d.id !== id);
      save(key("docs", taskId), next.map(({ url: _url, ...d }) => d));
      return next;
    });
  }

  function setSignOff(record: SignOffRecord | null) {
    if (!taskId) return;
    setSignOffState(record);
    save(key("signoff", taskId), record);
  }

  return { comments, addComment, documents, addDocuments, removeDocument, signOff, setSignOff };
}
