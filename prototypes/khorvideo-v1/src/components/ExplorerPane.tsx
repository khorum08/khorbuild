import type { VideoFile } from '../types'

type ExplorerPaneProps = {
  activeFolder: string
  folderInput: string
  files: VideoFile[]
  isLoading: boolean
  onAddToSequence: (video: VideoFile) => void
  onFolderInputChange: (path: string) => void
  onLoadFolder: () => void
  onSelectFolder: () => void
}

export function ExplorerPane({
  activeFolder,
  folderInput,
  files,
  isLoading,
  onAddToSequence,
  onFolderInputChange,
  onLoadFolder,
  onSelectFolder,
}: ExplorerPaneProps) {
  return (
    <main className="explorer-pane">
      <div className="explorer-toolbar">
        <div className="explorer-title-block">
          <div className="pane-heading inline-heading">Explorer</div>
          <div className="path-label" title={activeFolder}>
            {activeFolder}
          </div>
        </div>
        <form
          className="path-form"
          onSubmit={(event) => {
            event.preventDefault()
            onLoadFolder()
          }}
        >
          <input
            aria-label="Folder path"
            className="path-input"
            onChange={(event) => onFolderInputChange(event.target.value)}
            placeholder="Enter folder path"
            value={folderInput}
          />
          <button
            className="secondary-button"
            disabled={isLoading}
            type="button"
            onClick={onSelectFolder}
          >
            {isLoading ? 'Loading…' : 'Load Folder'}
          </button>
        </form>
        <div className="toolbar-meta">{files.length} video files</div>
      </div>

      <section className="video-grid" aria-label="Video files">
        {files.length === 0 ? (
          <div className="empty-state full-grid">No video files found in this folder.</div>
        ) : (
          files.map((file) => (
            <article className="video-card" key={file.id}>
              <button className="thumbnail-button" type="button" onClick={() => onAddToSequence(file)}>
                <div className={`thumbnail-surface tone-${file.thumbnailTone}`}>
                  {file.thumbnailSrc ? (
                    <video
                      src={file.thumbnailSrc}
                      className="thumbnail-img"
                      muted
                      loop
                      playsInline
                      preload="auto"
                      onMouseEnter={(e) => void e.currentTarget.play()}
                      onMouseLeave={(e) => { e.currentTarget.pause(); e.currentTarget.currentTime = 0 }}
                    />
                  ) : (
                    <span className="play-glyph">▶</span>
                  )}
                  <span className="duration-chip">{file.durationLabel}</span>
                </div>
                <div className="file-card-body">
                  <div className="file-name" title={file.path}>
                    {file.name}
                  </div>
                  <div className="file-meta">
                    <span>.{file.extension}</span>
                    <span className={`audio-${file.audioStatus}`}>{file.audioStatus}</span>
                  </div>
                </div>
              </button>
            </article>
          ))
        )}
      </section>
    </main>
  )
}
