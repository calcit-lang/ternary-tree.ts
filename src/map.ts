import {
  TernaryTreeMap,
  TernaryTreeKind,
  TernaryTreeMapTheLeaf,
  TernaryTreeMapTheBranch,
  TernaryTreeMapKeyValuePair,
  RefInt,
  Option,
  some,
  none,
  Hash,
  hashGenerator,
} from "./types";
import { divideTernarySizes, roughIntPow, cmp, dataEqual } from "./utils";

export type TernaryTreeMapKeyValuePairOfLeaf<K, V> = {
  k: K;
  v: TernaryTreeMap<K, V>;
};

let emptyBranch: TernaryTreeMap<any, any> = null as any;

function getMax<K, V>(tree: TernaryTreeMap<K, V>): Hash {
  if (tree == null) {
    throw new Error("Cannot find max hash of nil");
  }
  switch (tree.kind) {
    case TernaryTreeKind.ternaryTreeLeaf:
      return tree.hash;
    case TernaryTreeKind.ternaryTreeBranch:
      return tree.maxHash;
    default:
      throw new Error("Unknown");
  }
}

function getMin<K, V>(tree: TernaryTreeMap<K, V>): Hash {
  if (tree == null) {
    throw new Error("Cannot find min hash of nil");
  }
  switch (tree.kind) {
    case TernaryTreeKind.ternaryTreeLeaf:
      return tree.hash;
    case TernaryTreeKind.ternaryTreeBranch:
      return tree.minHash;
    default:
      throw new Error("Unknown");
  }
}

export function getMapDepth<K, V>(tree: TernaryTreeMap<K, V>): number {
  // console.log( "calling...", tree)
  if (tree == null) {
    return 0;
  }
  switch (tree.kind) {
    case TernaryTreeKind.ternaryTreeLeaf:
      return 1;
    case TernaryTreeKind.ternaryTreeBranch:
      return Math.max(getMapDepth(tree.left), getMapDepth(tree.middle), getMapDepth(tree.right)) + 1;
    default:
      throw new Error("Unknown");
  }
}

function createLeaf<K, T>(k: K, v: T): TernaryTreeMap<K, T> {
  let result: TernaryTreeMapTheLeaf<K, T> = {
    kind: TernaryTreeKind.ternaryTreeLeaf,
    hash: hashGenerator(k),
    elements: [{ k: k, v: v }],
  };
  return result;
}

function createLeafFromPair<K, T>(item: TernaryTreeMapKeyValuePair<K, T>): TernaryTreeMap<K, T> {
  let result: TernaryTreeMap<K, T> = {
    kind: TernaryTreeKind.ternaryTreeLeaf,
    hash: hashGenerator(item.k),
    elements: [item],
  };
  return result;
}

// this proc is not exported, pick up next proc as the entry.
// pairs must be sorted before passing to proc.
function makeTernaryTreeMap<K, T>(size: number, offset: number, xs: /* var */ Array<TernaryTreeMapKeyValuePairOfLeaf<K, T>>): TernaryTreeMap<K, T> {
  switch (size) {
    case 0: {
      let result: TernaryTreeMapTheBranch<K, T> = {
        kind: TernaryTreeKind.ternaryTreeBranch,
        maxHash: 0,
        minHash: 0,
        left: emptyBranch,
        middle: emptyBranch,
        right: emptyBranch,
        depth: 0,
      };
      return result;
    }
    case 1: {
      let middlePair = xs[offset];
      let hashVal = hashGenerator(middlePair.k);
      let result: TernaryTreeMap<K, T> = {
        kind: TernaryTreeKind.ternaryTreeBranch,
        maxHash: hashVal,
        minHash: hashVal,
        left: emptyBranch,
        right: emptyBranch,
        middle: middlePair.v,
        depth: 1,
      };
      return result;
    }
    case 2: {
      let leftPair = xs[offset];
      let rightPair = xs[offset + 1];
      let result: TernaryTreeMap<K, T> = {
        kind: TernaryTreeKind.ternaryTreeBranch,
        maxHash: hashGenerator(rightPair.k),
        minHash: hashGenerator(leftPair.k),
        middle: emptyBranch,
        left: leftPair.v,
        right: rightPair.v,
        depth: 1,
      };
      return result;
    }
    case 3: {
      let leftPair = xs[offset];
      let middlePair = xs[offset + 1];
      let rightPair = xs[offset + 2];
      let result: TernaryTreeMap<K, T> = {
        kind: TernaryTreeKind.ternaryTreeBranch,
        maxHash: hashGenerator(rightPair.k),
        minHash: hashGenerator(leftPair.k),
        left: leftPair.v,
        middle: middlePair.v,
        right: rightPair.v,
        depth: 1,
      };
      return result;
    }
    default: {
      let divided = divideTernarySizes(size);

      let left = makeTernaryTreeMap(divided.left, offset, xs);
      let middle = makeTernaryTreeMap(divided.middle, offset + divided.left, xs);
      let right = makeTernaryTreeMap(divided.right, offset + divided.left + divided.middle, xs);

      let result: TernaryTreeMap<K, T> = {
        kind: TernaryTreeKind.ternaryTreeBranch,
        maxHash: getMax(right),
        minHash: getMin(left),
        left: left,
        middle: middle,
        right: right,
        depth: Math.max(getMapDepth(left), getMapDepth(middle), getMapDepth(right)) + 1,
      };
      return result;
    }
  }
}

