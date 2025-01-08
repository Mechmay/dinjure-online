import { Button } from '@/components/ui/button';
import { GameSession } from '@/types/game';

interface AvailableGamesListProps {
  games: GameSession[];
  onJoinGame: (gameId: string) => void;
}

const AvailableGamesList = ({ games, onJoinGame }: AvailableGamesListProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-game-accent">Available Games</h3>
      {games.length > 0 ? (
        games.map((game) => (
          <div
            key={game.id}
            className="flex justify-between items-center p-4 border-2 border-game-accent/20 rounded-lg bg-white/5"
          >
            <div className="space-y-1">
              <span className="text-white">Game #{game.id.slice(0, 8)}</span>
              <p className="text-sm text-white/60">Waiting for opponent...</p>
            </div>
            <Button
              onClick={() => onJoinGame(game.id)}
              className="bg-game-accent text-game-background hover:bg-game-accent/80"
            >
              Join Game
            </Button>
          </div>
        ))
      ) : (
        <p className="text-white/60 text-center py-8 bg-white/5 rounded-lg border-2 border-dashed border-game-accent/20">
          No games available. Create one to start playing!
        </p>
      )}
    </div>
  );
};

export default AvailableGamesList;