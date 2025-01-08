import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { GameSession } from "@/types/game";
import { useGameCreation } from "./useGameCreation";
import { useGameJoining } from "./useGameJoining";

export const useGameManagement = (
  userId: string | undefined,
  onGameStart: (gameId: string) => void
) => {
  const [availableGames, setAvailableGames] = useState<GameSession[]>([]);
  const [myGames, setMyGames] = useState<GameSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { createGame } = useGameCreation(userId, onGameStart);
  const { joinGame } = useGameJoining(userId, onGameStart);

  const fetchGames = async () => {
    try {
      console.log("Fetching games for user:", userId);

      if (!userId) {
        console.log("No userId, skipping fetch");
        return;
      }

      const { data: myGamesData, error: myGamesError } = await supabase
        .from("game_sessions")
        .select("*")
        .or(`player1_id.eq.${userId},player2_id.eq.${userId}`)
        .order("created_at", { ascending: false });

      if (myGamesError) {
        console.error("Error fetching my games:", myGamesError);
        toast({
          title: "Error",
          description: "Failed to fetch your games",
          variant: "destructive",
        });
        return;
      }

      console.log("My games data:", myGamesData);
      setMyGames(myGamesData || []);

      // Only fetch available games if not in a game
      const activeGame = myGamesData?.find(
        (game) => game.status === "in_progress"
      );
      if (activeGame) {
        console.log("Found active game:", activeGame);
        onGameStart(activeGame.id);
        return;
      }

      const { data: availableData, error: availableError } = await supabase
        .from("game_sessions")
        .select("*")
        .eq("status", "waiting_for_player")
        .neq("player1_id", userId);

      if (availableError) {
        console.error("Error fetching available games:", availableError);
        return;
      }

      console.log("Available games:", availableData);
      setAvailableGames(availableData || []);
    } catch (error) {
      console.error("Error in fetchGames:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchGames();
    } else {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel("game_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "game_sessions",
        },
        () => {
          console.log("Game session changed, fetching updates");
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
