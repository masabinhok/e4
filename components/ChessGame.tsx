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

type MODE = 'learn' | 'practice' | 'quiz';

export default function ChessGame() {
  const [game, setGame] = useState(new Chess());
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [currentLine, setCurrentLine] = useState<string[]>(CARO_KANN_LINES[currentLineIndex].line);
  const [lineName, setLineName] = useState(CARO_KANN_LINES[currentLineIndex].name);
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0);
  const [moveHistory, setMoveHistory] = useState<string[]>([]); // Track move history
  const [autoPlay, setAutoPlay] = useState(false);
  const [boardFlip, setBoardFlip] = useState<string>(CARO_KANN_LINES[currentLineIndex].boardflip || 'white');
  const [mode, setMode] = useState<MODE>('learn');

  // Flip the board
  const toggleBoardFlip = () => {
    setBoardFlip(boardFlip === 'white' ? 'black' : 'white');
  };

  // Load the selected line
  const loadLine = (lineKey: number) => {
    const moves = CARO_KANN_LINES[lineKey].line;
    setCurrentLine(moves);
    setBoardFlip(CARO_KANN_LINES[lineKey].boardflip || 'white');
    setCurrentLineIndex(CARO_KANN_LINES[lineKey].index);
    setLineName(CARO_KANN_LINES[lineKey].name);
    setCurrentMoveIndex(0);
    setMoveHistory([]); // Reset move history

    const newGame = new Chess();
    setGame(newGame);
  };

  useEffect(() => {
    if (mode === 'practice' || mode == 'quiz') {
      if (CARO_KANN_LINES[currentLineIndex].boardflip === 'black' && currentMoveIndex % 2 == 0) {
        setTimeout(() => nextMove(), 500);
      }

      if (CARO_KANN_LINES[currentLineIndex].boardflip === 'white' && currentMoveIndex % 2 !== 0) {
        setTimeout(() => nextMove(), 500);
      }
    }
  }, [currentLineIndex, currentMoveIndex]);

  // Advance to next move in the line
  const nextMove = () => {
    if (currentMoveIndex < currentLine.length) {
      const move = currentLine[currentMoveIndex];
      const gameCopy = new Chess(game.fen());
      gameCopy.move(move);
      setGame(gameCopy);
      setMoveHistory([...moveHistory, move]); // Add move to history
      setCurrentMoveIndex(currentMoveIndex + 1);
      return true;
    }
    return false;
  };

  // Step back to the previous move
  const previousMove = () => {
    if (currentMoveIndex > 0) {
      const newHistory = moveHistory.slice(0, -1); // Remove the last move
      const newGame = new Chess();
      newHistory.forEach((move) => newGame.move(move)); // Replay all moves except the last one
      setGame(newGame);
      setMoveHistory(newHistory); // Update move history
      setCurrentMoveIndex(currentMoveIndex - 1); // Decrement move index
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

      // Ensure the player moves only on their turn
      if (CARO_KANN_LINES[currentLineIndex].boardflip === 'black' && currentMoveIndex % 2 === 0) {
        return false; // Black's turn, but it's white's move
      }
      if (CARO_KANN_LINES[currentLineIndex].boardflip === 'white' && currentMoveIndex % 2 !== 0) {
        return false; // White's turn, but it's black's move
      }

      if (!result) return false; // Invalid chess move

      // Check if user is following the line
      const expectedMove = currentLine[currentMoveIndex];
      if (!expectedMove || result.san !== expectedMove) {
        return false; // Move does not match the line
      }

      setGame(gameCopy);
      setMoveHistory([...moveHistory, result.san]); // Add move to history
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

        {/* Mode Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Select Mode:</label>
          <select
            className="w-full capitalize bg-gray-700 border border-gray-600 rounded-md p-2"
            value={mode}
            onChange={(e) => {
              setMode(e.target.value as MODE);
              loadLine(currentLineIndex);
            }}
          >
            {["learn", "practice", "quiz"].map((line, index) => (
              <option className='capitalize' key={index} value={line}>{line}</option>
            ))}
          </select>
        </div>

        {
          (mode === 'learn' || mode === 'practice') && (
            <>
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
            </>
          )
        }

        {/* Current Line Info */}
        <div className="bg-gray-700 p-4 rounded-md mb-6">
          <h2 className="font-bold text-blue-400 mb-2">{lineName}</h2>

          <div className="font-mono bg-gray-800 p-2 rounded">
            {currentLine.slice(0, currentMoveIndex).join(' ')}
            {currentMoveIndex < currentLine.length && (
              <span className="text-yellow-400">
                {' ' +
                  currentLine[currentMoveIndex]
                }
              </span>
            )}
          </div>

        </div>

        {/* Controls */}
        <div className="flex space-x-3 space-y-3 mb-6 flex-wrap">
          {
            mode === 'learn' && (
              <div className='flex space-x-3 w-full'>
                <button
                  className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md w-full"
                  onClick={previousMove}
                  disabled={currentMoveIndex == 0}
                >
                  Previous Move
                </button>
                <button
                  className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-md w-full"
                  onClick={nextMove}
                  disabled={currentMoveIndex >= currentLine.length}
                >
                  Next Move
                </button></div>
            )
          }

          {
            (mode === 'learn' || mode === 'practice') && (
              <>
                <div className='flex space-x-3 w-full'>
                  <button
                    className="bg-yellow-600 hover:bg-yellow-700 px-4 py-2 rounded-md w-full"
                    onClick={() => setAutoPlay(!autoPlay)}
                  >
                    {autoPlay ? 'Pause' : 'Autoplay'}
                  </button>
                  <button
                    className=" bg-red-600 hover:bg-red-700 px-4 py-2 rounded-md w-full"
                    onClick={() => {
                      setAutoPlay(false);
                      loadLine(currentLineIndex)
                    }}
                  >
                    Reset
                  </button>
                </div>
              </>
            )
          }

          {
            mode === 'quiz' && (
              <>
                <button onClick={() => {
                  const randomLineIndex = Math.floor(Math.random() * CARO_KANN_LINES.length);
                  loadLine(randomLineIndex);
                }} className='bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md w-full'>
                  Random Line
                </button>
              </>
            )
          }
          <button
            className="border border-gray-500 px-4 py-2 mt-3 rounded-md w-full"
            onClick={() => toggleBoardFlip()}
          >
            Flip board
          </button>
        </div>
      </div>
    </div >
  );
}