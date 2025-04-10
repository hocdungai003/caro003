import React from 'react';
import { Users, Bot, ArrowRight } from 'lucide-react';
import { useSound } from '../hooks/useSound';

interface GameModeProps {
  onSelectMode: (mode: 'pvp' | 'pve') => void;
}

export function GameMode({ onSelectMode }: GameModeProps) {
  const [selectedMode, setSelectedMode] = React.useState<'pvp' | 'pve' | null>(null);
  const playSound = useSound();

  const handleModeSelect = (mode: 'pvp' | 'pve') => {
    playSound('click');
    setSelectedMode(mode);
  };

  const handleStartGame = () => {
    if (selectedMode) {
      playSound('start');
      onSelectMode(selectedMode);
    }
  };

  return (
    <div className="text-center">
      <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">Gomoku Game</h1>
      <p className="text-gray-600 mb-6 sm:mb-8">Challenge your friends or test your skills against the AI!</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <button
          className={`p-6 sm:p-8 rounded-xl border-2 transition-all transform hover:scale-105 ${
            selectedMode === 'pvp'
              ? 'border-indigo-500 bg-indigo-50 shadow-md'
              : 'border-gray-200 hover:border-indigo-200 hover:bg-gray-50'
          }`}
          onClick={() => handleModeSelect('pvp')}
        >
          <Users className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 text-indigo-500" />
          <h2 className="text-lg sm:text-xl font-semibold mb-2">Player vs Player</h2>
          <p className="text-sm sm:text-base text-gray-600">Play against another player locally</p>
        </button>

        <button
          className={`p-6 sm:p-8 rounded-xl border-2 transition-all transform hover:scale-105 ${
            selectedMode === 'pve'
              ? 'border-indigo-500 bg-indigo-50 shadow-md'
              : 'border-gray-200 hover:border-indigo-200 hover:bg-gray-50'
          }`}
          onClick={() => handleModeSelect('pve')}
        >
          <Bot className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 text-indigo-500" />
          <h2 className="text-lg sm:text-xl font-semibold mb-2">Player vs Bot</h2>
          <p className="text-sm sm:text-base text-gray-600">Challenge our intelligent AI opponent</p>
        </button>
      </div>

      <button
        className={`w-full sm:w-auto px-6 sm:px-8 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 mx-auto transition-all transform hover:scale-105 ${
          selectedMode
            ? 'bg-indigo-500 text-white hover:bg-indigo-600 shadow-lg'
            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
        }`}
        disabled={!selectedMode}
        onClick={handleStartGame}
      >
        Start Game
        <ArrowRight className="w-5 h-5" />
      </button>
    </div>
  );
}