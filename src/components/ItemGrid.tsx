'use client';

import { CollectionItem, CollectionItemWithVariants } from "@/lib/queries";
import { ItemCard } from "./ItemCard";
import { useMemo, useState } from "react";

type FilterType = 'all' | 'owned' | 'missing' | 'fullart' | 'nofullart' | 'skipped';

interface ItemGridProps {
	items:       CollectionItem[] | CollectionItemWithVariants[];
	onToggle:    (itemId: number, owned: boolean, isFullArt: boolean) => Promise<void>;
	onSkip:      (itemId: number, skipped: boolean) => Promise<void>;
	showGroups?: boolean;
}

const FilterPill = ({ label, active, onClick }: {
	label: string; active: boolean; onClick: () => void;
}) => (
	<button
		onClick={onClick}
		style={{
			padding:      "6px 14px",
			borderRadius: "999px",
			border:       `1px solid ${active ? "var(--color-text-primary)" : "var(--color-border-tertiary)"}`,
			background:   active ? "var(--color-text-primary)" : "transparent",
			color:        active ? "var(--color-background-primary)" : "var(--color-text-secondary)",
			fontSize:     "13px",
			cursor:       "pointer",
			transition:   "all 0.15s ease",
			whiteSpace:   "nowrap",
			flexShrink:   0,
		}}
	>
		{label}
	</button>
);

function applyFilter(item: CollectionItem, filter: FilterType): boolean {
	switch (filter) {
		case "owned":    return item.owned;
		case "missing":  return !item.owned && !item.skipped;
		case "fullart":  return item.isFullArt;
		case "nofullart": return item.owned && !item.isFullArt;
		case "skipped":  return item.skipped;
		default:         return true;
	}
}

const GRID: React.CSSProperties = {
	display:             "grid",
	gridTemplateColumns: "repeat(auto-fill, minmax(96px, 1fr))",
	gap:                 "8px",
};

const STATUS_FILTERS: { label: string; value: FilterType }[] = [
	{ label: "Todos",        value: "all"      },
	{ label: "Tengo",        value: "owned"    },
	{ label: "Falta",        value: "missing"  },
	{ label: "⭐ Full Art",  value: "fullart"  },
	{ label: "Sin Full Art", value: "nofullart"},
	{ label: "No busco",     value: "skipped"  },
];

const GEN_NAMES: Record<number, string> = {
	1: "Gen I · Kanto",
	2: "Gen II · Johto",
	3: "Gen III · Hoenn",
	4: "Gen IV · Sinnoh",
	5: "Gen V · Unova",
	6: "Gen VI · Kalos",
	7: "Gen VII · Alola",
	8: "Gen VIII · Galar",
	9: "Gen IX · Paldea",
};

