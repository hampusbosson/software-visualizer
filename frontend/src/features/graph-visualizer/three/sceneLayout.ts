import { Box3, Vector3 } from 'three'

import type { GraphNode } from '../../../types/graph'
import { getNodeStyle } from './nodeStyles'

export type BuildingLayout = {
  id: string
  node: GraphNode
  position: [number, number, number]
  size: [number, number, number]
}

export type DistrictLayout = {
  id: string
  packageName: string
  center: [number, number, number]
  width: number
  depth: number
  buildings: BuildingLayout[]
}

export type ProjectLayout = {
  districts: DistrictLayout[]
  bounds: Box3
  center: Vector3
}

const BUILDING_WIDTH = 0.9
const BUILDING_DEPTH = 0.9
const BUILDING_SPACING = 2.25
const DISTRICT_PADDING = 1.75
const DISTRICT_GAP = 3.5
const MIN_BRANCH_RADIUS = 7

export function createProjectLayout(nodes: GraphNode[]): ProjectLayout {
  const districts = createDistricts(groupNodesByPackage(nodes))
  const bounds = createBounds(districts)
  const center = bounds.getCenter(new Vector3())

  return {
    districts,
    bounds,
    center,
  }
}

export function createBuildingsByNodeId(layout: ProjectLayout) {
  const buildingsByNodeId = new Map<string, BuildingLayout>()

  layout.districts.forEach((district) => {
    district.buildings.forEach((building) => {
      buildingsByNodeId.set(building.node.id, building)
    })
  })

  return buildingsByNodeId
}

function groupNodesByPackage(nodes: GraphNode[]) {
  return nodes.reduce<Record<string, GraphNode[]>>((packages, node) => {
    const packageName = node.packageName || getPackageNameFromId(node.id)
    packages[packageName] = [...(packages[packageName] ?? []), node]
    return packages
  }, {})
}

function createDistricts(groupedNodes: Record<string, GraphNode[]>): DistrictLayout[] {
  const packageEntries = Object.entries(groupedNodes).sort(([firstPackage], [secondPackage]) =>
    firstPackage.localeCompare(secondPackage),
  )

  const districtDrafts = packageEntries.map(([packageName, nodes]) => {
    const columns = Math.ceil(Math.sqrt(nodes.length))
    const rows = Math.ceil(nodes.length / columns)

    return {
      packageName,
      nodes: sortNodesForDistrict(nodes),
      columns,
      rows,
      width: Math.max(3.4, (columns - 1) * BUILDING_SPACING + BUILDING_WIDTH + DISTRICT_PADDING * 2),
      depth: Math.max(3.2, (rows - 1) * BUILDING_SPACING + BUILDING_DEPTH + DISTRICT_PADDING * 2),
    }
  })

  const districtCenters = createRadialDistrictCenters(districtDrafts)

  return districtDrafts.map((district) => {
    const center = districtCenters.get(district.packageName) ?? [0, 0, 0]

    return {
      id: district.packageName,
      packageName: district.packageName,
      center,
      width: district.width,
      depth: district.depth,
      buildings: createBuildings(district.nodes, district.columns, district.rows, center),
    }
  })
}

type DistrictDraft = {
  packageName: string
  nodes: GraphNode[]
  columns: number
  rows: number
  width: number
  depth: number
}

type PackageLayoutNode = {
  children: PackageLayoutNode[]
  packageName: string
  parentPackageName: string | null
}

function createRadialDistrictCenters(districtDrafts: DistrictDraft[]) {
  const centers = new Map<string, [number, number, number]>()

  if (districtDrafts.length === 0) {
    return centers
  }

  const nodesByPackageName = createPackageLayoutNodes(districtDrafts)
  const roots = [...nodesByPackageName.values()]
    .filter((node) => node.parentPackageName === null)
    .sort(comparePackageNodes)
  const maxDistrictSize = Math.max(
    ...districtDrafts.map((district) => Math.max(district.width, district.depth)),
  )
  const ringStep = Math.max(MIN_BRANCH_RADIUS, maxDistrictSize + DISTRICT_GAP)

  if (roots.length === 1) {
    const [root] = roots
    centers.set(root.packageName, [0, 0, 0])
    placeChildBranches(root, 0, Math.PI * 2, 1, ringStep, centers)

    return centers
  }

  roots.forEach((root, index) => {
    const angle = (index / roots.length) * Math.PI * 2 - Math.PI / 2
    const rootRadius = ringStep

    centers.set(root.packageName, [
      Math.cos(angle) * rootRadius,
      0,
      Math.sin(angle) * rootRadius,
    ])
    placeChildBranches(
      root,
      angle - Math.PI / roots.length,
      angle + Math.PI / roots.length,
      2,
      ringStep,
      centers,
    )
  })

  return centers
}

