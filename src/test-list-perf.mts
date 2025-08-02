import {
  initTernaryTreeList,
  initTernaryTreeListFromRange,
  initEmptyTernaryTreeList,
  listGet,
  assocList,
  dissocList,
  insert,
  first,
  last,
  rest,
  butlast,
  listLen,
  indexOf,
  findIndex,
  listToItems,
  listToPairs,
  prepend,
  append,
  concat,
  slice,
  reverse,
  listMapValues,
} from "./list.mjs";

function createTestListData(size: number): Array<number> {
  const data: Array<number> = [];
  for (let i = 0; i < size; i++) {
    data.push(i);
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

export function runListPerformanceTests() {
  console.log("\n=== List Performance Tests ===");

  const sizes = [100, 1000, 5000, 10000];

  for (const size of sizes) {
    console.log(`\n--- Testing with ${size} elements ---`);

    const testData = createTestListData(size);

    // Test list creation
    const treeList = measureTime(`initTernaryTreeList(${size})`, () => {
      return initTernaryTreeList(testData);
    });

    // Test range creation
    measureTime(`initTernaryTreeListFromRange(${size})`, () => {
      return initTernaryTreeListFromRange(testData, 0, size);
    });

    // Test random access (listGet)
    const indices = Array.from({ length: Math.min(100, size) }, (_, i) => Math.floor(Math.random() * size));
    measureTime(`Random access(${indices.length})`, () => {
      for (const idx of indices) {
        listGet(treeList, idx);
      }
    });

    // Test sequential access
    measureTime(`Sequential access(${size})`, () => {
      for (let i = 0; i < size; i++) {
        listGet(treeList, i);
      }
    });

    // Test prepend operations
    measureTime(`Prepend operations(100)`, () => {
      let list = treeList;
      for (let i = 0; i < 100; i++) {
        list = prepend(list, i + size);
      }
      return list;
    });

    // Test append operations
    measureTime(`Append operations(100)`, () => {
      let list = treeList;
      for (let i = 0; i < 100; i++) {
        list = append(list, i + size);
      }
      return list;
    });

    // Test assoc operations
    const assocIndices = Array.from({ length: Math.min(50, size) }, (_, i) => Math.floor(Math.random() * size));
    measureTime(`Assoc operations(${assocIndices.length})`, () => {
      let list = treeList;
      for (const idx of assocIndices) {
        list = assocList(list, idx, idx * 2);
      }
      return list;
    });

    // Test insert operations
    const insertIndices = Array.from({ length: Math.min(25, size) }, (_, i) => Math.floor(Math.random() * (size + i)));
    measureTime(`Insert operations(${insertIndices.length})`, () => {
      let list = treeList;
      for (let i = 0; i < insertIndices.length; i++) {
        const idx = Math.min(insertIndices[i], listLen(list));
        list = insert(list, idx, i + size);
      }
      return list;
    });

    // Test search operations
    const searchValues = testData.slice(0, Math.min(50, size));
    measureTime(`Search operations(${searchValues.length})`, () => {
      for (const value of searchValues) {
        indexOf(treeList, value);
      }
    });

    // Test iteration
    measureTime(`Iterator traversal(${size})`, () => {
      let count = 0;
      for (const item of listToItems(treeList)) {
        count++;
      }
      return count;
    });

    // Test slice operations
    const sliceCount = Math.min(10, size / 10);
    measureTime(`Slice operations(${sliceCount})`, () => {
      for (let i = 0; i < sliceCount; i++) {
        const start = Math.floor((Math.random() * size) / 2);
        const end = start + Math.floor((Math.random() * size) / 4);
        slice(treeList, start, end);
      }
    });

    // Test reverse operation
    if (size <= 5000) {
      // Only test reverse for smaller sizes as it can be expensive
      measureTime(`Reverse(${size})`, () => {
        return reverse(treeList);
      });
    }

    // Test map operation
    measureTime(`Map operation(${size})`, () => {
      return listMapValues(treeList, (x: number) => x * 2);
    });
  }

  // Concat performance test
  console.log("\n=== Concat Performance Test ===");
  const list1 = initTernaryTreeList(createTestListData(1000));
  const list2 = initTernaryTreeList(createTestListData(1000));
  const list3 = initTernaryTreeList(createTestListData(1000));

  measureTime("Concat two lists(1000 each)", () => {
    return concat(list1, list2);
  });

  measureTime("Concat three lists(1000 each)", () => {
    return concat(concat(list1, list2), list3);
  });

  // Memory stress test
  console.log("\n=== Memory Usage Test ===");
  const largeData = createTestListData(25000);
  measureTime("Large list creation(25k)", () => {
    return initTernaryTreeList(largeData);
  });

  // Cascading operations test
  console.log("\n=== Cascading Operations Test ===");
  measureTime("Complex operations chain", () => {
    let list = initTernaryTreeList(createTestListData(1000));

    // Chain multiple operations
    list = prepend(list, -1);
    list = append(list, 1001);
    list = assocList(list, 500, 9999);
    list = insert(list, 250, 8888);

    // Access and search
    listGet(list, 100);
    indexOf(list, 9999);

    // Slice and iterate
    const sliced = slice(list, 100, 200);
    for (const item of listToItems(sliced)) {
      // consume iterator
    }

    return list;
  });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runListPerformanceTests();
}
