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

function measureTime<T>(name: string, fn: () => T): [T, number] {
  const start = performance.now();
  const result = fn();
  const end = performance.now();
  const duration = end - start;
  console.log(`${name}: ${duration.toFixed(2)}ms`);
  return [result, duration];
}

function repeatTest<T>(times: number, fn: () => T): number {
  let totalTime = 0;
  for (let i = 0; i < times; i++) {
    const start = performance.now();
    fn();
    const end = performance.now();
    totalTime += end - start;
  }
  return totalTime / times;
}

export function runDetailedListPerformanceTests() {
  console.log("\n=== Detailed List Performance Tests ===");
  console.log("Testing various operations with different list sizes to show optimization benefits\n");

  const sizes = [500, 2000, 8000, 16000];

  for (const size of sizes) {
    console.log(`\n--- Performance Analysis: ${size} elements ---`);

    const testData = createTestListData(size);

    // Test list creation - should benefit from reduced overhead
    const [treeList, creationTime] = measureTime(`Create list (${size})`, () => {
      return initTernaryTreeList(testData);
    });

    // Test range creation
    measureTime(`Range init (${size})`, () => {
      return initTernaryTreeListFromRange(testData, 0, size);
    });

    // Test random access patterns - benefits from cached size calculations
    const accessCount = Math.min(1000, size);
    const indices = Array.from({ length: accessCount }, () => Math.floor(Math.random() * size));
    const avgAccessTime = repeatTest(3, () => {
      for (const idx of indices) {
        listGet(treeList, idx);
      }
    });
    console.log(`Random access avg (${accessCount} ops): ${avgAccessTime.toFixed(2)}ms`);

    // Test sequential access
    const avgSeqTime = repeatTest(3, () => {
      for (let i = 0; i < Math.min(size, 1000); i++) {
        listGet(treeList, i);
      }
    });
    console.log(`Sequential access avg (${Math.min(size, 1000)} ops): ${avgSeqTime.toFixed(2)}ms`);

    // Test structural modifications - heavily benefits from cached calculations
    const modCount = Math.min(100, size / 10);
    const avgAssocTime = repeatTest(3, () => {
      let list = treeList;
      for (let i = 0; i < modCount; i++) {
        const idx = Math.floor(Math.random() * size);
        list = assocList(list, idx, idx * 2);
      }
      return list;
    });
    console.log(`Assoc operations avg (${modCount} ops): ${avgAssocTime.toFixed(2)}ms`);

    // Test insertions
    const insertCount = Math.min(50, size / 20);
    const avgInsertTime = repeatTest(3, () => {
      let list = treeList;
      for (let i = 0; i < insertCount; i++) {
        const idx = Math.min(Math.floor(Math.random() * (size + i)), listLen(list));
        list = insert(list, idx, i + size);
      }
      return list;
    });
    console.log(`Insert operations avg (${insertCount} ops): ${avgInsertTime.toFixed(2)}ms`);

    // Test search operations - benefits from cached property access
    const searchCount = Math.min(100, size / 10);
    const searchValues = testData.slice(0, searchCount);
    const avgSearchTime = repeatTest(3, () => {
      for (const value of searchValues) {
        indexOf(treeList, value);
      }
    });
    console.log(`Search operations avg (${searchCount} ops): ${avgSearchTime.toFixed(2)}ms`);

    // Test slicing - benefits from cached size calculations
    const sliceCount = Math.min(20, size / 50);
    const avgSliceTime = repeatTest(3, () => {
      for (let i = 0; i < sliceCount; i++) {
        const start = Math.floor((Math.random() * size) / 2);
        const end = start + Math.floor((Math.random() * size) / 4);
        slice(treeList, start, Math.min(end, size));
      }
    });
    console.log(`Slice operations avg (${sliceCount} ops): ${avgSliceTime.toFixed(2)}ms`);

    // Iteration performance
    const avgIterTime = repeatTest(3, () => {
      let count = 0;
      for (const item of listToItems(treeList)) {
        count++;
      }
      return count;
    });
    console.log(`Iterator traversal avg (${size} items): ${avgIterTime.toFixed(2)}ms`);

    // Complex operation chains - should show cumulative benefits
    measureTime(`Complex chain (${Math.floor(size / 100)} ops)`, () => {
      let list = treeList;
      const ops = Math.floor(size / 100);

      for (let i = 0; i < ops; i++) {
        // Prepend
        list = prepend(list, -i);
        // Random assoc
        if (listLen(list) > 10) {
          const idx = Math.floor(Math.random() * Math.min(listLen(list), 100));
          list = assocList(list, idx, i * 1000);
        }
        // Random access
        if (listLen(list) > 5) {
          listGet(list, Math.floor(Math.random() * Math.min(listLen(list), 50)));
        }
      }
      return list;
    });

    console.log("");
  }

  // Stress test for deep operations
  console.log("=== Stress Tests ===");

  const largeList = initTernaryTreeList(createTestListData(50000));

  measureTime("Deep list access stress", () => {
    const samples = 1000;
    for (let i = 0; i < samples; i++) {
      const idx = Math.floor(Math.random() * 50000);
      listGet(largeList, idx);
    }
  });

  measureTime("Deep list modification stress", () => {
    let list = largeList;
    for (let i = 0; i < 100; i++) {
      const idx = Math.floor(Math.random() * listLen(list));
      list = assocList(list, idx, i * 10000);
    }
    return list;
  });

  // Memory efficiency test
  console.log("\n=== Memory Efficiency Tests ===");

  measureTime("Large tree creation (100k)", () => {
    return initTernaryTreeList(createTestListData(100000));
  });

  // Test concatenation performance
  console.log("\n=== Concatenation Performance ===");
  const list1 = initTernaryTreeList(createTestListData(5000));
  const list2 = initTernaryTreeList(createTestListData(5000));
  const list3 = initTernaryTreeList(createTestListData(5000));
  const list4 = initTernaryTreeList(createTestListData(5000));

  measureTime("Concat 4 large lists (5k each)", () => {
    return concat(concat(concat(list1, list2), list3), list4);
  });

  console.log("\n✅ Performance testing completed!");
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runDetailedListPerformanceTests();
}
