import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ---------------------------------------------------------------------------
// Pokéballs — PokeAPI item sprites (same visual style as Pokémon sprites)
// ---------------------------------------------------------------------------
const POKEBALL_BASE = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items";

// Maps our DB slug → PokeAPI item slug
const POKEBALL_SLUGS: Record<string, string> = {
	"pokeball":      "poke-ball",
	"great-ball":    "great-ball",
	"ultra-ball":    "ultra-ball",
	"master-ball":   "master-ball",
	"safari-ball":   "safari-ball",
	"fast-ball":     "fast-ball",
	"level-ball":    "level-ball",
	"lure-ball":     "lure-ball",
	"heavy-ball":    "heavy-ball",
	"love-ball":     "love-ball",
	"friend-ball":   "friend-ball",
	"moon-ball":     "moon-ball",
	"sport-ball":    "sport-ball",
	"net-ball":      "net-ball",
	"nest-ball":     "nest-ball",
	"repeat-ball":   "repeat-ball",
	"timer-ball":    "timer-ball",
	"luxury-ball":   "luxury-ball",
	"premier-ball":  "premier-ball",
	"dive-ball":     "dive-ball",
	"dusk-ball":     "dusk-ball",
	"heal-ball":     "heal-ball",
	"quick-ball":    "quick-ball",
	"dream-ball":    "dream-ball",
	"beast-ball":    "beast-ball",
	"cherish-ball":  "cherish-ball",
};

// ---------------------------------------------------------------------------
// Energies — PokeAPI type icons (gen 9, Scarlet/Violet style)
// ---------------------------------------------------------------------------
// Type IDs: https://pokeapi.co/api/v2/type/
const TYPE_ICON_BASE = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/generation-ix/scarlet-violet";

const ENERGY_URLS: Record<string, string> = {
	"energy-fire":      `${TYPE_ICON_BASE}/10.png`,  // Fire      id=10
	"energy-water":     `${TYPE_ICON_BASE}/11.png`,  // Water     id=11
	"energy-grass":     `${TYPE_ICON_BASE}/12.png`,  // Grass     id=12
	"energy-lightning": `${TYPE_ICON_BASE}/13.png`,  // Electric  id=13
	"energy-psychic":   `${TYPE_ICON_BASE}/14.png`,  // Psychic   id=14
	"energy-fighting":  `${TYPE_ICON_BASE}/2.png`,   // Fighting  id=2
	"energy-darkness":  `${TYPE_ICON_BASE}/17.png`,  // Dark      id=17
	"energy-metal":     `${TYPE_ICON_BASE}/9.png`,   // Steel     id=9
	"energy-fairy":     `${TYPE_ICON_BASE}/18.png`,  // Fairy     id=18
	"energy-dragon":    `${TYPE_ICON_BASE}/16.png`,  // Dragon    id=16
	"energy-colorless": `${TYPE_ICON_BASE}/1.png`,   // Normal    id=1
};

// ---------------------------------------------------------------------------
// Trainers — Pokémon Showdown trainer sprites
// Format: https://play.pokemonshowdown.com/sprites/trainers/{name}.png
// ---------------------------------------------------------------------------
const SHOWDOWN_BASE = "https://play.pokemonshowdown.com/sprites/trainers";

