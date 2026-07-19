"use client";

import FilterSelect, {
  type FilterOption,
} from "@/components/filtering/FilterSelect";
import SearchBar from "@/components/search/SearchBar";
import SortSelect, {
  type SortOption,
} from "@/components/sorting/SortSelect";

export type CollectionFilter =
  | "all"
  | "single-copy"
  | "duplicates";

type CollectionToolbarProps<TSort extends string> = {
  search: string;
  onSearchChange: (value: string) => void;
  sort: TSort;
  sortOptions: SortOption<TSort>[];
  onSortChange: (value: TSort) => void;
  filter: CollectionFilter;
  onFilterChange: (value: CollectionFilter) => void;
};

const filterOptions: FilterOption<CollectionFilter>[] = [
  {
    value: "all",
    label: "All",
  },
  {
    value: "single-copy",
    label: "Single copy",
  },
  {
    value: "duplicates",
    label: "Duplicates",
  },
];

export default function CollectionToolbar<TSort extends string>({
  search,
  onSearchChange,
  sort,
  sortOptions,
  onSortChange,
  filter,
  onFilterChange,
}: CollectionToolbarProps<TSort>) {
  return (
    <section className="mb-4">
      <div className="mb-2">
        <SearchBar
          value={search}
          onChange={onSearchChange}
          label="Search collection"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <SortSelect
          value={sort}
          options={sortOptions}
          onChange={onSortChange}
        />

        <FilterSelect
          id="collection-filter"
          value={filter}
          options={filterOptions}
          onChange={onFilterChange}
        />
      </div>
    </section>
  );
}