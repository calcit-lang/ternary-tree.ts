import { RefInt, TernaryTreeKind, TernaryTreeList, TernaryTreeListTheBranch } from "./types.mjs";
import { dataEqual, divideTernarySizes, roughIntPow } from "./utils.mjs";

// just get, will not compute recursively
export function getDepth<T>(tree: TernaryTreeList<T>): number {
  if (tree == null) return 0;
  switch (tree.kind) {
    case TernaryTreeKind.ternaryTreeLeaf:
      return 1;
    case TernaryTreeKind.ternaryTreeBranch:
      return tree.depth;
  }
}

let emptyBranch: TernaryTreeList<any> = null as any;

let isEmptyBranch = (x: TernaryTreeList<any>) => {
  if (x == null) {
    return true;
  }
  return x.size == 0;
};

function decideParentDepth<T>(...xs: Array<TernaryTreeList<T>>): number {
  let depth = 0;
  for (let i = 0; i < xs.length; i++) {
    let x = xs[i];
    let y = getDepth(x);
    if (y > depth) {
      depth = y;
    }
  }
  return depth + 1;
}

export function makeTernaryTreeList<T>(size: number, offset: number, xs: /* var */ Array<TernaryTreeList<T>>): TernaryTreeList<T> {
  switch (size) {
    case 0: {
      return { kind: TernaryTreeKind.ternaryTreeBranch, size: 0, depth: 1, left: emptyBranch, middle: emptyBranch, right: emptyBranch } as TernaryTreeList<T>;
    }
    case 1:
      return xs[offset];
    case 2: {
      let left = xs[offset];
      let middle = xs[offset + 1];
      let result: TernaryTreeList<T> = {
        kind: TernaryTreeKind.ternaryTreeBranch,
        size: listLen(left) + listLen(middle),
        left: left,
        middle: middle,
        right: emptyBranch,
        depth: decideParentDepth(left, middle),
      };
      checkListStructure(result);
      return result;
    }
    case 3: {
      let left = xs[offset];
      let middle = xs[offset + 1];
      let right = xs[offset + 2];
      let result: TernaryTreeList<T> = {
        kind: TernaryTreeKind.ternaryTreeBranch,
        size: listLen(left) + listLen(middle) + listLen(right),
        left: left,
        middle: middle,
        right: right,
        depth: decideParentDepth(left, middle, right),
      };
      checkListStructure(result);
      return result;
    }
    default: {
      let divided = divideTernarySizes(size);

      let left = makeTernaryTreeList(divided.left, offset, xs);
      let middle = makeTernaryTreeList(divided.middle, offset + divided.left, xs);
      let right = makeTernaryTreeList(divided.right, offset + divided.left + divided.middle, xs);
      let result: TernaryTreeList<T> = {
        kind: TernaryTreeKind.ternaryTreeBranch,
        size: listLen(left) + listLen(middle) + listLen(right),
        depth: decideParentDepth(left, middle, right),
        left: left,
        middle: middle,
        right: right,
      };
      checkListStructure(result);
      return result;
    }
  }
}

export function initTernaryTreeList<T>(xs: Array<T>): TernaryTreeList<T> {
  let ys = new Array<TernaryTreeList<T>>(xs.length);
  let size = xs.length;
  for (let idx = 0; idx < size; idx++) {
    let x = xs[idx];
    ys[idx] = { kind: TernaryTreeKind.ternaryTreeLeaf, size: 1, value: x };
  }
  return makeTernaryTreeList(xs.length, 0, ys);
}

// from a slice of an existed array
export function initTernaryTreeListFromRange<T>(xs: Array<T>, from: number, to: number): TernaryTreeList<T> {
  let ys = new Array<TernaryTreeList<T>>(to - from);
  for (let idx = from; idx < to; idx++) {
    let x = xs[idx];
    ys[idx - from] = { kind: TernaryTreeKind.ternaryTreeLeaf, size: 1, value: x };
  }
  return makeTernaryTreeList(ys.length, 0, ys);
}

export function initEmptyTernaryTreeList<T>(): TernaryTreeList<T> {
  return { kind: TernaryTreeKind.ternaryTreeBranch, size: 0, depth: 1, middle: emptyBranch, left: emptyBranch, right: emptyBranch };
}

export function listToString<T>(tree: TernaryTreeList<T>): string {
  return `TernaryTreeList[${tree.size}, ...]`;
}

export function listLen<T>(tree: TernaryTreeList<T>): number {
  if (tree == null) {
    return 0;
  } else {
    return tree.size;
  }
}

function isLeaf<T>(tree: TernaryTreeList<T>): boolean {
  return tree.kind === TernaryTreeKind.ternaryTreeLeaf;
}