function initTernaryTreeMapFromPairs<K, T>(xs: Array<TernaryTreeMapKeyValuePair<K, T>>): TernaryTreeMap<K, T> {
  let leavesList = xs.map(
    (pair: TernaryTreeMapKeyValuePair<K, T>): TernaryTreeMapKeyValuePairOfLeaf<K, T> => {
      return { k: pair.k, v: createLeafFromPair<K, T>(pair) };
    }
  );
  return makeTernaryTreeMap(leavesList.length, 0, leavesList);
}

export function initTernaryTreeMap<K, T>(t: Map<K, T>): TernaryTreeMap<K, T> {
  let xs = new Array<TernaryTreeMapKeyValuePair<K, T>>(t.size);

  let idx = 0;
  for (let [k, v] of t) {
    xs[idx] = { k, v };
    idx = idx + 1;
  }

  let ys = xs.sort((x, y: TernaryTreeMapKeyValuePair<K, T>): number => {
    let hx = hashGenerator(x.k);
    let hy = hashGenerator(y.k);
    return cmp(hx, hy);
  });

  let result = initTernaryTreeMapFromPairs(ys);
  // checkMapStructure(result);
  return result;
}

// for empty map
export function initEmptyTernaryTreeMap<K, T>(): TernaryTreeMap<K, T> {
  let result: TernaryTreeMapTheBranch<K, T> = {
    kind: TernaryTreeKind.ternaryTreeBranch,
    maxHash: 0,
    minHash: 0,
    left: emptyBranch,
    middle: emptyBranch,
    right: emptyBranch,
    depth: 0,
  };
  return result;
}

export function mapToString<K, V>(tree: TernaryTreeMap<K, V>): string {
  return `TernaryTreeMap[${mapLen(tree)}, ...]`;
}

export function mapLen<K, V>(tree: TernaryTreeMap<K, V>): number {
  if (tree == null) {
    return 0;
  }
  switch (tree.kind) {
    case TernaryTreeKind.ternaryTreeLeaf:
      return 1;
    case TernaryTreeKind.ternaryTreeBranch:
      return mapLen(tree.left) + mapLen(tree.middle) + mapLen(tree.right); // TODO
    default:
      throw new Error("Unknown");
  }
}

export function formatMapInline<K, V>(tree: TernaryTreeMap<K, V>, withHash: boolean = false): string {
  if (tree == null) {
    return "_";
  }
  switch (tree.kind) {
    case TernaryTreeKind.ternaryTreeLeaf:
      if (withHash) {
        return `${tree.hash}->${tree.elements[0].k}:${tree.elements[0].v}`; // TODO show whole list
      } else {
        return `${tree.elements[0].k}:${tree.elements[0].v}`;
      }
    case TernaryTreeKind.ternaryTreeBranch: {
      return "(" + formatMapInline(tree.left, withHash) + " " + formatMapInline(tree.middle, withHash) + " " + formatMapInline(tree.right, withHash) + ")";
    }

    default:
      throw new Error("Unknown");
  }
}

export function isMapEmpty<K, V>(tree: TernaryTreeMap<K, V>): boolean {
  if (tree == null) {
    return true;
  }
  switch (tree.kind) {
    case TernaryTreeKind.ternaryTreeLeaf:
      return false;
    case TernaryTreeKind.ternaryTreeBranch:
      return tree.left == null && tree.middle == null && tree.right == null;
    default:
      throw new Error("Unknown");
  }
}

function collectHashSortedSeq<K, T>(tree: TernaryTreeMap<K, T>, acc: /* var */ Array<[K, T]>, idx: RefInt): void {
  if (tree == null || isMapEmpty(tree)) {
    // discard
  } else {
    switch (tree.kind) {
      case TernaryTreeKind.ternaryTreeLeaf: {
        for (let item of tree.elements) {
          acc[idx.value] = [item.k, item.v];
          idx.value = idx.value + 1;
        }
        break;
      }
      case TernaryTreeKind.ternaryTreeBranch: {
        collectHashSortedSeq(tree.left, acc, idx);
        collectHashSortedSeq(tree.middle, acc, idx);
        collectHashSortedSeq(tree.right, acc, idx);
        break;
      }
      default:
        throw new Error("Unknown");
    }
  }
}

