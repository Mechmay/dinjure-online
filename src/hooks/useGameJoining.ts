import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useGameJoining = (userId: string | undefined, onGameStart: (gameId: string) => void) => {
  const { toast } = useToast();

  const joinGame = async (gameId: string) => {
    if (!userId) {
      toast({
        title: 'Error',
        description: 'You must be logged in to join a game',
        variant: 'destructive',
      });
      return;
    }

    try {
      // First check if the game exists and is available
      const { data: game, error: fetchError } = await supabase
        .from('game_sessions')
        .select('*')
        .eq('id', gameId)
        .maybeSingle();

      if (fetchError) {
        console.error('Error fetching game:', fetchError);
        toast({
          title: 'Error',
          description: 'Failed to check game status',
          variant: 'destructive',
        });
        return;
      }

      if (!game) {
        toast({
          title: 'Error',
          description: 'Game not found',
          variant: 'destructive',
        });
        return;
      }

      if (game.status !== 'waiting_for_player') {
        toast({
          title: 'Error',
          description: 'Game is no longer available',
          variant: 'destructive',
        });
        return;
      }

      // Try to join the game
      const { data: updatedGame, error: updateError } = await supabase
        .from('game_sessions')
        .update({
          player2_id: userId,
          player2_number: [],
          status: 'in_progress',
        })
        .eq('id', gameId)
        .eq('status', 'waiting_for_player')
        .select()
        .maybeSingle();

      if (updateError) {
        console.error('Error joining game:', updateError);
        toast({
          title: 'Error',
          description: 'Failed to join game',
          variant: 'destructive',
        });
        return;
      }

      if (!updatedGame) {
        toast({
          title: 'Error',
          description: 'Game was taken by another player',
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Success',
        description: 'Joined game successfully',
      });
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

  return { joinGame };
};