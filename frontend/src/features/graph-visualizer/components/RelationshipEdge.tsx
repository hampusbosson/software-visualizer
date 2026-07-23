import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import type { Mesh } from 'three'

import type { EdgeLayout } from '../three/edges/createEdgeCurve'
import { EDGE_COLORS, EDGE_OPACITY, EDGE_RADIUS } from '../three/edges/edgeStyles'
import type { SemanticZoomLevel } from '../three/semanticZoom'

type RelationshipEdgeProps = {
  edgeLayout: EdgeLayout
  hoveredNodeId: string | null
  index: number
  selectedNodeId: string | null
  zoomLevel: SemanticZoomLevel
}

export function RelationshipEdge({
  edgeLayout,
  hoveredNodeId,
  index,
  selectedNodeId,
  zoomLevel,
}: RelationshipEdgeProps) {
  const flowRef = useRef<Mesh>(null)
  const visualState = getEdgeVisualState(edgeLayout, selectedNodeId, hoveredNodeId, zoomLevel)

  useFrame(({ clock }) => {
    if (!flowRef.current || !visualState.showFlow) {
      return
    }

    const progress = (clock.elapsedTime * 0.28 + index * 0.23) % 1
    flowRef.current.position.copy(edgeLayout.curve.getPointAt(1 - progress))
  })

  if (!visualState.isVisible) {
    return null
  }

  return (
    <group>
      <mesh>
        <tubeGeometry
          args={[
            edgeLayout.curve,
            32,
            visualState.radius * EDGE_RADIUS.glowMultiplier,
            8,
            false,
          ]}
        />
        <meshBasicMaterial
          color={EDGE_COLORS.glow}
          depthWrite={false}
          opacity={visualState.glowOpacity}
          transparent
        />
      </mesh>

      <mesh>
        <tubeGeometry args={[edgeLayout.curve, 32, visualState.radius, 8, false]} />
        <meshBasicMaterial
          color={EDGE_COLORS.core}
          depthWrite={false}
          opacity={visualState.opacity}
          transparent
        />
      </mesh>

      {visualState.showFlow ? (
        <mesh ref={flowRef}>
          <sphereGeometry args={[0.09, 10, 10]} />
          <meshBasicMaterial color={EDGE_COLORS.pulse} />
        </mesh>
      ) : null}
    </group>
  )
}

function getEdgeVisualState(
  edgeLayout: EdgeLayout,
  selectedNodeId: string | null,
  hoveredNodeId: string | null,
  zoomLevel: SemanticZoomLevel,
) {
  const focusNodeId = selectedNodeId ?? hoveredNodeId
  const isOutgoing = focusNodeId ? edgeLayout.edge.source === focusNodeId : false
  const isIncoming = focusNodeId ? edgeLayout.edge.target === focusNodeId : false
  const isConnected = isIncoming || isOutgoing
  const hasFocus = focusNodeId !== null

  if (hasFocus && !isConnected) {
    return {
      glowOpacity: EDGE_OPACITY.glowDimmed,
      isVisible: true,
      opacity: EDGE_OPACITY.dimmed,
      radius: EDGE_RADIUS.default,
      showFlow: false,
    }
  }

  if (isConnected) {
    return {
      glowOpacity: EDGE_OPACITY.glowConnected,
      isVisible: true,
      opacity: EDGE_OPACITY.connected,
      radius: EDGE_RADIUS.active,
      showFlow: selectedNodeId !== null && zoomLevel !== 'far',
    }
  }

  return {
    glowOpacity: EDGE_OPACITY.glowDefault,
    isVisible: true,
    opacity: zoomLevel === 'far' ? EDGE_OPACITY.far : EDGE_OPACITY.default,
    radius: EDGE_RADIUS.default,
    showFlow: false,
  }
}
