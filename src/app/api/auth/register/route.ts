import { db, users } from "@/db";
import { createSession, hashPassword } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
	let body: unknown;
	try { body = await req.json(); }
	catch { return NextResponse.json({ error: "Body inválido" }, { status: 400 }); }

	const { name, email, password } = (body ?? {}) as Record<string, unknown>;

	if (typeof email !== "string" || typeof password !== "string" || typeof name !== "string") {
		return NextResponse.json({ error: "Nombre, email y contraseña requeridos" }, { status: 400 });
	}

	if (password.length < 8) {
		return NextResponse.json({ error: "La contraseña debe tener al menos 8 caracteres" }, { status: 400 });
	}

	const normalizedEmail = email.toLowerCase().trim();
	const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.email, normalizedEmail)).limit(1);

	if (existing) {
		return NextResponse.json({ error: "Ya existe una cuenta con ese email" }, { status: 409 });
	}

	const passwordHash = await hashPassword(password);
	const [user] = await db.insert(users).values({
		name:         name.trim(),
		email:        normalizedEmail,
		passwordHash,
	}).returning({ id: users.id, email: users.email, name: users.name });

	await createSession({ id: user.id, email: user.email, name: user.name });
	return NextResponse.json({ ok: true }, { status: 201 });
}
