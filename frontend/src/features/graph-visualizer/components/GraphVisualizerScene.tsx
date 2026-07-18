import { useState } from 'react'

import type { GraphNode } from '../../../types/graph'
import type { GraphResponse } from '../../../types/graph'
import { mockGraphResponse } from '../three/mockGraph'
import { ProjectScene } from './ProjectScene'
import { ProjectTreeSidebar } from './ProjectTreeSidebar'

type GraphVisualizerSceneProps = {
  graphResponse: GraphResponse
}

export function GraphVisualizerScene({ graphResponse }: GraphVisualizerSceneProps) {
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null)
  const sceneGraphResponse =
    graphResponse.nodes.length > 0 ? graphResponse : mockGraphResponse

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#080b12]">
      <ProjectTreeSidebar
        graphResponse={sceneGraphResponse}
        onSelectNode={setSelectedNode}
        selectedNodeId={selectedNode?.id ?? null}
      />

      <main className="relative min-w-0 flex-1">
        <ProjectScene
          graphResponse={sceneGraphResponse}
          onClearSelection={() => setSelectedNode(null)}
          onSelectNode={setSelectedNode}
          selectedNode={selectedNode}
        />
      </main>
    </div>
  )
}

export default GraphVisualizerScene
