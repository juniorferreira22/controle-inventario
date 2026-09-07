import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requestUserEmail } from "@/lib/request-user";

export async function GET() {
  const email = await requestUserEmail();
  if (!email) return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  return NextResponse.json(await prisma.income.findMany({ where: { user: { email } }, include: { wallet: true }, orderBy: { receivedAt: "desc" } }));
}

export async function POST(request: Request) {
  const email = await requestUserEmail();
  if (!email) return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  const { description, amount, walletId, receivedAt, notes } = await request.json();
  const value = Number(amount);
  if (!description || !walletId || !Number.isFinite(value) || value <= 0) return NextResponse.json({ error: "Dados invalidos" }, { status: 400 });
  const user = await prisma.user.upsert({ where: { email }, update: {}, create: { email, name: email.split("@")[0], passwordHash: "environment-managed" } });
  const income = await prisma.$transaction(async (tx) => {
    const created = await tx.income.create({ data: { description, amount: value, walletId, userId: user.id, receivedAt: receivedAt ? new Date(receivedAt) : new Date(), notes: notes || null }, include: { wallet: true } });
    await tx.wallet.update({ where: { id: walletId }, data: { balance: { increment: value } } });
    return created;
  });
  return NextResponse.json(income, { status: 201 });
}