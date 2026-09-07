"use client";

import Link from "next/link";
import { ArrowDownLeft, ArrowLeft, ArrowUpRight, LoaderCircle, Pencil, Trash2, X } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";

type WalletData = { id: string; name: string; balance: number; minimum: number };
type Movement = { id: string; type: "income" | "expense"; description: string; category: string; amount: number; date: string; notes: string | null };
type History = { wallet: WalletData; movements: Movement[] };
const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export function WalletHistory({ walletId }: { walletId: string }) {
  const [history, setHistory] = useState<History | null>(null);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<Movement | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  useEffect(() => { fetch(`/api/wallets/${walletId}`).then(async (response) => response.ok ? response.json() : Promise.reject()).then(setHistory).catch(() => setError("Nao foi possivel carregar esta carteira.")); }, [walletId, refreshKey]);

  async function remove(movement: Movement) {
    if (!confirm(`Excluir ${movement.description}?`)) return;
    const response = await fetch(`/api/${movement.type === "income" ? "incomes" : "expenses"}/${movement.id}`, { method: "DELETE" });
    if (response.ok) setRefreshKey((value) => value + 1);
    else setError("Nao foi possivel excluir a movimentacao.");
  }

  async function update(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editing) return;
    const formData = new FormData(event.currentTarget);
    const payload = Object.fromEntries(formData);
    const response = await fetch(`/api/${editing.type === "income" ? "incomes" : "expenses"}/${editing.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    if (response.ok) { setEditing(null); setRefreshKey((value) => value + 1); }
    else { const result = await response.json(); setError(result.error ?? "Nao foi possivel atualizar a movimentacao."); }
  }
  if (error) return <main className="transaction-shell"><section className="transaction-content"><Link href="/carteiras" className="back-button" aria-label="Voltar">&larr;</Link><p className="form-status error">{error}</p></section></main>;
  if (!history) return <main className="transaction-shell"><section className="transaction-content loading-state"><LoaderCircle className="spin" /> Carregando carteira...</section></main>;
  return <main className="transaction-shell"><section className="transaction-content">
    <header className="transaction-header"><Link href="/carteiras" className="back-button" aria-label="Voltar as carteiras"><ArrowLeft size={20} /></Link><div><p className="eyebrow">Extrato da carteira</p><h1>{history.wallet.name}</h1></div></header>
    <section className="wallet-balance"><span>Saldo atual</span><strong>{currency.format(history.wallet.balance)}</strong><small>Reserva minima: {currency.format(history.wallet.minimum)}</small></section>
    <div className="wallet-actions"><Link href={`/receitas?wallet=${walletId}`}><ArrowUpRight size={17} /> Nova receita</Link><Link href={`/gastos?wallet=${walletId}`}><ArrowDownLeft size={17} /> Novo gasto</Link></div>
    <section className="history-section"><div><p className="eyebrow">Historico</p><h2>Movimentacoes</h2></div><div className="expense-list">{history.movements.length ? history.movements.map((movement) => <div className="movement-item" key={movement.id}><article className="expense-row"><div className={movement.type === "income" ? "expense-icon green" : "expense-icon orange"}>{movement.type === "income" ? <ArrowUpRight size={19} /> : <ArrowDownLeft size={19} />}</div><div className="expense-copy"><strong>{movement.description}</strong><span>{movement.category} <i /> {new Date(movement.date).toLocaleDateString("pt-BR")}</span></div><strong className={movement.type === "income" ? "income-value" : "expense-value"}>{movement.type === "income" ? "+ " : "- "}{currency.format(movement.amount)}</strong><div className="movement-actions"><button onClick={() => setEditing(movement)} aria-label="Editar movimentacao"><Pencil size={15} /></button><button onClick={() => remove(movement)} aria-label="Excluir movimentacao"><Trash2 size={15} /></button></div></article>{editing?.id === movement.id && <form className="inline-editor" onSubmit={update}><input name="description" defaultValue={movement.description} required /><input name="amount" type="number" min="0.01" step="0.01" defaultValue={movement.amount} required />{movement.type === "expense" && <input name="category" defaultValue={movement.category} required />}<input name={movement.type === "income" ? "receivedAt" : "spentAt"} type="date" defaultValue={movement.date.slice(0, 10)} required /><input name="notes" defaultValue={movement.notes ?? ""} placeholder="Observacoes" /><div><button type="button" onClick={() => setEditing(null)} aria-label="Cancelar edicao"><X size={15} /></button><button type="submit">Salvar</button></div></form>}</div>) : <p className="empty-row">Nenhuma movimentacao nesta carteira.</p>}</div></section>
  </section></main>;
}