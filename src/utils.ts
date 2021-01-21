export let roughIntPow = (x: number, times: number): number => {
  if (times < 1) {
    return x;
  }

  let result = 1;
  for (let idx = 0; idx < times; idx++) {
    result = result * x;
  }
  return result;
};

export let divideTernarySizes = (size: number): { left: number; middle: number; right: number } => {
  if (size < 0) {
    throw new Error("Unexpected negative size");
  }
  let extra = size % 3;
  let groupSize = Math.floor(size / 3);
  var leftSize = groupSize;
  var middleSize = groupSize;
  var rightSize = groupSize;

  switch (extra) {
    case 0:
      break;
    case 1:
      middleSize = middleSize + 1;
      break;
    case 2:
      leftSize = leftSize + 1;
      rightSize = rightSize + 1;
      break;
    default:
      throw new Error(`Unexpected mod result ${extra}`);
  }

  return { left: leftSize, middle: middleSize, right: rightSize };
};

export function shallowCloneArray<T>(xs: Array<T>): Array<T> {
  let ys: Array<T> = [];
  for (let item of xs) {
    ys.push(item);
  }
  return ys;
}

export let test = (name: string, cb: () => void): void => {
  console.log("Test:", name);
  cb();
};

export let check = (x: boolean): void => {
  if (!x) {
    throw new Error("Test failed");
  }
};
export let justDisplay = (x: any, y: any): void => {
  console.group("Compare:");
  console.log(x);
  console.log(y);
  console.groupEnd();
};

export let cmp = (x: any, y: any) => {
  if (x < y) {
    return -1;
  }
  if (x > y) {
    return 1;
  }
  return 0;
};

// https://stackoverflow.com/a/25456134/883571
export let deepEqual = function (x: any, y: any) {
  if (x === y) {
    return true;
  } else if (typeof x == "object" && x != null && typeof y == "object" && y != null) {
    if (Object.keys(x).length != Object.keys(y).length) return false;

    for (var prop in x) {
      if (y.hasOwnProperty(prop)) {
        if (!deepEqual(x[prop], y[prop])) return false;
      } else return false;
    }

    return true;
  } else return false;
};

export let arrayEqual = <T>(xs: Array<T>, ys: Array<T>): boolean => {
  if (xs.length != ys.length) {
    return false;
  }
  for (let idx in xs) {
    if (xs[idx] !== ys[idx]) {
      return false;
    }
  }
  return true;
};
