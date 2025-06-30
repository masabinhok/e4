'use client';
import { useState, useEffect, useCallback, useRef, use } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import Message from '@/components/Message';
import useLocalStorage from '@/hooks/useLocalStorage'
import Button from '@/components/Button';
import Link from 'next/link'
import Image from 'next/image';
import flipBoard from '@/public/icons/flip.svg';
import { BoardFlip, Opening } from '@/types/types'
import { useSoundStore } from '@/store/useSoundStore';
import { useMessageStore } from '@/store/messageStore';



export default function ChessGame({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
  const [currentOpening, setCurrentOpening] = useState<Opening | null>(null);
  const [game, setGame] = useState(new Chess());
  const [currentLineIndex, setCurrentLineIndex] = useLocalStorage<number>('currentLineIndex', 0);
  const [currentLine, setCurrentLine] = useState<string[] | undefined>(undefined);
  const [lineName, setLineName] = useState<string | undefined>(undefined);
  const [currentMoveIndex, setCurrentMoveIndex] = useState<number>(0);
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [autoPlay, setAutoPlay] = useState(false);
  const [boardFlip, setBoardFlip] = useLocalStorage<BoardFlip>('boardFlip', 'white');
  const [mode, setMode] = useLocalStorage<'learn' | 'practice' | 'quiz'>('currentMode', 'learn');
  const [moveValidation, setMoveValidation] = useState<{ source: string; target: string; valid: boolean } | null>(null);
  const [lineCompleted, setLineCompleted] = useState<boolean>(false);
  const { messages, setMessages, addMessage, removeMessage } = useMessageStore();
  const [mistakes, setMistakes] = useState<number>(0);
  const [isBrowser, setIsBrowser] = useState<boolean>(false);
  const playSound = useSoundStore((s) => s.playSound);


  useEffect(() => {
    const fetchCurrentOpening = async () => {
      const fetchUrl = `${process.env.NEXT_PUBLIC_API_URL}${(code === 'recorded-lines' || code === 'custom-pgns') ? '/users' : '/openings'}/${code}`
      await fetch(fetchUrl, {
        credentials: 'include',
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
      }).then(res => {
        if (!res.ok) {
          throw new Error('Network Error')
        }
        return res.json();
      }).then(data => {
        setCurrentOpening(data);
      })
    }
    fetchCurrentOpening();
  }, [code])


  const movesContainerRef = useRef<HTMLDivElement>(null);

  const getNewGame = useCallback(() => new Chess(), []);

  useEffect(() => {
    setIsBrowser(true);
  }, []);

  useEffect(() => {
    if (currentOpening && currentOpening.variations && currentOpening.variations[currentLineIndex]) {
      setCurrentLine(currentOpening.variations[currentLineIndex].moves);
      setLineName(currentOpening.variations[currentLineIndex].title);
      setBoardFlip(currentOpening.variations[currentLineIndex].boardflip || 'white');
    }
  }, [currentOpening, currentLineIndex, setBoardFlip]);


  const toggleBoardFlip = () => {
    setBoardFlip(boardFlip === 'white' ? 'black' : 'white');
  };

  const loadLine = useCallback((lineKey: number) => {
    if (!currentOpening?.variations[lineKey]) return;
    const moves = currentOpening.variations[lineKey].moves;
    setAutoPlay(false);
    setCurrentLine(moves);
    setBoardFlip(currentOpening.variations[lineKey].boardflip || 'white');
    setCurrentLineIndex(lineKey ?? 0);
    setLineName(currentOpening.variations[lineKey].title);
    setCurrentMoveIndex(0);
    setMoveHistory([]);
    setMoveValidation(null);
    setMistakes(0);
    setGame(getNewGame());
  }, [currentOpening?.variations, getNewGame, setBoardFlip, setCurrentLineIndex,]);


  useEffect(() => {
    if (movesContainerRef.current) {
      movesContainerRef.current.lastElementChild?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'end',
      })
    }
  }, [currentMoveIndex, currentLine]);

  const loadRandomLine = useCallback(() => {
    if (!currentOpening?.variations?.length) return;
    const randomLineIndex = Math.floor(Math.random() * currentOpening.variations.length);
    loadLine(randomLineIndex);
  }, [loadLine, currentOpening?.variations]);

  const handleLineCompletion = useCallback(() => {
    setMessages([]);
    if (lineCompleted && mode === 'practice') {
      setTimeout(() => {
        playSound('achievement');
      }, 1);

      addMessage({
        content: "Congratulations! You've completed the line.",
        type: 'success',
        onClose: () => {
          setLineCompleted(false);
          loadRandomLine();
          playSound('scatter');
        },
      });
    }
    if (lineCompleted && mode === 'quiz') {
      setTimeout(() => {
        playSound('lessonPass');
      }, 1);

      addMessage({
        content: `Congratulations! You've completed the line. You made ${mistakes} mistakes.`,
        type: 'success',
        onClose: () => {
          setLineCompleted(false);
          setCurrentLineIndex(() => {
            const randomLineIndex = Math.floor(Math.random() * (currentOpening?.variations.length ?? 1));
            return randomLineIndex;
          });
          loadRandomLine();
          playSound('scatter');
        },
      });
    }
  }, [lineCompleted, mode, playSound, mistakes, currentOpening?.variations, loadRandomLine, setCurrentLineIndex, setMessages, addMessage]);

  const handleModeChange = (newMode: 'learn' | 'practice' | 'quiz') => {
    setMode(newMode);
    loadLine(currentLineIndex);
  };



  const nextMove = useCallback(() => {
    const lineLength = currentLine?.length ?? 0;
    if (currentMoveIndex < lineLength && currentLine) {
      const move = currentLine[currentMoveIndex];
      const gameCopy = new Chess(game.fen());
      const result = gameCopy.move(move);
      setGame(gameCopy);
      setMoveHistory([...moveHistory, move]);
      setCurrentMoveIndex(currentMoveIndex + 1);
      setMoveValidation(null);

      if (gameCopy.inCheck()) {
        playSound('check');
      }
      else if (result.captured) {
        playSound('capture');
      }
      else {
        playSound('moveSelf');
      }

      if (result.isKingsideCastle && result.isKingsideCastle()) {
        playSound('castle');
      }

      return true;
    }
    return false;
  }, [currentLine, currentMoveIndex, game, moveHistory, playSound]);



  useEffect(() => {
    if (mode === 'practice' || mode === 'quiz') {
      if (currentOpening?.variations[currentLineIndex]?.boardflip === 'black' && currentMoveIndex % 2 === 0) {
        setTimeout(() => nextMove(), 500);
      }
      if (currentOpening?.variations[currentLineIndex]?.boardflip === 'white' && currentMoveIndex % 2 !== 0) {
        setTimeout(() => nextMove(), 500);
      }
      const lineLength = currentLine?.length;
      if (lineLength && currentMoveIndex + 1 >= lineLength) {
        setLineCompleted(true);
        handleLineCompletion();
      }
    }
  }, [currentLineIndex, currentMoveIndex, mode, currentOpening, currentLine, nextMove, handleLineCompletion]);

  const previousMove = () => {
    if (currentMoveIndex > 0) {
      playSound('moveSelf');
      const newHistory = moveHistory.slice(0, -1);
      const newGame = new Chess();
      newHistory.forEach((move) => newGame.move(move));
      setGame(newGame);
      setMoveHistory(newHistory);
      setCurrentMoveIndex(currentMoveIndex - 1);
      setMoveValidation(null);
      return true;
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
  }, [autoPlay, currentMoveIndex, currentLine, nextMove, setMessages]);

  const onDrop = (sourceSquare: string, targetSquare: string) => {
    if (autoPlay) return false;
    try {
      const move = {
        from: sourceSquare,
        to: targetSquare,
        promotion: 'q',
      };

      const gameCopy = new Chess(game.fen());
      const result = gameCopy.move(move);

      if (currentOpening?.variations[currentLineIndex]?.boardflip === 'black' && currentMoveIndex % 2 === 0) {
        return false;
      }
      if (currentOpening?.variations[currentLineIndex]?.boardflip === 'white' && currentMoveIndex % 2 !== 0) {
        return false;
      }

      if (!result) {
        playSound('illegal');
        setMoveValidation({ source: sourceSquare, target: targetSquare, valid: false });
        addMessage({
          content: 'Invalid move',
          type: 'error',
        });
        return false;
      }

      const expectedMove = currentLine?.[currentMoveIndex];
      if (!expectedMove || result.san !== expectedMove) {
        playSound('incorrect');
        setMistakes(mistakes + 1);
        setMoveValidation({ source: sourceSquare, target: targetSquare, valid: false });
        addMessage({
          content: 'Move does not match the expected line.',
          type: 'error',
        });
        return false;
      }

      setMoveValidation({ source: sourceSquare, target: targetSquare, valid: true });
      setGame(gameCopy);
      setMoveHistory([...moveHistory, result.san]);
      setCurrentMoveIndex(currentMoveIndex + 1);

      if (gameCopy.inCheck()) {
        playSound('check');
      }
      else if (result.captured) {
        playSound('capture');
      }
      else {
        playSound('moveSelf');
      }

      if (result.isKingsideCastle && result.isKingsideCastle()) {
        playSound('castle');
      }

      return true;
    } catch {
      playSound('illegal');
      setMoveValidation({ source: sourceSquare, target: targetSquare, valid: false });
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

  if (!currentOpening) {
    return (
      <section>Loading...</section>
    );
  }

  return (
    <div className=" flex flex-col lg:flex-row bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-100 relative">
      {/* Toasts */}
      <div className="fixed top-6 right-6 z-50 space-y-2">
        {messages.map((msg, idx) => (
          <Message key={idx} message={msg.content} type={msg.type} onClose={() => removeMessage(msg.id!)} />
        ))}
      </div>

      {/* Chessboard */}
      <div className="flex-1 flex items-center justify-center p-6 relative">
        {isBrowser ? (
          <Chessboard
            onPieceDrop={onDrop}
            position={game.fen()}
            boardWidth={Math.min(window.innerWidth * 0.85, 520)}
            customDarkSquareStyle={{ backgroundColor: '#334155' }}
            customLightSquareStyle={{ backgroundColor: '#cbd5e1' }}
            customSquareStyles={getSquareStyles()}
            boardOrientation={boardFlip}
          />
        ) : (
          <div className="text-7xl text-blue-400">LOADING...</div>
        )}
      </div>

      {/* Controls/Info Panel */}
      <aside className="w-full lg:w-[430px] bg-gray-800/95 p-8 flex flex-col gap-5 shadow-xl rounded-t-3xl lg:rounded-t-none lg:rounded-l-3xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-extrabold text-blue-400 tracking-tight">{currentOpening?.name}</h1>
          <button
            className=" bg-blue-500 hover:brightness-110 transition p-2 rounded-full shadow-lg cursor-pointer"
            onClick={toggleBoardFlip}
            aria-label="Flip Board"
          >
            <Image src={flipBoard} alt="Flip board" width={28} height={28} className='invert' />
          </button>

        </div>

        {/* Mode Tabs */}
        <div className="flex gap-2 mb-4">
          {['learn', 'practice', 'quiz'].map(modeOption => (
            <button
              key={modeOption}
              className={`px-4 py-2 rounded-full font-semibold transition ${mode === modeOption ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-blue-500'
                }`}
              onClick={() => handleModeChange(modeOption as 'learn' | 'practice' | 'quiz')}
            >
              {modeOption.charAt(0).toUpperCase() + modeOption.slice(1)}
            </button>
          ))}
        </div>

        {/* Variation Selector */}
        {(mode === 'learn' || mode === 'practice') && (
          <div>
            <label className="block text-sm font-medium mb-1">Variation</label>
            <select
              className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 mb-2"
              value={lineName}
              onChange={e => loadLine(e.target.selectedIndex)}
            >
              {currentOpening?.variations.map((v, i) => (
                <option key={i} value={v.title}>{v.title}</option>
              ))}
            </select>
          </div>
        )}

        {/* Line Info & Progress */}
        <div className="bg-gray-700 p-4 rounded-xl mb-4 shadow-inner">
          <h2 className="font-bold text-blue-400 mb-1">{lineName}</h2>
          <p className="text-xs text-gray-300 mb-2">{currentOpening?.variations[currentLineIndex]?.description}</p>
          <div className="flex items-center gap-2">
            <div ref={movesContainerRef} className="font-mono text-base bg-gray-800 p-2 rounded flex-1 whitespace-nowrap overflow-x-hidden">
              {currentLine?.map((move, i) => {
                // Show moves up to and including the current move index
                if (i < currentMoveIndex - 1) {
                  return <span key={i}>{move} </span>;
                }
                // Highlight the last played move in yellow
                if (i === currentMoveIndex - 1) {
                  return (
                    <span key={i} className="text-yellow-400 font-bold">
                      {move}{' '}
                    </span>
                  );
                }
                // Show the next move as green (quiz/learn mode)
                if (i === currentMoveIndex) {
                  return (
                    <span key={i} className="text-green-400">
                      {mode === 'quiz' ? ' ?' : ' ' + move}
                    </span>
                  );
                }
                return null;
              })}
              <span className=' text-red-500 rounded-full'>
                !
              </span>
            </div>

            <span className="ml-2 text-xs text-gray-400">
              {currentMoveIndex}/{currentLine?.length ?? 0}
            </span>
          </div>
          {/* Progress bar */}
          <div className="h-2 bg-gray-600 rounded mt-2">
            <div
              className="h-2 bg-blue-500 rounded transition-all"
              style={{ width: `${((currentMoveIndex / (currentLine?.length || 1)) * 100).toFixed(1)}%` }}
            />
          </div>
        </div>

        {/* Controls */}
        <div className="grid gap-2 [grid-template-columns:repeat(auto-fit,minmax(160px,1fr))]">
          {mode === 'learn' && (
            <>
              <Button onClick={previousMove} disabled={currentMoveIndex === 0} text="Previous" icon="←" />
              <Button onClick={nextMove} disabled={currentMoveIndex >= (currentLine?.length ?? 0)} text="Next" icon="→" />
            </>
          )}
          {(mode === 'learn' || mode === 'practice') && (
            <>
              <Button onClick={() => setAutoPlay(!autoPlay)} text={autoPlay ? "Pause" : "Autoplay"} icon={autoPlay ? "⏸" : "▶"} />
              <Button onClick={() => loadLine(currentLineIndex)} text="Reset" icon="⟳" />
            </>
          )}
          {mode === 'quiz' && (
            <Button onClick={loadRandomLine} text="Random Line" icon="🎲" />
          )}
        </div>

        {/* Contribute Button */}
        <Link href={`/record?code=${code}`} className="mt-4">
          <Button text="Contribute a Variation" icon="✍️" />
        </Link>
      </aside>
    </div>
  );
}
