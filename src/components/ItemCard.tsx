'use client'

import { CollectionItem } from "@/lib/queries"
import { useState } from "react";

interface ItemCardProps {
    item: CollectionItem;
    onToggle: (itemId: number, owned: boolean, isFullArt: boolean) => Promise<void>;
}

export const ItemCard = ({ item, onToggle }: ItemCardProps) => {

    const [owned, setOwned] = useState<boolean>(item.owned);
    const [isFullArt, setIsFullArt] = useState<boolean>(item.isFullArt);
    const [loading, setLoading] = useState<boolean>(false)

    const handleToggleOwned = async () => {
        if (loading) return;
        setLoading(true);

        const newOwned = !owned;
        const newFullArt = newOwned ? isFullArt : false;

        setOwned(newOwned);
        setIsFullArt(newFullArt);

        try {
            await onToggle(item.id, newOwned, newFullArt);
        } catch {
            setOwned(owned);
            setIsFullArt(isFullArt)
        } finally {
            setLoading(false);
        }
    }

    const handleToggleFullArt = async (e: React.MouseEvent) => {
        e.stopPropagation();

        if (!owned || loading) return;
        setLoading(true);

        const newFullArt = !isFullArt;
        setIsFullArt(newFullArt);

        try {
            await onToggle(item.id, owned, newFullArt);
        } catch {
            setIsFullArt(isFullArt);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div
            onClick={handleToggleOwned}
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "8px",
                padding: "12px",
                borderRadius: "12px",
                border: `1.5px solid ${isFullArt ? "#F59E0B" :
                    owned ? "#3B82F6" :
                        "var(--color-border-tertiary)"
                    }`,
                background: owned
                    ? "var(--color-background-secondary)"
                    : "var(--color-background-primary)",
                cursor: loading ? "wait" : "pointer",
                opacity: loading ? 0.6 : 1,
                transition: "border-color 0.2s ease, opacity 0.2s ease",
                userSelect: "none",
                position: "relative",
            }}
        >
            <div style={{
                position: "absolute",
                top: "8px",
                right: "8px",
                fontSize: "14px",
                lineHeight: 1,
            }}>
                {isFullArt ? "⭐" : owned ? "✓" : ""}
            </div>

            {item.spriteUrl ? (
                <img
                    src={item.spriteUrl}
                    alt={item.name}
                    width={80}
                    height={80}
                    loading="lazy"
                    style={{
                        objectFit: "contain",
                        opacity: owned ? 1 : 0.35,
                        transition: "opacity 0.2s ease",
                    }}
                />
            ) : (
                <div style={{
                    width: "80px",
                    height: "80px",
                    borderRadius: "8px",
                    background: "var(--color-background-tertiary)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "28px",
                    opacity: owned ? 1 : 0.35,
                }}>
                    {item.category === "trainer" ? "🧢" :
                        item.category === "pokeball" ? "⚪" :
                            item.category === "energy" ? "⚡" : "❓"}
                </div>
            )}

            <span style={{
                fontSize: "12px",
                fontWeight: 500,
                textAlign: "center",
                color: owned
                    ? "var(--color-text-primary)"
                    : "var(--color-text-tertiary)",
                lineHeight: 1.3,
            }}>
                {item.name}
            </span>

            {owned && (
                <button
                    onClick={handleToggleFullArt}
                    style={{
                        fontSize: "11px",
                        padding: "3px 8px",
                        borderRadius: "999px",
                        border: `1px solid ${isFullArt ? "#F59E0B" : "var(--color-border-tertiary)"}`,
                        background: isFullArt ? "rgba(245, 158, 11, 0.15)" : "transparent",
                        color: isFullArt ? "#F59E0B" : "var(--color-text-tertiary)",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                    }}
                >
                    {isFullArt ? "⭐ Full Art" : "Full Art?"}
                </button>
            )}
        </div>
    )
}