// Maps our DB slug → Pokémon Showdown trainer image name
const TRAINER_SPRITES: Record<string, string> = {
	// Gen 1 — Kanto Gym Leaders & Elite 4
	"trainer-brock":        "brock",
	"trainer-misty":        "misty",
	"trainer-lt-surge":     "ltsurge",
	"trainer-erika":        "erika",
	"trainer-koga":         "koga",
	"trainer-sabrina":      "sabrina",
	"trainer-blaine":       "blaine",
	"trainer-giovanni":     "giovanni",
	"trainer-lorelei":      "lorelei",
	"trainer-bruno":        "bruno",
	"trainer-agatha":       "agatha",
	"trainer-lance":        "lance",
	// Gen 1 — Rivals & Champions
	"trainer-blue":         "blue",
	// Gen 2 — Johto Gym Leaders & Elite 4
	"trainer-falkner":      "falkner",
	"trainer-bugsy":        "bugsy",
	"trainer-whitney":      "whitney",
	"trainer-morty":        "morty",
	"trainer-chuck":        "chuck",
	"trainer-jasmine":      "jasmine",
	"trainer-pryce":        "pryce",
	"trainer-clair":        "clair",
	"trainer-will":         "will",
	"trainer-karen":        "karen",
	"trainer-silver":       "silver",
	// Gen 3 — Hoenn Gym Leaders & Elite 4
	"trainer-roxanne":      "roxanne",
	"trainer-brawly":       "brawly",
	"trainer-wattson":      "wattson",
	"trainer-flannery":     "flannery",
	"trainer-norman":       "norman",
	"trainer-winona":       "winona",
	"trainer-tate-liza":    "tate",
	"trainer-juan":         "juan",
	"trainer-steven":       "steven",
	"trainer-may":          "may",
	// Gen 4 — Sinnoh Gym Leaders & Elite 4
	"trainer-roark":        "roark",
	"trainer-gardenia":     "gardenia",
	"trainer-maylene":      "maylene",
	"trainer-crasher-wake": "crasherwake",
	"trainer-fantina":      "fantina",
	"trainer-byron":        "byron",
	"trainer-candice":      "candice",
	"trainer-volkner":      "volkner",
	"trainer-cynthia":      "cynthia",
	"trainer-dawn":         "dawn",
	// Gen 5 — Unova Gym Leaders & Elite 4
	"trainer-lenora":       "lenora",
	"trainer-burgh":        "burgh",
	"trainer-elesa":        "elesa",
	"trainer-clay":         "clay",
	"trainer-skyla":        "skyla",
	"trainer-brycen":       "brycen",
	"trainer-drayden":      "drayden",
	"trainer-iris":         "iris",
	"trainer-chili":        "chili",
	"trainer-cress":        "cress",
	"trainer-cilan":        "cilan",
	"trainer-n":            "n",
	// Gen 6 — Kalos Gym Leaders & Elite 4
	"trainer-viola":        "viola",
	"trainer-grant":        "grant",
	"trainer-korrina":      "korrina",
	"trainer-ramos":        "ramos",
	"trainer-clemont":      "clemont",
	"trainer-valerie":      "valerie",
	"trainer-olympia":      "olympia",
	"trainer-wulfric":      "wulfric",
	"trainer-diantha":      "diantha",
	"trainer-serena":       "serena",
	// Gen 7 — Alola Trial Captains & Kahunas
	"trainer-ilima":        "ilima",
	"trainer-lana":         "lana",
	"trainer-kiawe":        "kiawe",
	"trainer-mallow":       "mallow",
	"trainer-sophocles":    "sophocles",
	"trainer-acerola":      "acerola",
	"trainer-hapu":         "hapu",
	"trainer-lusamine":     "lusamine",
	"trainer-gladion":      "gladion",
	// Gen 8 — Galar Gym Leaders & Elite 4
	"trainer-milo":         "milo",
	"trainer-nessa":        "nessa",
	"trainer-kabu":         "kabu",
	"trainer-bea":          "bea",
	"trainer-allister":     "allister",
	"trainer-opal":         "opal",
	"trainer-gordie":       "gordie",
	"trainer-melony":       "melony",
	"trainer-piers":        "piers",
	"trainer-raihan":       "raihan",
	"trainer-leon":         "leon",
	"trainer-marnie":       "marnie",
	"trainer-hop":          "hop",
	// Gen 9 — Paldea Gym Leaders & Elite 4
	"trainer-katy":         "katy",
	"trainer-brassius":     "brassius",
	"trainer-iono":         "iono",
	"trainer-kofu":         "kofu",
	"trainer-larry":        "larry",
	"trainer-ryme":         "ryme",
	"trainer-tulip":        "tulip",
	"trainer-grusha":       "grusha",
	"trainer-geeta":        "geeta",
	"trainer-nemona":       "nemona",
	"trainer-penny":        "penny",
	// Anime
	"trainer-ash":          "ash",
};

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
	let updated = 0;
	let notFound = 0;

	// --- Pokéballs ---
	console.log("Updating pokéball sprites...");
	for (const [slug, pokeapiSlug] of Object.entries(POKEBALL_SLUGS)) {
		const url = `${POKEBALL_BASE}/${pokeapiSlug}.png`;
		const res = await prisma.catalogItem.updateMany({
			where:  { slug },
			data:   { spriteUrl: url },
		});
		if (res.count > 0) { updated++; console.log(`  ✓ ${slug}`); }
		else               { notFound++; console.log(`  ✗ not in DB: ${slug}`); }
	}

	// --- Energies ---
	console.log("\nUpdating energy sprites...");
	for (const [slug, url] of Object.entries(ENERGY_URLS)) {
		const res = await prisma.catalogItem.updateMany({
			where: { slug },
			data:  { spriteUrl: url },
		});
		if (res.count > 0) { updated++; console.log(`  ✓ ${slug}`); }
		else               { notFound++; console.log(`  ✗ not in DB: ${slug}`); }
	}

	// --- Trainers ---
	console.log("\nUpdating trainer sprites...");
	for (const [slug, showdownName] of Object.entries(TRAINER_SPRITES)) {
		const url = `${SHOWDOWN_BASE}/${showdownName}.png`;
		const res = await prisma.catalogItem.updateMany({
			where: { slug },
			data:  { spriteUrl: url },
		});
		if (res.count > 0) { updated++; console.log(`  ✓ ${slug} → ${showdownName}`); }
		else               { notFound++; console.log(`  ✗ not in DB: ${slug}`); }
	}

	console.log(`\n✓ Done — ${updated} updated, ${notFound} not found in DB`);
}

main()
	.then(() => process.exit(0))
	.catch(err => { console.error(err); process.exit(1); });
