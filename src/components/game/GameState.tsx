import { useEffect } from "react";
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

  useEffect(() => {
    const fetchGameData = async () => {
      try {
        console.log("Fetching game data for:", gameId);

        const { data: gameData, error: gameError } = await supabase
          .from("game_sessions")
          .select(
            `
            *,
            player1:player1_id(id, email),
            player2:player2_id(id, email)
          `
          )
          .eq("id", gameId)
          .single();

        if (gameError) {
          console.error("Error fetching game:", gameError);
          toast({
            title: "Error",
            description: "Failed to load game data",
            variant: "destructive",
          });
          return;
        }

        console.log("Game data received:", gameData);
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

        console.log("Guesses data received:", guessesData);
        onGuessesUpdate(guessesData || []);
      } catch (error) {
        console.error("Error in fetchGameData:", error);
      }
    };

    fetchGameData();

    // Subscribe to real-time changes
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
        (payload) => {
          console.log("Game session updated:", payload);
          fetchGameData(); // Fetch full game data instead of using payload
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
          console.log("New guess received");
          fetchGameData();
        }
      )
      .subscribe((status) => {
        console.log("Subscription status:", status);
      });

    return () => {
      console.log("Cleaning up subscriptions");
      supabase.removeChannel(channel);
    };
  }, [gameId, onGameUpdate, onGuessesUpdate, toast]);

  return null;
};

export default GameState;
