'use client';

import { CollectionItem, CollectionItemWithVariants } from "@/lib/queries";
import { ItemCard } from "./ItemCard";
import { useMemo, useState } from "react";

type FilterType = 'all' | 'owned' | 'missing' | 'fullart' | 'nofullart' | 'skipped';

interface ItemGridProps {
	items:       CollectionItem[] | CollectionItemWithVariants[];
	onToggle:    (itemId: number, owned: boolean, isFullArt: boolean) => Promise<void>;
	showGroups?: boolean;
}

const STATUS_FILTERS: { label: string; value: FilterType }[] = [
	{ label: "Todos",       value: "all"      },
	{ label: "Tengo",       value: "owned"    },
	{ label: "Falta",       value: "missing"  },
	{ label: "⭐ FA",       value: "fullart"  },
	{ label: "Sin FA",      value: "nofullart"},
	{ label: "No busco",    value: "skipped"  },
];

const GEN_NAMES: Record<number, string> = {
	1: "Gen I · Kanto",  2: "Gen II · Johto",  3: "Gen III · Hoenn",
	4: "Gen IV · Sinnoh", 5: "Gen V · Unova",  6: "Gen VI · Kalos",
	7: "Gen VII · Alola", 8: "Gen VIII · Galar", 9: "Gen IX · Paldea",
};

function applyFilter(item: CollectionItem, filter: FilterType): boolean {
	switch (filter) {
		case "owned":     return item.owned;
		case "missing":   return !item.owned && !item.skipped;
		case "fullart":   return item.isFullArt;
		case "nofullart": return item.owned && !item.isFullArt;
		case "skipped":   return item.skipped;
		default:          return true;
	}
}

const selectStyle: React.CSSProperties = {
	padding:         "5px 10px",
	borderRadius:    "8px",
	border:          "1px solid var(--color-border-tertiary)",
	background:      "var(--color-background-secondary)",
	color:           "var(--color-text-secondary)",
	fontSize:        "12px",
	cursor:          "pointer",
	outline:         "none",
	flexShrink:      0,
	appearance:      "none" as React.CSSProperties["appearance"],
	WebkitAppearance:"none" as React.CSSProperties["WebkitAppearance"],
	backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' fill='none'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23a1a1aa' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
	backgroundRepeat: "no-repeat",
	backgroundPosition: "right 8px center",
	paddingRight:    "26px",
};

const GRID: React.CSSProperties = {
	display:             "grid",
	gridTemplateColumns: "repeat(auto-fill, minmax(108px, 1fr))",
	gap:                 "8px",
};

