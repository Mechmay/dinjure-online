import { useState } from 'react';
import { useAuth } from '../auth/AuthProvider';
import GameHeader from './GameHeader';
import GameState from './GameState';
import GameActions from './GameActions';
import GameBoard from './GameBoard';
import GameInstructions from '../GameInstructions';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface OnlineGameProps {
  gameId: string;
  onExit: () => void;
}

const OnlineGame = ({ gameId, onExit }: OnlineGameProps) => {
  const [gameSession, setGameSession] = useState<any>(null);
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [guesses, setGuesses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleNumberClick = (number: number) => {
    if (selectedNumbers.includes(number)) {
      setSelectedNumbers(selectedNumbers.filter((n) => n !== number));
    } else if (selectedNumbers.length < 4) {
      setSelectedNumbers([...selectedNumbers, number]);
    }
  };

  const handleSubmit = async () => {
    if (!gameSession || !user || selectedNumbers.length !== 4) return;

    const actionProps = {
      gameId,
      userId: user.id,
      selectedNumbers,
      gameSession,
      onSuccess: () => setSelectedNumbers([])
    };

    if (needsToSetNumbers) {
      await GameActions.submitNumbers(actionProps);
    } else {
      await GameActions.submitGuess(actionProps);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-game-background text-white p-4 flex items-center justify-center">
        <p>Please log in to play.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-game-background text-white p-4 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-game-accent" />
      </div>
    );
  }

  if (!gameSession) {
    return (
      <div className="min-h-screen bg-game-background text-white p-4 flex items-center justify-center">
        <p>Game not found or you don't have access to it.</p>
      </div>
    );
  }

  const isPlayer1 = user.id === gameSession.player1_id;
  const isMyTurn = user.id === gameSession.current_turn;
  const needsToSetNumbers = isPlayer1 
    ? gameSession.player1_number.length === 0 
    : gameSession.player2_number.length === 0;
  const myNumbers = isPlayer1 ? gameSession.player1_number : gameSession.player2_number;

  return (
    <div className="min-h-screen bg-game-background text-white p-4">
      <div className="container max-w-2xl mx-auto space-y-8">
        <GameState
          gameId={gameId}
          onGameUpdate={(data) => {
            setGameSession(data);
            setIsLoading(false);
          }}
          onGuessesUpdate={setGuesses}
        />
        
        <GameInstructions />
        
        <GameHeader
          gameWon={gameSession.winner_id === user.id}
          playerNumbers={myNumbers}
          isOnline={true}
          status={gameSession.status}
          isMyTurn={isMyTurn}
          needsToSetNumbers={needsToSetNumbers}
        />

        <GameBoard
          selectedNumbers={selectedNumbers}
          onNumberClick={handleNumberClick}
          onSubmit={handleSubmit}
          onExit={onExit}
          isDisabled={
            gameSession.status === 'completed' ||
            (!isMyTurn && !needsToSetNumbers)
          }
          isSettingNumbers={needsToSetNumbers}
          guesses={guesses}
          player={isPlayer1 ? 1 : 2}
        />
      </div>
    </div>
  );
};

export default OnlineGame;