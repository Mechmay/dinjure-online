import React from 'react';
import { Button } from '../ui/button';
import { Monitor, Users, UsersRound, LogOut } from 'lucide-react';
import GameInstructions from '../GameInstructions';
import { ThemeToggle } from '../theme/ThemeToggle';

interface GameModeSelectionProps {
  onModeSelect: (mode: 'computer' | 'online' | 'offline') => void;
  onSignOut: () => void;
}

const GameModeSelection = ({ onModeSelect, onSignOut }: GameModeSelectionProps) => {
  return (
    <div className="min-h-screen dark:bg-game-background bg-game-background-light text-game-accent-light dark:text-white p-4">
      <div className="container max-w-2xl mx-auto space-y-8 relative">
        <GameInstructions />
        <ThemeToggle />
        <Button
          onClick={onSignOut}
          variant="ghost"
          size="icon"
          className="absolute top-4 left-4 dark:text-game-accent text-game-accent-light"
        >
          <LogOut className="h-6 w-6" />
        </Button>
        <div className="text-center space-y-8">
          <h1 className="text-4xl font-bold dark:text-game-accent text-game-accent-light">Dinjure</h1>
          <p className="dark:text-game-accent/60 text-game-accent-light/60">Choose your game mode</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
            <Button
              onClick={() => onModeSelect('computer')}
              className="dark:bg-game-accent bg-game-accent-light dark:text-game-background text-white dark:hover:bg-game-accent/80 hover:bg-game-accent-light/80 p-8"
            >
              <Monitor className="mr-2 h-6 w-6" />
              vs Computer
            </Button>
            <Button
              onClick={() => onModeSelect('offline')}
              className="dark:bg-game-accent bg-game-accent-light dark:text-game-background text-white dark:hover:bg-game-accent/80 hover:bg-game-accent-light/80 p-8"
            >
              <UsersRound className="mr-2 h-6 w-6" />
              2 Players Local
            </Button>
            <Button
              onClick={() => onModeSelect('online')}
              className="dark:bg-game-accent bg-game-accent-light dark:text-game-background text-white dark:hover:bg-game-accent/80 hover:bg-game-accent-light/80 p-8"
            >
              <Users className="mr-2 h-6 w-6" />
              Online
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameModeSelection;