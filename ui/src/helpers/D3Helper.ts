import * as d3 from 'd3'

export interface D3Node<T> extends d3.SimulationNodeDatum {
  d?: string
  kind: string
  radius: number
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
  width: number
}

export interface Point {
  x: number
  y: number
}

export const NODE_RADIUS = 40
export const SELECTED_NODE_RADIUS = 50
export const REL_NODE_RADIUS = 60

export class D3Helper {
  static wrapNode<T>(node: T): D3Node<T> {
    return {
      kind: 'node',
      node,
      radius: NODE_RADIUS,
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
      width: 8,
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
      const r = SELECTED_NODE_RADIUS
      return `
            M ${sourceX} ${sourceY}
            m -${r}, 0
            a ${r},${r} 0 1,0 ${2 * r},0
            a ${r},${r} 0 1,0 -${2 * r},0
            `
    }
    const r = REL_NODE_RADIUS
    return `
            M ${sourceX} ${sourceY}
            l ${targetX} ${targetY} 
            m -${r}, 0
            a ${r},${r} 0 1,0 ${2 * r},0
            a ${r},${r} 0 1,0 -${2 * r},0
            `
  }

  static isFlipped(rel: D3Relation<any>): boolean {
    return (
      ((rel.source as D3Node<any>).x ?? 0) >
      ((rel.target as D3Node<any>).x ?? 0)
    )
  }

  static buildRelationPath = (rel: D3Relation<any>): string => {
    let source: D3Node<any>
    let target: D3Node<any>
    const allRelCount = rel.relCount + rel.incomingRelationsCount - 1
    const nodeIndex = rel.relIndex
    let order = allRelCount / 2 - nodeIndex
    const flipped = D3Helper.isFlipped(rel)
    if (!flipped) {
      // eslint-disable-next-line prefer-const
      source = rel.source as D3Node<any>
      // eslint-disable-next-line prefer-const
      target = rel.target as D3Node<any>
    } else {
      source = rel.target as D3Node<any>
      target = rel.source as D3Node<any>
      order *= -1
    }
    let sourcePoint: Point
    let targetPoint: Point
    const selfRel = source.x === target.x && source.y === target.y
    if (selfRel) {
      order += 1
      sourcePoint = D3Helper.correctPositionSelf(
        {
          x: source.x ?? 0,
          y: source.y ?? 0,
        },
        source.radius + rel.width / 2,
        order,
        'right'
      )
      targetPoint = D3Helper.correctPositionSelf(
        {
          x: target.x ?? 0,
          y: target.y ?? 0,
        },
        target.radius + rel.width / 2,
        order,
        'left'
      )
    } else {
      sourcePoint = D3Helper.correctPosition(
        { x: source.x ?? 0, y: source.y ?? 0 },
        source.radius + rel.width / 2,
        { x: target.x ?? 0, y: target.y ?? 0 },
        order
      )
      targetPoint = D3Helper.correctPosition(
        { x: target.x ?? 0, y: target.y ?? 0 },
        target.radius + rel.width / 2,
        { x: source.x ?? 0, y: source.y ?? 0 },
        order * -1
      )
    }

    const space = 30

    let correct = 1
    if (targetPoint.y < sourcePoint.y) {
      correct = -1
    }

    let curveDistance = order * space
    if (targetPoint.y < sourcePoint.y) {
      curveDistance *= correct
    }

    const distanceX = sourcePoint.x - targetPoint.x
    const distanceY = sourcePoint.y - targetPoint.y
    let angle = Math.PI / 4

    let spacerX = space * order * 3
    let spacerY = 0
    let curveCenterX = 0
    let curveCenterY = -(curveDistance + space)

    const distance =
      D3Helper.pointDistance(
        { x: sourcePoint.x, y: sourcePoint.y },
        { x: targetPoint.x, y: targetPoint.y }
      ) / 3
    let targetCorrection: Point = targetPoint
    let sourceCorrection: Point = sourcePoint
    if (!selfRel) {
      angle = Math.atan(distanceX / distanceY)
      spacerX = Math.sin(angle) * (distance / 3) * correct
      spacerY = Math.cos(angle) * (distance / 3) * correct
      curveCenterX = Math.sin(angle + Math.PI / 2) * curveDistance
      curveCenterY = Math.cos(angle + Math.PI / 2) * curveDistance
      if (!flipped) {
        targetCorrection = D3Helper.correctPosition(
          targetPoint,
          rel.width * 1.5,
          {
            x: (sourcePoint.x + targetPoint.x) / 2 + curveCenterX,
            y: (sourcePoint.y + targetPoint.y) / 2 + curveCenterY,
          },
          0
        )
      } else {
        sourceCorrection = D3Helper.correctPosition(
          sourcePoint,
          rel.width * 1.5,
          {
            x: (sourcePoint.x + targetPoint.x) / 2 + curveCenterX,
            y: (sourcePoint.y + targetPoint.y) / 2 + curveCenterY,
          },
          0
        )
      }
    } else if (!flipped) {
      targetCorrection = D3Helper.correctPosition(
        targetPoint,
        rel.width * 1.5,
        {
          x: (sourcePoint.x + targetPoint.x) / 2 + curveCenterX + spacerX,
          y: (sourcePoint.y + targetPoint.y) / 2 + curveCenterY + spacerY,
        },
        0
      )
    } else {
      sourceCorrection = D3Helper.correctPosition(
        targetPoint,
        rel.width * 1.5,
        {
          x: (sourcePoint.x + targetPoint.x) / 2 + curveCenterX - spacerX,
          y: (sourcePoint.y + targetPoint.y) / 2 + curveCenterY - spacerY,
        },
        0
      )
    }
    return `
      M ${sourceCorrection.x} ${sourceCorrection.y}
      Q
      ${(sourcePoint.x + targetPoint.x) / 2 + curveCenterX - spacerX}
      ${(sourcePoint.y + targetPoint.y) / 2 + curveCenterY - spacerY}
      ${(sourcePoint.x + targetPoint.x) / 2 + curveCenterX}
      ${(sourcePoint.y + targetPoint.y) / 2 + curveCenterY}
      ${(sourcePoint.x + targetPoint.x) / 2 + curveCenterX + spacerX}
      ${(sourcePoint.y + targetPoint.y) / 2 + curveCenterY + spacerY}
      ${targetCorrection.x} ${targetCorrection.y}
    `
  }

  static correctPosition(
    source: Point,
    distance: number,
    direction: Point,
    order: number
  ): Point {
    const angle =
      Math.atan((source.x - direction.x) / (source.y - direction.y)) +
      order * (Math.PI / 12)
    if (source.y > direction.y) {
      return {
        x: source.x - Math.sin(angle) * distance,
        y: source.y - Math.cos(angle) * distance,
      }
    }
    return {
      x: source.x + Math.sin(angle) * distance,
      y: source.y + Math.cos(angle) * distance,
    }
  }

  static correctPositionSelf(
    source: Point,
    distance: number,
    order: number,
    direction: 'left' | 'right'
  ): Point {
    let angle = order * (Math.PI / 12)
    if (direction === 'left') {
      angle *= -1
    }
    return {
      x: source.x - Math.sin(angle) * distance,
      y: source.y - Math.cos(angle) * distance,
    }
  }
}