// sorted by hash(tree.key)
export function toHashSortedPairs<K, T>(tree: TernaryTreeMap<K, T>): Array<[K, T]> {
  let acc = new Array<[K, T]>(mapLen(tree));
  let idx: RefInt = { value: 0 };
  collectHashSortedSeq(tree, acc, idx);
  return acc;
}

function collectHashSortedSeqOfLeaf<K, T>(tree: TernaryTreeMap<K, T>, acc: /* var */ Array<TernaryTreeMapKeyValuePairOfLeaf<K, T>>, idx: RefInt): void {
  if (tree == null || isMapEmpty(tree)) {
    // discard
  } else {
    switch (tree.kind) {
      case TernaryTreeKind.ternaryTreeLeaf: {
        for (let pair of tree.elements) {
          let item: TernaryTreeMap<K, T> = {
            kind: TernaryTreeKind.ternaryTreeLeaf,
            hash: tree.hash, // TODO
            elements: [pair],
          };
          acc[idx.value] = { k: pair.k, v: item };
          idx.value = idx.value + 1;
        }
        break;
      }
      case TernaryTreeKind.ternaryTreeBranch: {
        collectHashSortedSeqOfLeaf(tree.left, acc, idx);
        collectHashSortedSeqOfLeaf(tree.middle, acc, idx);
        collectHashSortedSeqOfLeaf(tree.right, acc, idx);
        break;
      }
      default: {
        throw new Error("Unknown");
      }
    }
  }
}

// TODO index items with hash, rather than only key/value's
// for reusing leaves during rebalancing
function toHashSortedSeqOfLeaves<K, T>(tree: TernaryTreeMap<K, T>): Array<TernaryTreeMapKeyValuePairOfLeaf<K, T>> {
  let acc = new Array<TernaryTreeMapKeyValuePairOfLeaf<K, T>>(mapLen(tree));
  let idx: RefInt = { value: 0 };
  collectHashSortedSeqOfLeaf(tree, acc, idx);
  return acc;
}

export function contains<K, T>(tree: TernaryTreeMap<K, T>, item: K, hx: Hash = null as any): boolean {
  if (tree == null) {
    return false;
  }

  // reduce redundant computation by reusing hash result
  hx = hx ?? hashGenerator(item);

  if (tree.kind === TernaryTreeKind.ternaryTreeLeaf) {
    if (hx === tree.hash) {
      for (let idx in tree.elements) {
        let pair = tree.elements[idx];
        if (dataEqual(pair.k, item)) {
          return true;
        }
      }
    }
    return false;
  }

  // echo "looking for: ", hx, " ", item, " in ", tree.formatInline(true)
  for (let branch of [tree.left, tree.middle, tree.right]) {
    if (branch != null) {
      if (branch.kind === TernaryTreeKind.ternaryTreeLeaf) {
        if (branch.hash === hx) {
          return true;
        }
      } else if (hx >= branch.minHash && hx <= branch.maxHash) {
        return contains(branch, item, hx); // TODO
      }
    }
  }

  return false;
}

export function mapGet<K, T>(originalTree: TernaryTreeMap<K, T>, item: K): Option<T> {
  let hx = hashGenerator(item);

  let tree = originalTree;

  whileLoop: while (tree != null) {
    if (tree.kind === TernaryTreeKind.ternaryTreeLeaf) {
      for (let pair of tree.elements) {
        if (dataEqual(pair.k, item)) {
          return some(pair.v);
        }
      }
      return none();
    }

    // echo "looking for: ", hx, " ", item, " in ", tree.formatInline

    for (let branch of [tree.left, tree.middle, tree.right]) {
      if (branch != null) {
        if (branch.kind == TernaryTreeKind.ternaryTreeLeaf) {
          if (branch.hash === hx) {
            for (let pair of branch.elements) {
              if (dataEqual(pair.k, item)) {
                return some(pair.v);
              }
            }
            return none();
          }
        } else if (hx >= branch.minHash && hx <= branch.maxHash) {
          tree = branch;
          continue whileLoop; // notice, it jumps to while loop
        }
      }
    }

    return none();
  }

  return none();
}

