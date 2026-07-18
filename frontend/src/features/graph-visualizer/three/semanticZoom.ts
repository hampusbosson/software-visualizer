export type SemanticZoomLevel = 'far' | 'medium' | 'near'

export const SEMANTIC_ZOOM_THRESHOLDS = {
  far: 22,
  near: 10,
}

export function getSemanticZoomLevel(distance: number): SemanticZoomLevel {
  if (distance > SEMANTIC_ZOOM_THRESHOLDS.far) {
    return 'far'
  }

  if (distance < SEMANTIC_ZOOM_THRESHOLDS.near) {
    return 'near'
  }

  return 'medium'
}
