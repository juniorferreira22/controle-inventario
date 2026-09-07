import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requestUserEmail } from "@/lib/request-user";
import { ensureWallets } from "@/lib/wallets";

export async function GET() {
  if (!await requestUserEmail()) return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  await ensureWallets();
  return NextResponse.json(await prisma.wallet.findMany({ orderBy: { type: "asc" } }));
}