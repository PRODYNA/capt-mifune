import {D3Node, D3Relation} from "./Graph";

export class D3Helper {

  static  pointDistance = (p1: { x: number, y: number }, p2: { x: number, y: number }): number => {
    let a = Math.pow((p1.x - p2.x), 2.)
    let b = Math.pow((p1.y - p2.y), 2.)
    return Math.sqrt(a + b);
  }

  static  selectionPath = (sourceX: number, sourceY: number, targetX: number, targetY: number) => {

    if (sourceX === targetX && sourceY === targetY) {
      const r = 40
      return `
            M ${sourceX} ${sourceY}
            m -${r}, 0
            a ${r},${r} 0 1,0 ${2 * r},0
            a ${r},${r} 0 1,0 -${2 * r},0
            `;
    } else {
      const r = 50
      return `
            M ${sourceX} ${sourceY}
            l ${targetX} ${targetY} 
            m -${r}, 0
            a ${r},${r} 0 1,0 ${2 * r},0
            a ${r},${r} 0 1,0 -${2 * r},0
            `;
    }
  }

  static buildRelationPath = (rel: D3Relation) =>{
    var source:D3Node;
    var target:D3Node;
    let allRelCount = rel.relCount + rel.incomingRelationsCount - 1;
    let nodeIndex =  (rel.relIndex);
    let order = (allRelCount / 2) - nodeIndex
    if(((rel.source  as D3Node).x??0.) <( (rel.target as D3Node).x??0.)){
       source = rel.source as D3Node;
       target = rel.target as D3Node;
    }else{
      source = rel.target as D3Node;
      target = rel.source as D3Node;
      order= order*-1;
    }
    let sx = source.x ?? 0.
    let sy = source.y ?? 0.
    let tx = target.x ?? 0.
    let ty = target.y ?? 0.

    const space = 50

    let correct = 1;
    if (ty < sy) {
      correct = -1
    }

    let curveDistance = (order * space)
    if (ty < sy) {
      curveDistance *= correct
    }

    let distanceX = (sx - tx)
    let distanceY = (sy - ty)
    let angle = Math.PI / 4

    let spacerX = space * ((order) + 3)
    let spacerY = 0
    let curveCenterX = 0
    let curveCenterY = -(curveDistance + space)

    const distance = (D3Helper.pointDistance({x: sx, y: sy}, {x: tx, y: ty}) / 3)
    if (Math.abs(distanceX) > 1 || Math.abs(distanceY) > 1) {
      angle = Math.atan(distanceX / distanceY)
      spacerX = Math.sin(angle) * (distance / 3) * correct
      spacerY = Math.cos(angle) * (distance / 3) * correct
      curveCenterX = Math.sin(angle + (Math.PI / 2)) * curveDistance
      curveCenterY = Math.cos(angle + (Math.PI / 2)) * curveDistance
    }
    return `
                     M ${sx} ${sy} 
                     Q
                     ${((sx + tx) / 2) + (curveCenterX) - (spacerX)} 
                     ${((sy + ty) / 2) + (curveCenterY) - (spacerY)}                                   
                     ${((sx + tx) / 2) + (curveCenterX)} 
                     ${((sy + ty) / 2) + (curveCenterY)}
                     ${((sx + tx) / 2) + (curveCenterX) + (spacerX)} 
                     ${((sy + ty) / 2) + (curveCenterY) + (spacerY)}                                                   
                     ${tx} ${ty}  
                  `
  }

}
