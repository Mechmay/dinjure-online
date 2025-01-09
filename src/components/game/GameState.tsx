import React, { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface GameStateProps {
  gameId: string;
  onGameUpdate: (gameData: any) => void;
  onGuessesUpdate: (guessesData: any[]) => void;
}

const GameState = ({
  gameId,
  onGameUpdate,
  onGuessesUpdate,
}: GameStateProps) => {
  const { toast } = useToast();

  const fetchGameData = async () => {
    try {
      // Fetch game data with player information
      const { data: gameData, error: gameError } = await supabase
        .from("game_sessions")
        .select(
          `
          *,
          player1:player1_id(*),
          player2:player2_id(*)
        `
        )
        .eq("id", gameId)
        .single();

      if (gameError) {
        console.error("Error fetching game:", gameError);
        return;
      }

      onGameUpdate(gameData);

      // Fetch guesses
      const { data: guessesData, error: guessesError } = await supabase
        .from("guesses")
        .select("*")
        .eq("game_id", gameId)
        .order("created_at", { ascending: false });

      if (guessesError) {
        console.error("Error fetching guesses:", guessesError);
        return;
      }

      onGuessesUpdate(guessesData || []);
    } catch (error) {
      console.error("Error in fetchGameData:", error);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchGameData();

    // Subscribe to game changes
    const channel = supabase
      .channel(`game_${gameId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "game_sessions",
          filter: `id=eq.${gameId}`,
        },
        () => {
          fetchGameData();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "guesses",
          filter: `game_id=eq.${gameId}`,
        },
        () => {
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
