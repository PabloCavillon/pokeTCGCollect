import { getSession } from "@/lib/auth";
import { getItemById, getAdjacentItemIds } from "@/lib/queries";
import { redirect, notFound } from "next/navigation";
import ItemDetail from "@/components/ItemDetail";

export default async function ItemDetailPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const session = await getSession();
	if (!session) redirect("/auth/login");

	const { id } = await params;
	const itemId = parseInt(id, 10);
	if (isNaN(itemId)) notFound();

	const item = await getItemById(session.id, itemId);
	if (!item) notFound();

	const categoryPath: Record<string, string> = {
		pokemon:  "pokemon",
		trainer:  "trainers",
		pokeball: "pokeballs",
		energy:   "energy",
	};
	const backHref = `/collection/${categoryPath[item.category] ?? item.category}`;
	const { prevId, nextId } = await getAdjacentItemIds(item.category, item.sortOrder);

	return (
		<main style={{
			minHeight:     "100dvh",
			display:       "flex",
			flexDirection: "column",
			alignItems:    "center",
			padding:       "24px 16px 48px",
			gap:           "0",
		}}>
			<ItemDetail item={item} backHref={backHref} prevId={prevId} nextId={nextId} />
		</main>
	);
}
