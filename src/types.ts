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
