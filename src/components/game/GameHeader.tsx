import React from 'react';

interface GameHeaderProps {
  gameWon: boolean;
  currentPlayer?: number;
  playerNumbers?: number[];
  isOnline?: boolean;
  status?: string;
  isMyTurn?: boolean;
  needsToSetNumbers?: boolean;
}

const GameHeader = ({ 
  gameWon, 
  currentPlayer, 
  playerNumbers, 
  isOnline,
  status,
  isMyTurn,
  needsToSetNumbers 
}: GameHeaderProps) => {
  if (isOnline) {
    return (
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-game-accent">
          {status === 'completed'
            ? `Game Over - ${gameWon ? 'You Won!' : 'You Lost!'}`
            : needsToSetNumbers
            ? 'Set Your Numbers'
            : isMyTurn
            ? 'Your Turn'
            : "Opponent's Turn"}
        </h2>
      </div>
    );
  }

  return (
    <div className="text-center space-y-2">
      <h2 className="text-2xl font-bold text-game-accent">
        {gameWon
          ? `Game Over - Player ${currentPlayer} Won!`
          : needsToSetNumbers
          ? `Player ${currentPlayer} - Set Your Numbers`
          : `Player ${currentPlayer}'s Turn`}
      </h2>
    </div>
  );
};

export default GameHeader;