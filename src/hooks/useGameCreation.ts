import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useGameCreation = (
  userId: string | undefined,
  onGameStart: (gameId: string) => void
) => {
  const { toast } = useToast();

  const createGame = async (initialNumbers?: number[]) => {
    try {
      if (!initialNumbers || initialNumbers.length !== 4) {
        toast({
          title: "Error",
          description: "Please select 4 numbers first",
          variant: "destructive",
        });
        return;
      }

      const { data: game, error } = await supabase
        .from("game_sessions")
        .insert({
          player1_id: userId,
          player1_number: initialNumbers,
          status: "waiting_for_player",
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating game:", error);
        toast({
          title: "Error",
          description: "Failed to create game",
          variant: "destructive",
        });
        return;
      }

      // Trigger immediate refresh of game list
      const event = new CustomEvent("game_created", { detail: game });
      window.dispatchEvent(event);

      toast({
        title: "Success",
        description: "Game created successfully",
      });
    } catch (error) {
      console.error("Error in createGame:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  return { createGame };
};