// leaves on the left has smaller hashes
// TODO check sizes, hashes
export function checkMapStructure<K, V>(tree: TernaryTreeMap<K, V>): boolean {
  if (tree.kind === TernaryTreeKind.ternaryTreeLeaf) {
    for (let pair of tree.elements) {
      if (tree.hash !== hashGenerator(pair.k)) {
        throw new Error(`Bad hash at leaf node ${tree}`);
      }
    }

    if (mapLen(tree) !== 1) {
      throw new Error(`Bad len at leaf node ${tree}`);
    }
  } else {
    if (tree.left != null && tree.middle != null) {
      if (getMax(tree.left) >= getMin(tree.middle)) {
        throw new Error(`Wrong hash order at left/middle branches ${formatMapInline(tree, true)}`);
      }
    }

    if (tree.left != null && tree.right != null) {
      if (getMax(tree.left) >= getMin(tree.right)) {
        console.log(getMax(tree.left), getMin(tree.right));
        throw new Error(`Wrong hash order at left/right branches ${formatMapInline(tree, true)}`);
      }
    }
    if (tree.middle != null && tree.right != null) {
      if (getMax(tree.middle) >= getMin(tree.right)) {
        throw new Error(`Wrong hash order at middle/right branches ${formatMapInline(tree, true)}`);
      }
    }

    if (tree.left != null) {
      checkMapStructure(tree.left);
    }
    if (tree.middle != null) {
      checkMapStructure(tree.middle);
    }
    if (tree.right != null) {
      checkMapStructure(tree.right);
    }
  }

  return true;
}

function rangeContainsHash<K, T>(tree: TernaryTreeMap<K, T>, thisHash: Hash): boolean {
  if (tree == null) {
    return false;
  } else if (tree.kind === TernaryTreeKind.ternaryTreeLeaf) {
    return tree.hash === thisHash;
  } else {
    return thisHash >= tree.minHash && thisHash <= tree.maxHash;
  }
}

export function assocExisted<K, T>(tree: TernaryTreeMap<K, T>, key: K, item: T, thisHash: Hash = null as any): TernaryTreeMap<K, T> {
  if (tree == null || isMapEmpty(tree)) {
    throw new Error("Cannot call assoc on nil");
  }

  thisHash = thisHash ?? hashGenerator(key);

  if (tree.kind === TernaryTreeKind.ternaryTreeLeaf) {
    if (tree.hash !== thisHash) {
      throw new Error("Expected hashes to be identical, otherwise element is missing");
    }
    let newPairs = new Array<TernaryTreeMapKeyValuePair<K, T>>(tree.elements.length);
    let replaced = false;
    for (let idx in tree.elements) {
      let pair = tree.elements[idx];
      if (dataEqual(pair.k, key)) {
        newPairs[idx] = { k: key, v: item };
        replaced = true;
      } else {
        newPairs[idx] = pair;
      }
    }
    if (replaced) {
      let result: TernaryTreeMap<K, T> = { kind: TernaryTreeKind.ternaryTreeLeaf, hash: thisHash, elements: newPairs };
      return result;
    } else {
      throw new Error("Unexpected missing hash in assoc, invalid branch");
    }
  }

  if (thisHash < tree.minHash) throw new Error("Unexpected missing hash in assoc, hash too small");
  else if (thisHash > tree.maxHash) throw new Error("Unexpected missing hash in assoc, hash too large");

  if (tree.left != null)
    if (rangeContainsHash(tree.left, thisHash)) {
      let result: TernaryTreeMapTheBranch<K, T> = {
        kind: TernaryTreeKind.ternaryTreeBranch,
        maxHash: tree.maxHash,
        minHash: tree.minHash,
        left: assocExisted(tree.left, key, item, thisHash),
        middle: tree.middle,
        right: tree.right,
        depth: 0, // TODO
      };
      return result;
    }

  if (tree.middle != null)
    if (rangeContainsHash(tree.middle, thisHash)) {
      let result: TernaryTreeMapTheBranch<K, T> = {
        kind: TernaryTreeKind.ternaryTreeBranch,
        maxHash: tree.maxHash,
        minHash: tree.minHash,
        left: tree.left,
        middle: assocExisted(tree.middle, key, item, thisHash),
        right: tree.right,
        depth: 0, // TODO
      };
      return result;
    }

  if (tree.right != null) {
    if (rangeContainsHash(tree.right, thisHash)) {
      let result: TernaryTreeMapTheBranch<K, T> = {
        kind: TernaryTreeKind.ternaryTreeBranch,
        maxHash: tree.maxHash,
        minHash: tree.minHash,
        left: tree.left,
        middle: tree.middle,
        right: assocExisted(tree.right, key, item, thisHash),
        depth: 0, // TODO
      };
      return result;
    }
  } else {
    throw new Error("Unexpected missing hash in assoc, found not branch");
  }
  return emptyBranch;
}

