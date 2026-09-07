import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requestUserEmail } from "@/lib/request-user";

type RouteContext = { params: Promise<{ walletId: string }> };

export async function GET(_: Request, { params }: RouteContext) {
  const email = await requestUserEmail();
  if (!email) return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  const { walletId } = await params;
  const wallet = await prisma.wallet.findUnique({ where: { id: walletId } });
  if (!wallet) return NextResponse.json({ error: "Carteira nao encontrada" }, { status: 404 });

  const [incomes, expenses] = await Promise.all([
    prisma.income.findMany({ where: { walletId, user: { email } }, orderBy: { receivedAt: "desc" } }),
    prisma.expense.findMany({ where: { walletId, user: { email } }, orderBy: { spentAt: "desc" } }),
  ]);
  const movements = [
    ...incomes.map((income) => ({ id: income.id, type: "income", description: income.description, category: "Receita", amount: Number(income.amount), date: income.receivedAt, notes: income.notes })),
    ...expenses.map((expense) => ({ id: expense.id, type: "expense", description: expense.description, category: expense.category, amount: Number(expense.amount), date: expense.spentAt, notes: expense.notes })),
  ].sort((first, second) => second.date.getTime() - first.date.getTime());
  return NextResponse.json({ wallet: { ...wallet, balance: Number(wallet.balance), minimum: Number(wallet.minimum) }, movements });
}
