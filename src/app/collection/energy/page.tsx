import CategoryTabs from "@/components/CategoryTabs";
import ToggleWrapper from "@/components/ToggleWrapper";
import { auth } from "@/lib/auth";
import { getItemsByCategory } from "@/lib/queries";
import { redirect } from "next/navigation";

export default async function EnergyPage() {
    const session = await auth();
    if (!session?.user?.id) redirect("/api/auth/signin");

    const items = await getItemsByCategory(session.user.id, "energy");

    return (
        <main style={{
            maxWidth: "800px",
            margin: "0 auto",
            padding: "32px 16px",
            display: "flex",
            flexDirection: "column",
            gap: "24px",
        }}>
            <h1 style={{ fontSize: "22px", fontWeight: 500 }}>Energías</h1>
            <CategoryTabs />
            <ToggleWrapper items={items} />
        </main>
    );
}