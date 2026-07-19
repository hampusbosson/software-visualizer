import { MathUtils, QuadraticBezierCurve3, Vector3 } from 'three'

import type { GraphEdge, GraphNode } from '../../../../types/graph'
import type { BuildingLayout } from '../sceneLayout'

export type EdgeLayout = {
  id: string
  edge: GraphEdge
  curve: QuadraticBezierCurve3
  sourceBuilding: BuildingLayout
  sourceNode: GraphNode
  targetBuilding: BuildingLayout
  targetNode: GraphNode
}

export function createEdgeLayouts(
  edges: GraphEdge[],
  buildingsByNodeId: Map<string, BuildingLayout>,
): EdgeLayout[] {
  return edges.flatMap((edge, index) => {
    const sourceBuilding = buildingsByNodeId.get(edge.source)
    const targetBuilding = buildingsByNodeId.get(edge.target)

    if (!sourceBuilding || !targetBuilding) {
      return []
    }

    return [
      {
        id: `${edge.source}->${edge.target}:${edge.type ?? 'RELATION'}:${index}`,
        edge,
        curve: createEdgeCurve(sourceBuilding, targetBuilding),
        sourceBuilding,
        sourceNode: sourceBuilding.node,
        targetBuilding,
        targetNode: targetBuilding.node,
      },
    ]
  })
}

function createEdgeCurve(sourceBuilding: BuildingLayout, targetBuilding: BuildingLayout) {
  const start = getConnectionPoint(sourceBuilding, targetBuilding)
  const end = getConnectionPoint(targetBuilding, sourceBuilding)
  const midpoint = start.clone().add(end).multiplyScalar(0.5)
  const samePackage = sourceBuilding.node.packageName === targetBuilding.node.packageName
  const arcMultiplier = samePackage ? 0.12 : 0.22
  const arcHeight = MathUtils.clamp(start.distanceTo(end) * arcMultiplier, 1.2, 10)
  const controlPoint = midpoint.clone()
  controlPoint.y += arcHeight

  return new QuadraticBezierCurve3(start, controlPoint, end)
}

function getConnectionPoint(from: BuildingLayout, to: BuildingLayout) {
  const fromPosition = new Vector3(...from.position)
  const toPosition = new Vector3(...to.position)
  const direction = toPosition.clone().sub(fromPosition).setY(0).normalize()

  if (direction.lengthSq() === 0) {
    direction.set(1, 0, 0)
  }

  const edgeOffset = Math.max(from.size[0], from.size[2]) / 2 + 0.08

  return fromPosition
    .clone()
    .add(direction.multiplyScalar(edgeOffset))
    .setY(from.position[1] + from.size[1] / 2 + 0.2)
}
