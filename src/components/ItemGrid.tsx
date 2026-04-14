'use client';

import { CollectionItem, CollectionItemWithVariants } from "@/lib/queries";
import { ItemCard } from "./ItemCard";
import { useMemo, useState } from "react";

type FilterType = 'all' | 'owned' | 'missing' | 'fullart' | 'nofullart';

interface ItemGridProps {
    items: CollectionItem[] | CollectionItemWithVariants[];
    onToggle: (itemId: number, owned: boolean, isFullArt: boolean) => Promise<void>;
    showGroups?: boolean;
}

const FilterButton = ({ label, active, onClick, }: {
    label: string; active: boolean; onClick: () => void;
}) => {
    return (
        <button
            onClick={onClick}
            style={{
                padding: "6px 14px",
                borderRadius: "999px",
                border: `1px solid ${active ? "var(--color-text-primary)" : "var(--color-border-tertiary)"}`,
                background: active ? "var(--color-text-primary)" : "transparent",
                color: active ? "var(--color-background-primary)" : "var(--color-text-secondary)",
                fontSize: "13px",
                cursor: "pointer",
                transition: "all 0.2s ease",
                whiteSpace: "nowrap",
            }}
        >
            {label}
        </button>
    );
}

function applyFilter(item: CollectionItem, filter: FilterType): boolean {
    switch (filter) {
        case "owned": return item.owned;
        case "missing": return !item.owned;
        case "fullart": return item.isFullArt;
        case "nofullart": return item.owned && !item.isFullArt;
        default: return true;
    }
}
export default function ItemGrid({ items, onToggle, showGroups = false }: ItemGridProps) {
    const [filter, setFilter] = useState<FilterType>("all");
    const [search, setSearch] = useState("");

    const FILTERS: { label: string; value: FilterType }[] = [
        { label: "Todos", value: "all" },
        { label: "Tengo", value: "owned" },
        { label: "Falta", value: "missing" },
        { label: "⭐ Full Art", value: "fullart" },
        { label: "Sin Full Art", value: "nofullart" },
    ];

    const filtered = useMemo(() => {
        const query = search.toLowerCase().trim();

        if (showGroups) {
            const grouped = items as CollectionItemWithVariants[];
            return grouped
                .map((base) => ({
                    ...base,
                    variants: base.variants.filter((v) =>
                        applyFilter(v, filter) &&
                        (query === "" || v.name.toLowerCase().includes(query))
                    ),
                }))
                .filter((base) =>
                    (applyFilter(base, filter) &&
                        (query === "" || base.name.toLowerCase().includes(query))) ||
                    base.variants.length > 0
                );
        }

        return (items as CollectionItem[]).filter((item) =>
            applyFilter(item, filter) &&
            (query === "" || item.name.toLowerCase().includes(query))
        );
    }, [items, filter, search, showGroups]);

    const total = items.length;
    const owned = items.filter((i) => i.owned).length;
    const missing = total - owned;

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

            <input
                type="search"
                placeholder="Buscar..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                    padding: "8px 14px",
                    borderRadius: "8px",
                    border: "1px solid var(--color-border-tertiary)",
                    background: "var(--color-background-secondary)",
                    color: "var(--color-text-primary)",
                    fontSize: "14px",
                    outline: "none",
                    width: "100%",
                }}
            />

            <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "4px" }}>
                {FILTERS.map((f) => (
                    <FilterButton
                        key={f.value}
                        label={f.label}
                        active={filter === f.value}
                        onClick={() => setFilter(f.value)}
                    />
                ))}
            </div>

            <div style={{ fontSize: "13px", color: "var(--color-text-tertiary)" }}>
                {owned} obtenidas · {missing} faltantes · {total} total
            </div>

            {showGroups ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                    {(filtered as CollectionItemWithVariants[]).map((base) => (
                        <div key={base.id}>
                            <div style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(auto-fill, minmax(96px, 1fr))",
                                gap: "8px",
                            }}>
                                <ItemCard item={base} onToggle={onToggle} />

                                {base.variants.map((variant) => (
                                    <ItemCard key={variant.id} item={variant} onToggle={onToggle} />
                                ))}
                            </div>

                            {base.variants.length > 0 && (
                                <div style={{
                                    marginTop: "16px",
                                    borderBottom: "1px solid var(--color-border-tertiary)",
                                }} />
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(96px, 1fr))",
                    gap: "8px",
                }}>
                    {(filtered as CollectionItem[]).map((item) => (
                        <ItemCard key={item.id} item={item} onToggle={onToggle} />
                    ))}
                </div>
            )}

            {filtered.length === 0 && (
                <div style={{
                    textAlign: "center",
                    padding: "48px 0",
                    color: "var(--color-text-tertiary)",
                    fontSize: "14px",
                }}>
                    No hay ítems que coincidan con el filtro.
                </div>
            )}

        </div>
    );
}