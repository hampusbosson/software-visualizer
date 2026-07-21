export type GraphNode = {
  id: string
  label: string
  type: string
  packageName?: string
  annotations?: string[]
  dependencies?: string[]
  methods?: AnalyzedMethod[]
  endpoints?: AnalyzedEndpoint[]
  extendedTypes?: string[]
  implementedInterfaces?: string[]
  filePath?: string | null
  classKind?: ClassKind
}

export type GraphEdge = {
  source: string
  target: string
  type?: string
}

export type GraphResponse = {
  nodes: GraphNode[]
  edges: GraphEdge[]
  projectName?: string | null
}

export type AnalysisResponse = {
  analysisId: string
  graph: GraphResponse
}

export type ClassKind = 'CLASS' | 'ABSTRACT_CLASS' | 'INTERFACE' | 'ENUM' | 'RECORD'

export type AnalyzedMethod = {
  name: string
  returnType: string
  parameters: AnalyzedParameter[]
  annotations: string[]
  startLine: number
  endLine: number
}

export type AnalyzedParameter = {
  name: string
  type: string
}

export type AnalyzedEndpoint = {
  httpMethod: string
  path: string
  methodName: string
}
