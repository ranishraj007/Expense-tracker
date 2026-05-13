import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const rounds = Number(process.env.BCRYPT_ROUNDS || 12);

async function main() {
  const password = await bcrypt.hash("admin", rounds);

  await prisma.user.upsert({
    where: { username: "admin" },
    update: {
      password,
      name: "Administrator",
      email: "admin@example.com",
      phone: "+977 9800000000",
      role: "ADMIN",
      profileImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=160&q=80",
    },
    create: {
      username: "admin",
      password,
      name: "Administrator",
      email: "admin@example.com",
      phone: "+977 9800000000",
      role: "ADMIN",
      profileImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=160&q=80",
    },
  });

  await prisma.user.updateMany({
    where: {
      role: "ADMIN",
      username: { not: "admin" },
    },
    data: { role: "USER" },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
