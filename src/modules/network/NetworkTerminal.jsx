import { useEffect, useRef, useState } from 'react'
import useNetworkTrainingStore from '../../store/useNetworkTrainingStore.js'
import {
  getTerminalPrompt,
  NETWORK_TERMINAL_TYPES,
} from './terminalCommands.js'

const historyFields = Object.freeze({
  [NETWORK_TERMINAL_TYPES.ROUTER]: 'routerTerminalHistory',
  [NETWORK_TERMINAL_TYPES.SWITCH]: 'switchTerminalHistory',
  [NETWORK_TERMINAL_TYPES.WORKSTATION]: 'workstationTerminalHistory',
})

export default function NetworkTerminal({ terminalType, title }) {
  const [command, setCommand] = useState('')
  const [historyCursor, setHistoryCursor] = useState(-1)
  const inputRef = useRef(null)
  const outputRef = useRef(null)
  const history = useNetworkTrainingStore(
    (state) => state[historyFields[terminalType]],
  )
  const prompt = useNetworkTrainingStore((state) =>
    getTerminalPrompt(terminalType, state),
  )
  const executeNetworkCommand = useNetworkTrainingStore(
    (state) => state.executeNetworkCommand,
  )
  const closeNetworkOverlay = useNetworkTrainingStore(
    (state) => state.closeNetworkOverlay,
  )

  useEffect(() => {
    inputRef.current?.focus()
  }, [terminalType])

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight
    }
  }, [history])

  const submitCommand = () => {
    if (!command.trim()) {
      return
    }

    executeNetworkCommand(terminalType, command)
    setCommand('')
    setHistoryCursor(-1)
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    submitCommand()
  }

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      submitCommand()
      return
    }

    if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') {
      return
    }

    event.preventDefault()
    const commandHistory = history.map((entry) => entry.command)

    if (!commandHistory.length) {
      return
    }

    const nextCursor = event.key === 'ArrowUp'
      ? Math.min(historyCursor + 1, commandHistory.length - 1)
      : Math.max(historyCursor - 1, -1)

    setHistoryCursor(nextCursor)
    setCommand(
      nextCursor === -1
        ? ''
        : commandHistory[commandHistory.length - 1 - nextCursor],
    )
  }

  return (
    <section
      className="network-terminal-window"
      role="dialog"
      aria-modal="false"
      aria-labelledby="network-terminal-title"
    >
      <header className="network-window-header network-terminal-header">
        <div>
          <span>Controlled Training Console</span>
          <h2 id="network-terminal-title">{title}</h2>
        </div>
        <button
          type="button"
          className="network-window-close"
          onClick={closeNetworkOverlay}
          aria-label={`Close ${title}`}
        >
          ×
        </button>
      </header>

      <div
        ref={outputRef}
        className="network-terminal-output"
        aria-live="polite"
        onClick={() => inputRef.current?.focus()}
      >
        {history.length === 0 && (
          <p className="network-terminal-banner">
            TeleSim educational terminal. Only training commands are supported.
          </p>
        )}
        {history.map((entry) => (
          <div key={entry.id} className="network-terminal-entry">
            <div>
              <span>{entry.prompt}</span>
              <b>{entry.command}</b>
            </div>
            {entry.output && <pre>{entry.output}</pre>}
          </div>
        ))}
      </div>

      <form className="network-terminal-input-row" onSubmit={handleSubmit}>
        <label htmlFor={`network-terminal-input-${terminalType}`}>{prompt}</label>
        <input
          ref={inputRef}
          id={`network-terminal-input-${terminalType}`}
          type="text"
          value={command}
          onChange={(event) => setCommand(event.target.value)}
          onKeyDown={handleKeyDown}
          autoComplete="off"
          spellCheck="false"
          aria-label={`${title} command input`}
        />
        <button type="submit">Execute</button>
      </form>
    </section>
  )
}
