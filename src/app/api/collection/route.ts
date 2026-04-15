import { getSession } from "@/lib/auth";
import { getItemsByCategory, getPokemonGrouped, toggleOwned, toggleSkipped } from "@/lib/queries";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
	const session = await getSession();
	if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

	const category = req.nextUrl.searchParams.get("category");
	if (!category) return NextResponse.json({ error: "Falta el parámetro category" }, { status: 400 });

	const validCategories = ["pokemon", "trainer", "pokeball", "energy"];
	if (!validCategories.includes(category))
		return NextResponse.json({ error: `category debe ser uno de ${validCategories.join(", ")}` }, { status: 400 });

	try {
		const items = category === "pokemon"
			? await getPokemonGrouped(session.id)
			: await getItemsByCategory(session.id, category);
		return NextResponse.json({ items });
	} catch (err) {
		return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
	}
}

export async function PATCH(req: NextRequest) {
	const session = await getSession();
	if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

	let body: unknown;
	try { body = await req.json(); }
	catch { return NextResponse.json({ error: "Body inválido" }, { status: 400 }); }

	const b = (body ?? {}) as Record<string, unknown>;

	// Toggle skipped
	if (typeof b.itemId === "number" && typeof b.skipped === "boolean") {
		try {
			await toggleSkipped(session.id, b.itemId, b.skipped);
			revalidatePath("/collection/pokemon");
			revalidatePath("/collection/trainers");
			revalidatePath("/collection/pokeballs");
			revalidatePath("/collection/energy");
			return NextResponse.json({ ok: true });
		} catch (err) {
			return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
		}
	}

	// Toggle owned / fullArt
	if (typeof b.itemId !== "number" || typeof b.owned !== "boolean")
		return NextResponse.json({ error: "Body debe tener {itemId: number, owned: boolean}" }, { status: 400 });

	try {
		await toggleOwned(session.id, b.itemId, b.owned, (b.isFullArt as boolean | undefined) ?? false);
		revalidatePath("/collection/pokemon");
		revalidatePath("/collection/trainers");
		revalidatePath("/collection/pokeballs");
		revalidatePath("/collection/energy");
		return NextResponse.json({ ok: true });
	} catch (err) {
		return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
	}
}
