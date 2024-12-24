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
          className="flex items-center justify-between p-3 border-2 border-game-accent/30 rounded-lg bg-game-background/50"
        >
          <div className="flex space-x-2 font-mono text-xl text-game-accent">
            {guess.numbers.map((num, idx) => (
              <span key={idx}>{num}</span>
            ))}
          </div>
          <div className="flex space-x-4 text-sm">
            <span className="text-red-500">{guess.dead} Dead</span>
            <span className="text-yellow-500">{guess.injured} Injured</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default GuessHistory;