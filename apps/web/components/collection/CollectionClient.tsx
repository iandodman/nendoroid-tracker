"use client";

import {
  useCallback,
  useEffect,
  useState,
  useTransition,
} from "react";
import {
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";

import type { CatalogNendoroid } from "@/components/catalog/NendoroidCard";
import NendoroidCard from "@/components/catalog/NendoroidCard";
import CollectionPagination from "@/components/collection/CollectionPagination";
import CollectionToolbar, {
  type CollectionFilter,
} from "@/components/collection/CollectionToolbar";
import type { SortOption } from "@/components/sorting/SortSelect";

export type CollectionSort =
  | "recently-added"
  | "number-asc"
  | "number-desc"
  | "name-asc"
  | "name-desc"
  | "quantity-desc";

type CollectionClientProps = {
  nendoroids: CatalogNendoroid[];
  initialSearch: string;
  initialSort: CollectionSort;
  initialFilter: CollectionFilter;
  currentPage: number;
  totalPages: number;
  totalResults: number;
};

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
  nendoroids,
  initialSearch,
  initialSort,
  initialFilter,
  currentPage,
  totalPages,
  totalResults,
}: CollectionClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [search, setSearch] =
    useState(initialSearch);
  const [sort, setSort] =
    useState<CollectionSort>(initialSort);
  const [filter, setFilter] =
    useState<CollectionFilter>(initialFilter);
  const [isPending, startTransition] =
    useTransition();

  const replaceUrl = useCallback(
    (params: URLSearchParams) => {
      startTransition(() => {
        const query = params.toString();

        router.replace(
          query ? `${pathname}?${query}` : pathname,
          {
            scroll: false,
          },
        );
      });
    },
    [pathname, router],
  );

  useEffect(() => {
    const timeout = setTimeout(() => {
      const normalizedSearch = search.trim();

      if (normalizedSearch === initialSearch) {
        return;
      }

      const params = new URLSearchParams(
        searchParams.toString(),
      );

      params.delete("page");

      if (normalizedSearch) {
        params.set("search", normalizedSearch);
      } else {
        params.delete("search");
      }

      replaceUrl(params);
    }, 350);

    return () => clearTimeout(timeout);
  }, [
    initialSearch,
    pathname,
    replaceUrl,
    search,
    searchParams,
  ]);

  function handleSortChange(
    value: CollectionSort,
  ): void {
    setSort(value);

    const params = new URLSearchParams(
      searchParams.toString(),
    );

    params.delete("page");

    if (value === "recently-added") {
      params.delete("sort");
    } else {
      params.set("sort", value);
    }

    replaceUrl(params);
  }

  function handleFilterChange(
    value: CollectionFilter,
  ): void {
    setFilter(value);

    const params = new URLSearchParams(
      searchParams.toString(),
    );

    params.delete("page");

    if (value === "all") {
      params.delete("filter");
    } else {
      params.set("filter", value);
    }

    replaceUrl(params);
  }

  const hasActiveSearch =
    initialSearch.length > 0;
  const hasActiveFilter =
    initialFilter !== "all";

  return (
    <>
      <CollectionToolbar
        search={search}
        onSearchChange={setSearch}
        sort={sort}
        sortOptions={collectionSortOptions}
        onSortChange={handleSortChange}
        filter={filter}
        onFilterChange={handleFilterChange}
      />

      <p className="mb-4 text-sm text-zinc-500">
        {totalResults}{" "}
        {totalResults === 1
          ? "matching Nendoroid"
          : "matching Nendoroids"}
      </p>

      <div
        className={
          isPending
            ? "opacity-60 transition-opacity"
            : "transition-opacity"
        }
      >
        {nendoroids.length === 0 ? (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 text-center">
            <h2 className="font-semibold">
              No matching Nendoroids found
            </h2>

            <p className="mt-2 text-sm text-zinc-400">
              {hasActiveSearch && hasActiveFilter
                ? "Try changing your search or collection filter."
                : hasActiveFilter
                  ? "No collection items match this filter."
                  : "Try searching by name, number, or series."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {nendoroids.map((nendoroid) => (
              <NendoroidCard
                key={nendoroid.id}
                nendoroid={nendoroid}
              />
            ))}
          </div>
        )}

        <CollectionPagination
          currentPage={currentPage}
          totalPages={totalPages}
          search={initialSearch}
          sort={initialSort}
          filter={initialFilter}
        />
      </div>
    </>
  );
}