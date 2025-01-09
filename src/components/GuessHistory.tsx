import React from "react";
import { useTheme } from "./theme/ThemeProvider";
import { cn } from "@/lib/utils";

interface GuessHistoryProps {
  guesses: any[];
  currentPlayerId?: string;
  player1Id?: string;
  player2Id?: string;
}

const GuessHistory = ({
  guesses,
  currentPlayerId,
  player1Id,
  player2Id,
}: GuessHistoryProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-game-accent">Guess History</h3>
      <div className="space-y-2">
        {guesses.map((guess, index) => {
          const isMyGuess = guess.player_id === currentPlayerId;
          const isPlayer1 = guess.player_id === player1Id;

          return (
            <div
              key={index}
              className={`p-4 rounded-lg ${
                isMyGuess
                  ? "bg-game-accent/20 border-2 border-game-accent/40"
                  : "bg-white/5 border-2 border-white/20"
              }`}
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-sm ${
                      isPlayer1 ? "text-blue-400" : "text-red-400"
                    }`}
                  >
                    {isPlayer1 ? "Player 1" : "Player 2"}
                  </span>
                  <span className="text-white">{guess.numbers.join(", ")}</span>
                </div>
                <div className="text-sm">
                  <span className="text-green-400">{guess.dead} Dead</span>
                  <span className="mx-2">•</span>
                  <span className="text-yellow-400">
                    {guess.injured} Injured
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GuessHistory;
