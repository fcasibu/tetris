import { useEffect, useState } from 'react';
import { useSocketClient } from './providers/socket-client-provider';
import { GameArea } from './components/game-area';
import type { GameState } from '../shared/types/game.types';
import { PieceQueue } from './components/piece-queue';

export function App() {
  const socketClient = useSocketClient();
  const [gameState, setGameState] = useState<GameState | null>(null);
  // TODO(fcasibu): just put everything in here for now
  const [multi, setMulti] = useState(false);

  useEffect(() => {
    socketClient.initializeGameInstanceUpdateListener((data) => {
      setGameState(data);
    });
  }, [socketClient]);

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
  }, [socketClient]);

  // TODO(fcasibu): refactor
  if (gameState) {
    const playerState = gameState.players[socketClient.getSelfId()]!;
    const width = (playerState.board[0]?.length ?? 0) * 30;
    const height = (playerState.board?.length ?? 0) * 30;

    return (
      <div className="flex flex-col gap-12 justify-center items-center h-full pt-42">
        <div className="flex gap-4">
          {Object.values(gameState.players).map((player) => (
            <div key={player.id} className="flex gap-4">
              <div className="flex flex-col gap-2">
                <div className="h-8">
                  {player.combo ? <span>x{player.combo}</span> : null}
                </div>
                <GameArea
                  playerState={player}
                  width={width}
                  height={height}
                  showGrid
                />
              </div>
              <div className="mt-10">
                <PieceQueue queue={player.tetrominoQueue} />
              </div>
            </div>
          ))}
        </div>
        {multi && (
          <button
            type="button"
            className="cursor-pointer bg-black text-white rounded-lg px-3"
            onClick={() => {
              socketClient.startGame(socketClient.getRoomIdOfSelf()!);
            }}
          >
            STart
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <button
        type="button"
        onClick={() => {
          setMulti(false);
          socketClient.joinRoom(
            socketClient.getSelfId(),
            'solo',
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
          setMulti(true);
          socketClient.joinRoom(
            socketClient.getSelfId(),
            'multi',
            (updatedGameState) => {
              console.log(updatedGameState);
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
