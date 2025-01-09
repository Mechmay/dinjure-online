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
  const [gameMode, setGameMode] = useState<
    "menu" | "online" | "local" | "computer"
  >("menu");
  const [gameId, setGameId] = useState<string | null>(null);

  const handleBack = () => {
    setGameMode("menu"); // This will take you back to game mode selection
    setGameId(null);
  };

  if (gameId) {
    return <Game gameId={gameId} />;
  }

  switch (gameMode) {
    case "online":
      return <GameLobby onGameStart={setGameId} onBack={handleBack} />;
    case "local":
      return <LocalGame onBack={handleBack} />;
    case "computer":
      return <ComputerGame onBack={handleBack} />;
    default:
      return <GameModeSelection onSelect={setGameMode} />;
  }
};

export default Index;
