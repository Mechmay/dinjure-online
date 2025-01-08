import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useGameCreation = (userId: string | undefined, onGameStart: (gameId: string) => void) => {
  const { toast } = useToast();

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

  return { createGame };
};