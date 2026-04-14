import CategoryTabs from "@/components/CategoryTabs";
import ToggleWrapper from "@/components/ToggleWrapper";
import { getSession } from "@/lib/auth";
import { getItemsByCategory } from "@/lib/queries";
import { redirect } from "next/navigation";

export default async function PokeballsPage() {
	const session = await getSession();
	if (!session) redirect("/auth/login");

	const items = await getItemsByCategory(session.id, "pokeball");

	return (
		<main style={{
			maxWidth:      "800px",
			margin:        "0 auto",
			padding:       "32px 16px",
			display:       "flex",
			flexDirection: "column",
			gap:           "24px",
		}}>
			<h1 style={{ fontSize: "22px", fontWeight: 500, margin: 0 }}>Poké Balls</h1>
			<CategoryTabs />
			<ToggleWrapper items={items} />
		</main>
	);
}
