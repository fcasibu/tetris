import { useState, useTransition } from 'react';
import { useSocketClient } from './providers/socket-client-provider';
import type { GameState } from '@shared/types/game.types';
import { TetrisCanvas } from './components/game-area';

export function App() {
  const socketClient = useSocketClient();
  const [isPending, startTransition] = useTransition();
  const [gameState, setGameState] = useState<GameState | null>(null);

  if (gameState) {
    const playerState = gameState.players[socketClient.getSelfId()]!;
    const width = (playerState.board[0]?.length ?? 0) / 30;
    const height = (playerState.board?.length ?? 0) / 30;

    if (!playerState) return null;

    return (
      <TetrisCanvas
        playerState={playerState}
        width={width}
        height={height}
        showGrid
      />
    );
  }

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <button
        type="button"
        disabled={isPending}
        onClick={() => {
          startTransition(() => {
            socketClient.joinRoom(
              socketClient.getSelfId(),
              (updatedGameState) => {
                setGameState(updatedGameState);
              },
            );
            setTimeout(() => {
              socketClient.startGame(socketClient.getRoomIdOfSelf()!);
            }, 3000);
          });
        }}
      >
        Solo
      </button>
    </div>
  );
}