function assocNew<K, T>(tree: TernaryTreeMap<K, T>, key: K, item: T, thisHash: Hash = null as any): TernaryTreeMap<K, T> {
  // echo fmt"assoc new: {key} to {tree.formatInline}"
  if (tree == null || isMapEmpty(tree)) {
    return createLeaf(key, item);
  }

  thisHash = thisHash ?? hashGenerator(key);

  if (tree.kind === TernaryTreeKind.ternaryTreeLeaf) {
    if (thisHash === tree.hash) {
      for (let pair of tree.elements) {
        if (dataEqual(pair.k, key)) {
          throw new Error("Unexpected existed key in assoc");
        }
      }
      let newPairs = new Array<TernaryTreeMapKeyValuePair<K, T>>(tree.elements.length + 1);
      for (let idx in tree.elements) {
        let pair = tree.elements[idx];
        newPairs[idx] = pair;
      }
      newPairs[tree.elements.length] = { k: key, v: item };
    } else {
      if (thisHash > tree.hash) {
        let childBranch: TernaryTreeMapTheLeaf<K, T> = {
          kind: TernaryTreeKind.ternaryTreeLeaf,
          hash: thisHash,
          elements: [{ k: key, v: item }],
        };
        let result: TernaryTreeMapTheBranch<K, T> = {
          kind: TernaryTreeKind.ternaryTreeBranch,
          maxHash: thisHash,
          minHash: tree.hash,
          left: emptyBranch,
          middle: tree,
          right: childBranch,
          depth: 0, // TODO
        };
        return result;
      } else {
        let childBranch: TernaryTreeMapTheLeaf<K, T> = {
          kind: TernaryTreeKind.ternaryTreeLeaf,
          hash: thisHash,
          elements: [{ k: key, v: item }],
        };
        let result: TernaryTreeMapTheBranch<K, T> = {
          kind: TernaryTreeKind.ternaryTreeBranch,
          maxHash: tree.hash,
          minHash: thisHash,
          left: childBranch,
          middle: tree,
          right: emptyBranch,
          depth: 0, // TODO
        };
        return result;
      }
    }
  } else {
    if (thisHash < tree.minHash) {
      if (tree.left == null) {
        if (tree.middle == null) {
          let childBranch: TernaryTreeMapTheLeaf<K, T> = {
            kind: TernaryTreeKind.ternaryTreeLeaf,
            hash: thisHash,
            elements: [{ k: key, v: item }],
          };
          let result: TernaryTreeMapTheBranch<K, T> = {
            kind: TernaryTreeKind.ternaryTreeBranch,
            maxHash: tree.maxHash,
            minHash: thisHash,
            left: emptyBranch,
            middle: childBranch,
            right: tree.right,
            depth: 0, // TODO
          };
          return result;
        } else {
          let childBranch: TernaryTreeMapTheLeaf<K, T> = {
            kind: TernaryTreeKind.ternaryTreeLeaf,
            hash: thisHash,
            elements: [{ k: key, v: item }],
          };
          let result: TernaryTreeMapTheBranch<K, T> = {
            kind: TernaryTreeKind.ternaryTreeBranch,
            maxHash: tree.maxHash,
            minHash: thisHash,
            left: childBranch,
            middle: tree.middle,
            right: tree.right,
            depth: 0, // TODO
          };
          return result;
        }
      } else if (tree.right == null) {
        let childBranch: TernaryTreeMapTheLeaf<K, T> = {
          kind: TernaryTreeKind.ternaryTreeLeaf,
          hash: thisHash,
          elements: [{ k: key, v: item }],
        };
        let result: TernaryTreeMapTheBranch<K, T> = {
          kind: TernaryTreeKind.ternaryTreeBranch,
          maxHash: tree.maxHash,
          minHash: thisHash,
          left: childBranch,
          middle: tree.left,
          right: tree.middle,
          depth: 0, // TODO
        };
        return result;
      } else {
        let childBranch: TernaryTreeMapTheLeaf<K, T> = {
          kind: TernaryTreeKind.ternaryTreeLeaf,
          hash: thisHash,
          elements: [{ k: key, v: item }],
        };
        let result: TernaryTreeMapTheBranch<K, T> = {
          kind: TernaryTreeKind.ternaryTreeBranch,
          maxHash: tree.maxHash,
          minHash: thisHash,
          left: childBranch,
          middle: tree,
          right: emptyBranch,
          depth: 0, // TODO
        };
        return result;
      }
    }

    if (thisHash > tree.maxHash) {
      if (tree.right == null) {
        if (tree.middle == null) {
          let childBranch: TernaryTreeMapTheLeaf<K, T> = {
            kind: TernaryTreeKind.ternaryTreeLeaf,
            hash: thisHash,
            elements: [{ k: key, v: item }],
          };
          let result: TernaryTreeMapTheBranch<K, T> = {
            kind: TernaryTreeKind.ternaryTreeBranch,
            maxHash: thisHash,
            minHash: tree.minHash,
            left: tree.left,
            middle: childBranch,
            right: emptyBranch,
            depth: 0, // TODO
          };
          return result;
        } else {
          let childBranch: TernaryTreeMapTheLeaf<K, T> = {
            kind: TernaryTreeKind.ternaryTreeLeaf,
            hash: thisHash,
            elements: [{ k: key, v: item }],
          };
          let result: TernaryTreeMapTheBranch<K, T> = {
            kind: TernaryTreeKind.ternaryTreeBranch,
            maxHash: thisHash,
            minHash: tree.minHash,
            left: tree.left,
            middle: tree.middle,
            right: childBranch,
            depth: 0, // TODO
          };
          return result;
        }
      } else if (tree.left == null) {
        let childBranch: TernaryTreeMapTheLeaf<K, T> = {
          kind: TernaryTreeKind.ternaryTreeLeaf,
          hash: thisHash,
          elements: [{ k: key, v: item }],
        };
        let result: TernaryTreeMapTheBranch<K, T> = {
          kind: TernaryTreeKind.ternaryTreeBranch,
          maxHash: thisHash,
          minHash: tree.minHash,
          left: tree.middle,
          middle: tree.right,
          right: childBranch,
          depth: 0, // TODO
        };

        return result;
      } else {
        let childBranch: TernaryTreeMapTheLeaf<K, T> = {
          kind: TernaryTreeKind.ternaryTreeLeaf,
          hash: thisHash,
          elements: [{ k: key, v: item }],
        };
        let result: TernaryTreeMapTheBranch<K, T> = {
          kind: TernaryTreeKind.ternaryTreeBranch,
          maxHash: thisHash,
          minHash: tree.minHash,
          left: emptyBranch,
          middle: tree,
          right: childBranch,
          depth: 0, // TODO
        };

        return result;
      }
    }

    if (rangeContainsHash(tree.left, thisHash)) {
      let result: TernaryTreeMapTheBranch<K, T> = {
        kind: TernaryTreeKind.ternaryTreeBranch,
        maxHash: tree.maxHash,
        minHash: tree.minHash,
        left: assocNew(tree.left, key, item, thisHash),
        middle: tree.middle,
        right: tree.right,
        depth: 0, // TODO
      };
      return result;
    }
    if (rangeContainsHash(tree.middle, thisHash)) {
      let result: TernaryTreeMapTheBranch<K, T> = {
        kind: TernaryTreeKind.ternaryTreeBranch,
        maxHash: tree.maxHash,
        minHash: tree.minHash,
        left: tree.left,
        middle: assocNew(tree.middle, key, item, thisHash),
        right: tree.right,
        depth: 0, // TODO
      };
      return result;
    }
    if (rangeContainsHash(tree.middle, thisHash)) {
      let result: TernaryTreeMapTheBranch<K, T> = {
        kind: TernaryTreeKind.ternaryTreeBranch,
        maxHash: tree.maxHash,
        minHash: tree.minHash,
        left: tree.left,
        middle: tree.middle,
        right: assocNew(tree.right, key, item, thisHash),
        depth: 0, // TODO
      };
      return result;
    }

    if (tree.middle != null) {
      if (thisHash < getMin(tree.middle)) {
        let result: TernaryTreeMapTheBranch<K, T> = {
          kind: TernaryTreeKind.ternaryTreeBranch,
          maxHash: tree.maxHash,
          minHash: tree.minHash,
          left: assocNew(tree.left, key, item, thisHash),
          middle: tree.middle,
          right: tree.right,
          depth: 0, // TODO
        };
        return result;
      } else {
        let result: TernaryTreeMap<K, T> = {
          kind: TernaryTreeKind.ternaryTreeBranch,
          maxHash: tree.maxHash,
          minHash: tree.minHash,
          left: tree.left,
          middle: tree.middle,
          right: assocNew(tree.right, key, item, thisHash),
          depth: 0, // TODO
        };
        return result;
      }
    }

    // not outbound, not at any branch, and middle is empty, so put in middle
    let result: TernaryTreeMapTheBranch<K, T> = {
      kind: TernaryTreeKind.ternaryTreeBranch,
      maxHash: tree.maxHash,
      minHash: tree.minHash,
      left: tree.left,
      middle: assocNew(tree.middle, key, item, thisHash),
      right: tree.right,
      depth: 0, // TODO
    };
    return result;
  }

  return emptyBranch;
}

