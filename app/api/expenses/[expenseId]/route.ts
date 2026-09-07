import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requestUserEmail } from "@/lib/request-user";

type RouteContext = { params: Promise<{ expenseId: string }> };

export async function PATCH(request: Request, { params }: RouteContext) {
  const email = await requestUserEmail();
  if (!email) return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  const { expenseId } = await params;
  const current = await prisma.expense.findFirst({ where: { id: expenseId, user: { email } } });
  if (!current) return NextResponse.json({ error: "Gasto nao encontrado" }, { status: 404 });
  const data = await request.json();
  const amount = Number(data.amount ?? current.amount);
  const walletId = String(data.walletId ?? current.walletId ?? "");
  if (!data.description || !data.category || !walletId || !Number.isFinite(amount) || amount <= 0) return NextResponse.json({ error: "Dados invalidos" }, { status: 400 });
  try {
    const expense = await prisma.$transaction(async (tx) => {
      if (current.walletId) await tx.wallet.update({ where: { id: current.walletId }, data: { balance: { increment: current.amount } } });
      const wallet = await tx.wallet.findUnique({ where: { id: walletId } });
      if (!wallet || Number(wallet.balance) - amount < Number(wallet.minimum)) throw new Error("Saldo insuficiente para esta carteira");
      await tx.wallet.update({ where: { id: walletId }, data: { balance: { decrement: amount } } });
      return tx.expense.update({ where: { id: expenseId }, data: { description: data.description, category: data.category, amount, walletId, spentAt: data.spentAt ? new Date(data.spentAt) : current.spentAt, notes: data.notes || null } });
    });
    return NextResponse.json(expense);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Nao foi possivel atualizar o gasto" }, { status: 400 });
  }
}

export async function DELETE(_: Request, { params }: RouteContext) {
  const email = await requestUserEmail();
  if (!email) return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  const { expenseId } = await params;
  const expense = await prisma.expense.findFirst({ where: { id: expenseId, user: { email } } });
  if (!expense) return NextResponse.json({ error: "Gasto nao encontrado" }, { status: 404 });
  await prisma.$transaction([
    prisma.expense.delete({ where: { id: expenseId } }),
    ...(expense.walletId ? [prisma.wallet.update({ where: { id: expense.walletId }, data: { balance: { increment: expense.amount } } })] : []),
  ]);
  return new NextResponse(null, { status: 204 });
}