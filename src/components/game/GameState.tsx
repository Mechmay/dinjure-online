import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface GameStateProps {
  gameId: string;
  onGameUpdate: (gameData: any) => void;
  onGuessesUpdate: (guessesData: any[]) => void;
}

const GameState = ({ gameId, onGameUpdate, onGuessesUpdate }: GameStateProps) => {
  const { toast } = useToast();

  useEffect(() => {
    const fetchGame = async () => {
      const { data: gameData, error: gameError } = await supabase
        .from('game_sessions')
        .select('*')
        .eq('id', gameId)
        .single();

      if (gameError) {
        console.error('Error fetching game:', gameError);
        return;
      }

      onGameUpdate(gameData);

      const { data: guessesData, error: guessesError } = await supabase
        .from('guesses')
        .select('*')
        .eq('game_id', gameId)
        .order('created_at', { ascending: false });

      if (guessesError) {
        console.error('Error fetching guesses:', guessesError);
        return;
      }

      const processedGuesses = guessesData.map(guess => ({
        ...guess,
        player: guess.player_id === gameData.player1_id ? 1 : 2
      }));
      onGuessesUpdate(processedGuesses);
    };

    fetchGame();

    const channel = supabase
      .channel('game_updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'game_sessions',
          filter: `id=eq.${gameId}`,
        },
        (payload) => {
          onGameUpdate(payload.new);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'guesses',
          filter: `game_id=eq.${gameId}`,
        },
        () => {
          fetchGame();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [gameId, onGameUpdate, onGuessesUpdate]);

  return null;
};

export default GameState;