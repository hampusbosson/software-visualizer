export const MIN_RESIZABLE_PANEL_WIDTH = 220
export const MAX_RESIZABLE_PANEL_WIDTH = 520

export function clampResizablePanelWidth(width: number) {
  return Math.min(
    Math.max(width, MIN_RESIZABLE_PANEL_WIDTH),
    MAX_RESIZABLE_PANEL_WIDTH,
  )
}
