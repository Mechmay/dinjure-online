import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface NumberButtonProps {
  number: number;
  onClick: (number: number) => void;
  disabled?: boolean;
  selected?: boolean;
  player?: number;
}

const NumberButton = ({ number, onClick, disabled, selected, player }: NumberButtonProps) => {
  return (
    <Button
      onClick={() => onClick(number)}
      disabled={disabled}
      className={cn(
        "w-12 h-12 text-xl font-mono border-2",
        "transition-all duration-200",
        selected && player === 1 && "bg-blue-500 text-white border-blue-500",
        selected && player === 2 && "bg-red-500 text-white border-red-500",
        selected && !player && "dark:bg-game-accent bg-game-accent-light dark:text-game-background text-white",
        !selected && "bg-transparent hover:bg-game-accent/20 dark:hover:bg-game-accent/20",
        !selected && player === 1 && "border-blue-500 text-blue-500",
        !selected && player === 2 && "border-red-500 text-red-500",
        !selected && !player && "dark:border-game-accent border-game-accent-light dark:text-game-accent text-game-accent-light",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      {number}
    </Button>
  );
};

export default NumberButton;