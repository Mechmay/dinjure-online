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
    fetchGameData();

    // Create a single channel for both game and guess updates
    const gameChannel = supabase.channel(`game_room_${gameId}`);

    // Subscribe to game session changes
    gameChannel
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "game_sessions",
          filter: `id=eq.${gameId}`,
        },
        async (payload) => {
          console.log("Game session changed:", payload);
          await fetchGameData();
        }
      )
      // Subscribe to guesses changes
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "guesses",
          filter: `game_id=eq.${gameId}`,
        },
        async (payload) => {
          console.log("New guess received:", payload);
          await fetchGameData();
        }
      );

    // Start the subscription
    gameChannel.subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        console.log("Successfully subscribed to game updates");
        await fetchGameData(); // Initial fetch after successful subscription
      }
    });

    // Cleanup
    return () => {
      console.log("Cleaning up game channel subscription");
      supabase.removeChannel(gameChannel);
    };
  }, [gameId]); // Only re-run if gameId changes

  return null;
};

export default GameState;