export function assocMap<K, T>(tree: TernaryTreeMap<K, T>, key: K, item: T, disableBalancing: boolean = false): TernaryTreeMap<K, T> {
  if (tree == null || isMapEmpty(tree)) {
    return createLeaf(key, item);
  }

  if (contains(tree, key)) {
    return assocExisted(tree, key, item);
  } else {
    return assocNew(tree, key, item);
  }
}

function dissocExisted<K, T>(tree: TernaryTreeMap<K, T>, key: K): TernaryTreeMap<K, T> {
  if (tree == null) {
    throw new Error("Unexpected missing key in dissoc");
  }

  if (tree.kind === TernaryTreeKind.ternaryTreeLeaf) {
    if (tree.hash === hashGenerator(key)) {
      let newPairs: Array<TernaryTreeMapKeyValuePair<K, T>> = [];
      for (let pair of tree.elements) {
        if (!dataEqual(pair.k, key)) {
          newPairs.push(pair);
        }
      }
      if (newPairs.length > 0) {
        let result: TernaryTreeMapTheLeaf<K, T> = { kind: TernaryTreeKind.ternaryTreeLeaf, hash: tree.hash, elements: newPairs };
        return result;
      } else {
        return emptyBranch;
      }
    } else {
      throw new Error("Unexpected missing key in dissoc on leaf");
    }
  }

  if (mapLen(tree) === 1) {
    if (!contains(tree, key)) {
      throw new Error("Unexpected missing key in dissoc single branch");
    }
    return emptyBranch;
  }

  let thisHash = hashGenerator(key);

  if (rangeContainsHash(tree.left, thisHash)) {
    let changedBranch = dissocExisted(tree.left, key);
    let minHash: number;
    if (changedBranch != null) {
      minHash = getMin(changedBranch);
    } else if (tree.middle != null) {
      minHash = getMin(tree.middle);
    } else {
      minHash = getMin(tree.right);
    }

    let result: TernaryTreeMapTheBranch<K, T> = {
      kind: TernaryTreeKind.ternaryTreeBranch,
      maxHash: tree.maxHash,
      minHash: minHash,
      left: changedBranch,
      middle: tree.middle,
      right: tree.right,
      depth: 0, // TODO
    };
    return result;
  }

  if (rangeContainsHash(tree.middle, thisHash)) {
    let changedBranch = dissocExisted(tree.middle, key);

    let result: TernaryTreeMapTheBranch<K, T> = {
      kind: TernaryTreeKind.ternaryTreeBranch,
      maxHash: getMax(tree),
      minHash: tree.minHash,
      left: tree.left,
      middle: changedBranch,
      right: tree.right,
      depth: 0, // TODO
    };
    return result;
  }

  if (rangeContainsHash(tree.right, thisHash)) {
    let changedBranch = dissocExisted(tree.right, key);

    let maxHash: number;
    if (changedBranch != null) {
      maxHash = getMax(changedBranch);
    } else if (tree.middle != null) {
      maxHash = getMax(tree.middle);
    } else {
      maxHash = getMax(tree.left);
    }

    let result: TernaryTreeMapTheBranch<K, T> = {
      kind: TernaryTreeKind.ternaryTreeBranch,
      maxHash: maxHash,
      minHash: tree.minHash,
      left: tree.left,
      middle: tree.middle,
      right: changedBranch,
      depth: 0, // TODO
    };
    return result;
  }

  throw new Error("Cannot find branch in dissoc");
}

