import { convertFileSrc, invoke } from '@tauri-apps/api/core'
import { listen } from '@tauri-apps/api/event'
import { open } from '@tauri-apps/plugin-dialog'
import type { ConcatResult, DirectoryEntry, DurationResult, ProbeResult } from '../types'

type WindowWithTauri = Window & {
  __TAURI_INTERNALS__?: unknown
}

export const isRunningInTauri = () => typeof window !== 'undefined' && '__TAURI_INTERNALS__' in (window as WindowWithTauri)

export async function openFolderDialog(defaultPath?: string): Promise<string | null> {
  const result = await open({ directory: true, multiple: false, defaultPath })
  return typeof result === 'string' ? result : null
}

export async function getHomeDir(): Promise<string> {
  return invoke<string>('get_home_dir')
}

export async function listDirectory(path: string): Promise<DirectoryEntry[]> {
  return invoke<DirectoryEntry[]>('list_directory', { path })
}

export async function probeAudio(path: string): Promise<ProbeResult> {
  return invoke<ProbeResult>('probe_audio', { path })
}

export async function probeDurations(paths: string[]): Promise<DurationResult[]> {
  return invoke<DurationResult[]>('probe_durations', { paths })
}

export async function requestThumbnails(paths: string[], generation: number): Promise<void> {
  return invoke('request_thumbnails', { paths, generation })
}

export async function onThumbnailReady(
  handler: (path: string, thumbSrc: string) => void,
): Promise<() => void> {
  return listen<{ path: string; thumbPath: string }>('thumbnail:ready', (event) => {
    handler(event.payload.path, convertFileSrc(event.payload.thumbPath))
  })
}

export async function onThumbnailError(
  handler: (path: string, error: string) => void,
): Promise<() => void> {
  return listen<{ path: string; error: string }>('thumbnail:error', (event) => {
    handler(event.payload.path, event.payload.error)
  })
}

export async function runConcat(inputPaths: string[], outputPath: string): Promise<ConcatResult> {
  return invoke<ConcatResult>('run_concat', {
    job: {
      inputPaths,
      outputPath,
    },
  })
}

export async function onConcatLog(
  handler: (stream: 'stdout' | 'stderr', line: string) => void,
): Promise<() => void> {
  return listen<{ stream: 'stdout' | 'stderr'; line: string }>('concat:log', (event) => {
    handler(event.payload.stream, event.payload.line)
  })
}
