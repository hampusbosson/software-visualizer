import type { EdgeLayout } from '../three/edges/createEdgeCurve'
import type { SemanticZoomLevel } from '../three/semanticZoom'
import { RelationshipEdge } from './RelationshipEdge'

type RelationshipEdgesProps = {
  edgeLayouts: EdgeLayout[]
  hoveredNodeId: string | null
  selectedNodeId: string | null
  zoomLevel: SemanticZoomLevel
}

export function RelationshipEdges({
  edgeLayouts,
  hoveredNodeId,
  selectedNodeId,
  zoomLevel,
}: RelationshipEdgesProps) {
  return (
    <>
      {edgeLayouts.map((edgeLayout, index) => (
        <RelationshipEdge
          key={edgeLayout.id}
          edgeLayout={edgeLayout}
          hoveredNodeId={hoveredNodeId}
          index={index}
          selectedNodeId={selectedNodeId}
          zoomLevel={zoomLevel}
        />
      ))}
    </>
  )
}
