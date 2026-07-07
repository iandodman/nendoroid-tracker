
"use client";

import { useState } from "react";
import ExploreCatalogButton from "@/components/home/ExploreCatalogButton";
import SummaryCard from "@/components/home/SummaryCard";
import Header from "@/components/layout/Header";
import BottomNavigation from "@/components/navigation/BottomNavigation";
import SearchBar from "@/components/search/SearchBar";
import { nendoroids } from "@/data/nendoroids";
import SearchResults from "@/components/search/SearchResults";
import { useRouter } from "next/navigation";


export default function Home() {
  const [search, setSearch] = useState("");
  const router = useRouter();

  function handleSearchSubmit() {
    const query = search.trim();

    if (query.length === 0) {
      return;
    }

    router.push(`/catalog?search=${encodeURIComponent(query)}`);
  }
  const query = search.toLowerCase().trim();

  const quickResults =
    query.length === 0
      ? []
      : nendoroids
          .filter((nendoroid) => {
            return (
              nendoroid.name.toLowerCase().includes(query) ||
              nendoroid.series.toLowerCase().includes(query) ||
              nendoroid.number.toLowerCase().includes(query)
            );
          })
          .slice(0, 3);
  return (
    <main className="min-h-screen bg-zinc-950 px-4 pb-24 pt-6 text-zinc-50">
      <Header />

      <SearchBar
        value={search}
        onChange={setSearch}
        onSubmit={handleSearchSubmit}
        showSubmitButton
      />

      <SearchResults nendoroids={quickResults} />

      <ExploreCatalogButton />

      <section className="grid grid-cols-2 gap-3">
        <SummaryCard title="My collection" value={0} />
        <SummaryCard title="Wishlist" value={0} />
      </section>

      <BottomNavigation />
    </main>
  );
}