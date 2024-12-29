import { useState } from 'react';
import { useAuth } from '../auth/AuthProvider';
import GameHeader from './GameHeader';
import GameState from './GameState';
import GameActions from './GameActions';
import GameBoard from './GameBoard';
import GameInstructions from '../GameInstructions';

interface OnlineGameProps {
  gameId: string;
  onExit: () => void;
}

const OnlineGame = ({ gameId, onExit }: OnlineGameProps) => {
  const [gameSession, setGameSession] = useState(null);
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [guesses, setGuesses] = useState<any[]>([]);
  const { user } = useAuth();

  if (!gameSession || !user) return null;

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
          onGameUpdate={setGameSession}
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