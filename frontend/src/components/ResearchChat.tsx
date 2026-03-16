/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import {
  Loader2,
  ArrowUp,
  Sparkles,
  Globe,
  ChevronDown,
  ChevronRight,
  Library,
  AlignLeft,
  Plus,
  Copy,
  Check,
  RotateCcw,
  Zap,
  Search,
  BookOpen,
  TrendingUp,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useChatHistoryContext } from "@/app/(dashboard)/layout";

// ─── Types ───

type Source = { title: string; url: string; favicon?: string };
type Step = { id: number; message: string; status: "pending" | "in-progress" | "done" };
type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
  steps?: Step[];
  isThinking?: boolean;
  queryType?: string;
};

// ─── Sub-components ───

function SourceCard({ source, index }: { source: Source; index: number }) {
  let hostname = "";
  try { hostname = new URL(source.url).hostname.replace("www.", ""); } catch { hostname = source.url; }

  return (
    <Link href={source.url} target="_blank" rel="noopener noreferrer"
      className="group flex flex-col justify-between p-3 h-[84px] bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] hover:border-white/[0.12] rounded-xl transition-all duration-200 overflow-hidden">
      <h3 className="text-[12px] font-medium text-zinc-300 line-clamp-2 leading-snug group-hover:text-blue-400 transition-colors">
        {source.title}
      </h3>
      <div className="flex items-center gap-2 mt-auto">
        <div className="w-3.5 h-3.5 rounded-full bg-white/[0.08] flex items-center justify-center overflow-hidden shrink-0">
          {source.favicon
            ? <img src={source.favicon} alt="" className="w-full h-full object-cover" />
            : <Globe className="w-2 h-2 text-zinc-500" />}
        </div>
        <span className="text-[10px] text-zinc-600 truncate">{hostname}</span>
        <span className="text-[9px] text-zinc-700 ml-auto bg-white/[0.04] px-1.5 py-0.5 rounded-full font-mono">{index + 1}</span>
      </div>
    </Link>
  );
}

