import React from 'react'

interface GameInfoProps {
  statusMessage: string
  resetGame: () => void
  moveHistory: string[]
  game: any
}

const GameInfo = ({ statusMessage, resetGame, moveHistory, game }: GameInfoProps) => {
  return (
    <div className="flex-1 max-w-md space-y-4">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Chess Game</h2>

      <div className="space-y-2 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <p className="text-lg font-medium dark:text-gray-200">
          Status: <span className="font-semibold">{statusMessage}</span>
        </p>
        <p className="text-sm font-mono break-all bg-white dark:bg-gray-700 p-2 rounded">
          <span className="font-semibold">FEN:</span> {game.fen()}
        </p>
      </div>

      <button
        onClick={resetGame}
        className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors dark:bg-gray-700 dark:hover:bg-gray-600"
      >
        Reset Board
      </button>

      <div className="space-y-2">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Move History</h3>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 p-2 rounded overflow-y-auto max-h-80">
          {moveHistory.map((move, i) => (
            <div key={i} className="font-mono dark:text-gray-300">
              {i % 2 === 0 ? `${Math.floor(i / 2) + 1}.` : ''} {move}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default GameInfo