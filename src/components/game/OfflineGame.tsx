import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import NumberButton from '../NumberButton';
import GuessHistory from '../GuessHistory';
import { Button } from '../ui/button';
import { Send, RotateCcw } from 'lucide-react';
import GameHeader from './GameHeader';

interface Player {
  numbers: number[];
  hasSetNumbers: boolean;
}

const OfflineGame = ({ onExit }: { onExit: () => void }) => {
  const [player1, setPlayer1] = useState<Player>({ numbers: [], hasSetNumbers: false });
  const [player2, setPlayer2] = useState<Player>({ numbers: [], hasSetNumbers: false });
  const [currentPlayer, setCurrentPlayer] = useState<1 | 2>(1);
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [guesses, setGuesses] = useState<any[]>([]);
  const [gameWon, setGameWon] = useState(false);
  const { toast } = useToast();

  const handleNumberClick = (number: number) => {
    if (selectedNumbers.includes(number)) {
      setSelectedNumbers(selectedNumbers.filter((n) => n !== number));
    } else if (selectedNumbers.length < 4) {
      setSelectedNumbers([...selectedNumbers, number]);
    }
  };

  const submitNumbers = () => {
    if (selectedNumbers.length !== 4) {
      toast({
        title: 'Invalid selection',
        description: 'Please select exactly 4 numbers',
        variant: 'destructive',
      });
      return;
    }

    if (!player1.hasSetNumbers) {
      setPlayer1({ numbers: selectedNumbers, hasSetNumbers: true });
      setSelectedNumbers([]);
      toast({
        title: 'Player 1 numbers set',
        description: 'Now Player 2, set your numbers',
      });
    } else {
      setPlayer2({ numbers: selectedNumbers, hasSetNumbers: true });
      setSelectedNumbers([]);
      setCurrentPlayer(1);
      toast({
        title: 'Player 2 numbers set',
        description: 'Game starts! Player 1 goes first',
      });
    }
  };

  const submitGuess = () => {
    if (selectedNumbers.length !== 4) {
      toast({
        title: 'Invalid guess',
        description: 'Please select exactly 4 numbers',
        variant: 'destructive',
      });
      return;
    }

    const targetNumbers = currentPlayer === 1 ? player2.numbers : player1.numbers;
    
    let dead = 0;
    let injured = 0;

    selectedNumbers.forEach((num, index) => {
      if (targetNumbers[index] === num) {
        dead++;
      } else if (targetNumbers.includes(num)) {
        injured++;
      }
    });

    const newGuess = {
      numbers: selectedNumbers,
      dead,
      injured,
      player: currentPlayer,
    };

    setGuesses([newGuess, ...guesses]);
    setSelectedNumbers([]);

    if (dead === 4) {
      setGameWon(true);
      toast({
        title: '4 Dead! Dinjure!',
        description: `Congratulations Player ${currentPlayer}, you've won the game!`,
      });
    } else {
      setCurrentPlayer(currentPlayer === 1 ? 2 : 1);
    }
  };

  const needsToSetNumbers = !player1.hasSetNumbers || !player2.hasSetNumbers;
  const settingPlayer = !player1.hasSetNumbers ? 1 : 2;
  const playerNumbers = currentPlayer === 1 ? player1.numbers : player2.numbers;

  return (
    <div className="space-y-8">
      <GameHeader 
        gameWon={gameWon}
        currentPlayer={currentPlayer}
        playerNumbers={needsToSetNumbers ? undefined : playerNumbers}
        needsToSetNumbers={needsToSetNumbers}
      />

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
              disabled={
                gameWon ||
                (selectedNumbers.length === 4 && !selectedNumbers.includes(i))
              }
            />
          ))}
        </div>

        <div className="flex justify-center gap-4">
          <Button
            onClick={needsToSetNumbers ? submitNumbers : submitGuess}
            disabled={selectedNumbers.length !== 4 || gameWon}
            className="bg-game-accent text-game-background hover:bg-game-accent/80"
          >
            <Send className="mr-2 h-4 w-4" />
            {needsToSetNumbers ? 'Set Numbers' : 'Submit Guess'}
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
      </div>

      {!needsToSetNumbers && (
        <GuessHistory
          guesses={guesses.map(g => ({
            numbers: g.numbers,
            dead: g.dead,
            injured: g.injured
          }))}
        />
      )}
    </div>
  );
};

export default OfflineGame;