/**
 * Micro-benchmark for ts-ternary-tree hot paths.
 *
 * Usage:
 *   yarn bench
 *
 * Each bench() call runs the task for ~1 second and reports ops/sec.
 * A higher number is better. Compare before/after code changes to judge
 * whether an optimisation has real impact.
 */

import {
  initTernaryTreeList,
  initTernaryTreeListFromRange,
  listGet,
  assocList,
  dissocList,
  listToItems,
  concat,
  insert,
  forceListInplaceBalancing,
} from "./list.mjs";

import {
  initTernaryTreeMap,
  initTernaryTreeMapFromArray,
  assocMap,
  dissocMap,
  mapGetDefault,
  forceMapInplaceBalancing,
} from "./map.mjs";

import { deepEqual, overwriteComparator } from "./utils.mjs";
import { mergeValueHash, overwriteHashGenerator, valueHash } from "./types.mjs";

overwriteComparator(deepEqual);
overwriteHashGenerator((x) => mergeValueHash(10, valueHash(x)));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function bench(label: string, fn: () => void, durationMs = 1000): void {
  // Warmup
  for (let i = 0; i < 100; i++) fn();

  let ops = 0;
  const start = Date.now();
  while (Date.now() - start < durationMs) {
    fn();
    ops++;
  }
  const elapsed = Date.now() - start;
  const opsPerSec = Math.round((ops / elapsed) * 1000);
  console.log(`  ${label.padEnd(40)} ${opsPerSec.toLocaleString()} ops/sec`);
}

function section(title: string) {
  console.log(`\n--- ${title} ---`);
}

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const SIZE_SMALL = 100;
const SIZE_MEDIUM = 1_000;
const SIZE_LARGE = 10_000;

const arrSmall = Array.from({ length: SIZE_SMALL }, (_, i) => i);
const arrMedium = Array.from({ length: SIZE_MEDIUM }, (_, i) => i);
const arrLarge = Array.from({ length: SIZE_LARGE }, (_, i) => i);

const listSmall = initTernaryTreeList(arrSmall);
const listMedium = initTernaryTreeList(arrMedium);
const listLarge = initTernaryTreeList(arrLarge);

const mapMediumPairs: [string, number][] = arrMedium.map((i) => [`k${i}`, i]);
const mapMedium = initTernaryTreeMapFromArray<string, number>(mapMediumPairs);

// ---------------------------------------------------------------------------
// List benchmarks
// ---------------------------------------------------------------------------

section("listGet (random access)");
bench("listGet small  (n=100)   middle idx", () => listGet(listSmall, 50));
bench("listGet medium (n=1k)   middle idx", () => listGet(listMedium, 500));
bench("listGet large  (n=10k)  middle idx", () => listGet(listLarge, 5000));

section("listToItems (full iteration)");
bench("listToItems small  (n=100)", () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  for (const _ of listToItems(listSmall)) { /* consume */ }
});
bench("listToItems medium (n=1k)", () => {
  for (const _ of listToItems(listMedium)) { /* consume */ }
});
bench("listToItems large  (n=10k)", () => {
  for (const _ of listToItems(listLarge)) { /* consume */ }
});

section("assocList (element update)");
bench("assocList small  (n=100)  idx=50", () => assocList(listSmall, 50, 999));
bench("assocList medium (n=1k)   idx=500", () => assocList(listMedium, 500, 999));
bench("assocList large  (n=10k)  idx=5000", () => assocList(listLarge, 5000, 999));

section("dissocList (element remove)");
bench("dissocList small  (n=100)  idx=50", () => dissocList(listSmall, 50));
bench("dissocList medium (n=1k)   idx=500", () => dissocList(listMedium, 500));
bench("dissocList large  (n=10k)  idx=5000", () => dissocList(listLarge, 5000));

section("initTernaryTreeList (construction)");
bench("init list small  (n=100)", () => initTernaryTreeList(arrSmall));
bench("init list medium (n=1k)", () => initTernaryTreeList(arrMedium));
bench("init list large  (n=10k)", () => initTernaryTreeList(arrLarge));

section("concat");
const half1 = initTernaryTreeList(arrMedium.slice(0, 500));
const half2 = initTernaryTreeList(arrMedium.slice(500));
bench("concat two halves (n=500 each)", () => concat(half1, half2));

// ---------------------------------------------------------------------------
// Map benchmarks
// ---------------------------------------------------------------------------

section("assocMap (key update/insert)");
bench("assocMap medium (n=1k) existing key", () => assocMap(mapMedium, "k500", 9999));
bench("assocMap medium (n=1k) new key", () => assocMap(mapMedium, "new-key", 9999));

section("dissocMap (key remove)");
bench("dissocMap medium (n=1k)", () => dissocMap(mapMedium, "k500"));

section("mapGetDefault (lookup)");
bench("mapGetDefault medium (n=1k) hit", () => mapGetDefault(mapMedium, "k500", -1));
bench("mapGetDefault medium (n=1k) miss", () => mapGetDefault(mapMedium, "no-such-key", -1));

section("initTernaryTreeMap (construction)");
bench("init map small  (n=100)", () => initTernaryTreeMapFromArray<string, number>(mapMediumPairs.slice(0, 100)));
bench("init map medium (n=1k)", () => initTernaryTreeMapFromArray<string, number>(mapMediumPairs));

console.log("\nDone.");
