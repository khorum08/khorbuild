import type { VideoFile } from '../types'

type SequencePaneProps = {
  sequence: VideoFile[]
  outputPath: string
  isRunning: boolean
  onRemove: (videoId: string) => void
  onClear: () => void
  onMove: (fromIndex: number, toIndex: number) => void
  onProbeAudio: () => void
  onRunConcat: () => void
  onOutputPathChange: (path: string) => void
}

export function SequencePane({
  sequence,
  outputPath,
  isRunning,
  onRemove,
  onClear,
  onMove,
  onProbeAudio,
  onRunConcat,
  onOutputPathChange,
}: SequencePaneProps) {
  return (
    <section className="sequence-pane" aria-label="Concat sequence">
      <div className="sequence-header">
        <div>
          <div className="pane-heading inline-heading">Sequence ({sequence.length})</div>
          <div className="sequence-hint">Add videos, drag or arrow-reorder them, probe audio, then run FFmpeg concat.</div>
        </div>
        <div className="sequence-output">
          <input
            aria-label="Output video path"
            className="path-input output-input"
            onChange={(event) => onOutputPathChange(event.target.value)}
            placeholder="Output video path"
            value={outputPath}
          />
        </div>
        <div className="sequence-actions">
          <button className="secondary-button" type="button" onClick={onClear} disabled={sequence.length === 0 || isRunning}>
            Clear
          </button>
          <button className="secondary-button" type="button" onClick={onProbeAudio} disabled={sequence.length === 0 || isRunning}>
            Probe Audio
          </button>
          <button className="primary-button" type="button" onClick={onRunConcat} disabled={sequence.length < 2 || isRunning}>
            {isRunning ? 'Running…' : 'Run Concat'}
          </button>
        </div>
      </div>

      <div className={`sequence-strip${sequence.length === 0 ? ' empty' : ''}`}>
        {sequence.length === 0 ? (
          <div className="empty-state">Add at least two videos to build a concat command.</div>
        ) : (
          sequence.map((file, index) => (
            <div
              className="sequence-item"
              draggable
              key={file.id}
              onDragOver={(event) => event.preventDefault()}
              onDragStart={(event) => event.dataTransfer.setData('text/plain', String(index))}
              onDrop={(event) => {
                event.preventDefault()
                const fromIndex = Number(event.dataTransfer.getData('text/plain'))
                if (Number.isInteger(fromIndex)) {
                  onMove(fromIndex, index)
                }
              }}
            >
              <div className="sequence-index">{index + 1}</div>
              <div className={`sequence-thumb tone-${file.thumbnailTone}`}>
                {file.thumbnailSrc ? (
                  <img src={file.thumbnailSrc} alt={file.name} className="sequence-thumb-img" />
                ) : (
                  '▶'
                )}
              </div>
              <div className="sequence-copy">
                <div className="file-name" title={file.path}>
                  {file.name}
                </div>
                <div className="file-meta">
                  <span>{file.durationLabel}</span>
                  <span className={`audio-${file.audioStatus}`}>{file.audioStatus}</span>
                </div>
              </div>
              <div className="reorder-actions" aria-label={`Reorder ${file.name}`}>
                <button className="mini-button" disabled={index === 0} type="button" onClick={() => onMove(index, index - 1)}>
                  ↑
                </button>
                <button className="mini-button" disabled={index === sequence.length - 1} type="button" onClick={() => onMove(index, index + 1)}>
                  ↓
                </button>
              </div>
              <button className="icon-button" type="button" onClick={() => onRemove(file.id)} aria-label={`Remove ${file.name}`}>
                ×
              </button>
            </div>
          ))
        )}
      </div>
    </section>
  )
}
