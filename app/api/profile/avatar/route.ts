import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";
import { profileUser } from "@/lib/profile-user";
import { prisma } from "@/lib/prisma";
import { requestUserEmail } from "@/lib/request-user";
import { storage, uploadsBucket } from "@/lib/storage";

const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function POST(request: Request) {
  const email = await requestUserEmail();
  if (!email) return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  const image = (await request.formData()).get("image");
  if (!(image instanceof File) || !allowedTypes.has(image.type) || image.size > 5 * 1024 * 1024) return NextResponse.json({ error: "Use uma imagem JPG, PNG ou WebP de ate 5 MB." }, { status: 400 });
  const user = await profileUser(email);
  const extension = image.type.split("/")[1];
  const key = `profiles/${user.id}/avatar-${Date.now()}.${extension}`;
  await storage.send(new PutObjectCommand({ Bucket: uploadsBucket, Key: key, Body: Buffer.from(await image.arrayBuffer()), ContentType: image.type }));
  await prisma.user.update({ where: { id: user.id }, data: { avatarKey: key } });
  return NextResponse.json({ ok: true });
}

export async function GET() {
  const email = await requestUserEmail();
  if (!email) return new NextResponse(null, { status: 401 });
  const user = await profileUser(email);
  if (!user.avatarKey) return new NextResponse(null, { status: 404 });
  const object = await storage.send(new GetObjectCommand({ Bucket: uploadsBucket, Key: user.avatarKey }));
  if (!object.Body) return new NextResponse(null, { status: 404 });
  return new NextResponse(object.Body.transformToWebStream(), { headers: { "Content-Type": object.ContentType ?? "image/jpeg", "Cache-Control": "private, max-age=3600" } });
}