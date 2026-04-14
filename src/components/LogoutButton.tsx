'use client';

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LogoutButton() {
	const router = useRouter();
	const [loading, setLoading] = useState(false);

	const handleLogout = async () => {
		setLoading(true);
		await fetch("/api/auth/logout", { method: "POST" });
		router.push("/auth/login");
		router.refresh();
	};

	return (
		<button
			onClick={handleLogout}
			disabled={loading}
			style={{
				padding:          "6px 14px",
				borderRadius:     "8px",
				border:           "1px solid var(--color-border-tertiary)",
				background:       "transparent",
				color:            "var(--color-text-tertiary)",
				fontSize:         "13px",
				cursor:           loading ? "wait" : "pointer",
				opacity:          loading ? 0.6 : 1,
				transition:       "all 0.2s ease",
				whiteSpace:       "nowrap",
			}}
		>
			Cerrar sesión
		</button>
	);
}
