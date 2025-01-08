export interface GameSession {
  id: string;
  player1_id: string;
  player2_id: string | null;
  status: 'waiting_for_player' | 'in_progress' | 'completed';
  player1_number: number[];
  player2_number: number[];
  current_turn: string;
  winner_id: string | null;
}