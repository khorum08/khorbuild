import { create } from 'zustand'
import { listDirectory, probeAudio, runConcat } from '../lib/tauriApi'
import { mockFolders, mockVideos } from '../data/mockVideos'
import type { ConsoleLine, ConcatResult, DirectoryEntry, FolderNode, VideoFile } from '../types'

type KhorVideoState = {
  activeFolder: string
  folderInput: string
  outputPath: string
  folders: FolderNode[]
  explorerFiles: VideoFile[]
  sequence: VideoFile[]
  consoleLines: ConsoleLine[]
  isLoadingDirectory: boolean
  isRunningConcat: boolean
  lastConcatResult: ConcatResult | null
  setFolderInput: (path: string) => void
  setOutputPath: (path: string) => void
  loadDirectory: (path?: string) => Promise<void>
  openFolder: (path: string) => Promise<void>
  addToSequence: (video: VideoFile) => void
  removeFromSequence: (videoId: string) => void
  moveSequenceItem: (fromIndex: number, toIndex: number) => void
  clearSequence: () => void
  probeSequenceAudio: () => Promise<void>
  runSequenceConcat: () => Promise<void>
}

const initialConsoleLines: ConsoleLine[] = [
  { id: 'boot-001', level: 'success', message: '[INFO] KhorVideo initialized' },
  { id: 'boot-002', level: 'info', message: '[INFO] Enter a folder path and click Load Folder to browse real files in Tauri' },
]

const thumbnailTones: VideoFile['thumbnailTone'][] = ['amber', 'blue', 'emerald', 'purple', 'rose', 'slate']

