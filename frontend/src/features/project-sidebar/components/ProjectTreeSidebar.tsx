import { useEffect, useMemo, useState } from 'react'
import type { MouseEvent as ReactMouseEvent } from 'react'

import { ChevronRightIcon, FileCodeIcon, FolderIcon } from '../../../assets/icons'
import { clampResizablePanelWidth } from '../../../components/ui/resizable-panel'
import type { GraphNode, GraphResponse } from '../../../types/graph'
import type { ProjectTreeNode } from '../types/project-tree'

type ProjectTreeSidebarProps = {
  graphResponse: GraphResponse
  onSelectNode: (node: GraphNode) => void
  selectedNodeId: string | null
}

const DEFAULT_SIDEBAR_WIDTH = 300

export function ProjectTreeSidebar({
  graphResponse,
  onSelectNode,
  selectedNodeId,
}: ProjectTreeSidebarProps) {
  const [width, setWidth] = useState(DEFAULT_SIDEBAR_WIDTH)
  const [isResizing, setIsResizing] = useState(false)

  const projectName = graphResponse.projectName ?? 'Untitled project'
  const tree = useMemo(() => buildProjectTree(graphResponse.nodes), [graphResponse.nodes])
  const [expandedFolderIds, setExpandedFolderIds] = useState<Set<string>>(
    () => new Set(collectFolderIds(tree)),
  )

  useEffect(() => {
    if (!isResizing) {
      return
    }

    function handleMouseMove(event: MouseEvent) {
      setWidth(clampResizablePanelWidth(event.clientX))
    }

    function handleMouseUp() {
      setIsResizing(false)
    }

    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isResizing])

  function startResize(event: ReactMouseEvent<HTMLDivElement>) {
    event.preventDefault()
    setIsResizing(true)
  }

  function toggleFolder(folderId: string) {
    setExpandedFolderIds((currentFolderIds) => {
      const nextFolderIds = new Set(currentFolderIds)

      if (nextFolderIds.has(folderId)) {
        nextFolderIds.delete(folderId)
      } else {
        nextFolderIds.add(folderId)
      }

      return nextFolderIds
    })
  }

  return (
    <aside
      className="relative flex h-screen shrink-0 flex-col border-r border-white/10 bg-[#0b1018] text-slate-200"
      style={{ width }}
    >
      <header className="border-b border-white/10 px-4 py-4">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">Project</p>
        <h2 className="mt-1 truncate text-sm font-semibold text-white">{projectName}</h2>
      </header>

      <div className="app-scrollbar flex-1 overflow-auto px-2 py-3">
        <div className="space-y-0.5">
          {tree.map((node) => (
            <ProjectTreeItem
              key={node.id}
              expandedFolderIds={expandedFolderIds}
              node={node}
              onSelectNode={onSelectNode}
              onToggleFolder={toggleFolder}
              selectedNodeId={selectedNodeId}
            />
          ))}
        </div>
      </div>

      <div className="border-t border-white/10 px-4 py-3 text-xs text-slate-500">
        {graphResponse.nodes.length} files · {graphResponse.edges.length} edges
      </div>

      <div
        className="absolute right-0 top-0 h-full w-1 cursor-col-resize transition hover:bg-cyan-400/50"
        onMouseDown={startResize}
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize project sidebar"
      />
    </aside>
  )
}

type ProjectTreeItemProps = {
  expandedFolderIds: Set<string>
  node: ProjectTreeNode
  onSelectNode: (node: GraphNode) => void
  onToggleFolder: (folderId: string) => void
  selectedNodeId: string | null
  depth?: number
}

function ProjectTreeItem({
  expandedFolderIds,
  node,
  onSelectNode,
  onToggleFolder,
  selectedNodeId,
  depth = 0,
}: ProjectTreeItemProps) {
  const isFolder = node.type === 'folder'
  const isExpanded = expandedFolderIds.has(node.id)
  const isSelected = node.graphNode?.id === selectedNodeId

  return (
    <div>
      <button
        className={`flex w-full min-w-0 items-center gap-1.5 rounded-md px-2 py-1.5 text-left text-sm transition hover:bg-white/[0.04] hover:text-white ${
          isSelected ? 'bg-cyan-400/10 text-cyan-100' : 'text-slate-300'
        }`}
        onClick={() => {
          if (isFolder) {
            onToggleFolder(node.id)
          } else if (node.graphNode) {
            onSelectNode(node.graphNode)
          }
        }}
        style={{ paddingLeft: 8 + depth * 14 }}
        type="button"
      >
        <span
          className={`text-slate-500 transition-transform ${
            isFolder && isExpanded ? 'rotate-90' : ''
          } ${isFolder ? '' : 'text-transparent'}`}
        >
          <ChevronRightIcon />
        </span>
        <span className={isFolder ? 'text-cyan-200/80' : 'text-slate-400'}>
          {isFolder ? <FolderIcon /> : <FileCodeIcon />}
        </span>
        <span className="truncate">{node.name}</span>
      </button>

      {isFolder && isExpanded && node.children.length > 0
        ? node.children.map((childNode) => (
            <ProjectTreeItem
              key={childNode.id}
              expandedFolderIds={expandedFolderIds}
              node={childNode}
              onSelectNode={onSelectNode}
              onToggleFolder={onToggleFolder}
              selectedNodeId={selectedNodeId}
              depth={depth + 1}
            />
          ))
        : null}
    </div>
  )
}

function buildProjectTree(nodes: GraphNode[]): ProjectTreeNode[] {
  const roots: ProjectTreeNode[] = []
  const sortedNodes = [...nodes].sort((firstNode, secondNode) =>
    firstNode.id.localeCompare(secondNode.id),
  )

  sortedNodes.forEach((graphNode) => {
    const packageParts = getPackageParts(graphNode)
    let currentLevel = roots
    let currentPath = ''

    packageParts.forEach((packagePart) => {
      currentPath = currentPath ? `${currentPath}.${packagePart}` : packagePart

      let folderNode = currentLevel.find(
        (node) => node.type === 'folder' && node.name === packagePart,
      )

      if (!folderNode) {
        folderNode = {
          id: currentPath,
          name: packagePart,
          type: 'folder',
          children: [],
        }
        currentLevel.push(folderNode)
      }

      currentLevel = folderNode.children
    })

    currentLevel.push({
      id: graphNode.id,
      name: graphNode.label,
      type: 'file',
      children: [],
      graphNode,
    })
  })

  return sortTree(roots)
}

function getPackageParts(graphNode: GraphNode) {
  if (graphNode.packageName) {
    return graphNode.packageName.split('.').filter(Boolean)
  }

  return graphNode.id.split('.').slice(0, -1).filter(Boolean)
}

function sortTree(nodes: ProjectTreeNode[]): ProjectTreeNode[] {
  return [...nodes]
    .sort((firstNode, secondNode) => {
      if (firstNode.type !== secondNode.type) {
        return firstNode.type === 'folder' ? -1 : 1
      }

      return firstNode.name.localeCompare(secondNode.name)
    })
    .map((node) => ({
      ...node,
      children: sortTree(node.children),
    }))
}

function collectFolderIds(nodes: ProjectTreeNode[]): string[] {
  return nodes.flatMap((node) => {
    if (node.type !== 'folder') {
      return []
    }

    return [node.id, ...collectFolderIds(node.children)]
  })
}
