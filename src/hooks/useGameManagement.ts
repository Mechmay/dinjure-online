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

  useEffect(() => {
    console.log("useGameManagement effect running with userId:", userId);

    const fetchGames = async () => {
      try {
        setIsLoading(true);
        console.log("Fetching games...");

        if (!userId) return;

        const { data: availableData, error: availableError } = await supabase
          .from("game_sessions")
          .select("*")
          .eq("status", "waiting_for_player")
          .neq("player1_id", userId);

        if (availableError) {
          console.error("Error fetching available games:", availableError);
          return;
        }

        const { data: myGamesData, error: myGamesError } = await supabase
          .from("game_sessions")
          .select("*")
          .or(`player1_id.eq.${userId},player2_id.eq.${userId}`)
          .order("created_at", { ascending: false });

        if (myGamesError) {
          console.error("Error fetching my games:", myGamesError);
          return;
        }

        setAvailableGames(availableData || []);
        setMyGames(myGamesData || []);
        setIsLoading(false);
        console.log("Finished loading games");
      } catch (error) {
        console.error("Error fetching games:", error);
      } finally {
        setIsLoading(false);
        console.log("Finished loading games");
      }
    };

    if (userId) {
      fetchGames();
    } else {
      console.log("No userId, skipping fetch");
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

  const deleteGame = async (gameId: string) => {
    try {
      const { error } = await supabase
        .from("game_sessions")
        .delete()
        .eq("id", gameId)
        .eq("player1_id", userId)
        .eq("status", "waiting_for_player");

      if (error) {
        console.error("Error deleting game:", error);
        toast({
          title: "Error",
          description: "Failed to delete game",
          variant: "destructive",
        });
        return;
      }

      const { data: myGamesData } = await supabase
        .from("game_sessions")
        .select("*")
        .or(`player1_id.eq.${userId},player2_id.eq.${userId}`)
        .order("created_at", { ascending: false });

      setMyGames(myGamesData || []);

      toast({
        title: "Success",
        description: "Game deleted successfully",
      });
    } catch (error) {
      console.error("Error in deleteGame:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  return {
    availableGames,
    myGames,
    isLoading,
    createGame,
    joinGame,
    deleteGame,
  };
};
