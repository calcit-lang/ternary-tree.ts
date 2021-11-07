import { TernaryTreeMap, TernaryTreeKind, TernaryTreeMapTheLeaf, TernaryTreeMapTheBranch, RefInt, Hash, hashGenerator, TernaryTreeMapHashEntry } from "./types";
import { divideTernarySizes, roughIntPow, cmp, dataEqual } from "./utils";

let emptyBranch: TernaryTreeMap<any, any> = null as any;
let nilResult = null as any;

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
    elements: [[k, v]],
  };
  return result;
}

function createLeafFromHashEntry<K, T>(item: TernaryTreeMapHashEntry<K, T>): TernaryTreeMap<K, T> {
  let result: TernaryTreeMap<K, T> = {
    kind: TernaryTreeKind.ternaryTreeLeaf,
    hash: item.hash,
    elements: item.pairs,
  };
  return result;
}

// this proc is not exported, pick up next proc as the entry.
// pairs must be sorted before passing to proc.
function makeTernaryTreeMap<K, T>(size: number, offset: number, xs: /* var */ Array<TernaryTreeMapHashEntry<K, T>>): TernaryTreeMap<K, T> {
  switch (size) {
    case 0: {
      let result: TernaryTreeMap<K, T> = emptyBranch;
      return result;
    }
    case 1: {
      let leftPair = xs[offset];
      let result: TernaryTreeMap<K, T> = createLeafFromHashEntry(leftPair);
      return result;
    }
    case 2: {
      let leftPair = xs[offset];
      let middlePair = xs[offset + 1];
      let result: TernaryTreeMap<K, T> = {
        kind: TernaryTreeKind.ternaryTreeBranch,
        maxHash: middlePair.hash,
        minHash: leftPair.hash,
        left: createLeafFromHashEntry(leftPair),
        middle: createLeafFromHashEntry(middlePair),
        right: emptyBranch,
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
        maxHash: rightPair.hash,
        minHash: leftPair.hash,
        left: createLeafFromHashEntry(leftPair),
        middle: createLeafFromHashEntry(middlePair),
        right: createLeafFromHashEntry(rightPair),
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

export function initTernaryTreeMapFromHashEntries<K, T>(xs: Array<TernaryTreeMapHashEntry<K, T>>): TernaryTreeMap<K, T> {
  return makeTernaryTreeMap(xs.length, 0, xs);
}

export function initTernaryTreeMap<K, T>(t: Map<K, T>): TernaryTreeMap<K, T> {
  let groupBuffers: Map<number, Array<[K, T]>> = new Map();
  let xs: Array<TernaryTreeMapHashEntry<K, T>> = [];
  for (let [k, v] of t) {
    let h = hashGenerator(k);
    if (groupBuffers.has(h)) {
      let branch = groupBuffers.get(h);
      if (branch != null) {
        branch.push([k, v]);
      } else {
        throw new Error("Expected referece to pairs");
      }
    } else {
      let pairs: [K, T][] = [[k, v]];
      groupBuffers.set(h, pairs);
      xs.push({
        hash: h,
        pairs,
      });
    }
  }

  for (let [k, v] of groupBuffers) {
    if (v != null) {
    } else {
      throw new Error("Expected reference to paris");
    }
  }

  // MUTABLE in-place sort
  xs.sort((a, b) => cmp(a.hash, b.hash));

  let result = initTernaryTreeMapFromHashEntries(xs);
  // checkMapStructure(result);
  return result;
}

// use for..in for performance
export function initTernaryTreeMapFromArray<K, T>(t: Array<[K, T]>): TernaryTreeMap<K, T> {
  let groupBuffers: Record<number, Array<[K, T]>> = {};
  let xs: Array<TernaryTreeMapHashEntry<K, T>> = [];
  for (let idx = 0; idx < t.length; idx++) {
    let k = t[idx][0];
    let v = t[idx][1];
    let h = hashGenerator(k);
    if (groupBuffers[h] != null) {
      let branch = groupBuffers[h];
      if (branch != null) {
        branch.push([k, v]);
      } else {
        throw new Error("Expected referece to pairs");
      }
    } else {
      let pairs: [K, T][] = [[k, v]];
      groupBuffers[h] = pairs;
      xs.push({
        hash: h,
        pairs: pairs,
      });
    }
  }

  // MUTABLE in-place sort
  xs.sort((a, b) => cmp(a.hash, b.hash));

  let result = initTernaryTreeMapFromHashEntries(xs);
  // checkMapStructure(result);
  return result;
}

// for empty map
export function initEmptyTernaryTreeMap<K, T>(): TernaryTreeMap<K, T> {
  let result: TernaryTreeMap<K, T> = emptyBranch;
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
      return tree.elements.length;
    case TernaryTreeKind.ternaryTreeBranch:
      return mapLen(tree.left) + mapLen(tree.middle) + mapLen(tree.right); // TODO
    default:
      throw new Error("Unknown");
  }
}

// when size succeeds bound, no longer counting, faster than traversing whole tree
export function mapLenBound<K, V>(tree: TernaryTreeMap<K, V>, bound: number): number {
  if (tree == null) {
    return 0;
  }
  switch (tree.kind) {
    case TernaryTreeKind.ternaryTreeLeaf:
      return tree.elements.length;
    case TernaryTreeKind.ternaryTreeBranch:
      let ret = mapLenBound(tree.left, bound);
      if (ret > bound) {
        return ret;
      }
      ret = ret + mapLenBound(tree.middle, bound);
      if (ret > bound) {
        return ret;
      }
      ret = ret + mapLenBound(tree.right, bound);
      return ret;
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
        return `${tree.hash}->${tree.elements[0][0]}:${tree.elements[0][1]}`; // TODO show whole list
      } else {
        return `${tree.elements[0][0]}:${tree.elements[0][1]}`;
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

export function isMapOfOne<K, V>(tree: TernaryTreeMap<K, V>, counted: number = 0): boolean {
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

function collectHashSortedArray<K, T>(tree: TernaryTreeMap<K, T>, acc: /* var */ Array<[K, T]>, idx: RefInt): void {
  if (tree == null || isMapEmpty(tree)) {
    // discard
  } else {
    switch (tree.kind) {
      case TernaryTreeKind.ternaryTreeLeaf: {
        for (let i = 0; i < tree.elements.length; i++) {
          let item = tree.elements[i];
          acc[idx.value] = item;
          idx.value = idx.value + 1;
        }
        break;
      }
      case TernaryTreeKind.ternaryTreeBranch: {
        collectHashSortedArray(tree.left, acc, idx);
        collectHashSortedArray(tree.middle, acc, idx);
        collectHashSortedArray(tree.right, acc, idx);
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
  collectHashSortedArray(tree, acc, idx);
  return acc;
}

function collectOrderedHashEntries<K, T>(tree: TernaryTreeMap<K, T>, acc: /* var */ Array<TernaryTreeMapHashEntry<K, T>>, idx: RefInt): void {
  if (tree == null || isMapEmpty(tree)) {
    // discard
  } else {
    switch (tree.kind) {
      case TernaryTreeKind.ternaryTreeLeaf: {
        acc[idx.value] = { hash: tree.hash, pairs: tree.elements };
        idx.value = idx.value + 1;
        break;
      }
      case TernaryTreeKind.ternaryTreeBranch: {
        collectOrderedHashEntries(tree.left, acc, idx);
        collectOrderedHashEntries(tree.middle, acc, idx);
        collectOrderedHashEntries(tree.right, acc, idx);
        break;
      }
      default: {
        throw new Error("Unknown");
      }
    }
  }
}

// for reusing leaves during rebalancing
function toOrderedHashEntries<K, T>(tree: TernaryTreeMap<K, T>): Array<TernaryTreeMapHashEntry<K, T>> {
  let acc = new Array<TernaryTreeMapHashEntry<K, T>>(mapLen(tree));
  let idx: RefInt = { value: 0 };
  collectOrderedHashEntries(tree, acc, idx);
  return acc;
}

export function contains<K, T>(originalTree: TernaryTreeMap<K, T>, item: K): boolean {
  if (originalTree == null) {
    return false;
  }

  // TODO

  // reduce redundant computation by reusing hash result
  let hx = hashGenerator(item);

  let tree = originalTree;

  whileLoop: while (tree != null) {
    if (tree.kind === TernaryTreeKind.ternaryTreeLeaf) {
      if (hx === tree.hash) {
        let size = tree.elements.length;
        for (let idx = 0; idx < size; idx++) {
          let pair = tree.elements[idx];
          if (dataEqual(pair[0], item)) {
            return true;
          }
        }
      }
      return false;
    }

    // echo "looking for: ", hx, " ", item, " in ", tree.formatInline(true)
    if (tree.left == null) {
      return false;
    }
    if (tree.left.kind === TernaryTreeKind.ternaryTreeLeaf) {
      if (hx < tree.left.hash) {
        return false;
      }
      if (tree.left.hash === hx) {
        tree = tree.left;
        continue whileLoop; // notice, it jumps to while loop
      }
    } else {
      if (hx < tree.left.minHash) {
        return false;
      }
      if (hx <= tree.left.maxHash) {
        tree = tree.left;
        continue whileLoop; // notice, it jumps to while loop
      }
    }

    if (tree.middle == null) {
      return false;
    }
    if (tree.middle.kind === TernaryTreeKind.ternaryTreeLeaf) {
      if (hx < tree.middle.hash) {
        return false;
      }
      if (tree.middle.hash === hx) {
        tree = tree.middle;
        continue whileLoop; // notice, it jumps to while loop
      }
    } else {
      if (hx < tree.middle.minHash) {
        return false;
      }
      if (hx <= tree.middle.maxHash) {
        tree = tree.middle;
        continue whileLoop; // notice, it jumps to while loop
      }
    }

    if (tree.right == null) {
      return false;
    }
    if (tree.right.kind === TernaryTreeKind.ternaryTreeLeaf) {
      if (hx < tree.right.hash) {
        return false;
      }
      if (tree.right.hash === hx) {
        tree = tree.right;
        continue whileLoop; // notice, it jumps to while loop
      }
    } else {
      if (hx < tree.right.minHash) {
        return false;
      }
      if (hx <= tree.right.maxHash) {
        tree = tree.right;
        continue whileLoop; // notice, it jumps to while loop
      }
    }
    return false;
  }

  return false;
}

export function mapGetDefault<K, T>(originalTree: TernaryTreeMap<K, T>, item: K, v0: T): T {
  let hx = hashGenerator(item);

  let tree = originalTree;

  whileLoop: while (tree != null) {
    if (tree.kind === TernaryTreeKind.ternaryTreeLeaf) {
      let size = tree.elements.length;
      for (let i = 0; i < size; i++) {
        let pair = tree.elements[i];
        if (dataEqual(pair[0], item)) {
          return pair[1];
        }
      }
      return v0;
    }

    // echo "looking for: ", hx, " ", item, " in ", tree.formatInline

    if (tree.left == null) {
      return v0;
    }
    if (tree.left.kind == TernaryTreeKind.ternaryTreeLeaf) {
      if (hx < tree.left.hash) {
        return v0;
      }
      if (tree.left.hash === hx) {
        tree = tree.left;
        continue whileLoop; // notice, it jumps to while loop
      }
    } else {
      if (hx < tree.left.minHash) {
        return v0;
      }
      if (hx <= tree.left.maxHash) {
        tree = tree.left;
        continue whileLoop; // notice, it jumps to while loop
      }
    }

    if (tree.middle == null) {
      return v0;
    }
    if (tree.middle.kind == TernaryTreeKind.ternaryTreeLeaf) {
      if (hx < tree.middle.hash) {
        return v0;
      }
      if (tree.middle.hash === hx) {
        tree = tree.middle;
        continue whileLoop; // notice, it jumps to while loop
      }
    } else {
      if (hx < tree.middle.minHash) {
        return v0;
      }
      if (hx <= tree.middle.maxHash) {
        tree = tree.middle;
        continue whileLoop; // notice, it jumps to while loop
      }
    }

    if (tree.right == null) {
      return v0;
    }
    if (tree.right.kind == TernaryTreeKind.ternaryTreeLeaf) {
      if (hx < tree.right.hash) {
        return v0;
      }
      if (tree.right.hash === hx) {
        tree = tree.right;
        continue whileLoop; // notice, it jumps to while loop
      }
    } else {
      if (hx < tree.right.minHash) {
        return v0;
      }
      if (hx <= tree.right.maxHash) {
        tree = tree.right;
        continue whileLoop; // notice, it jumps to while loop
      }
    }

    return v0;
  }

  return v0;
}

// leaves on the left has smaller hashes
// TODO check sizes, hashes
export function checkMapStructure<K, V>(tree: TernaryTreeMap<K, V>): boolean {
  if (tree.kind === TernaryTreeKind.ternaryTreeLeaf) {
    for (let i = 0; i < tree.elements.length; i++) {
      let pair = tree.elements[i];
      if (pair.length !== 2) {
        throw new Error("Expected pair to br [k,v] :" + pair);
      }
      if (tree.hash !== hashGenerator(pair[0])) {
        throw new Error(`Bad hash at leaf node ${tree}`);
      }
    }

    if (mapLenBound(tree, 2) !== 1) {
      throw new Error(`Bad len at leaf node ${tree}`);
    }
  } else {
    if (tree.left == null) {
      if (tree.middle != null) {
        throw new Error("Layout is not compact");
      }
      if (tree.middle != null) {
        throw new Error("Layout is not compact");
      }
    }
    if (tree.middle == null) {
      if (tree.right != null) {
        throw new Error("Layout is not compact");
      }
    }
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

function assocExisted<K, T>(tree: TernaryTreeMap<K, T>, key: K, item: T, thisHash: Hash = null as any): TernaryTreeMap<K, T> {
  if (tree == null || isMapEmpty(tree)) {
    throw new Error("Cannot call assoc on nil");
  }

  thisHash = thisHash ?? hashGenerator(key);

  if (tree.kind === TernaryTreeKind.ternaryTreeLeaf) {
    if (tree.hash !== thisHash) {
      throw new Error("Expected hashes to be identical, otherwise element is missing");
    }
    let newPairs = new Array<[K, T]>(tree.elements.length);
    let replaced = false;
    let size = tree.elements.length;
    for (let idx = 0; idx < size; idx++) {
      let pair = tree.elements[idx];
      if (dataEqual(pair[0], key)) {
        newPairs[idx] = [key, item];
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

  if (tree.left == null) {
    throw new Error("Unexpected missing hash in assoc, found not branch");
  }
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

  if (tree.middle == null) {
    throw new Error("Unexpected missing hash in assoc, found not branch");
  }
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

  if (tree.right == null) {
    throw new Error("Unexpected missing hash in assoc, found not branch");
  }
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
  throw new Error("Unexpected missing hash in assoc, found not branch");
}

function assocNew<K, T>(tree: TernaryTreeMap<K, T>, key: K, item: T, thisHash: Hash = null as any): TernaryTreeMap<K, T> {
  // echo fmt"assoc new: {key} to {tree.formatInline}"
  if (tree == null || isMapEmpty(tree)) {
    return createLeaf(key, item);
  }

  thisHash = thisHash ?? hashGenerator(key);

  if (tree.kind === TernaryTreeKind.ternaryTreeLeaf) {
    if (thisHash > tree.hash) {
      let childBranch: TernaryTreeMapTheLeaf<K, T> = {
        kind: TernaryTreeKind.ternaryTreeLeaf,
        hash: thisHash,
        elements: [[key, item]],
      };
      let result: TernaryTreeMapTheBranch<K, T> = {
        kind: TernaryTreeKind.ternaryTreeBranch,
        maxHash: thisHash,
        minHash: tree.hash,
        left: tree,
        middle: childBranch,
        right: emptyBranch,
        depth: 0, // TODO
      };
      return result;
    } else if (thisHash < tree.hash) {
      let childBranch: TernaryTreeMapTheLeaf<K, T> = {
        kind: TernaryTreeKind.ternaryTreeLeaf,
        hash: thisHash,
        elements: [[key, item]],
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
    } else {
      let size = tree.elements.length;
      for (let i = 0; i < size; i++) {
        let pair = tree.elements[i];
        if (dataEqual(pair[0], key)) {
          throw new Error("Unexpected existed key in assoc");
        }
      }
      let newPairs = new Array<[K, T]>(tree.elements.length + 1);
      for (let idx = 0; idx < size; idx++) {
        let pair = tree.elements[idx];
        newPairs[idx] = pair;
      }
      newPairs[tree.elements.length] = [key, item];
      let result: TernaryTreeMapTheLeaf<K, T> = {
        kind: TernaryTreeKind.ternaryTreeLeaf,
        hash: tree.hash,
        elements: newPairs,
      };
      return result;
    }
  } else {
    if (thisHash < tree.minHash) {
      if (tree.right == null) {
        let childBranch: TernaryTreeMapTheLeaf<K, T> = {
          kind: TernaryTreeKind.ternaryTreeLeaf,
          hash: thisHash,
          elements: [[key, item]],
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
          elements: [[key, item]],
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
      // in compact layout, left arm must be existed
      if (tree.middle == null) {
        let childBranch: TernaryTreeMapTheLeaf<K, T> = {
          kind: TernaryTreeKind.ternaryTreeLeaf,
          hash: thisHash,
          elements: [[key, item]],
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
      } else if (tree.right == null) {
        let childBranch: TernaryTreeMapTheLeaf<K, T> = {
          kind: TernaryTreeKind.ternaryTreeLeaf,
          hash: thisHash,
          elements: [[key, item]],
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
      } else {
        let childBranch: TernaryTreeMapTheLeaf<K, T> = {
          kind: TernaryTreeKind.ternaryTreeLeaf,
          hash: thisHash,
          elements: [[key, item]],
        };
        let result: TernaryTreeMapTheBranch<K, T> = {
          kind: TernaryTreeKind.ternaryTreeBranch,
          maxHash: thisHash,
          minHash: tree.minHash,
          left: tree,
          middle: childBranch,
          right: emptyBranch,
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
    if (rangeContainsHash(tree.right, thisHash)) {
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

    if (tree.middle == null) {
      throw new Error("unreachable. if inside range, then middle should be here");
    }
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
      let size = tree.elements.length;
      if (size === 1 && dataEqual(key, tree.elements[0][0])) {
        return emptyBranch;
      } else {
        let newPairs: Array<[K, T]> = [];
        for (let i = 0; i < size; i++) {
          let pair = tree.elements[i];
          if (!dataEqual(pair[0], key)) {
            newPairs.push(pair);
          }
        }
        let result: TernaryTreeMapTheLeaf<K, T> = { kind: TernaryTreeKind.ternaryTreeLeaf, hash: tree.hash, elements: newPairs };
        return result;
      }
    } else {
      throw new Error("Unexpected missing key in dissoc on leaf");
    }
  }

  if (mapLenBound(tree, 2) === 1) {
    if (!contains(tree, key)) {
      throw new Error("Unexpected missing key in dissoc single branch");
    }
    return emptyBranch;
  }

  let thisHash = hashGenerator(key);

  if (rangeContainsHash(tree.left, thisHash)) {
    let changedBranch = dissocExisted(tree.left, key);

    if (isMapEmpty(changedBranch)) {
      if (isMapEmpty(tree.right)) {
        return tree.middle;
      }
      let result: TernaryTreeMapTheBranch<K, T> = {
        kind: TernaryTreeKind.ternaryTreeBranch,
        maxHash: tree.maxHash,
        minHash: getMin(tree.middle),
        left: tree.middle,
        middle: tree.right,
        right: emptyBranch,
        depth: 0, // TODO
      };
      return result;
    } else {
      let result: TernaryTreeMapTheBranch<K, T> = {
        kind: TernaryTreeKind.ternaryTreeBranch,
        maxHash: tree.maxHash,
        minHash: getMin(changedBranch),
        left: changedBranch,
        middle: tree.middle,
        right: tree.right,
        depth: 0, // TODO
      };
      return result;
    }
  }

  if (rangeContainsHash(tree.middle, thisHash)) {
    let changedBranch = dissocExisted(tree.middle, key);

    if (isMapEmpty(changedBranch)) {
      if (isMapEmpty(tree.right)) {
        return tree.left;
      }
      let result: TernaryTreeMapTheBranch<K, T> = {
        kind: TernaryTreeKind.ternaryTreeBranch,
        maxHash: tree.maxHash,
        minHash: tree.minHash,
        left: tree.left,
        middle: tree.right,
        right: emptyBranch,
        depth: 0, // TODO
      };
      return result;
    } else {
      let result: TernaryTreeMapTheBranch<K, T> = {
        kind: TernaryTreeKind.ternaryTreeBranch,
        maxHash: tree.maxHash,
        minHash: tree.minHash,
        left: tree.left,
        middle: changedBranch,
        right: tree.right,
        depth: 0, // TODO
      };
      return result;
    }
  }

  if (rangeContainsHash(tree.right, thisHash)) {
    let changedBranch = dissocExisted(tree.right, key);

    if (changedBranch == null) {
      let result: TernaryTreeMapTheBranch<K, T> = {
        kind: TernaryTreeKind.ternaryTreeBranch,
        maxHash: getMax(tree.middle),
        minHash: tree.minHash,
        left: tree.left,
        middle: tree.middle,
        right: emptyBranch,
        depth: 0, // TODO
      };
      return result;
    } else {
      let result: TernaryTreeMapTheBranch<K, T> = {
        kind: TernaryTreeKind.ternaryTreeBranch,
        maxHash: getMax(changedBranch),
        minHash: tree.minHash,
        left: tree.left,
        middle: tree.middle,
        right: changedBranch,
        depth: 0, // TODO
      };
      return result;
    }
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

function collectToPairsArray<K, T>(acc: Array<[K, T]>, tree: TernaryTreeMap<K, T>): void {
  if (tree != null) {
    if (tree.kind === TernaryTreeKind.ternaryTreeLeaf) {
      for (let i = 0; i < tree.elements.length; i++) {
        let pair = tree.elements[i];
        acc.push(pair);
      }
    } else {
      if (tree.left != null) {
        collectToPairsArray(acc, tree.left);
      }
      if (tree.middle != null) {
        collectToPairsArray(acc, tree.middle);
      }
      if (tree.right != null) {
        collectToPairsArray(acc, tree.right);
      }
    }
  }
}

/** similar to `toPairs`, but using Array.push directly */
export function toPairsArray<K, T>(tree: TernaryTreeMap<K, T>): Array<[K, T]> {
  let result: Array<[K, T]> = [];
  collectToPairsArray(result, tree);
  return result;
}

export function* toPairs<K, T>(tree: TernaryTreeMap<K, T>): Generator<[K, T]> {
  if (tree != null) {
    if (tree.kind === TernaryTreeKind.ternaryTreeLeaf) {
      for (let pair of tree.elements) {
        yield pair;
      }
    } else {
      if (tree.left != null) {
        for (let item of toPairs(tree.left)) {
          yield item;
        }
      }
      if (tree.middle != null) {
        for (let item of toPairs(tree.middle)) {
          yield item;
        }
      }
      if (tree.right != null) {
        for (let item of toPairs(tree.right)) {
          yield item;
        }
      }
    }
  }
}

export function* toKeys<K, V>(tree: TernaryTreeMap<K, V>): Generator<K> {
  if (tree != null) {
    if (tree.kind === TernaryTreeKind.ternaryTreeLeaf) {
      for (let i = 0; i < tree.elements.length; i++) {
        let pair = tree.elements[i];
        yield pair[0];
      }
    } else {
      if (tree.left != null) {
        for (let item of toKeys(tree.left)) {
          yield item;
        }
      }
      if (tree.middle != null) {
        for (let item of toKeys(tree.middle)) {
          yield item;
        }
      }
      if (tree.right != null) {
        for (let item of toKeys(tree.right)) {
          yield item;
        }
      }
    }
  }
}

export function* toValues<K, V>(tree: TernaryTreeMap<K, V>): Generator<V> {
  if (tree != null) {
    if (tree.kind === TernaryTreeKind.ternaryTreeLeaf) {
      for (let i = 0; i < tree.elements.length; i++) {
        let pair = tree.elements[i];
        yield pair[1];
      }
    } else {
      if (tree.left != null) {
        for (let item of toValues(tree.left)) {
          yield item;
        }
      }
      if (tree.middle != null) {
        for (let item of toValues(tree.middle)) {
          yield item;
        }
      }
      if (tree.right != null) {
        for (let item of toValues(tree.right)) {
          yield item;
        }
      }
    }
  }
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

  for (let pair of toPairsArray(xs)) {
    let key = pair[0];
    let vx = pair[1];

    if (!contains(ys, key)) {
      return false;
    }
    let vy = mapGetDefault(ys, key, null);

    // TODO compare deep structures
    if (!dataEqual(vx, vy)) {
      return false;
    }
  }

  return true;
}

export function merge<K, T>(xs: TernaryTreeMap<K, T>, ys: TernaryTreeMap<K, T>): TernaryTreeMap<K, T> {
  let ret = xs;
  let counted = 0;
  for (let [key, item] of toPairs(ys)) {
    ret = assocMap(ret, key, item);
    // # TODO pickd loop by experience
    if (counted > 700) {
      forceMapInplaceBalancing(ret);
      counted = 0;
    } else {
      counted = counted + 1;
    }
  }
  return ret;
}

// # skip a value, mostly for nil
export function mergeSkip<K, T>(xs: TernaryTreeMap<K, T>, ys: TernaryTreeMap<K, T>, skipped: T): TernaryTreeMap<K, T> {
  let ret = xs;
  let counted = 0;
  for (let [key, item] of toPairs(ys)) {
    if (dataEqual(item, skipped)) {
      continue;
    }
    ret = assocMap(ret, key, item);
    // # TODO pickd loop by experience
    if (counted > 700) {
      forceMapInplaceBalancing(ret);
      counted = 0;
    } else {
      counted = counted + 1;
    }
  }
  return ret;
}

// this function mutates original tree to make it more balanced
export function forceMapInplaceBalancing<K, T>(tree: TernaryTreeMap<K, T>): void {
  // echo "Force inplace balancing of list"
  if (tree.kind === TernaryTreeKind.ternaryTreeBranch) {
    let xs = toOrderedHashEntries(tree);
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

export function mapMapValues<K, T, V>(tree: TernaryTreeMap<K, T>, f: (x: T) => V): TernaryTreeMap<K, V> {
  if (tree == null) {
    return tree;
  }

  switch (tree.kind) {
    case TernaryTreeKind.ternaryTreeLeaf: {
      let newElements = new Array<[K, V]>(tree.elements.length);
      let size = tree.elements.length;
      for (let idx = 0; idx < size; idx++) {
        newElements[idx] = [tree.elements[idx][0], f(tree.elements[idx][1])];
      }
      let result: TernaryTreeMap<K, V> = {
        kind: TernaryTreeKind.ternaryTreeLeaf,
        hash: tree.hash,
        elements: newElements,
      };
      return result;
    }
    case TernaryTreeKind.ternaryTreeBranch: {
      let result: TernaryTreeMap<K, V> = {
        kind: TernaryTreeKind.ternaryTreeBranch,
        depth: tree.depth,
        minHash: tree.minHash,
        maxHash: tree.maxHash,
        left: mapMapValues(tree.left, f),
        middle: mapMapValues(tree.middle, f),
        right: mapMapValues(tree.right, f),
      };
      return result;
    }
  }
}
