import type { PackageRelationLayout } from '../three/packageRelations'
import { PackageRelationCable } from './PackageRelationCable'

type PackageRelationCablesProps = {
  relations: PackageRelationLayout[]
}

export function PackageRelationCables({ relations }: PackageRelationCablesProps) {
  return (
    <>
      {relations.map((relation, index) => (
        <PackageRelationCable key={relation.id} index={index} relation={relation} />
      ))}
    </>
  )
}
