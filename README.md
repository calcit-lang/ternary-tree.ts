## ternary-tree in TypeScript

> ported from [ternary-tree](https://github.com/calcit-lang/ternary-tree), providing a ternary tree based persistent data structure.

### APIs

![npm](https://img.shields.io/npm/v/@calcit/ternary-tree?style=flat-square)

Map functions:

```ts
export function initTernaryTreeMapFromHashEntries<K, T>(xs: Array<TernaryTreeMapHashEntry<K, T>>): TernaryTreeMap<K, T>;
export function initTernaryTreeMap<K, T>(t: Map<K, T>): TernaryTreeMap<K, T>;
export function initEmptyTernaryTreeMap<K, T>(): TernaryTreeMap<K, T>;

export function mapLen<K, V>(tree: TernaryTreeMap<K, V>): number;
export function isMapEmpty<K, V>(tree: TernaryTreeMap<K, V>): boolean;
export function contains<K, T>(tree: TernaryTreeMap<K, T>, item: K, hx: Hash = null as any): boolean;
export function mapEqual<K, V>(xs: TernaryTreeMap<K, V>, ys: TernaryTreeMap<K, V>): boolean;
export function mapGet<K, T>(originalTree: TernaryTreeMap<K, T>, item: K): T;

export function* toPairs<K, T>(tree: TernaryTreeMap<K, T>): Generator<[K, T]>;
export function* toKeys<K, V>(tree: TernaryTreeMap<K, V>): Generator<K>;
export function* toValues<K, V>(tree: TernaryTreeMap<K, V>): Generator<V>;
export function toPairsArray<K, T>(tree: TernaryTreeMap<K, T>): Array<[K, T]>;

export function assocMap<K, T>(tree: TernaryTreeMap<K, T>, key: K, item: T, disableBalancing: boolean = false): TernaryTreeMap<K, T>;
export function dissocMap<K, T>(tree: TernaryTreeMap<K, T>, key: K): TernaryTreeMap<K, T>;
export function merge<K, T>(xs: TernaryTreeMap<K, T>, ys: TernaryTreeMap<K, T>): TernaryTreeMap<K, T>;
export function mergeSkip<K, T>(xs: TernaryTreeMap<K, T>, ys: TernaryTreeMap<K, T>, skipped: T): TernaryTreeMap<K, T>;

export function toHashSortedPairs<K, T>(tree: TernaryTreeMap<K, T>): Array<[K, T]>;
export function mapToString<K, V>(tree: TernaryTreeMap<K, V>): string;
export function formatMapInline<K, V>(tree: TernaryTreeMap<K, V>, withHash: boolean = false): string;
export function checkMapStructure<K, V>(tree: TernaryTreeMap<K, V>): boolean;
export function getMapDepth<K, V>(tree: TernaryTreeMap<K, V>): number;
export function forceMapInplaceBalancing<K, T>(tree: TernaryTreeMap<K, T>): void;
export function sameMapShape<K, T>(xs: TernaryTreeMap<K, T>, ys: TernaryTreeMap<K, T>): boolean;
```

List functions:

```ts
function makeTernaryTreeList<T>(size: number, offset: number, xs: /* var */ Array<TernaryTreeList<T>>): TernaryTreeList<T>;
function initTernaryTreeList<T>(xs: Array<T>): TernaryTreeList<T>;
function initEmptyTernaryTreeList<T>(): TernaryTreeList<T>;

function* listToItems<T>(tree: TernaryTreeList<T>): Generator<T>;
function* indexToItems<T>(tree: TernaryTreeList<T>): Generator<T>;
function* listToPairs<T>(tree: TernaryTreeList<T>): Generator<[number, T]>;

function listLen<T>(tree: TernaryTreeList<T>): number;
function listEqual<T>(xs: TernaryTreeList<T>, ys: TernaryTreeList<T>): boolean;
function listGet<T>(originalTree: TernaryTreeList<T>, originalIdx: number): T;
function first<T>(tree: TernaryTreeList<T>): T;
function last<T>(tree: TernaryTreeList<T>): T;
function slice<T>(tree: TernaryTreeList<T>, startIdx: number, endIdx: number): TernaryTreeList<T>;

function findIndex<T>(tree: TernaryTreeList<T>, f: (x: T) => boolean): number;
function indexOf<T>(tree: TernaryTreeList<T>, item: T): number;
function assocList<T>(tree: TernaryTreeList<T>, idx: number, item: T): TernaryTreeList<T>;
function dissocList<T>(tree: TernaryTreeList<T>, idx: number): TernaryTreeList<T>;
function rest<T>(tree: TernaryTreeList<T>): TernaryTreeList<T>;
function butlast<T>(tree: TernaryTreeList<T>): TernaryTreeList<T>;
function insert<T>(tree: TernaryTreeList<T>, idx: number, item: T, after: boolean = false): TernaryTreeList<T>;
function assocBefore<T>(tree: TernaryTreeList<T>, idx: number, item: T, after: boolean = false): TernaryTreeList<T>;
function assocAfter<T>(tree: TernaryTreeList<T>, idx: number, item: T, after: boolean = false): TernaryTreeList<T>;
function prepend<T>(tree: TernaryTreeList<T>, item: T, disableBalancing: boolean = false): TernaryTreeList<T>;
function append<T>(tree: TernaryTreeList<T>, item: T, disableBalancing: boolean = false): TernaryTreeList<T>;
function concat<T>(xs: TernaryTreeList<T>, ys: TernaryTreeList<T>): TernaryTreeList<T>;
function reverse<T>(tree: TernaryTreeList<T>): TernaryTreeList<T>;

function sameListShape<T>(xs: TernaryTreeList<T>, ys: TernaryTreeList<T>): boolean;
function getDepth<T>(tree: TernaryTreeList<T>): number;
function listToString<T>(tree: TernaryTreeList<T>): string;
function formatListInline<T>(tree: TernaryTreeList<T>): string;
function checkListStructure<T>(tree: TernaryTreeList<T>): boolean;
function forceListInplaceBalancing<T>(tree: TernaryTreeList<T>): void;
```

To overwrite internals behaviors:

```ts
overwriteHashGenerator(f);

overwriteComparator(f);
```

### License

MIT
