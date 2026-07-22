import type { SourceCodeResponse } from '../types/source-code'

const sourceCodeCache = new Map<string, SourceCodeResponse>()
const pendingSourceCodeRequests = new Map<string, Promise<SourceCodeResponse>>()

export async function fetchClassSourceCode(
  analysisId: string,
  nodeId: string,
): Promise<SourceCodeResponse> {
  const cacheKey = createSourceCodeCacheKey(analysisId, nodeId)
  const cachedSourceCode = sourceCodeCache.get(cacheKey)

  if (cachedSourceCode) {
    return cachedSourceCode
  }

  const pendingRequest = pendingSourceCodeRequests.get(cacheKey)

  if (pendingRequest) {
    return pendingRequest
  }

  const request = requestClassSourceCode(analysisId, nodeId)
    .then((sourceCodeResponse) => {
      sourceCodeCache.set(cacheKey, sourceCodeResponse)
      pendingSourceCodeRequests.delete(cacheKey)

      return sourceCodeResponse
    })
    .catch((error: unknown) => {
      pendingSourceCodeRequests.delete(cacheKey)
      throw error
    })

  pendingSourceCodeRequests.set(cacheKey, request)

  return request
}

function createSourceCodeCacheKey(analysisId: string, nodeId: string) {
  return `${analysisId}:${nodeId}`
}

async function requestClassSourceCode(
  analysisId: string,
  nodeId: string,
): Promise<SourceCodeResponse> {
  const searchParams = new URLSearchParams({ nodeId })
  const response = await fetch(
    `/api/analysis/${encodeURIComponent(analysisId)}/source?${searchParams.toString()}`,
  )

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(errorText || `Source code request failed with status ${response.status}`)
  }

  return (await response.json()) as SourceCodeResponse
}
