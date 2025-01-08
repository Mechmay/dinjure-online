import { Button } from "@/components/ui/button";
import { useAuth } from "../auth/AuthProvider";
import { Loader2 } from "lucide-react";
import { useGameManagement } from "@/hooks/useGameManagement";
import AvailableGamesList from "./AvailableGamesList";
import MyGamesList from "./MyGamesList";
import { useEffect } from "react";

interface GameLobbyProps {
  onGameStart: (gameId: string) => void;
}

const GameLobby = ({ onGameStart }: GameLobbyProps) => {
  const { user } = useAuth();
  const { availableGames, myGames, isLoading, createGame, joinGame } =
    useGameManagement(user?.id, onGameStart);

  useEffect(() => {
    console.log("GameLobby state:", {
      user,
      isLoading,
      availableGames,
      myGames,
    });
  }, [user, isLoading, availableGames, myGames]);

  if (isLoading) {
    console.log("GameLobby is in loading state");
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin text-game-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-game-accent">Game Lobby</h2>
        <Button
          onClick={createGame}
          className="bg-game-accent text-game-background hover:bg-game-accent/80"
        >
          Create New Game
        </Button>
      </div>

      <MyGamesList games={myGames} onContinueGame={onGameStart} />
      <AvailableGamesList games={availableGames} onJoinGame={joinGame} />
    </div>
  );
};

export default GameLobby;
