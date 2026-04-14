import { syncAllPokemon } from "@/lib/sync";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
	const secret = req.headers.get("x-sync-secret");
	if (secret !== process.env.SYNC_SECRET) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		console.log("Sync started");
		const result = await syncAllPokemon();
		return NextResponse.json({
			ok: true,
			species: result.species,
			forms: result.forms,
			skipped: result.skipped,
			errors: result.errors,
		});
	} catch (err) {
		const message = err instanceof Error ? err.message : String(err);
		console.error("Sync failed:", message);
		return NextResponse.json(
			{ ok: false, error: message },
			{ status: 500 },
		);
	}
}
