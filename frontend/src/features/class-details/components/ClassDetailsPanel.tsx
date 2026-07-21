import { useEffect, useMemo, useState } from 'react'
import type { MouseEvent as ReactMouseEvent } from 'react'

import { clampResizablePanelWidth } from '../../../components/ui/resizable-panel'
import type {
  AnalyzedEndpoint,
  AnalyzedMethod,
  GraphNode,
  GraphResponse,
} from '../../../types/graph'

type ClassDetailsPanelProps = {
  graphResponse: GraphResponse
  node: GraphNode | null
  onClose: () => void
}

type InspectorTab = 'overview' | 'code'
type InspectorTabState = {
  nodeId: string | null
  tab: InspectorTab
}

const DEFAULT_INSPECTOR_WIDTH = 360

export function ClassDetailsPanel({ graphResponse, node, onClose }: ClassDetailsPanelProps) {
  const [selectedTabState, setSelectedTabState] = useState<InspectorTabState>({
    nodeId: null,
    tab: 'overview',
  })
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
      setWidth(clampResizablePanelWidth(window.innerWidth - event.clientX))
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

  if (!node || !viewModel) {
    return null
  }

  return (
    <aside
      className="relative flex h-screen shrink-0 flex-col border-l border-white/10 bg-[#0b1018] text-slate-200"
      style={{ width }}
    >
      <div
        className="absolute left-0 top-0 h-full w-1 cursor-col-resize transition hover:bg-cyan-400/50"
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
            onClick={() => setSelectedTabState({ nodeId: node.id, tab: 'overview' })}
          />
          <InspectorTabButton
            active={selectedTab === 'code'}
            label="Code"
            onClick={() => setSelectedTabState({ nodeId: node.id, tab: 'code' })}
          />
        </div>
      </div>

      <div className="app-scrollbar min-h-0 flex-1 overflow-auto">
        <div className="border-b border-white/10 px-5 py-5">
          <div className="flex items-start justify-between gap-3">
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

            <button
              className="rounded-md px-2 py-1 text-sm text-slate-500 transition hover:bg-white/[0.04] hover:text-slate-200"
              onClick={onClose}
              type="button"
              aria-label="Close class inspector"
            >
              ×
            </button>
          </div>

          <p className="mt-3 break-all text-xs leading-5 text-slate-500">
            {viewModel.packageName}
          </p>
        </div>

        {selectedTab === 'overview' ? (
          <OverviewTab viewModel={viewModel} />
        ) : (
          <CodeTab viewModel={viewModel} />
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

type ClassDetailsViewModel = {
  dependencies: string[]
  endpoints: AnalyzedEndpoint[]
  extendedTypes: string[]
  implementedInterfaces: string[]
  label: string
  methods: AnalyzedMethod[]
  packageName: string
  type: string
  usedBy: string[]
}

function OverviewTab({ viewModel }: { viewModel: ClassDetailsViewModel }) {
  return (
    <div className="px-5 py-2">
      <InspectorSection title="Connections">
        <ConnectionGroup direction="incoming" items={viewModel.usedBy} title="Used by" />
        <ConnectionGroup direction="outgoing" items={viewModel.dependencies} title="Depends on" />
        <DefinitionRow
          label="Extends"
          value={viewModel.extendedTypes.length > 0 ? viewModel.extendedTypes.join(', ') : 'None'}
          muted={viewModel.extendedTypes.length === 0}
        />
        <DefinitionRow
          label="Implements"
          value={viewModel.implementedInterfaces.length > 0 ? viewModel.implementedInterfaces.join(', ') : 'None'}
          muted={viewModel.implementedInterfaces.length === 0}
        />
      </InspectorSection>

      {viewModel.endpoints.length > 0 ? (
        <InspectorSection title="Endpoints">
          <EndpointList endpoints={viewModel.endpoints} />
        </InspectorSection>
      ) : null}

      <InspectorSection title="Methods">
        <MethodList methods={viewModel.methods} />
      </InspectorSection>
    </div>
  )
}

type ConnectionGroupProps = {
  direction: 'incoming' | 'outgoing'
  items: string[]
  title: string
}

function ConnectionGroup({ direction, items, title }: ConnectionGroupProps) {
  const symbol = direction === 'incoming' ? '←' : '→'

  return (
    <div>
      <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-slate-500">
        {symbol} {title}
      </p>

      {items.length > 0 ? (
        <div className="mt-2 space-y-1">
          {items.map((item) => (
            <p key={item} className="truncate font-mono text-xs text-slate-300">
              {item}
            </p>
          ))}
        </div>
      ) : (
        <p className="mt-1 text-xs text-slate-600">None</p>
      )}
    </div>
  )
}

function MethodList({ methods }: { methods: AnalyzedMethod[] }) {
  if (methods.length === 0) {
    return <p className="text-xs text-slate-600">No methods</p>
  }

  return (
    <div className="space-y-3">
      {methods.map((method) => (
        <div key={`${method.name}-${method.startLine}`} className="min-w-0">
          <p className="truncate font-mono text-xs text-slate-200">
            {method.name}(...)
          </p>
          <p className="mt-1 truncate font-mono text-xs text-slate-500">
            {method.returnType}
          </p>
        </div>
      ))}
    </div>
  )
}

function EndpointList({ endpoints }: { endpoints: AnalyzedEndpoint[] }) {
  return (
    <div className="space-y-1.5">
      {endpoints.map((endpoint) => (
        <div
          key={`${endpoint.httpMethod}-${endpoint.path}-${endpoint.methodName}`}
          className="flex items-center gap-2 py-1"
        >
          <span className="rounded border border-white/10 bg-white/[0.035] px-1.5 py-0.5 font-mono text-[10px] font-semibold text-slate-400">
            {endpoint.httpMethod}
          </span>
          <span className="min-w-0 truncate font-mono text-xs text-slate-400">
            {endpoint.path}
          </span>
        </div>
      ))}
    </div>
  )
}

function CodeTab({ viewModel }: { viewModel: ClassDetailsViewModel }) {
  return (
    <div className="p-4">
      <div className="overflow-hidden rounded-xl border border-white/10 bg-[#090d14]">
        <div className="flex items-center justify-between border-b border-white/[0.07] bg-[#0c111a] px-3 py-2">
          <span className="truncate font-mono text-xs text-slate-400">{viewModel.label}.java</span>
          <span className="text-[11px] text-slate-600">not loaded</span>
        </div>

        <div className="p-4 font-mono text-xs leading-5 text-slate-600">
          Source code is not loaded yet.
        </div>
      </div>
    </div>
  )
}

type InspectorSectionProps = {
  children: React.ReactNode
  title: string
}

function InspectorSection({ children, title }: InspectorSectionProps) {
  return (
    <section className="border-b border-white/[0.07] py-4 last:border-b-0">
      <div className="mb-3 flex items-center gap-2">
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
          {title}
        </h3>
        <div className="h-px flex-1 bg-white/[0.06]" />
      </div>
      <div className="space-y-3 text-xs">{children}</div>
    </section>
  )
}

type DefinitionRowProps = {
  label: string
  muted?: boolean
  value: string
}

function DefinitionRow({ label, muted = false, value }: DefinitionRowProps) {
  return (
    <div>
      <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-slate-500">
        {label}
      </p>
      <p className={`mt-1 break-all ${muted ? 'text-slate-600' : 'text-slate-300'}`}>
        {value}
      </p>
    </div>
  )
}

function createClassDetailsViewModel(
  node: GraphNode,
  graphResponse: GraphResponse,
): ClassDetailsViewModel {
  const relationshipLabels = getRelationshipLabels(node, graphResponse)
  const dependencies =
    relationshipLabels.dependsOn.length > 0
      ? relationshipLabels.dependsOn
      : node.dependencies ?? []

  return {
    dependencies,
    endpoints: node.endpoints ?? [],
    extendedTypes: node.extendedTypes ?? [],
    implementedInterfaces: node.implementedInterfaces ?? [],
    label: node.label,
    methods: node.methods ?? [],
    packageName: node.packageName ?? 'No package',
    type: node.type,
    usedBy: relationshipLabels.usedBy,
  }
}

function getRelationshipLabels(node: GraphNode, graphResponse: GraphResponse) {
  const nodesById = new Map(
    graphResponse.nodes.map((graphNode) => [graphNode.id, graphNode]),
  )
  const usedBy = new Set<string>()
  const dependsOn = new Set<string>()

  graphResponse.edges.forEach((edge) => {
    if (edge.target === node.id) {
      usedBy.add(nodesById.get(edge.source)?.label ?? edge.source)
    }

    if (edge.source === node.id) {
      dependsOn.add(nodesById.get(edge.target)?.label ?? edge.target)
    }
  })

  return {
    dependsOn: [...dependsOn],
    usedBy: [...usedBy],
  }
}
