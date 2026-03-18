"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import client from "@/lib/api";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { RefreshCw, User, Terminal, CheckCircle2, FlaskConical, Loader2, AlertCircle } from "lucide-react";

export function HomePageClient() {
  const [greetName, setGreetName] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // ユーザー一覧を取得する Query
  const usersQuery = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const res = await client.users.$get();
      if (!res.ok) throw new Error("Failed to fetch users");
      return res.json();
    },
  });

  // Greet API を呼び出す Mutation
  const greetMutation = useMutation({
    mutationFn: async (name: string) => {
      const res = await client.greet.$post({
        json: { name },
      });
      const data = await res.json();
      if (!res.ok) {
        // Hono RPC が返す共用体型からエラーメッセージを抽出
        const errorMessage = (data as { error?: string }).error || "Failed to call API";
        throw new Error(errorMessage);
      }
      return data;
    },
    onSuccess: (data) => {
      // 成功時の処理（data.message は型安全）
      alert(data.message);
      setGreetName("");
    },
    onError: (error) => {
      alert(error instanceof Error ? error.message : "Error calling API");
    }
  });

  const handleGreet = () => {
    greetMutation.mutate(greetName);
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-background to-background text-foreground selection:bg-blue-500/30">
      <div className="max-w-6xl mx-auto px-6 py-20 lg:py-32 flex flex-col items-center gap-16">
        {/* Hero Section */}
        <section className="text-center space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium mb-4">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            Production-Ready Template
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/50">
            Next.js + Hono + D1
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            The ultimate starting point for full-stack Cloudflare applications. 
            Highly typed, extremely fast, and developer-friendly.
          </p>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 w-full">
          {/* D1 Data Test Card */}
          <div className="group relative p-8 border border-white/10 bg-black/40 backdrop-blur-sm rounded-3xl overflow-hidden shadow-2xl transition-all hover:border-blue-500/30 duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent pointer-events-none" />
            
            <div className="relative flex flex-col h-full gap-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400">
                    <User size={24} />
                  </div>
                  <h2 className="text-2xl font-bold tracking-tight">D1 Database Test</h2>
                </div>
                <Button 
                  size="icon"
                  variant="ghost" 
                  onClick={() => usersQuery.refetch()}
                  disabled={usersQuery.isFetching}
                  className="rounded-full cursor-pointer hover:bg-blue-500/20 text-blue-400"
                >
                  <RefreshCw size={18} className={usersQuery.isFetching ? "animate-spin" : ""} />
                </Button>
              </div>

              <div className="flex-1 min-h-[300px]">
                {usersQuery.isLoading ? (
                  <div className="flex items-center justify-center h-full text-muted-foreground animate-pulse">
                    Loading users...
                  </div>
                ) : usersQuery.isError ? (
                  <div className="flex items-center justify-center h-full text-red-400/80 bg-red-400/5 rounded-2xl border border-red-400/10">
                    Failed to connect to D1
                  </div>
                ) : (
                  <ul className="grid gap-3">
                    {usersQuery.data?.map((user) => (
                      <li key={user.id} className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between group-hover:bg-white/10 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-xs font-bold">
                            {user.name[0]?.toUpperCase()}
                          </div>
                          <span className="font-semibold">{user.name}</span>
                        </div>
                        <span className="text-xs font-mono text-muted-foreground bg-white/5 px-2 py-1 rounded">
                          ID: {user.id}
                        </span>
                      </li>
                    ))}
                    {usersQuery.data?.length === 0 && (
                      <div className="text-center py-10 text-muted-foreground italic">
                        No users found. Run `pnpm db:seed` locally.
                      </div>
                    )}
                  </ul>
                )}
              </div>
            </div>
          </div>

          {/* RPC Interaction Card */}
          <div className="group relative p-8 border border-white/10 bg-black/40 backdrop-blur-sm rounded-3xl overflow-hidden shadow-2xl transition-all hover:border-purple-500/30 duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent pointer-events-none" />
            
            <div className="relative flex flex-col h-full gap-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400">
                  <Terminal size={24} />
                </div>
                <h2 className="text-2xl font-bold tracking-tight">Hono RPC Test</h2>
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed">
                Experience full type-safety across the network. 
                Any changes in the backend are immediately reflected in your IDE.
              </p>

              <div className="space-y-4">
                <div className="relative group/input">
                  <input
                    type="text"
                    placeholder="Enter your name..."
                    className="w-full bg-white/5 border border-white/10 px-4 py-4 rounded-2xl outline-none focus:border-purple-500/50 focus:ring-4 focus:ring-purple-500/10 transition-all text-lg"
                    value={greetName}
                    onChange={(e) => setGreetName(e.target.value)}
                  />
                </div>
                <Button 
                  onClick={handleGreet}
                  disabled={greetMutation.isPending}
                  className="w-full py-6 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-lg shadow-lg shadow-purple-900/20 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {greetMutation.isPending ? (
                    <Loader2 size={20} className="mr-2 animate-spin" />
                  ) : (
                    <FlaskConical size={20} className="mr-2" />
                  )}
                  {greetMutation.isPending ? "Sending..." : "Test Greet RPC"}
                </Button>
              </div>

              <div className="mt-8 p-4 rounded-2xl bg-yellow-500/5 border border-yellow-500/10 flex gap-4">
                <CheckCircle2 className="text-yellow-500 shrink-0 mt-0.5" size={18} />
                <div className="text-xs space-y-1 text-yellow-200/70">
                  <p className="font-bold text-yellow-500/90 text-sm mb-1 uppercase tracking-wider">Environment Check</p>
                  <p>Proxying via <code className="bg-black/40 px-1 py-0.5 rounded">/api</code></p>
                  <p className="truncate">URL: <code className="bg-black/40 px-1 py-0.5 rounded">{mounted ? window.location.origin + '/api' : '...'}</code></p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tech Stack Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 w-full">
          {[
            { name: "Framework", tech: "Next.js 16" },
            { name: "Edge API", tech: "Hono" },
            { name: "Type Safety", tech: "RPC + Zod" },
            { name: "Database", tech: "Cloudflare D1" },
            { name: "ORM", tech: "Drizzle" },
            { name: "Query", tech: "TanStack v5" },
          ].map((item) => (
            <div key={item.name} className="p-4 border border-white/5 rounded-2xl bg-white/[0.02] text-center hover:bg-white/5 transition-colors">
              <span className="block text-[10px] text-muted-foreground uppercase font-bold tracking-[0.1em] mb-1">
                {item.name}
              </span>
              <p className="font-semibold text-sm">{item.tech}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
