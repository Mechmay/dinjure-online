import React from 'react';

interface Guess {
  numbers: number[];
  dead: number;
  injured: number;
}

interface GuessHistoryProps {
  guesses: Guess[];
}

const GuessHistory = ({ guesses }: GuessHistoryProps) => {
  return (
    <div className="w-full max-w-md space-y-2">
      {guesses.map((guess, index) => (
        <div
          key={index}
          className="flex items-center justify-between p-3 border-2 dark:border-game-accent/30 border-game-accent-light/30 rounded-lg dark:bg-game-background/50 bg-game-background-light/50"
        >
          <div className="flex space-x-2 font-mono text-xl dark:text-game-accent text-game-accent-light">
            {guess.numbers.map((num, idx) => (
              <span key={idx}>{num}</span>
            ))}
          </div>
          <div className="flex space-x-4 text-sm">
            <span className="text-red-500">{guess.dead} Dead</span>
            <span className="text-yellow-500">{guess.injured} Dinjure</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default GuessHistory;