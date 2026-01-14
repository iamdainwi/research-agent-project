"use client";

import Link from "next/link";
import { 
  Home, 
  User, 
  LogOut, 
  Sparkles, 
  MessageSquare 
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

const items = [
  {
    title: "Research Chat",
    url: "/chat",
    icon: Sparkles,
  },
  {
    title: "Profile",
    url: "/profile",
    icon: User,
  },
];

export function AppSidebar() {
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.href = "/auth";
    } catch (error) {
      console.error("Logout failed", error);
      window.location.href = "/auth";
    }
  };

  return (
    <Sidebar className="border-r border-white/5 bg-[#18181b]">
      <SidebarHeader className="bg-[#18181b] border-b border-white/5 p-4">
        <div className="flex items-center gap-2 text-sm font-medium text-zinc-300">
           <div className="w-6 h-6 rounded-md bg-blue-600/10 flex items-center justify-center border border-blue-500/20">
             <Sparkles className="w-3.5 h-3.5 text-blue-500" />
           </div>
           <span className="font-semibold text-white">ResearchAgent</span>
        </div>
      </SidebarHeader>

      <SidebarContent className="bg-[#18181b] px-2 py-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-zinc-500 uppercase tracking-wider text-xs font-medium px-2 mb-2">
            Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="text-zinc-400 hover:text-white hover:bg-white/5 active:bg-white/10 rounded-lg h-9">
                    <Link href={item.url} className="flex items-center w-full">
                      <item.icon className="w-4 h-4 mr-2" />
                      <span className="font-medium">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="bg-[#18181b] p-4 border-t border-white/5">
        <SidebarMenu>
           <SidebarMenuItem>
             <SidebarMenuButton 
                onClick={handleLogout}
                className="text-red-400 hover:text-red-300 hover:bg-red-500/10 active:bg-red-500/20 rounded-lg h-9 w-full justify-start"
             >
                <LogOut className="w-4 h-4 mr-2" />
                <span className="font-medium">Sign Out</span>
             </SidebarMenuButton>
           </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}