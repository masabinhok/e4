'use client';
import { useState, useEffect, ChangeEvent } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import Message from './Message';
import Link from 'next/link';
import openings from '@/constants/openings';
import useLocalStorage from '@/hooks/useLocalStorage';
import { Opening } from '@/types/types';
import { useSound } from '@/contexts/SoundContext';

export default function RecordLine() {
  const [pgnName, setPgnName] = useState<string>('');
  const [pgn, setPgn] = useState<string>('');
  const [game, setGame] = useState(new Chess());
  const [currentLine, setCurrentLine] = useState<string[] | undefined>([]);
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0);
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [autoPlay, setAutoPlay] = useState(false);
  const [boardFlip, setBoardFlip] = useState<string>('white');
  const [moveValidation, setMoveValidation] = useState<{ source: string; target: string; valid: boolean } | null>(null);
  const [messages, setMessages] = useState<{ content: string; type: 'success' | 'error' | 'info'; onClose?: () => void }[]>([]);
  const [isBrowser, setIsBrowser] = useState<boolean>(false);
  const [updatedOpenings, setUpdatedOpenings] = useLocalStorage<Opening[]>('openings', openings);
  const { playSound } = useSound();



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
      if (result.captured) {
        playSound('capture');
      } else {
        playSound('moveSelf');
      }


      if (result.isKingsideCastle() || result.isQueensideCastle()) {
        playSound('castle')
      }

      if (gameCopy.inCheck()) {
        playSound('check');
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


  const resetGame = () => {
    setGame(new Chess());
    setMoveHistory([]);
    setCurrentMoveIndex(0);
    setMoveValidation(null);
  }

  const savePGN = () => {
    if (!pgnName || !moveHistory) {
      addMessage({
        content: 'Please enter a name and play some moves.',
        type: 'error',
      });
      return;
    }


    const recordedPgnsFromStorage = updatedOpenings.find((opening) => opening.code === 'recorded-pgns');

    const newPGN = {
      name: pgnName,
      line: moveHistory,
      boardflip: boardFlip,
      index: recordedPgnsFromStorage?.variations.length || 0,
      description: 'This is a recorded PGN that is saved by the user. You can record your own PGNs here.',
    };

    const updatedVariations = [...(recordedPgnsFromStorage?.variations || []), newPGN];

    // now append the new variation to the existing variations
    const newOpenings = updatedOpenings.map((opening) => {
      if (opening.code === 'recorded-pgns') {
        return {
          ...opening,
          variations: updatedVariations,
        };
      }
      return opening;
    });

    // Save the updated openings to local storage
    setUpdatedOpenings(newOpenings as Opening[]);

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
    <div
      className="flex flex-col lg:flex-row bg-gray-900 text-gray-100  min-h-screen"
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
        className="flex-1 flex items-center justify-center p-4">
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
        <h1 className="text-2xl font-bold text-blue-400 mb-6">Record Lines</h1>
        <div className="bg-gray-700 p-4 rounded-md mb-6 w-full">
          <h2 className="font-bold text-blue-400 ">Moves</h2>

          <div className="font-mono bg-gray-800 p-2 rounded min-h-[40px] mt-1">
            {moveHistory!.slice(0, currentMoveIndex).join(' ')}
            {currentMoveIndex < moveHistory!.length && (
              <span className="text-green-400">{moveHistory![currentMoveIndex]}</span>
            )}
          </div>
          <div className='flex flex-col gap-4 w-full mt-4'>
            <label className='flex flex-col w-full' htmlFor="pgn" >
              <span>Name your recording</span>
              <input type="text" id='pgn' value={pgnName} onChange={(e: ChangeEvent<HTMLInputElement>) => setPgnName(e.target.value)} className='w-full p-2 outline-none bg-white rounded-sm mt-2 px-4 placeholder-gray-500 text-sm text-black' placeholder='e.g. Recorded Line 1' />
            </label>
            <button
              onClick={(savePGN)}
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md w-full"
            >
              Save PGN
            </button>
          </div>
        </div>
        <div className="flex space-x-3 space-y-3 mb-6 flex-wrap w-full">

          <div className="flex space-x-3 w-full -mr-3">
            <button
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md w-full"
              onClick={previousMove}
              disabled={currentMoveIndex === 0}
            >
              Previous Move
            </button>
            <button
              className=" bg-red-600 hover:bg-red-700 px-4 py-2 rounded-md w-full"
              onClick={() => {
                resetGame();
              }}
            >
              Reset
            </button>
          </div>


          <button
            className="border border-gray-500 px-4 py-2  rounded-md w-full"
            onClick={() => toggleBoardFlip()}
          >
            Flip board
          </button>
        </div>
        <Link href="/lessons/recorded-pgns" className='flex flex-col gap-4 w-full'>
          <button
            className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-md w-full"
          >
            Play Recorded Lines
          </button>
        </Link>
        <button
          onClick={() => {
            const recordedPgnsFromStorage = updatedOpenings.find((opening) => {
              return opening.code === 'recorded-pgns'
            })
            recordedPgnsFromStorage?.variations.forEach((variation) => {
              console.log(variation.line)
            })

          }}
          className="bg-yellow-600 hover:bg-yellow-700 px-4 py-2 mt-3  rounded-md w-full"
        >
          Print Recorded Lines
        </button>

      </div>
    </div >
  );
}