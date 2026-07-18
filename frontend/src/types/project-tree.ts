import type { GraphNode } from './graph'

export type ProjectTreeNodeType = 'folder' | 'file'

export type ProjectTreeNode = {
  id: string
  name: string
  type: ProjectTreeNodeType
  children: ProjectTreeNode[]
  graphNode?: GraphNode
}
