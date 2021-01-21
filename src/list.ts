import { RefInt, TernaryTreeKind, TernaryTreeList, TernaryTreeListTheBranch } from "./types";
import {} from "./map";
import { dataEqual, divideTernarySizes, roughIntPow } from "./utils";

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

export function decideParentDepth<T>(...xs: Array<TernaryTreeList<T>>): number {
  var depth = 0;
  for (let x of xs) {
    let y = getDepth(x);
    if (y > depth) {
      depth = y;
    }
  }
  return depth + 1;
}

export function initTernaryTreeListIter<T>(size: number, offset: number, xs: /* var */ Array<TernaryTreeList<T>>): TernaryTreeList<T> {
  switch (size) {
    case 0: {
      return { kind: TernaryTreeKind.ternaryTreeBranch, size: 0, depth: 1, left: emptyBranch, middle: emptyBranch, right: emptyBranch } as TernaryTreeList<T>;
    }
    case 1:
      return xs[offset];
    case 2: {
      let left = xs[offset];
      let right = xs[offset + 1];
      let result: TernaryTreeList<T> = {
        kind: TernaryTreeKind.ternaryTreeBranch,
        size: 2,
        left: left,
        middle: emptyBranch,
        right: right,
        depth: 2,
      };
      return result;
    }
    case 3: {
      let left = xs[offset];
      let middle = xs[offset + 1];
      let right = xs[offset + 2];
      let result: TernaryTreeList<T> = {
        kind: TernaryTreeKind.ternaryTreeBranch,
        size: 3,
        left: left,
        middle: middle,
        right: right,
        depth: 2,
      };
      return result;
    }
    default: {
      let divided = divideTernarySizes(size);

      let left = initTernaryTreeListIter(divided.left, offset, xs);
      let middle = initTernaryTreeListIter(divided.middle, offset + divided.left, xs);
      let right = initTernaryTreeListIter(divided.right, offset + divided.left + divided.middle, xs);
      let result: TernaryTreeList<T> = {
        kind: TernaryTreeKind.ternaryTreeBranch,
        size: size,
        depth: decideParentDepth(left, middle, right),
        left: left,
        middle: middle,
        right: right,
      };
      return result;
    }
  }
}

