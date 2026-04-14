'use client';

import { usePathname, useRouter } from "next/navigation";

interface Tab {
	label: string;
	href:  string;
	emoji: string;
}

const TABS: Tab[] = [
	{ label: "Pokémon",       href: "/collection/pokemon",   emoji: "🔴" },
	{ label: "Entrenadores",  href: "/collection/trainers",  emoji: "🧢" },
	{ label: "Poké Balls",    href: "/collection/pokeballs", emoji: "⚪" },
	{ label: "Energías",      href: "/collection/energy",    emoji: "⚡" },
];

export default function CategoryTabs() {
	const router   = useRouter();
	const pathname = usePathname();

	const isSubPage = pathname !== "/collection";

	return (
		<nav style={{
			display:      "flex",
			gap:          "4px",
			borderBottom: "1px solid var(--color-border-tertiary)",
			overflowX:    "auto",
		}}>
			{/* Home link — only on sub-pages */}
			{isSubPage && (
				<button
					onClick={() => router.push("/collection")}
					title="Volver al inicio"
					style={{
						display:      "flex",
						alignItems:   "center",
						padding:      "10px 14px",
						fontSize:     "18px",
						background:   "transparent",
						border:       "none",
						borderBottom: "2px solid transparent",
						cursor:       "pointer",
						color:        "var(--color-text-tertiary)",
						marginBottom: "-1px",
						flexShrink:   0,
					}}
				>
					🏠
				</button>
			)}

			{TABS.map((tab) => {
				const isActive = pathname.startsWith(tab.href);
				return (
					<button
						key={tab.href}
						onClick={() => router.push(tab.href)}
						style={{
							display:      "flex",
							alignItems:   "center",
							gap:          "6px",
							padding:      "10px 16px",
							fontSize:     "14px",
							fontWeight:   isActive ? 500 : 400,
							color:        isActive ? "var(--color-text-primary)" : "var(--color-text-tertiary)",
							background:   "transparent",
							border:       "none",
							borderBottom: isActive
								? "2px solid var(--color-text-primary)"
								: "2px solid transparent",
							cursor:       "pointer",
							whiteSpace:   "nowrap",
							transition:   "color 0.2s ease, border-color 0.2s ease",
							marginBottom: "-1px",
							flexShrink:   0,
						}}
					>
						<span style={{ fontSize: "16px" }}>{tab.emoji}</span>
						{tab.label}
					</button>
				);
			})}
		</nav>
	);
}
