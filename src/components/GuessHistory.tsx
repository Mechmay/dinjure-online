import React from 'react';
import { useTheme } from './theme/ThemeProvider';
import { cn } from '@/lib/utils';

interface GuessHistoryProps {
  guesses: {
    numbers: number[];
    dead: number;
    injured: number;
    player?: number;  // Added player prop for offline mode
  }[];
}

const GuessHistory: React.FC<GuessHistoryProps> = ({ guesses }) => {
  const { theme } = useTheme();
  
  return (
    <div className="space-y-2">
      {guesses.map((guess, index) => (
        <div
          key={index}
          className={cn(
            'p-2 rounded transition-colors',
            theme === 'light' 
              ? 'bg-white border border-gray-200' 
              : 'bg-white/5 border border-game-accent/20',
            guess.player === 1 && 'border-l-4 border-l-blue-500',
            guess.player === 2 && 'border-l-4 border-l-red-500',
            !guess.player && 'border-l-4 border-l-purple-500' // For computer mode
          )}
        >
          <span className={cn(
            guess.player === 1 && 'text-blue-500',
            guess.player === 2 && 'text-red-500',
            !guess.player && 'text-purple-500',
            theme === 'light' ? 'text-opacity-90' : 'text-opacity-100'
          )}>
            {guess.numbers.join(' ')} -{' '}
          </span>
          <span className={theme === 'light' ? 'text-gray-600' : 'text-game-accent'}>
            {guess.dead === 4
              ? '4 Dead! Dinjure!'
              : `${guess.dead} Dead, ${guess.injured} Injured`}
          </span>
        </div>
      ))}
    </div>
  );
};

export default GuessHistory;