"use client";

import { useState } from "react";

import { removeFromWishlist } from "@/app/actions/wishlist";
import NendoroidCard, {
  type CatalogNendoroid,
} from "@/components/catalog/NendoroidCard";
import SearchBar from "@/components/search/SearchBar";

type WishlistClientProps = {
  nendoroids: CatalogNendoroid[];
};

export default function WishlistClient({
  nendoroids,
}: WishlistClientProps) {
  const [search, setSearch] = useState("");

  const query = search.trim().toLowerCase();

  const filteredNendoroids = nendoroids.filter(
    (nendoroid) =>
      nendoroid.name.toLowerCase().includes(query) ||
      (nendoroid.series ?? "")
        .toLowerCase()
        .includes(query) ||
      nendoroid.number.toLowerCase().includes(query),
  );

  return (
    <>
      <div className="mb-6">
        <SearchBar
          value={search}
          onChange={setSearch}
          label="Search wishlist"
        />
      </div>

      {filteredNendoroids.length === 0 ? (
        <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 text-center">
          <h2 className="text-lg font-semibold">
            No Nendoroids found
          </h2>

          <p className="mt-2 text-sm text-zinc-400">
            Try searching by number, name, or series.
          </p>
        </section>
      ) : (
        <section className="grid grid-cols-2 items-stretch gap-3">
          {filteredNendoroids.map((nendoroid) => {
            const removeCurrentNendoroid =
              removeFromWishlist.bind(
                null,
                nendoroid.number,
              );

            return (
              <NendoroidCard
                key={nendoroid.id}
                nendoroid={nendoroid}
                footer={
                  <form action={removeCurrentNendoroid}>
                    <button
                      type="submit"
                      className="w-full rounded-lg border border-zinc-700 px-3 py-2 text-xs font-semibold text-zinc-300 transition-colors hover:border-red-500 hover:bg-red-500/15 hover:text-red-400 active:border-red-500 active:bg-red-500/25 active:text-red-300"
                    >
                      Remove
                    </button>
                  </form>
                }
              />
            );
          })}
        </section>
      )}
    </>
  );
}