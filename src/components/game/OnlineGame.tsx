import React, { useState, useEffect } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import GameHeader from "./GameHeader";
import NumberSelection from "./NumberSelection";
import NumberDisplay from "./NumberDisplay";
import GameControls from "./GameControls";
import GuessHistory from "@/components/GuessHistory";
import GameState from "./GameState";

interface OnlineGameProps {
  gameId: string;
  onExit: () => void;
}

const OnlineGame = ({ gameId, onExit }: OnlineGameProps) => {
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [gameData, setGameData] = useState<any>(null);
  const [guesses, setGuesses] = useState<any[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleGameUpdate = (data: any) => {
    setGameData(data);
  };

  const handleGuessesUpdate = (data: any[]) => {
    setGuesses(data);
  };

  const handleNumberClick = (number: number) => {
    if (selectedNumbers.includes(number)) {
      setSelectedNumbers(selectedNumbers.filter((n) => n !== number));
    } else if (selectedNumbers.length < 4) {
      setSelectedNumbers([...selectedNumbers, number]);
    }
  };

  const submitInitialNumbers = async () => {
    if (selectedNumbers.length !== 4) {
      toast({
        title: "Error",
        description: "Please select exactly 4 numbers",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from("game_sessions")
        .update({
          player1_number: selectedNumbers,
          status: "waiting_for_player",
        })
        .eq("id", gameId)
        .eq("player1_id", user?.id);

      if (error) throw error;

      setSelectedNumbers([]);
    } catch (error) {
      console.error("Error setting initial numbers:", error);
      toast({
        title: "Error",
        description: "Failed to set initial numbers",
        variant: "destructive",
      });
    }
  };

  const isMyTurn = gameData?.current_turn === user?.id;
  const isSettingNumbers =
    gameData?.player1_id === user?.id && !gameData?.player1_number;

  return (
    <div className="min-h-screen bg-game-background text-white p-4">
      <div className="container max-w-2xl mx-auto space-y-8">
        <GameState
          gameId={gameId}
          onGameUpdate={handleGameUpdate}
          onGuessesUpdate={handleGuessesUpdate}
        />

        <GameHeader
          gameWon={false}
          currentPlayer={isMyTurn ? 1 : 2}
          needsToSetNumbers={isSettingNumbers}
        />

        <div className="space-y-6">
          <NumberDisplay selectedNumbers={selectedNumbers} />

          <NumberSelection
            selectedNumbers={selectedNumbers}
            onNumberClick={handleNumberClick}
            disabled={!isMyTurn && !isSettingNumbers}
          />

          <GameControls
            onSubmit={isSettingNumbers ? submitInitialNumbers : submitGuess}
            onExit={onExit}
            submitDisabled={
              selectedNumbers.length !== 4 || (!isMyTurn && !isSettingNumbers)
            }
            isSettingNumbers={isSettingNumbers}
          />
        </div>

        <GuessHistory guesses={guesses} />
      </div>
    </div>
  );
};

export default OnlineGame;
