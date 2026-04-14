'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
	const router = useRouter();
	const [email,    setEmail]    = useState("");
	const [password, setPassword] = useState("");
	const [error,    setError]    = useState<string | null>(null);
	const [loading,  setLoading]  = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);
		setLoading(true);

		const res = await fetch("/api/auth/login", {
			method:  "POST",
			headers: { "Content-Type": "application/json" },
			body:    JSON.stringify({ email, password }),
		});

		if (res.ok) {
			router.push("/collection");
			router.refresh();
		} else {
			const data = await res.json().catch(() => ({}));
			setError(data.error ?? "Error al iniciar sesión");
			setLoading(false);
		}
	};

	return (
		<div style={{
			minHeight:      "100dvh",
			display:        "flex",
			alignItems:     "center",
			justifyContent: "center",
			padding:        "24px 16px",
			background:     "var(--color-background-primary)",
		}}>
			<div style={{
				width:         "100%",
				maxWidth:      "380px",
				display:       "flex",
				flexDirection: "column",
				gap:           "32px",
			}}>
				{/* Header */}
				<div style={{ textAlign: "center" }}>
					<div style={{ fontSize: "48px", marginBottom: "12px" }}>🃏</div>
					<h1 style={{ fontSize: "22px", fontWeight: 600, margin: "0 0 6px" }}>
						Mi Colección TCG
					</h1>
					<p style={{ fontSize: "14px", color: "var(--color-text-tertiary)", margin: 0 }}>
						Ingresá para ver tu colección
					</p>
				</div>

				{/* Form */}
				<form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
					<div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
						<label style={{ fontSize: "13px", fontWeight: 500, color: "var(--color-text-secondary)" }}>
							Email
						</label>
						<input
							type="email"
							required
							autoComplete="email"
							value={email}
							onChange={e => setEmail(e.target.value)}
							placeholder="tu@email.com"
							style={inputStyle}
						/>
					</div>

					<div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
						<label style={{ fontSize: "13px", fontWeight: 500, color: "var(--color-text-secondary)" }}>
							Contraseña
						</label>
						<input
							type="password"
							required
							autoComplete="current-password"
							value={password}
							onChange={e => setPassword(e.target.value)}
							placeholder="••••••••"
							style={inputStyle}
						/>
					</div>

					{error && (
						<div style={{
							padding:      "10px 14px",
							borderRadius: "8px",
							background:   "rgba(239, 68, 68, 0.1)",
							border:       "1px solid rgba(239, 68, 68, 0.3)",
							color:        "#EF4444",
							fontSize:     "13px",
						}}>
							{error}
						</div>
					)}

					<button
						type="submit"
						disabled={loading}
						style={{
							...btnPrimary,
							opacity: loading ? 0.7 : 1,
							cursor:  loading ? "wait" : "pointer",
						}}
					>
						{loading ? "Ingresando…" : "Ingresar"}
					</button>
				</form>

				{/* Footer */}
				<p style={{ textAlign: "center", fontSize: "13px", color: "var(--color-text-tertiary)", margin: 0 }}>
					¿No tenés cuenta?{" "}
					<Link href="/auth/register" style={{ color: "var(--color-text-primary)", fontWeight: 500 }}>
						Registrate
					</Link>
				</p>
			</div>
		</div>
	);
}

const inputStyle: React.CSSProperties = {
	padding:      "10px 14px",
	borderRadius: "8px",
	border:       "1px solid var(--color-border-tertiary)",
	background:   "var(--color-background-secondary)",
	color:        "var(--color-text-primary)",
	fontSize:     "15px",
	outline:      "none",
	width:        "100%",
};

const btnPrimary: React.CSSProperties = {
	padding:       "11px",
	borderRadius:  "8px",
	border:        "none",
	background:    "var(--color-text-primary)",
	color:         "var(--color-background-primary)",
	fontSize:      "15px",
	fontWeight:    600,
	cursor:        "pointer",
	transition:    "opacity 0.2s ease",
	width:         "100%",
};