export default function ItemGrid({ items, onToggle, onSkip, showGroups = false }: ItemGridProps) {
	const [filter,    setFilter]    = useState<FilterType>("all");
	const [search,    setSearch]    = useState("");
	const [region,    setRegion]    = useState("all");
	const [gen,       setGen]       = useState<number | "all">("all");

	// Flatten all items (including variants) for stats and filter extraction
	const allFlat: CollectionItem[] = useMemo(() => showGroups
		? (items as CollectionItemWithVariants[]).flatMap(b => [b, ...b.variants])
		: (items as CollectionItem[]),
	[items, showGroups]);

	// Unique regions and generations present in the data
	const regions = useMemo(() => {
		const set = new Set<string>();
		allFlat.forEach(i => { if (i.region) set.add(i.region); });
		return Array.from(set).sort();
	}, [allFlat]);

	const generations = useMemo(() => {
		const set = new Set<number>();
		allFlat.forEach(i => { if (i.generation != null) set.add(i.generation); });
		return Array.from(set).sort((a, b) => a - b);
	}, [allFlat]);

	const flat = useMemo((): CollectionItem[] => {
		const query = search.toLowerCase().trim();

		let pool: CollectionItem[];

		if (showGroups) {
			const grouped = items as CollectionItemWithVariants[];
			const result: CollectionItem[] = [];
			for (const base of grouped) {
				const baseMatch   = query === "" || base.name.toLowerCase().includes(query);
				const baseFilter  = applyFilter(base, filter);
				const baseRegion  = region === "all" || base.region === region || (region !== "all" && base.variantOfId === null && base.region === null);
				const baseGen     = gen === "all" || base.generation === gen;

				const matchingVariants = base.variants.filter(v =>
					applyFilter(v, filter) &&
					(query === "" || v.name.toLowerCase().includes(query)) &&
					(region === "all" || v.region === region) &&
					(gen === "all" || v.generation === gen)
				);

				const showBase = baseMatch && baseFilter && baseGen &&
					(region === "all" || base.region === null || base.region === region);

				if (showBase || matchingVariants.length > 0) result.push(base);
				result.push(...matchingVariants);
			}
			pool = result;
		} else {
			pool = (items as CollectionItem[]).filter(item =>
				applyFilter(item, filter) &&
				(query === "" || item.name.toLowerCase().includes(query)) &&
				(region === "all" || item.region === region) &&
				(gen === "all" || item.generation === gen)
			);
		}

		return pool;
	}, [items, filter, search, region, gen, showGroups]);

	const total   = allFlat.length;
	const owned   = allFlat.filter(i => i.owned).length;
	const missing = allFlat.filter(i => !i.owned && !i.skipped).length;
	const skipped = allFlat.filter(i => i.skipped).length;

	return (
		<div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

			{/* ── Sticky header ─────────────────────────────────────── */}
			<div style={{
				position:        "sticky",
				top:             0,
				zIndex:          20,
				background:      "var(--color-background-primary)",
				paddingTop:      "8px",
				paddingBottom:   "8px",
				display:         "flex",
				flexDirection:   "column",
				gap:             "8px",
				borderBottom:    "1px solid var(--color-border-tertiary)",
				marginLeft:      "-16px",
				marginRight:     "-16px",
				paddingLeft:     "16px",
				paddingRight:    "16px",
			}}>
				{/* Search */}
				<input
					type="search"
					placeholder="Buscar..."
					value={search}
					onChange={e => setSearch(e.target.value)}
					style={{
						padding:      "10px 14px",
						borderRadius: "8px",
						border:       "1px solid var(--color-border-tertiary)",
						background:   "var(--color-background-secondary)",
						color:        "var(--color-text-primary)",
						fontSize:     "14px",
						outline:      "none",
						width:        "100%",
					}}
				/>

				{/* Status filters */}
				<div style={{ display: "flex", gap: "6px", overflowX: "auto", paddingBottom: "2px" }}>
					{STATUS_FILTERS.map(f => (
						<FilterPill key={f.value} label={f.label} active={filter === f.value} onClick={() => setFilter(f.value)} />
					))}
				</div>

				{/* Region filter — only if data has regions */}
				{regions.length > 0 && (
					<div style={{ display: "flex", gap: "6px", overflowX: "auto", paddingBottom: "2px" }}>
						<FilterPill label="Todas las regiones" active={region === "all"} onClick={() => setRegion("all")} />
						{regions.map(r => (
							<FilterPill key={r} label={r} active={region === r} onClick={() => setRegion(r)} />
						))}
					</div>
				)}

				{/* Generation filter — only if data has generations */}
				{generations.length > 1 && (
					<div style={{ display: "flex", gap: "6px", overflowX: "auto", paddingBottom: "2px" }}>
						<FilterPill label="Todas las gens" active={gen === "all"} onClick={() => setGen("all")} />
						{generations.map(g => (
							<FilterPill key={g} label={GEN_NAMES[g] ?? `Gen ${g}`} active={gen === g} onClick={() => setGen(g)} />
						))}
					</div>
				)}
			</div>

			{/* Stats */}
			<div style={{ fontSize: "13px", color: "var(--color-text-tertiary)" }}>
				{owned} tengo · {missing} falta · {skipped > 0 ? `${skipped} no busco · ` : ""}{total} total
			</div>

			{/* Grid */}
			{flat.length > 0 ? (
				<div style={GRID}>
					{flat.map(item => (
						<ItemCard key={item.id} item={item} onToggle={onToggle} onSkip={onSkip} />
					))}
				</div>
			) : (
				<div style={{ textAlign: "center", padding: "48px 0", color: "var(--color-text-tertiary)", fontSize: "14px" }}>
					No hay ítems que coincidan con el filtro.
				</div>
			)}

		</div>
	);
}
