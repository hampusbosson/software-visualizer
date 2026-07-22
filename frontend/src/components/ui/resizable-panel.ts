export const MIN_RESIZABLE_PANEL_WIDTH = 220
export const MAX_RESIZABLE_PANEL_WIDTH = 520

type ClampResizablePanelWidthOptions = {
  maxWidth?: number
  minWidth?: number
}

export function clampResizablePanelWidth(
  width: number,
  options: ClampResizablePanelWidthOptions = {},
) {
  const minWidth = options.minWidth ?? MIN_RESIZABLE_PANEL_WIDTH
  const maxWidth = options.maxWidth ?? MAX_RESIZABLE_PANEL_WIDTH

  return Math.min(
    Math.max(width, minWidth),
    maxWidth,
  )
}
