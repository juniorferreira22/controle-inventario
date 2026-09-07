"use client";

import Link from "next/link";
import { ArrowLeft, ArrowDownLeft, ArrowUpRight, LoaderCircle } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { fetchJson } from "@/lib/fetch-json";

type Wallet = { id: string; name: string; balance: string; minimum: string };
type TransactionPageProps = { type: "income" | "expense" };

export function TransactionPage({ type }: TransactionPageProps) {
  const isIncome = type === "income";
  const walletId = useSearchParams().get("wallet") ?? "";
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [status, setStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { fetchJson<Wallet[]>("/api/wallets").then(setWallets).catch(() => setStatus("Nao foi possivel carregar as carteiras.")); }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    setSubmitting(true);
    setStatus("");
    const form = new FormData(formElement);
    const response = await fetch(isIncome ? "/api/incomes" : "/api/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(form)),
    });
    if (response.ok) {
      formElement.reset();
      setStatus(isIncome ? "Receita registrada com sucesso." : "Gasto registrado com sucesso.");
      const refreshed = await fetch("/api/wallets").then((result) => result.json());
      setWallets(refreshed);
    } else {
      const result = await response.json();
      setStatus(result.error ?? "Nao foi possivel salvar a movimentacao.");
    }
    setSubmitting(false);
  }

  return <main className="transaction-shell"><section className="transaction-content">
    <header className="transaction-header"><Link href="/" className="back-button" aria-label="Voltar ao painel"><ArrowLeft size={20} /></Link><div><p className="eyebrow">Movimentacao</p><h1>{isIncome ? "Nova receita" : "Novo gasto"}</h1></div></header>
    <section className="transaction-intro"><div className={isIncome ? "transaction-symbol income-symbol" : "transaction-symbol expense-symbol"}>{isIncome ? <ArrowUpRight size={22} /> : <ArrowDownLeft size={22} />}</div><p>{isIncome ? "Registre valores que entram em uma das suas carteiras." : "Registre compras e investimentos para acompanhar o orcamento."}</p></section>
    <form className="transaction-form" onSubmit={submit}>
      <label>Descricao<input name="description" required placeholder={isIncome ? "Ex.: rendimento de aplicacao" : "Ex.: instalacao de luminarias"} /></label>
      {!isIncome && <label>Categoria<input name="category" required placeholder="Ex.: Acabamentos" /></label>}
      <label>Valor (R$)<input name="amount" type="number" min="0.01" step="0.01" inputMode="decimal" required placeholder="0,00" /></label>
      <label>Carteira<select name="walletId" required defaultValue={walletId}><option value="" disabled>Selecione uma carteira</option>{wallets.map((wallet) => <option key={wallet.id} value={wallet.id}>{wallet.name} - R$ {Number(wallet.balance).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</option>)}</select></label>
      <label>Data<input name={isIncome ? "receivedAt" : "spentAt"} type="date" defaultValue={new Date().toISOString().slice(0, 10)} required /></label>
      <label>Observacoes <span>opcional</span><textarea name="notes" rows={3} placeholder="Detalhes da movimentacao" /></label>
      {status && <p className={status.includes("sucesso") ? "form-status success" : "form-status error"} role="status">{status}</p>}
      <button className="transaction-submit" type="submit" disabled={submitting}>{submitting ? <LoaderCircle className="spin" size={18} /> : isIncome ? <ArrowUpRight size={18} /> : <ArrowDownLeft size={18} />}{submitting ? "Salvando" : isIncome ? "Registrar receita" : "Registrar gasto"}</button>
    </form>
    {!isIncome && <p className="reserve-note">A reserva do fundo de emergencia nao pode ficar abaixo de R$ 50.000,00.</p>}
  </section></main>;
}