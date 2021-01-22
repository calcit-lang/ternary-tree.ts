import { deepEqual, overwriteComparator } from "./utils";
import "./test-list";
import "./test-map";
import { runListTests } from "./test-list";
import { runMapTests } from "./test-map";
import { mergeValueHash, overwriteHashGenerator, valueHash } from "./types";

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
