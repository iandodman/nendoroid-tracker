import ExploreCatalogButton from "@/components/home/ExploreCatalogButton";
import SummaryCard from "@/components/home/SummaryCard";
import Header from "@/components/layout/Header";
import BottomNavigation from "@/components/navigation/BottomNavigation";
import SearchBar from "@/components/search/SearchBar";

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-950 px-4 pb-24 pt-6 text-zinc-50">
      <Header />

      <SearchBar />

      <ExploreCatalogButton />

      <section className="grid grid-cols-2 gap-3">
        <SummaryCard title="My collection" value={0} />
        <SummaryCard title="Wishlist" value={0} />
      </section>

      <BottomNavigation />
    </main>
  );
}