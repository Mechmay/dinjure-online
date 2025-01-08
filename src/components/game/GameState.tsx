import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface GameStateProps {
  gameId: string;
  onGameUpdate: (gameData: any) => void;
  onGuessesUpdate: (guessesData: any[]) => void;
}

const GameState = ({ gameId, onGameUpdate, onGuessesUpdate }: GameStateProps) => {
  const { toast } = useToast();

  const fetchGameData = async () => {
    try {
      const { data: gameData, error: gameError } = await supabase
        .from('game_sessions')
        .select('*')
        .eq('id', gameId)
        .single();

      if (gameError) {
        console.error('Error fetching game:', gameError);
        toast({
          title: 'Error',
          description: 'Failed to load game data',
          variant: 'destructive',
        });
        return;
      }

      if (!gameData) {
        toast({
          title: 'Error',
          description: 'Game not found',
          variant: 'destructive',
        });
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
        toast({
          title: 'Error',
          description: 'Failed to load game guesses',
          variant: 'destructive',
        });
        return;
      }

      const processedGuesses = guessesData.map(guess => ({
        ...guess,
        player: guess.player_id === gameData.player1_id ? 1 : 2
      }));
      onGuessesUpdate(processedGuesses);
    } catch (error) {
      console.error('Error in fetchGameData:', error);
      toast({
        title: 'Error',
        description: 'Failed to load game data',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    fetchGameData();

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
          console.log('Game session updated:', payload);
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
          console.log('New guess received, fetching updated data');
          fetchGameData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [gameId]);

  return null;
};

export default GameState;