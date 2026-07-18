import { Html } from '@react-three/drei'

import type { GraphNode } from '../../../types/graph'
import type { DistrictLayout } from '../three/sceneLayout'
import type { SemanticZoomLevel } from '../three/semanticZoom'
import { ClassBuilding } from './ClassBuilding'

type PackageDistrictProps = {
  district: DistrictLayout
  hoveredNodeId: string | null
  selectedNodeId: string | null
  zoomLevel: SemanticZoomLevel
  onHover: (node: GraphNode | null) => void
  onSelect: (node: GraphNode) => void
}

export function PackageDistrict({
  district,
  hoveredNodeId,
  selectedNodeId,
  zoomLevel,
  onHover,
  onSelect,
}: PackageDistrictProps) {
  const showPackageLabel = zoomLevel !== 'near'

  return (
    <group>
      <mesh receiveShadow position={[district.center[0], -0.035, district.center[2]]}>
        <boxGeometry args={[district.width, 0.06, district.depth]} />
        <meshStandardMaterial color="#0b1220" roughness={0.8} />
      </mesh>

      <mesh position={[district.center[0], 0.01, district.center[2]]}>
        <boxGeometry args={[district.width + 0.05, 0.035, district.depth + 0.05]} />
        <meshBasicMaterial color="#1e293b" transparent opacity={0.22} wireframe />
      </mesh>

      {showPackageLabel ? (
        <Html
          center
          distanceFactor={14}
          position={[
            district.center[0],
            0.12,
            district.center[2] - district.depth / 2 - 0.45,
          ]}
        >
          <div className="pointer-events-none max-w-72 truncate rounded-md border border-white/10 bg-[#020617]/80 px-3 py-1.5 text-xs font-semibold text-cyan-100 shadow-lg shadow-black/20 backdrop-blur">
            {district.packageName}
          </div>
        </Html>
      ) : null}

      {district.buildings.map((building) => (
        <ClassBuilding
          key={building.id}
          building={building}
          hoveredNodeId={hoveredNodeId}
          selectedNodeId={selectedNodeId}
          zoomLevel={zoomLevel}
          onHover={onHover}
          onSelect={onSelect}
        />
      ))}
    </group>
  )
}
