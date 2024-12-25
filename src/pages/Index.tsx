import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Users, Monitor, LogOut } from 'lucide-react';
import GameInstructions from '@/components/GameInstructions';
import GameLobby from '@/components/game/GameLobby';
import OnlineGame from '@/components/game/OnlineGame';
import { useAuth } from '@/components/auth/AuthProvider';
import NumberButton from '@/components/NumberButton';
import GuessHistory from '@/components/GuessHistory';
import { Send, RotateCcw } from 'lucide-react';

interface Guess {
  numbers: number[];
  dead: number;
  injured: number;
}

const Index = () => {
  const [gameMode, setGameMode] = useState<'computer' | 'online' | null>(null);
  const [onlineGameId, setOnlineGameId] = useState<string | null>(null);
  const [targetNumber, setTargetNumber] = useState<number[]>([]);
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [guesses, setGuesses] = useState<Guess[]>([]);
  const [gameWon, setGameWon] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const generateTargetNumber = () => {
    const numbers = Array.from({ length: 10 }, (_, i) => i);
    const shuffled = numbers.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 4);
  };

  useEffect(() => {
    if (gameMode === 'computer') {
      setTargetNumber(generateTargetNumber());
    }
  }, [gameMode]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const handleGameStart = (gameId: string) => {
    setOnlineGameId(gameId);
  };

  const handleExitGame = () => {
    setOnlineGameId(null);
    setGameMode(null);
    setSelectedNumbers([]);
    setGuesses([]);
    setGameWon(false);
  };

  const handleNumberClick = (number: number) => {
    if (selectedNumbers.includes(number)) {
      setSelectedNumbers(selectedNumbers.filter((n) => n !== number));
    } else if (selectedNumbers.length < 4) {
      setSelectedNumbers([...selectedNumbers, number]);
    }
  };

  const checkGuess = () => {
    if (selectedNumbers.length !== 4) {
      toast({
        title: "Invalid guess",
        description: "Please select exactly 4 numbers",
        variant: "destructive",
      });
      return;
    }

    let dead = 0;
    let injured = 0;

    selectedNumbers.forEach((num, index) => {
      if (targetNumber[index] === num) {
        dead++;
      } else if (targetNumber.includes(num)) {
        injured++;
      }
    });

    const newGuess = {
      numbers: [...selectedNumbers],
      dead,
      injured,
    };

    setGuesses([newGuess, ...guesses]);
    setSelectedNumbers([]);

    if (dead === 4) {
      setGameWon(true);
      toast({
        title: "4 Dead! Dinjure!",
        description: "Congratulations, you've won the game!",
      });
    }
  };

  if (!user) return null;

  if (!gameMode) {
    return (
      <div className="min-h-screen bg-game-background text-white p-4">
        <div className="container max-w-2xl mx-auto space-y-8 relative">
          <GameInstructions />
          <Button
            onClick={handleSignOut}
            variant="ghost"
            size="icon"
            className="absolute top-4 left-4 text-game-accent"
          >
            <LogOut className="h-6 w-6" />
          </Button>
          <div className="text-center space-y-8">
            <h1 className="text-4xl font-bold text-game-accent">Dinjure</h1>
            <p className="text-game-accent/60">Choose your game mode</p>
            <div className="flex justify-center gap-4">
              <Button
                onClick={() => setGameMode('computer')}
                className="bg-game-accent text-game-background hover:bg-game-accent/80 p-8"
              >
                <Monitor className="mr-2 h-6 w-6" />
                vs Computer
              </Button>
              <Button
                onClick={() => setGameMode('online')}
                className="bg-game-accent text-game-background hover:bg-game-accent/80 p-8"
              >
                <Users className="mr-2 h-6 w-6" />
                Online
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (gameMode === 'online') {
    return (
      <div className="min-h-screen bg-game-background text-white p-4">
        <div className="container max-w-2xl mx-auto space-y-8 relative">
          <GameInstructions />
          <Button
            onClick={handleExitGame}
            variant="ghost"
            size="icon"
            className="absolute top-4 left-4 text-game-accent"
          >
            <LogOut className="h-6 w-6" />
          </Button>
          {onlineGameId ? (
            <OnlineGame gameId={onlineGameId} onExit={handleExitGame} />
          ) : (
            <GameLobby onGameStart={handleGameStart} />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-game-background text-white p-4">
      <div className="container max-w-2xl mx-auto space-y-8 relative">
        <GameInstructions />
        <Button
          onClick={handleExitGame}
          variant="ghost"
          size="icon"
          className="absolute top-4 left-4 text-game-accent"
        >
          <LogOut className="h-6 w-6" />
        </Button>

        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-game-accent">Dinjure</h1>
          <p className="text-game-accent/60">
            {gameWon ? 'Congratulations!' : 'Crack the code!'}
          </p>
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
                disabled={gameWon || (selectedNumbers.length === 4 && !selectedNumbers.includes(i))}
              />
            ))}
          </div>

          <div className="flex justify-center gap-4">
            <Button
              onClick={checkGuess}
              disabled={selectedNumbers.length !== 4 || gameWon}
              className="bg-game-accent text-game-background hover:bg-game-accent/80"
            >
              <Send className="mr-2 h-4 w-4" />
              Submit Guess
            </Button>
            <Button
              onClick={handleExitGame}
              variant="outline"
              className="border-game-accent text-game-accent hover:bg-game-accent/20"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              New Game
            </Button>
          </div>
        </div>

        <div className="mt-8">
          <GuessHistory guesses={guesses} />
        </div>
      </div>
    </div>
  );
};

export default Index;