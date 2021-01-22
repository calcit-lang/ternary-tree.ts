export type Hash = number;

// https://2ality.com/2012/02/js-integers.html
function modulo(a: number, b: number) {
  return a - Math.floor(a / b) * b;
}
function toUint32(x: number) {
  return modulo(x, Math.pow(2, 32));
}

function toInt32(x: number) {
  var uint32 = toUint32(x);
  if (uint32 >= Math.pow(2, 31)) {
    return uint32 - Math.pow(2, 32);
  } else {
    return uint32;
  }
}

// trying Nim code but JavaScript does not has uint, only float
// https://github.com/nim-lang/Nim/blob/version-1-4/lib/pure/hashes.nim#L54-L73
export let startHash = (h: Hash, val: number): Hash => {
  // h = toUint32(h);
  // val = toUint32(val);
  let res = h + val;
  res = res + (res << 10);
  res = res | (res >>> 6);
  // return toInt32(res);
  return res;
};

export let finishHash = (h: Hash) => {
  // h = toUint32(h);
  let res = h + (h << 3);
  res = res | (res >>> 11);
  res = res + (res << 15);
  // return toInt32(res);
  return res;
};

// export let valueHash = (x: any): number => {
//   let result: number = 0;
//   if (typeof x === "number") {
//     let h = startHash(0, x);
//     result = finishHash(h);
//   } else if (typeof x === "string") {
//     let h = 0;
//     for (var i = 0; i < x.length; i++) {
//       h = startHash(h, x[i].charCodeAt(0));
//     }
//     result = finishHash(h);
//   } else {
//     throw new Error("Hash solution not provided for this type(other than number and string)");
//   }
//   console.log("hash for x:", x, "\t", result);
//   return result;
// };

// TODO
// console.log(valueHash(1));
// console.log("a".charCodeAt(0));
// console.log(valueHash("a".charCodeAt(0)));
// console.log(valueHash("a"));
// console.log(valueHash("2"));

// js outputs
// 07143837
// 97
// -586335745
// -586335745
// -1837488922

// Nim outputs
// 8641844181895329213
// 97
// 661948602591176288
// 661948602591176288
// 19522071