function isBranch<T>(tree: TernaryTreeList<T>): boolean {
  return tree.kind === TernaryTreeKind.ternaryTreeBranch;
}

export function formatListInline<T>(tree: TernaryTreeList<T>): string {
  if (tree == null) {
    return "_";
  }
  switch (tree.kind) {
    case TernaryTreeKind.ternaryTreeLeaf:
      return `${tree.value}`;
    case TernaryTreeKind.ternaryTreeBranch:
      return "(" + formatListInline(tree.left) + " " + formatListInline(tree.middle) + " " + formatListInline(tree.right) + ")";
    // "(" & tree.left.formatListInline & " " & tree.middle.formatListInline & " " & tree.right.formatListInline & ")@{tree.depth} " & "{tree.left.getDepth} {tree.middle.getDepth} {tree.right.getDepth}..."
  }
}

export function* listToItems<T>(tree: TernaryTreeList<T>): Generator<T> {
  if (tree != null) {
    switch (tree.kind) {
      case TernaryTreeKind.ternaryTreeLeaf: {
        yield tree.value;
        break;
      }
      case TernaryTreeKind.ternaryTreeBranch: {
        if (tree.left != null) {
          for (let x of listToItems(tree.left)) {
            yield x;
          }
        }
        if (tree.middle != null) {
          for (let x of listToItems(tree.middle)) {
            yield x;
          }
        }
        if (tree.right != null) {
          for (let x of listToItems(tree.right)) {
            yield x;
          }
        }
        break;
      }
    }
  }
}

// returns -1 if (not foun)
export function findIndex<T>(tree: TernaryTreeList<T>, f: (x: T) => boolean): number {
  if (tree == null) {
    return -1;
  }
  switch (tree.kind) {
    case TernaryTreeKind.ternaryTreeLeaf: {
      if (f(tree.value)) {
        return 0;
      } else {
        return -1;
      }
    }
    case TernaryTreeKind.ternaryTreeBranch: {
      let tryLeft = findIndex(tree.left, f);
      if (tryLeft >= 0) {
        return tryLeft;
      }
      let tryMiddle = findIndex(tree.middle, f);
      if (tryMiddle >= 0) {
        return tryMiddle + listLen(tree.left);
      }
      let tryRight = findIndex(tree.right, f);
      if (tryRight >= 0) {
        return tryRight + listLen(tree.left) + listLen(tree.middle);
      }
      return -1;
    }
  }
}

// returns -1 if (not foun)
export function indexOf<T>(tree: TernaryTreeList<T>, item: T): number {
  if (tree == null) {
    return -1;
  }
  switch (tree.kind) {
    case TernaryTreeKind.ternaryTreeLeaf:
      if (dataEqual(item, tree.value)) {
        return 0;
      }
    default:
      return -1;
    case TernaryTreeKind.ternaryTreeBranch:
      let tryLeft = indexOf(tree.left, item);
      if (tryLeft >= 0) {
        return tryLeft;
      }
      let tryMiddle = indexOf(tree.middle, item);
      if (tryMiddle >= 0) {
        return tryMiddle + listLen(tree.left);
      }
      let tryRight = indexOf(tree.right, item);
      if (tryRight >= 0) {
        return tryRight + listLen(tree.left) + listLen(tree.middle);
      }
      return -1;
  }
}

function writeLeavesArray<T>(tree: TernaryTreeList<T>, acc: /* var */ Array<TernaryTreeList<T>>, idx: RefInt): void {
  if (tree == null) {
    //
  } else {
    switch (tree.kind) {
      case TernaryTreeKind.ternaryTreeLeaf: {
        acc[idx.value] = tree;
        idx.value = idx.value + 1;
        break;
      }
      case TernaryTreeKind.ternaryTreeBranch: {
        if (tree.left != null) {
          writeLeavesArray(tree.left, acc, idx);
        }
        if (tree.middle != null) {
          writeLeavesArray(tree.middle, acc, idx);
        }
        if (tree.right != null) {
          writeLeavesArray(tree.right, acc, idx);
        }
        break;
      }
      default: {
        throw new Error("Unknown");
      }
    }
  }
}

function toLeavesArray<T>(tree: TernaryTreeList<T>): Array<TernaryTreeList<T>> {
  let acc = new Array<TernaryTreeList<T>>(listLen(tree));
  let counter: RefInt = { value: 0 };
  writeLeavesArray(tree, acc, counter);
  return acc;
}

export function* indexToItems<T>(tree: TernaryTreeList<T>): Generator<T> {
  for (let idx = 0; idx < listLen(tree); idx++) {
    yield listGet(tree, idx);
  }
}

