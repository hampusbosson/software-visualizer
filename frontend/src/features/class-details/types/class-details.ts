import type { AnalyzedEndpoint, AnalyzedMethod } from '../../../types/graph'

export type ClassDetailsViewModel = {
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

export type MethodJumpTarget = {
  endLine: number
  jumpId: number
  methodName: string
  startLine: number
}