function ThinkingSteps({ steps, isThinking }: { steps?: Step[]; isThinking?: boolean }) {
  const [open, setOpen] = useState(true);
  if (!steps || steps.length === 0) return null;

  return (
    <div className="mb-5">
      <button onClick={() => setOpen(!open)}
        className="flex items-center gap-2 text-[13px] text-zinc-500 hover:text-zinc-300 transition-colors mb-2">
        {isThinking ? (
          <span className="relative flex h-4 w-4">
            <span className="absolute inset-0 rounded-full bg-blue-500/30 animate-ping" />
            <Loader2 className="w-4 h-4 animate-spin text-blue-500 relative" />
          </span>
        ) : (
          <span className="w-4 h-4 rounded-full bg-emerald-500/20 flex items-center justify-center">
            <Check className="w-2.5 h-2.5 text-emerald-500" />
          </span>
        )}
        <span className="font-medium">{isThinking ? "Researching..." : "Research complete"}</span>
        {open ? <ChevronDown className="w-3.5 h-3.5 opacity-40" /> : <ChevronRight className="w-3.5 h-3.5 opacity-40" />}
      </button>
      {open && (
        <div className="pl-5 ml-[7px] border-l border-white/[0.06] space-y-1.5 py-1">
          {steps.map((step) => (
            <div key={step.id} className="flex items-center gap-2.5 text-[12px]">
              {step.status === "done" ? (
                <span className="w-3.5 h-3.5 rounded-full bg-emerald-500/15 flex items-center justify-center shrink-0">
                  <Check className="w-2 h-2 text-emerald-500" />
                </span>
              ) : step.status === "in-progress" ? (
                <Loader2 className="w-3 h-3 animate-spin text-blue-400 shrink-0" />
              ) : (
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-700 ml-1 shrink-0" />
              )}
              <span className={cn(
                step.status === "done" ? "text-zinc-500" : step.status === "in-progress" ? "text-blue-300" : "text-zinc-700"
              )}>{step.message}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function FormattedMarkdown({ text, sources }: { text: string; sources?: Source[] }) {
  const processed = text.replace(/\[(\d+)\]/g, (match, id) => {
    const src = sources?.[parseInt(id) - 1];
    return src ? `<a href="${src.url}" class="citation-badge" target="_blank" rel="noopener noreferrer">${id}</a>` : match;
  });

  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]} components={{
      h1: ({ children }) => <h1 className="text-2xl font-bold text-white mt-8 mb-4 first:mt-0">{children}</h1>,
      h2: ({ children }) => <h2 className="text-xl font-semibold text-white mt-6 mb-3 first:mt-0">{children}</h2>,
      h3: ({ children }) => <h3 className="text-lg font-semibold text-zinc-100 mt-5 mb-2 first:mt-0">{children}</h3>,
      p: ({ children }) => <p className="text-[14.5px] leading-[1.8] text-zinc-300 mb-4 last:mb-0">{children}</p>,
      ul: ({ children }) => <ul className="list-disc list-outside ml-5 space-y-1.5 mb-4 text-zinc-300">{children}</ul>,
      ol: ({ children }) => <ol className="list-decimal list-outside ml-5 space-y-1.5 mb-4 text-zinc-300">{children}</ol>,
      li: ({ children }) => <li className="pl-1 leading-relaxed text-[14px]">{children}</li>,
      code: ({ inline, className, children, ...props }: any) =>
        !inline
          ? <pre className="bg-black/40 border border-white/[0.06] rounded-xl p-4 mb-4 overflow-x-auto"><code className={`text-[13px] text-zinc-300 font-mono ${className || ""}`} {...props}>{children}</code></pre>
          : <code className="bg-white/[0.06] text-blue-400 px-1.5 py-0.5 rounded-md text-[13px] font-mono" {...props}>{children}</code>,
      a: ({ href, className, children }) =>
        className === "citation-badge"
          ? <a href={href} target="_blank" rel="noopener noreferrer" className="citation-badge">{children}</a>
          : <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline decoration-blue-400/20 hover:decoration-blue-300/40 transition-colors">{children}</a>,
      blockquote: ({ children }) => <blockquote className="border-l-2 border-blue-500/30 pl-4 py-1 my-4 text-zinc-400 italic">{children}</blockquote>,
      table: ({ children }) => <div className="overflow-x-auto mb-4"><table className="min-w-full border border-white/[0.06] rounded-xl overflow-hidden">{children}</table></div>,
      thead: ({ children }) => <thead className="bg-white/[0.03]">{children}</thead>,
      th: ({ children }) => <th className="px-4 py-2.5 text-left text-[13px] font-semibold text-zinc-200 border-b border-white/[0.06]">{children}</th>,
      td: ({ children }) => <td className="px-4 py-2.5 text-[13px] text-zinc-300 border-b border-white/[0.03]">{children}</td>,
      strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
    }}>{processed}</ReactMarkdown>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className="flex items-center gap-1.5 text-[11px] text-zinc-500 hover:text-zinc-300 px-2.5 py-1.5 rounded-lg hover:bg-white/[0.04] transition-all">
      {copied ? <><Check className="w-3 h-3 text-emerald-500" />Copied</> : <><Copy className="w-3 h-3" />Copy</>}
    </button>
  );
}

// ─── Suggestions ───

const SUGGESTIONS = [
  { icon: TrendingUp, text: "Latest developments in AI agents 2026", color: "from-blue-500/10 to-blue-600/5" },
  { icon: Search, text: "How does HNSW algorithm work?", color: "from-violet-500/10 to-violet-600/5" },
  { icon: BookOpen, text: "Best practices for RAG pipelines", color: "from-emerald-500/10 to-emerald-600/5" },
  { icon: Zap, text: "Compare GPT-4 vs Claude 3.5 performance", color: "from-amber-500/10 to-amber-600/5" },
];

// ─── Main ───

export default function ResearchChat() {
  const history = useChatHistoryContext();
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load messages when switching sessions
  useEffect(() => {
    if (history.activeSessionId) {
      const found = history.sessionsRef.current.find(s => s.id === history.activeSessionId);
      setMessages(found?.messages || []);
    } else {
      setMessages([]);
    }
  }, [history.activeSessionId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-scroll on new messages
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  // "/" shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "/" && !["INPUT", "TEXTAREA"].includes((e.target as HTMLElement)?.tagName || "")) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const handleNewChat = useCallback(() => {
    history.setActiveSessionId(null);
    setMessages([]);
    setQuery("");
    setSearching(false);
    setTimeout(() => inputRef.current?.focus(), 50);
  }, [history]);

  // ─── Core search handler ───
  const handleSearch = async () => {
    const q = query.trim();
    if (!q || searching) return;

    setQuery("");
    setSearching(true);

    // Create or reuse session — pass title on first creation
    let sid = history.activeSessionId;
    if (!sid) {
      const title = q.length > 55 ? q.slice(0, 55) + "..." : q;
      sid = history.createSession(title);
    }

    const msgId = `msg_${Date.now()}`;
    const userMsg: Message = { id: `user_${Date.now()}`, role: "user", content: q };
    const asstMsg: Message = {
      id: msgId, role: "assistant", content: "",
      steps: [{ id: 1, message: "Initializing research...", status: "in-progress" }],
      isThinking: true,
    };

    setMessages(prev => [...prev, userMsg, asstMsg]);

    try {
      const res = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q, session_id: sid }),
      });

      if (res.status === 401 || res.status === 403) { window.location.href = "/auth"; return; }
      if (res.status === 429) {
        setMessages(prev => prev.map(m => m.id === msgId
          ? { ...m, content: "⚠️ Daily quota exceeded. Please try again tomorrow.", isThinking: false, steps: m.steps?.map(s => ({ ...s, status: "done" as const })) }
          : m));
        setSearching(false);
        return;
      }
      if (!res.body) throw new Error("No response body");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let stepId = 1;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("event: ")) continue;
          const evtMatch = line.match(/^event: (.+)$/m);
          const datMatch = line.match(/^data: (.+)$/m);
          if (!evtMatch || !datMatch) continue;

          const evt = evtMatch[1].trim();
          let data: any;
          try { data = JSON.parse(datMatch[1].trim()); } catch { data = datMatch[1].trim(); }

          switch (evt) {
            case "query_type":
              setMessages(prev => prev.map(m => m.id === msgId ? { ...m, queryType: data } : m));
              break;
            case "status":
              setMessages(prev => prev.map(m => {
                if (m.id !== msgId || !m.steps) return m;
                const steps = m.steps.map(s => s.id === stepId ? { ...s, status: "done" as const } : s);
                stepId++;
                return { ...m, steps: [...steps, { id: stepId, message: data, status: "in-progress" as const }] };
              }));
              break;
            case "sources":
              setMessages(prev => prev.map(m => m.id === msgId ? { ...m, sources: data } : m));
              break;
            case "token":
              setMessages(prev => prev.map(m => m.id === msgId ? { ...m, isThinking: false, content: m.content + data } : m));
              break;
            case "done":
              setMessages(prev => {
                const updated = prev.map(m => {
                  if (m.id !== msgId) return m;
                  return { ...m, isThinking: false, steps: m.steps?.map(s => ({ ...s, status: "done" as const })) };
                });
                // Save to history (deferred)
                setTimeout(() => { if (sid) history.updateSession(sid, { messages: updated }); }, 0);
                return updated;
              });
              setSearching(false);
              break;
            case "error":
              setMessages(prev => prev.map(m =>
                m.id === msgId ? { ...m, content: m.content + "\n\n**Error:** " + data, isThinking: false, steps: m.steps?.map(s => ({ ...s, status: "done" as const })) } : m
              ));
              setSearching(false);
              break;
          }
        }
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => prev.map(m =>
        m.id === msgId ? { ...m, content: m.content || "**Connection Error:** Could not reach the server. Make sure the backend is running.", isThinking: false } : m
      ));
      setSearching(false);
    }
  };

  const isHome = messages.length === 0 && !searching;

  return (
    <div className="flex flex-col h-full bg-[#0f0f11] text-zinc-100 selection:bg-blue-500/20 w-full">
      {/* ── Header (chat mode) ── */}
      {!isHome && (
        <header className="shrink-0 h-11 flex items-center px-4 md:px-6 border-b border-white/[0.04] bg-[#0f0f11]/80 backdrop-blur-xl">
          <div className="flex items-center gap-2 text-[13px] text-zinc-500">
            <Sparkles className="w-3.5 h-3.5 text-blue-500" />
            <span className="font-medium text-zinc-400">ResearchAgent</span>
          </div>
          <button onClick={handleNewChat}
            className="ml-auto flex items-center gap-1.5 text-[12px] text-zinc-500 hover:text-white px-2.5 py-1.5 rounded-lg hover:bg-white/[0.05] transition-all">
            <RotateCcw className="w-3 h-3" /> New
          </button>
        </header>
      )}

      {/* ── Scrollable content ── */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className={cn(
          "max-w-[740px] mx-auto px-5",
          isHome ? "min-h-full flex flex-col justify-center items-center py-10" : "py-6 pb-6"
        )}>
          {/* Hero */}
          {isHome && (
            <div className="w-full text-center space-y-6 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="relative w-16 h-16 mx-auto mb-2">
                <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-2xl glow-orb" />
                <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-[#1a1a1d] to-[#131315] border border-white/[0.06] flex items-center justify-center shadow-2xl">
                  <Sparkles className="w-8 h-8 text-blue-500" />
                </div>
              </div>
              <div>
                <h1 className="text-[36px] md:text-[44px] font-semibold tracking-[-0.03em] text-white leading-tight">
                  What do you want<br />
                  <span className="bg-gradient-to-r from-blue-400 via-blue-500 to-indigo-500 bg-clip-text text-transparent">to research?</span>
                </h1>
                <p className="text-zinc-500 text-[14px] mt-3 max-w-md mx-auto leading-relaxed">
                  I search the web, analyze sources, and give you citation-backed answers in seconds.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-w-lg mx-auto mt-4">
                {SUGGESTIONS.map((s, i) => (
                  <button key={i} onClick={() => { setQuery(s.text); inputRef.current?.focus(); }}
                    className={`group flex items-start gap-3 text-left p-3 rounded-xl bg-gradient-to-br ${s.color} border border-white/[0.04] hover:border-white/[0.10] transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]`}>
                    <s.icon className="w-4 h-4 text-zinc-500 group-hover:text-zinc-300 mt-0.5 shrink-0 transition-colors" />
                    <span className="text-[13px] text-zinc-400 group-hover:text-zinc-200 transition-colors leading-snug">{s.text}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="space-y-8 w-full">
            {messages.map(msg => (
              <div key={msg.id} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                {msg.role === "user" ? (
                  <div className="mb-4">
                    <h2 className="text-[24px] md:text-[28px] font-semibold text-white tracking-tight leading-tight">{msg.content}</h2>
                  </div>
                ) : (
                  <div>
                    {msg.queryType && (
                      <div className="mb-3">
                        {msg.queryType === "CONVERSATIONAL" && (
                          <span className="inline-flex items-center gap-1.5 text-[11px] text-zinc-500 px-2.5 py-1 rounded-full bg-white/[0.03] border border-white/[0.06]">
                            <Zap className="w-3 h-3" /> Direct answer
                          </span>
                        )}
                        {msg.queryType === "RESEARCH" && (
                          <span className="inline-flex items-center gap-1.5 text-[11px] text-blue-400 px-2.5 py-1 rounded-full bg-blue-500/[0.06] border border-blue-500/[0.10]">
                            <Search className="w-3 h-3" /> Web research
                          </span>
                        )}
                      </div>
                    )}

                    <ThinkingSteps steps={msg.steps} isThinking={msg.isThinking} />

                    {msg.sources && msg.sources.length > 0 && (
                      <div className="mb-5">
                        <div className="flex items-center gap-2 mb-2.5 text-[11px] text-zinc-500 uppercase tracking-[0.1em] font-semibold">
                          <Library className="w-3.5 h-3.5" /> Sources · {msg.sources.length}
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                          {msg.sources.map((src, i) => <SourceCard key={i} source={src} index={i} />)}
                        </div>
                      </div>
                    )}

                    {msg.content && (
                      <div>
                        <div className="flex items-center gap-2 mb-3 text-[11px] text-zinc-500 uppercase tracking-[0.1em] font-semibold">
                          <AlignLeft className="w-3.5 h-3.5" /> Answer
                        </div>
                        <div className={msg.isThinking && msg.content ? "typing-cursor" : ""}>
                          <FormattedMarkdown text={msg.content} sources={msg.sources} />
                        </div>
                        {!msg.isThinking && msg.content && (
                          <div className="flex items-center gap-1 mt-4 pt-3 border-t border-white/[0.04]">
                            <CopyButton text={msg.content} />
                            <button onClick={() => { setQuery(`Tell me more about: ${msg.content.slice(0, 60)}...`); inputRef.current?.focus(); }}
                              className="flex items-center gap-1.5 text-[11px] text-zinc-500 hover:text-zinc-300 px-2.5 py-1.5 rounded-lg hover:bg-white/[0.04] transition-all">
                              <Plus className="w-3 h-3" /> Follow-up
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
            <div ref={scrollRef} />
          </div>
        </div>
      </div>

      {/* ── Input bar (flex bottom, never overlaps sidebar) ── */}
      <div className="shrink-0 border-t border-white/[0.04] bg-[#0f0f11] px-5 py-3">
        <div className={cn("mx-auto relative", isHome ? "max-w-lg" : "max-w-[740px]")}>
          <div className="relative">
            <Input ref={inputRef} value={query} onChange={e => setQuery(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSearch(); } }}
              placeholder="Ask anything..." disabled={searching}
              className="w-full h-12 bg-white/[0.04] text-white text-[14px] px-4 pr-12 rounded-xl border-white/[0.08] placeholder:text-zinc-600 focus-visible:ring-1 focus-visible:ring-blue-500/40 focus-visible:border-blue-500/30 transition-all" />
            <div className="absolute right-1.5 top-1/2 -translate-y-1/2">
              <Button onClick={handleSearch} disabled={searching || !query.trim()} size="icon"
                className={cn("transition-all duration-200 rounded-xl w-9 h-9",
                  query.trim() ? "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20" : "bg-transparent text-zinc-600 hover:bg-white/[0.04]")}>
                {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowUp className="w-4 h-4" />}
              </Button>
            </div>
          </div>
          <p className="text-[10px] text-center text-zinc-700 mt-1.5">
            Press <kbd className="px-1 py-0.5 bg-white/[0.04] rounded border border-white/[0.06] text-[9px] font-mono text-zinc-500">/</kbd> to focus
          </p>
        </div>
      </div>
    </div>
  );
}
