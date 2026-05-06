import { useState } from 'react'

function App() {
  const [sequence, setSequence] = useState<any[]>([])

  return (
    <div className="flex h-screen flex-col bg-zinc-950 text-white overflow-hidden">
      {/* Top Bar */}
      <div className="h-12 border-b border-zinc-800 flex items-center px-4 bg-zinc-900">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-orange-500 rounded"></div>
          <span className="font-semibold text-lg">KhorVideo</span>
        </div>
        <div className="ml-auto text-xs text-zinc-400">Video Concat Tool • v0.1</div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left: Tree Pane */}
        <div className="w-64 border-r border-zinc-800 bg-zinc-900 p-3 flex flex-col">
          <div className="text-sm font-medium mb-2 text-zinc-400">FOLDERS</div>
          <div className="flex-1 text-sm text-zinc-400">
            Tree view coming soon...
          </div>
        </div>

        {/* Middle: Explorer Pane */}
        <div className="flex-1 flex flex-col border-r border-zinc-800">
          <div className="h-10 border-b border-zinc-800 flex items-center px-4 text-sm font-medium bg-zinc-900">
            Explorer • C:\Videos
          </div>
          <div className="flex-1 p-4 grid grid-cols-4 gap-4 overflow-auto">
            {[1,2,3,4,5,6,7,8].map(i => (
              <div key={i} className="bg-zinc-800 rounded-lg p-2 cursor-pointer hover:ring-2 hover:ring-orange-500">
                <div className="aspect-video bg-zinc-700 rounded mb-2 flex items-center justify-center">
                  <span className="text-xs text-zinc-500">Video {i}</span>
                </div>
                <div className="text-xs truncate">video_{i}.mp4</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sequence Pane (Horizontal) */}
      <div className="h-40 border-t border-zinc-800 bg-zinc-900 p-3 flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm font-medium text-zinc-400">SEQUENCE ({sequence.length})</div>
          <button className="px-3 py-1 text-xs bg-orange-600 hover:bg-orange-500 rounded">Run Concat</button>
        </div>
        <div className="flex-1 border border-zinc-700 rounded flex items-center justify-center text-zinc-400 text-sm">
          Drag videos here to build sequence
        </div>
      </div>

      {/* Status Bar */}
      <div className="h-7 border-t border-zinc-800 bg-zinc-900 px-4 flex items-center text-xs text-zinc-400">
        <div>Ready • 0 files selected</div>
        <div className="ml-auto">FFmpeg ready</div>
      </div>

      {/* Console */}
      <div className="h-48 border-t border-zinc-800 bg-black p-2 font-mono text-xs overflow-auto">
        <div className="text-emerald-400">[INFO] KhorVideo initialized</div>
        <div className="text-zinc-400">[INFO] Waiting for user input...</div>
      </div>
    </div>
  )
}

export default App