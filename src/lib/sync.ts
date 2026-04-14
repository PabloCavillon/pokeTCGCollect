import { prisma } from "@/db";
import {
	getAllSpecies,
	getAllFormsForSpecies,
	type NormalizedForm,
	type VariantTypeFromApi,
} from "./pokeapi";

export interface SyncResult {
	species: number;
	forms:   number;
	skipped: number;
	errors:  string[];
}

function toSchemaVariantType(
	vt: VariantTypeFromApi | null,
): "mega" | "gmax" | "regional" | "character" | "villain" | "shiny" | null {
	if (!vt) return null;
	if (vt === "battle" || vt === "cosmetic") return null;
	return vt;
}

const GENERATION_REGION: Record<number, string> = {
	1: "Kanto", 2: "Johto",  3: "Hoenn",
	4: "Sinnoh", 5: "Unova", 6: "Kalos",
	7: "Alola",  8: "Galar", 9: "Paldea",
};

function inferRegion(formName: string): string | null {
	if (formName.includes("alola"))  return "Alola";
	if (formName.includes("galar"))  return "Galar";
	if (formName.includes("hisui"))  return "Hisui";
	if (formName.includes("paldea")) return "Paldea";
	return null;
}

async function syncSpecies(
	speciesName:     string,
	speciesPokeapiId: number,
	generation:      number,
	forms:           NormalizedForm[],
): Promise<{ inserted: number; skipped: number }> {
	const defaultForm = forms.find((f) => f.isDefault) ?? forms[0];
	if (!defaultForm) return { inserted: 0, skipped: 0 };

	// Forma base — createIfNotExists con skipDuplicates
	const created = await prisma.catalogItem.upsert({
		where:  { slug: speciesName },
		update: {},   // si ya existe, no tocar nada
		create: {
			slug:          speciesName,
			category:      "pokemon",
			name:          defaultForm.displayName.split(" ")[0],
			variantOfId:   null,
			variantType:   null,
			source:        "pokeapi",
			pokeapiFormId: defaultForm.pokeapiFormId,
			spriteUrl:     defaultForm.spriteUrl,
			generation,
			region:        GENERATION_REGION[generation] ?? null,
			sortOrder:     speciesPokeapiId * 100,
			notes:         null,
		},
	});

	const baseId = created.id;
	let inserted = 0;
	let skipped  = 0;

	// Variants = everything that is NOT the true base form
	// This correctly includes: regional forms, day/night forms, mega, gmax, cosmetics, etc.
	const variants = forms.filter((f) => !f.isDefault);

	for (const [index, form] of variants.entries()) {
		const existing = await prisma.catalogItem.findUnique({ where: { slug: form.name }, select: { id: true } });

		if (existing) {
			skipped++;
		} else {
			await prisma.catalogItem.create({
				data: {
					slug:          form.name,
					category:      "pokemon",
					name:          form.displayName,
					variantOfId:   baseId,
					variantType:   toSchemaVariantType(form.variantType),
					source:        "pokeapi",
					pokeapiFormId: form.pokeapiFormId,
					spriteUrl:     form.spriteUrl,
					generation:    form.generation,
					region:        inferRegion(form.formName),
					sortOrder:     speciesPokeapiId * 100 + index + 1,
					notes:         null,
				},
			});
			inserted++;
		}
	}

	return { inserted, skipped };
}

export async function syncAllPokemon(): Promise<SyncResult> {
	const result: SyncResult = { species: 0, forms: 0, skipped: 0, errors: [] };

	console.log("→ Fetching species list from PokéAPI...");
	const allSpecies = await getAllSpecies();
	console.log(`→ Found ${allSpecies.length} species. Starting sync...`);

	for (const species of allSpecies) {
		try {
			const forms = await getAllFormsForSpecies(species);
			const { inserted, skipped } = await syncSpecies(
				species.name, species.pokeapiId, species.generation, forms,
			);
			result.species++;
			result.forms   += inserted;
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

	await linkManualVariants();
	console.log("→ Sync complete:", result);
	return result;
}

async function linkManualVariants() {
	const manualVariants = [
		{ slug: "pikachu-ash",    baseSlug: "pikachu" },
		{ slug: "meowth-rocket",  baseSlug: "meowth"  },
		{ slug: "mewtwo-armored", baseSlug: "mewtwo"  },
	];

	for (const { slug, baseSlug } of manualVariants) {
		const base = await prisma.catalogItem.findUnique({
			where:  { slug: baseSlug },
			select: { id: true },
		});
		if (!base) continue;

		await prisma.catalogItem.updateMany({
			where: { slug, variantOfId: null },
			data:  { variantOfId: base.id },
		});
	}
}
