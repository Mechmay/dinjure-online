import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface NumberButtonProps {
  number: number;
  onClick: (number: number) => void;
  disabled?: boolean;
  selected?: boolean;
}

const NumberButton = ({ number, onClick, disabled, selected }: NumberButtonProps) => {
  return (
    <Button
      onClick={() => onClick(number)}
      disabled={disabled}
      className={cn(
        "w-12 h-12 text-xl font-mono border-2",
        "transition-all duration-200",
        selected ? "bg-game-accent text-game-background" : "bg-transparent hover:bg-game-accent/20",
        "border-game-accent text-game-accent",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      {number}
    </Button>
  );
};

export default NumberButton;