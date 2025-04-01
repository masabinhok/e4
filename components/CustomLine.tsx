'use client';
import { useState, useEffect, ChangeEvent } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import Message from './Message';
import Link from 'next/link';
import openings from '@/constants/openings';
import useLocalStorage from '@/hooks/useLocalStorage';
import { Opening } from '@/types/types';


export default function CustomPGN({ code }: { code?: string }) {
  // const currentOpening = openings.openings.find((opening) => opening.code === code);
  const [pgnName, setPgnName] = useState<string>('');
  const [pgn, setPgn] = useState<string>('');
  const [game, setGame] = useState(new Chess());
  // const [currentLineIndex, setCurrentLineIndex] = useLocalStorage<number>('currentLineIndex', 0);
  const [currentLine, setCurrentLine] = useState<string[] | undefined>([]);
  // const [lineName, setLineName] = useState(currentOpening?.variations[currentLineIndex].name);
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0);
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [autoPlay, setAutoPlay] = useState(false);
  const [boardFlip, setBoardFlip] = useState<string>('white');
  // const [mode, setMode] = useLocalStorage<'learn' | 'practice' | 'quiz'>('currentMode', 'learn');
  const [moveValidation, setMoveValidation] = useState<{ source: string; target: string; valid: boolean } | null>(null);
  // const [lineCompleted, setLineCompleted] = useState<boolean>(false);
  const [messages, setMessages] = useState<{ content: string; type: 'success' | 'error' | 'info'; onClose?: () => void }[]>([]);
  // const [mistakes, setMistakes] = useState<number>(0);
  const [isBrowser, setIsBrowser] = useState<boolean>(false);
  const [soundEvent, setSoundEvent] = useState<string | null>(null);
  const [updatedOpenings, setUpdatedOpenings] = useLocalStorage<Opening[]>('openings', openings);

  const customPgns = openings.find((opening) => opening.code === 'custom-pgns');

  useEffect(() => {
    setIsBrowser(true);
  }, []);

  useEffect(() => {
    if (!soundEvent) return;

    const playSound = (path: string) => {
      const audio = new Audio(path);
      audio.play();
    };

    switch (soundEvent) {
      case 'moveSelf':
        playSound('/audio/move-self.mp3');
        break;
      case 'moveOpponent':
        playSound('/audio/move-opponent.mp3');
        break;
      case 'achievement':
        playSound('/audio/achievement.mp3');
        break;
      case 'lessonPass':
        playSound('/audio/lesson-pass.mp3');
        break;
      case 'scatter':
        playSound('/audio/scatter.mp3');
        break;
      case 'illegal':
        playSound('/audio/illegal.mp3');
        break;
      case 'incorrect':
        playSound('/audio/incorrect.mp3');
        break;
      default:
        break;
    }

    setSoundEvent(null);
  }, [soundEvent]);

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

  // const toggleBoardFlip = () => {
  //   setBoardFlip(boardFlip === 'white' ? 'black' : 'white');
  // };

  // const loadLine = (lineKey: number) => {
  //   const moves = currentOpening?.variations[lineKey].line;
  //   setAutoPlay(false);
  //   setCurrentLine(moves);
  //   setBoardFlip(currentOpening?.variations[lineKey].boardflip || 'white');
  //   setCurrentLineIndex(currentOpening?.variations[lineKey].index!);
  //   setLineName(currentOpening?.variations[lineKey].name);
  //   setCurrentMoveIndex(0);
  //   setMoveHistory([]);
  //   setMoveValidation(null);
  //   setMistakes(0);

  //   const newGame = new Chess();
  //   setGame(newGame);
  // };

  // const handleLineCompletion = () => {
  //   setMessages([]);
  //   if (lineCompleted && mode === 'practice') {
  //     setSoundEvent('achievement');
  //     addMessage({
  //       content: "Congratulations! You've completed the line.",
  //       type: 'success',
  //       onClose: () => {
  //         setLineCompleted(false);
  //         loadRandomLine();
  //         setSoundEvent('scatter');
  //       },
  //     });
  //   }
  //   if (lineCompleted && mode === 'quiz') {
  //     setSoundEvent('lessonPass');
  //     addMessage({
  //       content: `Congratulations! You've completed the line. You made ${mistakes} mistakes.`,
  //       type: 'success',
  //       onClose: () => {
  //         setLineCompleted(false);
  //         setCurrentLineIndex(() => {
  //           const randomLineIndex = Math.floor(Math.random() * currentOpening?.variations.length!);
  //           return randomLineIndex;
  //         });
  //         loadRandomLine();
  //         setSoundEvent('scatter');
  //       },
  //     });
  //   }
  // };

  // const handleModeChange = (newMode: 'learn' | 'practice' | 'quiz') => {
  //   setMode(newMode);
  //   loadLine(currentLineIndex);
  // };

  // useEffect(() => {
  //   if (mode === 'practice' || mode === 'quiz') {
  //     if (currentOpening?.variations[currentLineIndex].boardflip === 'black' && currentMoveIndex % 2 === 0) {
  //       setTimeout(() => nextMove(), 500);
  //     }

  //     if (currentOpening?.variations[currentLineIndex].boardflip === 'white' && currentMoveIndex % 2 !== 0) {
  //       setTimeout(() => nextMove(), 500);
  //     }

  //     if (currentMoveIndex + 1 >= currentLine!.length) {
  //       setLineCompleted(true);
  //       handleLineCompletion();
  //     }
  //   }
  // }, [currentLineIndex, currentMoveIndex, mode]);

  // const nextMove = () => {

  //   if (currentMoveIndex < currentLine!.length) {
  //     setSoundEvent('moveOpponent');
  //     const move = currentLine![currentMoveIndex];
  //     const gameCopy = new Chess(game.fen());
  //     gameCopy.move(move);
  //     setGame(gameCopy);
  //     setMoveHistory([...moveHistory, move]);
  //     setCurrentMoveIndex(currentMoveIndex + 1);
  //     setMoveValidation(null);
  //     return true;
  //   }
  //   return false;
  // };

  // const loadRandomLine = () => {
  //   const randomLineIndex = Math.floor(Math.random() * currentOpening?.variations.length!);
  //   loadLine(randomLineIndex);
  // }

  // const previousMove = () => {
  //   if (currentMoveIndex > 0) {
  //     setSoundEvent('moveSelf');
  //     const newHistory = moveHistory.slice(0, -1);
  //     const newGame = new Chess();
  //     newHistory.forEach((move) => newGame.move(move));
  //     setGame(newGame);
  //     setMoveHistory(newHistory);
  //     setCurrentMoveIndex(currentMoveIndex - 1);
  //     setMoveValidation(null);
  //     return true;
  //   }
  //   return false;
  // };

  // useEffect(() => {
  //   if (autoPlay && currentMoveIndex < currentLine!.length) {
  //     setMessages([]);
  //     const timer = setTimeout(() => {
  //       nextMove();
  //     }, 1000);
  //     return () => clearTimeout(timer);
  //   } else {
  //     setAutoPlay(false);
  //   }
  // }, [autoPlay, currentMoveIndex]);



  const loadPGN = () => {
    const moves = pgn.split(' ').filter((move, index) => index % 3 !== 0);

    const gameCopy = new Chess();
    let pgnVerified = false;

    moves.forEach((move) => {
      const result = gameCopy.move(move);
      if (!result) {
        setSoundEvent('illegal');
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

      // if (currentOpening?.variations[currentLineIndex].boardflip === 'black' && currentMoveIndex % 2 === 0) {
      //   return false;
      // }
      // if (currentOpening?.variations[currentLineIndex].boardflip === 'white' && currentMoveIndex % 2 !== 0) {
      //   return false;
      // }

      if (!result) {
        setSoundEvent('illegal');
        setMoveValidation({ source: sourceSquare, target: targetSquare, valid: false });
        addMessage({
          content: 'Invalid move',
          type: 'error',
        });
        return false;
      }

      // const expectedMove = currentLine![currentMoveIndex];
      // if (!expectedMove || result.san !== expectedMove) {
      //   setSoundEvent('incorrect');
      //   setMistakes(mistakes + 1);
      //   setMoveValidation({ source: sourceSquare, target: targetSquare, valid: false });
      //   addMessage({
      //     content: 'Move does not match the expected line.',
      //     type: 'error',
      //   });
      //   return false;
      // }




      setMoveValidation({ source: sourceSquare, target: targetSquare, valid: true });
      setGame(gameCopy);
      setMoveHistory([...moveHistory, result.san]);
      setCurrentMoveIndex(currentMoveIndex + 1);
      setSoundEvent('moveSelf');

      return true;
    } catch {
      setSoundEvent('illegal');
      setMoveValidation({ source: sourceSquare, target: targetSquare, valid: false });
      addMessage({
        content: 'Invalid move',
        type: 'error',
      });
      return false;
    }
  };

  const savePGN = () => {
    if (!pgnName || !currentLine) {
      addMessage({
        content: 'Please enter a name and load a PGN.',
        type: 'error',
      });
      return;
    }

    const newPGN = {
      name: pgnName,
      line: currentLine,
      boardflip: boardFlip,
      index: customPgns?.variations.length,
      description: 'This is a custom PGN that is saved by the user. You can add your own PGNs here.',
    };

    const updatedVariations = [...(customPgns?.variations || []), newPGN];
    console.log(updatedVariations);

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
    // Save the updated openings to local storage or wherever you store them
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

  return (
    <div
      className="flex flex-col lg:flex-row bg-gray-900 text-gray-100  min-h-screen"
    >
      <div className="space-y-2">
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
        <h1 className="text-2xl font-bold text-blue-400 mb-6">Custom PGN</h1>
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
            Play Custom PGNs
          </button>
        </Link>

      </div>
    </div >
  );
}