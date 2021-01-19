

import {TernaryTreeMap, TernaryTreeKind, TernaryTreeMapTheLeaf, TernaryTreeMapTheBranch, TernaryTreeMapKeyValuePair, RefInt, Option, some, none} from './types'
import {divideTernarySizes, roughIntPow} from './utils'

export type TernaryTreeMapKeyValuePairOfLeaf<K, V> = {
  k: K
  v: TernaryTreeMap<K, V>
}

export function isLeaf<K, V>(tree: TernaryTreeMap<K, V>): boolean {
  return tree.kind == TernaryTreeKind.ternaryTreeLeaf
}

export function isBranch<K, V> (tree: TernaryTreeMap<K, V>): boolean {
  return tree.kind == TernaryTreeKind.ternaryTreeBranch
}

export function getMax<K, V> (tree: TernaryTreeMap<K, V>): number {

  if (tree == null) {

    throw new Error("Cannot find max hash of nil")
  }
  switch( tree.kind) {
    case TernaryTreeKind.ternaryTreeLeaf:
      return tree.hash
    case TernaryTreeKind.ternaryTreeBranch:
      return tree.maxHash
     default:
       throw new Error("Unknown")
  }
}

export function getMin<K, V> (tree: TernaryTreeMap<K, V>): number {
  if (tree == null) {

    throw new Error( "Cannot find min hash of nil")
  }
  switch( tree.kind) {

    case TernaryTreeKind. ternaryTreeLeaf:
      return tree.hash
    case TernaryTreeKind.ternaryTreeBranch:
      return tree.minHash
     default:
       throw new Error("Unknown")
  }
}

export function getDepth<K, V>(tree: TernaryTreeMap<K, V>): number {
  // console.log( "calling...", tree)
  if (tree == null) {

    return 0
  }
  switch( tree.kind) {
    case TernaryTreeKind.ternaryTreeLeaf:
      return 1
    case TernaryTreeKind.ternaryTreeBranch:
      return Math.max(tree.left.getDepth(), tree.middle.getDepth(), tree.right.getDepth()) + 1
    default:
      throw new Error("Unknown")
  }
}

export function createLeaf<K, T>(k: K, v: T): TernaryTreeMap<K, T>{
  let result: TernaryTreeMapTheLeaf<K, T> = {
    kind:TernaryTreeKind.ternaryTreeLeaf,
    hash: k.hash, // TODO
    elements: [
      {k: k, v: v}
    ]
  }
  return result
}

export function createLeaf<K, T>(item: TernaryTreeMapKeyValuePair<K, T>): TernaryTreeMap<K, T> {
  let result :TernaryTreeMap<K, T> = {
    kind: TernaryTreeKind.ternaryTreeLeaf,
    hash: item.k.hash, // TODO
    elements: [item]
  }
  return result
}

// this proc is not exported, pick up next proc as the entry.
// pairs must be sorted before passing to proc.
export function initTernaryTreeMap<K, T>(size: int, offset: int, xs: /* var */ Array<TernaryTreeMapKeyValuePairOfLeaf<K, T>>): TernaryTreeMap<K, T> {
  switch( size){
    case 0: {
      let result: TernaryTreeMapTheBranch<K, T> = {
        kind: TernaryTreeKind.ternaryTreeBranch, maxHash: 0, minHash: 0,
        left: null, middle: null, right: null,
      }
      return result
    }
    case 1: {
        let middlePair = xs[offset]
        let hashVal = middlePair.k.hash
        let result: TernaryTreeMap<K, T> = {
          kind: TernaryTreeKind.ternaryTreeBranch, maxHash: hashVal, minHash: hashVal,
          left: null, right: null,
          middle: middlePair.v
        }
        return result
      }
    case 2: {
      let leftPair = xs[offset]
      let rightPair = xs[offset + 1]
      let result: TernaryTreeMap<K, T> = {
        kind: TernaryTreeKind.ternaryTreeBranch,
        maxHash: rightPair.k.hash, // TODO
        minHash: leftPair.k.hash, // TODO
        middle: null,
        left: leftPair.v,
        right: rightPair.v,
      }
      return result
    }
    case 3: {

      let leftPair = xs[offset]
      let middlePair = xs[offset + 1]
      let rightPair = xs[offset + 2]
      let result: TernaryTreeMap<K, T> = {
        kind: ternaryTreeBranch,
        maxHash: rightPair.k.hash, // TODO
        minHash: leftPair.k.hash, // TODO
        left: leftPair.v,
        middle: middlePair.v,
        right: rightPair.v,
      }
      return result
    }
    default: {

      let divided = divideTernarySizes(size)
  
      let left = initTernaryTreeMap(divided.left, offset, xs)
      let middle = initTernaryTreeMap(divided.middle, offset + divided.left, xs)
      let right = initTernaryTreeMap(divided.right, offset + divided.left + divided.middle,  xs)
  
      let result: TernaryTreeMap<K, T> = {
        kind: ternaryTreeBranch,
        maxHash: right.getMax(),
        minHash: left.getMin(),
        left: left, middle: middle, right: right
      }
      return result
    }
  }
}

export function initTernaryTreeMap<K, T>(xs: Array<TernaryTreeMapKeyValuePair<K, T>>): TernaryTreeMap<K, T> {
  let leavesList = xs.map(
    (pair: TernaryTreeMapKeyValuePair<K, T>): TernaryTreeMapKeyValuePairOfLeaf<K, T> => {
      return {k: pair.k, v: createLeaf<K, T>(pair)}
    }
  )
  return initTernaryTreeMap(leavesList.len, 0, leavesList)
}

let cmp = (x, y) => {
  if (x < y) {
    return -1
  }
  if (x > y) {
    return 1
  }
  return 0
}

export function initTernaryTreeMap<K, T>(t: Map<K, T>): TernaryTreeMap<K, T> {
  var xs = new Array<TernaryTreeMapKeyValuePair<K, T>>(t.len)

  var idx = 0
  for (let [k, v] of t) {
    xs[idx] = (k,v)
    idx = idx + 1
  }

  // TODO clone
  let ys = xs.sort((x, y: TernaryTreeMapKeyValuePair<K, T>): number => {
    let hx = x.k.hash
    let hy = y.k.hash
    return cmp(hx, hy)
  }
  )

  initTernaryTreeMap(ys)
}

// for empty map
export function initTernaryTreeMap<K, T>(): TernaryTreeMap<K, T> {
  let result: TernaryTreeMapTheBranch<K, T> = {
    kind: TernaryTreeKind.ternaryTreeBranch, maxHash: 0, minHash: 0,
    left: null, middle: null, right: null
  }
  return result
}

export function $<K, V>(tree: TernaryTreeMap<K, V>): string {
  return `TernaryTreeMap[${tree.len}, ...]`
}

export function len<K, V>(tree: TernaryTreeMap<K, V>): number {
  if (tree == null) {
    return 0
  }
  switch( tree.kind) {

    case TernaryTreeKind.ternaryTreeLeaf:
      return 1
    case TernaryTreeKind.ternaryTreeBranch:
      return tree.left.len + tree.middle.len + tree.right.len // TODO
    default:
      throw new Error("Unknown")
  }
}

export function formatInline<K, V>(tree: TernaryTreeMap<K, V>, withHash: boolean = false): string {

  if (tree = null) {
    return "_"
  }
  switch (tree.kind) {

    case TernaryTreeKind.ternaryTreeLeaf:
      if (withHash) {

        return `${tree.hash}->${tree.elements[0].k}:${tree.elements[0].v}` // TODO show whole list
      }
      else {

        return `${tree.elements[0].k}:${tree.elements[0].v}`
      }
    case TernaryTreeKind.ternaryTreeBranch: {
      return "(" + tree.left.formatInline(withHash) + " " + tree.middle.formatInline(withHash) + " " + tree.right.formatInline(withHash) + ")"
    }

    default:
      throw new Error("Unknown")
  }
}

export function isEmpty<K, V>(tree: TernaryTreeMap<K, V>): boolean {

  if (tree == null) {
    return true
  }
  switch (tree.kind) {

    case TernaryTreeKind.ternaryTreeLeaf:
      return false
    case TernaryTreeKind.ternaryTreeBranch:
      return tree.left == null && tree.middle == null && tree.right == null
    default:
      throw new Error("Unknown")
  }
}

export function collectHashSortedSeq<K, T>(tree: TernaryTreeMap<K, T>, acc: /* var */ Array<TernaryTreeMapKeyValuePair<K, T>>, idx: RefInt): void {

  if ((tree == null) || isEmpty(tree)) {
    // discard
  }
  else {

    switch( tree.kind) {

      case TernaryTreeKind.ternaryTreeLeaf: {
        for (let item of tree.elements) {
          acc[idx.value] = item
          idx.value = idx.value + 1
        }
        break
      }
      case TernaryTreeKind. ternaryTreeBranch: {

        tree.left.collectHashSortedSeq(acc, idx)
        tree.middle.collectHashSortedSeq(acc, idx)
        tree.right.collectHashSortedSeq(acc, idx)
        break
      }
      default:
        throw new Error("Unknown")
    }
  }
}

// sorted by hash(tree.key)
export function toHashSortedSeq<K, T>(tree: TernaryTreeMap<K, T>): Array<TernaryTreeMapKeyValuePair<K, T>> {
  var acc = new Array<TernaryTreeMapKeyValuePair<K, T>>(tree.len)
  var idx: RefInt = {value: 0}
  collectHashSortedSeq(tree, acc, idx)
  return acc
}

export function collectHashSortedSeqOfLeaf<K, T>(tree: TernaryTreeMap<K, T>, acc: /* var */ Array<TernaryTreeMapKeyValuePairOfLeaf<K, T>>, idx: RefInt): void {
  if (tree == null || isEmpty(tree)) {
    // discard
  }
  else {
    switch( tree.kind) {

      case TernaryTreeKind.ternaryTreeLeaf: {
        for (let pair of tree.elements) {
          let item:  TernaryTreeMap<K, T> = {
            kind: TernaryTreeKind.ternaryTreeLeaf,
            hash: tree.hash, // TODO
            elements: [pair]
          }
          acc[idx.value] = {k: pair.k, v: item}
          idx.value = idx.value + 1
        }
        break
      }
      case TernaryTreeKind.ternaryTreeBranch: {
        tree.left.collectHashSortedSeqOfLeaf(acc, idx)
        tree.middle.collectHashSortedSeqOfLeaf(acc, idx)
        tree.right.collectHashSortedSeqOfLeaf(acc, idx)
        break
      }
      default: {
        throw new Error("Unknown")
      }
    }
  }

}

// for reusing leaves during rebalancing
export function toHashSortedSeqOfLeaves<K, T>(tree: TernaryTreeMap<K, T>): Array<TernaryTreeMapKeyValuePairOfLeaf<K, T>> {
  var acc = new Array<TernaryTreeMapKeyValuePairOfLeaf<K, T>>(tree.len)
  let idx: RefInt = {value: 0}
  collectHashSortedSeqOfLeaf(tree, acc, idx)
  return acc
}

export function contains<K, T>(tree: TernaryTreeMap<K, T>, item: K): bool {
  if (tree == null) {
    return false
  }

  if (tree.kind === TernaryTreeKind.ternaryTreeLeaf) {
    for (let pair of tree.elements) {
      if (pair.k === item) {
        return true
      }
    }
    return false
  }

  let hx = item.hash // TODO
  // echo "looking for: ", hx, " ", item, " in ", tree.formatInline(true)
  if (tree.left != null) {
    if (tree.left.kind === TernaryTreeKind.ternaryTreeLeaf) {
      if (tree.left.hash == hx) {
        return true
      }
    } else if (hx >= tree.left.minHash && hx <= tree.left.maxHash) {
      return tree.left.contains(item) // TODO
    }
  }

  if (tree.middle != null) {
    if (tree.middle.kind == TernaryTreeKind. ternaryTreeLeaf) {
      if (tree.middle.hash == hx) {
        return true
      }
    } else if (hx >= tree.middle.minHash && hx <= tree.middle.maxHash) {
      return tree.middle.contains(item)
    }
  }

  if (tree.right != null) {

    // echo "right..."
    if (tree.right.kind === TernaryTreeKind. ternaryTreeLeaf) {
      if (tree.right.hash === hx) {

        return true
      }
    }
    else if (hx >= tree.right.minHash && hx <= tree.right.maxHash) {

      return tree.right.contains(item) // TODO
    }
  }

  return false

}

export function loopGet<K, T>(originalTree: TernaryTreeMap<K, T>, item: K): Option<T> {

  let hx = item.hash

  var tree = originalTree

  while (tree != null) {

    if (tree.kind == TernaryTreeKind.ternaryTreeLeaf) {
      for (pair in tree.elements) {
        if (pair.k === item) {
          return some(pair.v)
        }
      }
      return none()
    }
  
    // echo "looking for: ", hx, " ", item, " in ", tree.formatInline
  
    if (tree.left != null) {
      if (tree.left.kind == TernaryTreeKind.ternaryTreeLeaf) {
        if (tree.left.hash === hx) {
          for (let pair of tree.left.elements) {
            if (pair.k === item) {
              return some(pair.v)
            }
          }
          return none()
        }
      }
      else if (hx >= tree.left.minHash && hx <= tree.left.maxHash) {
        tree = tree.left
        continue
      }
    }
  
    if (tree.middle != null) {
      if (tree.middle.kind == TernaryTreeKind.ternaryTreeLeaf) {
        if (tree.middle.hash == hx) {
          for (let pair of tree.middle.elements) {
            if (pair.k == item) {
              return some(pair.v)
            }
          }
          return none()
        }
      }
      else if (hx >= tree.middle.minHash && hx <= tree.middle.maxHash) {
        tree = tree.middle
        continue
      }
    }
  
    if (tree.right != null) {
      if (tree.right.kind == TernaryTreeKind.ternaryTreeLeaf) {
        if (tree.right.hash == hx) {
          for (let pair of tree.right.elements) {
            if (pair.k == item) {
              return some(pair.v)
            }
          }
          return none(T)
        }
      }
      else if (hx >= tree.right.minHash && hx <= tree.right.maxHash) {
        tree = tree.right
        continue
      }
    }
  
    return none()
  }

  return none()
}


// TODO
export function _GET_<K, T>(tree: TernaryTreeMap<K, T>, key: K): Option<T> {
  return tree.loopGet(key)
}

// leaves on the left has smaller hashes
// TODO check sizes, hashes
export function checkStructure<K, V>(tree: TernaryTreeMap<K, V>): boolean {
  if (tree.kind == TernaryTreeKind.ternaryTreeLeaf) {
    for (let pair of tree.elements) {

      if (tree.hash != pair.k.hash) {
        throw new Error(`Bad hash at leaf node ${tree}`)
      }
    }
  
    if (tree.length != 1) {

      throw new Error(`Bad len at leaf node ${tree}`)
    }
  }
  
  else {
    if (tree.left != null && tree.middle != null) {
      if (getMax(tree.left) >= getMin(tree.middle)) {
        throw new Error(`Wrong hash order at left/middle branches ${tree.formatInline(true)}`)
      }
    }
  
    if (tree.left != null &&  tree.right != null) {

      if (getMax(tree.left) >= getMin(tree.right)) {
        console.log( getMax(tree.left), getMin(tree.right))
        throw new Error(`Wrong hash order at left/right branches ${tree.formatInline(true)}`)
      }
  
    }
    if (tree.middle !=null && tree.right != null) {

      if (getMax(tree.middle) >= getMin(tree.right)) {

        throw new Error(`Wrong hash order at middle/right branches ${tree.formatInline(true)}`)
      }
    }
  
    if (tree.left != null) {
      checkStructure(tree.left)
    }
    if (tree.middle != null) {
      checkStructure(tree.middle)
    }
    if ( tree.right != null) {
      checkStructure(tree.right)
    }
  }
  
  return true
}


export function rangeContainsHash<K, T>(tree: TernaryTreeMap<K, T>, thisHash: Hash): boolean {
  if (tree == null) {
    return false
  }
  else if (tree.kind == TernaryTreeKind.ternaryTreeLeaf) {
    return tree.hash == thisHash
  }
  else {
    return thisHash >= tree.minHash && thisHash <= tree.maxHash
  }
}

export function assocExisted<K, T>(tree: TernaryTreeMap<K, T>, key: K, item: T): TernaryTreeMap<K, T> {
  if (tree == null || isEmpty(tree)) {
    throw new Error("Cannot call assoc on nil")
  }

  let thisHash = key.hash

  if (tree.kind == TernaryTreeKind.ternaryTreeLeaf) {
    var newPairs = new Array<TernaryTreeMapKeyValuePair<K, T>>(tree.elements.len)
    var replaced = false
    for (let idx, pair in tree.elements) {
      if (pair.k == key) {
        newPairs[idx] = {k: key, v: item}
        replaced = true
      }
      else {
        newPairs[idx] = pair
      }
    }
    if (replaced) {
      return TernaryTreeMap<K, T>(kind: TernaryTreeKind.ternaryTreeLeaf, hash: thisHash, elements: newPairs)
    }
    else {

      throw new Error("Unexpected missing hash in assoc, invalid branch")
    }
  }

  if (thisHash < tree.minHash)
    throw new Error("Unexpected missing hash in assoc, hash too small")

  else if (thisHash > tree.maxHash)
    throw new Error("Unexpected missing hash in assoc, hash too large")

  if ( tree.left!=null)
    if (tree.left.rangeContainsHash(thisHash)) {
      let result: TernaryTreeMapTheBranch<K, T> =  {
        kind: TernaryTreeKind.ternaryTreeBranch,
        maxHash: tree.maxHash,
        minHash: tree.minHash,
        left: tree.left.assocExisted(key, item),
        middle: tree.middle,
        right: tree.right
      }
      return result
    }

  if (tree.middle!=null)
    if (tree.middle.rangeContainsHash(thisHash)) {
      let result:TernaryTreeMapTheBranch<K, T> = {

        kind: TernaryTreeKind.ternaryTreeBranch,
        maxHash: tree.maxHash,
        minHash: tree.minHash,
        left: tree.left,
        middle: tree.middle.assocExisted(key, item),
        right: tree.right
      }
      return result

    }

  if (tree.right!=null) {
    if (tree.right.rangeContainsHash(thisHash)) {
      let result: TernaryTreeMapTheBranch<K, T> = {
        kind: TernaryTreeKind.ternaryTreeBranch,
        maxHash: tree.maxHash,
        minHash: tree.minHash,
        left: tree.left,
        middle: tree.middle,
        right: tree.right.assocExisted(key, item)
      }
      return result

    }
  }
  else {
    throw new Error("Unexpected missing hash in assoc, found not branch")
  }
}

export function isSome<K, T>(tree: TernaryTreeMap<K, T>): boolean {
  if (tree==null) {
    return false
  }
  else {
    return true
  }
}

export function assocNew<K, T>(tree: TernaryTreeMap<K, T>, key: K, item: T): TernaryTreeMap<K, T> {

  // echo fmt"assoc new: {key} to {tree.formatInline}"
  if (tree==null || tree.isEmpty) {
    return createLeaf(key, item)
  }

  let thisHash = key.hash

  if (tree.kind == TernaryTreeKind.ternaryTreeLeaf) {
    if (thisHash == tree.hash) {
      for (let pair of tree.elements) {
        if (pair.k == key) {
          throw new Error("Unexpected existed key in assoc")
        }
      }
      var newPairs = new Array<TernaryTreeMapKeyValuePair<K, T>>(tree.elements.len + 1)
      for (let idx in tree.elements) {
        let pair = tree.elements[idx]
        newPairs[idx] = pair
      }
      newPairs[tree.elements.length] = {k: key, v: item}
    }
    else {
      if (thisHash > tree.hash) {
        let childBranch: TernaryTreeMapTheLeaf<K, T> = {
          kind: TernaryTreeKind.ternaryTreeLeaf, hash: thisHash, elements: [{k: key, v: item}]
        }
        let result: TernaryTreeMapTheBranch<K, T> = {
          kind: TernaryTreeKind.ternaryTreeBranch, maxHash: thisHash, minHash: tree.hash,
          left: null as any,
          middle: tree,
          right: childBranch
          
        }
        return result
      }
      else {
        let childBranch: TernaryTreeMapTheLeaf<K, T> = {
          kind: TernaryTreeKind.ternaryTreeLeaf, hash: thisHash, elements: [{k: key, v: item}]
        }
        let result: TernaryTreeMapTheBranch<K, T> = {
          kind: TernaryTreeKind.ternaryTreeBranch, maxHash: tree.hash, minHash: thisHash,
          left: childBranch,
          middle: tree,
          right: null,
        }
        return result
        
      }
    }
    
  }
else{
  if (thisHash < tree.minHash) {
    if (tree.left==null) {
      if (tree.middle==null) {
        let childBranch: TernaryTreeMapTheLeaf<K, T>={
          kind: TernaryTreeKind.ternaryTreeLeaf, hash: thisHash, elements: [{k: key, v:item}]
        }
        let result: TernaryTreeMapTheBranch<K, T> = {
          kind: TernaryTreeKind.ternaryTreeBranch,
          maxHash: tree.maxHash, minHash: thisHash,
          left: null as any,
          middle: childBranch,
          right: tree.right,
        }
        return result
      }
      else {
        let item : TernaryTreeMapTheLeaf<K, T> = {
          kind: TernaryTreeKind.ternaryTreeLeaf, hash: thisHash, elements: [{k: key, v:item}]
        }
        let result: TernaryTreeMapTheBranch<K, T> = {
          kind: TernaryTreeKind.ternaryTreeBranch,
          maxHash: tree.maxHash, minHash: thisHash,
          left: item,
          middle: tree.middle,
          right: tree.right,
        }
        return result
      }

    }
    else if (tree.right==null) {
      let item: TernaryTreeMapTheLeaf<K, T> = {
        kind: TernaryTreeKind.ternaryTreeLeaf, hash: thisHash, elements: [{k: key, v:item}]
         }
      let result : TernaryTreeMapTheBranch<K, T> = {
        kind: TernaryTreeKind.ternaryTreeBranch,
        maxHash: tree.maxHash, minHash: thisHash,
        left: item,
        middle: tree.left,
        right: tree.middle,
      }
      return result
    }
    else {
      let childBranch: TernaryTreeMapTheLeaf<K, T> = {
        kind: TernaryTreeKind.ternaryTreeLeaf, hash: thisHash, elements: [{k: key, v:item}]
      }
      let result : TernaryTreeMapTheBranch<K, T> = {

        kind: TernaryTreeKind.ternaryTreeBranch,
        maxHash: tree.maxHash, minHash: thisHash,
        left: childBranch,
        middle: tree,
        right: null as any,
      }
      return result
    }
  }

  if (thisHash > tree.maxHash) {
    if (tree.right==null) {
      if (tree.middle==null) {
        let  childBranch: TernaryTreeMapTheLeaf<K, T> = {
          kind: TernaryTreeKind.ternaryTreeLeaf, hash: thisHash, elements: [{k: key, v:item}]
        }
        let result: TernaryTreeMapTheBranch<K, T> = {
          kind: TernaryTreeKind.ternaryTreeBranch,
          maxHash: thisHash, minHash: tree.minHash,
          left: tree.left,
          middle: childBranch,
          right: null as any,
          
        }
      }
      else {
        let childBranch: TernaryTreeMapTheLeaf<K, T> = {
          kind: TernaryTreeKind.ternaryTreeLeaf, hash: thisHash, elements: [{k: key, v:item}]
        }
        let result: TernaryTreeMapTheBranch<K, T> = {
          kind: TernaryTreeKind.ternaryTreeBranch,
          maxHash: thisHash, minHash: tree.minHash,
          left: tree.left,
          middle: tree.middle,
          right: childBranch,
        }
        return result
      }
    }
    else if (tree.left==null) {
      let childBranch: TernaryTreeMapTheLeaf<K, T> = {
        kind: TernaryTreeKind.ternaryTreeLeaf, hash: thisHash, elements: [{k: key, v:item}]
      }
      let result:TernaryTreeMapTheBranch<K, T> = {
        kind: TernaryTreeKind.ternaryTreeBranch,
        maxHash: thisHash, minHash: tree.minHash,
        left: tree.middle,
        middle: tree.right,
        right: childBranch,
         }
      
      return result
    }
    else {
      let childBranch: TernaryTreeMapTheLeaf<K, T> = {
        kind: TernaryTreeKind.ternaryTreeLeaf, hash: thisHash, elements: [{k: key, v:item}]
      }
      let result: TernaryTreeMapTheBranch<K, T> = {

        kind: TernaryTreeKind.ternaryTreeBranch,
        maxHash: thisHash, minHash: tree.minHash,
        left: null as any,
        middle: tree,
        right: childBranch,
      }
      
      return result

    }
  }

  if (rangeContainsHash(tree.left, thisHash)) {
    let result: TernaryTreeMapTheBranch<K, T> = {

      kind: TernaryTreeKind.ternaryTreeBranch,
      maxHash: tree.maxHash,
      minHash: tree.minHash,
      left: assocNew(tree.left, key, item),
      middle: tree.middle,
      right: tree.right
    }
     return result
  }
  if (rangeContainsHash(tree.middle, thisHash)) {
    let result : TernaryTreeMapTheBranch<K, T> = {
      kind: TernaryTreeKind.ternaryTreeBranch,
      maxHash: tree.maxHash,
      minHash: tree.minHash,
      left: tree.left,
      middle: assocNew(tree.middle, key, item),
      right: tree.right
    }
    

  }
  if (rangeContainsHash(tree.middle,thisHash)) {
    let result : TernaryTreeMapTheBranch<K, T> = {
      kind: TernaryTreeKind.ternaryTreeBranch,
      maxHash: tree.maxHash,
      minHash: tree.minHash,
      left: tree.left,
      middle: tree.middle,
      right: assocNew(tree.right, key, item)

    }
  }

  if (isSome(tree.middle)) {
    if (thisHash < getMin(tree.middle)) {
      let result: TernaryTreeMapTheBranch<K, T> = {
        kind: TernaryTreeKind.ternaryTreeBranch,
        maxHash: tree.maxHash,
        minHash: tree.minHash,
        left: assocNew(tree.left,key, item),
        middle: tree.middle,
        right: tree.right
      }
    }
    else {
      return TernaryTreeMap<K, T>(
        kind: TernaryTreeKind.ternaryTreeBranch,
        maxHash: tree.maxHash,
        minHash: tree.minHash,
        left: tree.left,
        middle: tree.middle,
        right: tree.right.assocNew(key, item)
      )
    }

  }

  // not outbound, not at any branch, and middle is empty, so put in middle
  let result: TernaryTreeMapTheBranch<K, T> = {
    kind: TernaryTreeKind.ternaryTreeBranch,
    maxHash: tree.maxHash,
    minHash: tree.minHash,
    left: tree.left,
    middle: assocNew(tree.middle, key, item),
    right: tree.right
  }
}
}

export function assoc<K, T>(tree: TernaryTreeMap<K, T>, key: K, item: T, disableBalancing: boolean = false): TernaryTreeMap<K, T> {

  if (tree==null || isEmpty(tree)) {

    return createLeaf(key, item)
  }

  if (contains(tree, key)) {
    return assocExisted(tree, key, item)
  }
  else {

    return assocNew(tree, key, item)
  }
}

proc dissocExisted<K, T>(tree: TernaryTreeMap<K, T>, key: K): TernaryTreeMap<K, T> =
  if (tree==null:
    throw new Error("Unexpected missing key in dissoc")

  if (tree.kind == ternaryTreeLeaf:
    if (tree.hash == key.hash:
      var newPairs: seq[TernaryTreeMapKeyValuePair<K, T>]
      for pair in tree.elements:
        if (pair.k != key:
          newPairs.add pair
      if (newPairs.len > 0:
        return TernaryTreeMap<K, T>(kind: ternaryTreeLeaf, hash: tree.hash, elements: newPairs)
      else:
        return nil

    else:
      throw new Error("Unexpected missing key in dissoc on leaf")

  if (tree.len == 1:
    if (not tree.contains(key):
      throw new Error("Unexpected missing key in dissoc single branch")
    return nil

  let thisHash = key.hash

  if (tree.left.rangeContainsHash(thisHash):
    let changedBranch = tree.left.dissocExisted(key)
    var minHash: int
    if (not changedBranch==null:
      minHash = changedBranch.getMin
    else if (not tree.middle==null:
      minHash = tree.middle.getMin
    else:
      minHash = tree.right.getMin

    return TernaryTreeMap<K, T>(
      kind: TernaryTreeKind.ternaryTreeBranch,
      maxHash: tree.maxHash,
      minHash: minHash,
      left: changedBranch,
      middle: tree.middle,
      right: tree.right
    )

  if (tree.middle.rangeContainsHash(thisHash):
    let changedBranch = tree.middle.dissocExisted(key)

    return TernaryTreeMap<K, T>(
      kind: TernaryTreeKind.ternaryTreeBranch,
      maxHash: tree.getMax,
      minHash: tree.minHash,
      left: tree.left,
      middle: changedBranch,
      right: tree.right
    )

  if (tree.right.rangeContainsHash(thisHash):
    let changedBranch = tree.right.dissocExisted(key)

    var maxHash: int
    if (not changedBranch==null:
      maxHash = changedBranch.getMax
    else if (not tree.middle==null:
      maxHash = tree.middle.getMax
    else:
      maxHash = tree.left.getMax

    return TernaryTreeMap<K, T>(
      kind: TernaryTreeKind.ternaryTreeBranch,
      maxHash: maxHash,
      minHash: tree.minHash,
      left: tree.left,
      middle: tree.middle,
      right: changedBranch
    )

  throw new Error("Cannot find branch in dissoc")


proc dissoc<K, T>(tree: TernaryTreeMap<K, T>, key: K): TernaryTreeMap<K, T> =
  if (tree.contains(key):
    tree.dissocExisted(key)
  else:
    tree

proc each<K, T>(tree: TernaryTreeMap<K, T>, f: proc(k: K, v: T): void): void =
  if (tree==null:
    return
  if (tree.kind == ternaryTreeLeaf:
    for pair in tree.elements:
      f(pair.k, pair.v)
  else:
    tree.left.each(f)
    tree.middle.each(f)
    tree.right.each(f)

proc toPairs<K, T>(tree: TernaryTreeMap<K, T>): seq[TernaryTreeMapKeyValuePair<K, T>] =
  if (tree==null:
    return @[]
  if (tree.kind == ternaryTreeLeaf:
    for pair in tree.elements:
      result.add pair
  else:
    for item in tree.left.toPairs:
      result.add item
    for item in tree.middle.toPairs:
      result.add item
    for item in tree.right.toPairs:
      result.add item

export function* pairs<K, T>(tree: TernaryTreeMap<K, T>): Generator<TernaryTreeMapKeyValuePair<K, T>> {
  let seqItems = toHashSortedSeq(tree)

  for (let x of seqItems) {
    yield {k: x.k, v: x.v}
  }
}

proc keys<K, T>(tree: TernaryTreeMap<K, T>): seq[K] =
  if (tree==null:
    return @[]
  if (tree.kind == ternaryTreeLeaf:
    for pair in tree.elements:
      result.add(pair.k)
  else:
    for item in tree.left.keys:
      result.add item
    for item in tree.middle.keys:
      result.add item
    for item in tree.right.keys:
      result.add item

iterator items<K, T>(tree: TernaryTreeMap<K, T>): K =
  let seqItems = tree.keys()

  for x in seqItems:
    yield x

function $<K,V>(p: TernaryTreeMapKeyValuePair<K, V>): string {

  return `${p.k}:${p.v}`
}

function identical<K,V>(xs: TernaryTreeMap<K, V>, ys: TernaryTreeMap<K, V>): boolean {
  return xs === ys
}

proc `==`*[K,V](xs: TernaryTreeMap[K, V], ys: TernaryTreeMap[K, V]): boolean =
  if (xs.len != ys.len:
    return false

  if (xs.isEmpty:
    return true

  if (xs.identical(ys):
    return true

  let keys = xs.keys
  for key in keys:

    if (xs.loopGet(key) != ys.loopGet(key):
      return false
  return true

proc merge<K, T>(xs: TernaryTreeMap<K, T>, ys: TernaryTreeMap<K, T>): TernaryTreeMap<K, T> =
  var ret = xs
  var counted = 0
  ys.each(proc(key: K, item: T): void =
    ret = ret.assoc(key, item)
    # TODO pickd loop by experience
    if (counted > 700:
      ret.forceInplaceBalancing()
      counted = 0
    else:
      counted = counted + 1
  )
  return ret

# skip a value, mostly for nil
proc mergeSkip<K, T>(xs: TernaryTreeMap<K, T>, ys: TernaryTreeMap<K, T>, skipped: T): TernaryTreeMap<K, T> =
  var ret = xs
  var counted = 0
  ys.each(proc(key: K, item: T): void =
    if (item == skipped:
      return
    ret = ret.assoc(key, item)
    # TODO pickd loop by experience
    if (counted > 700:
      ret.forceInplaceBalancing()
      counted = 0
    else:
      counted = counted + 1
  )
  return ret

// this function mutates original tree to make it more balanced
export function forceInplaceBalancing<K,T>(tree: TernaryTreeMap<K,T>): void {

  // echo "Force inplace balancing of list"
  var xs = toHashSortedSeqOfLeaves(tree)
  let newTree = initTernaryTreeMap(xs.len, 0, xs)
  tree.left = newTree.left
  tree.middle = newTree.middle
  tree.right = newTree.right
}

export function sameShape<K,T>(xs: TernaryTreeMap<K,T>, ys: TernaryTreeMap<K,T>): boolean {

  if (xs==null) {
    if (ys==null) {

      return true
    }
    else {

      return false
    }

  }
  if (ys==null)  {

    return false
  }

  if (xs.len != ys.len)  {

    return false
  }

  if (xs.kind != ys.kind)  {

    return false
  }

  if (xs.kind == ternaryTreeLeaf) {

    if (xs.elements != ys.elements) {

      return false
    }
    else {

      return true
    }
  }

  if (! xs.left.sameShape(ys.left))  {

    return false
  }

  if (! xs.middle.sameShape(ys.middle))  {

    return false
  }

  if (! xs.right.sameShape(ys.right))  {

    return false
  }

  return true
}
