import HomeClient from "@/components/home/HomeClient";
import { getUserCollectionCount } from "@/lib/collection";
import { prisma } from "@/lib/prisma";

export default async function Home() {
  const [user, nendoroids] = await Promise.all([
    prisma.user.findUnique({
      where: {
        email: "dev@nendodex.local",
      },
    }),
    prisma.nendoroid.findMany({
      orderBy: {
        number: "asc",
      },
    }),
  ]);

  const collectionCount = user
    ? await getUserCollectionCount(user.id)
    : 0;

  return (
    <HomeClient
      collectionCount={collectionCount}
      nendoroids={nendoroids}
    />
  );
}