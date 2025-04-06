import {
  GameStatus,
  type GameState,
  type PlayerAction,
} from '@shared/types/game.types';
import { PlayerService } from './player';
import { GameboardService } from './game-board';
import type { ServerSocket } from '@shared/types/socket.events';

export class GameInstance {
  private id = crypto.randomUUID();
  private players = new Map<
    string,
    {
      action: PlayerAction;
      player: PlayerService;
    }
  >();
  private status = GameStatus.Lobby;
  private interval: NodeJS.Timeout | undefined;

  constructor(private readonly socket: ServerSocket) {
    socket.on('swapTetromino', ({ playerId }) => {
      const player = this.players.get(playerId);

      if (player) {
        player.action.hold = true;
      }
    });

    socket.on('rotateTetromino', ({ playerId }) => {
      const player = this.players.get(playerId);

      if (player) {
        player.action.rotate = true;
      }
    });

    socket.on('dropTetromino', ({ playerId }) => {
      const player = this.players.get(playerId);

      if (player) {
        player.action.drop = true;
      }
    });

    socket.on('moveTetromino', ({ playerId, position }) => {
      const player = this.players.get(playerId);

      if (player) {
        player.action.move = position;
      }
    });
  }

  public getState(): GameState {
    return {
      id: this.id,
      players: Object.fromEntries(
        Array.from(this.players.entries()).map(([id, { player }]) => [
          id,
          player.getState(),
        ]),
      ),
      status: this.status,
    };
  }

  public start() {
    this.status = GameStatus.Playing;
    let winner: string | null = null;
    let hasWinner = false;

    this.interval = setInterval(() => {
      for (const [_, { player, action }] of this.players) {
        const playerState = player.getState();
        if (playerState.isGameOver) {
          hasWinner = true;
        }

        if (hasWinner && !playerState.isGameOver) {
          winner = playerState.id;
        }

        player.update(action);

        action.move = undefined;
        action.drop = undefined;
        action.rotate = undefined;
        action.hold = undefined;
      }

      if (winner) {
        this.socket.to(this.id).emit('gameWinner', {
          roomId: this.id,
          playerId: winner,
        });

        clearInterval(this.interval);
      }

      this.socket.to(this.id).emit('gameState', this.getState());
    }, 1000 / 60);
  }

  public addPlayer(socketId: string) {
    this.players.set(socketId, {
      player: new PlayerService(socketId, new GameboardService()),
      action: {},
    });
  }

  public removePlayer(socketId: string) {
    this.players.delete(socketId);
  }
}
