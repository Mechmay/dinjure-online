import React from 'react';
import { Button } from '../ui/button';
import { Send, RotateCcw } from 'lucide-react';

interface GameControlsProps {
  onSubmit: () => void;
  onExit: () => void;
  submitDisabled: boolean;
  isSettingNumbers: boolean;
}

const GameControls = ({ 
  onSubmit, 
  onExit, 
  submitDisabled, 
  isSettingNumbers 
}: GameControlsProps) => {
  return (
    <div className="flex justify-center gap-4">
      <Button
        onClick={onSubmit}
        disabled={submitDisabled}
        className="bg-game-accent text-game-background hover:bg-game-accent/80"
      >
        <Send className="mr-2 h-4 w-4" />
        {isSettingNumbers ? 'Set Numbers' : 'Submit Guess'}
      </Button>
      <Button
        onClick={onExit}
        variant="outline"
        className="border-game-accent text-game-accent hover:bg-game-accent/20"
      >
        <RotateCcw className="mr-2 h-4 w-4" />
        Exit Game
      </Button>
    </div>
  );
};

export default GameControls;