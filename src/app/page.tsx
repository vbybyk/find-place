"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { searchListingCity } from "@/lib/actions/listings";
import Autocomplete from "@/components/common/autocomplete";

interface ISearchValue {
  id: string;
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
  const [searchResults, setSearchResults] = useState([]);
  const [value, setValue] = useState<ISearchValue | null>(null);

  const router = useRouter();

  const onInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event?.target?.value === undefined) return;
    setSearch(event.target.value);
    if (!event.target.value) {
      setValue(null);
    }
  };

  const onSelectChange = (e, value: any) => {
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
            className="w-full h-12 px-4 text-lg rounded-s-md rounded-none"
          />
          <button
            className="px-5 py-1 text-lg font-medium text-white bg-black/[.8] dark:bg-white/[.8] rounded-e-md"
            onClick={onClickSearch}
          >
            Search
          </button>
        </div>

        {/* <div className="flex gap-4 items-center flex-col sm:flex-row">
          <a
            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              className="dark:invert"
              src="https://nextjs.org/icons/vercel.svg"
              alt="Vercel logomark"
              width={20}
              height={20}
            />
            Deploy now
          </a>
          <a
            className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:min-w-44"
            href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            Read our docs
          </a>
        </div> */}
      </main>
    </div>
  );
}
