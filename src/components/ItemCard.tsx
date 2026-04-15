'use client'

import { CollectionItem } from "@/lib/queries";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface ItemCardProps {
	item:     CollectionItem;
	onToggle: (itemId: number, owned: boolean, isFullArt: boolean) => Promise<void>;
}

export const ItemCard = ({ item, onToggle }: ItemCardProps) => {
	const router = useRouter();
	const [owned,    setOwned]    = useState(item.owned);
	const [isFullArt,setIsFullArt]= useState(item.isFullArt);
	const [skipped,  setSkipped]  = useState(item.skipped);
	const [loading,  setLoading]  = useState(false);

	const dexNumber = item.category === "pokemon"
		? Math.floor(item.sortOrder / 100)
		: null;

	const showRegion = !!item.region && item.variantOfId !== null;

	const handleCardClick = () => {
		router.push(`/collection/item/${item.id}`);
	};

	const handleToggleOwned = async (e: React.MouseEvent) => {
		e.stopPropagation();
		if (loading) return;
		setLoading(true);
		const newOwned   = !owned;
		const newFullArt = newOwned ? isFullArt : false;
		setOwned(newOwned);
		setIsFullArt(newFullArt);
		if (newOwned && skipped) setSkipped(false);
		try {
			await onToggle(item.id, newOwned, newFullArt);
		} catch {
			setOwned(owned);
			setIsFullArt(isFullArt);
		} finally {
			setLoading(false);
		}
	};

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
	};

	const borderColor = skipped
		? "var(--color-border-tertiary)"
		: isFullArt ? "#F59E0B"
		: owned     ? "#3B82F6"
		: "var(--color-border-tertiary)";

	return (
		<div
			onClick={handleCardClick}
			style={{
				display:        "flex",
				flexDirection:  "column",
				alignItems:     "center",
				gap:            "6px",
				padding:        "12px 10px",
				borderRadius:   "14px",
				border:         `1.5px solid ${borderColor}`,
				background:     owned && !skipped ? "var(--color-background-secondary)" : "var(--color-background-primary)",
				cursor:         loading ? "wait" : "pointer",
				opacity:        loading ? 0.6 : skipped ? 0.55 : 1,
				transition:     "border-color 0.2s ease, opacity 0.2s ease",
				userSelect:     "none",
				position:       "relative",
			}}
		>
			{/* Dex number — top left */}
			{dexNumber !== null && (
				<span style={{
					position:  "absolute",
					top:       "6px",
					left:      "7px",
					fontSize:  "9px",
					color:     "var(--color-text-tertiary)",
					lineHeight: 1,
					fontVariantNumeric: "tabular-nums",
				}}>
					#{String(dexNumber).padStart(4, "0")}
				</span>
			)}

			{/* Status icon — top right */}
			<span style={{ position: "absolute", top: "6px", right: "7px", fontSize: "12px", lineHeight: 1 }}>
				{skipped ? "🚫" : isFullArt ? "⭐" : owned ? "✓" : ""}
			</span>

			{/* Sprite */}
			{item.spriteUrl ? (
				<img
					src={item.spriteUrl}
					alt={item.name}
					width={84}
					height={84}
					loading="lazy"
					style={{
						objectFit:  "contain",
						opacity:    owned && !skipped ? 1 : 0.5,
						transition: "opacity 0.2s ease",
						marginTop:  dexNumber !== null ? "8px" : "0",
					}}
				/>
			) : (
				<div style={{
					width:          "84px",
					height:         "84px",
					borderRadius:   "10px",
					background:     "var(--color-background-tertiary)",
					display:        "flex",
					alignItems:     "center",
					justifyContent: "center",
					fontSize:       "30px",
					opacity:        owned && !skipped ? 1 : 0.5,
					marginTop:      dexNumber !== null ? "8px" : "0",
				}}>
					{item.category === "trainer"  ? "🧢" :
					 item.category === "pokeball" ? "⚪" :
					 item.category === "energy"   ? "⚡" : "❓"}
				</div>
			)}

			{/* Name */}
			<span style={{
				fontSize:   "11px",
				fontWeight: 500,
				textAlign:  "center",
				color:      owned && !skipped ? "var(--color-text-primary)" : "var(--color-text-tertiary)",
				lineHeight: 1.3,
			}}>
				{item.name}
			</span>

			{/* Region badge — only for regional variants */}
			{showRegion && (
				<span style={{
					fontSize:     "9px",
					padding:      "1px 5px",
					borderRadius: "999px",
					background:   "rgba(59,130,246,0.12)",
					color:        "#3B82F6",
					lineHeight:   1.4,
				}}>
					{item.region}
				</span>
			)}

			{/* Bottom buttons */}
			<div style={{ display: "flex", gap: "4px", alignItems: "center" }} onClick={e => e.stopPropagation()}>
				<button
					onClick={handleToggleOwned}
					title={owned ? "Quitar de la colección" : "Marcar como obtenido"}
					style={{
						fontSize:     "10px",
						padding:      "2px 7px",
						borderRadius: "999px",
						border:       `1px solid ${owned && !skipped ? "#3B82F6" : "var(--color-border-tertiary)"}`,
						background:   owned && !skipped ? "rgba(59,130,246,0.15)" : "transparent",
						color:        owned && !skipped ? "#3B82F6" : "var(--color-text-tertiary)",
						cursor:       "pointer",
						transition:   "all 0.2s ease",
						lineHeight:   1.4,
					}}
				>
					{owned && !skipped ? "✓ Obtenido" : "Obtenido"}
				</button>

				{owned && !skipped && (
					<button
						onClick={handleToggleFullArt}
						style={{
							fontSize:     "10px",
							padding:      "2px 6px",
							borderRadius: "999px",
							border:       `1px solid ${isFullArt ? "#F59E0B" : "var(--color-border-tertiary)"}`,
							background:   isFullArt ? "rgba(245,158,11,0.15)" : "transparent",
							color:        isFullArt ? "#F59E0B" : "var(--color-text-tertiary)",
							cursor:       "pointer",
							transition:   "all 0.2s ease",
						}}
					>
						{isFullArt ? "⭐ FA" : "FA?"}
					</button>
				)}
			</div>
		</div>
	);
};
