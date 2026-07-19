import { Html } from '@react-three/drei'
import { ThreeEvent } from '@react-three/fiber'

import type { GraphNode } from '../../../types/graph'
import { getNodeStyle } from '../three/nodeStyles'
import type { BuildingLayout } from '../three/sceneLayout'
import type { SemanticZoomLevel } from '../three/semanticZoom'

type ClassBuildingProps = {
  building: BuildingLayout
  hasRelationshipFocus: boolean
  hoveredNodeId: string | null
  labelsVisibleInSelection: boolean
  relatedNodeIds: Set<string>
  selectedEdgeActive: boolean
  selectedNodeId: string | null
  zoomLevel: SemanticZoomLevel
  onHover: (node: GraphNode | null) => void
  onSelect: (node: GraphNode) => void
}

export function ClassBuilding({
  building,
  hasRelationshipFocus,
  hoveredNodeId,
  labelsVisibleInSelection,
  relatedNodeIds,
  selectedEdgeActive,
  selectedNodeId,
  zoomLevel,
  onHover,
  onSelect,
}: ClassBuildingProps) {
  const style = getNodeStyle(building.node)
  const isHovered = hoveredNodeId === building.node.id
  const isSelected = selectedNodeId === building.node.id
  const isRelated = relatedNodeIds.has(building.node.id)
  const hasSelection = selectedNodeId !== null
  const opacity =
    hasSelection || selectedEdgeActive
      ? isSelected || isRelated
        ? 1
        : 0.26
      : hasRelationshipFocus
        ? isHovered || isRelated
          ? 1
          : 0.48
        : 1
  const showClassName =
    !isSelected &&
    ((hasSelection && labelsVisibleInSelection) ||
      (zoomLevel !== 'far' && (!hasSelection || isHovered || (selectedEdgeActive && isRelated))))

  const showTypeLabel =
    (hasSelection && labelsVisibleInSelection && !isSelected) || zoomLevel === 'near'

  function handlePointerOver(event: ThreeEvent<PointerEvent>) {
    event.stopPropagation()
    document.body.style.cursor = 'pointer'
    onHover(building.node)
  }

  function handlePointerOut(event: ThreeEvent<PointerEvent>) {
    event.stopPropagation()
    document.body.style.cursor = ''
    onHover(null)
  }

  function handleClick(event: ThreeEvent<MouseEvent>) {
    event.stopPropagation()
    onSelect(building.node)
  }

  return (
    <group position={building.position}>
      <mesh
        onClick={handleClick}
        onPointerOut={handlePointerOut}
        onPointerOver={handlePointerOver}
      >
        <boxGeometry args={building.size} />
        <meshStandardMaterial
          color={isHovered || isSelected ? style.accentColor : style.baseColor}
          emissive={style.accentColor}
          emissiveIntensity={isHovered || isSelected || isRelated ? 0.34 : 0.16}
          metalness={0.18}
          opacity={opacity}
          roughness={0.48}
          transparent
        />
      </mesh>

      <mesh position={[0, building.size[1] / 2 + 0.02, 0]}>
        <boxGeometry args={[building.size[0] + 0.08, 0.06, building.size[2] + 0.08]} />
        <meshBasicMaterial color={style.accentColor} transparent opacity={opacity} />
      </mesh>

      {showClassName ? (
        <Html center distanceFactor={10} position={[0, building.size[1] / 2 + 0.35, 0]}>
          <div className="pointer-events-none max-w-36 rounded-md border border-white/10 bg-[#020617]/75 px-2 py-1 text-center text-[11px] font-medium text-slate-100 shadow-lg shadow-black/20 backdrop-blur">
            <span className="block truncate">{building.node.label}</span>
            {showTypeLabel ? (
              <span className="mt-0.5 block text-[10px] text-slate-400">{style.label}</span>
            ) : null}
          </div>
        </Html>
      ) : null}
    </group>
  )
}
