import { prisma } from "@/db";

export interface CategoryProgress {
	category: string;
	total:    number;
	owned:    number;
	fullArt:  number;
}

export async function getProgress(userId: string): Promise<CategoryProgress[]> {
	const rows = await prisma.$queryRaw<CategoryProgress[]>`
		SELECT
			ci.category,
			COUNT(*)::int                                              AS total,
			COUNT(*) FILTER (WHERE c.owned = true)::int               AS owned,
			COUNT(*) FILTER (WHERE c.is_full_art = true)::int         AS "fullArt"
		FROM catalog_items ci
		LEFT JOIN collection c
			ON c.item_id = ci.id AND c.user_id = ${userId}
		GROUP BY ci.category
		ORDER BY ci.category
	`;
	return rows;
}

export interface CollectionItem {
	id:          number;
	slug:        string;
	name:        string;
	category:    string;
	variantOfId: number | null;
	variantType: string | null;
	spriteUrl:   string | null;
	region:      string | null;
	generation:  number | null;
	sortOrder:   number;
	owned:       boolean;
	isFullArt:   boolean;
}

export async function getItemsByCategory(
	userId:   string,
	category: string,
): Promise<CollectionItem[]> {
	const rows = await prisma.$queryRaw<CollectionItem[]>`
		SELECT
			ci.id,
			ci.slug,
			ci.name,
			ci.category,
			ci.variant_of_id  AS "variantOfId",
			ci.variant_type   AS "variantType",
			ci.sprite_url     AS "spriteUrl",
			ci.region,
			ci.generation,
			ci.sort_order     AS "sortOrder",
			COALESCE(c.owned, false)        AS owned,
			COALESCE(c.is_full_art, false)  AS "isFullArt"
		FROM catalog_items ci
		LEFT JOIN collection c
			ON c.item_id = ci.id AND c.user_id = ${userId}
		WHERE ci.category = ${category}
		ORDER BY ci.sort_order
	`;
	return rows;
}

export async function toggleOwned(
	userId:    string,
	itemId:    number,
	owned:     boolean,
	isFullArt: boolean = false,
): Promise<void> {
	await prisma.collection.upsert({
		where:  { userId_itemId: { userId, itemId } },
		update: { owned, isFullArt },
		create: { userId, itemId, owned, isFullArt },
	});
}

export interface CollectionItemWithVariants extends CollectionItem {
	variants: CollectionItem[];
}

export async function getPokemonGrouped(
	userId: string,
): Promise<CollectionItemWithVariants[]> {
	const all = await getItemsByCategory(userId, "pokemon");

	const bases    = all.filter((i) => i.variantOfId === null);
	const variants = all.filter((i) => i.variantOfId !== null);

	return bases.map((base) => ({
		...base,
		variants: variants.filter((v) => v.variantOfId === base.id),
	}));
}
