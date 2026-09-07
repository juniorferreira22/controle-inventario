import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requestUserEmail } from "@/lib/request-user";

type RouteContext = { params: Promise<{ incomeId: string }> };

export async function PATCH(request: Request, { params }: RouteContext) {
  const email = await requestUserEmail();
  if (!email) return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  const { incomeId } = await params;
  const current = await prisma.income.findFirst({ where: { id: incomeId, user: { email } } });
  if (!current) return NextResponse.json({ error: "Receita nao encontrada" }, { status: 404 });
  const data = await request.json();
  const amount = Number(data.amount ?? current.amount);
  const walletId = String(data.walletId ?? current.walletId);
  if (!data.description || !Number.isFinite(amount) || amount <= 0) return NextResponse.json({ error: "Dados invalidos" }, { status: 400 });
  const income = await prisma.$transaction(async (tx) => {
    await tx.wallet.update({ where: { id: current.walletId }, data: { balance: { decrement: current.amount } } });
    await tx.wallet.update({ where: { id: walletId }, data: { balance: { increment: amount } } });
    return tx.income.update({ where: { id: incomeId }, data: { description: data.description, amount, walletId, receivedAt: data.receivedAt ? new Date(data.receivedAt) : current.receivedAt, notes: data.notes || null } });
  });
  return NextResponse.json(income);
}

export async function DELETE(_: Request, { params }: RouteContext) {
  const email = await requestUserEmail();
  if (!email) return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  const { incomeId } = await params;
  const income = await prisma.income.findFirst({ where: { id: incomeId, user: { email } } });
  if (!income) return NextResponse.json({ error: "Receita nao encontrada" }, { status: 404 });
  await prisma.$transaction([
    prisma.income.delete({ where: { id: incomeId } }),
    prisma.wallet.update({ where: { id: income.walletId }, data: { balance: { decrement: income.amount } } }),
  ]);
  return new NextResponse(null, { status: 204 });
}