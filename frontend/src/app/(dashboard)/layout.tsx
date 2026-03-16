"use client";

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { useChatHistory } from "@/hooks/use-chat-history";
import { createContext, useContext } from "react";

// Context to share chat history across the dashboard
export const ChatHistoryContext = createContext<ReturnType<
  typeof useChatHistory
> | null>(null);

export function useChatHistoryContext() {
  const ctx = useContext(ChatHistoryContext);
  if (!ctx) throw new Error("ChatHistoryContext not found");
  return ctx;
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const chatHistory = useChatHistory();

  return (
    <ChatHistoryContext.Provider value={chatHistory}>
      <SidebarProvider>
        <AppSidebar
          chatGroups={chatHistory.groupedSessions()}
          activeSessionId={chatHistory.activeSessionId}
          onSelectSession={(id) => chatHistory.setActiveSessionId(id)}
          onDeleteSession={(id) => chatHistory.deleteSession(id)}
          onNewChat={() => {
            chatHistory.createSession();
          }}
        />
        <main className="flex flex-1 flex-col h-screen bg-[#0f0f11] overflow-hidden relative">
          <div className="absolute top-3 left-3 z-50 md:hidden">
            <SidebarTrigger className="text-zinc-500 hover:text-white hover:bg-white/5 rounded-lg" />
          </div>
          {children}
        </main>
      </SidebarProvider>
    </ChatHistoryContext.Provider>
  );
}