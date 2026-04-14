import Link from "next/link";

export default function NotFound() {
	return (
		<div style={{
			minHeight:      "100dvh",
			display:        "flex",
			alignItems:     "center",
			justifyContent: "center",
			padding:        "24px 16px",
			background:     "var(--color-background-primary)",
		}}>
			<div style={{ textAlign: "center", maxWidth: "340px" }}>
				<div style={{ fontSize: "72px", marginBottom: "8px" }}>⚪</div>
				<h1 style={{ fontSize: "72px", fontWeight: 700, margin: "0 0 8px", color: "var(--color-text-primary)" }}>
					404
				</h1>
				<p style={{ fontSize: "18px", fontWeight: 500, margin: "0 0 8px", color: "var(--color-text-primary)" }}>
					Página no encontrada
				</p>
				<p style={{ fontSize: "14px", color: "var(--color-text-tertiary)", margin: "0 0 32px" }}>
					Esta ruta escapó como un Pokémon salvaje.
				</p>
				<Link
					href="/collection"
					style={{
						display:       "inline-block",
						padding:       "10px 24px",
						borderRadius:  "8px",
						background:    "var(--color-text-primary)",
						color:         "var(--color-background-primary)",
						fontWeight:    600,
						fontSize:      "14px",
						textDecoration: "none",
					}}
				>
					Volver a la colección
				</Link>
			</div>
		</div>
	);
}
