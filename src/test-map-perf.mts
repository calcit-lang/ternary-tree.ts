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
import { hashGenerator } from "./types.mjs";

function createTestData(size: number): Array<[number, string]> {
  const data: Array<[number, string]> = [];
  for (let i = 0; i < size; i++) {
    data.push([i, `value_${i}`]);
  }
  return data;
}

function measureTime<T>(name: string, fn: () => T): T {
  const start = performance.now();
  const result = fn();
  const end = performance.now();
  console.log(`${name}: ${(end - start).toFixed(2)}ms`);
  return result;
}

export function runPerformanceTests() {
  console.log("\n=== Performance Tests ===");

  const sizes = [100, 1000, 5000, 10000];

  for (const size of sizes) {
    console.log(`\n--- Testing with ${size} elements ---`);

    const testData = createTestData(size);
    const mapData = new Map(testData);

    // Test initTernaryTreeMapFromArray
    const treeFromArray = measureTime(`initTernaryTreeMapFromArray(${size})`, () => {
      return initTernaryTreeMapFromArray(testData);
    });

    // Test initTernaryTreeMap
    const treeFromMap = measureTime(`initTernaryTreeMap(${size})`, () => {
      return initTernaryTreeMap(mapData);
    });

    // Test sequential assoc operations
    measureTime(`Sequential assoc(${size})`, () => {
      let tree = initEmptyTernaryTreeMap<number, string>();
      for (const [k, v] of testData) {
        tree = assocMap(tree, k, v);
      }
      return tree;
    });

    // Test lookups
    const lookupKeys = testData.slice(0, Math.min(100, size)).map(([k]) => k);
    measureTime(`Lookups(${lookupKeys.length})`, () => {
      for (const key of lookupKeys) {
        contains(treeFromArray, key);
        mapGetDefault(treeFromArray, key, "default");
      }
    });

    // Test dissoc operations
    const dissocKeys = testData.slice(0, Math.min(50, size)).map(([k]) => k);
    measureTime(`Dissoc(${dissocKeys.length})`, () => {
      let tree = treeFromArray;
      for (const key of dissocKeys) {
        tree = dissocMap(tree, key);
      }
      return tree;
    });

    // Test toPairsArray
    measureTime(`toPairsArray(${size})`, () => {
      return toPairsArray(treeFromArray);
    });
  }

  console.log("\n=== Memory usage test ===");
  const largeData = createTestData(50000);
  console.log(`Testing with ${largeData.length} elements for memory efficiency`);

  measureTime("Large dataset creation", () => {
    return initTernaryTreeMapFromArray(largeData);
  });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runPerformanceTests();
}
