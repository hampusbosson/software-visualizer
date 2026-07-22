import { useEffect, useMemo, useState } from 'react'
import type { MouseEvent as ReactMouseEvent } from 'react'

import { clampResizablePanelWidth } from '../../../components/ui/resizable-panel'
import type { AnalyzedMethod, GraphNode, GraphResponse } from '../../../types/graph'
import type { ClassDetailsViewModel, MethodJumpTarget } from '../types/class-details'
import { CodeTab } from './CodeTab'
import { OverviewTab } from './OverviewTab'

type ClassDetailsPanelProps = {
  analysisId: string
  graphResponse: GraphResponse
  node: GraphNode | null
  onSelectNode: (node: GraphNode) => void
}

type InspectorTab = 'overview' | 'code'
type InspectorTabState = {
  nodeId: string | null
  tab: InspectorTab
}

const DEFAULT_INSPECTOR_WIDTH = 600
const MAX_INSPECTOR_WIDTH = 1040

export function ClassDetailsPanel({
  analysisId,
  graphResponse,
  node,
  onSelectNode,
}: ClassDetailsPanelProps) {
  const [selectedTabState, setSelectedTabState] = useState<InspectorTabState>({
    nodeId: null,
    tab: 'overview',
  })
  const [methodJumpTarget, setMethodJumpTarget] = useState<MethodJumpTarget | null>(null)
  const [width, setWidth] = useState(DEFAULT_INSPECTOR_WIDTH)
  const [isResizing, setIsResizing] = useState(false)
  const viewModel = useMemo(
    () => (node ? createClassDetailsViewModel(node, graphResponse) : null),
    [graphResponse, node],
  )
  const selectedTab =
    selectedTabState.nodeId === node?.id ? selectedTabState.tab : 'overview'

  useEffect(() => {
    if (!isResizing) {
      return
    }

    function handleMouseMove(event: MouseEvent) {
      setWidth(
        clampResizablePanelWidth(window.innerWidth - event.clientX, {
          maxWidth: MAX_INSPECTOR_WIDTH,
        }),
      )
    }

    function handleMouseUp() {
      setIsResizing(false)
    }

    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isResizing])

  function startResize(event: ReactMouseEvent<HTMLDivElement>) {
    event.preventDefault()
    setIsResizing(true)
  }

  function selectTab(tab: InspectorTab) {
    if (!node) {
      return
    }

    if (tab !== 'code') {
      setMethodJumpTarget(null)
    }

    setSelectedTabState({ nodeId: node.id, tab })
  }

  function openMethodInCode(method: AnalyzedMethod) {
    if (!node) {
      return
    }

    setMethodJumpTarget({
      endLine: method.endLine,
      jumpId: Date.now(),
      methodName: method.name,
      startLine: method.startLine,
    })
    setSelectedTabState({ nodeId: node.id, tab: 'code' })
  }

  function selectConnectedNode(nodeId: string) {
    const connectedNode = graphResponse.nodes.find((graphNode) => graphNode.id === nodeId)

    if (!connectedNode) {
      return
    }

    setMethodJumpTarget(null)
    onSelectNode(connectedNode)
  }

  if (!node || !viewModel) {
    return null
  }

  return (
    <aside
      className="relative flex h-screen shrink-0 flex-col border-l border-white/10 bg-[#0b1018] text-slate-200"
      style={{ width }}
    >
      <div
        className="absolute left-0 top-0 z-30 h-full w-2 -translate-x-1 cursor-col-resize transition hover:bg-cyan-400/50"
        onMouseDown={startResize}
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize class inspector"
      />

      <div className="border-b border-white/10 px-4 py-3">
        <div className="grid grid-cols-2 rounded-lg border border-white/10 bg-[#070b11] p-1">
          <InspectorTabButton
            active={selectedTab === 'overview'}
            label="Overview"
            onClick={() => selectTab('overview')}
          />
          <InspectorTabButton
            active={selectedTab === 'code'}
            label="Code"
            onClick={() => selectTab('code')}
          />
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col">
        {selectedTab === 'overview' ? (
          <div className="border-b border-white/10 px-5 py-5">
            <div className="min-w-0">
              <h2 className="truncate text-2xl font-semibold tracking-tight text-slate-50">
                {viewModel.label}
              </h2>
              <div className="mt-2">
                <span className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-1 text-[10px] font-medium uppercase tracking-[0.14em] text-slate-300">
                  {viewModel.type}
                </span>
              </div>
            </div>

            <p className="mt-3 break-all text-xs leading-5 text-slate-500">
              {viewModel.packageName}
            </p>
          </div>
        ) : null}

        {selectedTab === 'overview' ? (
          <div className="app-scrollbar min-h-0 flex-1 overflow-auto">
            <OverviewTab
              onSelectConnection={selectConnectedNode}
              onSelectMethod={openMethodInCode}
              viewModel={viewModel}
            />
          </div>
        ) : (
          <div className="min-h-0 flex-1">
            <CodeTab
              analysisId={analysisId}
              key={node.id}
              methodJumpTarget={methodJumpTarget}
              nodeId={node.id}
              viewModel={viewModel}
            />
          </div>
        )}
      </div>
    </aside>
  )
}

