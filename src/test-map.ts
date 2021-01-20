import { some, none } from "../src/types";
import { test, check, cmp } from "../src/utils";
import {
  initTernaryTreeMap,
  mapKeys,
  toHashSortedSeq,
  merge,
  mergeSkip,
  forceMapInplaceBalancing,
  formatMapInline,
  assocMap,
  dissocMap,
  contains,
  mapLoopGet,
  toPairs,
  toPairsIterator,
  initEmptyTernaryTreeMap,
  sameMapShape,
  checkMapStructure,
  mapLen,
  mapToString,
  mapEach,
} from "../src/map";
import { valueHash } from "hash";

test("init map", () => {
  var dict: Map<string, number> = new Map();
  var inList: Array<[string, number]> = [];
  for (let idx = 0; idx < 10; idx++) {
    dict.set(`${idx}`, idx + 10);
    inList.push([`${idx}`, idx + 10]);
  }

  // TODO
  inList.sort((x, y: [string, number]): number => {
    let hx = valueHash(x[0]);
    let hy = valueHash(y[0]);
    return cmp(hx, hy);
  });

  let data10 = initTernaryTreeMap<string, number>(dict);

  // echo data10
  check(formatMapInline(data10) == "((2:12 3:13 7:17) ((_ 9:19 _) (6:16 _ 5:15) (_ 1:11 _)) (8:18 0:10 4:14))");

  check(toHashSortedSeq(data10) === inList);

  check(contains(data10, "1") == true);
  check(contains(data10, "11") == false);

  check(mapLoopGet(data10, "1") == some(11));
  check(mapLoopGet(data10, "11") == none());

  let emptyData: Map<string, number> = new Map();
  check(initEmptyTernaryTreeMap<string, number>() == initTernaryTreeMap(emptyData));
});

test("check(structure", () => {
  var dict: Map<string, number> = new Map();
  for (let idx = 0; idx < 100; idx++) {
    dict.set(`${idx}`, idx + 10);
  }

  let data = initTernaryTreeMap(dict);

  check(checkMapStructure(data) == true);
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

  check(formatMapInline(assocMap(data, "1", 2222), false) == "((2:12 3:13 7:17) ((_ 9:19 _) (6:16 _ 5:15) (_ 1:2222 _)) (8:18 0:10 4:14))");
  check(formatMapInline(assocMap(data, "23", 2222), false) == "((2:12 3:13 7:17) ((_ 9:19 _) (6:16 _ 5:15) (23:2222 1:11 _)) (8:18 0:10 4:14))");
});

test("dissoc", () => {
  var dict: Map<string, number> = new Map();
  for (let idx = 0; idx < 10; idx++) {
    dict.set(`${idx}`, idx + 10);
  }

  let data = initTernaryTreeMap(dict);

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

test("to seq", () => {
  var dict: Map<string, number> = new Map();
  for (let idx = 0; idx < 10; idx++) {
    dict.set(`${idx}`, idx + 10);
  }

  let data = initTernaryTreeMap(dict);

  // TODO
  // check((mapToString(data.toPairs) == "@[2:12, 3:13, 7:17, 9:19, 6:16, 5:15, 1:11, 8:18, 0:10, 4:14]"))
  check(mapKeys(data) == ["2", "3", "7", "9", "6", "5", "1", "8", "0", "4"]);
});

test("Equality", () => {
  var dict: Map<string, number> = new Map();
  for (let idx = 0; idx < 10; idx++) {
    dict.set(`${idx}`, idx + 10);
  }

  let data = initTernaryTreeMap(dict);
  let b = dissocMap(data, "3");

  check(data == data);
  check(data != b);

  let c = assocMap(data, "3", 15);
  check(sameMapShape(data, data));
  check(sameMapShape(data, b) == false);
  check(sameMapShape(data, c) == false);

  let d = assocMap(c, "3", 13);
  check(data == d);
  check(data !== d);
});

test("Merge", () => {
  var dict: Map<string, number> = new Map();
  var dictBoth: Map<string, number> = new Map();
  for (let idx = 0; idx < 4; idx++) {
    dict.set(`${idx}`, idx + 10);
    dictBoth.set(`${idx}`, idx + 10);
  }

  let data = initTernaryTreeMap(dict);

  var dictB: Map<string, number> = new Map();
  for (let idx = 10; idx < 14; idx++) {
    dictB.set(`${idx}`, idx + 23);
    dictBoth.set(`${idx}`, idx + 23);
  }
  let b = initTernaryTreeMap(dictB);

  let merged = merge(data, b);
  let both = initTernaryTreeMap(dictBoth);

  check(merged == both);
});

test("Merge skip", () => {
  var dict: Map<string, number> = new Map();
  for (let idx = 0; idx < 4; idx++) {
    dict.set(`${idx}`, idx + 10);
  }
  let a = initTernaryTreeMap(dict);

  var dict2: Map<string, number> = new Map();
  for (let idx = 0; idx < 4; idx++) {
    dict2.set(`${idx}`, idx + 11);
  }
  let b = initTernaryTreeMap(dict2);

  let c = mergeSkip(a, b, 11);
  check(mapLoopGet(c, "0") == some(10));
  check(mapLoopGet(c, "1") == some(12));
  check(mapLoopGet(c, "2") == some(13));
  check(mapLoopGet(c, "3") == some(14));
});

test("iterator", () => {
  var dict: Map<string, number> = new Map();
  var dictBoth: Map<string, number> = new Map();
  for (let idx = 0; idx < 4; idx++) {
    dict.set(`${idx}`, idx + 10);
    dictBoth.set(`${idx}`, idx + 10);
  }

  let data = initTernaryTreeMap(dict);

  var i = 0;
  for (let [k, v] of toPairsIterator(data)) {
    i = i + 1;
  }

  check(i == 4);

  i = 0;
  for (let key of toPairsIterator(data)) {
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

  var i = 0;
  mapEach(data, (k: string, v: number): void => {
    // echo "..{k}-{v}.."
    i = i + 1;
  });
  check(i == 100);
});
