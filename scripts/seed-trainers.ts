import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const PS = "https://play.pokemonshowdown.com/sprites/trainers";

const TRAINERS = [
	// ── Companions de Ash ──────────────────────────────────────────
	{ name: "Gary Oak",   slug: "trainer-gary",    sprite: "gary",          region: "Kanto",  gen: 1, sort: 15 },
	{ name: "Tracey",     slug: "trainer-tracey",  sprite: "tracey",        region: "Kanto",  gen: 1, sort: 15 },
	{ name: "Max",        slug: "trainer-max",     sprite: "max",           region: "Hoenn",  gen: 3, sort: 15 },
	{ name: "Bonnie",     slug: "trainer-bonnie",  sprite: "bonnie",        region: "Kalos",  gen: 6, sort: 15 },
	{ name: "Lillie",     slug: "trainer-lillie",  sprite: "lillie",        region: "Alola",  gen: 7, sort: 15 },
	{ name: "Goh",        slug: "trainer-goh",     sprite: "goh",           region: "Kanto",  gen: 8, sort: 15 },
	{ name: "Chloe",      slug: "trainer-chloe",   sprite: "chloe",         region: "Kanto",  gen: 8, sort: 15 },

	// ── Rivales y personajes clave ─────────────────────────────────
	{ name: "Red",        slug: "trainer-red",     sprite: "red",           region: "Kanto",  gen: 1, sort: 16 },
	{ name: "Paul",       slug: "trainer-paul",    sprite: "paul",          region: "Sinnoh", gen: 4, sort: 16 },
	{ name: "Barry",      slug: "trainer-barry",   sprite: "barry",         region: "Sinnoh", gen: 4, sort: 16 },
	{ name: "Bianca",     slug: "trainer-bianca",  sprite: "biancawhite",   region: "Unova",  gen: 5, sort: 16 },
	{ name: "Cheren",     slug: "trainer-cheren",  sprite: "cheren",        region: "Unova",  gen: 5, sort: 16 },
	{ name: "Hugh",       slug: "trainer-hugh",    sprite: "hugh",          region: "Unova",  gen: 5, sort: 16 },
	{ name: "Alain",      slug: "trainer-alain",   sprite: "alain",         region: "Kalos",  gen: 6, sort: 16 },
	{ name: "Hau",        slug: "trainer-hau",     sprite: "hau",           region: "Alola",  gen: 7, sort: 16 },
	{ name: "Guzma",      slug: "trainer-guzma",   sprite: "guzma",         region: "Alola",  gen: 7, sort: 16 },
	{ name: "Plumeria",   slug: "trainer-plumeria",sprite: "plumeria",      region: "Alola",  gen: 7, sort: 16 },
	{ name: "Bede",       slug: "trainer-bede",    sprite: "bede",          region: "Galar",  gen: 8, sort: 16 },
	{ name: "Sonia",      slug: "trainer-sonia",   sprite: "sonia",         region: "Galar",  gen: 8, sort: 16 },
	{ name: "Arven",      slug: "trainer-arven",   sprite: "arven",         region: "Paldea", gen: 9, sort: 16 },

	// ── Campeones faltantes ────────────────────────────────────────
	{ name: "Wallace",    slug: "trainer-wallace",  sprite: "wallace",      region: "Hoenn",  gen: 3, sort: 17 },
	{ name: "Alder",      slug: "trainer-alder",    sprite: "alder",        region: "Unova",  gen: 5, sort: 17 },
	{ name: "Prof. Kukui",slug: "trainer-kukui",    sprite: "kukui",        region: "Alola",  gen: 7, sort: 17 },

	// ── Alto Mando Hoenn ──────────────────────────────────────────
	{ name: "Sidney",     slug: "trainer-sidney",  sprite: "sidney",        region: "Hoenn",  gen: 3, sort: 20 },
	{ name: "Phoebe",     slug: "trainer-phoebe",  sprite: "phoebe",        region: "Hoenn",  gen: 3, sort: 20 },
	{ name: "Glacia",     slug: "trainer-glacia",  sprite: "glacia",        region: "Hoenn",  gen: 3, sort: 20 },
	{ name: "Drake",      slug: "trainer-drake",   sprite: "drakehoenn",    region: "Hoenn",  gen: 3, sort: 20 },

	// ── Alto Mando Sinnoh ─────────────────────────────────────────
	{ name: "Aaron",      slug: "trainer-aaron",   sprite: "aaron",         region: "Sinnoh", gen: 4, sort: 21 },
	{ name: "Bertha",     slug: "trainer-bertha",  sprite: "bertha",        region: "Sinnoh", gen: 4, sort: 21 },
	{ name: "Flint",      slug: "trainer-flint",   sprite: "flint",         region: "Sinnoh", gen: 4, sort: 21 },
	{ name: "Lucian",     slug: "trainer-lucian",  sprite: "lucian",        region: "Sinnoh", gen: 4, sort: 21 },

	// ── Alto Mando Unova ──────────────────────────────────────────
	{ name: "Shauntal",   slug: "trainer-shauntal",sprite: "shauntal",      region: "Unova",  gen: 5, sort: 22 },
	{ name: "Marshal",    slug: "trainer-marshal", sprite: "marshal",       region: "Unova",  gen: 5, sort: 22 },
	{ name: "Grimsley",   slug: "trainer-grimsley",sprite: "grimsley",      region: "Unova",  gen: 5, sort: 22 },
	{ name: "Caitlin",    slug: "trainer-caitlin", sprite: "caitlin",       region: "Unova",  gen: 5, sort: 22 },

	// ── Alto Mando Kalos ──────────────────────────────────────────
	{ name: "Malva",      slug: "trainer-malva",   sprite: "malva",         region: "Kalos",  gen: 6, sort: 23 },
	{ name: "Siebold",    slug: "trainer-siebold", sprite: "siebold",       region: "Kalos",  gen: 6, sort: 23 },
	{ name: "Wikstrom",   slug: "trainer-wikstrom",sprite: "wikstrom",      region: "Kalos",  gen: 6, sort: 23 },
	{ name: "Drasna",     slug: "trainer-drasna",  sprite: "drasna",        region: "Kalos",  gen: 6, sort: 23 },

	// ── Kahunas / Alto Mando Alola ────────────────────────────────
	{ name: "Hala",       slug: "trainer-hala",    sprite: "hala",          region: "Alola",  gen: 7, sort: 24 },
	{ name: "Olivia",     slug: "trainer-olivia",  sprite: "olivia",        region: "Alola",  gen: 7, sort: 24 },
	{ name: "Nanu",       slug: "trainer-nanu",    sprite: "nanu",          region: "Alola",  gen: 7, sort: 24 },
	{ name: "Kahili",     slug: "trainer-kahili",  sprite: "kahili",        region: "Alola",  gen: 7, sort: 24 },

	// ── Alto Mando Paldea (faltantes) ────────────────────────────
	{ name: "Rika",       slug: "trainer-rika",    sprite: "rika",          region: "Paldea", gen: 9, sort: 25 },
	{ name: "Poppy",      slug: "trainer-poppy",   sprite: "poppy",         region: "Paldea", gen: 9, sort: 25 },
	{ name: "Hassel",     slug: "trainer-hassel",  sprite: "hassel",        region: "Paldea", gen: 9, sort: 25 },

	// ── Líderes de equipos villanos ───────────────────────────────
	{ name: "Archie",     slug: "trainer-archie",  sprite: "archie",        region: "Hoenn",  gen: 3, sort: 30 },
	{ name: "Maxie",      slug: "trainer-maxie",   sprite: "maxie",         region: "Hoenn",  gen: 3, sort: 30 },
	{ name: "Cyrus",      slug: "trainer-cyrus",   sprite: "cyrus",         region: "Sinnoh", gen: 4, sort: 31 },
	{ name: "Ghetsis",    slug: "trainer-ghetsis", sprite: "ghetsis",       region: "Unova",  gen: 5, sort: 32 },
	{ name: "Lysandre",   slug: "trainer-lysandre",sprite: "lysandre",      region: "Kalos",  gen: 6, sort: 33 },
	{ name: "Rose",       slug: "trainer-rose",    sprite: "rosegalar",     region: "Galar",  gen: 8, sort: 34 },
];

async function main() {
	console.log(`→ Insertando ${TRAINERS.length} entrenadores...`);
	let inserted = 0;
	let skipped  = 0;

	for (const t of TRAINERS) {
		const result = await prisma.catalogItem.upsert({
			where:  { slug: t.slug },
			update: {},
			create: {
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

		if (result.updatedAt.getTime() === result.createdAt.getTime()) {
			console.log(`  + ${t.name}`);
			inserted++;
		} else {
			skipped++;
		}
	}

	console.log(`\n✓ Listo: ${inserted} insertados, ${skipped} ya existían.`);
	await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
