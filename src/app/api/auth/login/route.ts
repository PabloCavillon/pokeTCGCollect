import { prisma } from "@/db";
import { createSession, verifyPassword } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
	let body: unknown;
	try { body = await req.json(); }
	catch { return NextResponse.json({ error: "Body inválido" }, { status: 400 }); }

	const { email, password } = (body ?? {}) as Record<string, unknown>;

	if (typeof email !== "string" || typeof password !== "string") {
		return NextResponse.json({ error: "Email y contraseña requeridos" }, { status: 400 });
	}

	const user = await prisma.user.findUnique({
		where: { email: email.toLowerCase().trim() },
	});

	if (!user?.passwordHash || !(await verifyPassword(password, user.passwordHash))) {
		return NextResponse.json({ error: "Email o contraseña incorrectos" }, { status: 401 });
	}

	await createSession({ id: user.id, email: user.email, name: user.name });
	return NextResponse.json({ ok: true });
}
