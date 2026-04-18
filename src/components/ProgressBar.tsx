'use client';

import { CategoryProgress } from "@/lib/queries";

interface ProgressBarProps {
    progress: CategoryProgress[];
}

const CATEGORY_LABEL: Record<string, string> = {
    pokemon: 'Pokémon',
    trainer: 'Entrenadores',
    pokeball: 'Poké Balls',
    energy: 'Energías'
}

const Bar = ({ owned, fullArt, total }: { owned: number, fullArt: number, total: number }) => {

    if (total === 0) return null;

    const fullArtPct = Math.round((fullArt / total) * 100);
    const nonFullArtPct = Math.round(((owned - fullArt) / total) * 100);

    return (
        <div style={{
            height: "8px",
            borderRadius: "999px",
            background: "var(--color-background-tertiary)",
            overflow: "hidden",
            display: "flex",
        }}>
            <div style={{
                height: "100%",
                width: `${fullArtPct}%`,
                background: "#F59E0B",
                transition: "width 0.4s ease",
            }} />
            <div style={{
                height: "100%",
                width: `${nonFullArtPct}%`,
                background: "#3B82F6",
                transition: "width 0.4s ease",
            }} />
        </div>
    )
}

const Legend = () => {
    return (
        <div style={{
            display: "flex",
            gap: "16px",
            fontSize: "11px",
            color: "var(--color-text-tertiary)",
        }}>
            <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                <span style={{ width: "10px", height: "10px", borderRadius: "2px", background: "#F59E0B", display: "inline-block" }} />
                Full art
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                <span style={{ width: "10px", height: "10px", borderRadius: "2px", background: "#3B82F6", display: "inline-block" }} />
                Tengo (no full art)
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                <span style={{ width: "10px", height: "10px", borderRadius: "2px", background: "var(--color-background-tertiary)", border: "1px solid var(--color-border-tertiary)", display: "inline-block" }} />
                Falta
            </span>
        </div>
    );
}

export default function ProgressBar({ progress }: ProgressBarProps) {
    const totalSkipped  = progress.reduce((acc, p) => acc + p.skipped, 0);
    const totalItems    = progress.reduce((acc, p) => acc + p.total, 0) - totalSkipped;
    const totalOwned    = progress.reduce((acc, p) => acc + p.owned, 0);
    const totalFullArt  = progress.reduce((acc, p) => acc + p.fullArt, 0);
    const missing       = totalItems - totalOwned;
    const nonFullArt    = totalOwned - totalFullArt;

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

            <Legend />

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: "4px 12px",
                    fontSize: "13px",
                    color: "var(--color-text-secondary)",
                }}>
                    <span style={{ fontWeight: 500, color: "var(--color-text-primary)" }}>
                        Total
                    </span>
                    <span style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                        <span style={{ color: "#F59E0B" }}>{totalFullArt} full art</span>
                        <span style={{ color: "#3B82F6" }}>{nonFullArt} sin full art</span>
                        <span>{missing} faltan</span>
                    </span>
                </div>
                <Bar owned={totalOwned} fullArt={totalFullArt} total={totalItems} />
            </div>

            {progress.map((p) => {
                const nonFA      = p.owned - p.fullArt;
                const activeTotal = p.total - p.skipped;
                const falta      = activeTotal - p.owned;

                return (
                    <div key={p.category} style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        <div style={{
                            display: "flex",
                            justifyContent: "space-between",
                            flexWrap: "wrap",
                            gap: "4px 12px",
                            fontSize: "13px",
                            color: "var(--color-text-secondary)",
                        }}>
                            <span style={{ fontWeight: 500, color: "var(--color-text-primary)" }}>
                                {CATEGORY_LABEL[p.category] ?? p.category}
                            </span>
                            <span style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                                <span style={{ color: "#F59E0B" }}>{p.fullArt} full art</span>
                                <span style={{ color: "#3B82F6" }}>{nonFA} sin full art</span>
                                <span>{falta} faltan</span>
                            </span>
                        </div>
                        <Bar owned={p.owned} fullArt={p.fullArt} total={activeTotal} />
                    </div>
                );
            })}

        </div>
    );
}