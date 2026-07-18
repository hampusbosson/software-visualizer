import type { GraphNode } from '../../../types/graph'

export type NodeVisualStyle = {
  accentColor: string
  baseColor: string
  height: number
  label: string
}

const NODE_STYLES: Record<string, NodeVisualStyle> = {
  CONTROLLER: {
    accentColor: '#38bdf8',
    baseColor: '#0f172a',
    height: 1.6,
    label: '@Controller',
  },
  SERVICE: {
    accentColor: '#34d399',
    baseColor: '#0f172a',
    height: 1.35,
    label: '@Service',
  },
  REPOSITORY: {
    accentColor: '#a78bfa',
    baseColor: '#0f172a',
    height: 1.2,
    label: '@Repository',
  },
  ENTITY: {
    accentColor: '#fb923c',
    baseColor: '#0f172a',
    height: 1.1,
    label: '@Entity',
  },
  DTO: {
    accentColor: '#94a3b8',
    baseColor: '#111827',
    height: 0.9,
    label: 'DTO',
  },
  CONFIGURATION: {
    accentColor: '#f87171',
    baseColor: '#0f172a',
    height: 1.25,
    label: '@Configuration',
  },
  COMPONENT: {
    accentColor: '#facc15',
    baseColor: '#0f172a',
    height: 1.15,
    label: '@Component',
  },
  UNKNOWN: {
    accentColor: '#64748b',
    baseColor: '#111827',
    height: 0.85,
    label: 'Unknown',
  },
}

export function getNodeStyle(node: GraphNode) {
  return NODE_STYLES[node.type.toUpperCase()] ?? NODE_STYLES.UNKNOWN
}
