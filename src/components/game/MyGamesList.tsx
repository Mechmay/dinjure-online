import { Button } from '@/components/ui/button';
import { GameSession } from '@/types/game';

interface MyGamesListProps {
  games: GameSession[];
  onContinueGame: (gameId: string) => void;
}

const MyGamesList = ({ games, onContinueGame }: MyGamesListProps) => {
  if (games.length === 0) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-game-accent">My Games</h3>
      {games.map((game) => (
        <div
          key={game.id}
          className="flex justify-between items-center p-4 border-2 border-game-accent/20 rounded-lg bg-white/5"
        >
          <div className="space-y-1">
            <span className="text-white">Game #{game.id.slice(0, 8)}</span>
            <p className="text-sm text-white/60">
              {game.status === 'waiting_for_player'
                ? 'Waiting for opponent...'
                : game.status === 'in_progress'
                ? 'Game in progress'
                : 'Game completed'}
            </p>
          </div>
          <Button
            onClick={() => onContinueGame(game.id)}
            className="bg-game-accent text-game-background hover:bg-game-accent/80"
          >
            Continue Game
          </Button>
        </div>
      ))}
    </div>
  );
};

export default MyGamesList;