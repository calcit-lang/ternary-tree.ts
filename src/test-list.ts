import {
  listToString,
  initTernaryTreeList,
  indexOf,
  findIndex,
  reverse,
  checkListStructure,
  slice,
  listToPairs,
  listToItems,
  formatListInline,
  sameListShape,
  assocBefore,
  concat,
  assocAfter,
  prepend,
  append,
  rest,
  butlast,
  first,
  assocList,
  dissocList,
  listGet,
  insert,
  initEmptyTernaryTreeList,
  last,
  listLen,
  forceListInplaceBalancing,
  listEqual,
  indexToItems,
  listMapValues,
} from "./list";

import { test, check, arrayEqual } from "./utils";

export let runListTests = () => {
  test("init list", () => {
    check(
      listToString(
        initTernaryTreeList<number>([1, 2, 3, 4])
      ) === "TernaryTreeList[4, ...]"
    );

    let origin11 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
    let data11 = initTernaryTreeList<number>(origin11);

    check(checkListStructure(data11));

    check(formatListInline(data11) === "((1 (2 _ 3) 4) (5 6 7) (8 (9 _ 10) 11))");
    check(
      arrayEqual<number>(origin11, [...listToItems(data11)])
    );

    check(arrayEqual<number>([...listToItems(data11)], [...indexToItems(data11)]));

    let emptyXs = new Array<number>(0);
    check(listEqual(initEmptyTernaryTreeList<number>(), initTernaryTreeList(emptyXs)));
  });

  test("list operations", () => {
    let origin11 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
    let data11 = initTernaryTreeList<number>(origin11);

    // get
    for (let idx = 0; idx < origin11.length; idx++) {
      check(origin11[idx] === listGet(data11, idx));
    }

    check(first(data11) === 1);
    check(last(data11) === 11);

    // assoc
    let origin5 = [1, 2, 3, 4, 5];
    let data5 = initTernaryTreeList(origin5);
    let updated = assocList(data5, 3, 10);
    check(listGet(updated, 3) === 10);
    check(listGet(data5, 3) === 4);
    check(listLen(updated) === listLen(data5));

    for (let idx = 0; idx < listLen(data5); idx++) {
      // echo data5.dissoc(idx).formatInline
      check(listLen(dissocList(data5, idx)) === listLen(data5) - 1);
    }

    check(formatListInline(data5) === "((1 _ 2) 3 (4 _ 5))");
    check(formatListInline(dissocList(data5, 0)) === "(2 3 (4 _ 5))");
    check(formatListInline(dissocList(data5, 1)) === "(1 3 (4 _ 5))");
    check(formatListInline(dissocList(data5, 2)) === "((1 _ 2) _ (4 _ 5))");
    check(formatListInline(dissocList(data5, 3)) === "((1 _ 2) 3 5)");
    check(formatListInline(dissocList(data5, 4)) === "((1 _ 2) 3 4)");

    check(formatListInline(rest(initTernaryTreeList([1]))) === "(_ _ _)");
    check(formatListInline(rest(initTernaryTreeList([1, 2]))) === "2");
    check(formatListInline(rest(initTernaryTreeList([1, 2, 3]))) === "(_ 2 3)");
    check(formatListInline(rest(initTernaryTreeList([1, 2, 3, 4]))) === "(_ (2 _ 3) 4)");
    check(formatListInline(rest(initTernaryTreeList([1, 2, 3, 4, 5]))) === "(2 3 (4 _ 5))");

    check(formatListInline(butlast(initTernaryTreeList([1]))) === "(_ _ _)");
    check(formatListInline(butlast(initTernaryTreeList([1, 2]))) === "1");
    check(formatListInline(butlast(initTernaryTreeList([1, 2, 3]))) === "(1 2 _)");
    check(formatListInline(butlast(initTernaryTreeList([1, 2, 3, 4]))) === "(1 (2 _ 3) _)");
    check(formatListInline(butlast(initTernaryTreeList([1, 2, 3, 4, 5]))) === "((1 _ 2) 3 4)");
  });

  test("list insertions", () => {
    let origin5 = [1, 2, 3, 4, 5];
    let data5 = initTernaryTreeList(origin5);

    check(formatListInline(data5) === "((1 _ 2) 3 (4 _ 5))");

    check(formatListInline(insert(data5, 0, 10, false)) === "(_ 10 ((1 _ 2) 3 (4 _ 5)))");
    check(formatListInline(insert(data5, 0, 10, true)) === "((1 10 2) 3 (4 _ 5))");
    check(formatListInline(insert(data5, 1, 10, false)) === "((1 10 2) 3 (4 _ 5))");
    check(formatListInline(insert(data5, 1, 10, true)) === "((1 2 10) 3 (4 _ 5))");
    check(formatListInline(insert(data5, 2, 10, false)) === "((1 _ 2) (_ 10 3) (4 _ 5))");
    check(formatListInline(insert(data5, 2, 10, true)) === "((1 _ 2) (3 10 _) (4 _ 5))");
    check(formatListInline(insert(data5, 3, 10, false)) === "((1 _ 2) 3 (10 4 5))");
    check(formatListInline(insert(data5, 3, 10, true)) === "((1 _ 2) 3 (4 10 5))");
    check(formatListInline(insert(data5, 4, 10, false)) === "((1 _ 2) 3 (4 10 5))");
    check(formatListInline(insert(data5, 4, 10, true)) === "(((1 _ 2) 3 (4 _ 5)) 10 _)");

    let origin4 = [1, 2, 3, 4];
    let data4 = initTernaryTreeList(origin4);

    check(formatListInline(assocBefore(data4, 3, 10)) === "(1 (2 _ 3) (_ 10 4))");
    check(formatListInline(assocAfter(data4, 3, 10)) === "(1 (2 _ 3) (4 10 _))");

    check(formatListInline(prepend(data4, 10)) === "((_ 10 1) (2 _ 3) 4)");
    check(formatListInline(append(data4, 10)) === "(1 (2 _ 3) (4 10 _))");
  });

  test("concat", () => {
    let data1 = initTernaryTreeList([1, 2]);
    let data2 = initTernaryTreeList([3, 4]);

    let data3 = initTernaryTreeList([5, 6]);
    let data4 = initTernaryTreeList([7, 8]);

    check(formatListInline(concat(data1, data2)) === "((1 _ 2) _ (3 _ 4))");
    check(formatListInline(concat(initTernaryTreeList<number>([]), data1)) === "(1 _ 2)");
    check(formatListInline(concat(data1, data2, data3)) === "((1 _ 2) (3 _ 4) (5 _ 6))");
    check(formatListInline(concat(data1, data2, data3, data4)) === "((1 _ 2) ((3 _ 4) _ (5 _ 6)) (7 _ 8))");

    checkListStructure(concat(data1, data2));
    checkListStructure(concat(data1, data2, data3));
    checkListStructure(concat(data1, data2, data3, data4));

    check(listLen(concat(data1, data2, data3, data4)) === 8);
  });

  test("check(equality", () => {
    let origin4 = [1, 2, 3, 4];
    let data4 = initTernaryTreeList(origin4);
    let data4n = initTernaryTreeList(origin4);
    let data4Made = prepend(initTernaryTreeList([2, 3, 4]), 1);

    check(sameListShape(data4, data4) === true);
    check(sameListShape(data4, data4n) === true);
    check(sameListShape(data4, data4Made) === false);

    check(listEqual(data4, data4n));
    check(listEqual(data4, data4Made));
    check(listEqual(data4n, data4Made));
    check(data4 !== data4Made); // identical false
  });

  test("force balancing", () => {
    var data = initTernaryTreeList<number>([]);
    for (let idx = 0; idx < 20; idx++) {
      data = append(data, idx, true);
    }
    // echo data.formatInline
    check(formatListInline(data) === "(((0 1 2) (3 4 5) (6 7 8)) ((9 10 11) (12 13 14) (15 16 17)) (18 19 _))");
    forceListInplaceBalancing(data);
    check(formatListInline(data) === "(((0 _ 1) (2 3 4) (5 _ 6)) ((7 _ 8) (9 _ 10) (11 _ 12)) ((13 _ 14) (15 16 17) (18 _ 19)))");
    // echo data.formatInline
  });

  test("iterator", () => {
    let origin4 = [1, 2, 3, 4];
    let data4 = initTernaryTreeList(origin4);

    var i = 0;
    for (let item of listToItems(data4)) {
      i = i + 1;
    }

    check(i === 4);

    i = 0;
    for (let [idx, item] of listToPairs(data4)) {
      i = i + idx;
    }

    check(i === 6);
  });

  test("check(structure)", () => {
    var data = initTernaryTreeList<number>([]);
    for (let idx = 0; idx < 20; idx++) {
      data = append(data, idx, true);
    }

    check(checkListStructure(data));

    let origin11 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
    let data11 = initTernaryTreeList<number>(origin11);

    check(checkListStructure(data11));
  });

  test("slices", () => {
    var data = initTernaryTreeList<number>([]);
    for (let idx = 0; idx < 40; idx++) {
      data = append(data, idx, true);
    }

    var list40: Array<number> = [];
    for (let idx = 0; idx < 40; idx++) {
      list40.push(idx);
    }

    for (let i = 0; i < 40; i++) {
      for (let j = i; j < 40; j++) {
        check(arrayEqual<number>([...listToItems(slice(data, i, j))], list40.slice(i, j)));
      }
    }
  });

  test("reverse", () => {
    let data = initTernaryTreeList([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    let reversedData = reverse(data);
    check(arrayEqual([...listToItems(data)].reverse(), [...listToItems(reversedData)]));
    check(checkListStructure(reversedData));
  });

  test("list traverse", () => {
    var i = 0;
    let data = initTernaryTreeList<number>([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    for (let x of listToItems(data)) {
      i = i + 1;
    }

    check(i === 10);
  });

  test("index of", () => {
    let data = initTernaryTreeList<number>([1, 2, 3, 4, 5, 6, 7, 8]);
    check(indexOf(data, 2) === 1);
    check(findIndex(data, (x: number): boolean => x === 2) === 1);
    check(indexOf(data, 9) === -1);
    check(findIndex(data, (x: number): boolean => x === 9) === -1);
  });

  test("map values", () => {
    let data = initTernaryTreeList<number>([1, 2, 3, 4]);
    let data2 = initTernaryTreeList<number>([1, 4, 9, 16]);
    let data3 = listMapValues(data, (x) => x * x);

    checkListStructure(data3);
    check(listEqual(data2, data3));
    check(formatListInline(data2) == formatListInline(data3));
  });
};
