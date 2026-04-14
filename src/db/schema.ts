import {
	pgTable,
	serial,
	text,
	integer,
	boolean,
	uuid,
	timestamp,
	unique,
	index,
	check,
} from "drizzle-orm/pg-core";
import { sql, relations } from "drizzle-orm";

export const catalogItems = pgTable(
	"catalog_items",
	{
		id:            serial("id").primaryKey(),
		slug:          text("slug").notNull().unique(),
		category:      text("category").notNull(),
		name:          text("name").notNull(),
		variantOfId:   integer("variant_of_id"),
		variantType:   text("variant_type"),
		source:        text("source").notNull().default("manual"),
		pokeapiFormId: integer("pokeapi_form_id"),
		spriteUrl:     text("sprite_url"),
		region:        text("region"),
		generation:    integer("generation"),
		sortOrder:     integer("sort_order").notNull().default(0),
		notes:         text("notes"),
		createdAt:     timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
		updatedAt:     timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
	},
	(t) => [
		check("category_check",
			sql`${t.category} IN ('pokemon', 'trainer', 'pokeball', 'energy')`
		),
		check("variant_type_check",
			sql`${t.variantType} IS NULL OR ${t.variantType} IN ('mega', 'gmax', 'regional', 'character', 'villain', 'shiny')`
		),
		check("source_check",
			sql`${t.source} IN ('pokeapi', 'manual')`
		),
		index("idx_catalog_category").on(t.category),
		index("idx_catalog_variant_of").on(t.variantOfId),
		index("idx_catalog_sort").on(t.category, t.sortOrder),
	],
);

export const catalogItemsRelations = relations(catalogItems, ({ one, many }) => ({
	variantOf: one(catalogItems, {
		fields:       [catalogItems.variantOfId],
		references:   [catalogItems.id],
		relationName: "variants",
	}),
	variants: many(catalogItems, {
		relationName: "variants",
	}),
	collectionEntries: many(collection),
}));

export const users = pgTable("users", {
	id:           uuid("id").primaryKey().defaultRandom(),
	name:         text("name"),
	email:        text("email").notNull().unique(),
	passwordHash: text("password_hash"),
	image:        text("image"),
	displayName:  text("display_name"),
	createdAt:    timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
	collection: many(collection),
}));

export const collection = pgTable(
	"collection",
	{
		id:        serial("id").primaryKey(),
		userId:    uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
		itemId:    integer("item_id").notNull().references(() => catalogItems.id, { onDelete: "cascade" }),
		owned:     boolean("owned").notNull().default(false),
		isFullArt: boolean("is_full_art").notNull().default(false),
		updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
	},
	(t) => [
		unique().on(t.userId, t.itemId),
		index("idx_collection_user").on(t.userId),
		index("idx_collection_owned").on(t.userId, t.owned),
	],
);

export const collectionRelations = relations(collection, ({ one }) => ({
	user: one(users, {
		fields:     [collection.userId],
		references: [users.id],
	}),
	item: one(catalogItems, {
		fields:     [collection.itemId],
		references: [catalogItems.id],
	}),
}));

export type CatalogItem    = typeof catalogItems.$inferSelect;
export type NewCatalogItem = typeof catalogItems.$inferInsert;
export type Collection     = typeof collection.$inferSelect;
export type User           = typeof users.$inferSelect;

export type Category    = "pokemon" | "trainer" | "pokeball" | "energy";
export type VariantType = "mega" | "gmax" | "regional" | "character" | "villain" | "shiny";
export type Source      = "pokeapi" | "manual";
