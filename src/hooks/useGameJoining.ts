import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useGameJoining = (userId: string | undefined, onGameStart: (gameId: string) => void) => {
  const { toast } = useToast();

  const joinGame = async (gameId: string) => {
    if (!userId) return;

    try {
      // First check if the game exists
      const { data: gameCheck, error: checkError } = await supabase
        .from('game_sessions')
        .select()
        .eq('id', gameId)
        .maybeSingle();

      if (checkError) {
        console.error('Error checking game:', checkError);
        toast({
          title: 'Error',
          description: 'Failed to check game status',
          variant: 'destructive',
        });
        return;
      }

      if (!gameCheck) {
        toast({
          title: 'Error',
          description: 'Game not found',
          variant: 'destructive',
        });
        return;
      }

      if (gameCheck.status !== 'waiting_for_player') {
        toast({
          title: 'Error',
          description: 'Game is no longer available',
          variant: 'destructive',
        });
        return;
      }

      // If game exists and is available, try to join it
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