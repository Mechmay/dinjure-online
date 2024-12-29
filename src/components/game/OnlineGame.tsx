import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '../auth/AuthProvider';
import GameHeader from './GameHeader';
import NumberSelection from './NumberSelection';
import GameControls from './GameControls';
import GuessHistory from '../GuessHistory';
import GameInstructions from '../GameInstructions';

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

      // Add player number (1 or 2) to each guess for color coding
      const processedGuesses = guessesData.map(guess => ({
        ...guess,
        player: guess.player_id === gameData.player1_id ? 1 : 2
      }));
      setGuesses(processedGuesses);
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
        title: '4 Dead! Dinjure!',
        description: 'Congratulations, you won the game!',
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
  const myNumbers = isPlayer1 ? gameSession.player1_number : gameSession.player2_number;

  return (
    <div className="min-h-screen bg-game-background text-white p-4">
      <div className="container max-w-2xl mx-auto space-y-8">
        <GameInstructions />
        
        <GameHeader
          gameWon={gameSession.winner_id === user.id}
          playerNumbers={myNumbers}
          isOnline={true}
          status={gameSession.status}
          isMyTurn={isMyTurn}
          needsToSetNumbers={needsToSetNumbers}
        />

        <NumberSelection
          selectedNumbers={selectedNumbers}
          onNumberClick={handleNumberClick}
          disabled={
            gameSession.status === 'completed' ||
            (!isMyTurn && !needsToSetNumbers)
          }
          player={isPlayer1 ? 1 : 2}
        />

        <GameControls
          onSubmit={needsToSetNumbers ? submitNumbers : submitGuess}
          onExit={onExit}
          submitDisabled={
            selectedNumbers.length !== 4 ||
            gameSession.status === 'completed' ||
            (!isMyTurn && !needsToSetNumbers)
          }
          isSettingNumbers={needsToSetNumbers}
        />

        {!needsToSetNumbers && <GuessHistory guesses={guesses} />}
      </div>
    </div>
  );
};

export default OnlineGame;