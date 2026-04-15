import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const PS = "https://play.pokemonshowdown.com/sprites/trainers";

// ── 1. Corregir sprites rotos (404) ──────────────────────────────
// null = no existe en PS → muestra emoji de fallback
const SPRITE_FIXES: { slug: string; spriteUrl: string | null }[] = [
	// Corrección de nombre incorrecto
	{ slug: "trainer-bianca",  spriteUrl: `${PS}/bianca.png` },
	{ slug: "trainer-rose",    spriteUrl: `${PS}/rose.png`   },

	// Sin sprite en Pokémon Showdown → null (emoji)
	{ slug: "trainer-gary",    spriteUrl: null },
	{ slug: "trainer-tracey",  spriteUrl: null },
	{ slug: "trainer-max",     spriteUrl: null },
	{ slug: "trainer-bonnie",  spriteUrl: null },
	{ slug: "trainer-chloe",   spriteUrl: null },
	{ slug: "trainer-paul",    spriteUrl: null },
	{ slug: "trainer-archie",  spriteUrl: null },
	{ slug: "trainer-maxie",   spriteUrl: null },
	{ slug: "trainer-jessie",  spriteUrl: null },
	{ slug: "trainer-james",   spriteUrl: null },
	{ slug: "trainer-looker",  spriteUrl: null },
	{ slug: "trainer-sawyer",  spriteUrl: null },
	{ slug: "trainer-drake",   spriteUrl: null },
];

