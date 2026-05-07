export type AudioStatus = 'unknown' | 'present' | 'missing'

export type VideoFile = {
  id: string
  name: string
  path: string
  extension: string
  durationLabel: string
  audioStatus: AudioStatus
  thumbnailTone: 'amber' | 'blue' | 'emerald' | 'purple' | 'rose' | 'slate'
}

export type DirectoryEntry = {
  name: string
  path: string
  extension: string | null
  isDirectory: boolean
  isVideo: boolean
}

export type ConsoleLine = {
  id: string
  level: 'info' | 'warn' | 'error' | 'success'
  message: string
}

export type FolderNode = {
  id: string
  label: string
  path: string
  depth: number
  active?: boolean
}

export type ProbeResult = {
  path: string
  hasAudio: boolean
}

export type ConcatResult = {
  command: string
  outputPath: string
  exitCode: number | null
  stdout: string
  stderr: string
}
