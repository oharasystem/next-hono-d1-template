"use client";

import { useQuery } from "@tanstack/react-query";
import client from "@/lib/api";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function HomePageClient() {
  const [greetName, setGreetName] = useState("");

  const usersQuery = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const res = await client.users.$get();
      return res.json();
    },
  });

  const greetMutation = async () => {
    const res = await client.greet.$post({
      json: { name: greetName },
    });
    const data = await res.json();
    alert(data.message);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 gap-8">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm flex flex-col gap-4">
        <h1 className="text-4xl font-bold tracking-tight">
          Next.js + Hono + D1 Monorepo
        </h1>
        <p className="text-muted-foreground">
          Template for Cloudflare Pages and Workers
        </p>
      </div>

      <div className="flex flex-col gap-6 p-8 border rounded-xl bg-card shadow-sm w-full max-w-md">
        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-semibold">D1 Data Test (Users)</h2>
          {usersQuery.isLoading ? (
            <p>Loading...</p>
          ) : (
            <ul className="divide-y divide-border">
              {usersQuery.data?.map((user: any) => (
                <li key={user.id} className="py-2 flex justify-between">
                  <span>{user.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
          <Button 
            variant="outline" 
            onClick={() => usersQuery.refetch()}
            disabled={usersQuery.isFetching}
            className="mt-2"
          >
            Refresh Users
          </Button>
        </div>

        <hr className="border-border" />

        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-semibold">RPC Test (Mutation-like)</h2>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Your name"
              className="flex-1 px-3 py-1 rounded-md border bg-background"
              value={greetName}
              onChange={(e) => setGreetName(e.target.value)}
            />
            <Button onClick={greetMutation}>Greet</Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-5xl">
        {[
          { name: "Framework", tech: "Next.js (App Router)" },
          { name: "API / Backend", tech: "Hono (Workers)" },
          { name: "ORM", tech: "Drizzle ORM" },
          { name: "Validation", tech: "Zod" },
          { name: "UI Component", tech: "shadcn/ui" },
          { name: "State Management", tech: "TanStack Query" },
        ].map((item) => (
          <div key={item.name} className="p-4 border rounded-lg bg-card/50">
            <h3 className="font-bold text-sm text-muted-foreground uppercase tracking-wider">
              {item.name}
            </h3>
            <p className="font-semibold">{item.tech}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
