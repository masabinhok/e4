'use client';
import { useState, useEffect } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import Message from './Message';
import openings from '@/api/openings.json'


type MODE = 'learn' | 'practice' | 'quiz';
type MessageType = {
  content: string;
  type: 'success' | 'error' | 'info'; // Define message types
  onClose?: () => void; // Optional callback for when the message is closed
};

export default function ChessGame({ code }: { code: string }) {

  const currentOpening = openings.openings.find((opening) => opening.code === code);
  const [game, setGame] = useState(new Chess());
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [currentLine, setCurrentLine] = useState<string[] | undefined>(currentOpening?.variations[currentLineIndex]?.line);
  const [lineName, setLineName] = useState(currentOpening?.variations[currentLineIndex].name);
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0);
  const [moveHistory, setMoveHistory] = useState<string[]>([]); // Track move history
  const [autoPlay, setAutoPlay] = useState(false);
  const [boardFlip, setBoardFlip] = useState<string>(currentOpening?.variations[currentLineIndex].boardflip || 'white');
  const [mode, setMode] = useState<MODE>('learn');
  const [moveValidation, setMoveValidation] = useState<{ source: string; target: string; valid: boolean } | null>(null);
  const [lineCompleted, setLineCompleted] = useState<boolean>(false);
  const [messages, setMessages] = useState<MessageType[]>([]); // Update state to store message objects
  const [mistakes, setMistakes] = useState<number>(0); // Track mistakes
  const [isBrowser, setIsBrowser] = useState<boolean>(false); // Track if in browser environment

  useEffect(() => {
    setIsBrowser(true)
  }, [])


  const addMessage = (newMessage: MessageType) => {
    setMessages((prevMessages) => [...prevMessages, newMessage]); // Add new message object to the array
  };

  const removeMessage = (index: number) => {
    const messageToRemove = messages[index];
    if (messageToRemove.onClose) {
      messageToRemove.onClose(); // Call the onClose callback if it exists
    }
    setMessages((prevMessages) => prevMessages.filter((_, i) => i !== index)); // Remove message by index
  };

  // Flip the board
  const toggleBoardFlip = () => {
    setBoardFlip(boardFlip === 'white' ? 'black' : 'white');
  };

  // Load the selected line
  const loadLine = (lineKey: number) => {
    const moves = currentOpening?.variations[lineKey].line;
    setCurrentLine(moves);
    setBoardFlip(currentOpening?.variations[lineKey].boardflip || 'white');
    setCurrentLineIndex(currentOpening?.variations[lineKey].index!);
    setLineName(currentOpening?.variations[lineKey].name);
    setCurrentMoveIndex(0);
    setMoveHistory([]); // Reset move history
    setMoveValidation(null); // Reset square highlights
    setMistakes(0); // Reset mistakes

    const newGame = new Chess();
    setGame(newGame);
  };

  const handleLineCompletion = () => {
    if (lineCompleted && mode === 'practice') {
      addMessage({
        content: "Congratulations! You've completed the line.",
        type: 'success',
        onClose: () => {
          setLineCompleted(false);
          loadLine(currentLineIndex);
        },
      });
    }
    if (lineCompleted && mode === 'quiz') {
      addMessage({
        content: `Congratulations! You've completed the line. You made ${mistakes} mistakes.`,
        type: 'success',
        onClose: () => {
          setLineCompleted(false);
          setCurrentLine(() => {
            const randomLineIndex = Math.floor(Math.random() * currentOpening?.variations.length!);
            return currentOpening?.variations[randomLineIndex].line;
          })
          loadLine(currentLineIndex);
        },
      });
    }
  };

  const handleModeChange = (newMode: MODE) => {
    setMode(newMode);
    setMoveValidation(null); // Reset square highlights
    loadLine(currentLineIndex); // Reload the current line
  };

  useEffect(() => {
    if (mode === 'practice' || mode == 'quiz') {
      if (currentOpening?.variations[currentLineIndex].boardflip === 'black' && currentMoveIndex % 2 == 0) {
        setTimeout(() => nextMove(), 500);
      }

      if (currentOpening?.variations[currentLineIndex].boardflip === 'white' && currentMoveIndex % 2 !== 0) {
        setTimeout(() => nextMove(), 500);
      }

      if (currentMoveIndex + 1 >= currentLine!.length) {
        setLineCompleted(true);
        setAutoPlay(false);
        handleLineCompletion();
      }

    }
  }, [currentLineIndex, currentMoveIndex, mode]);

  // Advance to next move in the line
  const nextMove = () => {
    if (currentMoveIndex < currentLine!.length) {
      const move = currentLine![currentMoveIndex];
      const gameCopy = new Chess(game.fen());
      gameCopy.move(move);
      setGame(gameCopy);
      setMoveHistory([...moveHistory, move]); // Add move to history
      setCurrentMoveIndex(currentMoveIndex + 1);
      setMoveValidation(null);
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
      setMoveValidation(null);
      return true;
    }
    return false;
  };

  // Auto-play through the line
  useEffect(() => {
    if (autoPlay && currentMoveIndex < currentLine!.length) {
      const timer = setTimeout(() => {
        nextMove();
      }, 1000);
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
      if (currentOpening?.variations[currentLineIndex].boardflip === 'black' && currentMoveIndex % 2 === 0) {
        return false; // Black's turn, but it's white's move
      }
      if (currentOpening?.variations[currentLineIndex].boardflip === 'white' && currentMoveIndex % 2 !== 0) {
        return false; // White's turn, but it's black's move
      }

      if (!result) {
        setMoveValidation({ source: sourceSquare, target: targetSquare, valid: false });
        addMessage({
          content: "Invalid move",
          type: 'error',
        });
        return false; // Invalid chess move
      }

      // Check if user is following the line in quiz mode
      const expectedMove = currentLine![currentMoveIndex];
      if ((!expectedMove || result.san !== expectedMove)) {
        setMistakes(mistakes + 1);
        setMoveValidation({ source: sourceSquare, target: targetSquare, valid: false });
        addMessage({
          content: "Move does not match the expected line.",
          type: 'error',
        });
        return false; // Move does not match the line
      }

      // If the move is valid
      setMoveValidation({ source: sourceSquare, target: targetSquare, valid: true });
      setGame(gameCopy);
      setMoveHistory([...moveHistory, result.san]); // Add move to history
      setCurrentMoveIndex(currentMoveIndex + 1);

      // Check for line completion
     
      return true;
    } catch {
      setMoveValidation({ source: sourceSquare, target: targetSquare, valid: false });
      addMessage({
        content: "Invalid move",
        type: 'error',
      });
      return false;
    }
  };

  const getSquareStyles = () => {
    if (!moveValidation) return {};
    const { source, target, valid } = moveValidation;
    const color = valid ? 'rgba(0, 255, 0, 0.4)' : 'rgba(255, 0, 0, 0.4)';
    return {
      [source]: { backgroundColor: color },
      [target]: { backgroundColor: color },
    };
  };

  return (
    <div onAuxClick={() => {
      setMoveValidation(null); // Reset square highlights on click
    }} className="flex flex-col items-center lg:flex-row bg-gray-900 text-gray-100 min-h-screen">

      {/* Messages */}
      <div className="absolute top-4 right-4 space-y-2">
        {messages.map((msg, index) => (
          <Message
            key={index}
            message={msg.content}
            type={msg.type}
            onClose={() => removeMessage(index)} // Remove the message when closed
          />
        ))}
      </div>

      {/* Chessboard */}
      <div className="flex-1 flex items-center justify-center p-4">

        {
          isBrowser ? (
            <Chessboard
              position={game.fen()}
              onPieceDrop={onDrop}
              boardWidth={Math.min(window.innerWidth * 0.7, 600)}
              customDarkSquareStyle={{ backgroundColor: '#4a5568' }}
              customLightSquareStyle={{ backgroundColor: '#718096' }}
              customSquareStyles={getSquareStyles()} // Highlight squares
              boardOrientation={boardFlip === 'black' ? 'black' : 'white'}
            />
          ) : (
            <section className='w-2xl flex items-center justify-center font-bold text-7xl text-blue-400'>
              LOADING...
            </section>
          )
        }

      </div>

      {/* Teaching Panel */}
      <div className="w-full lg:w-96 bg-gray-800 p-6 overflow-y-auto h-full">
        <h1 className="text-2xl font-bold text-blue-400 mb-6">{currentOpening?.name}</h1>

        {/* Mode Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Select Mode:</label>
          <select
            className="w-full capitalize bg-gray-700 border border-gray-600 rounded-md p-2"
            value={mode}
            onChange={(e) => handleModeChange(e.target.value as MODE)} // Use the new handler
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
                  onChange={(e) => loadLine(e.target.selectedIndex)} // Reset highlights on variation change
                >
                  {currentOpening?.variations.map((line, index) => (
                    <option key={index} value={line.name}>{line.name}</option>
                  ))}
                </select>
              </div>
            </>
          )
        }

        {/* Current Line Info */}
        <div className="bg-gray-700 p-4 rounded-md mb-6">
          <h2 className="font-bold text-blue-400 ">{lineName}</h2>

          <p className='text-xs mb-3'>{currentOpening?.variations[currentLineIndex].description}</p>

          <div className="font-mono bg-gray-800 p-2 rounded">
            {currentLine!.slice(0, currentMoveIndex).join(' ')}
            {currentMoveIndex < currentLine!.length && (
              <span className="text-green-400">
                {
                  mode === 'quiz' ? " ?" : " " + currentLine![currentMoveIndex]
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
                  disabled={currentMoveIndex >= currentLine!.length}
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
                  const randomLineIndex = Math.floor(Math.random() * currentOpening?.variations.length!);
                  loadLine(randomLineIndex);
                }} className='bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md w-full'>
                  Random Line
                </button>
              </>
            )
          }
          <button
            className="border border-gray-500 px-4 py-2 mt-2 rounded-md w-full"
            onClick={() => toggleBoardFlip()}
          >
            Flip board
          </button>
        </div>
      </div>
    </div >
  );
}