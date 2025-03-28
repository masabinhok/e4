'use client';
import { useState, useEffect } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';

const CARO_KANN_LINES = [
  {
    name: "Early ...c5 Break",
    index: 0,
    line: [
      'e4', 'c6', 'd4', 'd5', 'e5', 'c5',
      'dxc5', 'Nc6', 'Bb5', 'e6', 'Be3',
      'Ne7', 'c3', 'Nf5', 'Bd4', 'Bd7'
    ],
    boardflip: 'black',
  },
  {
    name: "Classical Variation",
    index: 1,
    line: [
      'e4', 'c6', 'd4', 'd5', 'Nc3', 'dxe4',
      'Nxe4', 'Bf5', 'Ng3', 'Bg6', 'h4',
      'h6', 'Nf3', 'Nd7', 'h5', 'Bh7'
    ],
    boardflip: 'black',
  }
  // Add other variations here
];

export default function ChessGame() {
  const [game, setGame] = useState(new Chess());
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [currentLine, setCurrentLine] = useState<string[]>(CARO_KANN_LINES[currentLineIndex].line);
  const [lineName, setLineName] = useState(CARO_KANN_LINES[currentLineIndex].name);
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0);
  const [autoPlay, setAutoPlay] = useState(false);
  const [boardFlip, setBoardFlip] = useState<string>(CARO_KANN_LINES[currentLineIndex].boardflip || 'white');

  // Flip the board
  const toggleBoardFlip = () => {
    setBoardFlip(boardFlip === 'white' ? 'black' : 'white');
  }

  // Load the selected line
  const loadLine = (lineKey: number) => {
    const moves = CARO_KANN_LINES[lineKey].line;
    setCurrentLine(moves);
    setBoardFlip(CARO_KANN_LINES[lineKey].boardflip || 'white');
    setLineName(CARO_KANN_LINES[lineKey].name);
    setCurrentMoveIndex(0);

    const newGame = new Chess();
    setGame(newGame);
  };

  // Advance to next move in the line
  const nextMove = () => {
    if (currentMoveIndex < currentLine.length) {
      const move = currentLine[currentMoveIndex];
      const gameCopy = new Chess(game.fen());
      gameCopy.move(move);
      setGame(gameCopy);
      setCurrentMoveIndex(currentMoveIndex + 1);
      return true;
    }
    return false;
  };

  // Auto-play through the line
  useEffect(() => {
    if (autoPlay && currentMoveIndex < currentLine.length) {
      const timer = setTimeout(() => {
        nextMove();
      }, 800);
      return () => clearTimeout(timer);
    } else {
      setAutoPlay(false);
    }
  }, [autoPlay, currentMoveIndex]);

  const onDrop = (sourceSquare: string, targetSquare: string) => {
    try {
      const move = {
        from: sourceSquare,
        to: targetSquare,
        promotion: 'q',
      };

      const gameCopy = new Chess(game.fen());
      const result = gameCopy.move(move);

      if (!result) return false; // Invalid move

      setGame(gameCopy);

      // Check if user is following the line
      const expectedMove = currentLine[currentMoveIndex];
      if (expectedMove && result.san !== expectedMove) {
        return false; // Move does not match the line
      }

      setCurrentMoveIndex(currentMoveIndex + 1);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <div className="flex flex-col items-center lg:flex-row bg-gray-900 text-gray-100 min-h-screen">
      {/* Chessboard */}
      <div className="flex-1 flex items-center justify-center p-4">
        <Chessboard
          position={game.fen()}
          onPieceDrop={onDrop}
          boardWidth={Math.min(window.innerWidth * 0.7, 600)}
          customDarkSquareStyle={{ backgroundColor: '#4a5568' }}
          customLightSquareStyle={{ backgroundColor: '#718096' }}
          boardOrientation={boardFlip === 'black' ? 'black' : 'white'}
        />
      </div>

      {/* Teaching Panel */}
      <div className="w-full lg:w-96 bg-gray-800 p-6 overflow-y-auto h-full">
        <h1 className="text-2xl font-bold text-blue-400 mb-6">Caro-Kann Trainer</h1>

        {/* Line Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Select Variation:</label>
          <select
            className="w-full bg-gray-700 border border-gray-600 rounded-md p-2"
            value={lineName}
            onChange={(e) => loadLine(e.target.selectedIndex)}
          >
            {CARO_KANN_LINES.map((line, index) => (
              <option key={index} value={line.name}>{line.name}</option>
            ))}
          </select>
        </div>

        {/* Current Line Info */}
        <div className="bg-gray-700 p-4 rounded-md mb-6">
          <h2 className="font-bold text-blue-400 mb-2">{lineName}</h2>
          <div className="font-mono bg-gray-800 p-2 rounded">
            {currentLine.slice(0, currentMoveIndex).join(' ')}
            {currentMoveIndex < currentLine.length && (
              <span className="text-yellow-400">
                {' ' + currentLine[currentMoveIndex]}
              </span>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="flex space-x-3 space-y-3 mb-6 flex-wrap">
          <button
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md"
            onClick={nextMove}
            disabled={currentMoveIndex >= currentLine.length}
          >
            Next Move
          </button>
          <button
            className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-md"
            onClick={() => setAutoPlay(!autoPlay)}
          >
            {autoPlay ? 'Pause' : 'Autoplay'}
          </button>
          <button
            className="border border-gray-500 px-4 py-2 rounded-md"
            onClick={() => loadLine(currentLineIndex)}
          >
            Reset
          </button>
          <button
            className="border border-gray-500 px-4 py-2 rounded-md"
            onClick={() => toggleBoardFlip()}
          >
            Flip board
          </button>
        </div>
      </div>
    </div>
  );
}