export function* listToPairs<T>(tree: TernaryTreeList<T>): Generator<[number, T]> {
  let idx = 0;
  for (let x of listToItems(tree)) {
    yield [idx, x];
    idx = idx + 1;
  }
}

export function listGet<T>(originalTree: TernaryTreeList<T>, originalIdx: number): T {
  let tree = originalTree;
  let idx = originalIdx;
  while (tree != null) {
    if (idx < 0) {
      throw new Error("Cannot index negative number");
    }

    if (tree.kind === TernaryTreeKind.ternaryTreeLeaf) {
      if (idx === 0) {
        return tree.value;
      } else {
        throw new Error(`Cannot get from leaf with index ${idx}`);
      }
    }

    if (idx > tree.size - 1) {
      throw new Error("Index too large");
    }

    let leftSize = tree.left == null ? 0 : tree.left.size;
    let middleSize = tree.middle == null ? 0 : tree.middle.size;
    let rightSize = tree.right == null ? 0 : tree.right.size;

    if (leftSize + middleSize + rightSize !== tree.size) {
      throw new Error("tree.size does not match sum case branch sizes");
    }

    if (idx <= leftSize - 1) {
      tree = tree.left;
    } else if (idx <= leftSize + middleSize - 1) {
      tree = tree.middle;
      idx = idx - leftSize;
    } else {
      tree = tree.right;
      idx = idx - leftSize - middleSize;
    }
  }

  throw new Error(`Failed to get ${idx}`);
}

export function first<T>(tree: TernaryTreeList<T>): T {
  if (listLen(tree) > 0) {
    return listGet(tree, 0);
  } else {
    throw new Error("Cannot get from empty list");
  }
}

export function last<T>(tree: TernaryTreeList<T>): T {
  if (listLen(tree) > 0) {
    return listGet(tree, listLen(tree) - 1);
  } else {
    throw new Error("Cannot get from empty list");
  }
}

export function assocList<T>(tree: TernaryTreeList<T>, idx: number, item: T): TernaryTreeList<T> {
  if (idx < 0) {
    throw new Error("Cannot index negative number");
  }
  if (idx > tree.size - 1) {
    throw new Error("Index too large");
  }

  if (tree.kind === TernaryTreeKind.ternaryTreeLeaf) {
    if (idx === 0) {
      return { kind: TernaryTreeKind.ternaryTreeLeaf, size: 1, value: item } as TernaryTreeList<T>;
    } else {
      throw new Error(`Cannot get from leaf with index ${idx}`);
    }
  }

  let leftSize = listLen(tree.left);
  let middleSize = listLen(tree.middle);
  let rightSize = listLen(tree.right);

  if (leftSize + middleSize + rightSize !== tree.size) throw new Error("tree.size does not match sum case branch sizes");

  if (idx <= leftSize - 1) {
    let changedBranch = assocList(tree.left, idx, item);
    let result: TernaryTreeList<T> = {
      kind: TernaryTreeKind.ternaryTreeBranch,
      size: tree.size,
      depth: decideParentDepth(changedBranch, tree.middle, tree.right),
      left: changedBranch,
      middle: tree.middle,
      right: tree.right,
    };
    checkListStructure(result);
    return result;
  } else if (idx <= leftSize + middleSize - 1) {
    let changedBranch = assocList(tree.middle, idx - leftSize, item);
    let result: TernaryTreeList<T> = {
      kind: TernaryTreeKind.ternaryTreeBranch,
      size: tree.size,
      depth: decideParentDepth(tree.left, changedBranch, tree.right),
      left: tree.left,
      middle: changedBranch,
      right: tree.right,
    };
    checkListStructure(result);
    return result;
  } else {
    let changedBranch = assocList(tree.right, idx - leftSize - middleSize, item);
    let result: TernaryTreeList<T> = {
      kind: TernaryTreeKind.ternaryTreeBranch,
      size: tree.size,
      depth: decideParentDepth(tree.left, tree.middle, changedBranch),
      left: tree.left,
      middle: tree.middle,
      right: changedBranch,
    };
    checkListStructure(result);
    return result;
  }
}

