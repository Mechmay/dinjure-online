import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '../auth/AuthProvider';

interface GameSession {
  id: string;
  player1_id: string;
  player2_id: string | null;
  status: 'waiting_for_player' | 'in_progress' | 'completed';
}

const GameLobby = ({ onGameStart }: { onGameStart: (gameId: string) => void }) => {
  const [availableGames, setAvailableGames] = useState<GameSession[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const fetchGames = async () => {
      const { data, error } = await supabase
        .from('game_sessions')
        .select('*')
        .eq('status', 'waiting_for_player')
        .neq('player1_id', user?.id); // Don't show user's own games

      if (error) {
        console.error('Error fetching games:', error);
        return;
      }

      setAvailableGames(data);
    };

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

    const { data, error } = await supabase
      .from('game_sessions')
      .insert([
        {
          player1_id: user.id,
          player1_number: [],
          status: 'waiting_for_player',
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
  };

  const joinGame = async (gameId: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('game_sessions')
      .update({
        player2_id: user.id,
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
  };

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

      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-game-accent">Available Games</h3>
        {availableGames.map((game) => (
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
        ))}
        {availableGames.length === 0 && (
          <p className="text-white/60 text-center py-8 bg-white/5 rounded-lg border-2 border-dashed border-game-accent/20">
            No games available. Create one to start playing!
          </p>
        )}
      </div>
    </div>
  );
};

export default GameLobby;