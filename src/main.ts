import { deepEqual, overwriteComparator } from "./utils";
import "./test-list";
import "./test-map";
import { runListTests } from "./test-list";
import { runMapTests } from "./test-map";

overwriteComparator((x, y) => {
  console.log("comparing", x, y);
  return deepEqual(x, y);
});

runListTests();
runMapTests();
