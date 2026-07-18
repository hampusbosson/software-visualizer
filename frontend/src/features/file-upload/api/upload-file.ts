import type { GraphResponse } from '../../../types/graph'

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

  const grapResponse: GraphResponse = await response.json();

  console.log(grapResponse);

  return grapResponse
}
