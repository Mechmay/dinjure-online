import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '../auth/AuthProvider';
import NumberButton from '../NumberButton';
import GuessHistory from '../GuessHistory';
import { Button } from '../ui/button';
import { Send, RotateCcw } from 'lucide-react';

interface GameSession {
  id: string;
  player1_id: string;
  player2_id: string;
  player1_number: number[];
  player2_number: number[];
  current_turn: string;
  winner_id: string | null;
  status: 'waiting_for_player' | 'in_progress' | 'completed';
}

interface OnlineGameProps {
  gameId: string;
  onExit: () => void;
}

const OnlineGame = ({ gameId, onExit }: OnlineGameProps) => {
  const [gameSession, setGameSession] = useState<GameSession | null>(null);
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [guesses, setGuesses] = useState<any[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const fetchGame = async () => {
      const { data: gameData, error: gameError } = await supabase
        .from('game_sessions')
        .select('*')
        .eq('id', gameId)
        .single();

      if (gameError) {
        console.error('Error fetching game:', gameError);
        return;
      }

      setGameSession(gameData);

      const { data: guessesData, error: guessesError } = await supabase
        .from('guesses')
        .select('*')
        .eq('game_id', gameId)
        .order('created_at', { ascending: false });

      if (guessesError) {
        console.error('Error fetching guesses:', guessesError);
        return;
      }

      setGuesses(guessesData);
    };

    fetchGame();

    const channel = supabase
      .channel('game_updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'game_sessions',
          filter: `id=eq.${gameId}`,
        },
        (payload) => {
          setGameSession(payload.new as GameSession);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'guesses',
          filter: `game_id=eq.${gameId}`,
        },
        () => {
          fetchGame();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [gameId]);

  const handleNumberClick = (number: number) => {
    if (selectedNumbers.includes(number)) {
      setSelectedNumbers(selectedNumbers.filter((n) => n !== number));
    } else if (selectedNumbers.length < 4) {
      setSelectedNumbers([...selectedNumbers, number]);
    }
  };

  const submitNumbers = async () => {
    if (!gameSession || !user) return;

    if (selectedNumbers.length !== 4) {
      toast({
        title: 'Invalid selection',
        description: 'Please select exactly 4 numbers',
        variant: 'destructive',
      });
      return;
    }

    const isPlayer1 = user.id === gameSession.player1_id;
    const updateField = isPlayer1 ? 'player1_number' : 'player2_number';

    const { error } = await supabase
      .from('game_sessions')
      .update({
        [updateField]: selectedNumbers,
        current_turn: isPlayer1 ? gameSession.player2_id : gameSession.player1_id,
      })
      .eq('id', gameId);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit numbers',
        variant: 'destructive',
      });
      return;
    }

    setSelectedNumbers([]);
  };

  const submitGuess = async () => {
    if (!gameSession || !user || selectedNumbers.length !== 4) return;

    const targetNumbers = user.id === gameSession.player1_id ? gameSession.player2_number : gameSession.player1_number;
    
    let dead = 0;
    let injured = 0;

    selectedNumbers.forEach((num, index) => {
      if (targetNumbers[index] === num) {
        dead++;
      } else if (targetNumbers.includes(num)) {
        injured++;
      }
    });

    const { error: guessError } = await supabase
      .from('guesses')
      .insert([
        {
          game_id: gameId,
          player_id: user.id,
          numbers: selectedNumbers,
          dead,
          injured,
        },
      ]);

    if (guessError) {
      toast({
        title: 'Error',
        description: 'Failed to submit guess',
        variant: 'destructive',
      });
      return;
    }

    if (dead === 4) {
      await supabase
        .from('game_sessions')
        .update({
          status: 'completed',
          winner_id: user.id,
        })
        .eq('id', gameId);

      toast({
        title: 'Congratulations!',
        description: 'You won the game!',
      });
    } else {
      await supabase
        .from('game_sessions')
        .update({
          current_turn: user.id === gameSession.player1_id ? gameSession.player2_id : gameSession.player1_id,
        })
        .eq('id', gameId);
    }

    setSelectedNumbers([]);
  };

  if (!gameSession || !user) return null;

  const isPlayer1 = user.id === gameSession.player1_id;
  const isMyTurn = user.id === gameSession.current_turn;
  const needsToSetNumbers = isPlayer1 
    ? gameSession.player1_number.length === 0 
    : gameSession.player2_number.length === 0;
  const opponent = isPlayer1 ? gameSession.player2_id : gameSession.player1_id;
  const myNumbers = isPlayer1 ? gameSession.player1_number : gameSession.player2_number;

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-game-accent">
          {gameSession.status === 'completed'
            ? `Game Over - ${gameSession.winner_id === user.id ? 'You Won!' : 'You Lost!'}`
            : needsToSetNumbers
            ? 'Set Your Numbers'
            : isMyTurn
            ? 'Your Turn'
            : "Opponent's Turn"}
        </h2>
        {myNumbers.length > 0 && (
          <div className="text-white">
            Your numbers: {myNumbers.join(' ')}
          </div>
        )}
      </div>

      <div className="space-y-6">
        <div className="flex justify-center gap-2">
          {selectedNumbers.map((num, index) => (
            <div
              key={index}
              className="w-12 h-12 border-2 border-game-accent rounded flex items-center justify-center text-xl font-mono text-game-accent"
            >
              {num}
            </div>
          ))}
          {Array(4 - selectedNumbers.length)
            .fill(null)
            .map((_, index) => (
              <div
                key={`empty-${index}`}
                className="w-12 h-12 border-2 border-game-accent/30 rounded flex items-center justify-center text-xl font-mono"
              >
                _
              </div>
            ))}
        </div>

        <div className="grid grid-cols-5 gap-2 justify-center max-w-xs mx-auto">
          {Array.from({ length: 10 }, (_, i) => (
            <NumberButton
              key={i}
              number={i}
              onClick={handleNumberClick}
              selected={selectedNumbers.includes(i)}
              disabled={
                gameSession.status === 'completed' ||
                (!isMyTurn && !needsToSetNumbers) ||
                (selectedNumbers.length === 4 && !selectedNumbers.includes(i))
              }
            />
          ))}
        </div>

        <div className="flex justify-center gap-4">
          <Button
            onClick={needsToSetNumbers ? submitNumbers : submitGuess}
            disabled={
              selectedNumbers.length !== 4 ||
              gameSession.status === 'completed' ||
              (!isMyTurn && !needsToSetNumbers)
            }
            className="bg-game-accent text-game-background hover:bg-game-accent/80"
          >
            <Send className="mr-2 h-4 w-4" />
            {needsToSetNumbers ? 'Set Numbers' : 'Submit Guess'}
          </Button>
          <Button
            onClick={onExit}
            variant="outline"
            className="border-game-accent text-game-accent hover:bg-game-accent/20"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Exit Game
          </Button>
        </div>
      </div>

      {!needsToSetNumbers && <GuessHistory guesses={guesses} />}
    </div>
  );
};

export default OnlineGame;