export function dissocList<T>(tree: TernaryTreeList<T>, idx: number): TernaryTreeList<T> {
  if (tree == null) {
    throw new Error("dissoc does not work on null");
  }

  if (idx < 0) {
    throw new Error(`Index is negative ${idx}`);
  }

  if (listLen(tree) === 0) {
    throw new Error("Cannot remove from empty list");
  }

  if (idx > listLen(tree) - 1) {
    throw new Error(`Index too large ${idx}`);
  }

  if (listLen(tree) === 1) {
    return emptyBranch;
  }

  if (tree.kind === TernaryTreeKind.ternaryTreeLeaf) {
    throw new Error("dissoc should be handled at branches");
  }

  let leftSize = listLen(tree.left);
  let middleSize = listLen(tree.middle);
  let rightSize = listLen(tree.right);

  if (leftSize + middleSize + rightSize !== tree.size) {
    throw new Error("tree.size does not match sum from branch sizes");
  }

  let result: TernaryTreeList<T> = emptyBranch;

  if (idx <= leftSize - 1) {
    let changedBranch = dissocList(tree.left, idx);
    if (changedBranch == null || changedBranch.size === 0) {
      result = {
        kind: TernaryTreeKind.ternaryTreeBranch,
        size: tree.size - 1,
        depth: decideParentDepth(tree.middle, tree.right),
        left: tree.middle,
        middle: tree.right,
        right: emptyBranch,
      };
    } else {
      result = {
        kind: TernaryTreeKind.ternaryTreeBranch,
        size: tree.size - 1,
        depth: decideParentDepth(changedBranch, tree.middle, tree.right),
        left: changedBranch,
        middle: tree.middle,
        right: tree.right,
      };
    }
  } else if (idx <= leftSize + middleSize - 1) {
    let changedBranch = dissocList(tree.middle, idx - leftSize);
    if (changedBranch == null || changedBranch.size === 0) {
      result = {
        kind: TernaryTreeKind.ternaryTreeBranch,
        size: tree.size - 1,
        depth: decideParentDepth(tree.left, changedBranch, tree.right),
        left: tree.left,
        middle: tree.right,
        right: emptyBranch,
      };
    } else {
      result = {
        kind: TernaryTreeKind.ternaryTreeBranch,
        size: tree.size - 1,
        depth: decideParentDepth(tree.left, changedBranch, tree.right),
        left: tree.left,
        middle: changedBranch,
        right: tree.right,
      };
    }
  } else {
    let changedBranch = dissocList(tree.right, idx - leftSize - middleSize);
    if (changedBranch == null || changedBranch.size === 0) {
      changedBranch = emptyBranch;
    }
    result = {
      kind: TernaryTreeKind.ternaryTreeBranch,
      size: tree.size - 1,
      depth: decideParentDepth(tree.left, tree.middle, changedBranch),
      left: tree.left,
      middle: tree.middle,
      right: changedBranch,
    };
  }
  if (result.middle == null) {
    return result.left;
  }
  checkListStructure(result);
  return result;
}

export function rest<T>(tree: TernaryTreeList<T>): TernaryTreeList<T> {
  if (tree == null) {
    throw new Error("Cannot call rest on null");
  }
  if (listLen(tree) < 1) {
    throw new Error("Cannot call rest on empty list");
  }

  return dissocList(tree, 0);
}

export function butlast<T>(tree: TernaryTreeList<T>): TernaryTreeList<T> {
  if (tree == null) {
    throw new Error("Cannot call butlast on null");
  }
  if (listLen(tree) < 1) {
    throw new Error("Cannot call butlast on empty list");
  }

  return dissocList(tree, listLen(tree) - 1);
}

