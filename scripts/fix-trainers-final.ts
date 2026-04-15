import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const PS = "https://play.pokemonshowdown.com/sprites/trainers";

async function main() {
	// ── 1. Borrar entrenadores sin imagen disponible ──────────────
	const toDelete = [
		"trainer-gary",
		"trainer-tracey",
		"trainer-chloe",
		"trainer-max",
		"trainer-jessie",   // se reemplaza por la entrada combinada
		"trainer-james",
	];
	const deleted = await prisma.catalogItem.deleteMany({
		where: { slug: { in: toDelete } },
	});
	console.log(`✓ Borrados: ${deleted.count}`);

	// ── 2. Actualizar sprites ─────────────────────────────────────
	const updates: { slug: string; spriteUrl: string }[] = [
		{ slug: "trainer-lorelei", spriteUrl: `${PS}/lorelei-gen3.png` },
		{ slug: "trainer-agatha",  spriteUrl: `${PS}/agatha-gen3.png`  },
		{ slug: "trainer-drake",   spriteUrl: `${PS}/drake-gen3.png`   },
		{ slug: "trainer-archie",  spriteUrl: `${PS}/archie-gen3.png`  },
		{ slug: "trainer-maxie",   spriteUrl: `${PS}/maxie-gen3.png`   },
		{ slug: "trainer-phoebe",  spriteUrl: `${PS}/phoebe-gen3.png`  },
		{ slug: "trainer-arven",   spriteUrl: `${PS}/arven-s.png`      },
		{ slug: "trainer-nemona",  spriteUrl: `${PS}/nemona-s.png`     },
		{ slug: "trainer-clavell", spriteUrl: `${PS}/clavell-s.png`    },
	];

	for (const u of updates) {
		const r = await prisma.catalogItem.updateMany({
			where: { slug: u.slug },
			data:  { spriteUrl: u.spriteUrl },
		});
		console.log(`✓ ${u.slug} → ${r.count > 0 ? "OK" : "no encontrado"}`);
	}

	// ── 3. Crear entrada combinada Jessie & James ─────────────────
	await prisma.catalogItem.upsert({
		where:  { slug: "trainer-jessie-james" },
		update: { spriteUrl: `${PS}/jessiejames-gen1.png` },
		create: {
			slug:       "trainer-jessie-james",
			category:   "trainer",
			name:       "Jessie & James",
			spriteUrl:  `${PS}/jessiejames-gen1.png`,
			region:     "Kanto",
			generation: 1,
			sortOrder:  19,
			source:     "manual",
		},
	});
	console.log("✓ Jessie & James creado");

	await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
