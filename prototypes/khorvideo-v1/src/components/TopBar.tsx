export function TopBar() {
  return (
    <header className="top-bar">
      <div className="brand-lockup" aria-label="KhorVideo">
        <div className="brand-mark" />
        <div>
          <div className="brand-title">KhorVideo</div>
          <div className="brand-subtitle">FFmpeg concat workflow prototype</div>
        </div>
      </div>
      <div className="version-pill">Video Concat Tool • v0.1</div>
    </header>
  )
}
