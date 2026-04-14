const BASE      = "https://pokeapi.co/api/v2";
const REVALIDATE = 60 * 60 * 24 * 7;

export interface PokeApiNamedResource {
	name: string;
	url:  string;
}

export interface PokeApiPaginatedResponse {
	count:    number;
	next:     string | null;
	previous: string | null;
	results:  PokeApiNamedResource[];
}

export interface PokeApiSpecies {
	id:         number;
	name:       string;
	order:      number;
	generation: PokeApiNamedResource;
	varieties:  Array<{
		is_default: boolean;
		pokemon:    PokeApiNamedResource;
	}>;
}

export interface PokeApiPokemon {
	id:    number;
	name:  string;
	types: Array<{ slot: number; type: PokeApiNamedResource }>;
	sprites: {
		front_default: string | null;
		other: {
			"official-artwork": { front_default: string | null };
		};
	};
	forms: PokeApiNamedResource[];
}

export interface PokeApiForm {
	id:            number;
	name:          string;
	is_default:    boolean;
	is_mega:       boolean;
	is_battle_only: boolean;
	form_name:     string;
	types:         Array<{ slot: number; type: PokeApiNamedResource }>;
	sprites:       { front_default: string | null };
	pokemon:       PokeApiNamedResource;
}

// ── Normalized types ───────────────────────────────────────────────────────────

export interface NormalizedSpecies {
	pokeapiId:  number;
	name:       string;
	generation: number;
	varieties:  Array<{ name: string; url: string; isDefault: boolean }>;
}

export type VariantTypeFromApi =
	| "mega"
	| "gmax"
	| "regional"
	| "battle"
	| "cosmetic";

export interface NormalizedForm {
	pokeapiFormId:    number;
	name:             string;
	displayName:      string;
	/** true only when this form IS the default form of the DEFAULT variety */
	isDefault:        boolean;
	/** true when this form comes from the default variety of the species */
	isDefaultVariety: boolean;
	isMega:           boolean;
	isBattleOnly:     boolean;
	formName:         string;
	variantType:      VariantTypeFromApi | null;
	spriteUrl:        string | null;
	generation:       number;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

async function fetchJSON<T>(url: string): Promise<T> {
	const res = await fetch(url, { next: { revalidate: REVALIDATE } });
	if (!res.ok) throw new Error(`PokéAPI ${res.status}: ${url}`);
	return res.json() as Promise<T>;
}

function parseGeneration(name: string): number {
	const map: Record<string, number> = {
		"generation-i": 1, "generation-ii": 2, "generation-iii": 3,
		"generation-iv": 4, "generation-v": 5, "generation-vi": 6,
		"generation-vii": 7, "generation-viii": 8, "generation-ix": 9,
	};
	return map[name] ?? 0;
}

export function inferVariantType(formName: string): VariantTypeFromApi | null {
	if (!formName) return null;
	if (formName.includes("mega"))  return "mega";
	if (formName.includes("gmax"))  return "gmax";
	const regional = ["alola", "alolan", "galar", "galarian", "hisui", "hisuian", "paldea", "paldean"];
	if (regional.some(k => formName.includes(k))) return "regional";
	return "battle";
}

export function toDisplayName(slug: string): string {
	return slug.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

function bestSprite(pokemon: PokeApiPokemon): string | null {
	return (
		pokemon.sprites.other["official-artwork"].front_default ??
		pokemon.sprites.front_default ??
		null
	);
}

// ── Public API ─────────────────────────────────────────────────────────────────

export async function getAllSpecies(): Promise<NormalizedSpecies[]> {
	const results: PokeApiNamedResource[] = [];
	let url: string | null = `${BASE}/pokemon-species?limit=100`;

	while (url) {
		const page: PokeApiPaginatedResponse = await fetchJSON<PokeApiPaginatedResponse>(url);
		results.push(...page.results);
		url = page.next;
	}

	const species: NormalizedSpecies[] = [];
	const BATCH = 20;

	for (let i = 0; i < results.length; i += BATCH) {
		const batch   = results.slice(i, i + BATCH);
		const fetched = await Promise.all(batch.map(r => fetchJSON<PokeApiSpecies>(r.url)));
		for (const s of fetched) {
			species.push({
				pokeapiId:  s.id,
				name:       s.name,
				generation: parseGeneration(s.generation.name),
				// Keep isDefault from the species so we know which variety is primary
				varieties:  s.varieties.map(v => ({
					name:      v.pokemon.name,
					url:       v.pokemon.url,
					isDefault: v.is_default,
				})),
			});
		}
	}

	return species;
}

export async function getPokemon(nameOrId: string | number): Promise<PokeApiPokemon> {
	return fetchJSON<PokeApiPokemon>(`${BASE}/pokemon/${nameOrId}`);
}

export async function getForm(nameOrId: string | number): Promise<PokeApiForm> {
	return fetchJSON<PokeApiForm>(`${BASE}/pokemon-form/${nameOrId}`);
}

async function getFormsForPokemon(
	pokemon:          PokeApiPokemon,
	generation:       number,
	isDefaultVariety: boolean,
): Promise<NormalizedForm[]> {
	const forms = await Promise.all(
		pokemon.forms.map(f => fetchJSON<PokeApiForm>(f.url)),
	);

	return forms.map((form): NormalizedForm => {
		// A form is truly "the base" only when it's the default form of the default variety
		const isDefault = isDefaultVariety && form.is_default;

		// For non-default varieties, use the variety-level form_name if form_name is empty
		const formName = form.form_name || (isDefaultVariety ? "" : pokemon.name.split("-").slice(1).join("-"));

		const variantType = isDefault ? null : inferVariantType(formName);

		return {
			pokeapiFormId:    form.id,
			name:             form.name,
			displayName:      toDisplayName(form.name),
			isDefault,
			isDefaultVariety,
			isMega:           form.is_mega,
			isBattleOnly:     form.is_battle_only,
			formName,
			variantType,
			spriteUrl:        form.sprites.front_default ?? bestSprite(pokemon),
			generation,
		};
	});
}

export async function getAllFormsForSpecies(
	species: NormalizedSpecies,
): Promise<NormalizedForm[]> {
	const allForms: NormalizedForm[] = [];

	for (const variety of species.varieties) {
		const pokemon = await getPokemon(variety.name);
		const forms   = await getFormsForPokemon(pokemon, species.generation, variety.isDefault);
		allForms.push(...forms);
	}

	// Deduplicate by name (some forms appear in multiple varieties)
	const seen = new Set<string>();
	return allForms.filter(f => {
		if (seen.has(f.name)) return false;
		seen.add(f.name);
		return true;
	});
}
