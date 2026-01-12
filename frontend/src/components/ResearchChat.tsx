"use client";

import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import { 
  Loader2, 
  ArrowUp, 
  Sparkles, 
  Search, 
  Globe, 
  ChevronDown, 
  ChevronRight,
  Library,
  AlignLeft,
  Share2,
  Plus
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// --- Types ---

type Source = {
  title: string;
  url: string;
  favicon?: string;
};

type Step = {
  id: number;
  message: string;
  status: "pending" | "in-progress" | "done";
};

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
  steps?: Step[]; 
  isThinking?: boolean;
};

// --- Helper Components ---

const SourceCard = ({ source, index }: { source: Source; index: number }) => {
  const hostname = new URL(source.url).hostname.replace("www.", "");
  
  return (
    <a 
      href={source.url} 
      target="_blank" 
      rel="noopener noreferrer"
      className="group flex flex-col justify-between p-3 h-24 bg-[#202022] hover:bg-[#2A2A2D] border border-white/5 hover:border-white/10 rounded-lg transition-all cursor-pointer overflow-hidden"
    >
      <div className="flex flex-col gap-1.5">
        <h3 className="text-[13px] font-medium text-gray-200 line-clamp-2 leading-snug group-hover:text-blue-400 transition-colors">
          {source.title}
        </h3>
      </div>
      <div className="flex items-center gap-2 mt-auto">
        <div className="w-4 h-4 rounded-full bg-white/10 flex items-center justify-center overflow-hidden shrink-0">
          {source.favicon ? (
            <img src={source.favicon} alt="" className="w-full h-full object-cover" />
          ) : (
            <Globe className="w-2.5 h-2.5 text-gray-400" />
          )}
        </div>
        <span className="text-[11px] text-gray-500 truncate">{hostname}</span>
        <span className="text-[10px] text-gray-600 ml-auto bg-white/5 px-1.5 py-0.5 rounded-full">
          {index + 1}
        </span>
      </div>
    </a>
  );
};

