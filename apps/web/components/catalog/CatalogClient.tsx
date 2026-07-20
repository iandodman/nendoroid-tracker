"use client";

import { useState } from "react";

import type { Nendoroid } from "@/app/generated/prisma/client";
import NendoroidCard from "@/components/catalog/NendoroidCard";
import SearchBar from "@/components/search/SearchBar";
import SortSelect, {
  type SortOption,
} from "@/components/sorting/SortSelect";

export type CatalogNendoroid = Nendoroid & {
  collectionQuantity: number;
};

type CatalogClientProps = {
  nendoroids: CatalogNendoroid[];
  initialSearch?: string;
};

type CatalogSort =
  | "number-asc"
  | "number-desc"
  | "name-asc"
  | "name-desc";

const sortOptions: SortOption<CatalogSort>[] = [
  {
    value: "number-asc",
    label: "Number ascending",
  },
  {
    value: "number-desc",
    label: "Number descending",
  },
  {
    value: "name-asc",
    label: "Name A-Z",
  },
  {
    value: "name-desc",
    label: "Name Z-A",
  },
];

export default function CatalogClient({
  nendoroids,
  initialSearch = "",
}: CatalogClientProps) {
  const [search, setSearch] = useState(initialSearch);
  const [sort, setSort] = useState<CatalogSort>("number-asc");

  const query = search.trim().toLowerCase();

  const filteredNendoroids = nendoroids.filter((nendoroid) => {
    return (
      nendoroid.name.toLowerCase().includes(query) ||
      (nendoroid.series ?? "")
        .toLowerCase()
        .includes(query) ||
      nendoroid.number.toLowerCase().includes(query)
    );
  });
  const sortedNendoroids = [...filteredNendoroids].sort(
    (firstNendoroid, secondNendoroid) => {
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

        default:
          return 0;
      }
    },
  );

  return (
    <>
      <div className="mb-4">
        <SearchBar
          value={search}
          onChange={setSearch}
          label="Search catalog"
        />
      </div>

      <div className="mb-6">
        <SortSelect
          value={sort}
          options={sortOptions}
          onChange={setSort}
        />
      </div>

      {sortedNendoroids.length === 0 ? (
        <p className="text-center text-zinc-400">
          No Nendoroids found.
        </p>
      ) : (
        <section className="grid grid-cols-2 items-stretch gap-3">
          {sortedNendoroids.map((nendoroid) => (
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