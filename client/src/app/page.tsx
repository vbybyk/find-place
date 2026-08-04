"use client";
import { SyntheticEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Autocomplete from "@/components/ui/autocomplete";
import { usePlaceAutocomplete } from "@/hooks/places";
import { IPlaceSuggestion } from "@/types/places";

export default function Home() {
  const router = useRouter();
  const { suggestions, loading, search } = usePlaceAutocomplete({
    includedPrimaryTypes: ["locality", "administrative_area_level_2"],
  });
  const [input, setInput] = useState("");
  const [selected, setSelected] = useState<IPlaceSuggestion | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    if (!input || selected?.label === input) return;
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(input), 250);
    return () => clearTimeout(debounceRef.current);
  }, [input, selected, search]);

  const onInputChange = (_e: SyntheticEvent, value: string) => {
    setInput(value);
    if (!value) setSelected(null);
  };

  const onSelect = (option: IPlaceSuggestion | null) => {
    setSelected(option);
    if (option) setInput(option.label);
  };

  const onClickSearch = () => {
    const city = selected?.label ?? input;
    if (city) router.push(`/listings?city=${encodeURIComponent(city)}`);
  };

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <h2 className="text-4xl sm:text-5xl text-center sm:text-left">Find your perfect place</h2>
        <ol className="list-inside list-decimal text-sm text-center sm:text-left font-[family-name:var(--font-geist-mono)]">
          <li className="mb-2">Start typing to see a list of listings.</li>
          <li>Adjust filters to find a perfect place</li>
        </ol>
        <div className="flex w-full ">
          <Autocomplete
            options={suggestions}
            inputValue={input}
            onInputChange={onInputChange}
            value={selected}
            onChange={onSelect}
            className="w-full grow shrink-0 basis-auto h-12 px-4 text-lg rounded-l-lg"
            loading={loading}
            readOnly={!!selected}
          />
          <button
            className="px-5 py-1 text-lg font-medium text-white bg-black/[.8] dark:bg-white/[.8] rounded-e-md"
            onClick={onClickSearch}
          >
            Search
          </button>
        </div>
      </main>
    </div>
  );
}
