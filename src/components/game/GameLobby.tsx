import { Button } from "@/components/ui/button";
import { useAuth } from "../auth/AuthProvider";
import { Loader2, ArrowLeft, Trash2 } from "lucide-react";
import { useGameManagement } from "@/hooks/useGameManagement";
import AvailableGamesList from "./AvailableGamesList";
import MyGamesList from "./MyGamesList";
import { useEffect, useState } from "react";
import NumberSelection from "./NumberSelection";

interface GameLobbyProps {
  onGameStart: (gameId: string) => void;
  onBack: () => void;
}

const GameLobby = ({ onGameStart, onBack }: GameLobbyProps) => {
  const { user } = useAuth();
  const {
    availableGames,
    myGames,
    isLoading,
    createGame,
    joinGame,
    deleteGame,
  } = useGameManagement(user?.id, onGameStart);

  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [isSelectingNumbers, setIsSelectingNumbers] = useState(false);

  useEffect(() => {
    console.log("GameLobby state:", {
      user,
      isLoading,
      availableGames,
      myGames,
    });
  }, [user, isLoading, availableGames, myGames]);

  const handleCreateGame = () => {
    setIsSelectingNumbers(true);
  };

  const handleNumberSubmit = () => {
    if (selectedNumbers.length === 4) {
      createGame(selectedNumbers);
      setSelectedNumbers([]);
      setIsSelectingNumbers(false);
    }
  };

  if (isSelectingNumbers) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-game-accent">
          Select Your Numbers
        </h2>
        <NumberSelection
          selectedNumbers={selectedNumbers}
          onNumberClick={(num) => {
            if (selectedNumbers.includes(num)) {
              setSelectedNumbers((prev) => prev.filter((n) => n !== num));
            } else if (selectedNumbers.length < 4) {
              setSelectedNumbers((prev) => [...prev, num]);
            }
          }}
          disabled={false}
        />
        <Button
          onClick={handleNumberSubmit}
          disabled={selectedNumbers.length !== 4}
          className="bg-game-accent text-game-background hover:bg-game-accent/80"
        >
          Create Game
        </Button>
      </div>
    );
  }

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
        <div className="flex items-center gap-4">
          <Button
            onClick={onBack}
            variant="ghost"
            className="text-game-accent hover:text-game-accent/80"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-2xl font-bold text-game-accent">Game Lobby</h2>
        </div>
        <Button
          onClick={handleCreateGame}
          className="bg-game-accent text-game-background hover:bg-game-accent/80"
        >
          Create New Game
        </Button>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-game-accent">My Games</h3>
        {myGames.map((game) => (
          <div
            key={game.id}
            className="flex justify-between items-center p-4 border-2 border-game-accent/20 rounded-lg bg-white/5"
          >
            <div className="space-y-1">
              <span className="text-white">Game #{game.id.slice(0, 8)}</span>
              <p className="text-sm text-white/60">
                {game.status === "waiting_for_player"
                  ? "Waiting for opponent..."
                  : "Game in progress"}
              </p>
            </div>
            <div className="flex gap-2">
              {game.player1_id === user?.id && (
                <Button
                  onClick={() => deleteGame(game.id)}
                  variant="destructive"
                  size="icon"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
              <Button
                onClick={() => onGameStart(game.id)}
                className="bg-game-accent text-game-background hover:bg-game-accent/80"
              >
                Continue Game
              </Button>
            </div>
          </div>
        ))}
      </div>

      <AvailableGamesList games={availableGames} onJoinGame={joinGame} />
    </div>
  );
};

export default GameLobby;
