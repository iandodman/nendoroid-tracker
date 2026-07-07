import Link from "next/link";
import Image from "next/image";
import { nendoroids } from "@/data/nendoroids";

type Props = {
  params: Promise<{
    number: string;
  }>;
};

export default async function NendoroidDetailPage({ params }: Props) {
  const { number } = await params;

  const nendoroid = nendoroids.find((item) => item.number === number);

  if (!nendoroid) {
    return <p>Nendoroid not found.</p>;
  }

  return (
    <main className="min-h-screen bg-zinc-950 px-4 pb-24 pt-6 text-zinc-50">
      <Link href="/catalog" className="text-sm text-zinc-400">
        ← Back to catalog
      </Link>
      <Image
        src={nendoroid.imageUrl}
        alt={nendoroid.name}
        width={500}
        height={500}
        className="mt-6 aspect-square w-full rounded-2xl object-cover"
        />
      
      <h1 className="mt-6 text-3xl font-bold">{nendoroid.name}</h1>

      <p className="mt-2 text-zinc-400">#{nendoroid.number}</p>

      <p className="mt-1 text-zinc-500">{nendoroid.series}</p>
    </main>
  );
}