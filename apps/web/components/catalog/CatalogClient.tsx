"use client";

import {
  useEffect,
  useState,
  useTransition,
} from "react";
import {
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";

import CatalogPagination from "@/components/catalog/CatalogPagination";
import NendoroidCard, {
  type CatalogNendoroid,
} from "@/components/catalog/NendoroidCard";
import SearchBar from "@/components/search/SearchBar";
import SortSelect, {
  type SortOption,
} from "@/components/sorting/SortSelect";

export type CatalogSort =
  | "number-asc"
  | "number-desc"
  | "name-asc"
  | "name-desc";

type CatalogClientProps = {
  nendoroids: CatalogNendoroid[];
  initialSearch: string;
  initialSort: CatalogSort;
  currentPage: number;
  totalPages: number;
  totalResults: number;
};

const sortOptions: SortOption<CatalogSort>[] = [
  {
    value: "number-desc",
    label: "Number descending",
  },
  {
    value: "number-asc",
    label: "Number ascending",
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
  initialSearch,
  initialSort,
  currentPage,
  totalPages,
  totalResults,
}: CatalogClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [search, setSearch] =
    useState(initialSearch);
  const [sort, setSort] =
    useState<CatalogSort>(initialSort);
  const [isPending, startTransition] =
    useTransition();

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

      startTransition(() => {
        const query = params.toString();

        router.replace(
          query ? `${pathname}?${query}` : pathname,
          {
            scroll: false,
          },
        );
      });
    }, 350);

    return () => clearTimeout(timeout);
  }, [
    initialSearch,
    pathname,
    router,
    search,
    searchParams,
  ]);

  function handleSortChange(value: CatalogSort) {
    setSort(value);

    const params = new URLSearchParams(
      searchParams.toString(),
    );

    params.delete("page");

    if (value === "number-desc") {
      params.delete("sort");
    } else {
      params.set("sort", value);
    }

    startTransition(() => {
      const query = params.toString();

      router.replace(
        query ? `${pathname}?${query}` : pathname,
        {
          scroll: false,
        },
      );
    });
  }

  return (
    <>
      <div className="mb-4">
        <SearchBar
          value={search}
          onChange={setSearch}
          label="Search catalog"
        />
      </div>

      <div className="mb-3">
        <SortSelect
          value={sort}
          options={sortOptions}
          onChange={handleSortChange}
        />
      </div>

      <p className="mb-6 text-sm text-zinc-500">
        {totalResults}{" "}
        {totalResults === 1
          ? "Nendoroid"
          : "Nendoroids"}
      </p>

      <div
        className={
          isPending
            ? "opacity-60 transition-opacity"
            : "transition-opacity"
        }
      >
        {nendoroids.length === 0 ? (
          <p className="text-center text-zinc-400">
            No Nendoroids found.
          </p>
        ) : (
          <section className="grid grid-cols-2 items-stretch gap-3">
            {nendoroids.map((nendoroid) => (
              <NendoroidCard
                key={nendoroid.id}
                nendoroid={nendoroid}
              />
            ))}
          </section>
        )}

        <CatalogPagination
          currentPage={currentPage}
          totalPages={totalPages}
          search={initialSearch}
          sort={initialSort}
        />
      </div>
    </>
  );
}