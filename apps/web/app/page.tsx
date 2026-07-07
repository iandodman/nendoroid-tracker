export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-950 px-4 pb-24 pt-6 text-zinc-50">
      <header className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Nendodex</h1>
        <button className="rounded-full bg-zinc-800 px-4 py-2 text-sm">
          Profile
        </button>
      </header>

      <section className="mb-6">
        <label className="mb-2 block text-sm text-zinc-400">
          Search catalog
        </label>
        <input
          className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-4 text-base outline-none placeholder:text-zinc-500"
          placeholder="Search by name, number or series"
        />
      </section>

      <section className="mb-6">
        <button className="w-full rounded-2xl bg-zinc-100 px-4 py-4 font-semibold text-zinc-950">
          Explore catalog
        </button>
      </section>

      <section className="grid grid-cols-2 gap-3">
        <article className="rounded-2xl bg-zinc-900 p-4">
          <p className="text-sm text-zinc-400">My collection</p>
          <p className="mt-2 text-2xl font-bold">0</p>
        </article>

        <article className="rounded-2xl bg-zinc-900 p-4">
          <p className="text-sm text-zinc-400">Wishlist</p>
          <p className="mt-2 text-2xl font-bold">0</p>
        </article>
      </section>

      <nav className="fixed bottom-0 left-0 right-0 border-t border-zinc-800 bg-zinc-950 px-4 py-3">
        <div className="mx-auto flex max-w-md justify-between text-sm text-zinc-400">
          <span className="text-zinc-50">Home</span>
          <span>Catalog</span>
          <span>Wishlist</span>
          <span>Profile</span>
        </div>
      </nav>
    </main>
  );
}