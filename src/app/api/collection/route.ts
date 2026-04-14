import { auth } from "@/lib/auth";
import {
	getItemsByCategory,
	getPokemonGrouped,
	toggleOwned,
} from "@/lib/queries";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
	const session = await auth();

	if (!session?.user?.id) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const category = req.nextUrl.searchParams.get("category");

	if (!category) {
		return NextResponse.json(
			{ error: "'Falta el parámetro category" },
			{ status: 400 },
		);
	}

	const validCategories = ["pokemon", "trainer", "pokeball", "energy"];
	if (!validCategories.includes(category)) {
		return NextResponse.json(
			{ error: `category debe ser uno de ${validCategories.join(", ")}` },
			{ status: 400 },
		);
	}

	try {
		if (category === "pokemon") {
			const items = await getPokemonGrouped(session.user.id);
			return NextResponse.json({ items });
		}

		const items = await getItemsByCategory(session.user.id, category);
		return NextResponse.json({ items });
	} catch (err) {
		const message = err instanceof Error ? err.message : String(err);
		return NextResponse.json({ error: message }, { status: 500 });
	}
}

export async function PATCH(req: NextRequest) {
	const session = await auth();

	if (!session?.user?.id) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	let body: unknown;

	try {
		body = await req.json();
	} catch {
		return NextResponse.json({ error: "Body inválido" }, { status: 400 });
	}

	if (
		typeof body !== "object" ||
		body === null ||
		typeof (body as Record<string, unknown>).itemId !== "number" ||
		typeof (body as Record<string, unknown>).owned !== "boolean"
	) {
		return NextResponse.json(
			{ error: "Body debe tener {itemId: number, owned: boolean" },
			{ status: 400 },
		);
	}
	const {
		itemId,
		owned,
		isFullArt = false,
	} = body as { itemId: number; owned: boolean; isFullArt?: boolean };

	try {
		await toggleOwned(session.user.id, itemId, owned, isFullArt);
		return NextResponse.json({ ok: true });
	} catch (err) {
		const message = err instanceof Error ? err.message : String(err);
		return NextResponse.json({ error: message }, { status: 500 });
	}
}
