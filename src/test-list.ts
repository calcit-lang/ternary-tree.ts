import {
  listToString,
  initTernaryTreeList,
  listEach,
  indexOf,
  findIndex,
  reverse,
  checkListStructure,
  listToArray,
  slice,
  listPairs,
  listItems,
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
} from "./list";

import { test, check, arrayEqual } from "./utils";

export let runListTests = () => {
  test("init list", () => {
    check(
      listToString(
        initTernaryTreeList<number>([1, 2, 3, 4])
      ) == "TernaryTreeList[4, ...]"
    );

    let origin11 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
    let data11 = initTernaryTreeList<number>(origin11);

    check(checkListStructure(data11));

    check(formatListInline(data11) == "((1 (2 _ 3) 4) (5 6 7) (8 (9 _ 10) 11))");
    check(arrayEqual<number>(origin11, listToArray(data11)));

    let emptyXs = new Array<number>(0);
    check(listEqual(initEmptyTernaryTreeList<number>(), initTernaryTreeList(emptyXs)));
  });

  test("list operations", () => {
    let origin11 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
    let data11 = initTernaryTreeList<number>(origin11);

    // get
    for (let idx = 0; idx < origin11.length; idx++) {
      check(origin11[idx] == listGet(data11, idx));
    }

    check(first(data11) == 1);
    check(last(data11) == 11);

    // assoc
    let origin5 = [1, 2, 3, 4, 5];
    let data5 = initTernaryTreeList(origin5);
    let updated = assocList(data5, 3, 10);
    check(listGet(updated, 3) == 10);
    check(listGet(data5, 3) == 4);
    check(listLen(updated) == listLen(data5));

    for (let idx = 0; idx < listLen(data5); idx++) {
      // echo data5.dissoc(idx).formatInline
      check(listLen(dissocList(data5, idx)) == listLen(data5) - 1);
    }

    check(formatListInline(data5) == "((1 _ 2) 3 (4 _ 5))");
    check(formatListInline(dissocList(data5, 0)) == "(2 3 (4 _ 5))");
    check(formatListInline(dissocList(data5, 1)) == "(1 3 (4 _ 5))");
    check(formatListInline(dissocList(data5, 2)) == "((1 _ 2) _ (4 _ 5))");
    check(formatListInline(dissocList(data5, 3)) == "((1 _ 2) 3 5)");
    check(formatListInline(dissocList(data5, 4)) == "((1 _ 2) 3 4)");

    check(formatListInline(rest(initTernaryTreeList([1]))) == "(_ _ _)");
    check(formatListInline(rest(initTernaryTreeList([1, 2]))) == "2");
    check(formatListInline(rest(initTernaryTreeList([1, 2, 3]))) == "(_ 2 3)");
    check(formatListInline(rest(initTernaryTreeList([1, 2, 3, 4]))) == "(_ (2 _ 3) 4)");
    check(formatListInline(rest(initTernaryTreeList([1, 2, 3, 4, 5]))) == "(2 3 (4 _ 5))");

    check(formatListInline(butlast(initTernaryTreeList([1]))) == "(_ _ _)");
    check(formatListInline(butlast(initTernaryTreeList([1, 2]))) == "1");
    check(formatListInline(butlast(initTernaryTreeList([1, 2, 3]))) == "(1 2 _)");
    check(formatListInline(butlast(initTernaryTreeList([1, 2, 3, 4]))) == "(1 (2 _ 3) _)");
    check(formatListInline(butlast(initTernaryTreeList([1, 2, 3, 4, 5]))) == "((1 _ 2) 3 4)");
  });

  test("list insertions", () => {
    let origin5 = [1, 2, 3, 4, 5];
    let data5 = initTernaryTreeList(origin5);

    check(formatListInline(data5) == "((1 _ 2) 3 (4 _ 5))");

    check(formatListInline(insert(data5, 0, 10, false)) == "(_ 10 ((1 _ 2) 3 (4 _ 5)))");
    check(formatListInline(insert(data5, 0, 10, true)) == "((1 10 2) 3 (4 _ 5))");
    check(formatListInline(insert(data5, 1, 10, false)) == "((1 10 2) 3 (4 _ 5))");
    check(formatListInline(insert(data5, 1, 10, true)) == "((1 2 10) 3 (4 _ 5))");
    check(formatListInline(insert(data5, 2, 10, false)) == "((1 _ 2) (_ 10 3) (4 _ 5))");
    check(formatListInline(insert(data5, 2, 10, true)) == "((1 _ 2) (3 10 _) (4 _ 5))");
    check(formatListInline(insert(data5, 3, 10, false)) == "((1 _ 2) 3 (10 4 5))");
    check(formatListInline(insert(data5, 3, 10, true)) == "((1 _ 2) 3 (4 10 5))");
    check(formatListInline(insert(data5, 4, 10, false)) == "((1 _ 2) 3 (4 10 5))");
    check(formatListInline(insert(data5, 4, 10, true)) == "(((1 _ 2) 3 (4 _ 5)) 10 _)");

    let origin4 = [1, 2, 3, 4];
    let data4 = initTernaryTreeList(origin4);

    check(formatListInline(assocBefore(data4, 3, 10)) == "(1 (2 _ 3) (_ 10 4))");
    check(formatListInline(assocAfter(data4, 3, 10)) == "(1 (2 _ 3) (4 10 _))");

    check(formatListInline(prepend(data4, 10)) == "((_ 10 1) (2 _ 3) 4)");
    check(formatListInline(append(data4, 10)) == "(1 (2 _ 3) (4 10 _))");

    let origin2 = [1, 2];
    let data2 = initTernaryTreeList(origin2);
    check(formatListInline(concat(data2, data4)) == "((1 _ 2) _ (1 (2 _ 3) 4))");

    check(formatListInline(concat(initTernaryTreeList<number>([]), data2)) == "(1 _ 2)");
  });

  test("check(equality", () => {
    let origin4 = [1, 2, 3, 4];
    let data4 = initTernaryTreeList(origin4);
    let data4n = initTernaryTreeList(origin4);
    let data4Made = prepend(initTernaryTreeList([2, 3, 4]), 1);

    check(sameListShape(data4, data4) == true);
    check(sameListShape(data4, data4n) == true);
    check(sameListShape(data4, data4Made) == false);

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
    check(formatListInline(data) == "(((0 1 2) (3 4 5) (6 7 8)) ((9 10 11) (12 13 14) (15 16 17)) (18 19 _))");
    forceListInplaceBalancing(data);
    check(formatListInline(data) == "(((0 _ 1) (2 3 4) (5 _ 6)) ((7 _ 8) (9 _ 10) (11 _ 12)) ((13 _ 14) (15 16 17) (18 _ 19)))");
    // echo data.formatInline
  });

  test("iterator", () => {
    let origin4 = [1, 2, 3, 4];
    let data4 = initTernaryTreeList(origin4);

    var i = 0;
    for (let item of listItems(data4)) {
      i = i + 1;
    }

    check(i == 4);

    i = 0;
    for (let [idx, item] of listPairs(data4)) {
      i = i + idx;
    }

    check(i == 6);
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
        check(arrayEqual<number>(listToArray(slice(data, i, j)), list40.slice(i, j)));
      }
    }
  });

  test("reverse", () => {
    let data = initTernaryTreeList([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    let reversedData = reverse(data);
    check(arrayEqual(listToArray(data).reverse(), listToArray(reversedData)));
    check(checkListStructure(reversedData));
  });

  test("list each", () => {
    var i = 0;
    let data = initTernaryTreeList<number>([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    listEach(data, (x: number) => {
      i = i + 1;
    });
    check(i == 10);
  });

  test("index of", () => {
    let data = initTernaryTreeList<number>([1, 2, 3, 4, 5, 6, 7, 8]);
    check(indexOf(data, 2) == 1);
    check(findIndex(data, (x: number): boolean => x == 2) == 1);
    check(indexOf(data, 9) == -1);
    check(findIndex(data, (x: number): boolean => x == 9) == -1);
  });
};