export function initTernaryTreeList<T>(xs: Array<T>): TernaryTreeList<T> {
  var ys = new Array<TernaryTreeList<T>>(xs.length);
  for (let idx in xs) {
    let x = xs[idx];
    ys[idx] = { kind: TernaryTreeKind.ternaryTreeLeaf, size: 1, value: x };
  }
  return initTernaryTreeListIter(xs.length, 0, ys);
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

export function isLeaf<T>(tree: TernaryTreeList<T>): boolean {
  return tree.kind === TernaryTreeKind.ternaryTreeLeaf;
}

export function isBranch<T>(tree: TernaryTreeList<T>): boolean {
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

export function writeSeq<T>(tree: TernaryTreeList<T>, acc: /* var */ Array<T>, idx: RefInt): void {
  if (tree == null) {
    // discard
  } else {
    switch (tree.kind) {
      case TernaryTreeKind.ternaryTreeLeaf: {
        acc[idx.value] = tree.value;
        idx.value = idx.value + 1;
        break;
      }
      case TernaryTreeKind.ternaryTreeBranch: {
        if (tree.left != null) {
          writeSeq(tree.left, acc, idx);
        }
        if (tree.middle != null) {
          writeSeq(tree.middle, acc, idx);
        }
        if (tree.right != null) {
          writeSeq(tree.right, acc, idx);
        }
        break;
      }
    }
  }
}

export function listToSeq<T>(tree: TernaryTreeList<T>): Array<T> {
  var acc = new Array<T>(listLen(tree));
  var counter: RefInt = { value: 0 };
  counter.value = 0;
  writeSeq(tree, acc, counter);
  return acc;
}

export function listEach<T>(tree: TernaryTreeList<T>, f: (x: T) => void): void {
  if (tree == null) {
    //
  } else {
    switch (tree.kind) {
      case TernaryTreeKind.ternaryTreeLeaf: {
        f(tree.value);
        break;
      }
      case TernaryTreeKind.ternaryTreeBranch: {
        if (tree.left != null) {
          listEach(tree.left, f);
        }
        if (tree.middle != null) {
          listEach(tree.middle, f);
        }
        if (tree.right != null) {
          listEach(tree.right, f);
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

function writeLeavesSeq<T>(tree: TernaryTreeList<T>, acc: /* var */ Array<TernaryTreeList<T>>, idx: RefInt): void {
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
          writeLeavesSeq(tree.left, acc, idx);
        }
        if (tree.middle != null) {
          writeLeavesSeq(tree.middle, acc, idx);
        }
        if (tree.right != null) {
          writeLeavesSeq(tree.right, acc, idx);
        }
        break;
      }
      default: {
        throw new Error("Unknown");
      }
    }
  }
}

export function toLeavesSeq<T>(tree: TernaryTreeList<T>): Array<TernaryTreeList<T>> {
  var acc = new Array<TernaryTreeList<T>>(listLen(tree));
  var counter: RefInt = { value: 0 };
  writeLeavesSeq(tree, acc, counter);
  return acc;
}

// https://forum.nim-lang.org/t/5697
export function* listItems<T>(tree: TernaryTreeList<T>): Generator<T> {
  // let seqItems = tree.toSeq()

  // for x in seqItems:
  //   yield x

  for (let idx = 0; idx < listLen(tree); idx++) {
    yield loopGetList(tree, idx);
  }
}

export function* listPairs<T>(tree: TernaryTreeList<T>): Generator<[number, T]> {
  let seqItems = listToSeq(tree);

  for (let idx in seqItems) {
    let x = seqItems[idx];
    yield [parseInt(idx), x];
  }
}

export function loopGetList<T>(originalTree: TernaryTreeList<T>, originalIdx: number): T {
  var tree = originalTree;
  var idx = originalIdx;
  while (tree != null) {
    if (idx < 0) {
      throw new Error("Cannot index negative number");
    }

    if (tree.kind === TernaryTreeKind.ternaryTreeLeaf) {
      if (idx === 0) {
        return tree.value;
      } else {
        throw new Error("Cannot get from leaf with index {idx}");
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

  throw new Error("Failed to get {idx}");
}

export function first<T>(tree: TernaryTreeList<T>): T {
  if (listLen(tree) > 0) {
    return loopGetList(tree, 0);
  } else {
    throw new Error("Cannot get from empty list");
  }
}

export function last<T>(tree: TernaryTreeList<T>): T {
  if (listLen(tree) > 0) {
    return loopGetList(tree, listLen(tree) - 1);
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
      throw new Error("Cannot get from leaf with index {idx}");
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
    return result;
  }
}

export function dissocList<T>(tree: TernaryTreeList<T>, idx: number): TernaryTreeList<T> {
  if (tree == null) {
    throw new Error("dissoc does not work on null");
  }

  if (idx < 0) {
    throw new Error("Index is negative {idx}");
  }

  if (listLen(tree) === 0) {
    throw new Error("Cannot remove from empty list");
  }

  if (idx > listLen(tree) - 1) {
    throw new Error("Index too large {idx}");
  }

  if (listLen(tree) === 1) {
    let result: TernaryTreeList<T> = {
      kind: TernaryTreeKind.ternaryTreeBranch,
      size: 0,
      depth: 1,
      left: emptyBranch,
      middle: emptyBranch,
      right: emptyBranch,
    };
    return result;
  }

  if (tree.kind === TernaryTreeKind.ternaryTreeLeaf) {
    throw new Error("dissoc should be handled at branches");
  }

  let leftSize = listLen(tree.left);
  let middleSize = listLen(tree.middle);
  let rightSize = listLen(tree.right);

  if (leftSize + middleSize + rightSize !== tree.size) {
    throw new Error("tree.size does not match sum case branch sizes");
  }

  let result: TernaryTreeList<T> = emptyBranch;

  if (idx <= leftSize - 1) {
    let changedBranch = dissocList(tree.left, idx);
    if (changedBranch.size === 0) {
      changedBranch = emptyBranch;
    }
    result = {
      kind: TernaryTreeKind.ternaryTreeBranch,
      size: tree.size - 1,
      depth: decideParentDepth(changedBranch, tree.middle, tree.right),
      left: changedBranch,
      middle: tree.middle,
      right: tree.right,
    };
  } else if (idx <= leftSize + middleSize - 1) {
    let changedBranch = dissocList(tree.middle, idx - leftSize);
    if (changedBranch.size === 0) {
      changedBranch = emptyBranch;
    }
    result = {
      kind: TernaryTreeKind.ternaryTreeBranch,
      size: tree.size - 1,
      depth: decideParentDepth(tree.left, changedBranch, tree.right),
      left: tree.left,
      middle: changedBranch,
      right: tree.right,
    };
  } else {
    let changedBranch = dissocList(tree.right, idx - leftSize - middleSize);
    if (changedBranch.size === 0) {
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
  // TODO
  if (listLen(result) === 1) {
    result = {
      kind: TernaryTreeKind.ternaryTreeLeaf,
      size: 1,
      value: loopGetList(result, 0),
    };
  }
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
      return result;
    } else {
      let result: TernaryTreeList<T> = {
        kind: TernaryTreeKind.ternaryTreeBranch,
        depth: getDepth(tree) + 1,
        size: 2,
        left: emptyBranch,
        middle: { kind: TernaryTreeKind.ternaryTreeLeaf, size: 1, value: item } as TernaryTreeList<T>,
        right: tree,
      };
      return result;
    }
  }

  if (listLen(tree) === 1) {
    if (after)
      if (tree.left != null) {
        let result: TernaryTreeList<T> = {
          kind: TernaryTreeKind.ternaryTreeBranch,
          size: 2,
          depth: 2,
          left: tree.left,
          middle: { kind: TernaryTreeKind.ternaryTreeLeaf, size: 1, value: item } as TernaryTreeList<T>,
          right: emptyBranch,
        };
        return result;
      } else if (tree.middle != null) {
        let result: TernaryTreeList<T> = {
          kind: TernaryTreeKind.ternaryTreeBranch,
          size: 2,
          depth: 2,
          left: emptyBranch,
          middle: tree.middle,
          right: { kind: TernaryTreeKind.ternaryTreeLeaf, size: 1, value: item } as TernaryTreeList<T>,
        };
        return result;
      } else {
        let result: TernaryTreeList<T> = {
          kind: TernaryTreeKind.ternaryTreeBranch,
          size: 2,
          depth: 2,
          left: tree.right,
          middle: { kind: TernaryTreeKind.ternaryTreeLeaf, size: 1, value: item } as TernaryTreeList<T>,
          right: emptyBranch,
        };
        return result;
      }
    else {
      if (tree.right != null) {
        let result: TernaryTreeList<T> = {
          kind: TernaryTreeKind.ternaryTreeBranch,
          size: 2,
          depth: 2,
          left: emptyBranch,
          middle: { kind: TernaryTreeKind.ternaryTreeLeaf, size: 1, value: item } as TernaryTreeList<T>,
          right: tree.right,
        };
        return result;
      } else if (tree.middle != null) {
        let result: TernaryTreeList<T> = {
          kind: TernaryTreeKind.ternaryTreeBranch,
          size: 2,
          depth: getDepth(tree.middle) + 1,
          left: { kind: TernaryTreeKind.ternaryTreeLeaf, size: 1, value: item } as TernaryTreeList<T>,
          middle: tree.middle,
          right: emptyBranch,
        };
        return result;
      } else {
        let result: TernaryTreeList<T> = {
          kind: TernaryTreeKind.ternaryTreeBranch,
          size: 2,
          depth: getDepth(tree.middle) + 1,
          left: emptyBranch,
          middle: { kind: TernaryTreeKind.ternaryTreeLeaf, size: 1, value: item } as TernaryTreeList<T>,
          right: tree.left,
        };
        return result;
      }
    }
  }

  if (listLen(tree) === 2) {
    if (after) {
      if (tree.right == null) {
        let result: TernaryTreeList<T> = {
          kind: TernaryTreeKind.ternaryTreeBranch,
          size: 3,
          depth: 2,
          left: tree.left,
          middle: tree.middle,
          right: { kind: TernaryTreeKind.ternaryTreeLeaf, size: 1, value: item } as TernaryTreeList<T>,
        };
        return result;
      } else if (tree.middle == null) {
        if (idx === 0) {
          let result: TernaryTreeList<T> = {
            kind: TernaryTreeKind.ternaryTreeBranch,
            size: 3,
            depth: 2,
            left: tree.left,
            middle: { kind: TernaryTreeKind.ternaryTreeLeaf, size: 1, value: item } as TernaryTreeList<T>,
            right: tree.right,
          };
          return result;
        } else if (idx === 1) {
          let result: TernaryTreeList<T> = {
            kind: TernaryTreeKind.ternaryTreeBranch,
            size: 3,
            depth: 2,
            left: tree.left,
            middle: tree.right,
            right: { kind: TernaryTreeKind.ternaryTreeLeaf, size: 1, value: item } as TernaryTreeList<T>,
          };
          return result;
        } else {
          throw new Error(`Unexpected idx: ${idx}`);
        }
      } else {
        if (idx === 0) {
          let result: TernaryTreeList<T> = {
            kind: TernaryTreeKind.ternaryTreeBranch,
            size: 3,
            depth: 2,
            left: tree.middle,
            middle: { kind: TernaryTreeKind.ternaryTreeLeaf, size: 1, value: item } as TernaryTreeList<T>,
            right: tree.right,
          };
          return result;
        } else if (idx === 1) {
          let result: TernaryTreeList<T> = {
            kind: TernaryTreeKind.ternaryTreeBranch,
            size: 3,
            depth: 2,
            left: tree.middle,
            middle: tree.right,
            right: { kind: TernaryTreeKind.ternaryTreeLeaf, size: 1, value: item } as TernaryTreeList<T>,
          };
          return result;
        } else {
          throw new Error("Unexpected idx: {idx}");
        }
      }
    } else {
      if (tree.left == null) {
        let result: TernaryTreeList<T> = {
          kind: TernaryTreeKind.ternaryTreeBranch,
          size: 3,
          depth: 2,
          left: { kind: TernaryTreeKind.ternaryTreeLeaf, size: 1, value: item } as TernaryTreeList<T>,
          middle: tree.middle,
          right: tree.right,
        };
        return result;
      } else if (tree.middle == null) {
        if (idx === 0) {
          let result: TernaryTreeList<T> = {
            kind: TernaryTreeKind.ternaryTreeBranch,
            size: 3,
            depth: 2,
            left: { kind: TernaryTreeKind.ternaryTreeLeaf, size: 1, value: item } as TernaryTreeList<T>,
            middle: tree.left,
            right: tree.right,
          };
          return result;
        } else if (idx === 1) {
          let result: TernaryTreeList<T> = {
            kind: TernaryTreeKind.ternaryTreeBranch,
            size: 3,
            depth: 2,
            left: tree.left,
            middle: { kind: TernaryTreeKind.ternaryTreeLeaf, size: 1, value: item } as TernaryTreeList<T>,
            right: tree.right,
          };
          return result;
        } else {
          throw new Error("Unexpected idx: {idx}");
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
          return result;
        } else {
          throw new Error("Unexpected idx: {idx}");
        }
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
        left: emptyBranch,
        middle: { kind: TernaryTreeKind.ternaryTreeLeaf, size: 1, value: item } as TernaryTreeList<T>,
        right: tree,
      };
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
    return result;
  }

  if (!after && idx === 0 && leftSize === 0 && middleSize >= rightSize) {
    let result: TernaryTreeList<T> = {
      kind: TernaryTreeKind.ternaryTreeBranch,
      size: tree.size + 1,
      depth: tree.depth,
      left: { kind: TernaryTreeKind.ternaryTreeLeaf, size: 1, value: item } as TernaryTreeList<T>,
      middle: tree.middle,
      right: tree.right,
    };
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
    var ys = toLeavesSeq(tree);
    let newTree = initTernaryTreeListIter(ys.length, 0, ys) as TernaryTreeListTheBranch<T>;
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
  if (currentDepth > 50) {
    if (roughIntPow(3, currentDepth - 50) > tree.size) {
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

export function concat<T>(xs: TernaryTreeList<T>, ys: TernaryTreeList<T>): TernaryTreeList<T> {
  if (xs == null || listLen(xs) === 0) return ys;
  if (ys == null || listLen(ys) === 0) return xs;
  let result = {
    kind: TernaryTreeKind.ternaryTreeBranch,
    size: xs.size + ys.size,
    depth: decideParentDepth(xs, emptyBranch, ys),
    left: xs,
    middle: emptyBranch,
    right: ys,
  } as TernaryTreeList<T>;
  maybeReblance(result);
  return result;
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
    if (!dataEqual(loopGetList(xs, idx), loopGetList(ys, idx))) {
      return false;
    }
  }

  return true;
}

export function checkListStructure<T>(tree: TernaryTreeList<T>): boolean {
  if (tree == null) {
    return true;
  } else {
    switch (tree.kind) {
      case TernaryTreeKind.ternaryTreeLeaf:
        if (tree.size !== 1) {
          throw new Error(`Bad size at node ${formatListInline(tree)}`);
        }
        break;
      case TernaryTreeKind.ternaryTreeBranch: {
        if (tree.size !== listLen(tree.left) + listLen(tree.middle) + listLen(tree.right)) {
          throw new Error(`Bad size at branch ${formatListInline(tree)}`);
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

  if (startIdx >= leftSize + middleSize) return slice(tree.right, startIdx - leftSize - middleSize, endIdx - leftSize - middleSize);
  if (startIdx >= leftSize)
    if (endIdx <= leftSize + middleSize) return slice(tree.middle, startIdx - leftSize, endIdx - leftSize);
    else {
      let middleCut = slice(tree.middle, startIdx - leftSize, middleSize);
      let rightCut = slice(tree.right, 0, endIdx - leftSize - middleSize);
      return concat(middleCut, rightCut);
    }

  if (endIdx <= leftSize) return slice(tree.left, startIdx, endIdx);

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
      return result;
    }
  }
}
