"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  User,
  LogOut,
  Sparkles,
  Plus,
  MessageSquare,
  Trash2,
  Search,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar";

import { ChatSession } from "@/hooks/use-chat-history";

interface AppSidebarProps {
  chatGroups?: { label: string; sessions: ChatSession[] }[];
  activeSessionId?: string | null;
  onSelectSession?: (id: string) => void;
  onDeleteSession?: (id: string) => void;
  onNewChat?: () => void;
}

export function AppSidebar({
  chatGroups = [],
  activeSessionId,
  onSelectSession,
  onDeleteSession,
  onNewChat,
}: AppSidebarProps) {
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.href = "/auth";
    } catch (error) {
      console.error("Logout failed", error);
      window.location.href = "/auth";
    }
  };

  return (
    <Sidebar className="border-r border-white/[0.06] bg-[#111113] w-[280px]">
      {/* Header + New Chat */}
      <SidebarHeader className="bg-[#111113] p-3 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-semibold text-[15px] text-white tracking-tight">
              ResearchAgent
            </span>
          </div>
        </div>

        <button
          onClick={onNewChat}
          className="flex items-center gap-2 w-full px-3 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.06] hover:border-white/[0.12] text-zinc-300 hover:text-white text-sm font-medium transition-all duration-200 group"
        >
          <Plus className="w-4 h-4 text-zinc-500 group-hover:text-blue-400 transition-colors" />
          New Chat
        </button>
      </SidebarHeader>

      {/* Chat History */}
      <SidebarContent className="bg-[#111113] px-2 py-2 custom-scrollbar">
        {chatGroups.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="w-10 h-10 rounded-xl bg-white/[0.03] flex items-center justify-center mb-3">
              <MessageSquare className="w-5 h-5 text-zinc-600" />
            </div>
            <p className="text-xs text-zinc-600 leading-relaxed">
              No conversations yet.
              <br />
              Start a new chat to begin.
            </p>
          </div>
        ) : (
          chatGroups.map((group) => (
            <SidebarGroup key={group.label} className="mb-1">
              <SidebarGroupLabel className="text-zinc-600 text-[10px] uppercase tracking-[0.1em] font-semibold px-3 mb-1">
                {group.label}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-0.5">
                  {group.sessions.map((session) => (
                    <SidebarMenuItem key={session.id}>
                      <div
                        onClick={() => onSelectSession?.(session.id)}
                        className={`group relative flex items-center text-zinc-400 hover:text-white rounded-lg h-9 px-3 w-full transition-all duration-200 cursor-pointer text-left ${
                          activeSessionId === session.id
                            ? "bg-white/[0.08] text-white border-l-2 border-blue-500"
                            : "hover:bg-white/[0.04]"
                        }`}
                      >
                        <Search
                          className={`w-3.5 h-3.5 mr-2 shrink-0 ${
                            activeSessionId === session.id
                              ? "text-blue-400"
                              : "text-zinc-600"
                          }`}
                        />
                        <span className="truncate text-[13px] font-normal">
                          {session.title}
                        </span>

                        {/* Delete button on hover */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteSession?.(session.id);
                          }}
                          className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/10 rounded transition-all"
                        >
                          <Trash2 className="w-3 h-3 text-zinc-500 hover:text-red-400" />
                        </button>
                      </div>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))
        )}
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="bg-[#111113] p-2 border-t border-white/[0.06]">
        <SidebarMenu className="space-y-0.5">
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className={`text-zinc-400 hover:text-white hover:bg-white/[0.04] rounded-lg h-9 ${
                pathname === "/profile" ? "bg-white/[0.06] text-white" : ""
              }`}
            >
              <Link href="/profile" className="flex items-center w-full">
                <User className="w-4 h-4 mr-2" />
                <span className="text-[13px] font-medium">Profile</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleLogout}
              className="text-zinc-500 hover:text-red-400 hover:bg-red-500/[0.06] rounded-lg h-9 w-full justify-start transition-colors"
            >
              <LogOut className="w-4 h-4 mr-2" />
              <span className="text-[13px] font-medium">Sign Out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}