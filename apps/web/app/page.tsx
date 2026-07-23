import HomeClient from "@/components/home/HomeClient";
import { PageHeader } from "@/components/layout/PageHeader";
import { getUserCollectionCount } from "@/lib/collection";
import { prisma } from "@/lib/prisma";

const DEVELOPMENT_USER_EMAIL = "dev@nendodex.local";

export default async function Home() {
  const [user, nendoroids] = await Promise.all([
    prisma.user.findUnique({
      where: {
        email: DEVELOPMENT_USER_EMAIL,
      },
    }),
    prisma.nendoroid.findMany({
      orderBy: {
        number: "asc",
      },
    }),
  ]);

  const [collectionCount, wishlistCount] = user
    ? await Promise.all([
        getUserCollectionCount(user.id),
        prisma.wishlistItem.count({
          where: {
            userId: user.id,
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
        nendoroids={nendoroids}
      />
    </>
  );
}