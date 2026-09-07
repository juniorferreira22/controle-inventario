import { WalletType } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const defaultWallets = [
  { type: WalletType.CHECKING, name: "Conta corrente", minimum: 0 },
  { type: WalletType.EMERGENCY, name: "Fundo de emergencia", minimum: 50000 },
  { type: WalletType.LEISURE, name: "Fundo de lazer", minimum: 0 },
  { type: WalletType.OPPORTUNITY, name: "Fundo de oportunidade", minimum: 0 },
];

export async function ensureWallets() {
  await prisma.$transaction(defaultWallets.map((wallet) => prisma.wallet.upsert({
    where: { type: wallet.type },
    update: {},
    create: wallet,
  })));
}