const ThinkingProcess = ({ steps, isThinking }: { steps?: Step[]; isThinking?: boolean }) => {
  const [isOpen, setIsOpen] = useState(true);

  if (!steps || steps.length === 0) return null;

  return (
    <div className="mb-6">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-200 transition-colors mb-2 group"
      >
        {isThinking ? (
          <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
        ) : (
          <div className="w-4 h-4 rounded-full bg-blue-500/20 flex items-center justify-center">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
          </div>
        )}
        <span className="font-medium">
          {isThinking ? "Researching..." : "Research complete"}
        </span>
        {isOpen ? <ChevronDown className="w-4 h-4 opacity-50" /> : <ChevronRight className="w-4 h-4 opacity-50" />}
      </button>
      
      {isOpen && (
        <div className="pl-[1.1rem] ml-2 border-l border-white/10 space-y-2 py-1">
          {steps.map((step) => (
            <div key={step.id} className="flex items-center gap-3 text-[13px]">
              {step.status === "done" ? (
                <div className="w-4 h-4 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
                  <span className="text-[10px] text-green-500">✓</span>
                </div>
              ) : step.status === "in-progress" ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-400 shrink-0" />
              ) : (
                <div className="w-1.5 h-1.5 rounded-full bg-gray-700 ml-1.5 shrink-0" />
              )}
              <span className={cn(
                "transition-colors",
                step.status === "done" ? "text-gray-400" : 
                step.status === "in-progress" ? "text-blue-300" : "text-gray-600"
              )}>
                {step.message}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const FormattedText = ({ text, sources }: { text: string; sources?: Source[] }) => {
  // Pre-process text to replace citation markers [N] with links
  const processedText = text.replace(/\[(\d+)\]/g, (match, id) => {
    const index = parseInt(id) - 1;
    const source = sources?.[index];
    if (source) {
      // Create a markdown link that will be rendered by the custom 'a' component or standard markdown
      // We use a specific class or structure if we want special styling, but for now standard markdown link is easiest
      // But we want it to look like [1] but be clickable.
      // Let's rely on rehype-raw and inject a span/a tag.
      return `<a href="${source.url}" class="citation-badge" target="_blank">${id}</a>`;
    }
    return match;
  });

  return (
    <div className="citation-wrapper">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeSanitize]}
        components={{
          // Headings
          h1: ({ children }) => (
            <h1 className="text-2xl font-bold text-white mt-8 mb-4 first:mt-0">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-xl font-semibold text-white mt-6 mb-3 first:mt-0">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-lg font-semibold text-gray-100 mt-5 mb-2 first:mt-0">{children}</h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-base font-semibold text-gray-200 mt-4 mb-2">{children}</h4>
          ),
          
          // Paragraphs
          p: ({ children }) => (
            <p className="text-[15px] leading-relaxed text-gray-300/95 mb-4 last:mb-0">{children}</p>
          ),
          
          // Lists
          ul: ({ children }) => (
            <ul className="list-disc list-outside ml-5 space-y-2 mb-4 text-gray-300">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-outside ml-5 space-y-2 mb-4 text-gray-300">{children}</ol>
          ),
          li: ({ children }) => (
            <li className="pl-1 leading-relaxed">{children}</li>
          ),
          
          // Code
          code: ({ inline, className, children, ...props }: any) => {
            const match = /language-(\w+)/.exec(className || '');
            return !inline ? (
              <pre className="bg-[#0d1117] border border-white/10 rounded-lg p-4 mb-4 overflow-x-auto">
                <code className={`text-sm text-gray-300 font-mono ${className || ''}`} {...props}>
                  {children}
                </code>
              </pre>
            ) : (
              <code className="bg-white/5 text-blue-400 px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
                {children}
              </code>
            );
          },
          
          // Links
          a: ({ href, className, children }) => {
            // Check if it's our custom citation badge
            if (className === "citation-badge") {
               return (
                 <a
                   href={href}
                   target="_blank"
                   rel="noopener noreferrer"
                   className="inline-flex items-center justify-center w-5 h-5 ml-0.5 -mt-2 text-[10px] font-bold text-blue-500 bg-blue-500/10 hover:bg-blue-500/20 rounded-full border border-blue-500/20 align-text-top transition-colors no-underline"
                 >
                   {children}
                 </a>
               );
            }
            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 underline decoration-blue-400/30 hover:decoration-blue-300/50 transition-colors"
              >
                {children}
              </a>
            )
          },
          
          // Blockquotes
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-blue-500/30 pl-4 py-1 my-4 text-gray-400 italic">
              {children}
            </blockquote>
          ),
          
          // Tables
          table: ({ children }) => (
            <div className="overflow-x-auto mb-4">
              <table className="min-w-full border border-white/10 rounded-lg overflow-hidden">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-white/5">{children}</thead>
          ),
          th: ({ children }) => (
            <th className="px-4 py-2 text-left text-sm font-semibold text-gray-200 border-b border-white/10">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-4 py-2 text-sm text-gray-300 border-b border-white/5">
              {children}
            </td>
          ),
          
          // Horizontal rule
          hr: () => (
            <hr className="my-6 border-white/10" />
          ),
          
          // Strong/Bold
          strong: ({ children }) => (
            <strong className="font-semibold text-white">{children}</strong>
          ),
          
          // Emphasis/Italic
          em: ({ children }) => (
            <em className="italic text-gray-200">{children}</em>
          ),
        }}
      >
        {processedText}
      </ReactMarkdown>
    </div>
  );
};

// --- Main Component ---

export default function ResearchChat() {
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll logic
  useEffect(() => {
    if (scrollRef.current) {
      // Only scroll if we are near the bottom or it's a new message
      const isNearBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 500;
      if (isNearBottom) {
        scrollRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [messages, isSearching]);

  const handleSearch = async () => {
    if (!query.trim() || isSearching) return;

    const userQuery = query;
    setQuery("");
    setIsSearching(true);
    
    const newMessageId = Date.now().toString();
    
    // Add user message
    setMessages(prev => [...prev, { 
      id: Date.now().toString(), 
      role: "user", 
      content: userQuery 
    }]);

    // Add initial assistant message placeholder
    setMessages(prev => [...prev, { 
      id: newMessageId, 
      role: "assistant", 
      content: "", 
      steps: [{ id: 1, message: "Initializing research...", status: "in-progress" }],
      isThinking: true 
    }]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: userQuery }),
      });

      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let currentStepId = 1;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("event: ")) {
            const eventMatch = line.match(/^event: (.+)$/m);
            const dataMatch = line.match(/^data: (.+)$/m);

            if (eventMatch && dataMatch) {
              const eventType = eventMatch[1].trim();
              const dataStr = dataMatch[1].trim();
              let data;
              try {
                data = JSON.parse(dataStr);
              } catch {
                data = dataStr;
              }

              switch (eventType) {
                case "status":
                  // Mark current step done
                  updateStep(newMessageId, currentStepId, "done");
                  // Add new step
                  currentStepId++;
                  addStep(newMessageId, { id: currentStepId, message: data, status: "in-progress" });
                  break;

                case "sources":
                  setMessages(prev => prev.map(msg => {
                    if (msg.id === newMessageId) {
                      return { ...msg, sources: data };
                    }
                    return msg;
                  }));
                  break;

                case "token":
                   // Stop thinking animation when tokens start
                   setMessages(prev => prev.map(msg => 
                     msg.id === newMessageId && msg.isThinking ? { ...msg, isThinking: false } : msg
                   ));
                   
                   setMessages(prev => prev.map(msg => 
                     msg.id === newMessageId ? { ...msg, content: msg.content + data } : msg
                   ));
                   break;

                case "done":
                  updateStep(newMessageId, currentStepId, "done");
                  setIsSearching(false);
                  break;
                  
                case "error":
                  updateStep(newMessageId, currentStepId, "done");
                   setMessages(prev => prev.map(msg => 
                     msg.id === newMessageId ? { ...msg, content: msg.content + "\n\n**Error:** " + data } : msg
                   ));
                   break;
              }
            }
          }
        }
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => prev.map(msg => 
         msg.id === newMessageId ? { ...msg, content: msg.content + "\n\n**Connection Error**" } : msg
      ));
      setIsSearching(false);
    }
  };

  const updateStep = (msgId: string, stepId: number, status: "done" | "in-progress") => {
    setMessages(prev => prev.map(msg => {
      if (msg.id === msgId && msg.steps) {
        return {
          ...msg,
          steps: msg.steps.map(s => s.id === stepId ? { ...s, status } : s)
        };
      }
      return msg;
    }));
  };

  const addStep = (msgId: string, step: Step) => {
    setMessages(prev => prev.map(msg => {
      if (msg.id === msgId && msg.steps) {
        return { ...msg, steps: [...msg.steps, step] };
      }
      return msg;
    }));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSearch();
    }
  };

  const isHome = messages.length === 0;

  return (
    <div className="flex flex-col h-screen bg-[#18181b] text-zinc-100 font-sans selection:bg-blue-500/30">
      
      {/* Header (Hidden on Home) */}
      {!isHome && (
        <header className="fixed top-0 w-full bg-[#18181b]/80 backdrop-blur-md border-b border-white/5 z-50 h-14 flex items-center px-4 md:px-6">
          <div className="flex items-center gap-2 text-sm font-medium text-zinc-300">
            <Sparkles className="w-4 h-4 text-blue-500" />
            <span>ResearchEngine</span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white hover:bg-white/5">
              <Share2 className="w-4 h-4" />
            </Button>
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center text-xs font-bold">
              D
            </div>
          </div>
        </header>
      )}

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto pt-14 pb-32 scroll-smooth">
        <div className={cn(
          "max-w-3xl mx-auto px-4 md:px-0 transition-all duration-500 ease-in-out",
          isHome ? "min-h-[80vh] flex flex-col justify-center items-center" : "py-8"
        )}>
          
          {/* Home Screen Hero */}
          {isHome && (
            <div className="w-full text-center space-y-8 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="w-16 h-16 mx-auto bg-[#202022] rounded-2xl border border-white/5 flex items-center justify-center shadow-2xl shadow-blue-900/10">
                <Sparkles className="w-8 h-8 text-blue-500" />
              </div>
              <h1 className="text-4xl md:text-5xl font-medium tracking-tight text-white">
                What do you want to know?
              </h1>
            </div>
          )}

          {/* Chat Messages */}
          <div className="space-y-12 w-full">
            {messages.map((msg) => (
              <div key={msg.id} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                {msg.role === "user" ? (
                  <h2 className="text-3xl font-medium text-white tracking-tight mb-8">
                    {msg.content}
                  </h2>
                ) : (
                  <div className="relative">
                    {/* Left Connector Line */}
                    <div className="absolute left-0 top-0 bottom-0 w-px bg-white/5 -ml-8 hidden md:block" />
                    
                    {/* Thought Process */}
                    <ThinkingProcess steps={msg.steps} isThinking={msg.isThinking} />

                    {/* Sources Grid */}
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="mb-8">
                        <div className="flex items-center gap-2 mb-3 text-sm text-gray-400 uppercase tracking-wider font-medium">
                          <Library className="w-4 h-4" />
                          Sources
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          {msg.sources.map((source, idx) => (
                            <SourceCard key={idx} source={source} index={idx} />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Answer Text */}
                    {msg.content && (
                      <div className="group">
                        <div className="flex items-center gap-2 mb-3 text-sm text-gray-400 uppercase tracking-wider font-medium">
                          <AlignLeft className="w-4 h-4" />
                          Answer
                        </div>
                        <FormattedText text={msg.content} sources={msg.sources} />
                        
                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 mt-6 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="outline" size="sm" className="bg-[#202022] border-white/5 text-xs text-gray-400 h-8 hover:text-white hover:bg-white/10">
                            <Share2 className="w-3.5 h-3.5 mr-2" />
                            Share
                          </Button>
                          <Button variant="outline" size="sm" className="bg-[#202022] border-white/5 text-xs text-gray-400 h-8 hover:text-white hover:bg-white/10">
                            <Plus className="w-3.5 h-3.5 mr-2" />
                            Follow-up
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
            <div ref={scrollRef} className="h-4" />
          </div>

          {/* Input Area (Centered on Home, Bottom on Chat) */}
          <div className={cn(
            "w-full transition-all duration-500 ease-in-out z-20",
            isHome ? "max-w-2xl" : "fixed bottom-0 left-0 right-0 bg-gradient-to-t from-[#18181b] via-[#18181b] to-transparent pt-10 pb-6"
          )}>
            <div className={cn(
              "mx-auto relative", 
              isHome ? "w-full" : "max-w-3xl px-4 md:px-0"
            )}>
              <div className="relative group">
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask anything..."
                  disabled={isSearching}
                  className={cn(
                    "w-full bg-[#202022] text-white border-white/10 placeholder:text-gray-500 focus-visible:ring-1 focus-visible:ring-blue-500/50 focus-visible:border-blue-500/50 transition-all shadow-2xl",
                    isHome ? "h-16 text-lg px-6 rounded-2xl" : "h-14 text-base px-5 pr-14 rounded-xl"
                  )}
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  <Button
                    onClick={handleSearch}
                    disabled={isSearching || !query.trim()}
                    size="icon"
                    className={cn(
                      "transition-all duration-300",
                      query.trim() ? "bg-blue-600 hover:bg-blue-500 text-white" : "bg-transparent text-gray-500 hover:bg-white/5",
                      isHome ? "w-10 h-10 rounded-xl" : "w-9 h-9 rounded-lg"
                    )}
                  >
                    {isSearching ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowUp className="w-5 h-5" />}
                  </Button>
                </div>
              </div>
              
              {!isHome && (
                 <p className="text-[10px] text-center text-gray-600 mt-3">
                   Pro Search • Powered by LLM & Live Web
                 </p>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}