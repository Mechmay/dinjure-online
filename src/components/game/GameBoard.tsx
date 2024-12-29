import React from 'react';
import NumberSelection from './NumberSelection';
import GameControls from './GameControls';
import GuessHistory from '../GuessHistory';

interface GameBoardProps {
  selectedNumbers: number[];
  onNumberClick: (number: number) => void;
  onSubmit: () => void;
  onExit: () => void;
  isDisabled: boolean;
  isSettingNumbers: boolean;
  guesses: any[];
  player: number;
}

const GameBoard = ({
  selectedNumbers,
  onNumberClick,
  onSubmit,
  onExit,
  isDisabled,
  isSettingNumbers,
  guesses,
  player
}: GameBoardProps) => {
  return (
    <div className="space-y-8">
      <NumberSelection
        selectedNumbers={selectedNumbers}
        onNumberClick={onNumberClick}
        disabled={isDisabled}
        player={player}
      />

      <GameControls
        onSubmit={onSubmit}
        onExit={onExit}
        submitDisabled={selectedNumbers.length !== 4 || isDisabled}
        isSettingNumbers={isSettingNumbers}
      />

      {!isSettingNumbers && <GuessHistory guesses={guesses} />}
    </div>
  );
};

export default GameBoard;