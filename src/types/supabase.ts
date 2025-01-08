import { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

export interface GameSession {
  id: string;
  player1_id: string;
  player2_id: string;
  status: string;
  current_turn: string;
  // ... other fields
}

export type GameSessionPayload = RealtimePostgresChangesPayload<GameSession>; 