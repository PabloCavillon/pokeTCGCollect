import { catalogItems, collection, db } from "@/db";
import { and, eq, sql } from "drizzle-orm";

export interface CategoryProgress {
	category: string;
	total: number;
	owned: number;
	fullArt: number;
}

export async function getProgress(userId: string): Promise<CategoryProgress[]> {
	const rows = await db
		.select({
			category: catalogItems.category,
			total: sql<number>`COUNT(*)::int`,
			owned: sql<number>`COUNT(*) FILTER (WHERE ${collection.owned} = true)::int`,
			fullArt: sql<number>`COUNT(*) FILTER (WHERE ${collection.isFullArt} = true)::int`,
		})
		.from(catalogItems)
		.leftJoin(
			collection,
			and(
				eq(collection.itemId, catalogItems.id),
				eq(collection.userId, userId),
			),
		)
		.groupBy(catalogItems.category);

	return rows;
}

export interface CollectionItem {
	id: number;
	slug: string;
	name: string;
	category: string;
	variantOfId: number | null;
	variantType: string | null;
	spriteUrl: string | null;
	region: string | null;
	generation: number | null;
	sortOrder: number;
	owned: boolean;
	isFullArt: boolean;
}

export async function getItemsByCategory(
	userId: string,
	category: string,
): Promise<CollectionItem[]> {
	const rows = await db
		.select({
			id: catalogItems.id,
			slug: catalogItems.slug,
			name: catalogItems.name,
			category: catalogItems.category,
			variantOfId: catalogItems.variantOfId,
			variantType: catalogItems.variantType,
			spriteUrl: catalogItems.spriteUrl,
			region: catalogItems.region,
			generation: catalogItems.generation,
			sortOrder: catalogItems.sortOrder,
			owned: sql<boolean>`COALESCE(${collection.owned}, false)`,
			isFullArt: sql<boolean>`COALESCE(${collection.isFullArt}, false)`,
		})
		.from(catalogItems)
		.leftJoin(
			collection,
			and(
				eq(collection.itemId, catalogItems.id),
				eq(collection.userId, userId),
			),
		)
		.where(eq(catalogItems.category, category))
		.orderBy(catalogItems.sortOrder);

	return rows;
}

export async function toggleOwned(
	userId: string,
	itemId: number,
	owned: boolean,
	isFullArt: boolean = false,
): Promise<void> {
	await db
		.insert(collection)
		.values({ userId, itemId, owned, isFullArt })
		.onConflictDoUpdate({
			target: [collection.userId, collection.itemId],
			set: {
				owned,
				isFullArt,
				updatedAt: sql`NOW()`,
			},
		});
}

export interface CollectionItemWithVariants extends CollectionItem {
	variants: CollectionItem[];
}

export async function getPokemonGrouped(
	userId: string,
): Promise<CollectionItemWithVariants[]> {
	const all = await getItemsByCategory(userId, "pokemon");

	const bases = all.filter((i) => i.variantOfId === null);
	const variants = all.filter((i) => i.variantOfId !== null);

	return bases.map((base) => ({
		...base,
		variants: variants.filter((v) => v.variantOfId === base.id),
	}));
}
