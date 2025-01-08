import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { GameSession } from '@/types/game';
import { useGameCreation } from './useGameCreation';
import { useGameJoining } from './useGameJoining';

export const useGameManagement = (userId: string | undefined, onGameStart: (gameId: string) => void) => {
  const [availableGames, setAvailableGames] = useState<GameSession[]>([]);
  const [myGames, setMyGames] = useState<GameSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { createGame } = useGameCreation(userId, onGameStart);
  const { joinGame } = useGameJoining(userId, onGameStart);

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
        () => {
          console.log('Game session changed, fetching updates');
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