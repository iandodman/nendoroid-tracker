export default function BottomNavigation() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t border-zinc-800 bg-zinc-950 px-4 py-3">
      <div className="mx-auto flex max-w-md justify-between text-sm text-zinc-400">
        <span className="text-zinc-50">Home</span>
        <span>Catalog</span>
        <span>Wishlist</span>
        <span>Profile</span>
      </div>
    </nav>
  );
}