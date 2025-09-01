// Performance comparison script
import {
  initTernaryTreeMap,
  initTernaryTreeMapFromArray,
  assocMap,
  contains,
  mapGetDefault,
  dissocMap,
  toPairsArray,
  initEmptyTernaryTreeMap,
} from "./map.mjs";

function createTestData(size: number): Array<[number, string]> {
  const data: Array<[number, string]> = [];
  for (let i = 0; i < size; i++) {
    data.push([i, `value_${i}`]);
  }
  return data;
}

function measureTime<T>(fn: () => T, iterations: number = 1): number {
  const start = performance.now();
  for (let i = 0; i < iterations; i++) {
    fn();
  }
  const end = performance.now();
  return (end - start) / iterations;
}

function runComparison() {
  console.log("=== Performance Optimization Results ===\n");

  const sizes = [1000, 5000, 10000];
  const iterations = 5; // Run multiple times for more accurate results

  for (const size of sizes) {
    console.log(`--- ${size} elements (averaged over ${iterations} runs) ---`);

    const testData = createTestData(size);
    const mapData = new Map(testData);

    // Test initTernaryTreeMapFromArray performance
    const arrayTime = measureTime(() => {
      return initTernaryTreeMapFromArray(testData);
    }, iterations);

    const mapTime = measureTime(() => {
      return initTernaryTreeMap(mapData);
    }, iterations);

    console.log(`initTernaryTreeMapFromArray: ${arrayTime.toFixed(2)}ms`);
    console.log(`initTernaryTreeMap: ${mapTime.toFixed(2)}ms`);

    // Create tree for lookup tests
    const tree = initTernaryTreeMapFromArray(testData);

    // Test lookup performance
    const lookupKeys = testData.slice(0, 100).map(([k]) => k);
    const lookupTime = measureTime(() => {
      for (const key of lookupKeys) {
        contains(tree, key);
        mapGetDefault(tree, key, "default");
      }
    }, iterations);

    console.log(`Lookups (100 operations): ${lookupTime.toFixed(2)}ms`);

    // Test toPairsArray performance
    const toPairsTime = measureTime(() => {
      return toPairsArray(tree);
    }, iterations);

    console.log(`toPairsArray: ${toPairsTime.toFixed(2)}ms`);

    console.log(`Array/Map init ratio: ${(arrayTime / mapTime).toFixed(2)}x`);
    console.log("");
  }

  // Stress test
  console.log("=== Stress Test ===");
  const largeData = createTestData(50000);
  const stressTime = measureTime(() => {
    const tree = initTernaryTreeMapFromArray(largeData);

    // Test some operations
    for (let i = 0; i < 1000; i++) {
      contains(tree, i);
    }

    return tree;
  });

  console.log(`Stress test (50k elements + 1k lookups): ${stressTime.toFixed(2)}ms`);
}

runComparison();