function createPackageLayoutNodes(districtDrafts: DistrictDraft[]) {
  const nodesByPackageName = new Map<string, PackageLayoutNode>()

  districtDrafts.forEach((draft) => {
    nodesByPackageName.set(draft.packageName, {
      children: [],
      packageName: draft.packageName,
      parentPackageName: null,
    })
  })

  nodesByPackageName.forEach((node) => {
    const parentPackageName = findNearestParentPackageName(node.packageName, nodesByPackageName)

    node.parentPackageName = parentPackageName

    if (parentPackageName) {
      nodesByPackageName.get(parentPackageName)?.children.push(node)
    }
  })

  nodesByPackageName.forEach((node) => {
    node.children.sort(comparePackageNodes)
  })

  return nodesByPackageName
}

function placeChildBranches(
  parent: PackageLayoutNode,
  startAngle: number,
  endAngle: number,
  depth: number,
  ringStep: number,
  centers: Map<string, [number, number, number]>,
) {
  if (parent.children.length === 0) {
    return
  }

  const angleSpan = endAngle - startAngle

  parent.children.forEach((child, index) => {
    const segmentStart = startAngle + (angleSpan * index) / parent.children.length
    const segmentEnd = startAngle + (angleSpan * (index + 1)) / parent.children.length
    const angle = (segmentStart + segmentEnd) / 2
    const radius = ringStep * depth

    centers.set(child.packageName, [
      Math.cos(angle) * radius,
      0,
      Math.sin(angle) * radius,
    ])

    placeChildBranches(child, segmentStart, segmentEnd, depth + 1, ringStep, centers)
  })
}

function findNearestParentPackageName(
  packageName: string,
  nodesByPackageName: Map<string, PackageLayoutNode>,
) {
  const packageParts = packageName.split('.')

  for (let length = packageParts.length - 1; length > 0; length -= 1) {
    const parentPackageName = packageParts.slice(0, length).join('.')

    if (nodesByPackageName.has(parentPackageName)) {
      return parentPackageName
    }
  }

  return null
}

function comparePackageNodes(firstNode: PackageLayoutNode, secondNode: PackageLayoutNode) {
  return firstNode.packageName.localeCompare(secondNode.packageName)
}

function createBuildings(
  nodes: GraphNode[],
  columns: number,
  rows: number,
  districtCenter: [number, number, number],
): BuildingLayout[] {
  const rootNode = nodes.find((node) => getNodeLayoutPriority(node) === 0)

  if (rootNode && nodes.length > 1) {
    const surroundingNodes = nodes.filter((node) => node.id !== rootNode.id)

    return [
      createBuilding(rootNode, districtCenter, [0, 0]),
      ...surroundingNodes.map((node, index) => {
        const angle = (index / surroundingNodes.length) * Math.PI * 2 - Math.PI / 2
        const localX = Math.cos(angle) * BUILDING_SPACING
        const localZ = Math.sin(angle) * BUILDING_SPACING

        return createBuilding(node, districtCenter, [localX, localZ])
      }),
    ]
  }

  return nodes.map((node, index) => {
    const column = index % columns
    const row = Math.floor(index / columns)
    const localX = (column - (columns - 1) / 2) * BUILDING_SPACING
    const localZ = (row - (rows - 1) / 2) * BUILDING_SPACING

    return createBuilding(node, districtCenter, [localX, localZ])
  })
}

function createBuilding(
  node: GraphNode,
  districtCenter: [number, number, number],
  localPosition: [number, number],
): BuildingLayout {
  const style = getNodeStyle(node)
  const height = style.height

  return {
    id: node.id,
    node,
    position: [
      districtCenter[0] + localPosition[0],
      height / 2,
      districtCenter[2] + localPosition[1],
    ],
    size: [BUILDING_WIDTH, height, BUILDING_DEPTH],
  }
}

function createBounds(districts: DistrictLayout[]) {
  const bounds = new Box3()

  districts.forEach((district) => {
    bounds.expandByPoint(
      new Vector3(
        district.center[0] - district.width / 2,
        0,
        district.center[2] - district.depth / 2,
      ),
    )
    bounds.expandByPoint(
      new Vector3(
        district.center[0] + district.width / 2,
        3,
        district.center[2] + district.depth / 2,
      ),
    )
  })

  return bounds
}

function getPackageNameFromId(id: string) {
  return id.split('.').slice(0, -1).join('.') || 'default'
}

function sortNodesForDistrict(nodes: GraphNode[]) {
  return [...nodes].sort((firstNode, secondNode) => {
    const firstPriority = getNodeLayoutPriority(firstNode)
    const secondPriority = getNodeLayoutPriority(secondNode)

    if (firstPriority !== secondPriority) {
      return firstPriority - secondPriority
    }

    return firstNode.label.localeCompare(secondNode.label)
  })
}

function getNodeLayoutPriority(node: GraphNode) {
  const type = node.type.toUpperCase()

  if (type === 'APPLICATION') {
    return 0
  }

  if (node.annotations?.some((annotation) => annotation === 'SpringBootApplication')) {
    return 0
  }

  return 1
}
