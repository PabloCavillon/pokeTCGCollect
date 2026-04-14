import CategoryTabs from "@/components/CategoryTabs";
import ProgressBar from "@/components/ProgressBar";
import { auth } from "@/lib/auth";
import { getProgress } from "@/lib/queries";
import { redirect } from "next/navigation";

export default async function CollectionPage() {
    const session = await auth();
    if (!session?.user?.id) redirect('/api/auth/signin');

    const progress = await getProgress(session.user.id);

    return (

        <main style={{
            maxWidth: "800px",
            margin: "0 auto",
            padding: "32px 16px",
            display: "flex",
            flexDirection: "column",
            gap: "32px",
        }}>
            <div>
                <h1 style={{ fontSize: "22px", fontWeight: 500, marginBottom: "4px" }}>
                    Mi colección
                </h1>
                <p style={{ fontSize: "14px", color: "var(--color-text-tertiary)" }}>
                    Hola, {session.user.name ?? session.user.email}
                </p>
            </div>

            <ProgressBar progress={progress} />

            <CategoryTabs />

            <p style={{ fontSize: "14px", color: "var(--color-text-tertiary)", textAlign: "center" }}>
                Seleccioná una categoría para ver y editar tu colección.
            </p>
        </main>
    );
}