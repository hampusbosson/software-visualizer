import type { ReactNode } from 'react'

import type { AnalyzedEndpoint, AnalyzedMethod } from '../../../types/graph'
import type { ClassConnection, ClassDetailsViewModel } from '../types/class-details'

type OverviewTabProps = {
  onSelectConnection: (nodeId: string) => void
  onSelectMethod: (method: AnalyzedMethod) => void
  viewModel: ClassDetailsViewModel
}

export function OverviewTab({
  onSelectConnection,
  onSelectMethod,
  viewModel,
}: OverviewTabProps) {
  return (
    <div className="px-5 py-2">
      <InspectorSection title="Connections">
        <ConnectionGroup
          direction="incoming"
          items={viewModel.usedBy}
          onSelectConnection={onSelectConnection}
          title="Used by"
        />
        <ConnectionGroup
          direction="outgoing"
          items={viewModel.dependencies}
          onSelectConnection={onSelectConnection}
          title="Depends on"
        />
        <DefinitionRow
          label="Extends"
          value={viewModel.extendedTypes.length > 0 ? viewModel.extendedTypes.join(', ') : 'None'}
          muted={viewModel.extendedTypes.length === 0}
        />
        <DefinitionRow
          label="Implements"
          value={
            viewModel.implementedInterfaces.length > 0
              ? viewModel.implementedInterfaces.join(', ')
              : 'None'
          }
          muted={viewModel.implementedInterfaces.length === 0}
        />
      </InspectorSection>

      {viewModel.endpoints.length > 0 ? (
        <InspectorSection title="Endpoints">
          <EndpointList endpoints={viewModel.endpoints} />
        </InspectorSection>
      ) : null}

      <InspectorSection title="Methods">
        <MethodList methods={viewModel.methods} onSelectMethod={onSelectMethod} />
      </InspectorSection>
    </div>
  )
}

type ConnectionGroupProps = {
  direction: 'incoming' | 'outgoing'
  items: ClassConnection[]
  onSelectConnection: (nodeId: string) => void
  title: string
}

function ConnectionGroup({
  direction,
  items,
  onSelectConnection,
  title,
}: ConnectionGroupProps) {
  const symbol = direction === 'incoming' ? '←' : '→'

  return (
    <div>
      <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-slate-500">
        {symbol} {title}
      </p>

      {items.length > 0 ? (
        <div className="mt-2 space-y-1">
          {items.map((item) => (
            <ConnectionButton
              key={`${item.nodeId ?? item.label}-${item.label}`}
              item={item}
              onSelectConnection={onSelectConnection}
            />
          ))}
        </div>
      ) : (
        <p className="mt-1 text-xs text-slate-600">None</p>
      )}
    </div>
  )
}

type ConnectionButtonProps = {
  item: ClassConnection
  onSelectConnection: (nodeId: string) => void
}

function ConnectionButton({ item, onSelectConnection }: ConnectionButtonProps) {
  const nodeId = item.nodeId

  if (nodeId === null) {
    return (
      <p className="truncate px-2 py-1.5 font-mono text-xs text-slate-500">
        {item.label}
      </p>
    )
  }

  return (
    <button
      className="group grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-2 rounded-md px-2 py-1.5 text-left transition hover:bg-white/[0.04]"
      onClick={() => onSelectConnection(nodeId)}
      type="button"
    >
      <span className="truncate font-mono text-xs text-slate-300 group-hover:text-white">
        {item.label}
      </span>
      <span className="text-slate-600 transition group-hover:translate-x-0.5 group-hover:text-slate-300">
        →
      </span>
    </button>
  )
}

type MethodListProps = {
  methods: AnalyzedMethod[]
  onSelectMethod: (method: AnalyzedMethod) => void
}

function MethodList({ methods, onSelectMethod }: MethodListProps) {
  if (methods.length === 0) {
    return <p className="text-xs text-slate-600">No methods</p>
  }

  return (
    <div className="space-y-1">
      {methods.map((method) => (
        <button
          key={`${method.name}-${method.startLine}`}
          className="group grid w-full grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-2 rounded-md px-2 py-1.5 text-left transition hover:bg-white/[0.04]"
          onClick={() => onSelectMethod(method)}
          type="button"
        >
          <span className="truncate font-mono text-xs text-slate-200 group-hover:text-white">
            {method.name}(...)
          </span>
          <span className="max-w-24 truncate font-mono text-xs text-slate-500">
            {method.returnType}
          </span>
          <span className="text-slate-600 transition group-hover:translate-x-0.5 group-hover:text-slate-300">
            →
          </span>
        </button>
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

type InspectorSectionProps = {
  children: ReactNode
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