// ── 2. Entrenadores faltantes de la lista completa ─────────────────
const MISSING: {
	name: string; slug: string; sprite: string | null;
	region: string; gen: number; sort: number;
}[] = [
	// ─ Kanto ────────────────────────────────────────────────────
	{ name: "Trace",       slug: "trainer-trace",    sprite: "trace",    region: "Kanto",  gen: 1, sort: 16 },

	// ─ Johto: villanos Team Rocket ──────────────────────────────
	{ name: "Archer",      slug: "trainer-archer",   sprite: "archer",   region: "Johto",  gen: 2, sort: 30 },
	{ name: "Ariana",      slug: "trainer-ariana",   sprite: "ariana",   region: "Johto",  gen: 2, sort: 30 },
	{ name: "Petrel",      slug: "trainer-petrel",   sprite: "petrel",   region: "Johto",  gen: 2, sort: 30 },
	{ name: "Proton",      slug: "trainer-proton",   sprite: "proton",   region: "Johto",  gen: 2, sort: 30 },

	// ─ Johto: compañeros (protagonistas alternativos) ───────────
	{ name: "Lyra",        slug: "trainer-lyra",     sprite: "lyra",     region: "Johto",  gen: 2, sort: 15 },
	{ name: "Ethan",       slug: "trainer-ethan",    sprite: "ethan",    region: "Johto",  gen: 2, sort: 15 },

	// ─ Sinnoh: villanos Team Galactic ───────────────────────────
	{ name: "Mars",        slug: "trainer-mars",     sprite: "mars",     region: "Sinnoh", gen: 4, sort: 31 },
	{ name: "Jupiter",     slug: "trainer-jupiter",  sprite: "jupiter",  region: "Sinnoh", gen: 4, sort: 31 },
	{ name: "Saturn",      slug: "trainer-saturn",   sprite: "saturn",   region: "Sinnoh", gen: 4, sort: 31 },

	// ─ Unova: líderes faltantes ─────────────────────────────────
	{ name: "Drayden",     slug: "trainer-drayden",  sprite: "drayden",  region: "Unova",  gen: 5, sort: 8  },
	{ name: "Roxie",       slug: "trainer-roxie",    sprite: "roxie",    region: "Unova",  gen: 5, sort: 8  },
	{ name: "Marlon",      slug: "trainer-marlon",   sprite: "marlon",   region: "Unova",  gen: 5, sort: 8  },
	{ name: "Fennel",      slug: "trainer-fennel",   sprite: "fennel",   region: "Unova",  gen: 5, sort: 18 },

	// ─ Alola: extras ────────────────────────────────────────────
	{ name: "Prof. Burnet",slug: "trainer-prof-burnet", sprite: "burnet", region: "Alola", gen: 7, sort: 18 },
	{ name: "Mina",        slug: "trainer-mina",     sprite: "mina",     region: "Alola",  gen: 7, sort: 6  },
	{ name: "Molayne",     slug: "trainer-molayne",  sprite: "molayne",  region: "Alola",  gen: 7, sort: 19 },
	{ name: "Faba",        slug: "trainer-faba",     sprite: "faba",     region: "Alola",  gen: 7, sort: 30 },

	// ─ Galar: DLC y villanos ────────────────────────────────────
	{ name: "Klara",       slug: "trainer-klara",    sprite: "klara",    region: "Galar",  gen: 8, sort: 16 },
	{ name: "Avery",       slug: "trainer-avery",    sprite: "avery",    region: "Galar",  gen: 8, sort: 16 },
	{ name: "Oleana",      slug: "trainer-oleana",   sprite: "oleana",   region: "Galar",  gen: 8, sort: 30 },

	// ─ Paldea: autoridades y villanos Team Star ──────────────────
	{ name: "Clavell",     slug: "trainer-clavell",  sprite: null,       region: "Paldea", gen: 9, sort: 19 },
	{ name: "Jacq",        slug: "trainer-jacq",     sprite: "jacq",     region: "Paldea", gen: 9, sort: 19 },
	{ name: "Mela",        slug: "trainer-mela",     sprite: "mela",     region: "Paldea", gen: 9, sort: 30 },
	{ name: "Giacomo",     slug: "trainer-giacomo",  sprite: "giacomo",  region: "Paldea", gen: 9, sort: 30 },
	{ name: "Atticus",     slug: "trainer-atticus",  sprite: "atticus",  region: "Paldea", gen: 9, sort: 30 },
	{ name: "Ortega",      slug: "trainer-ortega",   sprite: "ortega",   region: "Paldea", gen: 9, sort: 30 },
	{ name: "Eri",         slug: "trainer-eri",      sprite: "eri",      region: "Paldea", gen: 9, sort: 30 },

	// ─ Anime: Pokémon Horizons ──────────────────────────────────
	{ name: "Liko",        slug: "trainer-liko",     sprite: "liko",     region: "Paldea", gen: 9, sort: 15 },
	{ name: "Roy",         slug: "trainer-roy",      sprite: "roy",      region: "Kanto",  gen: 9, sort: 15 },
];

async function main() {
	// ── Fix sprites rotos ────────────────────────────────────────
	console.log("→ Corrigiendo sprites rotos...");
	for (const fix of SPRITE_FIXES) {
		const updated = await prisma.catalogItem.updateMany({
			where: { slug: fix.slug },
			data:  { spriteUrl: fix.spriteUrl },
		});
		if (updated.count > 0)
			console.log(`  ✓ ${fix.slug} → ${fix.spriteUrl ?? "null (emoji)"}`);
	}

	// ── Insertar faltantes ────────────────────────────────────────
	console.log("\n→ Insertando entrenadores faltantes...");
	let inserted = 0;
	let skipped  = 0;

	for (const t of MISSING) {
		const existing = await prisma.catalogItem.findUnique({ where: { slug: t.slug } });
		if (existing) { skipped++; continue; }

		await prisma.catalogItem.create({
			data: {
				slug:       t.slug,
				category:   "trainer",
				name:       t.name,
				spriteUrl:  t.sprite ? `${PS}/${t.sprite}.png` : null,
				region:     t.region,
				generation: t.gen,
				sortOrder:  t.sort,
				source:     "manual",
			},
		});
		console.log(`  + ${t.name}`);
		inserted++;
	}

	console.log(`\n✓ Sprites corregidos. Insertados: ${inserted}, ya existían: ${skipped}.`);
	await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
