import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '../auth/AuthProvider';
import { Loader2 } from 'lucide-react';

interface GameSession {
  id: string;
  player1_id: string;
  player2_id: string | null;
  status: 'waiting_for_player' | 'in_progress' | 'completed';
}

const GameLobby = ({ onGameStart }: { onGameStart: (gameId: string) => void }) => {
  const [availableGames, setAvailableGames] = useState<GameSession[]>([]);
  const [myGames, setMyGames] = useState<GameSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchGames = async () => {
    try {
      const { data: availableData, error: availableError } = await supabase
        .from('game_sessions')
        .select('*')
        .eq('status', 'waiting_for_player')
        .neq('player1_id', user?.id);

      if (availableError) {
        console.error('Error fetching available games:', availableError);
        return;
      }

      const { data: myGamesData, error: myGamesError } = await supabase
        .from('game_sessions')
        .select('*')
        .or(`player1_id.eq.${user?.id},player2_id.eq.${user?.id}`)
        .order('created_at', { ascending: false });

      if (myGamesError) {
        console.error('Error fetching my games:', myGamesError);
        return;
      }

      setAvailableGames(availableData || []);
      setMyGames(myGamesData || []);
      setIsLoading(false);
    } catch (error) {
      console.error('Error in fetchGames:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch games',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    if (!user?.id) return;
    
    fetchGames();

    const channel = supabase
      .channel('game_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'game_sessions',
        },
        () => {
          fetchGames();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  const createGame = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('game_sessions')
        .insert([
          {
            player1_id: user.id,
            player1_number: [],
            status: 'waiting_for_player',
            current_turn: user.id,
          },
        ])
        .select()
        .single();

      if (error) {
        toast({
          title: 'Error',
          description: 'Failed to create game',
          variant: 'destructive',
        });
        return;
      }

      onGameStart(data.id);
    } catch (error) {
      console.error('Error in createGame:', error);
      toast({
        title: 'Error',
        description: 'Failed to create game',
        variant: 'destructive',
      });
    }
  };

  const joinGame = async (gameId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('game_sessions')
        .update({
          player2_id: user.id,
          player2_number: [],
          status: 'in_progress',
        })
        .eq('id', gameId)
        .eq('status', 'waiting_for_player');

      if (error) {
        toast({
          title: 'Error',
          description: 'Failed to join game',
          variant: 'destructive',
        });
        return;
      }

      onGameStart(gameId);
    } catch (error) {
      console.error('Error in joinGame:', error);
      toast({
        title: 'Error',
        description: 'Failed to join game',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
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

      {myGames.length > 0 && (
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
                  {game.status === 'waiting_for_player'
                    ? 'Waiting for opponent...'
                    : game.status === 'in_progress'
                    ? 'Game in progress'
                    : 'Game completed'}
                </p>
              </div>
              <Button
                onClick={() => onGameStart(game.id)}
                className="bg-game-accent text-game-background hover:bg-game-accent/80"
              >
                Continue Game
              </Button>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-game-accent">Available Games</h3>
        {availableGames.length > 0 ? (
          availableGames.map((game) => (
            <div
              key={game.id}
              className="flex justify-between items-center p-4 border-2 border-game-accent/20 rounded-lg bg-white/5"
            >
              <div className="space-y-1">
                <span className="text-white">Game #{game.id.slice(0, 8)}</span>
                <p className="text-sm text-white/60">Waiting for opponent...</p>
              </div>
              <Button
                onClick={() => joinGame(game.id)}
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
    </div>
  );
};

export default GameLobby;