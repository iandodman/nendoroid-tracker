import { auth } from "@/auth";
import HomeClient from "@/components/home/HomeClient";
import { PageHeader } from "@/components/layout/PageHeader";
import { getUserCollectionCount } from "@/lib/collection";
import { prisma } from "@/lib/prisma";

export default async function Home() {
  const session = await auth();
  const userId = session?.user?.id;

  const [collectionCount, wishlistCount] = userId
    ? await Promise.all([
        getUserCollectionCount(userId),
        prisma.wishlistItem.count({
          where: {
            userId,
          },
        }),
      ])
    : [0, 0];

  return (
    <>
      <PageHeader
        title="Home"
        description="Search and manage your Nendoroids."
      />

      <HomeClient
        collectionCount={collectionCount}
        wishlistCount={wishlistCount}
      />
    </>
  );
}