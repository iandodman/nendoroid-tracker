"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navigationItems = [
  {
    label: "Home",
    href: "/",
    isActive: (pathname: string) => pathname === "/",
  },
  {
    label: "Catalog",
    href: "/catalog",
    isActive: (pathname: string) =>
      pathname.startsWith("/catalog"),
  },
  {
    label: "Collection",
    href: "/collection",
    isActive: (pathname: string) =>
      pathname.startsWith("/collection"),
  },
  {
    label: "Wishlist",
    href: "/wishlist",
    isActive: (pathname: string) =>
      pathname.startsWith("/wishlist"),
  },
];

export default function BottomNavigation() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Main navigation"
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-800 bg-zinc-950"
    >
      <div className="mx-auto grid max-w-md grid-cols-5 px-4 py-3 text-center text-sm">
        {navigationItems.map((item) => {
          const active = item.isActive(pathname);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={
                active
                  ? "text-zinc-50"
                  : "text-zinc-400 transition hover:text-zinc-200"
              }
            >
              {item.label}
            </Link>
          );
        })}

        <button
          type="button"
          disabled
          className="cursor-not-allowed text-zinc-700"
        >
          Profile
        </button>
      </div>
    </nav>
  );
}