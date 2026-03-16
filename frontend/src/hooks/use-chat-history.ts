"use client";

import { useState, useEffect, useCallback, useRef } from "react";

export interface ChatSession {
  id: string;
  title: string;
  messages: any[];
  createdAt: number;
  updatedAt: number;
}

const STORAGE_KEY = "research_chat_history";

function loadSessions(): ChatSession[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveSessions(sessions: ChatSession[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  } catch {
    // localStorage might be full
  }
}

export function useChatHistory() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const sessionsRef = useRef<ChatSession[]>([]);

  // Keep ref in sync
  useEffect(() => {
    sessionsRef.current = sessions;
  }, [sessions]);

  // Load from localStorage on mount
  useEffect(() => {
    const loaded = loadSessions();
    setSessions(loaded);
    sessionsRef.current = loaded;
  }, []);

  // Save to localStorage whenever sessions change
  useEffect(() => {
    if (sessions.length > 0) {
      saveSessions(sessions);
    }
  }, [sessions]);

  const createSession = useCallback((title?: string): string => {
    const id = `chat_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const newSession: ChatSession = {
      id,
      title: title || "New Chat",
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setSessions((prev) => [newSession, ...prev]);
    sessionsRef.current = [newSession, ...sessionsRef.current];
    setActiveSessionId(id);
    return id;
  }, []);

  const updateSession = useCallback(
    (id: string, updates: Partial<Pick<ChatSession, "title" | "messages">>) => {
      setSessions((prev) => {
        const updated = prev.map((s) =>
          s.id === id ? { ...s, ...updates, updatedAt: Date.now() } : s
        );
        sessionsRef.current = updated;
        return updated;
      });
    },
    []
  );

  const deleteSession = useCallback(
    (id: string) => {
      setSessions((prev) => {
        const filtered = prev.filter((s) => s.id !== id);
        saveSessions(filtered);
        sessionsRef.current = filtered;
        return filtered;
      });
      if (activeSessionId === id) {
        setActiveSessionId(null);
      }
    },
    [activeSessionId]
  );

  // Group sessions by time periods
  const groupedSessions = useCallback(() => {
    const today = new Date().setHours(0, 0, 0, 0);
    const yesterday = today - 86400000;
    const weekAgo = today - 7 * 86400000;

    const groups: { label: string; sessions: ChatSession[] }[] = [
      { label: "Today", sessions: [] },
      { label: "Yesterday", sessions: [] },
      { label: "Previous 7 Days", sessions: [] },
      { label: "Older", sessions: [] },
    ];

    for (const session of sessions) {
      if (session.updatedAt >= today) {
        groups[0].sessions.push(session);
      } else if (session.updatedAt >= yesterday) {
        groups[1].sessions.push(session);
      } else if (session.updatedAt >= weekAgo) {
        groups[2].sessions.push(session);
      } else {
        groups[3].sessions.push(session);
      }
    }

    return groups.filter((g) => g.sessions.length > 0);
  }, [sessions]);

  return {
    sessions,
    sessionsRef,
    activeSessionId,
    setActiveSessionId,
    createSession,
    updateSession,
    deleteSession,
    groupedSessions,
  };
}
