'use client';
import { useState, useEffect, ChangeEvent } from 'react';
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

export default function CustomPGN({ code }: { code?: string }) {
  const [pgnName, setPgnName] = useState<string>('');
  const [pgn, setPgn] = useState<string>('');
  const [game, setGame] = useState(new Chess());
  const [currentLine, setCurrentLine] = useState<string[]>([]);
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0);
  const [boardFlip, setBoardFlip] = useLocalStorage<BoardFlip>('boardFlip', 'white');
  const [messages, setMessages] = useState<{ content: string; type: 'success' | 'error' | 'info'; onClose?: () => void }[]>([]);
  const [isBrowser, setIsBrowser] = useState<boolean>(false);
  const [openings, setOpenings] = useLocalStorage<Opening[]>('openings', []);
  const { playSound } = useSound();

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
      addMessage({ content: 'Invalid PGN format', type: 'error' });
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
      addMessage({
        content: 'Invalid move',
        type: 'error',
      });
      return false;
    }
  };



  const savePGN = () => {

    if (!pgn) {
      addMessage({ content: 'No moves to save', type: 'error' });
      return;
    }

    if (!pgnName) {
      addMessage({ content: 'Please enter a name', type: 'error' });
      return;
    }

    const newPGN = {
      title: pgnName,
      moves: currentLine,
      boardflip: boardFlip,
      index: openings.find(o => o.code === 'custom-pgns')?.variations.length || 0,
      description: 'Custom PGN saved by user',
    };



    setPgnName('');
    setPgn('');
    setCurrentLine([]);
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
            className="bg-blue-500 p-2 rounded-full shadow-lg"
            onClick={() => setBoardFlip(prev => prev === 'white' ? 'black' : 'white')}
          >
            <Image src={flipBoard} alt="Flip board" width={28} height={28} className="invert" />
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

        <div className="bg-gray-700 p-4 rounded-xl">
          <div className="font-mono bg-gray-800 p-2 rounded overflow-x-auto">
            {currentLine.slice(0, currentMoveIndex).join(' ')}
            <span className="text-green-400">
              {currentMoveIndex < currentLine.length && ` ${currentLine[currentMoveIndex]}`}
            </span>
          </div>
          <div className="h-2 bg-gray-600 mt-2">
            <div
              className="h-2 bg-blue-500 transition-all"
              style={{ width: `${(currentMoveIndex / currentLine.length * 100).toFixed(1)}%` }}
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
          <Button onClick={savePGN} disabled={!pgnName} text='Save PGN' icon="#" />
        </div>

        <Link href="/lessons/custom-pgns">
          <Button text='View Saved PGNs' icon="@"/>
        </Link>
      </aside>
    </div>
  );
}
