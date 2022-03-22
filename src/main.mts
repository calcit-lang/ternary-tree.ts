import { deepEqual, overwriteComparator } from "./utils.mjs";
import "./test-list.mjs";
import "./test-map.mjs";
import { runListTests } from "./test-list.mjs";
import { runMapTests } from "./test-map.mjs";
import { mergeValueHash, overwriteHashGenerator, valueHash } from "./types.mjs";

overwriteComparator((x, y) => {
  // console.log("comparing", x, y);
  return deepEqual(x, y);
});

overwriteHashGenerator((x) => {
  let ret = mergeValueHash(10, valueHash(x));
  // console.log("hashing", x, ret);
  return ret;
});

runListTests();
runMapTests();
