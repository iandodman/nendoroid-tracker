"use client";

import { useState } from "react";

import NendoroidCard from "@/components/catalog/NendoroidCard";
import SearchBar from "@/components/search/SearchBar";
import type { Nendoroid } from "@/types/nendoroid";

export type CatalogNendoroid = Nendoroid & {
  collectionQuantity: number;
};

type CatalogClientProps = {
  nendoroids: CatalogNendoroid[];
  initialSearch?: string;
};

export default function CatalogClient({
  nendoroids,
  initialSearch = "",
}: CatalogClientProps) {
  const [search, setSearch] = useState(initialSearch);

  const query = search.trim().toLowerCase();

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
        <p className="text-center text-zinc-400">
          No Nendoroids found.
        </p>
      ) : (
        <section className="grid grid-cols-2 items-stretch gap-3">
          {filteredNendoroids.map((nendoroid) => (
            <NendoroidCard
              key={nendoroid.id}
              nendoroid={nendoroid}
            />
          ))}
        </section>
      )}
    </>
  );
}