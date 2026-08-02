import Link from "next/link";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  pathname: string;
  search?: string;
  sort?: string;
  filter?: string;
  defaultSort?: string;
  defaultFilter?: string;
  ariaLabel: string;
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

function buildPageUrl({
  pathname,
  page,
  search,
  sort,
  filter,
  defaultSort,
  defaultFilter,
}: {
  pathname: string;
  page: number;
  search?: string;
  sort?: string;
  filter?: string;
  defaultSort?: string;
  defaultFilter?: string;
}): string {
  const params = new URLSearchParams();

  if (page > 1) {
    params.set("page", String(page));
  }

  if (search) {
    params.set("search", search);
  }

  if (sort && sort !== defaultSort) {
    params.set("sort", sort);
  }

  if (filter && filter !== defaultFilter) {
    params.set("filter", filter);
  }

  const query = params.toString();

  return query ? `${pathname}?${query}` : pathname;
}

export default function Pagination({
  currentPage,
  totalPages,
  pathname,
  search,
  sort,
  filter,
  defaultSort,
  defaultFilter,
  ariaLabel,
}: PaginationProps) {
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
      aria-label={ariaLabel}
      className="mt-8 flex flex-wrap items-center justify-center gap-2"
    >
      {currentPage > 1 && (
        <Link
          href={buildPageUrl({
            pathname,
            page: currentPage - 1,
            search,
            sort,
            filter,
            defaultSort,
            defaultFilter,
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
            href={buildPageUrl({
              pathname,
              page,
              search,
              sort,
              filter,
              defaultSort,
              defaultFilter,
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
          href={buildPageUrl({
            pathname,
            page: currentPage + 1,
            search,
            sort,
            filter,
            defaultSort,
            defaultFilter,
          })}
          className={`${buttonClasses} border-zinc-700 bg-zinc-900 text-zinc-100`}
        >
          Next
        </Link>
      )}
    </nav>
  );
}