export function dissocMap<K, T>(tree: TernaryTreeMap<K, T>, key: K): TernaryTreeMap<K, T> {
  if (contains(tree, key)) {
    return dissocExisted(tree, key);
  } else {
    return tree;
  }
}

export function mapEach<K, T>(tree: TernaryTreeMap<K, T>, f: (k: K, v: T) => void): void {
  if (tree == null) {
    return;
  }
  if (tree.kind === TernaryTreeKind.ternaryTreeLeaf) {
    for (let pair of tree.elements) {
      f(pair.k, pair.v);
    }
  } else {
    mapEach(tree.left, f);
    mapEach(tree.middle, f);
    mapEach(tree.right, f);
  }
}

export function toPairs<K, T>(tree: TernaryTreeMap<K, T>): Array<TernaryTreeMapKeyValuePair<K, T>> {
  let result: Array<TernaryTreeMapKeyValuePair<K, T>> = [];
  if (tree == null) {
    return [];
  }
  if (tree.kind === TernaryTreeKind.ternaryTreeLeaf) {
    for (let pair of tree.elements) {
      result.push(pair);
    }
  } else {
    for (let branch of [tree.left, tree.middle, tree.right]) {
      for (let item of toPairs(branch)) {
        result.push(item);
      }
    }
  }

  return result;
}

