"use client";

import { useState } from "react";
import Link from "next/link";

import NendoroidCard from "@/components/catalog/NendoroidCard";
import SearchBar from "@/components/search/SearchBar";
import { nendoroids } from "@/data/nendoroids";

export default function CatalogPage() {
  const [search, setSearch] = useState("");

  const query = search.toLowerCase();

  const filteredNendoroids = nendoroids.filter((nendoroid) => {
    return (
      nendoroid.name.toLowerCase().includes(query) ||
      nendoroid.series.toLowerCase().includes(query) ||
      nendoroid.number.toLowerCase().includes(query)
    );
  });

  return (
    <main className="min-h-screen bg-zinc-950 px-4 pb-24 pt-6 text-zinc-50">
      <header className="mb-6">
        <Link href="/" className="text-sm text-zinc-400">
          ← Home
        </Link>

        <p className="mt-4 text-sm text-zinc-400">Catalog</p>

        <h1 className="mt-1 text-2xl font-bold tracking-tight">
          Explore Nendoroids
        </h1>
      </header>

      <SearchBar value={search} onChange={setSearch} />

      {filteredNendoroids.length === 0 ? (
        <p className="text-center text-zinc-400">No Nendoroids found.</p>
      ) : (
        <section className="grid grid-cols-2 gap-3">
          {filteredNendoroids.map((nendoroid) => (
            <NendoroidCard key={nendoroid.id} nendoroid={nendoroid} />
          ))}
        </section>
      )}
    </main>
  );
}