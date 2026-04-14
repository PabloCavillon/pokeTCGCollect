'use client';

import { useEffect } from "react";

interface ErrorProps {
	error:  Error & { digest?: string };
	reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorProps) {
	useEffect(() => { console.error(error); }, [error]);

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
				<div style={{ fontSize: "64px", marginBottom: "16px" }}>💥</div>
				<h1 style={{ fontSize: "20px", fontWeight: 600, margin: "0 0 8px", color: "var(--color-text-primary)" }}>
					Algo salió mal
				</h1>
				<p style={{ fontSize: "14px", color: "var(--color-text-tertiary)", margin: "0 0 32px" }}>
					Ocurrió un error inesperado. Podés intentar de nuevo o volver más tarde.
				</p>
				<div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
					<button
						onClick={reset}
						style={{
							padding:      "10px 20px",
							borderRadius: "8px",
							border:       "1px solid var(--color-border-tertiary)",
							background:   "transparent",
							color:        "var(--color-text-primary)",
							fontWeight:   500,
							fontSize:     "14px",
							cursor:       "pointer",
						}}
					>
						Reintentar
					</button>
					<a
						href="/collection"
						style={{
							padding:        "10px 20px",
							borderRadius:   "8px",
							border:         "none",
							background:     "var(--color-text-primary)",
							color:          "var(--color-background-primary)",
							fontWeight:     600,
							fontSize:       "14px",
							cursor:         "pointer",
							textDecoration: "none",
						}}
					>
						Ir al inicio
					</a>
				</div>
			</div>
		</div>
	);
}
