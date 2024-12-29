import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import NumberButton from '../NumberButton';
import GuessHistory from '../GuessHistory';
import GameHeader from './GameHeader';
import GameControls from './GameControls';
import NumberDisplay from './NumberDisplay';
import NumberSelection from './NumberSelection';

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
        title: 'Game Over!',
        description: `Congratulations Player ${currentPlayer}, you've won the game!`,
      });
    } else {
      setCurrentPlayer(currentPlayer === 1 ? 2 : 1);
    }
  };

  const needsToSetNumbers = !player1.hasSetNumbers || !player2.hasSetNumbers;

  return (
    <div className="space-y-8">
      <GameHeader 
        gameWon={gameWon}
        currentPlayer={currentPlayer}
        needsToSetNumbers={needsToSetNumbers}
      />

      <div className="space-y-6">
        <NumberDisplay selectedNumbers={selectedNumbers} />

        <NumberSelection
          selectedNumbers={selectedNumbers}
          onNumberClick={handleNumberClick}
          disabled={gameWon}
        />

        <GameControls
          onSubmit={needsToSetNumbers ? submitNumbers : submitGuess}
          onExit={onExit}
          submitDisabled={selectedNumbers.length !== 4 || gameWon}
          isSettingNumbers={needsToSetNumbers}
        />
      </div>

      {!needsToSetNumbers && (
        <GuessHistory guesses={guesses} />
      )}
    </div>
  );
};

export default OfflineGame;
