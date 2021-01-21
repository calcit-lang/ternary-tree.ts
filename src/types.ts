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

export type TernaryTreeMapKeyValuePair<K, V> = {
  k: K;
  v: V;
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
  elements: Array<TernaryTreeMapKeyValuePair<K, T>>; // handle hash collapsing
};

export type TernaryTreeMap<K, T> = TernaryTreeMapTheBranch<K, T> | TernaryTreeMapTheLeaf<K, T>;

export type RefInt = {
  value: number;
};

export type Option<T> = {
  existed: boolean;
  value: T;
};

export function none<T>(): Option<T> {
  let result: Option<T> = {
    existed: false,
    value: null as any,
  };
  return result;
}

export function some<T>(v: T): Option<T> {
  let result: Option<T> = {
    existed: true,
    value: v,
  };
  return result;
}

export type Hash = number; // TODO

export let valueHash = (x: any): number => {
  let result: number = 0;
  if (typeof x === "number") {
    result = x;
  } else if (typeof x === "string") {
    let h = 0;
    // https://gist.github.com/hyamamoto/fd435505d29ebfa3d9716fd2be8d42f0#gistcomment-2775538
    for (var i = 0; i < x.length; i++) {
      h = Math.imul(31, h) + (x[i].charCodeAt(0) | 0);
    }
    result = h;
  } else {
    throw new Error("Hash solution not provided for this type(other than number and string)");
  }
  // console.log("hash for x:", x, "\t", result);
  return result;
};
