import type { FolderNode, VideoFile } from '../types'

export const mockFolders: FolderNode[] = [
  { id: 'videos', label: 'Videos', path: 'C:\\Videos', depth: 0, active: true },
  { id: 'captures', label: 'Captures', path: 'C:\\Videos\\Captures', depth: 1 },
  { id: 'exports', label: 'Exports', path: 'C:\\Videos\\Exports', depth: 1 },
  { id: 'projects', label: 'Projects', path: 'D:\\Khorum\\Projects', depth: 0 },
]

export const mockVideos: VideoFile[] = [
  {
    id: 'clip-001',
    name: 'intro_take_01.mp4',
    path: 'C:\\Videos\\intro_take_01.mp4',
    extension: 'mp4',
    durationLabel: '00:18',
    audioStatus: 'present',
    thumbnailTone: 'amber',
  },
  {
    id: 'clip-002',
    name: 'screen_capture_main.mov',
    path: 'C:\\Videos\\screen_capture_main.mov',
    extension: 'mov',
    durationLabel: '02:41',
    audioStatus: 'present',
    thumbnailTone: 'blue',
  },
  {
    id: 'clip-003',
    name: 'b_roll_workshop.mkv',
    path: 'C:\\Videos\\b_roll_workshop.mkv',
    extension: 'mkv',
    durationLabel: '01:09',
    audioStatus: 'missing',
    thumbnailTone: 'emerald',
  },
  {
    id: 'clip-004',
    name: 'closing_card.mp4',
    path: 'C:\\Videos\\closing_card.mp4',
    extension: 'mp4',
    durationLabel: '00:12',
    audioStatus: 'present',
    thumbnailTone: 'purple',
  },
]
