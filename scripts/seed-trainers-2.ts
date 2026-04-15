import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const PS = "https://play.pokemonshowdown.com/sprites/trainers";

const TRAINERS = [
	// ── Profesores ────────────────────────────────────────────────
	{ name: "Prof. Oak",      slug: "trainer-prof-oak",      sprite: "oak",        region: "Kanto",  gen: 1, sort: 18 },
	{ name: "Prof. Elm",      slug: "trainer-prof-elm",      sprite: "elm",        region: "Johto",  gen: 2, sort: 18 },
	{ name: "Prof. Birch",    slug: "trainer-prof-birch",    sprite: "birch",      region: "Hoenn",  gen: 3, sort: 18 },
	{ name: "Prof. Rowan",    slug: "trainer-prof-rowan",    sprite: "rowan",      region: "Sinnoh", gen: 4, sort: 18 },
	{ name: "Prof. Juniper",  slug: "trainer-prof-juniper",  sprite: "juniper",    region: "Unova",  gen: 5, sort: 18 },
	{ name: "Prof. Sycamore", slug: "trainer-prof-sycamore", sprite: "sycamore",   region: "Kalos",  gen: 6, sort: 18 },
	{ name: "Prof. Magnolia", slug: "trainer-prof-magnolia", sprite: "magnolia",   region: "Galar",  gen: 8, sort: 18 },
	{ name: "Prof. Sada",     slug: "trainer-prof-sada",     sprite: "sada",       region: "Paldea", gen: 9, sort: 18 },
	{ name: "Prof. Turo",     slug: "trainer-prof-turo",     sprite: "turo",       region: "Paldea", gen: 9, sort: 18 },

	// ── Kalos: rivales / compañeros faltantes ─────────────────────
	{ name: "Calem",   slug: "trainer-calem",   sprite: "calem",   region: "Kalos", gen: 6, sort: 16 },
	{ name: "Shauna",  slug: "trainer-shauna",  sprite: "shauna",  region: "Kalos", gen: 6, sort: 16 },
	{ name: "Tierno",  slug: "trainer-tierno",  sprite: "tierno",  region: "Kalos", gen: 6, sort: 16 },
	{ name: "Trevor",  slug: "trainer-trevor",  sprite: "trevor",  region: "Kalos", gen: 6, sort: 16 },
	{ name: "Sawyer",  slug: "trainer-sawyer",  sprite: "sawyer",  region: "Kalos", gen: 6, sort: 16 },

	// ── Hoenn: rivales / compañeros faltantes ─────────────────────
	{ name: "Brendan", slug: "trainer-brendan", sprite: "brendan", region: "Hoenn", gen: 3, sort: 16 },
	{ name: "Wally",   slug: "trainer-wally",   sprite: "wally",   region: "Hoenn", gen: 3, sort: 16 },
	{ name: "Zinnia",  slug: "trainer-zinnia",  sprite: "zinnia",  region: "Hoenn", gen: 3, sort: 16 },

	// ── Otros personajes importantes ──────────────────────────────
	{ name: "Looker",  slug: "trainer-looker",  sprite: "looker",  region: "Sinnoh", gen: 4, sort: 19 },
	{ name: "Colress", slug: "trainer-colress", sprite: "colress", region: "Unova",  gen: 5, sort: 19 },
	{ name: "Jessie",  slug: "trainer-jessie",  sprite: "jessie",  region: "Kanto",  gen: 1, sort: 19 },
	{ name: "James",   slug: "trainer-james",   sprite: "james",   region: "Kanto",  gen: 1, sort: 19 },
];

async function main() {
	console.log(`→ Insertando ${TRAINERS.length} entrenadores...`);
	let inserted = 0;
	let skipped  = 0;

	for (const t of TRAINERS) {
		const existing = await prisma.catalogItem.findUnique({ where: { slug: t.slug } });
		if (existing) { skipped++; continue; }

		await prisma.catalogItem.create({
			data: {
				slug:       t.slug,
				category:   "trainer",
				name:       t.name,
				spriteUrl:  `${PS}/${t.sprite}.png`,
				region:     t.region,
				generation: t.gen,
				sortOrder:  t.sort,
				source:     "manual",
			},
		});
		console.log(`  + ${t.name}`);
		inserted++;
	}

	console.log(`\n✓ Listo: ${inserted} insertados, ${skipped} ya existían.`);
	await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
