"use client";
import { useState } from "react";
import cn from "classnames";
import AiSearchChat from "@/features/ai-search/AiSearchChat";
import QuickCitySearch from "@/features/search/QuickCitySearch";

type Mode = "ai" | "quick";

export default function Home() {
  const [mode, setMode] = useState<Mode>("ai");

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center py-8 pb-20 gap-16 sm:py-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex w-full flex-col gap-8 row-start-2 items-center sm:items-start">
        <h2 className="text-4xl sm:text-5xl text-center sm:text-left">Find your perfect place</h2>

        <div className="flex gap-1 rounded-lg bg-black/[.05] p-1 dark:bg-white/[.08]">
          <button
            className={cn(
              "rounded-md px-4 py-1.5 text-sm font-medium",
              mode === "ai" && "bg-white shadow dark:bg-black/[.6]"
            )}
            onClick={() => setMode("ai")}
          >
            Ask AI
          </button>
          <button
            className={cn(
              "rounded-md px-4 py-1.5 text-sm font-medium",
              mode === "quick" && "bg-white shadow dark:bg-black/[.6]"
            )}
            onClick={() => setMode("quick")}
          >
            Quick search
          </button>
        </div>

        {mode === "ai" ? <AiSearchChat /> : <QuickCitySearch />}
      </main>
    </div>
  );
}
