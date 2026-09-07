"use client";

import {
  ArrowDownLeft,
  ArrowUpRight,
  Bell,
  ChevronRight,
  CircleDollarSign,
  Ellipsis,
  Home as HomeIcon,
  Landmark,
  Plus,
  ReceiptText,
  WalletCards,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

type Dashboard = {
  availableBudget: number;
  totalExpenses: number;
  wallets: { id: string; name: string; balance: string; minimum: string }[];
  expenses: { id: string; description: string; category: string; amount: string; spentAt: string }[];
};
type Profile = { name: string; hasAvatar: boolean; avatarVersion: number };

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const walletDetails = [
  { note: "Movimentacoes do dia a dia", color: "teal" },
  { note: "Reserva obrigatoria", color: "coral" },
  { note: "Disponivel para usar", color: "teal" },
  { note: "Projetos e melhorias", color: "gold" },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState("Visao geral");
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((response) => response.ok ? response.json() : Promise.reject())
      .then(setDashboard)
      .catch(() => setDashboard({ availableBudget: 0, totalExpenses: 0, wallets: [], expenses: [] }));
  }, []);

  useEffect(() => {
    fetch("/api/profile")
      .then((response) => response.ok ? response.json() : Promise.reject())
      .then(setProfile)
      .catch(() => setProfile(null));
  }, []);

  const totalTracked = (dashboard?.availableBudget ?? 0) + (dashboard?.totalExpenses ?? 0);
  const percentageSpent = totalTracked ? ((dashboard?.totalExpenses ?? 0) / totalTracked) * 100 : 0;
  const initials = profile?.name.split(" ").map((word) => word[0]).join("").slice(0, 2).toUpperCase() ?? "";

  return (
    <main className="app-shell">
      <section className="app-content">
        <header className="topbar">
          <div className="brand-mark" aria-hidden="true"><span /></div>
          <div className="topbar-actions">
            <button className="icon-button" aria-label="Ver notificacoes"><Bell size={20} /></button>
            <Link className="avatar" href="/perfil" aria-label="Abrir perfil">{profile?.hasAvatar ? <Image src={`/api/profile/avatar?v=${profile.avatarVersion}`} alt="Foto do perfil" width={35} height={35} unoptimized /> : initials}</Link>
          </div>
        </header>
        <div className="welcome-row">
          <div><p className="eyebrow">Bom dia, {profile?.name ?? "..."}</p><h1>Visao geral</h1></div>
          <button className="more-button" aria-label="Mais opcoes"><Ellipsis size={22} /></button>
        </div>
        <section className="balance-card" aria-label="Resumo do saldo">
          <div className="balance-heading"><span>Saldo em conta</span><button aria-label="Ocultar saldo" className="balance-visibility">Visivel</button></div>
          <strong>{dashboard ? currency.format(dashboard.availableBudget) : "Carregando..."}</strong>
          <div className="balance-footer"><span><ArrowUpRight size={15} /> Saldo inicial zerado</span><span>Atualizado hoje</span></div>
        </section>
        <section className="stat-grid" aria-label="Resumo do orcamento">
          <article className="stat-card"><div className="stat-icon outgoing"><ArrowDownLeft size={18} /></div><span>Ja investido</span><strong>{currency.format(dashboard?.totalExpenses ?? 0)}</strong><small>{percentageSpent.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}% do total</small></article>
          <article className="stat-card"><div className="stat-icon incoming"><WalletCards size={18} /></div><span>Saldo disponivel</span><strong>{currency.format(dashboard?.availableBudget ?? 0)}</strong><small>Receitas menos gastos</small></article>
        </section>
        <section className="section-block">
          <div className="section-heading"><div><p className="eyebrow">Planejamento</p><h2>Suas carteiras</h2></div><Link className="text-action" href="/carteiras">Ver todas <ChevronRight size={17} /></Link></div>
          <div className="wallet-list">{dashboard?.wallets.length ? dashboard.wallets.map((wallet, index) => <Link className="wallet-row" href={`/carteiras/${wallet.id}`} key={wallet.id}><div className={`wallet-accent ${walletDetails[index]?.color ?? "teal"}`} /><div className="wallet-copy"><strong>{wallet.name}</strong><span>{walletDetails[index]?.note ?? "Carteira"}</span></div><div className="wallet-value"><strong>{currency.format(Number(wallet.balance))}</strong><ChevronRight size={18} /></div></Link>) : <p className="empty-row">As carteiras serao criadas ao conectar ao banco.</p>}</div>
        </section>
        <section className="section-block recent-section">
          <div className="section-heading"><div><p className="eyebrow">Movimentacoes</p><h2>Ultimos gastos</h2></div><Link className="text-action" href="/historico/gastos">Ver todos <ChevronRight size={17} /></Link></div>
          <div className="expense-list">{dashboard?.expenses.length ? dashboard.expenses.map((expense, index) => { const Icon = [ReceiptText, Landmark, CircleDollarSign][index % 3]; const tone = ["orange", "blue", "green"][index % 3]; return <article className="expense-row" key={expense.id}><div className={`expense-icon ${tone}`}><Icon size={19} /></div><div className="expense-copy"><strong>{expense.description}</strong><span>{expense.category} <i /> {new Date(expense.spentAt).toLocaleDateString("pt-BR")}</span></div><strong className="expense-value">- {currency.format(Number(expense.amount))}</strong></article>; }) : <p className="empty-row">Nenhum gasto registrado ainda.</p>}</div>
        </section>
      </section>
      <Link className="floating-action" href="/gastos" aria-label="Adicionar movimentacao"><Plus size={25} /></Link>
      <nav className="bottom-nav" aria-label="Navegacao principal">
        {[["Visao geral", HomeIcon], ["Receitas", ArrowUpRight], ["Gastos", ArrowDownLeft], ["Carteiras", WalletCards]].map(([label, Icon]) => {
          const ActiveIcon = Icon as typeof HomeIcon;
          const href = label === "Receitas" ? "/receitas" : label === "Gastos" ? "/gastos" : "/";
          return <Link key={label as string} href={href} className={activeTab === label ? "nav-item selected" : "nav-item"} onClick={() => setActiveTab(label as string)}><ActiveIcon size={20} /><span>{label as string}</span></Link>;
        })}
      </nav>
    </main>
  );
}
