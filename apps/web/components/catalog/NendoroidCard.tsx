import type { Nendoroid } from "@/types/nendoroid";
import Image from "next/image";
import Link from "next/link";

type NendoroidCardProps = {
  nendoroid: Nendoroid;
};

export default function NendoroidCard({
  nendoroid,
}: NendoroidCardProps) {
  return (
    <Link href={`/catalog/${nendoroid.number}`}>
        <article className="overflow-hidden rounded-2xl bg-zinc-900">
            <Image
                src={nendoroid.imageUrl}
                alt={nendoroid.name}
                width={400}
                height={400}
                className="aspect-square w-full object-cover"
            />

            <div className="p-4">
                <p className="text-sm text-zinc-400">
                #{nendoroid.number}
                </p>

                <h2 className="mt-1 font-semibold">
                {nendoroid.name}
                </h2>

                <p className="mt-1 text-sm text-zinc-500">
                {nendoroid.series}
                </p>
            </div>
        </article>
    </Link>
    
  );
}