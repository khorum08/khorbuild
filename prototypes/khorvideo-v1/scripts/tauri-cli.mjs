#!/usr/bin/env node
import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const appRoot = path.resolve(scriptDir, '..')
const isWindows = process.platform === 'win32'
const tauriBin = path.join(appRoot, 'node_modules', '.bin', isWindows ? 'tauri.cmd' : 'tauri')
const args = process.argv.slice(2)

const normalizedArgs = args[0] === 'dev' && !args.includes('--no-watch') ? ['dev', '--no-watch', ...args.slice(1)] : args

const child = spawn(tauriBin, normalizedArgs, {
  cwd: appRoot,
  env: process.env,
  shell: isWindows,
  stdio: 'inherit',
  windowsVerbatimArguments: false,
})

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal)
    return
  }

  process.exit(code ?? 0)
})

child.on('error', (error) => {
  console.error(error)
  process.exit(1)
})
