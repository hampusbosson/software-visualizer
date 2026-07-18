export type GraphNode = {
  id: string
  label: string
  type: string
  packageName?: string
  annotations?: string[]
}

export type GraphEdge = {
  from: string
  to: string
  type?: string
}

export type GraphResponse = {
  nodes: GraphNode[]
  edges: GraphEdge[]
  projectName?: string | null
}
