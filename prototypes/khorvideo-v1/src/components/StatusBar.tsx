type StatusBarProps = {
  selectedCount: number
  hasAudioWarnings: boolean
  isLoadingDirectory: boolean
  isRunningConcat: boolean
}

export function StatusBar({ selectedCount, hasAudioWarnings, isLoadingDirectory, isRunningConcat }: StatusBarProps) {
  const statusText = isRunningConcat
    ? 'Running FFmpeg concat…'
    : isLoadingDirectory
      ? 'Loading folder…'
      : selectedCount === 0
        ? 'Ready'
        : `Ready • ${selectedCount} staged file${selectedCount === 1 ? '' : 's'}`

  return (
    <footer className="status-bar">
      <div>{statusText}</div>
      <div className={hasAudioWarnings ? 'status-warning' : 'status-ok'}>
        {hasAudioWarnings ? 'Audio warning: one or more clips have no detected audio' : 'FFmpeg / ffprobe controls available'}
      </div>
    </footer>
  )
}
