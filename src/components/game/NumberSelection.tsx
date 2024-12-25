import React from 'react';
import NumberButton from '../NumberButton';

interface NumberSelectionProps {
  selectedNumbers: number[];
  onNumberClick: (number: number) => void;
  disabled?: boolean;
}

const NumberSelection = ({ selectedNumbers, onNumberClick, disabled }: NumberSelectionProps) => {
  return (
    <div className="space-y-6">
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

      <div className="grid grid-cols-5 gap-2 justify-center max-w-xs mx-auto">
        {Array.from({ length: 10 }, (_, i) => (
          <NumberButton
            key={i}
            number={i}
            onClick={onNumberClick}
            selected={selectedNumbers.includes(i)}
            disabled={
              disabled ||
              (selectedNumbers.length === 4 && !selectedNumbers.includes(i))
            }
          />
        ))}
      </div>
    </div>
  );
};

export default NumberSelection;