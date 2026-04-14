'use client';

import { CollectionItem } from "@/lib/queries";
import { useState } from "react";

interface ItemDetailProps {
	item: CollectionItem;
}

export default function ItemDetail({ item }: ItemDetailProps) {
	const [owned,     setOwned]     = useState(item.owned);
	const [isFullArt, setIsFullArt] = useState(item.isFullArt);
	const [skipped,   setSkipped]   = useState(item.skipped);
	const [loading,   setLoading]   = useState(false);

	const dexNumber = item.category === "pokemon"
		? Math.floor(item.sortOrder / 100)
		: null;

	const showRegion = !!item.region && item.variantOfId !== null;

	async function patch(body: object) {
		const res = await fetch("/api/collection", {
			method:  "PATCH",
			headers: { "Content-Type": "application/json" },
			body:    JSON.stringify({ itemId: item.id, ...body }),
		});
		if (!res.ok) throw new Error("Error al guardar");
	}

	const handleToggleOwned = async () => {
		if (loading) return;
		setLoading(true);
		const newOwned   = !owned;
		const newFullArt = newOwned ? isFullArt : false;
		const prevSkipped = skipped;
		setOwned(newOwned);
		setIsFullArt(newFullArt);
		if (newOwned && skipped) setSkipped(false);
		try {
			await patch({ owned: newOwned, isFullArt: newFullArt });
		} catch {
			setOwned(owned);
			setIsFullArt(isFullArt);
			setSkipped(prevSkipped);
		} finally {
			setLoading(false);
		}
	};

	const handleToggleFullArt = async () => {
		if (!owned || loading) return;
		setLoading(true);
		const newFullArt = !isFullArt;
		setIsFullArt(newFullArt);
		try {
			await patch({ owned, isFullArt: newFullArt });
		} catch {
			setIsFullArt(isFullArt);
		} finally {
			setLoading(false);
		}
	};

	const handleToggleSkip = async () => {
		if (loading) return;
		setLoading(true);
		const newSkipped = !skipped;
		setSkipped(newSkipped);
		try {
			await patch({ skipped: newSkipped });
		} catch {
			setSkipped(skipped);
		} finally {
			setLoading(false);
		}
	};

	const statusColor = skipped ? "#EF4444" : isFullArt ? "#F59E0B" : owned ? "#3B82F6" : "var(--color-border-tertiary)";

	return (
		<div style={{
			width:         "100%",
			maxWidth:      "480px",
			display:       "flex",
			flexDirection: "column",
			alignItems:    "center",
			gap:           "20px",
		}}>
			{/* Sprite card */}
			<div style={{
				width:        "100%",
				borderRadius: "20px",
				border:       `2px solid ${statusColor}`,
				background:   "var(--color-background-secondary)",
				display:      "flex",
				flexDirection:"column",
				alignItems:   "center",
				padding:      "32px 24px 28px",
				gap:          "12px",
				transition:   "border-color 0.2s ease",
				opacity:      loading ? 0.7 : 1,
			}}>
				{/* Dex number */}
				{dexNumber !== null && (
					<span style={{ fontSize: "13px", color: "var(--color-text-tertiary)", fontVariantNumeric: "tabular-nums" }}>
						#{String(dexNumber).padStart(4, "0")}
					</span>
				)}

				{/* Sprite */}
				{item.spriteUrl ? (
					<img
						src={item.spriteUrl}
						alt={item.name}
						width={160}
						height={160}
						style={{
							objectFit:  "contain",
							opacity:    skipped ? 0.3 : 1,
							transition: "opacity 0.2s ease",
							imageRendering: item.category === "pokemon" ? "pixelated" : "auto",
						}}
					/>
				) : (
					<div style={{
						width:           "160px",
						height:          "160px",
						borderRadius:    "16px",
						background:      "var(--color-background-tertiary)",
						display:         "flex",
						alignItems:      "center",
						justifyContent:  "center",
						fontSize:        "64px",
					}}>
						{item.category === "trainer"  ? "🧢" :
						 item.category === "pokeball" ? "⚪" :
						 item.category === "energy"   ? "⚡" : "❓"}
					</div>
				)}

				{/* Name */}
				<span style={{
					fontSize:   "22px",
					fontWeight: 600,
					textAlign:  "center",
					color:      "var(--color-text-primary)",
					lineHeight: 1.2,
				}}>
					{item.name}
				</span>

				{/* Region badge */}
				{showRegion && (
					<span style={{
						fontSize:     "12px",
						padding:      "3px 10px",
						borderRadius: "999px",
						background:   "rgba(59,130,246,0.12)",
						color:        "#3B82F6",
					}}>
						{item.region}
					</span>
				)}

				{/* Status label */}
				<span style={{
					fontSize:   "14px",
					fontWeight: 500,
					color:      statusColor,
				}}>
					{skipped ? "🚫 No buscar" : isFullArt ? "⭐ Full Art" : owned ? "✓ En la colección" : "Falta"}
				</span>
			</div>

			{/* Action buttons */}
			<div style={{ display: "flex", flexDirection: "column", gap: "10px", width: "100%" }}>

				{/* Toggle owned */}
				<button
					onClick={handleToggleOwned}
					disabled={loading}
					style={{
						padding:      "16px",
						borderRadius: "14px",
						border:       `1.5px solid ${owned && !skipped ? "#3B82F6" : "var(--color-border-tertiary)"}`,
						background:   owned && !skipped ? "rgba(59,130,246,0.1)" : "var(--color-background-secondary)",
						color:        owned && !skipped ? "#3B82F6" : "var(--color-text-primary)",
						fontSize:     "16px",
						fontWeight:   600,
						cursor:       loading ? "wait" : "pointer",
						transition:   "all 0.2s ease",
						width:        "100%",
					}}
				>
					{owned ? "✓ Tengo esta carta" : "Marcar como conseguida"}
				</button>

				{/* Toggle Full Art — only when owned */}
				{owned && !skipped && (
					<button
						onClick={handleToggleFullArt}
						disabled={loading}
						style={{
							padding:    "16px",
							borderRadius:"14px",
							border:     `1.5px solid ${isFullArt ? "#F59E0B" : "var(--color-border-tertiary)"}`,
							background: isFullArt ? "rgba(245,158,11,0.1)" : "var(--color-background-secondary)",
							color:      isFullArt ? "#F59E0B" : "var(--color-text-primary)",
							fontSize:   "16px",
							fontWeight: 600,
							cursor:     loading ? "wait" : "pointer",
							transition: "all 0.2s ease",
							width:      "100%",
						}}
					>
						{isFullArt ? "⭐ Full Art" : "Marcar como Full Art"}
					</button>
				)}

				{/* Toggle skip */}
				<button
					onClick={handleToggleSkip}
					disabled={loading}
					style={{
						padding:    "14px",
						borderRadius:"14px",
						border:     `1.5px solid ${skipped ? "rgba(239,68,68,0.5)" : "var(--color-border-tertiary)"}`,
						background: skipped ? "rgba(239,68,68,0.08)" : "transparent",
						color:      skipped ? "#EF4444" : "var(--color-text-tertiary)",
						fontSize:   "14px",
						fontWeight: 500,
						cursor:     loading ? "wait" : "pointer",
						transition: "all 0.2s ease",
						width:      "100%",
					}}
				>
					{skipped ? "↩ Volver a buscar" : "✕ No buscar esta carta"}
				</button>
			</div>
		</div>
	);
}
