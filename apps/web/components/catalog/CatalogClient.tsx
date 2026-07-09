"use client";

import { useState } from "react";
import Link from "next/link";

import NendoroidCard from "@/components/catalog/NendoroidCard";
import SearchBar from "@/components/search/SearchBar";
import type { Nendoroid } from "@/types/nendoroid";

type CatalogClientProps = {
  nendoroids: Nendoroid[];
  initialSearch?: string;
};

export default function CatalogClient({
  nendoroids,
  initialSearch = "",
}: CatalogClientProps) {
  const [search, setSearch] = useState(initialSearch);

  const query = search.toLowerCase();

  const filteredNendoroids = nendoroids.filter((nendoroid) => {
    return (
      nendoroid.name.toLowerCase().includes(query) ||
      nendoroid.series.toLowerCase().includes(query) ||
      nendoroid.number.toLowerCase().includes(query)
    );
  });

  return (
    <>
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
    </>
  );
}