import { getSession } from "@/lib/auth";
import { getItemById } from "@/lib/queries";
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

	// Determine where the back button should go
	const backHref = `/collection/${item.category === "pokeball" ? "pokeballs" : item.category}`;

	return (
		<main style={{
			minHeight:     "100dvh",
			display:       "flex",
			flexDirection: "column",
			alignItems:    "center",
			padding:       "24px 16px 48px",
			gap:           "0",
		}}>
			{/* Back */}
			<div style={{ width: "100%", maxWidth: "480px", marginBottom: "16px" }}>
				<a
					href={backHref}
					style={{
						display:    "inline-flex",
						alignItems: "center",
						gap:        "6px",
						fontSize:   "14px",
						color:      "var(--color-text-secondary)",
						textDecoration: "none",
					}}
				>
					← Volver
				</a>
			</div>

			<ItemDetail item={item} />
		</main>
	);
}
