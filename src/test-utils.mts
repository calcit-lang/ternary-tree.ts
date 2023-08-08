import { cmp } from "./utils.mjs";

export let test = (name: string, cb: () => void): void => {
  let target = process?.env["target"];
  if (target == null || name.includes(target)) {
    console.log("Test:", name);
    cb();
  }
};

export let check = (x: boolean): void => {
  if (!x) {
    throw new Error("Test failed");
  }
};

/** compare by reference */
export let checkEqual = (x: any, y: any): void => {
  if (x !== y) {
    console.log("Left:  ", x);
    console.log("Right: ", y);
    throw new Error("Test failed");
  }
};

export function arrayEqual<T>(xs: Array<T>, ys: Array<T>): boolean {
  if (xs.length != ys.length) {
    return false;
  }
  for (let idx = 0; idx < xs.length; idx++) {
    if (xs[idx] !== ys[idx]) {
      return false;
    }
  }
  return true;
}

export let justDisplay = (x: any, y: any): void => {
  console.group("Compare:");
  console.log(x);
  console.log(y);
  console.groupEnd();
};