const createLogLine = (level: ConsoleLine['level'], message: string): ConsoleLine => ({
  id: `${level}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
  level,
  message,
})

const directoryEntryToVideoFile = (entry: DirectoryEntry, index: number): VideoFile => ({
  id: entry.path,
  name: entry.name,
  path: entry.path,
  extension: entry.extension ?? 'video',
  durationLabel: '--:--',
  audioStatus: 'unknown',
  thumbnailTone: thumbnailTones[index % thumbnailTones.length],
})

const directoryEntryToFolderNode = (entry: DirectoryEntry): FolderNode => ({
  id: entry.path,
  label: entry.name,
  path: entry.path,
  depth: 0,
})

const reorder = <T>(items: T[], fromIndex: number, toIndex: number) => {
  if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0 || fromIndex >= items.length || toIndex >= items.length) {
    return items
  }

  const nextItems = [...items]
  const [moved] = nextItems.splice(fromIndex, 1)
  nextItems.splice(toIndex, 0, moved)
  return nextItems
}

export const useKhorVideoStore = create<KhorVideoState>((set, get) => ({
  activeFolder: 'C:\\Videos',
  folderInput: 'C:\\Videos',
  outputPath: 'C:\\Videos\\khorvideo-concat-output.mp4',
  folders: mockFolders,
  explorerFiles: mockVideos,
  sequence: [],
  consoleLines: initialConsoleLines,
  isLoadingDirectory: false,
  isRunningConcat: false,
  lastConcatResult: null,
  setFolderInput: (path) => set({ folderInput: path }),
  setOutputPath: (path) => set({ outputPath: path }),
  loadDirectory: async (path) => {
    const requestedPath = (path ?? get().folderInput).trim()

    if (!requestedPath) {
      set((state) => ({
        consoleLines: [...state.consoleLines, createLogLine('warn', '[WARN] Folder path is empty')],
      }))
      return
    }

    set((state) => ({
      isLoadingDirectory: true,
      consoleLines: [...state.consoleLines, createLogLine('info', `[INFO] Loading folder: ${requestedPath}`)],
    }))

    try {
      const entries = await listDirectory(requestedPath)
      const folders = entries.filter((entry) => entry.isDirectory).map(directoryEntryToFolderNode)
      const videos = entries.filter((entry) => entry.isVideo).map(directoryEntryToVideoFile)

      set((state) => ({
        activeFolder: requestedPath,
        folderInput: requestedPath,
        folders: [{ id: requestedPath, label: requestedPath, path: requestedPath, depth: 0, active: true }, ...folders],
        explorerFiles: videos,
        isLoadingDirectory: false,
        consoleLines: [
          ...state.consoleLines,
          createLogLine('success', `[INFO] Loaded ${videos.length} video file${videos.length === 1 ? '' : 's'} from ${requestedPath}`),
        ],
      }))
    } catch (error) {
      set((state) => ({
        isLoadingDirectory: false,
        consoleLines: [
          ...state.consoleLines,
          createLogLine('error', `[ERROR] Failed to load folder: ${error instanceof Error ? error.message : String(error)}`),
        ],
      }))
    }
  },
  openFolder: async (path) => {
    set({ folderInput: path })
    await get().loadDirectory(path)
  },
  addToSequence: (video) =>
    set((state) => {
      if (state.sequence.some((item) => item.path === video.path)) {
        return {
          consoleLines: [
            ...state.consoleLines,
            createLogLine('warn', `[WARN] ${video.name} is already in the sequence`),
          ],
        }
      }

      return {
        sequence: [...state.sequence, video],
        consoleLines: [
          ...state.consoleLines,
          createLogLine('info', `[INFO] Added ${video.name} to concat sequence`),
        ],
      }
    }),
  removeFromSequence: (videoId) =>
    set((state) => {
      const removed = state.sequence.find((item) => item.id === videoId)

      return {
        sequence: state.sequence.filter((item) => item.id !== videoId),
        consoleLines: removed
          ? [...state.consoleLines, createLogLine('info', `[INFO] Removed ${removed.name} from concat sequence`)]
          : state.consoleLines,
      }
    }),
  moveSequenceItem: (fromIndex, toIndex) =>
    set((state) => ({
      sequence: reorder(state.sequence, fromIndex, toIndex),
      consoleLines:
        fromIndex === toIndex
          ? state.consoleLines
          : [...state.consoleLines, createLogLine('info', `[INFO] Moved sequence item ${fromIndex + 1} to position ${toIndex + 1}`)],
    })),
  clearSequence: () =>
    set((state) => ({
      sequence: [],
      lastConcatResult: null,
      consoleLines: [...state.consoleLines, createLogLine('info', '[INFO] Cleared concat sequence')],
    })),
  probeSequenceAudio: async () => {
    const sequence = get().sequence

    if (sequence.length === 0) {
      set((state) => ({
        consoleLines: [...state.consoleLines, createLogLine('warn', '[WARN] No sequence files to probe')],
      }))
      return
    }

    set((state) => ({
      consoleLines: [...state.consoleLines, createLogLine('info', `[INFO] Probing audio tracks for ${sequence.length} file(s)`)],
    }))

    try {
      const results = await Promise.all(sequence.map((file) => probeAudio(file.path)))
      set((state) => ({
        sequence: state.sequence.map((file) => {
          const result = results.find((item) => item.path === file.path)
          return result ? { ...file, audioStatus: result.hasAudio ? 'present' : 'missing' } : file
        }),
        consoleLines: [
          ...state.consoleLines,
          createLogLine(
            results.some((result) => !result.hasAudio) ? 'warn' : 'success',
            `[INFO] Audio probe complete: ${results.filter((result) => !result.hasAudio).length} file(s) without audio`,
          ),
        ],
      }))
    } catch (error) {
      set((state) => ({
        consoleLines: [
          ...state.consoleLines,
          createLogLine('error', `[ERROR] Audio probe failed: ${error instanceof Error ? error.message : String(error)}`),
        ],
      }))
    }
  },
  runSequenceConcat: async () => {
    const { outputPath, sequence } = get()

    if (sequence.length < 2) {
      set((state) => ({
        consoleLines: [...state.consoleLines, createLogLine('warn', '[WARN] Add at least two videos before running concat')],
      }))
      return
    }

    if (!outputPath.trim()) {
      set((state) => ({
        consoleLines: [...state.consoleLines, createLogLine('warn', '[WARN] Output path is empty')],
      }))
      return
    }

    set((state) => ({
      isRunningConcat: true,
      lastConcatResult: null,
      consoleLines: [...state.consoleLines, createLogLine('info', `[INFO] Starting FFmpeg concat to ${outputPath}`)],
    }))

    try {
      const result = await runConcat(
        sequence.map((file) => file.path),
        outputPath,
      )

      set((state) => ({
        isRunningConcat: false,
        lastConcatResult: result,
        consoleLines: [
          ...state.consoleLines,
          createLogLine(result.exitCode === 0 ? 'success' : 'error', `[INFO] FFmpeg exited with code ${result.exitCode ?? 'unknown'}`),
          createLogLine('info', `[CMD] ${result.command}`),
          ...(result.stderr ? [createLogLine(result.exitCode === 0 ? 'info' : 'error', result.stderr)] : []),
          ...(result.stdout ? [createLogLine('info', result.stdout)] : []),
        ],
      }))
    } catch (error) {
      set((state) => ({
        isRunningConcat: false,
        consoleLines: [
          ...state.consoleLines,
          createLogLine('error', `[ERROR] FFmpeg concat failed: ${error instanceof Error ? error.message : String(error)}`),
        ],
      }))
    }
  },
}))
