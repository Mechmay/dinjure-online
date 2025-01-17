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
    console.log("Received guesses update:", data);
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

  const submitGuess = async () => {
    if (selectedNumbers.length !== 4) {
      toast({
        title: "Error",
        description: "Please select exactly 4 numbers",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log("Game Data:", gameData); // Debug log
      console.log("Current User:", user?.id); // Debug log

      // Get the target numbers based on which player we are
      const targetNumbers =
        user?.id === gameData.player1_id
          ? gameData.player2_number
          : gameData.player1_number;

      console.log("Target Numbers:", targetNumbers); // Debug log
      console.log("Selected Numbers:", selectedNumbers); // Debug log

      // Calculate dead and injured
      let dead = 0;
      let injured = 0;

      // Make sure we're comparing numbers, not strings
      const targetNumArray = targetNumbers.map(Number);
      const selectedNumArray = selectedNumbers.map(Number);

      selectedNumArray.forEach((num, index) => {
        if (num === targetNumArray[index]) {
          dead++;
        } else if (targetNumArray.includes(num)) {
          injured++;
        }
      });

      console.log("Calculated Results:", { dead, injured }); // Debug log

      // Submit the guess with the results
      const { error: guessError } = await supabase.from("guesses").insert({
        game_id: gameId,
        player_id: user?.id,
        numbers: selectedNumbers,
        dead,
        injured,
      });

      if (guessError) throw guessError;

      // Switch turns
      const { error: updateError } = await supabase
        .from("game_sessions")
        .update({
          current_turn:
            gameData.player1_id === user?.id
              ? gameData.player2_id
              : gameData.player1_id,
        })
        .eq("id", gameId);

      if (updateError) throw updateError;

      setSelectedNumbers([]);

      // Check if game is won
      if (dead === 4) {
        toast({
          title: "Congratulations!",
          description: "You've won the game!",
        });
      }
    } catch (error) {
      console.error("Error submitting guess:", error);
      toast({
        title: "Error",
        description: "Failed to submit guess",
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

        {console.log("Current guesses:", guesses)}
        <GuessHistory
          guesses={guesses}
          currentPlayerId={user?.id}
          player1Id={gameData?.player1_id}
          player2Id={gameData?.player2_id}
        />
      </div>
    </div>
  );
};

export default OnlineGame;
