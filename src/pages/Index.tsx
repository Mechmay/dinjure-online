import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/components/auth/AuthProvider";
import OnlineGame from "@/components/game/OnlineGame";
import OfflineGame from "@/components/game/OfflineGame";
import GameModeSelection from "@/components/game/GameModeSelection";
import NumberSelection from "@/components/game/NumberSelection";
import GameHeader from "@/components/game/GameHeader";
import GameControls from "@/components/game/GameControls";
import GuessHistory from "@/components/GuessHistory";
import GameInstructions from "@/components/GameInstructions";
import GameLobby from "@/components/game/GameLobby";
import NumberDisplay from "@/components/game/NumberDisplay";

type GameMode = "computer" | "online" | "offline" | null;

interface Guess {
  numbers: number[];
  dead: number;
  injured: number;
}

const Index = () => {
  const [gameMode, setGameMode] = useState<GameMode>(null);
  const [onlineGameId, setOnlineGameId] = useState<string | null>(null);
  const [targetNumber, setTargetNumber] = useState<number[]>([]);
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [guesses, setGuesses] = useState<Guess[]>([]);
  const [gameWon, setGameWon] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  const generateTargetNumber = () => {
    const numbers = Array.from({ length: 10 }, (_, i) => i);
    const shuffled = numbers.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 4);
  };

  useEffect(() => {
    if (gameMode === "computer") {
      setTargetNumber(generateTargetNumber());
    }
  }, [gameMode]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  const handleGameStart = (gameId: string) => {
    setOnlineGameId(gameId);
  };

  const handleExitGame = () => {
    setOnlineGameId(null);
    setGameMode(null);
    setSelectedNumbers([]);
    setGuesses([]);
    setGameWon(false);
  };

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
        title: "4 Dead! Dinjure!",
        description: "Congratulations, you've won the game!",
      });
    }
  };

  if (!user) return null;

  if (!gameMode) {
    return (
      <GameModeSelection onModeSelect={setGameMode} onSignOut={handleSignOut} />
    );
  }

  if (gameMode === "online") {
    return onlineGameId ? (
      <OnlineGame gameId={onlineGameId} onExit={handleExitGame} />
    ) : (
      <div className="min-h-screen bg-game-background text-white p-4">
        <div className="container max-w-2xl mx-auto space-y-8">
          <GameInstructions />
          <GameLobby onGameStart={handleGameStart} />
        </div>
      </div>
    );
  }

  if (gameMode === "offline") {
    return <OfflineGame onExit={handleExitGame} />;
  }

  return (
    <div className="min-h-screen bg-game-background text-white p-4">
      <div className="container max-w-2xl mx-auto space-y-8">
        <GameInstructions />
        <GameHeader
          gameWon={gameWon}
          currentPlayer={1}
          needsToSetNumbers={false}
        />

        <div className="space-y-6">
          <NumberDisplay selectedNumbers={selectedNumbers} />

          <NumberSelection
            selectedNumbers={selectedNumbers}
            onNumberClick={handleNumberClick}
            disabled={gameWon}
          />

          <GameControls
            onSubmit={checkGuess}
            onExit={handleExitGame}
            submitDisabled={selectedNumbers.length !== 4 || gameWon}
            isSettingNumbers={false}
          />
        </div>

        <GuessHistory guesses={guesses} />
      </div>
    </div>
  );
};

export default Index;