export function insert<T>(tree: TernaryTreeList<T>, idx: number, item: T, after: boolean = false): TernaryTreeList<T> {
  if (tree == null) {
    throw new Error("Cannot insert into null");
  }
  if (listLen(tree) === 0) {
    throw new Error("Empty node is not a correct position for inserting");
  }

  if (tree.kind === TernaryTreeKind.ternaryTreeLeaf) {
    if (after) {
      let result: TernaryTreeList<T> = {
        kind: TernaryTreeKind.ternaryTreeBranch,
        depth: getDepth(tree) + 1,
        size: 2,
        left: tree,
        middle: { kind: TernaryTreeKind.ternaryTreeLeaf, size: 1, value: item } as TernaryTreeList<T>,
        right: emptyBranch,
      };
      checkListStructure(result);
      return result;
    } else {
      let result: TernaryTreeList<T> = {
        kind: TernaryTreeKind.ternaryTreeBranch,
        depth: getDepth(tree) + 1,
        size: 2,
        left: { kind: TernaryTreeKind.ternaryTreeLeaf, size: 1, value: item } as TernaryTreeList<T>,
        middle: tree,
        right: emptyBranch,
      };
      checkListStructure(result);
      return result;
    }
  }

  checkListStructure(tree);

  if (listLen(tree) === 1) {
    if (after) {
      // in compact mode, values placed at left
      let result: TernaryTreeList<T> = {
        kind: TernaryTreeKind.ternaryTreeBranch,
        size: 2,
        depth: 2,
        left: tree.left,
        middle: { kind: TernaryTreeKind.ternaryTreeLeaf, size: 1, value: item } as TernaryTreeList<T>,
        right: emptyBranch,
      };
      checkListStructure(result);
      return result;
    } else {
      let result: TernaryTreeList<T> = {
        kind: TernaryTreeKind.ternaryTreeBranch,
        size: 2,
        depth: getDepth(tree.middle) + 1,
        left: { kind: TernaryTreeKind.ternaryTreeLeaf, size: 1, value: item } as TernaryTreeList<T>,
        middle: tree.left,
        right: emptyBranch,
      };
      checkListStructure(result);
      return result;
    }
  }

  if (listLen(tree) === 2 && tree.middle != null) {
    if (after) {
      if (idx === 0) {
        let result: TernaryTreeList<T> = {
          kind: TernaryTreeKind.ternaryTreeBranch,
          size: 3,
          depth: 2,
          left: tree.left,
          middle: { kind: TernaryTreeKind.ternaryTreeLeaf, size: 1, value: item } as TernaryTreeList<T>,
          right: tree.middle,
        };
        checkListStructure(result);
        return result;
      }
      if (idx === 1) {
        let result: TernaryTreeList<T> = {
          kind: TernaryTreeKind.ternaryTreeBranch,
          size: 3,
          depth: 2,
          left: tree.left,
          middle: tree.middle,
          right: { kind: TernaryTreeKind.ternaryTreeLeaf, size: 1, value: item } as TernaryTreeList<T>,
        };
        checkListStructure(result);
        return result;
      } else {
        throw new Error("cannot insert after position 2 since only 2 elements here");
      }
    } else {
      if (idx === 0) {
        let result: TernaryTreeList<T> = {
          kind: TernaryTreeKind.ternaryTreeBranch,
          size: 3,
          depth: 2,
          left: { kind: TernaryTreeKind.ternaryTreeLeaf, size: 1, value: item } as TernaryTreeList<T>,
          middle: tree.left,
          right: tree.middle,
        };
        checkListStructure(result);
        return result;
      } else if (idx === 1) {
        let result: TernaryTreeList<T> = {
          kind: TernaryTreeKind.ternaryTreeBranch,
          size: 3,
          depth: 2,
          left: tree.left,
          middle: { kind: TernaryTreeKind.ternaryTreeLeaf, size: 1, value: item } as TernaryTreeList<T>,
          right: tree.middle,
        };
        checkListStructure(result);
        return result;
      } else {
        throw new Error("cannot insert before position 2 since only 2 elements here");
      }
    }
  }

  let leftSize = listLen(tree.left);
  let middleSize = listLen(tree.middle);
  let rightSize = listLen(tree.right);

  if (leftSize + middleSize + rightSize !== tree.size) {
    throw new Error("tree.size does not match sum case branch sizes");
  }

  // echo "picking: ", idx, " ", leftSize, " ", middleSize, " ", rightSize

  if (idx === 0 && !after) {
    if (listLen(tree.left) >= listLen(tree.middle) && listLen(tree.left) >= listLen(tree.right)) {
      let result: TernaryTreeList<T> = {
        kind: TernaryTreeKind.ternaryTreeBranch,
        size: tree.size + 1,
        depth: tree.depth + 1,
        left: { kind: TernaryTreeKind.ternaryTreeLeaf, size: 1, value: item } as TernaryTreeList<T>,
        middle: tree,
        right: emptyBranch,
      };
      checkListStructure(result);
      return result;
    }
  }

  if (idx === listLen(tree) - 1 && after) {
    if (listLen(tree.right) >= listLen(tree.middle) && listLen(tree.right) >= listLen(tree.left)) {
      let result: TernaryTreeList<T> = {
        kind: TernaryTreeKind.ternaryTreeBranch,
        size: tree.size + 1,
        depth: tree.depth + 1,
        left: tree,
        middle: { kind: TernaryTreeKind.ternaryTreeLeaf, size: 1, value: item } as TernaryTreeList<T>,
        right: emptyBranch,
      };
      checkListStructure(result);
      return result;
    }
  }

  if (after && idx === listLen(tree) - 1 && rightSize === 0 && middleSize >= leftSize) {
    let result: TernaryTreeList<T> = {
      kind: TernaryTreeKind.ternaryTreeBranch,
      size: tree.size + 1,
      depth: tree.depth,
      left: tree.left,
      middle: tree.middle,
      right: { kind: TernaryTreeKind.ternaryTreeLeaf, size: 1, value: item } as TernaryTreeList<T>,
    };
    checkListStructure(result);
    return result;
  }

  if (!after && idx === 0 && rightSize === 0 && middleSize >= rightSize) {
    let result: TernaryTreeList<T> = {
      kind: TernaryTreeKind.ternaryTreeBranch,
      size: tree.size + 1,
      depth: tree.depth,
      left: { kind: TernaryTreeKind.ternaryTreeLeaf, size: 1, value: item } as TernaryTreeList<T>,
      middle: tree.left,
      right: tree.middle,
    };
    checkListStructure(result);
    return result;
  }

  if (idx <= leftSize - 1) {
    let changedBranch = insert(tree.left, idx, item, after);

    let result: TernaryTreeList<T> = {
      kind: TernaryTreeKind.ternaryTreeBranch,
      size: tree.size + 1,
      depth: decideParentDepth(changedBranch, tree.middle, tree.right),
      left: changedBranch,
      middle: tree.middle,
      right: tree.right,
    };
    checkListStructure(result);
    return result;
  } else if (idx <= leftSize + middleSize - 1) {
    let changedBranch = insert(tree.middle, idx - leftSize, item, after);

    let result: TernaryTreeList<T> = {
      kind: TernaryTreeKind.ternaryTreeBranch,
      size: tree.size + 1,
      depth: decideParentDepth(tree.left, changedBranch, tree.right),
      left: tree.left,
      middle: changedBranch,
      right: tree.right,
    };

    checkListStructure(result);
    return result;
  } else {
    let changedBranch = insert(tree.right, idx - leftSize - middleSize, item, after);

    let result: TernaryTreeList<T> = {
      kind: TernaryTreeKind.ternaryTreeBranch,
      size: tree.size + 1,
      depth: decideParentDepth(tree.left, tree.middle, changedBranch),
      left: tree.left,
      middle: tree.middle,
      right: changedBranch,
    };
    checkListStructure(result);
    return result;
  }
}

