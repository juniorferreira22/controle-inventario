import { LockKeyhole } from "lucide-react";

export default async function Login({ searchParams }: PageProps<"/login">) {
  const { error } = await searchParams;
  return <main className="login-shell"><section className="login-panel">
    <div className="login-brand" aria-hidden="true"><span /></div>
    <p className="eyebrow">Casa 300</p>
    <h1>Entre no seu orcamento</h1>
    <p className="login-copy">Acompanhe cada decisao da nova casa em um unico lugar.</p>
    <form className="login-form" action="/api/auth/login" method="post">
      <label>E-mail<input name="email" type="email" autoComplete="email" required placeholder="voce@exemplo.com" /></label>
      <label>Senha<input name="password" type="password" autoComplete="current-password" required placeholder="Sua senha" /></label>
      {error && <p className="login-error" role="alert">E-mail ou senha incorretos.</p>}
      <button className="login-submit" type="submit"><LockKeyhole size={17} /> Entrar</button>
    </form>
  </section></main>;
}