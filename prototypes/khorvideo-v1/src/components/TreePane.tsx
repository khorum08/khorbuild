import type { FolderNode } from '../types'

type TreePaneProps = {
  folders: FolderNode[]
  isLoading: boolean
  onOpenFolder: (path: string) => void
}

export function TreePane({ folders, isLoading, onOpenFolder }: TreePaneProps) {
  return (
    <aside className="tree-pane">
      <div className="pane-heading">Folders</div>
      <nav className="folder-tree" aria-label="Folder tree">
        {folders.map((folder) => (
          <button
            className={`folder-row${folder.active ? ' active' : ''}`}
            disabled={isLoading}
            key={folder.id}
            onClick={() => onOpenFolder(folder.path)}
            style={{ paddingLeft: `${12 + folder.depth * 18}px` }}
            type="button"
          >
            <span className="folder-icon">▸</span>
            <span className="folder-label" title={folder.path}>
              {folder.label}
            </span>
          </button>
        ))}
      </nav>
      <div className="pane-note">Load a folder path, then click child folders here to navigate.</div>
    </aside>
  )
}