export function assocBefore<T>(tree: TernaryTreeList<T>, idx: number, item: T, after: boolean = false): TernaryTreeList<T> {
  return insert(tree, idx, item, false);
}

export function assocAfter<T>(tree: TernaryTreeList<T>, idx: number, item: T, after: boolean = false): TernaryTreeList<T> {
  return insert(tree, idx, item, true);
}

// this function mutates original tree to make it more balanced
export function forceListInplaceBalancing<T>(tree: TernaryTreeList<T>): void {
  if (tree.kind === TernaryTreeKind.ternaryTreeBranch) {
    // echo "Force inplace balancing case list: ", tree.size
    let ys = toLeavesArray(tree);
    let newTree = makeTernaryTreeList(ys.length, 0, ys) as TernaryTreeListTheBranch<T>;
    // let newTree = initTernaryTreeList(ys)
    tree.left = newTree.left;
    tree.middle = newTree.middle;
    tree.right = newTree.right;
    tree.depth = decideParentDepth(tree.left, tree.middle, tree.right);
  } else {
    //
  }
}

// TODO, need better strategy for detecting
function maybeReblance<T>(tree: TernaryTreeList<T>): void {
  let currentDepth = getDepth(tree);
  if (currentDepth > 10) {
    if (roughIntPow(3, currentDepth - 10) > tree.size) {
      forceListInplaceBalancing(tree);
    }
  }
}

export function prepend<T>(tree: TernaryTreeList<T>, item: T, disableBalancing: boolean = false): TernaryTreeList<T> {
  if (tree == null || listLen(tree) === 0) {
    return { kind: TernaryTreeKind.ternaryTreeLeaf, size: 1, value: item } as TernaryTreeList<T>;
  }
  let result = insert(tree, 0, item, false);

  if (!disableBalancing) {
    maybeReblance(result);
  }
  return result;
}

export function append<T>(tree: TernaryTreeList<T>, item: T, disableBalancing: boolean = false): TernaryTreeList<T> {
  if (tree == null || listLen(tree) === 0) {
    return { kind: TernaryTreeKind.ternaryTreeLeaf, size: 1, value: item } as TernaryTreeList<T>;
  }
  let result = insert(tree, listLen(tree) - 1, item, true);

  if (!disableBalancing) {
    maybeReblance(result);
  }
  return result;
}

