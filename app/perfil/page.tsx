"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Camera, LoaderCircle, Save } from "lucide-react";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { fetchJson } from "@/lib/fetch-json";

type Profile = { name: string; email: string; hasAvatar: boolean };

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [name, setName] = useState("");
  const [status, setStatus] = useState("");
  const [uploading, setUploading] = useState(false);
  const [avatarVersion, setAvatarVersion] = useState(0);

  useEffect(() => { fetchJson<Profile>("/api/profile").then((data) => { setProfile(data); setName(data.name); }).catch(() => setStatus("Nao foi possivel carregar o perfil.")); }, []);

  async function saveName(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const response = await fetch("/api/profile", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name }) });
    const data = await response.json();
    if (response.ok) { setProfile(data); setStatus("Nome atualizado com sucesso."); }
    else setStatus(data.error ?? "Nao foi possivel atualizar o nome.");
  }

  async function uploadAvatar(event: ChangeEvent<HTMLInputElement>) {
    const image = event.target.files?.[0];
    if (!image) return;
    setUploading(true);
    setStatus("");
    try {
      const formData = new FormData();
      formData.set("image", image);
      const response = await fetch("/api/profile/avatar", { method: "POST", body: formData });
      const body = await response.text();
      const data = body ? JSON.parse(body) as { error?: string } : null;
      if (response.ok) { setProfile((current) => current ? { ...current, hasAvatar: true } : current); setAvatarVersion((value) => value + 1); setStatus("Foto atualizada com sucesso."); }
      else setStatus(data?.error ?? "Nao foi possivel enviar a foto. Tente novamente.");
    } catch {
      setStatus("Nao foi possivel enviar a foto. Tente novamente.");
    } finally {
      setUploading(false);
    }
  }

  const initials = profile?.name.split(" ").map((word) => word[0]).join("").slice(0, 2).toUpperCase() ?? "";
  return <main className="transaction-shell"><section className="transaction-content profile-content">
    <header className="transaction-header"><Link href="/" className="back-button" aria-label="Voltar ao painel"><ArrowLeft size={20} /></Link><div><p className="eyebrow">Conta</p><h1>Perfil</h1></div></header>
    <section className="profile-photo"><div className="profile-avatar">{profile?.hasAvatar ? <Image src={`/api/profile/avatar?v=${avatarVersion}`} alt="Foto do perfil" width={108} height={108} unoptimized priority /> : initials}</div><label className="photo-button">{uploading ? <LoaderCircle className="spin" size={17} /> : <Camera size={17} />}<span>{uploading ? "Enviando" : "Alterar foto"}</span><input type="file" accept="image/jpeg,image/png,image/webp" onChange={uploadAvatar} disabled={uploading} /></label><p>JPG, PNG ou WebP de ate 5 MB.</p></section>
    <form className="transaction-form profile-form" onSubmit={saveName}>
      <label>Nome de usuario<input value={name} onChange={(event) => setName(event.target.value)} minLength={2} maxLength={60} required /></label>
      <label>E-mail<input value={profile?.email ?? ""} disabled aria-describedby="email-help" /></label>
      <p id="email-help" className="field-help">O e-mail e a senha sao definidos nas variaveis privadas da aplicacao.</p>
      {status && <p className={status.includes("sucesso") ? "form-status success" : "form-status error"} role="status">{status}</p>}
      <button className="transaction-submit" type="submit" disabled={!profile}><Save size={17} /> Salvar nome</button>
    </form>
  </section></main>;
}