export default function ItemGrid({ items, onToggle, showGroups = false }: ItemGridProps) {
	const [filter, setFilter] = useState<FilterType>("all");
	const [search, setSearch] = useState("");
	const [region, setRegion] = useState("all");
	const [gen,    setGen]    = useState<number | "all">("all");

	const allFlat: CollectionItem[] = useMemo(() => showGroups
		? (items as CollectionItemWithVariants[]).flatMap(b => [b, ...b.variants])
		: (items as CollectionItem[]),
	[items, showGroups]);

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

		if (showGroups) {
			const grouped = items as CollectionItemWithVariants[];
			const result: CollectionItem[] = [];
			for (const base of grouped) {
				const baseMatch  = query === "" || base.name.toLowerCase().includes(query);
				const baseFilter = applyFilter(base, filter);
				const baseGen    = gen === "all" || base.generation === gen;
				const baseReg    = region === "all" || base.region === null || base.region === region;

				const matchingVariants = base.variants.filter(v =>
					applyFilter(v, filter) &&
					(query === "" || v.name.toLowerCase().includes(query)) &&
					(region === "all" || v.region === region) &&
					(gen === "all" || v.generation === gen)
				);

				if ((baseMatch && baseFilter && baseGen && baseReg) || matchingVariants.length > 0)
					result.push(base);
				result.push(...matchingVariants);
			}
			return result;
		}

		return (items as CollectionItem[]).filter(item =>
			applyFilter(item, filter) &&
			(query === "" || item.name.toLowerCase().includes(query)) &&
			(region === "all" || item.region === region) &&
			(gen === "all" || item.generation === gen)
		);
	}, [items, filter, search, region, gen, showGroups]);

	const total   = allFlat.length;
	const owned   = allFlat.filter(i => i.owned).length;
	const missing = allFlat.filter(i => !i.owned && !i.skipped).length;
	const skipped = allFlat.filter(i => i.skipped).length;

	const hasRegions = regions.length > 0;
	const hasGens    = generations.length > 1;

	return (
		<div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

			{/* ── Sticky header ───────────────────────────────────── */}
			<div style={{
				position:      "sticky",
				top:           0,
				zIndex:        20,
				background:    "var(--color-background-primary)",
				marginLeft:    "-16px",
				marginRight:   "-16px",
				paddingLeft:   "16px",
				paddingRight:  "16px",
				paddingTop:    "10px",
				paddingBottom: "10px",
				display:       "flex",
				flexDirection: "column",
				gap:           "8px",
				borderBottom:  "1px solid var(--color-border-tertiary)",
			}}>
				{/* Search */}
				<input
					type="search"
					placeholder="Buscar..."
					value={search}
					onChange={e => setSearch(e.target.value)}
					style={{
						padding:      "9px 14px",
						borderRadius: "8px",
						border:       "1px solid var(--color-border-tertiary)",
						background:   "var(--color-background-secondary)",
						color:        "var(--color-text-primary)",
						fontSize:     "14px",
						outline:      "none",
						width:        "100%",
					}}
				/>

				{/* Status pills + dropdowns in one row */}
				<div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
					{/* Pills — scrollable */}
					<div style={{ display: "flex", gap: "5px", overflowX: "auto", flex: 1, paddingBottom: "2px" }}>
						{STATUS_FILTERS.map(f => {
							const active = filter === f.value;
							return (
								<button
									key={f.value}
									onClick={() => setFilter(f.value)}
									style={{
										padding:      "5px 12px",
										borderRadius: "999px",
										border:       `1px solid ${active ? "var(--color-text-primary)" : "var(--color-border-tertiary)"}`,
										background:   active ? "var(--color-text-primary)" : "transparent",
										color:        active ? "var(--color-background-primary)" : "var(--color-text-secondary)",
										fontSize:     "12px",
										cursor:       "pointer",
										whiteSpace:   "nowrap",
										flexShrink:   0,
										transition:   "all 0.15s ease",
									}}
								>
									{f.label}
								</button>
							);
						})}
					</div>

					{/* Dropdowns — fixed to the right */}
					{(hasRegions || hasGens) && (
						<div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
							{hasRegions && (
								<select
									value={region}
									onChange={e => setRegion(e.target.value)}
									style={selectStyle}
								>
									<option value="all">Región</option>
									{regions.map(r => (
										<option key={r} value={r}>{r}</option>
									))}
								</select>
							)}
							{hasGens && (
								<select
									value={gen}
									onChange={e => setGen(e.target.value === "all" ? "all" : Number(e.target.value))}
									style={selectStyle}
								>
									<option value="all">Gen</option>
									{generations.map(g => (
										<option key={g} value={g}>{GEN_NAMES[g] ?? `Gen ${g}`}</option>
									))}
								</select>
							)}
						</div>
					)}
				</div>
			</div>

			{/* Stats */}
			<div style={{ fontSize: "12px", color: "var(--color-text-tertiary)" }}>
				{owned} tengo · {missing} falta{skipped > 0 ? ` · ${skipped} no busco` : ""} · {total} total
			</div>

			{/* Grid */}
			{flat.length > 0 ? (
				<div style={GRID}>
					{flat.map(item => (
						<ItemCard key={item.id} item={item} onToggle={onToggle} />
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
