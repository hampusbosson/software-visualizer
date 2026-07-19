import { OrbitControls } from '@react-three/drei'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef, useState } from 'react'
import { PerspectiveCamera, Vector3 } from 'three'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'

import type { GraphNode, GraphResponse } from '../../../types/graph'
import {
  fitCameraToBounds,
  moveCameraTowardDistrict,
} from '../three/cameraUtils'
import { createBuildingsByNodeId, createProjectLayout } from '../three/sceneLayout'
import type { ProjectLayout } from '../three/sceneLayout'
import { createEdgeLayouts } from '../three/edges/createEdgeCurve'
import type { EdgeLayout } from '../three/edges/createEdgeCurve'
import { createPackageRelationLayouts } from '../three/packageRelations'
import { getSemanticZoomLevel } from '../three/semanticZoom'
import type { SemanticZoomLevel } from '../three/semanticZoom'
import { NodeDetailsPanel } from './NodeDetailsPanel'
import { PackageDistrict } from './PackageDistrict'
import { PackageRelationCables } from './PackageRelationCables'
import { RelationshipEdges } from './RelationshipEdges'

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
  const buildingsByNodeId = useMemo(() => createBuildingsByNodeId(layout), [layout])
  const edgeLayouts = useMemo(
    () => createEdgeLayouts(graphResponse.edges, buildingsByNodeId),
    [buildingsByNodeId, graphResponse.edges],
  )
  const packageRelationLayouts = useMemo(
    () => createPackageRelationLayouts(layout.districts),
    [layout.districts],
  )
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null)
  const selectedBuilding = useMemo(
    () => findBuildingByNodeId(layout, selectedNode?.id ?? null),
    [layout, selectedNode],
  )
  const selectedDistrict = useMemo(
    () => findDistrictByNodeId(layout, selectedNode?.id ?? null),
    [layout, selectedNode],
  )
  const relatedNodeIds = useMemo(
    () => getRelatedNodeIds(edgeLayouts, selectedNode?.id ?? null, hoveredNode?.id ?? null),
    [edgeLayouts, hoveredNode, selectedNode],
  )

  function clearSelection() {
    document.body.style.cursor = ''
    setHoveredNode(null)
    onClearSelection()
  }

  function handleSelectNode(node: GraphNode) {
    onSelectNode(node)
  }

  return (
    <div className="relative h-full w-full">
      <Canvas
        camera={{ position: [6, 5, 6], fov: 45 }}
        onPointerMissed={clearSelection}
      >
        <SceneContent
          hoveredNodeId={hoveredNode?.id ?? null}
          edgeLayouts={edgeLayouts}
          layout={layout}
          packageRelationLayouts={packageRelationLayouts}
          relatedNodeIds={relatedNodeIds}
          selectedBuilding={selectedBuilding}
          selectedDistrict={selectedDistrict}
          setHoveredNode={setHoveredNode}
          setSelectedNode={handleSelectNode}
        />
      </Canvas>

      <NodeDetailsPanel node={selectedNode} onClose={clearSelection} />
    </div>
  )
}

type SceneContentProps = {
  edgeLayouts: EdgeLayout[]
  hoveredNodeId: string | null
  layout: ProjectLayout
  packageRelationLayouts: ReturnType<typeof createPackageRelationLayouts>
  relatedNodeIds: Set<string>
  selectedBuilding: ReturnType<typeof findBuildingByNodeId>
  selectedDistrict: ReturnType<typeof findDistrictByNodeId>
  setHoveredNode: (node: GraphNode | null) => void
  setSelectedNode: (node: GraphNode) => void
}

function SceneContent({
  edgeLayouts,
  hoveredNodeId,
  layout,
  packageRelationLayouts,
  relatedNodeIds,
  selectedBuilding,
  selectedDistrict,
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

    if (selectedDistrict) {
      moveCameraTowardDistrict(
        camera,
        controlsRef.current,
        new Vector3(selectedDistrict.center[0], 0, selectedDistrict.center[2]),
        Math.max(selectedDistrict.width, selectedDistrict.depth),
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

      <ambientLight intensity={1.25} />
      <hemisphereLight args={['#dbeafe', '#0f172a', 1.1]} />
      <directionalLight
        color="#e0f2fe"
        intensity={1.6}
        position={[10, 14, 8]}
      />

      <group position={[0, 0, 0]}>
        <gridHelper args={[120, 120, '#1e293b', '#0f172a']} position={[0, -0.08, 0]} />

        <PackageRelationCables relations={packageRelationLayouts} />

        <RelationshipEdges
          edgeLayouts={edgeLayouts}
          hoveredNodeId={hoveredNodeId}
          selectedNodeId={selectedBuilding?.node.id ?? null}
          zoomLevel={zoomLevel}
        />

        {layout.districts.map((district) => (
          <PackageDistrict
            key={district.id}
            district={district}
            hasRelationshipFocus={hoveredNodeId !== null}
            hoveredNodeId={hoveredNodeId}
            relatedNodeIds={relatedNodeIds}
            selectedEdgeActive={false}
            selectedDistrictId={selectedDistrict?.id ?? null}
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

function findDistrictByNodeId(layout: ProjectLayout, nodeId: string | null) {
  if (!nodeId) {
    return null
  }

  return (
    layout.districts.find((district) =>
      district.buildings.some((building) => building.node.id === nodeId),
    ) ?? null
  )
}

function getRelatedNodeIds(
  edgeLayouts: EdgeLayout[],
  selectedNodeId: string | null,
  hoveredNodeId: string | null,
) {
  if (selectedNodeId) {
    return getConnectedNodeIds(edgeLayouts, selectedNodeId)
  }

  if (hoveredNodeId) {
    return getConnectedNodeIds(edgeLayouts, hoveredNodeId)
  }

  return new Set<string>()
}

function getConnectedNodeIds(edgeLayouts: EdgeLayout[], nodeId: string) {
  const connectedNodeIds = new Set<string>([nodeId])

  edgeLayouts.forEach((edgeLayout) => {
    if (edgeLayout.edge.source === nodeId) {
      connectedNodeIds.add(edgeLayout.edge.target)
    }

    if (edgeLayout.edge.target === nodeId) {
      connectedNodeIds.add(edgeLayout.edge.source)
    }
  })

  return connectedNodeIds
}
