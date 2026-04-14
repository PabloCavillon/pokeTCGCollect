import CategoryTabs from "@/components/CategoryTabs";
import ToggleWrapper from "@/components/ToggleWrapper";
import { getSession } from "@/lib/auth";
import { getPokemonGrouped } from "@/lib/queries";
import { redirect } from "next/navigation";

export default async function PokemonPage() {
	const session = await getSession();
	if (!session) redirect("/auth/login");

	const items = await getPokemonGrouped(session.id);

	return (
		<main style={{
			maxWidth:      "800px",
			margin:        "0 auto",
			padding:       "32px 16px",
			display:       "flex",
			flexDirection: "column",
			gap:           "24px",
		}}>
			<h1 style={{ fontSize: "22px", fontWeight: 500, margin: 0 }}>Pokémon</h1>
			<CategoryTabs />
			<ToggleWrapper items={items} showGroups={true} />
		</main>
	);
}
