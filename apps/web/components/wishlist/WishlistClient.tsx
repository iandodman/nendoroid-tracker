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

import { removeFromWishlist } from "@/app/actions/wishlist";
import ActionForm from "@/components/actions/ActionForm";
import NendoroidCard, {
  type CatalogNendoroid,
} from "@/components/catalog/NendoroidCard";
import Pagination from "@/components/pagination/Pagination";
import type { SortOption } from "@/components/sorting/SortSelect";
import WishlistToolbar, {
  type WishlistFilter,
} from "@/components/wishlist/WishlistToolbar";

export type WishlistSort =
  | "recently-added"
  | "number-asc"
  | "number-desc"
  | "name-asc"
  | "name-desc";

type WishlistClientProps = {
  nendoroids: CatalogNendoroid[];
  initialSearch: string;
  initialSort: WishlistSort;
  initialFilter: WishlistFilter;
  currentPage: number;
  totalPages: number;
  totalResults: number;
};

const wishlistSortOptions: SortOption<WishlistSort>[] = [
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
];

export default function WishlistClient({
  nendoroids,
  initialSearch,
  initialSort,
  initialFilter,
  currentPage,
  totalPages,
  totalResults,
}: WishlistClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(initialSearch);
  const [sort, setSort] =
    useState<WishlistSort>(initialSort);
  const [filter, setFilter] =
    useState<WishlistFilter>(initialFilter);
  const [isPending, startTransition] =
    useTransition();

  const replaceUrl = useCallback(
    (params: URLSearchParams): void => {
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
    replaceUrl,
    search,
    searchParams,
  ]);

  function handleSortChange(
    value: WishlistSort,
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
    value: WishlistFilter,
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
      <WishlistToolbar
        search={search}
        onSearchChange={setSearch}
        sort={sort}
        sortOptions={wishlistSortOptions}
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
          <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 text-center">
            <h2 className="text-lg font-semibold">
              No matching Nendoroids found
            </h2>

            <p className="mt-2 text-sm text-zinc-400">
              {hasActiveSearch && hasActiveFilter
                ? "Try changing your search or wishlist filter."
                : hasActiveFilter
                  ? "No wishlist items match this filter."
                  : "Try searching by number, name, or series."}
            </p>
          </section>
        ) : (
          <section className="grid grid-cols-2 items-stretch gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {nendoroids.map((nendoroid) => {
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
                    <ActionForm
                      action={removeCurrentNendoroid}
                    >
                      <button
                        type="submit"
                        className="w-full rounded-lg border border-zinc-700 px-3 py-2 text-xs font-semibold text-zinc-300 transition-colors hover:border-red-500 hover:bg-red-500/15 hover:text-red-400 active:border-red-500 active:bg-red-500/25 active:text-red-300 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Remove
                      </button>
                    </ActionForm>
                  }
                />
              );
            })}
          </section>
        )}

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          pathname="/wishlist"
          search={initialSearch}
          sort={initialSort}
          filter={initialFilter}
          defaultSort="recently-added"
          defaultFilter="all"
          ariaLabel="Wishlist pages"
        />
      </div>
    </>
  );
}