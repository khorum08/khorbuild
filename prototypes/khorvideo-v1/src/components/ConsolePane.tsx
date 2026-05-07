import type { ConsoleLine } from '../types'

type ConsolePaneProps = {
  lines: ConsoleLine[]
}

export function ConsolePane({ lines }: ConsolePaneProps) {
  return (
    <section className="console-pane" aria-label="Console output">
      {lines.map((line) => (
        <div className={`console-line ${line.level}`} key={line.id}>
          {line.message}
        </div>
      ))}
    </section>
  )
}
