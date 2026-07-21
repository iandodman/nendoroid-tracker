import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({
  adapter,
});

const DEVELOPMENT_USER_EMAIL = "dev@nendodex.local";

async function main() {
  const developmentUser = await prisma.user.upsert({
    where: {
      email: DEVELOPMENT_USER_EMAIL,
    },
    update: {
      name: "Ian",
    },
    create: {
      email: DEVELOPMENT_USER_EMAIL,
      name: "Ian",
    },
  });

  console.log(
    `✅ Development user ready: ${developmentUser.email}`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });