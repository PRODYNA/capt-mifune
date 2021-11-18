import * as d3 from 'd3'

export interface D3Node<T> extends d3.SimulationNodeDatum {
  d?: string
  kind: string
  node: T
}

export interface D3Relation<T> extends d3.SimulationLinkDatum<D3Node<any>> {
  kind: string
  relation: T
  color?: string
  relCount: number
  relIndex: number
  incomingRelationsCount: number
  firstRender?: boolean
}

export class D3Helper {
  static wrapNode<T>(node: T): D3Node<T> {
    return {
      kind: 'node',
      node,
    }
  }

  static wrapRelation<T extends { sourceId: string; targetId: string }>(
    rel: T
  ): D3Relation<T> {
    return {
      kind: 'relation',
      relation: rel,
      source: rel.sourceId,
      target: rel.targetId,
      relCount: 1,
      incomingRelationsCount: 0,
      relIndex: 0,
    }
  }

  static pointDistance = (
    p1: { x: number; y: number },
    p2: { x: number; y: number }
  ): number => {
    const a = (p1.x - p2.x) ** 2
    const b = (p1.y - p2.y) ** 2
    return Math.sqrt(a + b)
  }

  static selectionPath = (
    sourceX: number,
    sourceY: number,
    targetX: number,
    targetY: number
  ): string => {
    if (sourceX === targetX && sourceY === targetY) {
      const r = 40
      return `
            M ${sourceX} ${sourceY}
            m -${r}, 0
            a ${r},${r} 0 1,0 ${2 * r},0
            a ${r},${r} 0 1,0 -${2 * r},0
            `
    }
    const r = 50
    return `
            M ${sourceX} ${sourceY}
            l ${targetX} ${targetY} 
            m -${r}, 0
            a ${r},${r} 0 1,0 ${2 * r},0
            a ${r},${r} 0 1,0 -${2 * r},0
            `
  }

  static buildRelationPath = (rel: D3Relation<any>): string => {
    let source: D3Node<any>
    let target: D3Node<any>
    const allRelCount = rel.relCount + rel.incomingRelationsCount - 1
    const nodeIndex = rel.relIndex
    let order = allRelCount / 2 - nodeIndex
    if (
      ((rel.source as D3Node<any>).x ?? 0) <=
      ((rel.target as D3Node<any>).x ?? 0)
    ) {
      source = rel.source as D3Node<any>
      target = rel.target as D3Node<any>
    } else {
      source = rel.target as D3Node<any>
      target = rel.source as D3Node<any>
      order *= -1
    }
    const sx = source.x ?? 0
    const sy = source.y ?? 0
    const tx = target.x ?? 0
    const ty = target.y ?? 0

    const space = 50

    let correct = 1
    if (ty < sy) {
      correct = -1
    }

    let curveDistance = order * space
    if (ty < sy) {
      curveDistance *= correct
    }

    const distanceX = sx - tx
    const distanceY = sy - ty
    let angle = Math.PI / 4

    let spacerX = space * (order + 3)
    let spacerY = 0
    let curveCenterX = 0
    let curveCenterY = -(curveDistance + space)

    const distance =
      D3Helper.pointDistance({ x: sx, y: sy }, { x: tx, y: ty }) / 3
    if (Math.abs(distanceX) > 1 || Math.abs(distanceY) > 1) {
      angle = Math.atan(distanceX / distanceY)
      spacerX = Math.sin(angle) * (distance / 3) * correct
      spacerY = Math.cos(angle) * (distance / 3) * correct
      curveCenterX = Math.sin(angle + Math.PI / 2) * curveDistance
      curveCenterY = Math.cos(angle + Math.PI / 2) * curveDistance
    }
    return `
      M ${sx} ${sy}
      Q
      ${(sx + tx) / 2 + curveCenterX - spacerX}
      ${(sy + ty) / 2 + curveCenterY - spacerY}
      ${(sx + tx) / 2 + curveCenterX}
      ${(sy + ty) / 2 + curveCenterY}
      ${(sx + tx) / 2 + curveCenterX + spacerX}
      ${(sy + ty) / 2 + curveCenterY + spacerY}
      ${tx} ${ty}
    `
  }
}
