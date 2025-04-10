import React, { useState } from 'react';
import { GameMode } from './components/GameMode';
import { Board } from './components/Board';
import { Users, Bot, RotateCcw, Home } from 'lucide-react';
import { useSound } from './hooks/useSound';

type Mode = 'select' | 'pvp' | 'pve';

function App() {
  const [mode, setMode] = useState<Mode>('select');
  const [gameKey, setGameKey] = useState(0);
  const playSound = useSound();

  const resetGame = () => {
    playSound('click');
    setGameKey(prev => prev + 1);
  };

  const goHome = () => {
    playSound('click');
    setMode('select');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-2xl p-4 sm:p-6 md:p-8 w-full max-w-2xl">
        {mode === 'select' ? (
          <GameMode onSelectMode={(selectedMode) => setMode(selectedMode)} />
        ) : (
          <div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center gap-2">
                {mode === 'pvp' ? (
                  <>
                    <Users className="w-6 h-6 sm:w-8 sm:h-8" />
                    Player vs Player
                  </>
                ) : (
                  <>
                    <Bot className="w-6 h-6 sm:w-8 sm:h-8" />
                    Player vs Bot
                  </>
                )}
              </h1>
              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  onClick={resetGame}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1 px-3 sm:px-4 py-2 bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-200 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Reset</span>
                </button>
                <button
                  onClick={goHome}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1 px-3 sm:px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Home className="w-4 h-4" />
                  <span>Home</span>
                </button>
              </div>
            </div>
            <Board key={gameKey} mode={mode} />
          </div>
        )}
      </div>
    </div>
  );
}

export default App