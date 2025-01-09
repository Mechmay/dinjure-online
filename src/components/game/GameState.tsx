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
      // First fetch game data
      const { data: gameData, error: gameError } = await supabase
        .from("game_sessions")
        .select("*")
        .eq("id", gameId)
        .single();

      if (gameError) {
        if (isInitialLoad) {
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

      // Then fetch guesses with proper ordering
      const { data: guessesData, error: guessesError } = await supabase
        .from("guesses")
        .select(
          `
          *,
          player:player_id(*)
        `
        )
        .eq("game_id", gameId)
        .order("created_at", { ascending: false });

      if (guessesError) {
        console.error("Error fetching guesses:", guessesError);
        return;
      }

      console.log("Fetched guesses:", guessesData);
      onGuessesUpdate(guessesData || []);
    } catch (error) {
      console.error("Error in fetchGameData:", error);
    }
  };

  useEffect(() => {
    fetchGameData();

    const channel = supabase
      .channel("game_updates")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "guesses",
          filter: `game_id=eq.${gameId}`,
        },
        () => {
          console.log("New guess detected");
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
