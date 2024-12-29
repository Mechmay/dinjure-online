import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface GameActionsProps {
  gameId: string;
  userId: string;
  selectedNumbers: number[];
  gameSession: any;
  onSuccess: () => void;
}

const GameActions = {
  submitNumbers: async ({ 
    gameId, 
    userId, 
    selectedNumbers, 
    gameSession,
    onSuccess 
  }: GameActionsProps) => {
    const { toast } = useToast();
    
    const isPlayer1 = userId === gameSession.player1_id;
    const updateField = isPlayer1 ? 'player1_number' : 'player2_number';

    const { error } = await supabase
      .from('game_sessions')
      .update({
        [updateField]: selectedNumbers,
        current_turn: isPlayer1 ? gameSession.player2_id : gameSession.player1_id,
      })
      .eq('id', gameId);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit numbers',
        variant: 'destructive',
      });
      return;
    }

    onSuccess();
  },

  submitGuess: async ({
    gameId,
    userId,
    selectedNumbers,
    gameSession,
    onSuccess
  }: GameActionsProps) => {
    const { toast } = useToast();
    
    const targetNumbers = userId === gameSession.player1_id 
      ? gameSession.player2_number 
      : gameSession.player1_number;
    
    let dead = 0;
    let injured = 0;

    selectedNumbers.forEach((num, index) => {
      if (targetNumbers[index] === num) {
        dead++;
      } else if (targetNumbers.includes(num)) {
        injured++;
      }
    });

    const { error: guessError } = await supabase
      .from('guesses')
      .insert([
        {
          game_id: gameId,
          player_id: userId,
          numbers: selectedNumbers,
          dead,
          injured,
        },
      ]);

    if (guessError) {
      toast({
        title: 'Error',
        description: 'Failed to submit guess',
        variant: 'destructive',
      });
      return;
    }

    if (dead === 4) {
      await supabase
        .from('game_sessions')
        .update({
          status: 'completed',
          winner_id: userId,
        })
        .eq('id', gameId);

      toast({
        title: '4 Dead! Dinjure!',
        description: 'Congratulations, you won the game!',
      });
    } else {
      await supabase
        .from('game_sessions')
        .update({
          current_turn: userId === gameSession.player1_id 
            ? gameSession.player2_id 
            : gameSession.player1_id,
        })
        .eq('id', gameId);
    }

    onSuccess();
  }
};

export default GameActions;