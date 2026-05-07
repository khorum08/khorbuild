#!/usr/bin/env node
import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const isWindows = process.platform === 'win32'
const executable = path.join(appRoot, 'node_modules', '.bin', isWindows ? 'tauri.cmd' : 'tauri')
const inputArgs = process.argv.slice(2)
const args = inputArgs[0] === 'dev' && !inputArgs.includes('--no-watch') ? ['dev', '--no-watch', ...inputArgs.slice(1)] : inputArgs

const child = spawn(executable, args, {
  cwd: appRoot,
  env: process.env,
  shell: isWindows,
  stdio: 'inherit',
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
