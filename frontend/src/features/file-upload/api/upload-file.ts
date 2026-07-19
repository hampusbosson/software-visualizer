import type { GraphEdge, GraphResponse } from '../../../types/graph'

type GraphApiResponse = Omit<GraphResponse, 'projectName'> & {
  edges: GraphApiEdge[]
  project_name?: string | null
}

type GraphApiEdge =
  | GraphEdge
  | {
      from: string
      to: string
      type?: string
    }

export async function analyzeFile(file: File): Promise<GraphResponse> {
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch('/api/analysis/upload', {
    method: 'POST',
    body: formData,
  })

  if (response.status !== 201) {
    const errorText = await response.text()
    throw new Error(errorText || `Analysis failed with status ${response.status}`)
  }

  const graphApiResponse = (await response.json()) as GraphApiResponse

  console.log(graphApiResponse);

  return {
    nodes: graphApiResponse.nodes,
    edges: graphApiResponse.edges.map(normalizeEdge),
    projectName: graphApiResponse.project_name,
  }
}

function normalizeEdge(edge: GraphApiEdge): GraphEdge {
  if ('source' in edge && 'target' in edge) {
    return edge
  }

  return {
    source: edge.from,
    target: edge.to,
    type: edge.type,
  }
}
