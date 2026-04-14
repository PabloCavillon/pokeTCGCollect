import CategoryTabs from "@/components/CategoryTabs";
import ProgressBar from "@/components/ProgressBar";
import LogoutButton from "@/components/LogoutButton";
import { getSession } from "@/lib/auth";
import { getProgress } from "@/lib/queries";
import { redirect } from "next/navigation";

export default async function CollectionPage() {
	const session = await getSession();
	if (!session) redirect("/auth/login");

	const progress = await getProgress(session.id);

	return (
		<main style={{
			maxWidth:       "800px",
			margin:         "0 auto",
			padding:        "32px 16px",
			display:        "flex",
			flexDirection:  "column",
			gap:            "32px",
		}}>
			<div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
				<div>
					<h1 style={{ fontSize: "22px", fontWeight: 500, marginBottom: "4px", margin: 0 }}>
						Mi colección
					</h1>
					<p style={{ fontSize: "14px", color: "var(--color-text-tertiary)", margin: "4px 0 0" }}>
						Hola, {session.name ?? session.email}
					</p>
				</div>
				<LogoutButton />
			</div>

			<ProgressBar progress={progress} />
			<CategoryTabs />

			<p style={{ fontSize: "14px", color: "var(--color-text-tertiary)", textAlign: "center" }}>
				Seleccioná una categoría para ver y editar tu colección.
			</p>
		</main>
	);
}
