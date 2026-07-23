"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import type { Nendoroid } from "@/app/generated/prisma/client";
import ExploreCatalogButton from "@/components/home/ExploreCatalogButton";
import SummaryCard from "@/components/home/SummaryCard";
import SearchBar from "@/components/search/SearchBar";
import SearchResults from "@/components/search/SearchResults";

type HomeClientProps = {
  collectionCount: number;
  wishlistCount: number;
  nendoroids: Nendoroid[];
};

export default function HomeClient({
  collectionCount,
  wishlistCount,
  nendoroids,
}: HomeClientProps) {
  const [search, setSearch] = useState("");
  const router = useRouter();

  function handleSearchSubmit() {
    const query = search.trim();

    if (query.length === 0) {
      return;
    }

    router.push(
      `/catalog?search=${encodeURIComponent(query)}`,
    );
  }

  const query = search.toLowerCase().trim();

  const quickResults =
    query.length === 0
      ? []
      : nendoroids
          .filter((nendoroid) => {
            return (
              nendoroid.name
                .toLowerCase()
                .includes(query) ||
              (nendoroid.series ?? "")
                .toLowerCase()
                .includes(query) ||
              nendoroid.number
                .toLowerCase()
                .includes(query)
            );
          })
          .slice(0, 3);

  return (
    <>
      <div className="mb-6">
        <SearchBar
          value={search}
          onChange={setSearch}
          onSubmit={handleSearchSubmit}
          showSubmitButton
        />
      </div>

      <SearchResults nendoroids={quickResults} />

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