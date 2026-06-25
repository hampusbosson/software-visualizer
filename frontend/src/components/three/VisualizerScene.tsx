import { Float, OrbitControls } from '@react-three/drei'
import { Canvas, useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import type { Mesh } from 'three'

function VisualizerNode() {
  const meshRef = useRef<Mesh>(null)

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.25
    }
  })

  return (
    <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.6}>
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[1.45, 2]} />
        <meshStandardMaterial
          color="#22d3ee"
          emissive="#083344"
          metalness={0.35}
          roughness={0.2}
        />
      </mesh>
    </Float>
  )
}

export function VisualizerScene() {
  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
      <color attach="background" args={['#0f172a']} />
      <ambientLight intensity={1.2} />
      <directionalLight position={[3, 4, 5]} intensity={3} color="#a5f3fc" />
      <pointLight position={[-4, -2, 2]} intensity={12} color="#8b5cf6" />
      <VisualizerNode />
      <OrbitControls
        enablePan={false}
        minDistance={3}
        maxDistance={8}
        autoRotate
        autoRotateSpeed={0.5}
      />
    </Canvas>
  )
}
