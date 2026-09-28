"use client";
import { SyntheticEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Autocomplete from "@/components/ui/autocomplete";
import { usePlaceAutocomplete } from "@/hooks/places";
import { IPlaceSuggestion } from "@/types/places";

const CITY_PRIMARY_TYPES = ["locality", "administrative_area_level_2"];

const QuickCitySearch = () => {
  const router = useRouter();
  const { suggestions, loading, search } = usePlaceAutocomplete({
    includedPrimaryTypes: CITY_PRIMARY_TYPES,
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
  );
};

export default QuickCitySearch;
