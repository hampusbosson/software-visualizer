import { useState } from 'react'

import type { GraphNode } from '../../../types/graph'
import type { GraphResponse } from '../../../types/graph'
import { ClassDetailsPanel } from '../../class-details/components/ClassDetailsPanel'
import { ProjectTreeSidebar } from '../../project-sidebar/components/ProjectTreeSidebar'
import { mockGraphResponse } from '../three/mockGraph'
import { ProjectScene } from './ProjectScene'

type GraphVisualizerSceneProps = {
  graphResponse: GraphResponse
}

export function GraphVisualizerScene({ graphResponse }: GraphVisualizerSceneProps) {
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null)
  const sceneGraphResponse =
    graphResponse.nodes.length > 0 ? graphResponse : mockGraphResponse

  function clearSelection() {
    setSelectedNode(null)
  }

  function selectNode(node: GraphNode) {
    setSelectedNode(node)
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#080b12]">
      <ProjectTreeSidebar
        graphResponse={sceneGraphResponse}
        onSelectNode={selectNode}
        selectedNodeId={selectedNode?.id ?? null}
      />

      <main className="relative min-w-0 flex-1">
        <ProjectScene
          graphResponse={sceneGraphResponse}
          onClearSelection={clearSelection}
          onSelectNode={selectNode}
          selectedNode={selectedNode}
        />
      </main>

      <ClassDetailsPanel
        graphResponse={sceneGraphResponse}
        key={selectedNode?.id ?? 'empty-class-details'}
        node={selectedNode}
        onClose={clearSelection}
      />
    </div>
  )
}

export default GraphVisualizerScene
