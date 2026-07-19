"use client";

import { useState } from "react";

import CollectionCard from "@/components/collection/CollectionCard";
import SearchBar from "@/components/search/SearchBar";
import SortSelect, {
  type SortOption,
} from "@/components/sorting/SortSelect";
import type { getUserCollection } from "@/lib/collection";

type CollectionItem = Awaited<
  ReturnType<typeof getUserCollection>
>[number];

type CollectionClientProps = {
  collection: CollectionItem[];
};

type CollectionSort =
  | "recently-added"
  | "number-asc"
  | "number-desc"
  | "name-asc"
  | "name-desc"
  | "quantity-desc";

const collectionSortOptions: SortOption<CollectionSort>[] = [
  {
    value: "recently-added",
    label: "Recently added",
  },
  {
    value: "number-asc",
    label: "Number: lowest first",
  },
  {
    value: "number-desc",
    label: "Number: highest first",
  },
  {
    value: "name-asc",
    label: "Name: A–Z",
  },
  {
    value: "name-desc",
    label: "Name: Z–A",
  },
  {
    value: "quantity-desc",
    label: "Quantity: highest first",
  },
];

export default function CollectionClient({
  collection,
}: CollectionClientProps) {
  const [search, setSearch] = useState("");
  const [sort, setSort] =
    useState<CollectionSort>("recently-added");

  const query = search.trim().toLowerCase();

  const filteredCollection = collection.filter((item) => {
    const { nendoroid } = item;

    return (
      nendoroid.name.toLowerCase().includes(query) ||
      nendoroid.series.toLowerCase().includes(query) ||
      nendoroid.number.toLowerCase().includes(query)
    );
  });

  const sortedCollection = [...filteredCollection].sort(
    (firstItem, secondItem) => {
      const firstNendoroid = firstItem.nendoroid;
      const secondNendoroid = secondItem.nendoroid;

      switch (sort) {
        case "number-asc":
          return (
            Number(firstNendoroid.number) -
            Number(secondNendoroid.number)
          );

        case "number-desc":
          return (
            Number(secondNendoroid.number) -
            Number(firstNendoroid.number)
          );

        case "name-asc":
          return firstNendoroid.name.localeCompare(
            secondNendoroid.name,
          );

        case "name-desc":
          return secondNendoroid.name.localeCompare(
            firstNendoroid.name,
          );

        case "quantity-desc":
          return secondItem.quantity - firstItem.quantity;

        case "recently-added":
        default:
          return (
            new Date(secondItem.addedAt).getTime() -
            new Date(firstItem.addedAt).getTime()
          );
      }
    },
  );

  return (
    <>
      <div className="mb-6 grid gap-3 sm:grid-cols-[minmax(0,1fr)_220px]">
        <SearchBar
          value={search}
          onChange={setSearch}
          label="Search collection"
        />

        <SortSelect
          value={sort}
          options={collectionSortOptions}
          onChange={setSort}
        />
      </div>

      {sortedCollection.length === 0 ? (
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
          {sortedCollection.map((item) => (
            <CollectionCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </>
  );
}