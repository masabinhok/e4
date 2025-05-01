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



export default function CustomPGN({ code }: { code?: string }) {
  const [pgnName, setPgnName] = useState<string>('');
  const [pgn, setPgn] = useState<string>('');
  const [game, setGame] = useState(new Chess());
  const [currentLine, setCurrentLine] = useState<string[] | undefined>([]);
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0);
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [autoPlay, setAutoPlay] = useState(false);
  const [boardFlip, setBoardFlip] = useLocalStorage<BoardFlip>('boardFlip', 'white');
  const [moveValidation, setMoveValidation] = useState<{ source: string; target: string; valid: boolean } | null>(null);
  const [messages, setMessages] = useState<{ content: string; type: 'success' | 'error' | 'info'; onClose?: () => void }[]>([]);
  const [isBrowser, setIsBrowser] = useState<boolean>(false);


  const [openings, setOpenings] = useLocalStorage<Opening[]>('openings', []);
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


  const loadPGN = () => {
    try {
      const moves = pgn.split(' ').filter((move, index) => index % 3 !== 0);

      const gameCopy = new Chess();
      let pgnVerified = false;

      moves.forEach((move) => {
        const result = gameCopy.move(move);
        if (!result) {
          playSound('illegal');
          setMoveValidation({ source: '', target: '', valid: false });
          addMessage({
            content: 'Invalid move',
            type: 'error',
          });
          return false;
        }
        pgnVerified = true;
        setMoveHistory((prev) => [...prev, result.san]);
        setCurrentMoveIndex((prev) => prev + 1);
        setGame(gameCopy);
        setMoveValidation({ source: '', target: '', valid: true });
        setPgn('');
      });
      if (pgnVerified) {
        setMessages([]);
        setCurrentLine(moves);
        addMessage({
          content: 'PGN loaded successfully',
          type: 'success',
        });
      }
    }
    catch (error) {
      playSound('illegal');
      setMoveValidation({ source: '', target: '', valid: false });
      addMessage({
        content: 'Invalid PGN format',
        type: 'error',
      });
      return false;
    }

  }


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

  const toggleBoardFlip = () => {
    setBoardFlip((prev) => (prev === 'white' ? 'black' : 'white'));
  }

  const savePGN = () => {
    if (!pgnName || !currentLine) {
      addMessage({
        content: 'Please enter a name and load a PGN.',
        type: 'error',
      });
      return;
    }

    const customPgnsFromStorage = openings.find((opening) => opening.code === 'custom-pgns');

    const newPGN = {
      name: pgnName,
      line: currentLine,
      boardflip: boardFlip,
      index: customPgnsFromStorage?.variations.length || 0,
      description: 'This is a custom PGN that is saved by the user. You can add your own PGNs here.',
    };

    const updatedVariations = [...(customPgnsFromStorage?.variations || []), newPGN];

    // now append the new variation to the existing variations
    const newOpenings = openings.map((opening) => {
      if (opening.code === 'custom-pgns') {
        return {
          ...opening,
          variations: updatedVariations,
        };
      }
      return opening;
    });

    // Save the updated openings to local storage
    setOpenings
    setPgnName('');
    setPgn('');
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

  return (
    <div
      className="flex flex-col lg:flex-row bg-gray-900 text-gray-100  min-h-screen relative"
    >
     
      <div className="space-y-2 fixed top-4 right-4 z-50">
        {messages.map((msg, index) => (
          <Message key={index} message={msg.content} type={msg.type} onClose={() => removeMessage(index)} />
        ))}
      </div>

      <div
        onAuxClick={() => {
          setMoveValidation(null);
        }}
        className="flex-1 flex items-center justify-center p-4 relative">

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

      <div className="w-full lg:w-96 bg-gray-800 p-6 overflow-y-auto h-full max-h- flex justify-start items-start  flex-col my-12 mr-4 ">
        <div className='flex items-center gap-5 justify-between w-full'>
          <h1 className="text-2xl font-bold text-blue-400 mb-6">Custom Lines</h1>
          <Image onClick={toggleBoardFlip} src={flipBoard} alt='flipboardicon' height={40} width={40} className='cursor-pointer mb-5' />
        </div>
        <div className='flex flex-col gap-4 w-full'>
          <label className='flex flex-col w-full' htmlFor="pgn" >
            <span>Enter PGN</span>
            <input type="text" id='pgn' value={pgn} onChange={(e: ChangeEvent<HTMLInputElement>) => setPgn(e.target.value)} className='w-full p-2 outline-none bg-white rounded-sm mt-2 px-4 placeholder-gray-500 text-sm text-black' placeholder='1. e4 e5 2. Nf3 Nc6 3. Bb5 a6' />
          </label>
          <button
            onClick={(loadPGN)}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md w-full"
          >
            Load PGN
          </button>
        </div>
        <div className="bg-gray-700 p-4 rounded-md mb-6 mt-5 w-full">
          <h2 className="font-bold text-blue-400 ">Moves</h2>

          <div className="font-mono bg-gray-800 p-2 rounded min-h-[40px] mt-1">
            {currentLine!.slice(0, currentMoveIndex).join(' ')}
            {currentMoveIndex < currentLine!.length && (
              <span className="text-green-400">{currentLine![currentMoveIndex]}</span>
            )}
          </div>
          <div className='flex flex-col gap-4 w-full mt-4'>
            <label className='flex flex-col w-full' htmlFor="pgn" >
              <span>Name your custom PGN</span>
              <input type="text" id='pgn' value={pgnName} onChange={(e: ChangeEvent<HTMLInputElement>) => setPgnName(e.target.value)} className='w-full p-2 outline-none bg-white rounded-sm mt-2 px-4 placeholder-gray-500 text-sm text-black' placeholder='Practice Opening 1' />
            </label>
            <button
              onClick={(savePGN)}
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md w-full"
            >
              Save PGN
            </button>
          </div>
        </div>
        <Link href="/lessons/custom-pgns" className='flex flex-col gap-4 w-full'>
          <button
            className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-md w-full"
          >
            Play Custom Lines
          </button>
        </Link>

      </div>
    </div >
  );
}