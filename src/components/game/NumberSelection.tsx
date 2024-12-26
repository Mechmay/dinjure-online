import React from 'react';
import NumberButton from '../NumberButton';

interface NumberSelectionProps {
  selectedNumbers: number[];
  onNumberClick: (number: number) => void;
  disabled?: boolean;
}

const NumberSelection = ({ selectedNumbers, onNumberClick, disabled }: NumberSelectionProps) => {
  return (
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
  );
};

export default NumberSelection;