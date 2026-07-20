import { useMemo, useState } from 'react'

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

const MOCK_METHODS: AnalyzedMethod[] = [
  {
    name: 'findAll',
    returnType: 'List<Vet>',
    parameters: [],
    annotations: ['Transactional'],
    startLine: 24,
    endLine: 28,
  },
  {
    name: 'findById',
    returnType: 'Optional<Vet>',
    parameters: [{ name: 'id', type: 'Integer' }],
    annotations: [],
    startLine: 30,
    endLine: 34,
  },
  {
    name: 'save',
    returnType: 'Vet',
    parameters: [{ name: 'vet', type: 'Vet' }],
    annotations: [],
    startLine: 36,
    endLine: 41,
  },
]

const MOCK_ENDPOINTS: AnalyzedEndpoint[] = [
  { httpMethod: 'GET', path: '/api/vets', methodName: 'findAll' },
  { httpMethod: 'GET', path: '/api/vets/{id}', methodName: 'findById' },
]

export function ClassDetailsPanel({ graphResponse, node, onClose }: ClassDetailsPanelProps) {
  const [selectedTab, setSelectedTab] = useState<InspectorTab>('overview')
  const viewModel = useMemo(
    () => (node ? createClassDetailsViewModel(node, graphResponse) : null),
    [graphResponse, node],
  )

  if (!node || !viewModel) {
    return null
  }

  return (
    <aside className="flex h-screen w-[360px] shrink-0 flex-col border-l border-white/10 bg-[#0b1018] text-slate-200">
      <div className="border-b border-white/10 px-4 py-3">
        <div className="grid grid-cols-2 rounded-lg border border-white/10 bg-[#070b11] p-1">
          <InspectorTabButton
            active={selectedTab === 'overview'}
            label="Overview"
            onClick={() => setSelectedTab('overview')}
          />
          <InspectorTabButton
            active={selectedTab === 'code'}
            label="Code"
            onClick={() => setSelectedTab('code')}
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
  classKind: string
  code: string
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
          <span className="text-[11px] text-slate-600">mock</span>
        </div>

        <pre className="app-scrollbar max-h-[calc(100vh-190px)] overflow-auto p-4 font-mono text-xs leading-5 text-slate-300">
          <code>
            <JavaCodePreview code={viewModel.code} />
          </code>
        </pre>
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

function JavaCodePreview({ code }: { code: string }) {
  return (
    <>
      {code.split('\n').map((line, index) => (
        <span key={`${index}-${line}`} className="block">
          <span className="mr-4 inline-block w-6 select-none text-right text-slate-700">
            {index + 1}
          </span>
          {highlightJavaLine(line)}
        </span>
      ))}
    </>
  )
}

function highlightJavaLine(line: string) {
  const commentIndex = line.indexOf('//')
  const codePart = commentIndex >= 0 ? line.slice(0, commentIndex) : line
  const commentPart = commentIndex >= 0 ? line.slice(commentIndex) : ''
  const tokens = codePart.split(/(\s+|[(){};,.<>@])/)

  return (
    <>
      {tokens.map((token, index) => (
        <span key={`${token}-${index}`} className={getJavaTokenClassName(token)}>
          {token}
        </span>
      ))}
      {commentPart ? <span className="text-slate-600">{commentPart}</span> : null}
    </>
  )
}

function getJavaTokenClassName(token: string) {
  if (['class', 'interface', 'enum', 'record', 'extends', 'implements', 'public', 'private', 'protected', 'final', 'return', 'new'].includes(token)) {
    return 'text-[#c586c0]'
  }

  if (['String', 'Integer', 'Long', 'List', 'Optional', 'void'].includes(token)) {
    return 'text-[#4ec9b0]'
  }

  if (token.startsWith('@')) {
    return 'text-[#dcdcaa]'
  }

  return ''
}

function createClassDetailsViewModel(
  node: GraphNode,
  graphResponse: GraphResponse,
): ClassDetailsViewModel {
  const annotations = withFallback(node.annotations, ['Entity', 'Table'])
  const methods = node.methods && node.methods.length > 0 ? node.methods : MOCK_METHODS
  const endpoints = node.endpoints && node.endpoints.length > 0
    ? node.endpoints
    : node.type === 'CONTROLLER'
      ? MOCK_ENDPOINTS
      : []
  const relationshipLabels = getRelationshipLabels(node, graphResponse)
  const dependencies =
    relationshipLabels.dependsOn.length > 0
      ? relationshipLabels.dependsOn
      : withFallback(node.dependencies, getMockDependencies(node.type))
  const extendedTypes = withFallback(node.extendedTypes, getMockExtendedTypes(node.type))
  const implementedInterfaces = withFallback(node.implementedInterfaces, getMockInterfaces(node.type))

  return {
    classKind: node.classKind ?? getMockClassKind(node.type),
    code: createMockJavaCode(node, annotations, methods),
    dependencies,
    endpoints,
    extendedTypes,
    implementedInterfaces,
    label: node.label,
    methods,
    packageName: node.packageName ?? 'org.springframework.samples.petclinic',
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

function withFallback(values: string[] | undefined, fallback: string[]) {
  return values && values.length > 0 ? values : fallback
}

function getMockDependencies(nodeType: string) {
  if (nodeType === 'CONTROLLER') {
    return ['VetService']
  }

  if (nodeType === 'SERVICE') {
    return ['VetRepository']
  }

  return []
}

function getMockExtendedTypes(nodeType: string) {
  return nodeType === 'ENTITY' ? ['BaseEntity'] : []
}

function getMockInterfaces(nodeType: string) {
  return nodeType === 'REPOSITORY' ? ['JpaRepository<Vet, Integer>'] : []
}

function getMockClassKind(nodeType: string) {
  return nodeType === 'DTO' ? 'RECORD' : 'CLASS'
}

function createMockJavaCode(
  node: GraphNode,
  annotations: string[],
  methods: AnalyzedMethod[],
) {
  const annotationLines = annotations.map((annotation) => `@${annotation}`).join('\n')
  const methodLines = methods
    .slice(0, 4)
    .map((method) => {
      const parameters = method.parameters
        .map((parameter) => `${parameter.type} ${parameter.name}`)
        .join(', ')

      return `    public ${method.returnType} ${method.name}(${parameters}) {\n        // implementation loaded on demand\n        return null;\n    }`
    })
    .join('\n\n')

  return `package ${node.packageName ?? 'org.springframework.samples.petclinic'};\n\n${annotationLines}\npublic class ${node.label} {\n\n${methodLines}\n}`
}
