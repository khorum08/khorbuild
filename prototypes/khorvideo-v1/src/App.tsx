import { useState } from 'react'

function App() {
  return (
    <div className="flex h-screen flex-col bg-zinc-950 text-white">
      {/* Top Bar */}
      <div className="h-12 border-b border-zinc-800 flex items-center px-4">
        <h1 className="font-semibold">KhorVideo</h1>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left: Tree Pane */}
        <div className="w-64 border-r border-zinc-800 p-2">
          <div className="text-sm font-medium mb-2">Folders</div>
          <div className="text-zinc-400 text-sm">Tree view coming soon...</div>
        </div>

        {/* Middle: Explorer Pane */}
        <div className="flex-1 p-4">
          <div className="text-sm font-medium mb-2">Explorer</div>
          <div className="text-zinc-400 text-sm">File grid with thumbnails coming soon...</div>
        </div>
      </div>

      {/* Sequence Pane (Horizontal) */}
      <div className="h-48 border-t border-zinc-800 p-4">
        <div className="text-sm font-medium mb-2">Sequence</div>
        <div className="text-zinc-400 text-sm">Drag & drop area coming soon...</div>
      </div>

      {/* Status Bar */}
      <div className="h-8 border-t border-zinc-800 px-4 flex items-center text-xs text-zinc-400">
        Ready
      </div>

      {/* Console */}
      <div className="h-48 border-t border-zinc-800 p-2 font-mono text-xs overflow-auto">
        <div className="text-emerald-400">[INFO] KhorVideo initialized</div>
      </div>
    </div>
  )
}

export default App