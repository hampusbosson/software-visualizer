import type { GraphNode } from '../../../types/graph'

type NodeTooltipProps = {
  node: GraphNode
}

export function NodeTooltip({ node }: NodeTooltipProps) {
  return (
    <div className="pointer-events-none min-w-44 rounded-lg border border-white/10 bg-[#020617]/90 px-3 py-2 text-left shadow-xl shadow-black/30 backdrop-blur">
      <p className="text-xs font-semibold text-white">{node.label}</p>
      <p className="mt-1 text-[11px] uppercase tracking-wide text-cyan-200">{node.type}</p>
      <p className="mt-1 max-w-56 truncate text-[11px] text-slate-400">{node.packageName}</p>
    </div>
  )
}
