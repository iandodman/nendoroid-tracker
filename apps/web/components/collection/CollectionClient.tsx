"use client";

import { useState } from "react";

import CollectionCard from "@/components/collection/CollectionCard";
import SearchBar from "@/components/search/SearchBar";
import type { getUserCollection } from "@/lib/collection";

type CollectionItem = Awaited<
  ReturnType<typeof getUserCollection>
>[number];

type CollectionClientProps = {
  collection: CollectionItem[];
};

export default function CollectionClient({
  collection,
}: CollectionClientProps) {
  const [search, setSearch] = useState("");

  const query = search.trim().toLowerCase();

  const filteredCollection = collection.filter((item) => {
    const { nendoroid } = item;

    return (
      nendoroid.name.toLowerCase().includes(query) ||
      nendoroid.series.toLowerCase().includes(query) ||
      nendoroid.number.toLowerCase().includes(query)
    );
  });

  return (
    <>
      <SearchBar value={search} onChange={setSearch} />

      {filteredCollection.length === 0 ? (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 text-center">
          <h2 className="font-semibold">
            No matching Nendoroids found
          </h2>

          <p className="mt-2 text-sm text-zinc-400">
            Try searching by name, number, or series.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {filteredCollection.map((item) => (
            <CollectionCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </>
  );
}