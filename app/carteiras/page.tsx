"use client";

import Link from "next/link";
import { ChevronRight, WalletCards } from "lucide-react";
import { useEffect, useState } from "react";
import { fetchJson } from "@/lib/fetch-json";

type Wallet = { id: string; name: string; balance: string; minimum: string };
const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export default function WalletsPage() {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [error, setError] = useState("");
  useEffect(() => { fetchJson<Wallet[]>("/api/wallets").then(setWallets).catch((cause: Error) => setError(cause.message)); }, []);
  return <main className="transaction-shell"><section className="transaction-content">
    <header className="transaction-header"><Link href="/" className="back-button" aria-label="Voltar ao painel">&larr;</Link><div><p className="eyebrow">Planejamento</p><h1>Suas carteiras</h1></div></header>
    <section className="wallet-overview"><WalletCards size={22} /><p>Escolha uma carteira para acompanhar o saldo e todas as movimentacoes.</p></section>
    <div className="wallet-list">{error ? <p className="empty-row">{error}</p> : wallets.map((wallet) => <Link className="wallet-row wallet-link" href={`/carteiras/${wallet.id}`} key={wallet.id}><div className="wallet-copy"><strong>{wallet.name}</strong><span>Saldo minimo: {currency.format(Number(wallet.minimum))}</span></div><div className="wallet-value"><strong>{currency.format(Number(wallet.balance))}</strong><ChevronRight size={18} /></div></Link>)}</div>
  </section></main>;
}