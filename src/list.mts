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
        size: left.size + middle.size,
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
        size: left.size + middle.size + right.size,
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
        size: left.size + middle.size + right.size,
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
  const size = xs.length;
  let ys = new Array<TernaryTreeList<T>>(size);

  // Use cached size instead of accessing xs.length repeatedly
  for (let idx = 0; idx < size; idx++) {
    ys[idx] = { kind: TernaryTreeKind.ternaryTreeLeaf, size: 1, value: xs[idx] };
  }
  return makeTernaryTreeList(size, 0, ys);
}

// from a slice of an existed array
export function initTernaryTreeListFromRange<T>(xs: Array<T>, from: number, to: number): TernaryTreeList<T> {
  const length = to - from;
  let ys = new Array<TernaryTreeList<T>>(length);

  for (let idx = 0; idx < length; idx++) {
    ys[idx] = { kind: TernaryTreeKind.ternaryTreeLeaf, size: 1, value: xs[idx + from] };
  }
  return makeTernaryTreeList(length, 0, ys);
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
        // Cache children to avoid repeated property access
        const left = tree.left;
        const middle = tree.middle;
        const right = tree.right;

        if (left != null) {
          for (let x of listToItems(left)) {
            yield x;
          }
        }
        if (middle != null) {
          for (let x of listToItems(middle)) {
            yield x;
          }
        }
        if (right != null) {
          for (let x of listToItems(right)) {
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
      // Cache children to avoid repeated property access
      const left = tree.left;
      const middle = tree.middle;
      const right = tree.right;

      let tryLeft = findIndex(left, f);
      if (tryLeft >= 0) {
        return tryLeft;
      }
      let tryMiddle = findIndex(middle, f);
      if (tryMiddle >= 0) {
        return tryMiddle + (left == null ? 0 : left.size);
      }
      let tryRight = findIndex(right, f);
      if (tryRight >= 0) {
        return tryRight + (left == null ? 0 : left.size) + (middle == null ? 0 : middle.size);
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
      // Cache children to avoid repeated property access
      const left = tree.left;
      const middle = tree.middle;
      const right = tree.right;

      let tryLeft = indexOf(left, item);
      if (tryLeft >= 0) {
        return tryLeft;
      }

      let tryMiddle = indexOf(middle, item);
      if (tryMiddle >= 0) {
        return tryMiddle + (left == null ? 0 : left.size);
      }

      let tryRight = indexOf(right, item);
      if (tryRight >= 0) {
        return tryRight + (left == null ? 0 : left.size) + (middle == null ? 0 : middle.size);
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
        // Cache current index to reduce property access
        const currentIdx = idx.value;
        acc[currentIdx] = tree;
        idx.value = currentIdx + 1;
        break;
      }
      case TernaryTreeKind.ternaryTreeBranch: {
        // Cache children to avoid repeated property access
        const left = tree.left;
        const middle = tree.middle;
        const right = tree.right;

        if (left != null) {
          writeLeavesArray(left, acc, idx);
        }
        if (middle != null) {
          writeLeavesArray(middle, acc, idx);
        }
        if (right != null) {
          writeLeavesArray(right, acc, idx);
        }
        break;
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

    // Cache child sizes to avoid repeated property access
    const left = tree.left;
    const middle = tree.middle;
    const right = tree.right;

    const leftSize = left == null ? 0 : left.size;
    const middleSize = middle == null ? 0 : middle.size;
    const rightSize = right == null ? 0 : right.size;

    if (leftSize + middleSize + rightSize !== tree.size) {
      throw new Error("tree.size does not match sum case branch sizes");
    }

    if (idx <= leftSize - 1) {
      tree = left;
    } else if (idx <= leftSize + middleSize - 1) {
      tree = middle;
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

  // Cache children and their sizes to avoid repeated property access
  const left = tree.left;
  const middle = tree.middle;
  const right = tree.right;
  const leftSize = left == null ? 0 : left.size;
  const middleSize = middle == null ? 0 : middle.size;
  const rightSize = right == null ? 0 : right.size;

  if (leftSize + middleSize + rightSize !== tree.size) throw new Error("tree.size does not match sum case branch sizes");

  if (idx <= leftSize - 1) {
    let changedBranch = assocList(left, idx, item);
    let result: TernaryTreeList<T> = {
      kind: TernaryTreeKind.ternaryTreeBranch,
      size: tree.size,
      depth: decideParentDepth(changedBranch, middle, right),
      left: changedBranch,
      middle: middle,
      right: right,
    };
    checkListStructure(result);
    return result;
  } else if (idx <= leftSize + middleSize - 1) {
    let changedBranch = assocList(middle, idx - leftSize, item);
    let result: TernaryTreeList<T> = {
      kind: TernaryTreeKind.ternaryTreeBranch,
      size: tree.size,
      depth: decideParentDepth(left, changedBranch, right),
      left: left,
      middle: changedBranch,
      right: right,
    };
    checkListStructure(result);
    return result;
  } else {
    let changedBranch = assocList(right, idx - leftSize - middleSize, item);
    let result: TernaryTreeList<T> = {
      kind: TernaryTreeKind.ternaryTreeBranch,
      size: tree.size,
      depth: decideParentDepth(left, middle, changedBranch),
      left: left,
      middle: middle,
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

  // Cache children and their sizes to avoid repeated property access
  const left = tree.left;
  const middle = tree.middle;
  const right = tree.right;
  const leftSize = left == null ? 0 : left.size;
  const middleSize = middle == null ? 0 : middle.size;
  const rightSize = right == null ? 0 : right.size;

  if (leftSize + middleSize + rightSize !== tree.size) {
    throw new Error("tree.size does not match sum from branch sizes");
  }

  let result: TernaryTreeList<T> = emptyBranch;

  if (idx <= leftSize - 1) {
    let changedBranch = dissocList(left, idx);
    if (changedBranch == null || changedBranch.size === 0) {
      result = {
        kind: TernaryTreeKind.ternaryTreeBranch,
        size: tree.size - 1,
        depth: decideParentDepth(middle, right),
        left: middle,
        middle: right,
        right: emptyBranch,
      };
    } else {
      result = {
        kind: TernaryTreeKind.ternaryTreeBranch,
        size: tree.size - 1,
        depth: decideParentDepth(changedBranch, middle, right),
        left: changedBranch,
        middle: middle,
        right: right,
      };
    }
  } else if (idx <= leftSize + middleSize - 1) {
    let changedBranch = dissocList(middle, idx - leftSize);
    if (changedBranch == null || changedBranch.size === 0) {
      result = {
        kind: TernaryTreeKind.ternaryTreeBranch,
        size: tree.size - 1,
        depth: decideParentDepth(left, right, emptyBranch),
        left: left,
        middle: right,
        right: emptyBranch,
      };
    } else {
      result = {
        kind: TernaryTreeKind.ternaryTreeBranch,
        size: tree.size - 1,
        depth: decideParentDepth(left, changedBranch, right),
        left: left,
        middle: changedBranch,
        right: right,
      };
    }
  } else {
    let changedBranch = dissocList(right, idx - leftSize - middleSize);
    if (changedBranch == null || changedBranch.size === 0) {
      changedBranch = emptyBranch;
    }
    result = {
      kind: TernaryTreeKind.ternaryTreeBranch,
      size: tree.size - 1,
      depth: decideParentDepth(left, middle, changedBranch),
      left: left,
      middle: middle,
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

  // Cache children and their sizes to avoid repeated property access
  const left = tree.left;
  const middle = tree.middle;
  const right = tree.right;
  const leftSize = left == null ? 0 : left.size;
  const middleSize = middle == null ? 0 : middle.size;
  const rightSize = right == null ? 0 : right.size;

  if (leftSize + middleSize + rightSize !== tree.size) {
    throw new Error("tree.size does not match sum case branch sizes");
  }

  // echo "picking: ", idx, " ", leftSize, " ", middleSize, " ", rightSize

  if (idx === 0 && !after) {
    if (leftSize >= middleSize && leftSize >= rightSize) {
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
    if (rightSize >= middleSize && rightSize >= leftSize) {
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

  if (!after && idx === 0 && rightSize === 0 && middleSize >= leftSize) {
    let result: TernaryTreeList<T> = {
      kind: TernaryTreeKind.ternaryTreeBranch,
      size: tree.size + 1,
      depth: tree.depth,
      left: { kind: TernaryTreeKind.ternaryTreeLeaf, size: 1, value: item } as TernaryTreeList<T>,
      middle: left,
      right: middle,
    };
    checkListStructure(result);
    return result;
  }

  if (idx <= leftSize - 1) {
    let changedBranch = insert(left, idx, item, after);

    let result: TernaryTreeList<T> = {
      kind: TernaryTreeKind.ternaryTreeBranch,
      size: tree.size + 1,
      depth: decideParentDepth(changedBranch, middle, right),
      left: changedBranch,
      middle: middle,
      right: right,
    };
    checkListStructure(result);
    return result;
  } else if (idx <= leftSize + middleSize - 1) {
    let changedBranch = insert(middle, idx - leftSize, item, after);

    let result: TernaryTreeList<T> = {
      kind: TernaryTreeKind.ternaryTreeBranch,
      size: tree.size + 1,
      depth: decideParentDepth(left, changedBranch, right),
      left: left,
      middle: changedBranch,
      right: right,
    };

    checkListStructure(result);
    return result;
  } else {
    let changedBranch = insert(right, idx - leftSize - middleSize, item, after);

    let result: TernaryTreeList<T> = {
      kind: TernaryTreeKind.ternaryTreeBranch,
      size: tree.size + 1,
      depth: decideParentDepth(left, middle, changedBranch),
      left: left,
      middle: middle,
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

var skipListStructureCheck = false;

/** in some cases we disable for performance */
export let disableListStructureCheck = () => {
  skipListStructureCheck = true;
};

export function checkListStructure<T>(tree: TernaryTreeList<T>): boolean {
  if (skipListStructureCheck) {
    return true;
  }
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

        // Cache children and their sizes to avoid repeated property access
        const left = tree.left;
        const middle = tree.middle;
        const right = tree.right;
        const leftSize = left == null ? 0 : left.size;
        const middleSize = middle == null ? 0 : middle.size;
        const rightSize = right == null ? 0 : right.size;

        if (tree.size !== leftSize + middleSize + rightSize) {
          throw new Error(`Bad size at branch ${formatListInline(tree)}`);
        }
        if (left == null && middle != null) {
          throw new Error("morformed tree");
        }
        if (middle == null && right != null) {
          throw new Error("morformed tree");
        }

        if (tree.depth !== decideParentDepth(left, middle, right)) {
          let x = decideParentDepth(left, middle, right);
          throw new Error(`Bad depth at branch ${formatListInline(tree)}`);
        }

        checkListStructure(left);
        checkListStructure(middle);
        checkListStructure(right);
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

  // Cache children and their sizes to avoid repeated property access
  const left = tree.left;
  const middle = tree.middle;
  const right = tree.right;
  const leftSize = left == null ? 0 : left.size;
  const middleSize = middle == null ? 0 : middle.size;
  const rightSize = right == null ? 0 : right.size;

  // echo "sizes: {leftSize} {middleSize} {rightSize}"

  if (startIdx >= leftSize + middleSize) {
    return slice(right, startIdx - leftSize - middleSize, endIdx - leftSize - middleSize);
  }
  if (startIdx >= leftSize)
    if (endIdx <= leftSize + middleSize) {
      return slice(middle, startIdx - leftSize, endIdx - leftSize);
    } else {
      let middleCut = slice(middle, startIdx - leftSize, middleSize);
      let rightCut = slice(right, 0, endIdx - leftSize - middleSize);
      return concat(middleCut, rightCut);
    }

  if (endIdx <= leftSize) {
    return slice(left, startIdx, endIdx);
  }

  if (endIdx <= leftSize + middleSize) {
    let leftCut = slice(left, startIdx, leftSize);
    let middleCut = slice(middle, 0, endIdx - leftSize);
    return concat(leftCut, middleCut);
  }

  if (endIdx <= leftSize + middleSize + rightSize) {
    let leftCut = slice(left, startIdx, leftSize);
    let rightCut = slice(right, 0, endIdx - leftSize - middleSize);
    return concat(concat(leftCut, middle), rightCut);
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
      // Cache children to avoid repeated property access
      const left = tree.left;
      const middle = tree.middle;
      const right = tree.right;

      let result: TernaryTreeList<V> = {
        kind: TernaryTreeKind.ternaryTreeBranch,
        size: tree.size,
        depth: tree.depth,
        left: left == null ? emptyBranch : listMapValues(left, f),
        middle: middle == null ? emptyBranch : listMapValues(middle, f),
        right: right == null ? emptyBranch : listMapValues(right, f),
      };
      return result;
    }
  }
}
