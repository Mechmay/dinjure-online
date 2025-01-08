import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { GameSession } from '@/types/game';

export const useGameManagement = (userId: string | undefined, onGameStart: (gameId: string) => void) => {
  const [availableGames, setAvailableGames] = useState<GameSession[]>([]);
  const [myGames, setMyGames] = useState<GameSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchGames = async () => {
    if (!userId) return;

    try {
      const { data: availableData, error: availableError } = await supabase
        .from('game_sessions')
        .select('*')
        .eq('status', 'waiting_for_player')
        .neq('player1_id', userId);

      if (availableError) {
        console.error('Error fetching available games:', availableError);
        return;
      }

      const { data: myGamesData, error: myGamesError } = await supabase
        .from('game_sessions')
        .select('*')
        .or(`player1_id.eq.${userId},player2_id.eq.${userId}`)
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

  const createGame = async () => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from('game_sessions')
        .insert([
          {
            player1_id: userId,
            player1_number: [],
            status: 'waiting_for_player',
            current_turn: userId,
          },
        ])
        .select()
        .maybeSingle();

      if (error) {
        console.error('Error creating game:', error);
        toast({
          title: 'Error',
          description: 'Failed to create game',
          variant: 'destructive',
        });
        return;
      }

      if (data) {
        toast({
          title: 'Success',
          description: 'Game created successfully',
        });
        onGameStart(data.id);
      }
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
    if (!userId) return;

    try {
      // First check if the game exists and is available
      const { data: gameCheck, error: checkError } = await supabase
        .from('game_sessions')
        .select()
        .eq('id', gameId)
        .eq('status', 'waiting_for_player')
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
          description: 'Game not found or no longer available',
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

  useEffect(() => {
    if (!userId) return;
    
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
        (payload) => {
          console.log('Game session changed:', payload);
          fetchGames();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return {
    availableGames,
    myGames,
    isLoading,
    createGame,
    joinGame,
  };
};