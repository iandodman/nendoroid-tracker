"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type AuthMenuProps = {
  name: string;
  image: string | null;
  signOutAction: () => Promise<void>;
};

export default function AuthMenu({
  name,
  image,
  signOutAction,
}: AuthMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(
          event.target as Node,
        )
      ) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener(
      "pointerdown",
      handlePointerDown,
    );
    document.addEventListener(
      "keydown",
      handleKeyDown,
    );

    return () => {
      document.removeEventListener(
        "pointerdown",
        handlePointerDown,
      );
      document.removeEventListener(
        "keydown",
        handleKeyDown,
      );
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative"
    >
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label="Open account menu"
        className="rounded-full outline-none ring-offset-zinc-950 transition hover:opacity-90 focus-visible:ring-2 focus-visible:ring-[#fb588c] focus-visible:ring-offset-2"
      >
        {image ? (
          <Image
            src={image}
            alt={name}
            width={40}
            height={40}
            className="h-10 w-10 rounded-full border border-zinc-700 object-cover"
          />
        ) : (
          <span className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-700 bg-zinc-900 font-semibold text-zinc-100">
            {name.charAt(0).toUpperCase()}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          role="menu"
          className="absolute right-0 top-12 z-50 w-52 rounded-2xl border border-zinc-800 bg-zinc-900 p-2 shadow-xl shadow-black/30"
        >
          <div className="px-3 py-2">
            <p className="truncate text-sm font-semibold text-zinc-50">
              {name}
            </p>
          </div>

          <div className="my-1 border-t border-zinc-800" />

          <form action={signOutAction}>
            <button
              type="submit"
              role="menuitem"
              className="w-full rounded-xl px-3 py-2 text-left text-sm text-zinc-300 transition hover:bg-zinc-800 hover:text-zinc-50"
            >
              Sign out
            </button>
          </form>
        </div>
      )}
    </div>
  );
}