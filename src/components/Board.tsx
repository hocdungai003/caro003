import React, { useState, useEffect } from 'react';
import { Trophy, Loader2 } from 'lucide-react';
import { useSound } from '../hooks/useSound';

interface BoardProps {
  mode: 'pvp' | 'pve';
}

type Player = 'X' | 'O';
type Cell = Player | null;
type Board = Cell[][];

const BOARD_SIZE = 15;
const WIN_CONDITION = 5;

// Score weights for bot evaluation
const WEIGHTS = {
  win: 100000,
  fourInRow: 10000,
  threeInRow: 1000,
  twoInRow: 100,
  one: 10,
};

export function Board({ mode }: BoardProps) {
  const [board, setBoard] = useState<Board>(() =>
    Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null))
  );
  const [currentPlayer, setCurrentPlayer] = useState<Player>('X');
  const [winner, setWinner] = useState<Player | null>(null);
  const [winningCells, setWinningCells] = useState<[number, number][]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [lastMove, setLastMove] = useState<[number, number] | null>(null);
  const playSound = useSound();

  const checkWin = (row: number, col: number, player: Player, tempBoard?: Board): boolean => {
    const currentBoard = tempBoard || board;
    const directions = [
      [1, 0],   // horizontal
      [0, 1],   // vertical
      [1, 1],   // diagonal
      [1, -1],  // anti-diagonal
    ];

    for (const [dx, dy] of directions) {
      let count = 1;
      const winningPositions: [number, number][] = [[row, col]];

      // Check forward
      for (let i = 1; i < WIN_CONDITION; i++) {
        const newRow = row + dx * i;
        const newCol = col + dy * i;
        if (
          newRow >= 0 && newRow < BOARD_SIZE &&
          newCol >= 0 && newCol < BOARD_SIZE &&
          currentBoard[newRow][newCol] === player
        ) {
          count++;
          winningPositions.push([newRow, newCol]);
        } else {
          break;
        }
      }

      // Check backward
      for (let i = 1; i < WIN_CONDITION; i++) {
        const newRow = row - dx * i;
        const newCol = col - dy * i;
        if (
          newRow >= 0 && newRow < BOARD_SIZE &&
          newCol >= 0 && newCol < BOARD_SIZE &&
          currentBoard[newRow][newCol] === player
        ) {
          count++;
          winningPositions.push([newRow, newCol]);
        } else {
          break;
        }
      }

      if (count >= WIN_CONDITION) {
        if (!tempBoard) {
          setWinningCells(winningPositions);
        }
        return true;
      }
    }

    return false;
  };

  const evaluatePosition = (row: number, col: number, player: Player, tempBoard: Board): number => {
    let score = 0;
    const directions = [
      [1, 0],   // horizontal
      [0, 1],   // vertical
      [1, 1],   // diagonal
      [1, -1],  // anti-diagonal
    ];

    for (const [dx, dy] of directions) {
      let consecutive = 1;
      let blocked = 0;

      // Check forward
      for (let i = 1; i < 5; i++) {
        const newRow = row + dx * i;
        const newCol = col + dy * i;
        if (
          newRow >= 0 && newRow < BOARD_SIZE &&
          newCol >= 0 && newCol < BOARD_SIZE
        ) {
          if (tempBoard[newRow][newCol] === player) {
            consecutive++;
          } else if (tempBoard[newRow][newCol] !== null) {
            blocked++;
            break;
          } else {
            break;
          }
        } else {
          blocked++;
          break;
        }
      }

      // Check backward
      for (let i = 1; i < 5; i++) {
        const newRow = row - dx * i;
        const newCol = col - dy * i;
        if (
          newRow >= 0 && newRow < BOARD_SIZE &&
          newCol >= 0 && newCol < BOARD_SIZE
        ) {
          if (tempBoard[newRow][newCol] === player) {
            consecutive++;
          } else if (tempBoard[newRow][newCol] !== null) {
            blocked++;
            break;
          } else {
            break;
          }
        } else {
          blocked++;
          break;
        }
      }

      // Add score based on consecutive pieces and blockage
      if (consecutive >= 5) {
        score += WEIGHTS.win;
      } else if (consecutive === 4) {
        score += blocked === 2 ? 0 : WEIGHTS.fourInRow;
      } else if (consecutive === 3) {
        score += blocked === 2 ? 0 : WEIGHTS.threeInRow;
      } else if (consecutive === 2) {
        score += blocked === 2 ? 0 : WEIGHTS.twoInRow;
      }
    }

    // Add position-based scoring (center positions are better)
    const centerDistance = Math.abs(row - BOARD_SIZE / 2) + Math.abs(col - BOARD_SIZE / 2);
    score += (BOARD_SIZE - centerDistance) * WEIGHTS.one;

    return score;
  };

  const findBestMove = (currentBoard: Board): [number, number] => {
    let bestScore = -Infinity;
    let bestMove: [number, number] = [0, 0];
    
    // First, check if we can win in one move
    for (let i = 0; i < BOARD_SIZE; i++) {
      for (let j = 0; j < BOARD_SIZE; j++) {
        if (!currentBoard[i][j]) {
          const newBoard = currentBoard.map(row => [...row]);
          newBoard[i][j] = 'O';
          if (checkWin(i, j, 'O', newBoard)) {
            return [i, j];
          }
        }
      }
    }

    // Then, check if we need to block opponent's winning move
    for (let i = 0; i < BOARD_SIZE; i++) {
      for (let j = 0; j < BOARD_SIZE; j++) {
        if (!currentBoard[i][j]) {
          const newBoard = currentBoard.map(row => [...row]);
          newBoard[i][j] = 'X';
          if (checkWin(i, j, 'X', newBoard)) {
            return [i, j];
          }
        }
      }
    }

    // If no immediate win or block needed, evaluate positions
    for (let i = 0; i < BOARD_SIZE; i++) {
      for (let j = 0; j < BOARD_SIZE; j++) {
        if (!currentBoard[i][j]) {
          const newBoard = currentBoard.map(row => [...row]);
          newBoard[i][j] = 'O';
          
          const score = evaluatePosition(i, j, 'O', newBoard);
          if (score > bestScore) {
            bestScore = score;
            bestMove = [i, j];
          }
        }
      }
    }

    return bestMove;
  };

  const makeMove = (row: number, col: number) => {
    if (board[row][col] || winner) return;

    const newBoard = board.map(row => [...row]);
    newBoard[row][col] = currentPlayer;
    setBoard(newBoard);
    setLastMove([row, col]);

    // Phát âm thanh khác nhau cho X và O
    playSound(currentPlayer === 'X' ? 'click' : 'place');

    if (checkWin(row, col, currentPlayer)) {
      setWinner(currentPlayer);
      playSound('win');
      return;
    }

    setCurrentPlayer(currentPlayer === 'X' ? 'O' : 'X');
  };

  // Bot move
  useEffect(() => {
    if (mode === 'pve' && currentPlayer === 'O' && !winner) {
      setIsThinking(true);
      const timer = setTimeout(() => {
        const [row, col] = findBestMove(board);
        makeMove(row, col);
        setIsThinking(false);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [currentPlayer, mode, winner, board]); // Thêm board vào dependencies

  const getCellClassName = (row: number, col: number) => {
    const isWinning = winningCells.some(([r, c]) => r === row && c === col);
    const isLastMove = lastMove && lastMove[0] === row && lastMove[1] === col;
    const baseClass = "w-6 h-6 sm:w-8 sm:h-8 md:w-9 md:h-9 border border-gray-200 flex items-center justify-center text-base sm:text-lg md:text-xl font-bold transition-all touch-manipulation";
    
    if (isWinning) {
      return `${baseClass} bg-green-100 border-green-300`;
    }
    
    if (isLastMove) {
      return `${baseClass} bg-yellow-50 border-yellow-300`;
    }
    
    return `${baseClass} hover:bg-gray-50 active:bg-gray-100`;
  };

  return (
    <div className="w-full overflow-x-auto pb-4">
      <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
        {!winner && (
          <div className="flex items-center gap-2 text-base sm:text-lg font-semibold text-gray-700">
            Current Turn: 
            <span className={`px-2 sm:px-3 py-1 rounded-full ${
              currentPlayer === 'X' ? 'bg-blue-100 text-blue-600' : 'bg-red-100 text-red-600'
            }`}>
              {currentPlayer}
            </span>
            {isThinking && mode === 'pve' && currentPlayer === 'O' && (
              <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin text-gray-600" />
            )}
          </div>
        )}

        {winner && (
          <div className="flex items-center gap-2 text-lg sm:text-xl font-bold text-green-600">
            <Trophy className="w-5 h-5 sm:w-6 sm:h-6" />
            Player {winner} Wins!
          </div>
        )}
      </div>

      <div className="inline-block bg-white rounded-lg p-2 sm:p-3 shadow-lg">
        <div className="min-w-fit">
          {board.map((row, i) => (
            <div key={i} className="flex">
              {row.map((cell, j) => (
                <button
                  key={`${i}-${j}`}
                  className={getCellClassName(i, j)}
                  onClick={() => makeMove(i, j)}
                  disabled={!!winner || (mode === 'pve' && currentPlayer === 'O')}
                >
                  {cell && (
                    <span 
                      className={`${
                        cell === 'X' ? 'text-blue-600' : 'text-red-600'
                      } transform transition-transform duration-200 ${
                        lastMove && lastMove[0] === i && lastMove[1] === j ? 'scale-110' : ''
                      }`}
                    >
                      {cell}
                    </span>
                  )}
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}