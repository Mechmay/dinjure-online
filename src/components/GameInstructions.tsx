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
        <Button variant="ghost" size="icon" className="absolute top-4 right-4 text-game-accent">
          <HelpCircle className="h-6 w-6" />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-game-background border-game-accent text-white">
        <DialogHeader>
          <DialogTitle className="text-game-accent">How to Play</DialogTitle>
          <DialogDescription className="text-white/80">
            <div className="space-y-4">
              <p>
                Try to guess the computer's 4-digit number. Each digit is unique and between 0-9.
              </p>
              <div className="space-y-2">
                <p className="font-semibold text-game-accent">Feedback:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li><span className="text-red-500">Dead</span> - Right number in the right position</li>
                  <li><span className="text-yellow-500">Injured</span> - Right number in the wrong position</li>
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