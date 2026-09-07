"use client";

import Link from "next/link";
import { ArrowDownLeft, ArrowLeft, LoaderCircle, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { fetchJson } from "@/lib/fetch-json";

type Expense = { id: string; description: string; category: string; amount: string; spentAt: string; notes: string | null; wallet: { id: string; name: string } | null };
const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export default function ExpenseHistoryPage() {
  const [expenses, setExpenses] = useState<Expense[] | null>(null);
  const [error, setError] = useState("");
  useEffect(() => { fetchJson<Expense[]>("/api/expenses").then(setExpenses).catch((cause: Error) => setError(cause.message)); }, []);
  const total = expenses?.reduce((sum, expense) => sum + Number(expense.amount), 0) ?? 0;
  return <main className="transaction-shell"><section className="transaction-content">
    <header className="transaction-header"><Link href="/" className="back-button" aria-label="Voltar ao painel"><ArrowLeft size={20} /></Link><div><p className="eyebrow">Movimentacoes</p><h1>Historico de gastos</h1></div></header>
    <section className="wallet-balance"><span>Total registrado</span><strong>{currency.format(total)}</strong><small>{expenses?.length ?? 0} {expenses?.length === 1 ? "gasto" : "gastos"} no historico</small></section>
    <Link href="/gastos" className="history-add"><Plus size={18} /> Registrar novo gasto</Link>
    {error ? <p className="form-status error">{error}</p> : expenses === null ? <p className="loading-state"><LoaderCircle className="spin" size={18} /> Carregando gastos...</p> : <div className="expense-list history-list">{expenses.length ? expenses.map((expense) => <article className="expense-row" key={expense.id}><div className="expense-icon orange"><ArrowDownLeft size={19} /></div><div className="expense-copy"><strong>{expense.description}</strong><span>{expense.category} <i /> {expense.wallet?.name ?? "Sem carteira"}</span><span>{new Date(expense.spentAt).toLocaleDateString("pt-BR")}</span></div><strong className="expense-value">- {currency.format(Number(expense.amount))}</strong></article>) : <p className="empty-row">Nenhum gasto registrado ainda.</p>}</div>}
  </section></main>;
}