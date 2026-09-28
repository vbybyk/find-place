"use server";

import { IAiSearchResult } from "@/types/ai-search";

// FastAPI backend (business logic + data).
const API_URL = process.env.API_URL;

export const searchWithAI = async (message: string): Promise<IAiSearchResult | null> => {
  try {
    const res = await fetch(`${API_URL}/ai-search`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`AI search failed: ${res.status}`);
    return await res.json();
  } catch (error) {
    console.error("Error while running AI search", error);
    return null;
  }
};
