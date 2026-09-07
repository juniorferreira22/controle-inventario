import { NextResponse } from "next/server";
import { profileUser } from "@/lib/profile-user";
import { requestUserEmail } from "@/lib/request-user";

export async function GET() {
  const email = await requestUserEmail();
  if (!email) return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  const user = await profileUser(email);
  return NextResponse.json({ name: user.name, email: user.email, hasAvatar: Boolean(user.avatarKey), avatarVersion: user.updatedAt.getTime() });
}

export async function PATCH(request: Request) {
  const email = await requestUserEmail();
  if (!email) return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  const name = String((await request.json()).name ?? "").trim();
  if (name.length < 2 || name.length > 60) return NextResponse.json({ error: "Informe um nome entre 2 e 60 caracteres." }, { status: 400 });
  const user = await profileUser(email);
  const updated = await (await import("@/lib/prisma")).prisma.user.update({ where: { id: user.id }, data: { name } });
  return NextResponse.json({ name: updated.name, email: updated.email, hasAvatar: Boolean(updated.avatarKey), avatarVersion: updated.updatedAt.getTime() });
}