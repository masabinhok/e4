'use client';
import { useState, useEffect, useRef } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import Message from './Message';
import Link from 'next/link';
import useLocalStorage from '@/hooks/useLocalStorage';
import { BoardFlip, Opening } from '@/types/types';
import flipBoard from '@/public/flip.svg';
import { useSound } from '@/contexts/SoundContext';
import Image from 'next/image';
import Button from './Button';

export default function CustomPGN() {
  const [pgnName, setPgnName] = useState<string>('');
  const [pgn, setPgn] = useState<string>('');
  const [game, setGame] = useState(new Chess());
  const [currentLine, setCurrentLine] = useState<string[]>([]);
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0);
  const [boardFlip, setBoardFlip] = useLocalStorage<BoardFlip>('boardFlip', 'white');
  const [messages, setMessages] = useState<{ content: string; type: 'success' | 'error' | 'info'; onClose?: () => void }[]>([]);
  const [isBrowser, setIsBrowser] = useState<boolean>(false);
  const [description, setDescription] = useState<string>('');
  const { playSound } = useSound();


  const toggleBoardFlip = () => {
    setBoardFlip(boardFlip === 'white' ? 'black' : 'white');
  };

  const movesContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsBrowser(true);
  }, []);

  const loadPGN = () => {
    try {
      const moves = pgn
        .replace(/\d+\./g, '')
        .split(' ')
        .map(m => m.trim())
        .filter(Boolean);

      const gameCopy = new Chess();
      moves.forEach(move => {
        if (!gameCopy.move(move)) throw new Error('Invalid move');
      });

      setMessages([]);
      setGame(new Chess());
      setCurrentLine(moves);
      setCurrentMoveIndex(0);
    } catch (error) {
      playSound('illegal');
      addMessage({ content: `Invalid PGN format, ${error}`, type: 'error' });
      
    }
  };

  useEffect(() => {
    if (!pgn) return;
    if (currentMoveIndex < currentLine.length) {
      const timer = setTimeout(() => {
        const move = currentLine[currentMoveIndex];
        const gameCopy = new Chess(game.fen());
        const result = gameCopy.move(move);
        setGame(gameCopy);
        setCurrentMoveIndex(prev => prev + 1);

        if (gameCopy.inCheck()) playSound('check');
        else if (result.captured) playSound('capture');
        else playSound('moveSelf');
      }, 100);
      return () => clearTimeout(timer);
    }
    else {
      addMessage({ content: 'PGN loaded successfully', type: 'success' });
      setTimeout(() => {
        playSound('achievement');
      }, 1)
    }
  }, [currentMoveIndex, currentLine]);

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

        addMessage({
          content: 'Invalid move',
          type: 'error',
        });
        return false;
      }

      setGame(gameCopy);

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
        inline: 'end'
      })
    }
  }, [currentMoveIndex])


  const savePGN = async () => {

    if (!pgn) {
      addMessage({ content: 'No moves to save', type: 'error' });
      return;
    }

    if (!pgnName) {
      addMessage({ content: 'Please enter a name', type: 'error' });
      return;
    }

    if (!description) {
      addMessage({ content: 'Please describe your custom loaded pgn', type: 'error' });
      return;
    }

    const newPGN = {
      title: pgnName,
      moves: currentLine,
      boardflip: boardFlip,
      description: description
    };

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/openings/contribute/custom-pgns`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newPGN),
    });

    if (!res.ok) {
      throw new Error('Failed to save PGN');
    }

    const data = await res.json();
    console.log('PGN saved:', data);
    setPgnName('');
    setDescription('');
    setPgn('');
    setCurrentLine([]);
    setCurrentMoveIndex(0);
    addMessage({ content: 'PGN saved successfully', type: 'success' });
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
          <h1 className="text-2xl font-extrabold text-blue-400">Custom Lines</h1>
          <button
            className=" bg-blue-500 hover:brightness-110 transition p-2 rounded-full shadow-lg cursor-pointer"
            onClick={toggleBoardFlip}
            aria-label="Flip Board"
          >
            <Image src={flipBoard} alt="Flip board" width={28} height={28} className='invert' />
          </button>

        </div>

        <div className="flex flex-col gap-4">
          <input
            type="text"
            value={pgn}
            onChange={(e) => setPgn(e.target.value)}
            className="w-full p-2 bg-white rounded-lg px-4 text-black"
            placeholder="Paste PGN here"
          />

          <Button onClick={loadPGN} disabled={!pgn} text='Load & Verify PGN' icon="!" />

        </div>

        <div className="bg-gray-700 p-4 rounded-xl mb-4 shadow-inner">
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
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 bg-white resize-none rounded-lg px-4 text-black"
            placeholder="Describe your variation"
          />
          <Button onClick={savePGN} text='Save PGN' icon="#" />
        </div>

        <Link href="/lessons/custom-pgns">
          <Button text='View Saved PGNs' icon="@" />
        </Link>
      </aside>
    </div>
  );
}
