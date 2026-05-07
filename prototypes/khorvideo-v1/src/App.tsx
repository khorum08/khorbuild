import { useEffect } from 'react'
import { ConsolePane } from './components/ConsolePane'
import { ExplorerPane } from './components/ExplorerPane'
import { SequencePane } from './components/SequencePane'
import { StatusBar } from './components/StatusBar'
import { TopBar } from './components/TopBar'
import { TreePane } from './components/TreePane'
import { useKhorVideoStore } from './store/useKhorVideoStore'

function App() {
  const activeFolder = useKhorVideoStore((state) => state.activeFolder)
  const folderInput = useKhorVideoStore((state) => state.folderInput)
  const outputPath = useKhorVideoStore((state) => state.outputPath)
  const folders = useKhorVideoStore((state) => state.folders)
  const explorerFiles = useKhorVideoStore((state) => state.explorerFiles)
  const sequence = useKhorVideoStore((state) => state.sequence)
  const consoleLines = useKhorVideoStore((state) => state.consoleLines)
  const isLoadingDirectory = useKhorVideoStore((state) => state.isLoadingDirectory)
  const isRunningConcat = useKhorVideoStore((state) => state.isRunningConcat)
  const setFolderInput = useKhorVideoStore((state) => state.setFolderInput)
  const setOutputPath = useKhorVideoStore((state) => state.setOutputPath)
  const loadDirectory = useKhorVideoStore((state) => state.loadDirectory)
  const openFolder = useKhorVideoStore((state) => state.openFolder)
  const addToSequence = useKhorVideoStore((state) => state.addToSequence)
  const removeFromSequence = useKhorVideoStore((state) => state.removeFromSequence)
  const moveSequenceItem = useKhorVideoStore((state) => state.moveSequenceItem)
  const clearSequence = useKhorVideoStore((state) => state.clearSequence)
  const probeSequenceAudio = useKhorVideoStore((state) => state.probeSequenceAudio)
  const runSequenceConcat = useKhorVideoStore((state) => state.runSequenceConcat)
  const init = useKhorVideoStore((state) => state.init)
  const hasAudioWarnings = sequence.some((file) => file.audioStatus === 'missing')

  useEffect(() => { void init() }, [])

  return (
    <div className="app-shell">
      <TopBar />

      <div className="workspace">
        <TreePane folders={folders} isLoading={isLoadingDirectory} onOpenFolder={(path) => void openFolder(path)} />
        <ExplorerPane
          activeFolder={activeFolder}
          files={explorerFiles}
          folderInput={folderInput}
          isLoading={isLoadingDirectory}
          onAddToSequence={addToSequence}
          onFolderInputChange={setFolderInput}
          onLoadFolder={() => void loadDirectory()}
        />
      </div>

      <SequencePane
        isRunning={isRunningConcat}
        onClear={clearSequence}
        onMove={moveSequenceItem}
        onOutputPathChange={setOutputPath}
        onProbeAudio={() => void probeSequenceAudio()}
        onRemove={removeFromSequence}
        onRunConcat={() => void runSequenceConcat()}
        outputPath={outputPath}
        sequence={sequence}
      />
      <StatusBar
        hasAudioWarnings={hasAudioWarnings}
        isLoadingDirectory={isLoadingDirectory}
        isRunningConcat={isRunningConcat}
        selectedCount={sequence.length}
      />
      <ConsolePane lines={consoleLines} />
    </div>
  )
}

export default App
