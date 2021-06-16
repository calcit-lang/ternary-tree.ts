import { hashGenerator } from "./types";
import { test, check, cmp, deepEqual, justDisplay } from "./utils";
import {
  initTernaryTreeMap,
  toHashSortedPairs,
  merge,
  mergeSkip,
  forceMapInplaceBalancing,
  formatMapInline,
  assocMap,
  dissocMap,
  contains,
  toPairs,
  initEmptyTernaryTreeMap,
  sameMapShape,
  checkMapStructure,
  mapLen,
  mapToString,
  mapEqual,
  toKeys,
  toPairsArray,
  mapMapValues,
  mapGetDefault,
} from "./map";

export let runMapTests = () => {
  test("init map", () => {
    var dict: Map<string, number> = new Map();
    var inList: Array<[string, number]> = [];
    for (let idx = 0; idx < 10; idx++) {
      dict.set(`${idx}`, idx + 10);
      inList.push([`${idx}`, idx + 10]);
    }

    // TODO
    inList.sort((x, y: [string, number]): number => {
      let hx = hashGenerator(x[0]);
      let hy = hashGenerator(y[0]);
      return cmp(hx, hy);
    });

    let data10 = initTernaryTreeMap<string, number>(dict);
    let data11 = initTernaryTreeMap<string, number>(inList);
    checkMapStructure(data10);
    checkMapStructure(data11);

    // echo data10
    justDisplay(formatMapInline(data10), "((2:12 3:13 7:17) ((_ 9:19 _) (6:16 _ 5:15) (_ 1:11 _)) (8:18 0:10 4:14))");

    check(deepEqual(toHashSortedPairs(data10), inList));
    check(deepEqual(toHashSortedPairs(data11), inList));

    check(contains(data10, "1") == true);
    check(contains(data10, "11") == false);

    check(deepEqual(mapGetDefault(data10, "1", null), 11));
    check(deepEqual(mapGetDefault(data10, "111", 0), 0));
    // check(deepEqual(mapGetDefault(data10, "11", {} as any), null)); // should throws error

    let emptyData: Map<string, number> = new Map();
    check(mapEqual(initEmptyTernaryTreeMap<string, number>(), initTernaryTreeMap(emptyData)));
  });

  test("check structure", () => {
    var dict: Map<string, number> = new Map();
    for (let idx = 0; idx < 100; idx++) {
      dict.set(`${idx}`, idx + 10);
    }

    let data = initTernaryTreeMap(dict);

    check(checkMapStructure(data));
  });

  test("assoc map", () => {
    var dict: Map<string, number> = new Map();
    for (let idx = 0; idx < 10; idx++) {
      dict.set(`${idx}`, idx + 10);
    }

    let data = initTernaryTreeMap(dict);

    // echo data.formatInline

    check(contains(data, "1") == true);
    check(contains(data, "12") == false);
    checkMapStructure(data);

    justDisplay(formatMapInline(assocMap(data, "1", 2222), false), "((2:12 3:13 7:17) ((_ 9:19 _) (6:16 _ 5:15) (_ 1:2222 _)) (8:18 0:10 4:14))");
    justDisplay(formatMapInline(assocMap(data, "23", 2222), false), "((2:12 3:13 7:17) ((_ 9:19 _) (6:16 _ 5:15) (23:2222 1:11 _)) (8:18 0:10 4:14))");
  });

  test("dissoc", () => {
    var dict: Map<string, number> = new Map();
    for (let idx = 0; idx < 10; idx++) {
      dict.set(`${idx}`, idx + 10);
    }

    let data = initTernaryTreeMap(dict);
    checkMapStructure(data);

    // echo data.formatInline

    for (let idx = 0; idx < 10; idx++) {
      let v = dissocMap(data, `${idx}`);
      check(contains(v, `${idx}`) == false);
      check(contains(data, `${idx}`) == true);
      check(mapLen(v) == mapLen(data) - 1);
    }

    for (let idx = 10; idx < 12; idx++) {
      let v = dissocMap(data, `${idx}`);
      check(contains(v, `${idx}`) == false);
      check(mapLen(v) == mapLen(data));
    }
  });

  test("to array", () => {
    var dict: Map<string, number> = new Map();
    for (let idx = 0; idx < 10; idx++) {
      dict.set(`${idx}`, idx + 10);
    }

    let data = initTernaryTreeMap(dict);
    checkMapStructure(data);

    // TODO
    // justDisplay((mapToString(toPairs(data))) , "@[2:12, 3:13, 7:17, 9:19, 6:16, 5:15, 1:11, 8:18, 0:10, 4:14]")
    justDisplay([...toKeys(data)], ["2", "3", "7", "9", "6", "5", "1", "8", "0", "4"]);

    check(deepEqual(toPairsArray(data), [...toPairs(data)]));
  });

  test("Equality", () => {
    var dict: Map<string, number> = new Map();
    for (let idx = 0; idx < 10; idx++) {
      dict.set(`${idx}`, idx + 10);
    }

    let data = initTernaryTreeMap(dict);
    let b = dissocMap(data, "3");
    checkMapStructure(data);
    checkMapStructure(b);

    check(mapEqual(data, data));
    check(!mapEqual(data, b));

    let c = assocMap(data, "3", 15);
    check(sameMapShape(data, data));
    check(sameMapShape(data, b) == false);
    check(sameMapShape(data, c) == false);

    let d = assocMap(c, "3", 13);
    check(mapEqual(data, d));
    check(data !== d); // not identical
  });

  test("Merge", () => {
    var dict: Map<string, number> = new Map();
    var dictBoth: Map<string, number> = new Map();
    for (let idx = 0; idx < 4; idx++) {
      dict.set(`${idx}`, idx + 10);
      dictBoth.set(`${idx}`, idx + 10);
    }

    let data = initTernaryTreeMap(dict);
    checkMapStructure(data);

    var dictB: Map<string, number> = new Map();
    for (let idx = 10; idx < 14; idx++) {
      dictB.set(`${idx}`, idx + 23);
      dictBoth.set(`${idx}`, idx + 23);
    }
    let b = initTernaryTreeMap(dictB);

    let merged = merge(data, b);
    let both = initTernaryTreeMap(dictBoth);

    check(mapEqual(merged, both));
  });

  test("Merge skip", () => {
    var dict: Map<string, number> = new Map();
    for (let idx = 0; idx < 4; idx++) {
      dict.set(`${idx}`, idx + 10);
    }
    let a = initTernaryTreeMap(dict);
    checkMapStructure(a);

    var dict2: Map<string, number> = new Map();
    for (let idx = 0; idx < 4; idx++) {
      dict2.set(`${idx}`, idx + 11);
    }
    let b = initTernaryTreeMap(dict2);
    checkMapStructure(b);

    let c = mergeSkip(a, b, 11);
    check(deepEqual(mapGetDefault(c, "0", null), 10));
    check(deepEqual(mapGetDefault(c, "1", null), 12));
    check(deepEqual(mapGetDefault(c, "2", null), 13));
    check(deepEqual(mapGetDefault(c, "3", null), 14));
  });

  test("iterator", () => {
    var dict: Map<string, number> = new Map();
    var dictBoth: Map<string, number> = new Map();
    for (let idx = 0; idx < 4; idx++) {
      dict.set(`${idx}`, idx + 10);
      dictBoth.set(`${idx}`, idx + 10);
    }

    let data = initTernaryTreeMap(dict);
    checkMapStructure(data);

    var i = 0;
    for (let [k, v] of toPairs(data)) {
      i = i + 1;
    }

    check(i == 4);

    i = 0;
    for (let key of toPairs(data)) {
      i = i + 1;
    }
    check(i == 4);
  });

  test("each map", () => {
    var dict: Map<string, number> = new Map();
    for (let idx = 0; idx < 100; idx++) {
      dict.set(`${idx}`, idx + 10);
    }

    let data = initTernaryTreeMap(dict);
    checkMapStructure(data);

    var i = 0;
    for (let [k, v] of toPairs(data)) {
      // echo "..{k}-{v}.."
      i = i + 1;
    }
    check(i == 100);
  });

  test("map values", () => {
    var dict: Map<string, number> = new Map();
    for (let idx = 0; idx < 4; idx++) {
      dict.set(`${idx}`, idx + 10);
    }
    let data = initTernaryTreeMap(dict);

    var dict2: Map<string, number> = new Map();
    for (let idx = 0; idx < 4; idx++) {
      dict2.set(`${idx}`, idx + 20);
    }
    let data2 = initTernaryTreeMap(dict2);

    let data3 = mapMapValues(data, (x) => x + 10);
    checkMapStructure(data3);

    checkMapStructure(data3);
    check(mapEqual(data2, data3));
    check(formatMapInline(data2) === formatMapInline(data3));
  });
};
