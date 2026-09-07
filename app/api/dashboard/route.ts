import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requestUserEmail } from "@/lib/request-user";
import { ensureWallets } from "@/lib/wallets";

const openingBalance = 0;

export async function GET() {
  const email = await requestUserEmail();
  if (!email) return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });

  await ensureWallets();
  const [wallets, expenses, incomeTotal, expenseTotal] = await Promise.all([
    prisma.wallet.findMany({ orderBy: { type: "asc" } }),
    prisma.expense.findMany({ where: { user: { email } }, orderBy: { spentAt: "desc" }, take: 3 }),
    prisma.income.aggregate({ where: { user: { email } }, _sum: { amount: true } }),
    prisma.expense.aggregate({ where: { user: { email } }, _sum: { amount: true } }),
  ]);
  const totalIncome = Number(incomeTotal._sum.amount ?? 0);
  const totalExpenses = Number(expenseTotal._sum.amount ?? 0);
  return NextResponse.json({
    availableBudget: openingBalance + totalIncome - totalExpenses,
    totalExpenses,
    wallets,
    expenses,
  });
}