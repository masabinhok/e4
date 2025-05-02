'use client';
import { useState, useEffect, useRef } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import Message from './Message';
import Link from 'next/link';
import useLocalStorage from '@/hooks/useLocalStorage';
import { useSound } from '@/contexts/SoundContext';
import { useSearchParams } from 'next/navigation';
import { BoardFlip } from '@/types/types';
import Image from 'next/image';
import flipBoard from '@/public/flip.svg';
import Button from './Button';


export default function RecordLine() {
  const searchParams = useSearchParams();
  const code = searchParams.get('code') || 'recorded-pgns';
  const [pgnName, setPgnName] = useState<string>('');
  const [pgnDescription, setPgnDescription] = useState<string>('');
  const [game, setGame] = useState(new Chess());
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0);
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [autoPlay, setAutoPlay] = useState(false);
  const [boardFlip, setBoardFlip] = useLocalStorage<BoardFlip>('boardFlip', 'white');
  const [moveValidation, setMoveValidation] = useState<{ source: string; target: string; valid: boolean } | null>(null);
  const [messages, setMessages] = useState<{ content: string; type: 'success' | 'error' | 'info'; onClose?: () => void }[]>([]);
  const [isBrowser, setIsBrowser] = useState<boolean>(false);
  const { playSound } = useSound();
  const [isContributed, setIsContributed] = useLocalStorage<boolean>('isContributed', false);
  const movesContainerRef = useRef<HTMLDivElement>(null);





  const toggleBoardFlip = () => {
    setBoardFlip(boardFlip === 'white' ? 'black' : 'white');
  };


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


      if (!result) {
        playSound('illegal');
        setMoveValidation({ source: sourceSquare, target: targetSquare, valid: false });
        addMessage({
          content: 'Invalid move',
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

      if (result.isKingsideCastle() || result.isQueensideCastle()) {
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

  useEffect(() => {
    if (movesContainerRef.current) {
      movesContainerRef.current.lastElementChild?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'end',
      })
    }
  }, [currentMoveIndex])


  const resetGame = () => {
    setGame(new Chess());
    setMoveHistory([]);
    setCurrentMoveIndex(0);
    setMoveValidation(null);
  }

  const savePGN = async () => {
    if (!moveHistory.length) {
      addMessage({
        content: 'Please play some moves to record.',
        type: 'error',
      });
      return;
    }
    if (!pgnName) {
      addMessage({
        content: 'Please enter a name.',
        type: 'error',
      });
      return;
    }
    if (!pgnDescription) {
      addMessage({
        content: 'Please describe your recording.',
        type: 'error',
      });
      return;
    }


    const newVariation = {
      title: pgnName,
      description: pgnDescription,
      moves: moveHistory,
      boardflip: boardFlip,
    }
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/openings/contribute/${code ? code : 'recorded-pgns'}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newVariation),
    });
    if (!res.ok) {
      throw new Error('Failed to contribute variation');
    }

    const data = await res.json();
    console.log(data);

    setPgnName('');
    setPgnDescription('');
    setIsContributed(true);
    addMessage({
      content: 'PGN saved successfully',
      type: 'success',
    });
  }

  const getSquareStyles = () => {
    if (!moveValidation) return {};
    const { source, target, valid } = moveValidation;
    const color = valid ? 'rgba(0, 255, 0, 0.4)' : 'rgba(255, 0, 0, 0.4)';
    return {
      [source]: { backgroundColor: color },
      [target]: { backgroundColor: color },
    };
  };

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


  return (
    <div className="flex flex-col lg:flex-row bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-100 relative">
      <div className="fixed top-6 right-6 z-50 space-y-2">
        {messages.map((msg, idx) => (
          <Message key={idx} message={msg.content} type={msg.type} onClose={() => removeMessage(idx)} />
        ))}
      </div>

      <div className="flex-1 flex items-center justify-center p-6 relative">
        {isBrowser ? (
          <Chessboard
            onPieceDrop={onDrop}
            position={game.fen()}
            boardWidth={Math.min(window.innerWidth * 0.85, 520)}
            customDarkSquareStyle={{ backgroundColor: '#334155' }}
            customLightSquareStyle={{ backgroundColor: '#cbd5e1' }}
            boardOrientation={boardFlip}
          />
        ) : (
          <div className="text-7xl text-blue-400">LOADING...</div>
        )}
      </div>

      <aside className="w-full lg:w-[430px] bg-gray-800/95 p-8 flex flex-col gap-5 shadow-xl rounded-t-3xl lg:rounded-l-3xl">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-extrabold text-blue-400">Record Lines</h1>
          <button
            className=" bg-blue-500 hover:brightness-110 transition p-2 rounded-full shadow-lg cursor-pointer"
            onClick={toggleBoardFlip}
            aria-label="Flip Board"
          >
            <Image src={flipBoard} alt="Flip board" width={28} height={28} className='invert' />
          </button>
        </div>


        <div className="bg-gray-700 p-4 rounded-xl  shadow-inner">
          <div className="flex items-center gap-2">
            <div ref={movesContainerRef} className="font-mono text-base bg-gray-800 p-2 rounded flex-1 whitespace-nowrap overflow-x-hidden">
              {moveHistory?.map((move, i) => {
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
                return null;
              })}
              <span className=' text-red-500 rounded-full'>
                !
              </span>
            </div>

            <span className="ml-2 text-xs text-gray-400">
              {currentMoveIndex}/{moveHistory?.length ?? 0}
            </span>
          </div>
          {/* Progress bar */}
          <div className="h-2 bg-gray-600 rounded mt-2">
            <div
              className="h-2 bg-blue-500 rounded transition-all"
              style={{ width: `${((currentMoveIndex / (moveHistory?.length || 1)) * 100).toFixed(1)}%` }}
            />
          </div>
        </div>

        <div className="flex space-x-3 space-y-3  flex-wrap w-full">

          <div className="flex space-x-3 w-full -mr-3">
            <Button onClick={previousMove} disabled={currentMoveIndex === 0} text="Previous" icon="←" />
            <Button onClick={resetGame} text="Reset" icon="⟳" />
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <label htmlFor="name" className="text-sm font-semibold text-gray-200">Opening Name</label>
          <input
            type="text"
            value={pgnName}
            onChange={(e) => setPgnName(e.target.value)}
            className="w-full p-2 bg-white rounded-lg px-4 text-black"
            placeholder="Name your variation"
          />
          <label htmlFor="description" className="text-sm font-semibold text-gray-200">Description</label>
          <textarea
            value={pgnDescription}
            onChange={(e) => setPgnDescription(e.target.value)}
            className="w-full p-2 bg-white resize-none rounded-lg px-4 text-black"
            placeholder="Describe your variation"
          />
          <Button onClick={savePGN} text='Save PGN' icon="#" />
        </div>
        <div className='flex flex-col w-full gap-2'>
          <Link href={`/lessons/recorded-pgns`} className='flex flex-col gap-4 w-full'>
            <Button text="Play Recorded Lines" icon="→" />
          </Link>
          {
            isContributed && (<Link href={`/lessons/${code}`} >
              <Button text="Visit Latest Contribution" icon="→" onClick={() => {
                setIsContributed(false);
              }} />
            </Link>)
          }
        </div>

      </aside>
    </div >
  );
}