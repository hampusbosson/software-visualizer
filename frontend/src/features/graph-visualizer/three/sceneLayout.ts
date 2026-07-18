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
      nodes: [...nodes].sort((firstNode, secondNode) =>
        firstNode.label.localeCompare(secondNode.label),
      ),
      columns,
      rows,
      width: Math.max(3.4, (columns - 1) * BUILDING_SPACING + BUILDING_WIDTH + DISTRICT_PADDING * 2),
      depth: Math.max(3.2, (rows - 1) * BUILDING_SPACING + BUILDING_DEPTH + DISTRICT_PADDING * 2),
    }
  })

  const districtColumns = Math.max(1, Math.ceil(Math.sqrt(districtDrafts.length)))
  const rowHeights: number[] = []
  const columnWidths: number[] = []

  districtDrafts.forEach((district, index) => {
    const row = Math.floor(index / districtColumns)
    const column = index % districtColumns
    rowHeights[row] = Math.max(rowHeights[row] ?? 0, district.depth)
    columnWidths[column] = Math.max(columnWidths[column] ?? 0, district.width)
  })

  const totalWidth = columnWidths.reduce((sum, width) => sum + width, 0) + DISTRICT_GAP * (districtColumns - 1)
  const totalDepth = rowHeights.reduce((sum, depth) => sum + depth, 0) + DISTRICT_GAP * (rowHeights.length - 1)

  const columnCenters = createAxisCenters(columnWidths, totalWidth)
  const rowCenters = createAxisCenters(rowHeights, totalDepth)

  return districtDrafts.map((district, index) => {
    const row = Math.floor(index / districtColumns)
    const column = index % districtColumns
    const center: [number, number, number] = [columnCenters[column], 0, rowCenters[row]]

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

function createBuildings(
  nodes: GraphNode[],
  columns: number,
  rows: number,
  districtCenter: [number, number, number],
): BuildingLayout[] {
  return nodes.map((node, index) => {
    const column = index % columns
    const row = Math.floor(index / columns)
    const style = getNodeStyle(node)
    const localX = (column - (columns - 1) / 2) * BUILDING_SPACING
    const localZ = (row - (rows - 1) / 2) * BUILDING_SPACING
    const height = style.height

    return {
      id: node.id,
      node,
      position: [districtCenter[0] + localX, height / 2, districtCenter[2] + localZ],
      size: [BUILDING_WIDTH, height, BUILDING_DEPTH],
    }
  })
}

function createAxisCenters(sizes: number[], totalSize: number) {
  let cursor = -totalSize / 2

  return sizes.map((size) => {
    const center = cursor + size / 2
    cursor += size + DISTRICT_GAP
    return center
  })
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
