"use client";

import FilterSelect, {
  type FilterOption,
} from "@/components/filtering/FilterSelect";
import SearchBar from "@/components/search/SearchBar";
import SortSelect, {
  type SortOption,
} from "@/components/sorting/SortSelect";

export type WishlistFilter =
  | "all"
  | "not-owned"
  | "owned";

type WishlistToolbarProps<TSort extends string> = {
  search: string;
  onSearchChange: (value: string) => void;
  sort: TSort;
  sortOptions: SortOption<TSort>[];
  onSortChange: (value: TSort) => void;
  filter: WishlistFilter;
  onFilterChange: (value: WishlistFilter) => void;
};

const filterOptions: FilterOption<WishlistFilter>[] = [
  {
    value: "all",
    label: "All",
  },
  {
    value: "not-owned",
    label: "Not owned",
  },
  {
    value: "owned",
    label: "Already owned",
  },
];

export default function WishlistToolbar<
  TSort extends string,
>({
  search,
  onSearchChange,
  sort,
  sortOptions,
  onSortChange,
  filter,
  onFilterChange,
}: WishlistToolbarProps<TSort>) {
  return (
    <section className="mb-4">
      <div className="mb-2">
        <SearchBar
          value={search}
          onChange={onSearchChange}
          label="Search wishlist"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <SortSelect
          value={sort}
          options={sortOptions}
          onChange={onSortChange}
        />

        <FilterSelect
          id="wishlist-filter"
          value={filter}
          options={filterOptions}
          onChange={onFilterChange}
        />
      </div>
    </section>
  );
}