import type { GraphResponse } from '../../../types/graph'

type GraphApiResponse = Omit<GraphResponse, 'projectName'> & {
  project_name?: string | null
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
    edges: graphApiResponse.edges,
    projectName: graphApiResponse.project_name,
  }
}
