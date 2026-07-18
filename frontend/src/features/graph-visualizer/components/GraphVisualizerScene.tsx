import { Canvas } from '@react-three/fiber'

import type { GraphResponse } from '../../../types/graph'

type GraphVisualizerSceneProps = {
  graphResponse: GraphResponse
}

export function GraphVisualizerScene({ graphResponse }: GraphVisualizerSceneProps) {
  return (
    <div className="relative h-screen w-screen bg-[#080b12]">
      <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
        <color attach="background" args={['#080b12']} />
        <ambientLight intensity={0.8} />
      </Canvas>

      <div className="pointer-events-none absolute left-6 top-6 rounded-xl border border-white/10 bg-[#0d1117]/85 px-4 py-3 text-left shadow-xl shadow-black/20 backdrop-blur">
        <p className="text-sm font-semibold text-white">Graph scene</p>
        <p className="mt-1 text-xs text-slate-400">
          {graphResponse.nodes.length} nodes · {graphResponse.edges.length} edges
        </p>
      </div>
    </div>
  )
}

export default GraphVisualizerScene
