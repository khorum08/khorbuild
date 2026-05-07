import { invoke } from '@tauri-apps/api/core'
import type { ConcatResult, DirectoryEntry, ProbeResult } from '../types'

type WindowWithTauri = Window & {
  __TAURI_INTERNALS__?: unknown
}

export const isRunningInTauri = () => typeof window !== 'undefined' && '__TAURI_INTERNALS__' in (window as WindowWithTauri)

export async function getHomeDir(): Promise<string> {
  return invoke<string>('get_home_dir')
}

export async function listDirectory(path: string): Promise<DirectoryEntry[]> {
  return invoke<DirectoryEntry[]>('list_directory', { path })
}

export async function probeAudio(path: string): Promise<ProbeResult> {
  return invoke<ProbeResult>('probe_audio', { path })
}

export async function runConcat(inputPaths: string[], outputPath: string): Promise<ConcatResult> {
  return invoke<ConcatResult>('run_concat', {
    job: {
      inputPaths,
      outputPath,
    },
  })
}
