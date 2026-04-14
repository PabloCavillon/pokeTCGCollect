// src/lib/sync.ts
// Toma los datos de pokeapi.ts y los inserta en catalog_items.
// Es idempotente: podés correrlo N veces sin duplicar datos.

import { sql, eq } from "drizzle-orm";
import {
	getAllSpecies,
	getAllFormsForSpecies,
	type NormalizedForm,
	type VariantTypeFromApi,
} from "./pokeapi";
import { catalogItems, db } from "@/db";

// ============================================================
// TIPOS
// ============================================================

export interface SyncResult {
	species: number;
	forms: number;
	skipped: number;
	errors: string[];
}

// ============================================================
// HELPERS
// ============================================================

// Convierte el VariantTypeFromApi al valor que acepta tu schema
function toSchemaVariantType(
	vt: VariantTypeFromApi | null,
): "mega" | "gmax" | "regional" | "character" | "villain" | "shiny" | null {
	if (!vt) return null;
	// "battle" y "cosmetic" no tienen valor propio en el schema todavía,
	// los guardamos como null para clasificar manualmente después.
	if (vt === "battle" || vt === "cosmetic") return null;
	return vt; // mega | gmax | regional pasan directo
}

const GENERATION_REGION: Record<number, string> = {
	1: "Kanto",
	2: "Johto",
	3: "Hoenn",
	4: "Sinnoh",
	5: "Unova",
	6: "Kalos",
	7: "Alola",
	8: "Galar",
	9: "Paldea",
};

function inferRegion(formName: string): string | null {
	if (formName.includes("alola")) return "Alola";
	if (formName.includes("galar")) return "Galar";
	if (formName.includes("hisui")) return "Hisui";
	if (formName.includes("paldea")) return "Paldea";
	return null;
}

// ============================================================
// SYNC DE UNA ESPECIE
// ============================================================

async function syncSpecies(
	speciesName: string,
	speciesPokeapiId: number,
	generation: number,
	forms: NormalizedForm[],
): Promise<{ inserted: number; skipped: number }> {
	const defaultForm = forms.find((f) => f.isDefault) ?? forms[0];
	if (!defaultForm) return { inserted: 0, skipped: 0 };

	// Insertar forma base
	const baseResult = await db
		.insert(catalogItems)
		.values({
			slug: speciesName,
			category: "pokemon",
			name: defaultForm.displayName.split(" ")[0],
			variantOfId: null,
			variantType: null,
			source: "pokeapi",
			pokeapiFormId: defaultForm.pokeapiFormId,
			spriteUrl: defaultForm.spriteUrl,
			generation,
			region: GENERATION_REGION[generation] ?? null,
			sortOrder: speciesPokeapiId * 100,
			notes: null,
		})
		.onConflictDoNothing()
		.returning({ id: catalogItems.id });

	// Si ya existía, buscar su id
	let baseId: number;

	if (baseResult.length > 0) {
		baseId = baseResult[0].id;
	} else {
		const existing = await db.query.catalogItems.findFirst({
			where: eq(catalogItems.slug, speciesName),
			columns: { id: true },
		});
		if (!existing) return { inserted: 0, skipped: 1 };
		baseId = existing.id;
	}

	let inserted = baseResult.length > 0 ? 1 : 0;
	let skipped = baseResult.length === 0 ? 1 : 0;

	// Insertar variantes
	const variants = forms.filter((f) => !f.isDefault);

	for (const [index, form] of variants.entries()) {
		const result = await db
			.insert(catalogItems)
			.values({
				slug: form.name,
				category: "pokemon",
				name: form.displayName,
				variantOfId: baseId,
				variantType: toSchemaVariantType(form.variantType),
				source: "pokeapi",
				pokeapiFormId: form.pokeapiFormId,
				spriteUrl: form.spriteUrl,
				generation: form.generation,
				region: inferRegion(form.formName),
				sortOrder: speciesPokeapiId * 100 + index + 1,
				notes: null,
			})
			.onConflictDoNothing()
			.returning({ id: catalogItems.id });

		if (result.length > 0) {
			inserted++;
		} else {
			skipped++;
		}
	}

	return { inserted, skipped };
}

// ============================================================
// SYNC PRINCIPAL
// ============================================================

export async function syncAllPokemon(): Promise<SyncResult> {
	const result: SyncResult = {
		species: 0,
		forms: 0,
		skipped: 0,
		errors: [],
	};

	console.log("→ Fetching species list from PokéAPI...");
	const allSpecies = await getAllSpecies();
	console.log(`→ Found ${allSpecies.length} species. Starting sync...`);

	for (const species of allSpecies) {
		try {
			const forms = await getAllFormsForSpecies(species);

			const { inserted, skipped } = await syncSpecies(
				species.name,
				species.pokeapiId,
				species.generation,
				forms,
			);

			result.species++;
			result.forms += inserted;
			result.skipped += skipped;

			if (result.species % 50 === 0) {
				console.log(
					`  ${result.species}/${allSpecies.length} species — ` +
						`${result.forms} inserted, ${result.skipped} skipped`,
				);
			}
		} catch (err) {
			const message = err instanceof Error ? err.message : String(err);
			result.errors.push(`${species.name}: ${message}`);
			console.error(`  ✗ ${species.name}: ${message}`);
		}
	}

	// Linkear variantes manuales del seed a su especie base
	await linkManualVariants();

	console.log("→ Sync complete:", result);
	return result;
}

// ============================================================
// LINKEAR VARIANTES MANUALES
// ============================================================

async function linkManualVariants() {
	const manualVariants: Array<{ slug: string; baseSlug: string }> = [
		{ slug: "pikachu-ash", baseSlug: "pikachu" },
		{ slug: "meowth-rocket", baseSlug: "meowth" },
		{ slug: "mewtwo-armored", baseSlug: "mewtwo" },
	];

	for (const { slug, baseSlug } of manualVariants) {
		const base = await db.query.catalogItems.findFirst({
			where: eq(catalogItems.slug, baseSlug),
			columns: { id: true },
		});

		if (!base) continue;

		await db
			.update(catalogItems)
			.set({ variantOfId: base.id })
			.where(sql`slug = ${slug} AND variant_of_id IS NULL`);
	}
}
