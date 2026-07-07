
export default function Header() {
  return (
    <header className="mb-8 flex items-center justify-between">
      <h1 className="text-2xl font-bold tracking-tight">
        Nendodex
      </h1>

      <button className="rounded-full bg-zinc-800 px-4 py-2 text-sm hover:bg-zinc-700 transition-colors">
        Profile
      </button>
      
    </header>
  );
}