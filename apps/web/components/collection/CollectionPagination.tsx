import Link from "next/link";

type CollectionPaginationProps = {
  currentPage: number;
  totalPages: number;
  search: string;
  sort: string;
  filter: string;
};

function getVisiblePages(
  currentPage: number,
  totalPages: number,
): Array<number | "ellipsis"> {
  if (totalPages <= 7) {
    return Array.from(
      { length: totalPages },
      (_, index) => index + 1,
    );
  }

  const pages: Array<number | "ellipsis"> = [1];

  if (currentPage > 4) {
    pages.push("ellipsis");
  }

  const start = Math.max(2, currentPage - 1);
  const end = Math.min(
    totalPages - 1,
    currentPage + 1,
  );

  for (let page = start; page <= end; page += 1) {
    pages.push(page);
  }

  if (currentPage < totalPages - 3) {
    pages.push("ellipsis");
  }

  pages.push(totalPages);

  return pages;
}

function buildCollectionUrl({
  page,
  search,
  sort,
  filter,
}: {
  page: number;
  search: string;
  sort: string;
  filter: string;
}): string {
  const params = new URLSearchParams();

  if (page > 1) {
    params.set("page", String(page));
  }

  if (search) {
    params.set("search", search);
  }

  if (sort !== "recently-added") {
    params.set("sort", sort);
  }

  if (filter !== "all") {
    params.set("filter", filter);
  }

  const query = params.toString();

  return query
    ? `/collection?${query}`
    : "/collection";
}

export default function CollectionPagination({
  currentPage,
  totalPages,
  search,
  sort,
  filter,
}: CollectionPaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const visiblePages = getVisiblePages(
    currentPage,
    totalPages,
  );

  const buttonClasses =
    "flex h-10 min-w-10 items-center justify-center rounded-xl border px-3 text-sm";

  return (
    <nav
      aria-label="Collection pages"
      className="mt-8 flex flex-wrap items-center justify-center gap-2"
    >
      {currentPage > 1 && (
        <Link
          href={buildCollectionUrl({
            page: currentPage - 1,
            search,
            sort,
            filter,
          })}
          className={`${buttonClasses} border-zinc-700 bg-zinc-900 text-zinc-100`}
        >
          Previous
        </Link>
      )}

      {visiblePages.map((page, index) => {
        if (page === "ellipsis") {
          return (
            <span
              key={`ellipsis-${index}`}
              className="px-1 text-zinc-500"
            >
              …
            </span>
          );
        }

        const isCurrent = page === currentPage;

        return (
          <Link
            key={page}
            href={buildCollectionUrl({
              page,
              search,
              sort,
              filter,
            })}
            aria-current={
              isCurrent ? "page" : undefined
            }
            className={`${buttonClasses} ${
              isCurrent
                ? "border-zinc-100 bg-zinc-100 font-semibold text-zinc-950"
                : "border-zinc-700 bg-zinc-900 text-zinc-100"
            }`}
          >
            {page}
          </Link>
        );
      })}

      {currentPage < totalPages && (
        <Link
          href={buildCollectionUrl({
            page: currentPage + 1,
            search,
            sort,
            filter,
          })}
          className={`${buttonClasses} border-zinc-700 bg-zinc-900 text-zinc-100`}
        >
          Next
        </Link>
      )}
    </nav>
  );
}