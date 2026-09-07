import { prisma } from "@/lib/prisma";

export function profileUser(email: string) {
  return prisma.user.upsert({
    where: { email },
    update: {},
    create: { email, name: email.split("@")[0], passwordHash: "environment-managed" },
  });
}