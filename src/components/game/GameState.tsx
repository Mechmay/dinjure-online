import React, { useEffect, useState } from "react";
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
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const fetchGameData = async () => {
    try {
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
        if (isInitialLoad) {
          // Only show error toast on initial load
          toast({
            title: "Error",
            description: "Failed to load game data",
            variant: "destructive",
          });
        }
        console.error("Error fetching game:", gameError);
        return;
      }

      onGameUpdate(gameData);

      const { data: guessesData, error: guessesError } = await supabase
        .from("guesses")
        .select("*")
        .eq("game_id", gameId)
        .order("created_at", { ascending: false });

      if (guessesError) {
        if (isInitialLoad) {
          // Only show error toast on initial load
          toast({
            title: "Error",
            description: "Failed to load guesses",
            variant: "destructive",
          });
        }
        console.error("Error fetching guesses:", guessesError);
        return;
      }

      onGuessesUpdate(guessesData || []);
    } catch (error) {
      if (isInitialLoad) {
        // Only show error toast on initial load
        toast({
          title: "Error",
          description: "An unexpected error occurred",
          variant: "destructive",
        });
      }
      console.error("Error in fetchGameData:", error);
    } finally {
      setIsInitialLoad(false);
    }
  };

  useEffect(() => {
    fetchGameData();

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
        () => fetchGameData()
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "guesses",
          filter: `game_id=eq.${gameId}`,
        },
        () => fetchGameData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [gameId]);

  return null;
};

export default GameState;
