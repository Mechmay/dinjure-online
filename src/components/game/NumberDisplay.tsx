import React from 'react';

interface NumberDisplayProps {
  selectedNumbers: number[];
}

const NumberDisplay = ({ selectedNumbers }: NumberDisplayProps) => {
  return (
    <div className="flex justify-center gap-2">
      {selectedNumbers.map((num, index) => (
        <div
          key={index}
          className="w-12 h-12 border-2 border-game-accent rounded flex items-center justify-center text-xl font-mono text-game-accent"
        >
          {num}
        </div>
      ))}
      {Array(4 - selectedNumbers.length)
        .fill(null)
        .map((_, index) => (
          <div
            key={`empty-${index}`}
            className="w-12 h-12 border-2 border-game-accent/30 rounded flex items-center justify-center text-xl font-mono"
          >
            _
          </div>
        ))}
    </div>
  );
};

export default NumberDisplay;