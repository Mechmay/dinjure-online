import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { HelpCircle } from 'lucide-react';

const GameInstructions = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="absolute top-4 right-4 dark:text-game-accent text-game-accent-light">
          <HelpCircle className="h-6 w-6" />
        </Button>
      </DialogTrigger>
      <DialogContent className="dark:bg-game-background bg-game-background-light dark:border-game-accent border-game-accent-light dark:text-white text-game-accent-light">
        <DialogHeader>
          <DialogTitle className="dark:text-game-accent text-game-accent-light">How to Play</DialogTitle>
          <DialogDescription className="dark:text-white/80 text-game-accent-light/80">
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="font-semibold dark:text-game-accent text-game-accent-light">Game Modes:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li><span className="dark:text-game-accent text-game-accent-light">vs Computer</span> - Try to guess the computer's 4-digit number</li>
                  <li><span className="dark:text-game-accent text-game-accent-light">2 Players</span> - Each player sets a secret number and takes turns guessing</li>
                </ul>
              </div>
              <p>
                Each number must be unique and between 0-9.
              </p>
              <div className="space-y-2">
                <p className="font-semibold dark:text-game-accent text-game-accent-light">Feedback:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li><span className="text-red-500">Dead</span> - Right number in the right position</li>
                  <li><span className="text-yellow-500">injure</span> - Right number in the wrong position</li>
                </ul>
              </div>
              <p>
                Win by getting 4 "Dead" - meaning you've guessed all numbers in their correct positions!
              </p>
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default GameInstructions;