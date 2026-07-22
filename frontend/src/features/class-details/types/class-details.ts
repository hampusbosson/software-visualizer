import type { AnalyzedEndpoint, AnalyzedMethod } from '../../../types/graph'

export type ClassConnection = {
  label: string
  nodeId: string | null
}

export type ClassDetailsViewModel = {
  dependencies: ClassConnection[]
  endpoints: AnalyzedEndpoint[]
  extendedTypes: string[]
  implementedInterfaces: string[]
  label: string
  methods: AnalyzedMethod[]
  packageName: string
  type: string
  usedBy: ClassConnection[]
}

export type MethodJumpTarget = {
  endLine: number
  jumpId: number
  methodName: string
  startLine: number
}
