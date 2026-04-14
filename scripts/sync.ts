import { syncAllPokemon } from "../src/lib/sync";

async function main() {
	console.log("Starting Pokemon sync against production DB...\n");
	const result = await syncAllPokemon();
	console.log("\n✓ Sync complete");
	console.log(`  Species processed : ${result.species}`);
	console.log(`  Forms inserted    : ${result.forms}`);
	console.log(`  Skipped (existing): ${result.skipped}`);
	if (result.errors.length > 0) {
		console.log(`  Errors            : ${result.errors.length}`);
		result.errors.forEach(e => console.log(`    - ${e}`));
	}
	process.exit(0);
}

main().catch((err) => {
	console.error("Sync failed:", err);
	process.exit(1);
});
