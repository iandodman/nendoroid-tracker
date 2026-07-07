export default function SearchBar() {
  return (
    <section className="mb-6">
      <label className="mb-2 block text-sm text-zinc-400">
        Search catalog
      </label>

      <input
        className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-4 text-base outline-none placeholder:text-zinc-500 focus:border-zinc-600"
        placeholder="Search by name, number or series"
      />
    </section>
  );
}