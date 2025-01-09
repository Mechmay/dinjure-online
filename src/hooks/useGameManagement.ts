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
    } catch (error) {
      console.error("Error fetching games:", error);
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
    const handleGameCreated = () => {
      console.log("Game created event received");
      fetchGames();
    };

    window.addEventListener("game_created", handleGameCreated);
    return () => window.removeEventListener("game_created", handleGameCreated);
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
        .eq("player1_id", userId);

      if (error) {
        console.error("Error deleting game:", error);
        toast({
          title: "Error",
          description: "Failed to delete game",
          variant: "destructive",
        });
        return;
      }

      // Update local state after successful deletion
      setMyGames((prevGames) => prevGames.filter((game) => game.id !== gameId));
      setAvailableGames((prevGames) =>
        prevGames.filter((game) => game.id !== gameId)
      );

      toast({
        title: "Success",
        description: "Game deleted successfully",
      });
    } catch (error) {
      console.error("Error in deleteGame:", error);
      toast({
        title: "Error",
        description: "Failed to delete game",
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
