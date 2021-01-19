export let roughIntPow = (x: number, times: number): number => {
  if (times < 1) {
    return x;
  }

  let result = 1;
  for (let idx = 0; idx < times; i++) {
    result = result * x;
  }
  return result;
};

export let divideTernarySizes = (
  size: number
): { left: number; middle: number; right: number } => {
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
