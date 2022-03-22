export enum TernaryTreeKind {
  ternaryTreeBranch,
  ternaryTreeLeaf,
}

export type TernaryTreeListTheBranch<T> = {
  size: number;
  kind: TernaryTreeKind.ternaryTreeBranch;
  depth: number;
  left: TernaryTreeList<T>;
  middle: TernaryTreeList<T>;
  right: TernaryTreeList<T>;
};

export type TernaryTreeListTheLeaf<T> = {
  size: number;
  kind: TernaryTreeKind.ternaryTreeLeaf;
  value: T;
};

export type TernaryTreeList<T> = TernaryTreeListTheBranch<T> | TernaryTreeListTheLeaf<T>;

export type TernaryTreeMapHashEntry<K, V> = {
  hash: Hash;
  pairs: Array<[K, V]>;
};

export type TernaryTreeMapTheBranch<K, T> = {
  kind: TernaryTreeKind.ternaryTreeBranch;
  depth: number;
  maxHash: number;
  minHash: number;
  left: TernaryTreeMap<K, T>;
  middle: TernaryTreeMap<K, T>;
  right: TernaryTreeMap<K, T>;
};
export type TernaryTreeMapTheLeaf<K, T> = {
  kind: TernaryTreeKind.ternaryTreeLeaf;
  hash: number;
  elements: Array<[K, T]>; // handle hash collapsing
};

export type TernaryTreeMap<K, T> = TernaryTreeMapTheBranch<K, T> | TernaryTreeMapTheLeaf<K, T>;

export type RefInt = {
  value: number;
};

export type Hash = number; // TODO

export let valueHash = (x: any): Hash => {
  if (typeof x === "number") {
    // console.log("hash for x:", x, "\t", result);
    return x;
  } else if (typeof x === "string") {
    let h = 0;
    // https://gist.github.com/hyamamoto/fd435505d29ebfa3d9716fd2be8d42f0#gistcomment-2775538
    for (var i = 0; i < x.length; i++) {
      h = Math.imul(31, h) + (x[i].charCodeAt(0) | 0);
    }
    // console.log("hash for x:", x, "\t", result);
    return h;
  }
  throw new Error("Hash solution not provided for this type(other than number and string)");
};

/** default hash function only handles number and string, need customization */
export let hashGenerator: typeof valueHash = valueHash;

/** allow customizing hash function from outside */
export let overwriteHashGenerator = (f: typeof hashGenerator) => {
  hashGenerator = f;
};

export let mergeValueHash = (base: Hash, x: number | string): Hash => {
  if (typeof x === "number") {
    return Math.imul(31, base) + x;
  } else if (typeof x === "string") {
    let h = base;
    // https://gist.github.com/hyamamoto/fd435505d29ebfa3d9716fd2be8d42f0#gistcomment-2775538
    for (var i = 0; i < x.length; i++) {
      h = Math.imul(31, h) + (x[i].charCodeAt(0) | 0);
    }
    return h;
  }
  throw new Error("Hash solution not provided for this type(other than number and string)");
};
