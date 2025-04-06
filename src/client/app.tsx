import { useEffect, useState } from 'react';
import { useSocketClient } from './providers/socket-client-provider';
import { GameArea } from './components/game-area';
import type { GameState } from '../shared/types/game.types';

export function App() {
  const socketClient = useSocketClient();
  const [gameState, setGameState] = useState<GameState | null>(null);

  useEffect(() => {
    socketClient.initializeGameInstanceUpdateListener((data) => {
      setGameState(data);
    });
  }, []);

  useEffect(() => {
    const handleKeydown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowLeft':
          socketClient.move(socketClient.getSelfId(), 'left');
          break;

        case 'ArrowDown':
          socketClient.move(socketClient.getSelfId(), 'down');
          break;

        case 'ArrowRight':
          socketClient.move(socketClient.getSelfId(), 'right');
          break;

        case 'ArrowUp':
          if (event.repeat) return;

          socketClient.rotate(socketClient.getSelfId());
          break;

        case ' ':
          if (event.repeat) return;

          socketClient.drop(socketClient.getSelfId());
          break;

        case 'c':
          if (event.repeat) return;

          socketClient.swap(socketClient.getSelfId());
          break;
      }
    };

    window.addEventListener('keydown', handleKeydown);

    return () => {
      window.removeEventListener('keydown', handleKeydown);
    };
  }, []);

  // TODO(fcasibu): refactor
  if (gameState) {
    const playerState = gameState.players[socketClient.getSelfId()]!;
    const width = (playerState.board[0]?.length ?? 0) * 30;
    const height = (playerState.board?.length ?? 0) * 30;

    if (!playerState) return null;

    return (
      <div className="flex gap-12 justify-center items-center h-full pt-42">
        {Object.values(gameState.players).map((player) => (
          <GameArea
            key={player.id}
            playerState={player}
            width={width}
            height={height}
            showGrid
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <button
        type="button"
        onClick={() => {
          socketClient.joinRoom(
            socketClient.getSelfId(),
            (updatedGameState) => {
              setGameState(updatedGameState);
              socketClient.startGame(updatedGameState.id!);
            },
          );
        }}
      >
        Solo
      </button>
      <button
        type="button"
        onClick={() => {
          socketClient.joinRoom(
            socketClient.getSelfId(),
            (updatedGameState) => {
              setGameState(updatedGameState);
            },
          );
        }}
      >
        PVP
      </button>
    </div>
  );
}