export function* toPairsIterator<K, T>(tree: TernaryTreeMap<K, T>): Generator<[K, T]> {
  let seqItems = toHashSortedPairs(tree);

  for (let item of seqItems) {
    yield item;
  }
}

export function mapKeys<K, T>(tree: TernaryTreeMap<K, T>): Array<K> {
  let result: Array<K> = [];

  if (tree == null) {
    return [];
  }
  if (tree.kind === TernaryTreeKind.ternaryTreeLeaf) {
    for (let pair of tree.elements) {
      result.push(pair.k);
    }
  } else {
    for (let branch of [tree.left, tree.middle, tree.right]) {
      for (let item of mapKeys(branch)) {
        result.push(item);
      }
    }
  }
  return result;
}

export function* mapItems<K, T>(tree: TernaryTreeMap<K, T>): Generator<K> {
  let seqItems = mapKeys(tree);

  for (let x of seqItems) {
    yield x;
  }
}

function pairToString<K, V>(p: TernaryTreeMapKeyValuePair<K, V>): string {
  return `${p.k}:${p.v}`;
}

export function mapEqual<K, V>(xs: TernaryTreeMap<K, V>, ys: TernaryTreeMap<K, V>): boolean {
  if (xs === ys) {
    return true;
  }
  if (mapLen(xs) !== mapLen(ys)) {
    return false;
  }

  if (isMapEmpty(xs)) {
    return true;
  }

  let keys = mapKeys(xs);
  for (let key of keys) {
    let vx = mapGet(xs, key);
    let vy = mapGet(ys, key);
    if (vx.existed !== vy.existed) {
      return false;
    }
    // TODO compare deep structures
    if (!dataEqual(vx.value, vy.value)) {
      return false;
    }
  }

  return true;
}

export function merge<K, T>(xs: TernaryTreeMap<K, T>, ys: TernaryTreeMap<K, T>): TernaryTreeMap<K, T> {
  let ret = xs;
  let counted = 0;
  mapEach(ys, (key: K, item: T): void => {
    ret = assocMap(ret, key, item);
    // # TODO pickd loop by experience
    if (counted > 700) {
      forceMapInplaceBalancing(ret);
      counted = 0;
    } else {
      counted = counted + 1;
    }
  });
  return ret;
}

// # skip a value, mostly for nil
export function mergeSkip<K, T>(xs: TernaryTreeMap<K, T>, ys: TernaryTreeMap<K, T>, skipped: T): TernaryTreeMap<K, T> {
  let ret = xs;
  let counted = 0;
  mapEach(ys, (key: K, item: T): void => {
    if (dataEqual(item, skipped)) {
      return;
    }
    ret = assocMap(ret, key, item);
    // # TODO pickd loop by experience
    if (counted > 700) {
      forceMapInplaceBalancing(ret);
      counted = 0;
    } else {
      counted = counted + 1;
    }
  });
  return ret;
}

// this function mutates original tree to make it more balanced
export function forceMapInplaceBalancing<K, T>(tree: TernaryTreeMap<K, T>): void {
  // echo "Force inplace balancing of list"
  if (tree.kind === TernaryTreeKind.ternaryTreeBranch) {
    let xs = toHashSortedSeqOfLeaves(tree);
    let newTree = makeTernaryTreeMap(xs.length, 0, xs) as TernaryTreeMapTheBranch<K, T>;
    tree.left = newTree.left;
    tree.middle = newTree.middle;
    tree.right = newTree.right;
  } else {
    // discard
  }
}

export function sameMapShape<K, T>(xs: TernaryTreeMap<K, T>, ys: TernaryTreeMap<K, T>): boolean {
  if (xs == null) {
    if (ys == null) {
      return true;
    } else {
      return false;
    }
  }
  if (ys == null) {
    return false;
  }

  if (mapLen(xs) !== mapLen(ys)) {
    return false;
  }

  if (xs.kind !== ys.kind) {
    return false;
  }

  if (xs.kind === TernaryTreeKind.ternaryTreeLeaf && ys.kind === TernaryTreeKind.ternaryTreeLeaf) {
    if (xs.elements.length !== ys.elements.length) {
      return false;
    }
    for (let idx = 0; idx < xs.elements.length; idx++) {
      if (!dataEqual(xs.elements[idx], ys.elements[idx])) {
        return false;
      }
    }
    return true;
  } else if (xs.kind === TernaryTreeKind.ternaryTreeBranch && ys.kind === TernaryTreeKind.ternaryTreeBranch) {
    if (!sameMapShape(xs.left, ys.left)) {
      return false;
    }

    if (!sameMapShape(xs.middle, ys.middle)) {
      return false;
    }

    if (!sameMapShape(xs.right, ys.right)) {
      return false;
    }

    return true;
  } else {
    throw new Error("Unknown");
  }
}
