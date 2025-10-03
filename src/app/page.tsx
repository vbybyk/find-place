"use client";
import { useState, useEffect, SyntheticEvent } from "react";
import { useRouter } from "next/navigation";
import { searchListingCity } from "@/lib/actions/listings";
import Autocomplete from "@/components/common/autocomplete";

interface ISearchValue {
  id: number;
  label: string;
  adminName1: string;
}

const debouncedSearch = (search: string, delay: number) => {
  let timeoutId: NodeJS.Timeout;
  return new Promise((resolve) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      resolve(search);
    }, delay);
  });
};

export default function Home() {
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<ISearchValue[]>([]);
  const [value, setValue] = useState<ISearchValue | null>(null);

  const router = useRouter();

  const onInputChange = (e: SyntheticEvent<Element, Event>, value: string) => {
    if (value === undefined) return;
    setSearch(value);
    if (!value) {
      setValue(null);
    }
  };

  const onSelectChange = (value: ISearchValue) => {
    if (value) {
      setValue(value);
      setSearch(value?.label);
    }
  };

  const onClickSearch = () => {
    router.push(`/listings?city=${value?.label}&adminName1=${value?.adminName1}`);
  };

  const getSearchResults = async (search: string) => {
    const delay = 500;
    const debouncedValue = await debouncedSearch(search, delay);
    const result = await searchListingCity(debouncedValue as string, "PH", "20");
    setSearchResults(result);
  };

  useEffect(() => {
    if (search) {
      getSearchResults(search);
    }
  }, [search]);

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
            options={searchResults}
            inputValue={search}
            onInputChange={onInputChange}
            value={value}
            onChange={onSelectChange}
            className="w-full grow shrink-0 basis-auto h-12 px-4 text-lg rounded-l-lg"
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
