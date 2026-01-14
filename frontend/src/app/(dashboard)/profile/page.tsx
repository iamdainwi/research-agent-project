"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  CreditCard,
  Key,
  LogOut,
  Loader2,
  Copy,
  Check,
  Plus,
  ArrowLeft,
  Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

interface UserProfile {
  name: string;
  email: string;
  quota: {
    research: { count: number; limit: number };
    download: { count: number; limit: number };
  };
}

interface ApiKey {
  _id: string;
  name: string;
  key: string;
  createdAt: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingKey, setIsGeneratingKey] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Fetch Profile and Keys
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, keysRes] = await Promise.all([
          fetch("/api/auth/me"),
          fetch("/api/auth/apikeys"),
        ]);

        if (profileRes.status === 401) {
          router.push("/auth");
          return;
        }

        const profileData = await profileRes.json();
        const keysData = await keysRes.json();

        if (profileData.success) setProfile(profileData.data);
        if (keysData.success) setApiKeys(keysData.data);
      } catch (error) {
        console.error("Failed to fetch profile data", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.href = "/auth";
    } catch (error) {
      console.error("Logout failed", error);
      window.location.href = "/auth";
    }
  };

  const generateApiKey = async () => {
    if (!newKeyName.trim()) return;
    setIsGeneratingKey(true);

    try {
      const res = await fetch("/api/auth/apikey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newKeyName }),
      });
      const data = await res.json();

      if (data.success) {
        // Ideally endpoint returns the created key object including ID
        // The implementation returned { success: true, data: { name, key } } 
        // Need to refetch or manually add to list (but we miss _id without refetch or proper return)
        // Let's refetch keys for simplicity.
        const keysRes = await fetch("/api/auth/apikeys");
        const keysData = await keysRes.json();
        setApiKeys(keysData.data);
        setNewKeyName("");
      }
    } catch (error) {
      console.error("Failed to generate key", error);
    } finally {
      setIsGeneratingKey(false);
    }
  };

  const deleteApiKey = async (id: string) => {
    try {
        const res = await fetch(`/api/auth/apikey/${id}`, {
            method: 'DELETE'
        });
        const data = await res.json();
        
        if (data.success) {
            setApiKeys(apiKeys.filter(k => k._id !== id));
        }
    } catch (error) {
        console.error("Failed to delete key", error);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(text);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-zinc-100 font-sans p-6 md:p-12">
      <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
             <Link href="/chat" className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                 <ArrowLeft className="w-5 h-5 text-gray-400" />
             </Link>
             <div>
                <h1 className="text-2xl font-semibold font-inter text-white">Profile & Settings</h1>
                <p className="text-zinc-400 text-sm">Manage your account and API access</p>
             </div>
          </div>
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={handleLogout}
            className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
            {/* User Info Card */}
            <div className="col-span-1 bg-[#18181b] rounded-2xl border border-white/5 p-6 space-y-6">
                <div className="w-16 h-16 rounded-full bg-linear-to-tr from-blue-600 to-purple-600 flex items-center justify-center text-xl font-bold mb-4">
                    {profile?.name.charAt(0).toUpperCase()}
                </div>
                <div>
                   <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Full Name</label>
                   <p className="text-lg font-medium text-white">{profile?.name}</p>
                </div>
                <div>
                   <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Email Address</label>
                   <p className="text-sm font-medium text-white">{profile?.email}</p>
                </div>
            </div>

            {/* Quota Usage Card */}
            <div className="col-span-1 md:col-span-2 bg-[#18181b] rounded-2xl border border-white/5 p-6 flex flex-col justify-center space-y-6">
                 <h2 className="text-lg font-semibold flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-blue-500" />
                    Current Usage
                 </h2>

                 {profile && (
                     <div className="space-y-6">
                         {/* Research Quota */}
                         <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Research Requests</span>
                                <span className="text-white font-mono">{profile.quota.research.count} / {profile.quota.research.limit}</span>
                            </div>
                            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-blue-500 transition-all duration-500" 
                                    style={{ width: `${(profile.quota.research.count / profile.quota.research.limit) * 100}%` }}
                                />
                            </div>
                         </div>

                         {/* Download Quota */}
                         <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Report Downloads</span>
                                <span className="text-white font-mono">{profile.quota.download.count} / {profile.quota.download.limit}</span>
                            </div>
                            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-purple-500 transition-all duration-500" 
                                    style={{ width: `${(profile.quota.download.count / profile.quota.download.limit) * 100}%` }}
                                />
                            </div>
                         </div>
                     </div>
                 )}
            </div>
        </div>

        {/* API Keys Section */}
        <div className="bg-[#18181b] rounded-2xl border border-white/5 p-6 space-y-6">
             <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        <Key className="w-5 h-5 text-yellow-500" />
                        API Keys
                    </h2>
                    <p className="text-sm text-gray-400 mt-1">Manage API keys for external access</p>
                </div>
             </div>

             {/* Generator */}
             <div className="flex gap-2">
                 <Input 
                    placeholder="Enter key name (e.g., My App)" 
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    className="bg-[#0a0a0b] border-white/10 text-white"
                 />
                 <Button 
                    onClick={generateApiKey} 
                    disabled={isGeneratingKey || !newKeyName.trim()}
                    className="bg-blue-600 hover:bg-blue-500 text-white min-w-[140px]"
                 >
                    {isGeneratingKey ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Plus className="w-4 h-4 mr-2" /> Generate</>}
                 </Button>
             </div>

             {/* Keys List */}
             <div className="space-y-3">
                 {apiKeys.length === 0 ? (
                     <p className="text-gray-500 text-sm py-4 text-center border border-dashed border-white/10 rounded-lg">No API keys created yet.</p>
                 ) : (
                     apiKeys.map((key) => (
                         <div key={key._id} className="flex items-center justify-between p-4 bg-[#0a0a0b] rounded-xl border border-white/5">
                             <div className="space-y-1">
                                 <p className="text-sm font-medium text-white">{key.name}</p>
                                 <p className="text-xs text-mono text-gray-500 font-mono truncate max-w-[200px] md:max-w-md">
                                     {key.key}
                                 </p>
                             </div>
                             <div className="flex items-center gap-2">
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => copyToClipboard(key.key)}
                                    className="text-gray-400 hover:text-white"
                                >
                                    {copiedKey === key.key ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                                </Button>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => deleteApiKey(key._id)}
                                    className="text-gray-400 hover:text-red-400 hover:bg-red-500/10"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                             </div>
                         </div>
                     ))
                 )}
             </div>
        </div>

      </div>
    </div>
  );
}
