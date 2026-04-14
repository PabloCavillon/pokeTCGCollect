const BASE = "https://pokeapi.co/api/v2";
const REVALIDATE = 60 * 60 * 24 * 7;

export interface PokeApiNamedResource {
	name: string;
	url: string;
}

export interface PokeApiPaginatedResponse {
	count: number;
	next: string | null;
	previous: string | null;
	results: PokeApiNamedResource[];
}

export interface PokeApiSpecies {
	id: number;
	name: string;
	order: number;
	generation: PokeApiNamedResource;
	varieties: Array<{
		is_default: boolean;
		pokemon: PokeApiNamedResource;
	}>;
	names: Array<{
		name: string;
		language: PokeApiNamedResource;
	}>;
}

export interface PokeApiPokemon {
	id: number;
	name: string;
	types: Array<{
		slot: number;
		type: PokeApiNamedResource;
	}>;
	sprites: {
		front_default: string | null;
		other: {
			"official-artwork": {
				front_default: string | null;
			};
		};
	};
	forms: PokeApiNamedResource[];
}

export interface PokeApiForm {
	id: number;
	name: string;
	is_default: boolean;
	is_mega: boolean;
	is_battle_only: boolean;
	form_name: string;
	types: Array<{
		slot: number;
		type: PokeApiNamedResource;
	}>;
	sprites: {
		front_default: string | null;
	};
	pokemon: PokeApiNamedResource;
	form_names: Array<{
		name: string;
		language: PokeApiNamedResource;
	}>;
}

export interface NormalizedSpecies {
	pokeapiId: number;
	name: string;
	generation: number;
	varieties: PokeApiNamedResource[];
}

export interface NormalizedForm {
	pokeapiFormId: number;
	name: string;
	displayName: string;
	isDefault: boolean;
	isMega: boolean;
	isBattleOnly: boolean;
	formName: string;
	variantType: VariantTypeFromApi | null;
	types: string[];
	spriteUrl: string | null;
	generation: number;
}

export type VariantTypeFromApi =
	| "mega"
	| "gmax"
	| "regional"
	| "battle"
	| "cosmetic";

async function fetchWithCache<T>(url: string): Promise<T> {
	const res = await fetch(url, { next: { revalidate: REVALIDATE } });
	if (!res.ok) throw new Error(`PokéAPI error ${res.status}: ${url}`);
	return res.json() as Promise<T>;
}

function parseGeneration(name: string): number {
	const map: Record<string, number> = {
		"generation-i": 1,
		"generation-ii": 2,
		"generation-iii": 3,
		"generation-iv": 4,
		"generation-v": 5,
		"generation-vi": 6,
		"generation-vii": 7,
		"generation-viii": 8,
		"generation-ix": 9,
	};
	return map[name] ?? 0;
}

export function inferVariantType(formName: string): VariantTypeFromApi | null {
	if (!formName) return null;

	if (formName.includes("mega")) return "mega";
	if (formName.includes("gmax")) return "gmax";

	const regionalKeywords = [
		"alola",
		"alolan",
		"galar",
		"galarian",
		"hisui",
		"hisuian",
		"paldea",
		"paldean",
	];
	if (regionalKeywords.some((k) => formName.includes(k))) return "regional";

	return "battle";
}

export function toDisplayName(slug: string): string {
	return slug
		.split("-")
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(" ");
}

function bestSprite(pokemon: PokeApiPokemon): string | null {
	return (
		pokemon.sprites.other["official-artwork"].front_default ??
		pokemon.sprites.front_default ??
		null
	);
}

export async function getAllSpecies(): Promise<NormalizedSpecies[]> {
	const results: PokeApiNamedResource[] = [];
	let url: string | null = `${BASE}/pokemon-species?limit=100`;

	while (url) {
		const page: PokeApiPaginatedResponse =
			await fetchWithCache<PokeApiPaginatedResponse>(url);
		results.push(...page.results);
		url = page.next;
	}

	const species: NormalizedSpecies[] = [];
	const BATCH = 20;

	for (let i = 0; i < results.length; i += BATCH) {
		const batch = results.slice(i, i + BATCH);
		const fetched = await Promise.all(
			batch.map((r) => fetchWithCache<PokeApiSpecies>(r.url)),
		);
		for (const s of fetched) {
			species.push({
				pokeapiId: s.id,
				name: s.name,
				generation: parseGeneration(s.generation.name),
				varieties: s.varieties.map((v) => v.pokemon),
			});
		}
	}

	return species;
}

export async function getPokemon(
	nameOrId: string | number,
): Promise<PokeApiPokemon> {
	return fetchWithCache<PokeApiPokemon>(`${BASE}/pokemon/${nameOrId}`);
}

export async function getForm(nameOrId: string | number): Promise<PokeApiForm> {
	return fetchWithCache<PokeApiForm>(`${BASE}/pokemon-form/${nameOrId}`);
}

export async function getFormsForPokemon(
	pokemon: PokeApiPokemon,
	generation: number,
): Promise<NormalizedForm[]> {
	const forms: PokeApiForm[] = await Promise.all(
		pokemon.forms.map((f: PokeApiNamedResource) =>
			fetchWithCache<PokeApiForm>(f.url),
		),
	);

	return forms.map((form: PokeApiForm): NormalizedForm => {
		const variantType = form.is_default
			? null
			: inferVariantType(form.form_name);

		const types =
			form.types.length > 0
				? form.types.map(
						(t: { slot: number; type: PokeApiNamedResource }) =>
							t.type.name,
					)
				: pokemon.types.map(
						(t: { slot: number; type: PokeApiNamedResource }) =>
							t.type.name,
					);

		return {
			pokeapiFormId: form.id,
			name: form.name,
			displayName: toDisplayName(form.name),
			isDefault: form.is_default,
			isMega: form.is_mega,
			isBattleOnly: form.is_battle_only,
			formName: form.form_name,
			variantType,
			types,
			spriteUrl: form.sprites.front_default ?? bestSprite(pokemon),
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
		const forms = await getFormsForPokemon(pokemon, species.generation);
		allForms.push(...forms);
	}

	const seen = new Set<string>();
	return allForms.filter((f) => {
		if (seen.has(f.name)) return false;
		seen.add(f.name);
		return true;
	});
}
