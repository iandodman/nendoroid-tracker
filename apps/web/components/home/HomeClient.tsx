"use client";

import Link from "next/link";
import {
  useEffect,
  useState,
  useTransition,
} from "react";
import { useRouter } from "next/navigation";

import {
  searchNendoroids,
  type QuickSearchResult,
} from "@/app/actions/search";
import ExploreCatalogButton from "@/components/home/ExploreCatalogButton";
import SummaryCard from "@/components/home/SummaryCard";
import SearchBar from "@/components/search/SearchBar";
import SearchResults from "@/components/search/SearchResults";

type HomeClientProps = {
  collectionCount: number;
  wishlistCount: number;
};

export default function HomeClient({
  collectionCount,
  wishlistCount,
}: HomeClientProps) {
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [quickResults, setQuickResults] = useState<
    QuickSearchResult[]
  >([]);
  const [hasSearched, setHasSearched] =
    useState(false);
  const [isPending, startTransition] =
    useTransition();

  function handleSearchSubmit() {
    const query = search.trim();

    if (query.length === 0) {
      return;
    }

    router.push(
      `/catalog?search=${encodeURIComponent(query)}`,
    );
  }

  useEffect(() => {
    const query = search.trim();

    if (query.length < 2) {
      const timeout = setTimeout(() => {
        setQuickResults([]);
        setHasSearched(false);
      }, 0);

      return () => clearTimeout(timeout);
    }

    let isCurrent = true;

    const timeout = setTimeout(() => {
      startTransition(async () => {
        const results = await searchNendoroids(query);

        if (!isCurrent) {
          return;
        }

        setQuickResults(results);
        setHasSearched(true);
      });
    }, 300);

    return () => {
      isCurrent = false;
      clearTimeout(timeout);
    };
  }, [search]);

  const normalizedSearch = search.trim();
  const showNoResults =
    hasSearched &&
    normalizedSearch.length >= 2 &&
    quickResults.length === 0 &&
    !isPending;

  return (
    <>
      <div className="mb-3">
        <SearchBar
          value={search}
          onChange={setSearch}
          onSubmit={handleSearchSubmit}
          showSubmitButton
        />
      </div>

      <div
        aria-live="polite"
        className="min-h-6"
      >
        {isPending &&
          normalizedSearch.length >= 2 && (
            <p className="mb-3 text-sm text-zinc-500">
              Searching…
            </p>
          )}

        {showNoResults && (
          <p className="mb-3 text-sm text-zinc-500">
            No Nendoroids found.
          </p>
        )}
      </div>

      <SearchResults nendoroids={quickResults} />

      {normalizedSearch.length >= 2 && (
        <Link
          href={`/catalog?search=${encodeURIComponent(
            normalizedSearch,
          )}`}
          className="mb-6 block text-center text-sm text-zinc-400 underline-offset-4 hover:text-zinc-200 hover:underline"
        >
          View all results
        </Link>
      )}

      <ExploreCatalogButton />

      <section className="grid grid-cols-2 gap-3">
        <Link
          href="/collection"
          aria-label="Open my collection"
          className="block rounded-2xl focus:outline-none focus:ring-2 focus:ring-zinc-400"
        >
          <SummaryCard
            title="My collection"
            value={collectionCount}
          />
        </Link>

        <Link
          href="/wishlist"
          aria-label="Open my wishlist"
          className="block rounded-2xl focus:outline-none focus:ring-2 focus:ring-zinc-400"
        >
          <SummaryCard
            title="Wishlist"
            value={wishlistCount}
          />
        </Link>
      </section>
    </>
  );
}