import { getSession } from "@/lib/auth";
import { getItemById } from "@/lib/queries";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
	_req: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	const session = await getSession();
	if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

	const { id } = await params;
	const itemId = parseInt(id, 10);
	if (isNaN(itemId)) return NextResponse.json({ error: "ID inválido" }, { status: 400 });

	const item = await getItemById(session.id, itemId);
	if (!item) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

	return NextResponse.json({ item });
}
