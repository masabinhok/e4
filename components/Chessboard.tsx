'use client';

import { useState } from 'react';
import { Chess, Move } from 'chess.js';
import { Chessboard } from 'react-chessboard';

type GameStatus = 'active' | 'checkmate' | 'draw' | 'stalemate';

export default function ChessGame() {
  const [game, setGame] = useState<Chess>(new Chess());
  const [moveHistory, setMoveHistory] = useState<string[]>([]);

  const gameStatus = (): GameStatus => {
    if (game.isCheckmate()) return 'checkmate';
    if (game.isDraw() || game.isStalemate()) return 'draw';
    return 'active';
  };

  const resetGame = (): void => {
    const newGame = new Chess();
    setGame(newGame);
    setMoveHistory([]);
  };

  const makeRandomMove = (): void => {
    const possibleMoves = game.moves();
    if (gameStatus() !== 'active' || possibleMoves.length === 0) return;

    const randomIndex = Math.floor(Math.random() * possibleMoves.length);
    makeAMove(possibleMoves[randomIndex]);
  };

  const makeAMove = (move: string | Move): boolean => {
    try {
      const gameCopy = new Chess(game.fen());
      const result = gameCopy.move(move);

      if (!result) return false; // Handle invalid moves

      setGame(gameCopy);
      setMoveHistory(prev => [...prev, result.san]);

      return true;
    } catch {
      return false; // Illegal move
    }
  };

  const onDrop = (sourceSquare: string, targetSquare: string): boolean => {
    const move = makeAMove({
      from: sourceSquare,
      to: targetSquare,
      promotion: 'q', // Always promote to a queen for simplicity
    } as Move); // Explicitly cast to Move type

    // // Auto-play opponent move if valid
    // if (move && gameStatus() === 'active') {
    //   setTimeout(makeRandomMove, 300);
    // }

    return move;
  };

  const statusMessage = {
    active: `${game.turn() === 'w' ? 'White' : 'Black'}'s turn`,
    checkmate: `Checkmate! ${game.turn() === 'w' ? 'Black' : 'White'} wins`,
    draw: 'Game drawn',
    stalemate: 'Stalemate!'
  }[gameStatus()];

  return (
    <div className="flex flex-col lg:flex-row gap-8 p-8 max-w-7xl mx-auto">
      {/* Chessboard Section */}
      <div className="flex-1">
        <Chessboard
          position={game.fen()}
          onPieceDrop={onDrop}
          boardWidth={600}
          customBoardStyle={{
            borderRadius: '0.375rem',
            boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'
          }}
        />
      </div>

      {/* Game Info Section */}
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
    </div>
  );
}