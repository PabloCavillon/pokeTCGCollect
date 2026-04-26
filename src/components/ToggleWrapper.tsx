'use client';

import { CollectionItem, CollectionItemWithVariants } from "@/lib/queries";
import { useCallback } from "react";
import ItemGrid from "./ItemGrid";

interface ToggleWrapperProps {
	items:       CollectionItem[] | CollectionItemWithVariants[];
	showGroups?: boolean;
}

export default function ToggleWrapper({ items, showGroups = false }: ToggleWrapperProps) {
	const handleToggle = useCallback(async (itemId: number, owned: boolean, isFullArt: boolean) => {
		await fetch("/api/collection", {
			method:  "PATCH",
			headers: { "Content-Type": "application/json" },
			body:    JSON.stringify({ itemId, owned, isFullArt }),
		});
	}, []);

	const handleSkip = useCallback(async (itemId: number, skipped: boolean) => {
		await fetch("/api/collection", {
			method:  "PATCH",
			headers: { "Content-Type": "application/json" },
			body:    JSON.stringify({ itemId, skipped }),
		});
	}, []);

	return (
		<ItemGrid
			items={items}
			onToggle={handleToggle}
			onSkip={handleSkip}
			showGroups={showGroups}
		/>
	);
}
