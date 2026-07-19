import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import type { Mesh } from 'three'

import type { PackageRelationLayout } from '../three/packageRelations'

type PackageRelationCableProps = {
  relation: PackageRelationLayout
  index: number
}

export function PackageRelationCable({ relation, index }: PackageRelationCableProps) {
  const firstPulseRef = useRef<Mesh>(null)
  const secondPulseRef = useRef<Mesh>(null)

  useFrame(({ clock }) => {
    const baseProgress = (clock.elapsedTime * 0.18 + index * 0.17) % 1

    if (firstPulseRef.current) {
      firstPulseRef.current.position.copy(relation.curve.getPointAt(baseProgress))
    }

    if (secondPulseRef.current) {
      secondPulseRef.current.position.copy(relation.curve.getPointAt((baseProgress + 0.46) % 1))
    }
  })

  return (
    <group>
      <mesh>
        <tubeGeometry args={[relation.curve, 32, 0.085, 8, false]} />
        <meshBasicMaterial color="#0e7490" depthWrite={false} opacity={0.16} transparent />
      </mesh>

      <mesh>
        <tubeGeometry args={[relation.curve, 32, 0.028, 8, false]} />
        <meshBasicMaterial color="#67e8f9" depthWrite={false} opacity={0.58} transparent />
      </mesh>

      <mesh ref={firstPulseRef}>
        <sphereGeometry args={[0.105, 10, 10]} />
        <meshBasicMaterial color="#e0f2fe" />
      </mesh>

      <mesh ref={secondPulseRef}>
        <sphereGeometry args={[0.075, 10, 10]} />
        <meshBasicMaterial color="#22d3ee" />
      </mesh>
    </group>
  )
}
