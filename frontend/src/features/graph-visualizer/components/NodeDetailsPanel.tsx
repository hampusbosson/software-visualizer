import type { GraphNode } from '../../../types/graph'

type NodeDetailsPanelProps = {
  node: GraphNode | null
  onClose: () => void
}

export function NodeDetailsPanel({ node, onClose }: NodeDetailsPanelProps) {
  if (!node) {
    return null
  }

  return (
    <aside className="absolute right-6 top-6 w-80 rounded-xl border border-white/10 bg-[#0d1117]/90 p-4 text-left shadow-2xl shadow-black/30 backdrop-blur">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">{node.label}</p>
          <p className="mt-1 text-xs uppercase tracking-wide text-cyan-200">{node.type}</p>
        </div>

        <button
          className="rounded-md px-2 py-1 text-sm text-slate-400 transition hover:bg-white/5 hover:text-white"
          onClick={onClose}
          type="button"
        >
          ×
        </button>
      </div>

      <div className="mt-4 space-y-3 text-xs">
        <div>
          <p className="text-slate-500">Package</p>
          <p className="mt-1 break-all text-slate-200">{node.packageName}</p>
        </div>

        <div>
          <p className="text-slate-500">ID</p>
          <p className="mt-1 break-all text-slate-300">{node.id}</p>
        </div>
      </div>
    </aside>
  )
}
