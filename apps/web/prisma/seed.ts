import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({
  adapter,
});

const nendoroids = [
  {
    number: "2367",
    name: "Frieren",
    series: "Frieren: Beyond Journey's End",
    imageUrl: "/images/nendoroids/frieren.webp",
  },
  {
    number: "2368",
    name: "Fern",
    series: "Frieren: Beyond Journey's End",
    imageUrl: "/images/nendoroids/fern.webp",
  },
  {
    number: "1701",
    name: "Hatsune Miku: NT",
    series: "Character Vocal Series",
    imageUrl: "/images/nendoroids/miku_nt.webp",
  },
  {
    number: "2069",
    name: "Hitori Gotoh",
    series: "Bocchi the Rock!",
    imageUrl: "/images/nendoroids/bocchi.webp",
  },
];

async function main() {
  // Seed del catálogo
  for (const nendoroid of nendoroids) {
    await prisma.nendoroid.upsert({
      where: {
        number: nendoroid.number,
      },

      update: {
        name: nendoroid.name,
        series: nendoroid.series,
        imageUrl: nendoroid.imageUrl,
      },

      create: nendoroid,
    });
  }

  // Usuario de desarrollo
  const developmentUser = await prisma.user.upsert({
    where: {
      email: "dev@nendodex.local",
    },

    update: {},

    create: {
      email: "dev@nendodex.local",
      name: "Ian",
    },
  });

  console.log("✅ Catalog seeded successfully.");
  console.log(`✅ Development user ready: ${developmentUser.email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });