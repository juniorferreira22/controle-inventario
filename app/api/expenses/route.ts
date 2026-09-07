import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requestUserEmail } from "@/lib/request-user";

export async function GET() {
  const email = await requestUserEmail();
  if (!email) return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  return NextResponse.json(await prisma.expense.findMany({ where: { user: { email } }, include: { wallet: true }, orderBy: { spentAt: "desc" } }));
}

export async function POST(request: Request) {
  const email = await requestUserEmail();
  if (!email) return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  const { description, category, amount, walletId, spentAt, notes } = await request.json();
  const value = Number(amount);
  if (!description || !category || !Number.isFinite(value) || value <= 0) return NextResponse.json({ error: "Dados invalidos" }, { status: 400 });
  const user = await prisma.user.upsert({ where: { email }, update: {}, create: { email, name: email.split("@")[0], passwordHash: "environment-managed" } });
  try {
    const expense = await prisma.$transaction(async (tx) => {
      if (walletId) {
        const wallet = await tx.wallet.findUnique({ where: { id: walletId } });
        if (!wallet || Number(wallet.balance) - value < Number(wallet.minimum)) throw new Error("Saldo insuficiente para esta carteira");
        await tx.wallet.update({ where: { id: walletId }, data: { balance: { decrement: value } } });
      }
      return tx.expense.create({ data: { description, category, amount: value, walletId: walletId || null, userId: user.id, spentAt: spentAt ? new Date(spentAt) : new Date(), notes: notes || null }, include: { wallet: true } });
    });
    return NextResponse.json(expense, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Nao foi possivel registrar o gasto" }, { status: 400 });
  }
}