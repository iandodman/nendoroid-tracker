import Link from "next/link";

export default function ExploreCatalogButton() {
  return (
    <section className="mb-6">
      <Link
        href="/catalog"
        className="block w-full rounded-2xl bg-zinc-100 px-4 py-4 text-center font-semibold text-zinc-950"
      >
        Explore catalog
      </Link>
    </section>
  );
}