export function concat<T>(...xsGroups: Array<TernaryTreeList<T>>): TernaryTreeList<T> {
  xsGroups = xsGroups.filter((xs) => listLen(xs) > 0);

  if (xsGroups.length === 1) {
    return xsGroups[0];
  }

  if (xsGroups.length === 2) {
    return concat2(xsGroups[0], xsGroups[1]);
  }
  if (xsGroups.length === 3) {
    return concat3(xsGroups[0], xsGroups[1], xsGroups[2]);
  }

  let result = makeTernaryTreeList(xsGroups.length, 0, xsGroups);
  maybeReblance(result);
  checkListStructure(result);
  return result;
}

export function concat2<T>(left: TernaryTreeList<T>, middle: TernaryTreeList<T>): TernaryTreeList<T> {
  if (left.kind === TernaryTreeKind.ternaryTreeBranch) {
    if (left.left != null && left.middle != null && left.right == null) {
      let ret: TernaryTreeListTheBranch<T> = {
        size: left.size + middle.size,
        kind: TernaryTreeKind.ternaryTreeBranch,
        depth: decideParentDepth(left.left, left.middle, middle),
        left: left.left,
        middle: left.middle,
        right: middle,
      };
      return ret;
    }
  }
  if (middle.kind === TernaryTreeKind.ternaryTreeBranch) {
    if (middle.left != null && middle.middle != null && middle.right == null) {
      let ret: TernaryTreeListTheBranch<T> = {
        size: left.size + middle.size,
        kind: TernaryTreeKind.ternaryTreeBranch,
        depth: decideParentDepth(left, middle.left, middle.middle),
        left: left,
        middle: middle.left,
        right: middle.middle,
      };
      return ret;
    }
  }
  let ret: TernaryTreeListTheBranch<T> = {
    size: left.size + middle.size,
    kind: TernaryTreeKind.ternaryTreeBranch,
    depth: decideParentDepth(left, middle),
    left: left,
    middle: middle,
    right: emptyBranch,
  };
  checkListStructure(ret);
  return ret;
}

export function concat3<T>(left: TernaryTreeList<T>, middle: TernaryTreeList<T>, right: TernaryTreeList<T>): TernaryTreeList<T> {
  let ret: TernaryTreeListTheBranch<T> = {
    size: left.size + middle.size + right.size,
    kind: TernaryTreeKind.ternaryTreeBranch,
    depth: decideParentDepth(left, middle, right),
    left,
    middle,
    right,
  };

  checkListStructure(ret);

  return ret;
}

export function sameListShape<T>(xs: TernaryTreeList<T>, ys: TernaryTreeList<T>): boolean {
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

  if (listLen(xs) !== listLen(ys)) {
    return false;
  }

  if (xs.kind !== ys.kind) {
    return false;
  }

  if (xs.kind === TernaryTreeKind.ternaryTreeLeaf && ys.kind === TernaryTreeKind.ternaryTreeLeaf) {
    if (!dataEqual(xs.value, ys.value)) {
      return false;
    } else {
      return true;
    }
  }
  if (xs.kind === TernaryTreeKind.ternaryTreeBranch && ys.kind === TernaryTreeKind.ternaryTreeBranch) {
    if (!sameListShape(xs.left, ys.left)) return false;

    if (!sameListShape(xs.middle, ys.middle)) return false;

    if (!sameListShape(xs.right, ys.right)) return false;

    return true;
  }

  return false;
}

export function listEqual<T>(xs: TernaryTreeList<T>, ys: TernaryTreeList<T>): boolean {
  if (xs === ys) {
    return true;
  }
  if (listLen(xs) !== listLen(ys)) {
    return false;
  }

  for (let idx = 0; idx < listLen(xs); idx++) {
    if (!dataEqual(listGet(xs, idx), listGet(ys, idx))) {
      return false;
    }
  }

  return true;
}

export function checkListStructure<T>(tree: TernaryTreeList<T>): boolean {
  if (tree == null || listLen(tree) === 0) {
    return true;
  } else {
    switch (tree.kind) {
      case TernaryTreeKind.ternaryTreeLeaf:
        if (tree.size !== 1) {
          throw new Error(`Bad size at node ${formatListInline(tree)}`);
        }
        break;
      case TernaryTreeKind.ternaryTreeBranch: {
        if (tree.size >= 6 && tree.depth >= tree.size) {
          throw new Error(`Bad depth at branch ${formatListInline(tree)}`);
        }

        if (tree.size !== listLen(tree.left) + listLen(tree.middle) + listLen(tree.right)) {
          throw new Error(`Bad size at branch ${formatListInline(tree)}`);
        }
        if (tree.left == null && tree.middle != null) {
          throw new Error("morformed tree");
        }
        if (tree.middle == null && tree.right != null) {
          throw new Error("morformed tree");
        }

        if (tree.depth !== decideParentDepth(tree.left, tree.middle, tree.right)) {
          let x = decideParentDepth(tree.left, tree.middle, tree.right);
          throw new Error(`Bad depth at branch ${formatListInline(tree)}`);
        }

        checkListStructure(tree.left);
        checkListStructure(tree.middle);
        checkListStructure(tree.right);
        break;
      }
    }

    return true;
  }
}

