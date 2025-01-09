# Dinjure - Online Number Guessing Game

Dinjure is an engaging multiplayer number guessing game where players try to deduce each other's secret numbers through strategic guessing and deduction. The name "Dinjure" comes from the game's core mechanics of counting "Dead" and "Injured" numbers in each guess.

## How to Play

1. **Setup**: Each player selects 4 unique numbers (0-9) as their secret code.

2. **Gameplay**:
   - Players take turns making guesses about their opponent's secret numbers
   - After each guess, the game provides feedback in two categories:
     - **Dead**: Numbers that are correct and in the right position
     - **Injured**: Numbers that exist in the code but are in the wrong position

3. **Example**:
   - Secret Code: `1234`
   - Guess: `1567`
   - Result: `1 Dead, 0 Injured` (1 is correct and in right position, no other numbers match)

4. **Game Modes**:
   - **Online**: Challenge other players in real-time
   - **Offline**: Play against a friend locally
   - **Computer**: Test your skills against the computer

5. **Winning**: The first player to correctly guess their opponent's complete number sequence (4 Dead) wins!

## Features

- Real-time multiplayer gameplay
- Multiple game modes
- Clean and intuitive interface
- Color-coded guess history
- Instant feedback on guesses
- Persistent game state (continue games after refresh)

## Technical Stack

- React
- TypeScript
- Supabase (Backend & Real-time updates).
- Tailwind CSS.