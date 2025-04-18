'use client';
import { useState, useEffect } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import Message from './Message';
import openings from '@/constants/openings';
import useLocalStorage from '@/hooks/useLocalStorage';
import { useSound } from '@/contexts/SoundContext';

export default function ChessGame({ code }: { code: string }) {
  const [updatedOpenings, setUpdatedOpenings] = useLocalStorage('openings', openings);
  const currentOpening = updatedOpenings.find((opening) => opening.code === code);
  const [game, setGame] = useState(new Chess());
  const [currentLineIndex, setCurrentLineIndex] = useLocalStorage<number>('currentLineIndex', 0);
  const [currentLine, setCurrentLine] = useState<string[] | undefined>(currentOpening?.variations[currentLineIndex]?.line);
  const [lineName, setLineName] = useState(currentOpening?.variations[currentLineIndex]?.name);
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0);
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [autoPlay, setAutoPlay] = useState(false);
  const [boardFlip, setBoardFlip] = useState<string>(currentOpening?.variations[currentLineIndex]?.boardflip || 'white');
  const [mode, setMode] = useLocalStorage<'learn' | 'practice' | 'quiz'>('currentMode', 'learn');
  const [moveValidation, setMoveValidation] = useState<{ source: string; target: string; valid: boolean } | null>(null);
  const [lineCompleted, setLineCompleted] = useState<boolean>(false);
  const [messages, setMessages] = useState<{ content: string; type: 'success' | 'error' | 'info'; onClose?: () => void }[]>([]);
  const [mistakes, setMistakes] = useState<number>(0);
  const [isBrowser, setIsBrowser] = useState<boolean>(false);
  const { playSound } = useSound();

  useEffect(() => {
    setIsBrowser(true);
  }, []);

  const addMessage = (newMessage: { content: string; type: 'success' | 'error' | 'info'; onClose?: () => void }) => {
    setMessages((prevMessages) => [...prevMessages, newMessage]);
  };

  const removeMessage = (index: number) => {
    const messageToRemove = messages[index];
    if (messageToRemove.onClose) {
      messageToRemove.onClose();
    }
    setMessages((prevMessages) => prevMessages.filter((_, i) => i !== index));
  };

  const toggleBoardFlip = () => {
    setBoardFlip(boardFlip === 'white' ? 'black' : 'white');
  };

  const loadLine = (lineKey: number) => {
    const moves = currentOpening?.variations[lineKey]?.line;
    setAutoPlay(false);
    setCurrentLine(moves);
    setBoardFlip(currentOpening?.variations[lineKey]?.boardflip || 'white');
    setCurrentLineIndex(currentOpening?.variations[lineKey]?.index ?? 0);
    setLineName(currentOpening?.variations[lineKey]?.name);
    setCurrentMoveIndex(0);
    setMoveHistory([]);
    setMoveValidation(null);
    setMistakes(0);

    const newGame = new Chess();
    setGame(newGame);
  };

  const handleLineCompletion = () => {
    setMessages([]);
    if (lineCompleted && mode === 'practice') {
      addMessage({
        content: "Congratulations! You've completed the line.",
        type: 'success',
        onClose: () => {
          setLineCompleted(false);
          loadRandomLine();
        },
      });
    }
    if (lineCompleted && mode === 'quiz') {
      addMessage({
        content: `Congratulations! You've completed the line. You made ${mistakes} mistakes.`,
        type: 'success',
        onClose: () => {
          setLineCompleted(false);
          setCurrentLineIndex(() => {
            const randomLineIndex = Math.floor(Math.random() * currentOpening?.variations.length!);
            return randomLineIndex;
          });
          loadRandomLine();
        },
      });
    }
  };

  const handleModeChange = (newMode: 'learn' | 'practice' | 'quiz') => {
    setMode(newMode);
    loadLine(currentLineIndex);
  };

  useEffect(() => {
    if (mode === 'practice' || mode === 'quiz') {
      if (currentOpening?.variations[currentLineIndex]?.boardflip === 'black' && currentMoveIndex % 2 === 0) {
        setTimeout(() => nextMove(), 500);
      }

      if (currentOpening?.variations[currentLineIndex]?.boardflip === 'white' && currentMoveIndex % 2 !== 0) {
        setTimeout(() => nextMove(), 500);
      }

      const lineLength = currentLine?.length ?? 0;
      if (currentMoveIndex + 1 >= lineLength) {
        setLineCompleted(true);
        handleLineCompletion();
      }
    }
  }, [currentLineIndex, currentMoveIndex, mode]);

  const nextMove = () => {
    const lineLength = currentLine?.length ?? 0;
    if (currentMoveIndex < lineLength && currentLine) {
      const result = game.move(currentLine[currentMoveIndex]);
      if (result) {
        setGame(new Chess(game.fen()));
        setMoveHistory([...moveHistory, result.san]);
        playSound('moveSelf');
        if (result.captured) {
          playSound('capture');
        }
        if (result.promotion) {
          playSound('promotion');
        }
        if (result.san.includes('+')) {
          playSound('check');
        }
        if (result.isKingsideCastle() || result.isQueensideCastle()) {
          playSound('castle');
        }
        setCurrentMoveIndex(currentMoveIndex + 1);
        setMoveValidation(null);
        return true;
      }
      playSound('illegal');
      setMoveValidation({ source: currentLine[currentMoveIndex], target: currentLine[currentMoveIndex], valid: false });
      setMistakes(mistakes + 1);
      addMessage({
        content: 'Invalid move',
        type: 'error',
      });
      return false;
    }
    return false;
  };

  const loadRandomLine = () => {
    const randomLineIndex = Math.floor(Math.random() * (currentOpening?.variations?.length ?? 1));
    loadLine(randomLineIndex);
  }

  const previousMove = () => {
    if (currentMoveIndex > 0) {
      const result = game.move(currentLine![currentMoveIndex - 1]);
      if (result) {
        setGame(new Chess(game.fen()));
        setMoveHistory(moveHistory.slice(0, -1));
        setCurrentMoveIndex(currentMoveIndex - 1);
        setMoveValidation(null);
        playSound('moveSelf');
        if (result.captured) {
          playSound('capture');
        }
        if (result.isKingsideCastle() || result.isQueensideCastle()) {
          playSound('castle');
        }
        if (result.san.includes('+')) {
          playSound('check');
        }
        if (result.promotion) {
          playSound('promotion');
        }
        return true;
      }
      return false;
    }
    return false;
  };

  useEffect(() => {
    if (autoPlay) {
      const lineLength = currentLine?.length ?? 0;
      if (currentMoveIndex < lineLength) {
        setMessages([]);
        const timer = setTimeout(() => {
          nextMove();
        }, 1000);
        return () => clearTimeout(timer);
      } else {
        setAutoPlay(false);
      }
    }
  }, [autoPlay, currentMoveIndex]);

  const onDrop = (sourceSquare: string, targetSquare: string) => {
    if (autoPlay) return false;
    try {
      const move = {
        from: sourceSquare,
        to: targetSquare,
        promotion: 'q',
      };

      const result = game.move(move);
      if (result) {
        setGame(new Chess(game.fen()));
        setMoveHistory([...moveHistory, result.san]);
        playSound('moveSelf');
        if (result.captured) {
          playSound('capture');
        }
        if (result.promotion) {
          playSound('promotion');
        }
        if (result.san.includes('+')) {
          playSound('check');
        }
        if (result.isKingsideCastle() || result.isQueensideCastle()) {
          playSound('castle');
        }
        setCurrentMoveIndex(currentMoveIndex + 1);
        setMoveValidation(null);
        return true;
      }
      playSound('illegal');
      setMoveValidation({ source: sourceSquare, target: targetSquare, valid: false });
      setMistakes(mistakes + 1);
      addMessage({
        content: 'Invalid move',
        type: 'error',
      });
      return false;
    } catch (error) {
      playSound('illegal');
      setMoveValidation({ source: sourceSquare, target: targetSquare, valid: false });
      setMistakes(mistakes + 1);
      addMessage({
        content: 'Invalid move',
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
    <div
      onAuxClick={() => {
        setMoveValidation(null);
      }}
      className="flex flex-col items-center lg:flex-row bg-gray-900 text-gray-100 min-h-screen"
    >
      <div className="space-y-2 fixed top-4 right-4 z-50">
        {messages.map((msg, index) => (
          <Message key={index} message={msg.content} type={msg.type} onClose={() => removeMessage(index)} />
        ))}
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        {isBrowser ? (
          <Chessboard
            position={game.fen()}
            onPieceDrop={onDrop}
            boardWidth={Math.min(window.innerWidth * 0.7, 600)}
            customDarkSquareStyle={{ backgroundColor: '#4a5568' }}
            customLightSquareStyle={{ backgroundColor: '#718096' }}
            customSquareStyles={getSquareStyles()}
            boardOrientation={boardFlip === 'black' ? 'black' : 'white'}
          />
        ) : (
          <section className="w-2xl flex items-center justify-center font-bold text-7xl text-blue-400">LOADING...</section>
        )}
      </div>

      <div className="w-full lg:w-96 bg-gray-800 p-6 overflow-y-auto h-full">
        <h1 className="text-2xl font-bold text-blue-400 mb-6">{currentOpening?.name}</h1>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Select Mode:</label>
          <select
            className="w-full capitalize bg-gray-700 border border-gray-600 rounded-md p-2"
            value={mode}
            onChange={(e) => handleModeChange(e.target.value as 'learn' | 'practice' | 'quiz')}
          >
            {['learn', 'practice', 'quiz'].map((line, index) => (
              <option className="capitalize" key={index} value={line}>
                {line}
              </option>
            ))}
          </select>
        </div>

        {(mode === 'learn' || mode === 'practice') && (
          <>
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Select Variation:</label>
              <select
                className="w-full bg-gray-700 border border-gray-600 rounded-md p-2"
                value={lineName}
                onChange={(e) => loadLine(e.target.selectedIndex)}
              >
                {currentOpening?.variations.map((line, index) => (
                  <option key={index} value={line.name}>
                    {line.name}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}

        <div className="bg-gray-700 p-4 rounded-md mb-6">
          <h2 className="font-bold text-blue-400 ">{lineName}</h2>

          <p className="text-xs mb-3">{currentOpening?.variations[currentLineIndex]?.description}</p>

          <div className="font-mono bg-gray-800 p-2 rounded">
            {currentLine?.slice(0, currentMoveIndex).join(' ')}
            {currentMoveIndex < (currentLine?.length ?? 0) && (
              <span className="text-green-400">{mode === 'quiz' ? ' ?' : ' ' + currentLine?.[currentMoveIndex]}</span>
            )}
          </div>
        </div>

        <div className="flex space-x-3 space-y-3 mb-6 flex-wrap">
          {mode === 'learn' && (
            <div className="flex space-x-3 w-full">
              <button
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md w-full"
                onClick={previousMove}
                disabled={currentMoveIndex === 0}
              >
                Previous Move
              </button>
              <button
                className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-md w-full"
                onClick={nextMove}
                disabled={currentMoveIndex >= (currentLine?.length ?? 0)}
              >
                Next Move
              </button>
            </div>
          )}

          {(mode === 'learn' || mode === 'practice') && (
            <>
              <div className="flex space-x-3 w-full">
                <button
                  className="bg-yellow-600 hover:bg-yellow-700 px-4 py-2 rounded-md w-full"
                  onClick={() => setAutoPlay(!autoPlay)}
                >
                  {autoPlay ? 'Pause' : 'Autoplay'}
                </button>
                <button
                  className=" bg-red-600 hover:bg-red-700 px-4 py-2 rounded-md w-full"
                  onClick={() => {
                    loadLine(currentLineIndex);
                  }}
                >
                  Reset
                </button>
              </div>
            </>
          )}

          {mode === 'quiz' && (
            <>
              <button
                onClick={loadRandomLine}
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md w-full"
              >
                Random Line
              </button>
            </>
          )}
          <button
            className="border border-gray-500 px-4 py-2 mt-2 rounded-md w-full"
            onClick={() => toggleBoardFlip()}
          >
            Flip board
          </button>
        </div>
      </div>
    </div>
  );
}