// excludes value at endIdx, kept aligned with JS & Clojure
export function slice<T>(tree: TernaryTreeList<T>, startIdx: number, endIdx: number): TernaryTreeList<T> {
  // echo "slice {tree.formatListInline}: {startIdx}..{endIdx}"
  if (endIdx > listLen(tree)) {
    throw new Error("Slice range too large {endIdx} for {tree}");
  }
  if (startIdx < 0) {
    throw new Error("Slice range too small {startIdx} for {tree}");
  }
  if (startIdx > endIdx) {
    throw new Error("Invalid slice range {startIdx}..{endIdx} for {tree}");
  }
  if (startIdx === endIdx) {
    return { kind: TernaryTreeKind.ternaryTreeBranch, size: 0, depth: 0 } as TernaryTreeList<T>;
  }

  if (tree.kind === TernaryTreeKind.ternaryTreeLeaf)
    if (startIdx === 0 && endIdx === 1) {
      return tree;
    } else {
      throw new Error(`Invalid slice range for a leaf: ${startIdx} ${endIdx}`);
    }

  if (startIdx === 0 && endIdx === listLen(tree)) {
    return tree;
  }

  let leftSize = listLen(tree.left);
  let middleSize = listLen(tree.middle);
  let rightSize = listLen(tree.right);

  // echo "sizes: {leftSize} {middleSize} {rightSize}"

  if (startIdx >= leftSize + middleSize) {
    return slice(tree.right, startIdx - leftSize - middleSize, endIdx - leftSize - middleSize);
  }
  if (startIdx >= leftSize)
    if (endIdx <= leftSize + middleSize) {
      return slice(tree.middle, startIdx - leftSize, endIdx - leftSize);
    } else {
      let middleCut = slice(tree.middle, startIdx - leftSize, middleSize);
      let rightCut = slice(tree.right, 0, endIdx - leftSize - middleSize);
      return concat(middleCut, rightCut);
    }

  if (endIdx <= leftSize) {
    return slice(tree.left, startIdx, endIdx);
  }

  if (endIdx <= leftSize + middleSize) {
    let leftCut = slice(tree.left, startIdx, leftSize);
    let middleCut = slice(tree.middle, 0, endIdx - leftSize);
    return concat(leftCut, middleCut);
  }

  if (endIdx <= leftSize + middleSize + rightSize) {
    let leftCut = slice(tree.left, startIdx, leftSize);
    let rightCut = slice(tree.right, 0, endIdx - leftSize - middleSize);
    return concat(concat(leftCut, tree.middle), rightCut);
  }
  throw new Error("Unknown");
}

export function reverse<T>(tree: TernaryTreeList<T>): TernaryTreeList<T> {
  if (tree == null) {
    return tree;
  }

  switch (tree.kind) {
    case TernaryTreeKind.ternaryTreeLeaf:
      return tree;
    case TernaryTreeKind.ternaryTreeBranch: {
      let result: TernaryTreeList<T> = {
        kind: TernaryTreeKind.ternaryTreeBranch,
        size: tree.size,
        depth: tree.depth,
        left: reverse(tree.right),
        middle: reverse(tree.middle),
        right: reverse(tree.left),
      };
      if (result.left == null) {
        result.left = result.middle;
        result.middle = result.right;
        result.right = undefined as any;
      }
      return result;
    }
  }
}

export function listMapValues<T, V>(tree: TernaryTreeList<T>, f: (x: T) => V): TernaryTreeList<V> {
  if (tree == null) {
    return tree;
  }

  switch (tree.kind) {
    case TernaryTreeKind.ternaryTreeLeaf: {
      let result: TernaryTreeList<V> = {
        kind: TernaryTreeKind.ternaryTreeLeaf,
        size: tree.size,
        value: f(tree.value),
      };
      return result;
    }
    case TernaryTreeKind.ternaryTreeBranch: {
      let result: TernaryTreeList<V> = {
        kind: TernaryTreeKind.ternaryTreeBranch,
        size: tree.size,
        depth: tree.depth,
        left: tree.left == null ? emptyBranch : listMapValues(tree.left, f),
        middle: tree.middle == null ? emptyBranch : listMapValues(tree.middle, f),
        right: tree.right == null ? emptyBranch : listMapValues(tree.right, f),
      };
      return result;
    }
  }
}
