import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useGameJoining = (
  userId: string | undefined,
  onGameStart: (gameId: string) => void
) => {
  const { toast } = useToast();

  const joinGame = async (gameId: string, initialNumbers?: number[]) => {
    try {
      if (!initialNumbers || initialNumbers.length !== 4) {
        toast({
          title: "Error",
          description: "Please select 4 numbers first",
          variant: "destructive",
        });
        return;
      }

      console.log("Attempting to join game:", gameId, "as user:", userId);

      // First verify the game is still available
      const { data: gameCheck } = await supabase
        .from("game_sessions")
        .select("*")
        .eq("id", gameId)
        .eq("status", "waiting_for_player")
        .single();

      if (!gameCheck) {
        console.log("Game no longer available");
        toast({
          title: "Error",
          description: "This game is no longer available",
          variant: "destructive",
        });
        return;
      }

      // Try to join the game
      const { data: joinedGame, error: joinError } = await supabase
        .from("game_sessions")
        .update({
          player2_id: userId,
          player2_number: initialNumbers,
          status: "in_progress",
        })
        .eq("id", gameId)
        .select()
        .single();

      if (joinError) {
        console.error("Error joining game:", joinError);
        toast({
          title: "Error",
          description: "Failed to join game",
          variant: "destructive",
        });
        return;
      }

      console.log("Successfully joined game:", joinedGame);
      onGameStart(gameId);

      toast({
        title: "Success",
        description: "Successfully joined game",
      });
    } catch (error) {
      console.error("Error in joinGame:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  return { joinGame };
};
