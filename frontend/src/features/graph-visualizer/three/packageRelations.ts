import { QuadraticBezierCurve3, Vector3 } from 'three'

import type { DistrictLayout } from './sceneLayout'

export type PackageRelationLayout = {
  id: string
  parentPackageName: string
  childPackageName: string
  curve: QuadraticBezierCurve3
}

const CABLE_Y = 0.06

export function createPackageRelationLayouts(districts: DistrictLayout[]): PackageRelationLayout[] {
  const districtsByPackageName = new Map(
    districts.map((district) => [district.packageName, district]),
  )

  return districts.flatMap((district) => {
    const parentDistrict = findNearestParentDistrict(district.packageName, districtsByPackageName)

    if (!parentDistrict) {
      return []
    }

    const start = getDistrictEdgePoint(parentDistrict, district)
    const end = getDistrictEdgePoint(district, parentDistrict)
    const midpoint = start.clone().add(end).multiplyScalar(0.5)
    const controlPoint = midpoint.clone()

    return [
      {
        id: `${parentDistrict.packageName}->${district.packageName}`,
        parentPackageName: parentDistrict.packageName,
        childPackageName: district.packageName,
        curve: new QuadraticBezierCurve3(start, controlPoint, end),
      },
    ]
  })
}

function findNearestParentDistrict(
  packageName: string,
  districtsByPackageName: Map<string, DistrictLayout>,
) {
  const packageParts = packageName.split('.')

  for (let length = packageParts.length - 1; length > 0; length -= 1) {
    const parentPackageName = packageParts.slice(0, length).join('.')
    const parentDistrict = districtsByPackageName.get(parentPackageName)

    if (parentDistrict) {
      return parentDistrict
    }
  }

  return null
}

function getDistrictEdgePoint(from: DistrictLayout, to: DistrictLayout) {
  const fromCenter = new Vector3(from.center[0], CABLE_Y, from.center[2])
  const toCenter = new Vector3(to.center[0], CABLE_Y, to.center[2])
  const direction = toCenter.clone().sub(fromCenter).setY(0).normalize()

  if (direction.lengthSq() === 0) {
    direction.set(1, 0, 0)
  }

  const halfWidth = from.width / 2
  const halfDepth = from.depth / 2
  const scaleX = direction.x === 0 ? Number.POSITIVE_INFINITY : halfWidth / Math.abs(direction.x)
  const scaleZ = direction.z === 0 ? Number.POSITIVE_INFINITY : halfDepth / Math.abs(direction.z)
  const edgeDistance = Math.min(scaleX, scaleZ) + 0.12

  return fromCenter.add(direction.multiplyScalar(edgeDistance))
}