type InspectorTabButtonProps = {
  active: boolean
  label: string
  onClick: () => void
}

function InspectorTabButton({ active, label, onClick }: InspectorTabButtonProps) {
  return (
    <button
      className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
        active
          ? 'bg-slate-800 text-slate-100 shadow-sm'
          : 'text-slate-500 hover:text-slate-300'
      }`}
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  )
}

function createClassDetailsViewModel(
  node: GraphNode,
  graphResponse: GraphResponse,
): ClassDetailsViewModel {
  const relationships = getRelationshipConnections(node, graphResponse)
  const dependencies =
    relationships.dependsOn.length > 0
      ? relationships.dependsOn
      : createDependencyConnections(node, graphResponse)

  return {
    dependencies,
    endpoints: node.endpoints ?? [],
    extendedTypes: node.extendedTypes ?? [],
    implementedInterfaces: node.implementedInterfaces ?? [],
    label: node.label,
    methods: node.methods ?? [],
    packageName: node.packageName ?? 'No package',
    type: node.type,
    usedBy: relationships.usedBy,
  }
}

function getRelationshipConnections(node: GraphNode, graphResponse: GraphResponse) {
  const nodesById = new Map(
    graphResponse.nodes.map((graphNode) => [graphNode.id, graphNode]),
  )
  const usedBy = new Map<string, string>()
  const dependsOn = new Map<string, string>()

  graphResponse.edges.forEach((edge) => {
    if (edge.target === node.id) {
      usedBy.set(edge.source, nodesById.get(edge.source)?.label ?? edge.source)
    }

    if (edge.source === node.id) {
      dependsOn.set(edge.target, nodesById.get(edge.target)?.label ?? edge.target)
    }
  })

  return {
    dependsOn: [...dependsOn].map(([nodeId, label]) => ({ label, nodeId })),
    usedBy: [...usedBy].map(([nodeId, label]) => ({ label, nodeId })),
  }
}

function createDependencyConnections(
  node: GraphNode,
  graphResponse: GraphResponse,
) {
  return (node.dependencies ?? []).map((dependencyName) => {
    const dependencyNode = findDependencyNode(dependencyName, graphResponse.nodes)

    return {
      label: dependencyNode?.label ?? dependencyName,
      nodeId: dependencyNode?.id ?? null,
    }
  })
}

function findDependencyNode(dependencyName: string, nodes: GraphNode[]) {
  const rawTypeName = dependencyName.split('<')[0].trim()

  return nodes.find((node) =>
    node.id === dependencyName ||
    node.label === dependencyName ||
    node.label === rawTypeName ||
    node.id.endsWith(`.${rawTypeName}`),
  )
}
