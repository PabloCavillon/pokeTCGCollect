import CategoryTabs from "@/components/CategoryTabs";
import ItemGrid from "@/components/ItemGrid";
import ToggleWrapper from "@/components/ToggleWrapper";
import { auth } from "@/lib/auth";
import { getPokemonGrouped } from "@/lib/queries";
import { redirect } from "next/navigation";

export default async function PokemonPage() {

    const session = await auth();
    if (!session?.user?.id) redirect('/api/auth/signin');

    const items = await getPokemonGrouped(session.user.id);

    return (
        <main style={{
            maxWidth: "800px",
            margin: "0 auto",
            padding: "32px 16px",
            display: "flex",
            flexDirection: "column",
            gap: "24px",
        }}>
            <h1 style={{ fontSize: "22px", fontWeight: 500 }}>Pokémon</h1>
            <CategoryTabs />
            <ToggleWrapper items={items} showGroups={true} />
        </main>
    );
}