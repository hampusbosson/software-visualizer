import { OrbitControls } from '@react-three/drei'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef, useState } from 'react'
import { PerspectiveCamera, Vector3 } from 'three'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'

import type { GraphNode, GraphResponse } from '../../../types/graph'
import { fitCameraToBounds, moveCameraTowardSelection } from '../three/cameraUtils'
import { createProjectLayout } from '../three/sceneLayout'
import type { ProjectLayout } from '../three/sceneLayout'
import { getSemanticZoomLevel } from '../three/semanticZoom'
import type { SemanticZoomLevel } from '../three/semanticZoom'
import { NodeDetailsPanel } from './NodeDetailsPanel'
import { PackageDistrict } from './PackageDistrict'

type ProjectSceneProps = {
  graphResponse: GraphResponse
  onClearSelection: () => void
  onSelectNode: (node: GraphNode) => void
  selectedNode: GraphNode | null
}

export function ProjectScene({
  graphResponse,
  onClearSelection,
  onSelectNode,
  selectedNode,
}: ProjectSceneProps) {
  const layout = useMemo(() => createProjectLayout(graphResponse.nodes), [graphResponse.nodes])
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null)
  const selectedBuilding = useMemo(
    () => findBuildingByNodeId(layout, selectedNode?.id ?? null),
    [layout, selectedNode],
  )

  function clearSelection() {
    document.body.style.cursor = ''
    setHoveredNode(null)
    onClearSelection()
  }

  return (
    <div className="relative h-full w-full">
      <Canvas
        camera={{ position: [6, 5, 6], fov: 45 }}
        onPointerMissed={clearSelection}
        shadows
      >
        <SceneContent
          hoveredNodeId={hoveredNode?.id ?? null}
          layout={layout}
          selectedBuilding={selectedBuilding}
          setHoveredNode={setHoveredNode}
          setSelectedNode={onSelectNode}
        />
      </Canvas>

      <NodeDetailsPanel node={selectedNode} onClose={clearSelection} />
    </div>
  )
}

type SceneContentProps = {
  hoveredNodeId: string | null
  layout: ProjectLayout
  selectedBuilding: ReturnType<typeof findBuildingByNodeId>
  setHoveredNode: (node: GraphNode | null) => void
  setSelectedNode: (node: GraphNode) => void
}

function SceneContent({
  hoveredNodeId,
  layout,
  selectedBuilding,
  setHoveredNode,
  setSelectedNode,
}: SceneContentProps) {
  const controlsRef = useRef<OrbitControlsImpl | null>(null)
  const zoomLevelRef = useRef<SemanticZoomLevel>('far')
  const [zoomLevel, setZoomLevel] = useState<SemanticZoomLevel>('far')
  const { camera } = useThree()

  useEffect(() => {
    if (camera instanceof PerspectiveCamera && controlsRef.current) {
      fitCameraToBounds(camera, controlsRef.current, layout.bounds)
    }
  }, [camera, layout.bounds])

  useFrame(() => {
    if (!controlsRef.current || !(camera instanceof PerspectiveCamera)) {
      return
    }

    if (selectedBuilding) {
      moveCameraTowardSelection(
        camera,
        controlsRef.current,
        new Vector3(
          selectedBuilding.position[0],
          selectedBuilding.position[1],
          selectedBuilding.position[2],
        ),
      )
    } else {
      controlsRef.current.target.lerp(layout.center, 0.04)
    }

    controlsRef.current.update()

    const distance = camera.position.distanceTo(controlsRef.current.target)
    const nextZoomLevel = getSemanticZoomLevel(distance)

    if (nextZoomLevel !== zoomLevelRef.current) {
      zoomLevelRef.current = nextZoomLevel
      setZoomLevel(nextZoomLevel)
    }
  })

  return (
    <>
      <color attach="background" args={['#080b12']} />
      <fog attach="fog" args={['#080b12', 24, 90]} />

      <ambientLight intensity={0.85} />
      <directionalLight
        castShadow
        color="#e0f2fe"
        intensity={2.4}
        position={[10, 14, 8]}
        shadow-mapSize-height={1024}
        shadow-mapSize-width={1024}
      />

      <group position={[0, 0, 0]}>
        <gridHelper args={[120, 120, '#1e293b', '#0f172a']} position={[0, -0.08, 0]} />

        {layout.districts.map((district) => (
          <PackageDistrict
            key={district.id}
            district={district}
            hoveredNodeId={hoveredNodeId}
            selectedNodeId={selectedBuilding?.node.id ?? null}
            zoomLevel={zoomLevel}
            onHover={setHoveredNode}
            onSelect={setSelectedNode}
          />
        ))}
      </group>

      <OrbitControls
        ref={controlsRef}
        enableDamping
        enablePan
        enableRotate
        enableZoom
        maxDistance={46}
        maxPolarAngle={Math.PI * 0.46}
        minDistance={5}
        minPolarAngle={Math.PI * 0.18}
        target={[layout.center.x, layout.center.y, layout.center.z]}
      />
    </>
  )
}

function findBuildingByNodeId(layout: ProjectLayout, nodeId: string | null) {
  if (!nodeId) {
    return null
  }

  for (const district of layout.districts) {
    const building = district.buildings.find((districtBuilding) => districtBuilding.node.id === nodeId)

    if (building) {
      return building
    }
  }

  return null
}
