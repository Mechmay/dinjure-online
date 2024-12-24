import React, { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import NumberButton from '@/components/NumberButton';
import GuessHistory from '@/components/GuessHistory';
import GameInstructions from '@/components/GameInstructions';
import { Button } from '@/components/ui/button';
import { Send, RotateCcw } from 'lucide-react';

interface Guess {
  numbers: number[];
  dead: number;
  injured: number;
}

const Index = () => {
  const { toast } = useToast();
  const [targetNumber, setTargetNumber] = useState<number[]>([]);
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [guesses, setGuesses] = useState<Guess[]>([]);
  const [gameWon, setGameWon] = useState(false);

  const generateTargetNumber = () => {
    const numbers = Array.from({ length: 10 }, (_, i) => i);
    const shuffled = numbers.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 4);
  };

  const resetGame = () => {
    setTargetNumber(generateTargetNumber());
    setSelectedNumbers([]);
    setGuesses([]);
    setGameWon(false);
  };

  useEffect(() => {
    resetGame();
  }, []);

  const handleNumberClick = (number: number) => {
    if (selectedNumbers.includes(number)) {
      setSelectedNumbers(selectedNumbers.filter((n) => n !== number));
    } else if (selectedNumbers.length < 4) {
      setSelectedNumbers([...selectedNumbers, number]);
    }
  };

  const checkGuess = () => {
    if (selectedNumbers.length !== 4) {
      toast({
        title: "Invalid guess",
        description: "Please select exactly 4 numbers",
        variant: "destructive",
      });
      return;
    }

    let dead = 0;
    let injured = 0;

    selectedNumbers.forEach((num, index) => {
      if (targetNumber[index] === num) {
        dead++;
      } else if (targetNumber.includes(num)) {
        injured++;
      }
    });

    const newGuess = {
      numbers: [...selectedNumbers],
      dead,
      injured,
    };

    setGuesses([newGuess, ...guesses]);
    setSelectedNumbers([]);

    if (dead === 4) {
      setGameWon(true);
      toast({
        title: "Congratulations!",
        description: "You've won the game!",
      });
    }
  };

  return (
    <div className="min-h-screen bg-game-background text-white p-4">
      <div className="container max-w-2xl mx-auto space-y-8 relative">
        <GameInstructions />
        
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-game-accent">Dead & Injured</h1>
          <p className="text-game-accent/60">Crack the code!</p>
        </div>

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
                onClick={handleNumberClick}
                selected={selectedNumbers.includes(i)}
                disabled={gameWon || (selectedNumbers.length === 4 && !selectedNumbers.includes(i))}
              />
            ))}
          </div>

          <div className="flex justify-center gap-4">
            <Button
              onClick={checkGuess}
              disabled={selectedNumbers.length !== 4 || gameWon}
              className="bg-game-accent text-game-background hover:bg-game-accent/80"
            >
              <Send className="mr-2 h-4 w-4" />
              Submit Guess
            </Button>
            <Button
              onClick={resetGame}
              variant="outline"
              className="border-game-accent text-game-accent hover:bg-game-accent/20"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              New Game
            </Button>
          </div>
        </div>

        <div className="mt-8">
          <GuessHistory guesses={guesses} />
        </div>
      </div>
    </div>
  );
};

export default Index;