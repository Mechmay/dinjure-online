import React from 'react';
import { useTheme } from './theme/ThemeProvider';

interface GuessHistoryProps {
  guesses: {
    numbers: number[];
    dead: number;
    injured: number;
  }[];
}

const GuessHistory: React.FC<GuessHistoryProps> = ({ guesses }) => {
  const { theme } = useTheme();
  
  return (
    <div className="space-y-2">
      {guesses.map((guess, index) => (
        <div
          key={index}
          className={`p-2 rounded ${
            theme === 'light'
              ? 'bg-white border border-gray-200'
              : 'bg-white/5 border border-game-accent/20'
          }`}
        >
          <span className={theme === 'light' ? 'text-gray-800' : 'text-white'}>
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