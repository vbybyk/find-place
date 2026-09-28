"use client";

import { FormEvent, KeyboardEvent, useState, useTransition } from "react";
import { Textarea } from "@/components/ui/textarea";
import Spinner from "@/components/ui/spinner";
import { searchWithAI } from "@/lib/actions/ai-search";
import AiChatMessage, { IChatTurn } from "@/features/ai-search/AiChatMessage";

const AiSearchChat = () => {
  const [turns, setTurns] = useState<IChatTurn[]>([]);
  const [input, setInput] = useState("");
  const [isPending, startTransition] = useTransition();

  const submitMessage = () => {
    const message = input.trim();
    if (!message || isPending) return;

    setTurns((prev) => [...prev, { role: "user", text: message }]);
    setInput("");

    startTransition(async () => {
      const result = await searchWithAI(message);
      setTurns((prev) => [
        ...prev,
        {
          role: "assistant",
          text: result?.reply ?? "Sorry, something went wrong — please try again.",
          listings: result?.listings,
        },
      ]);
    });
  };

  const onFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    submitMessage();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submitMessage();
    }
  };

  return (
    <div className="flex w-full flex-col gap-6">
      {turns.length > 0 && (
        <div className="flex flex-col gap-6">
          {turns.map((turn, i) => (
            <AiChatMessage key={i} turn={turn} />
          ))}
          {isPending && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Spinner className="h-4 w-4" />
              Thinking...
            </div>
          )}
        </div>
      )}
      <form onSubmit={onFormSubmit} className="flex w-full gap-2">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="e.g. 2 bedroom apartment for rent near BGC under 30000, with a pool"
          className="min-h-12 flex-1 resize-none"
          disabled={isPending}
        />
        <button
          type="submit"
          className="px-5 py-1 text-lg font-medium text-white bg-black/[.8] dark:bg-white/[.8] rounded-md disabled:opacity-50"
          disabled={isPending || !input.trim()}
        >
          Ask
        </button>
      </form>
    </div>
  );
};

export default AiSearchChat;
