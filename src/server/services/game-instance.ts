import { PlayerService } from './player';
import { GameboardService } from './game-board';
import {
  type PlayerAction,
  GameStatus,
  type GameState,
} from '../../shared/types/game.types';
import type { ServerSocket } from '../../shared/types/socket.events';

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

  constructor(private readonly socket: ServerSocket) {}

  public swap(playerId: string) {
    const player = this.players.get(playerId);

    if (!player) return;

    player.action.hold = true;
  }

  public rotate(playerId: string) {
    const player = this.players.get(playerId);

    if (!player) return;

    player.action.rotate = true;
  }

  public drop(playerId: string) {
    const player = this.players.get(playerId);

    if (!player) return;

    player.action.drop = true;
  }

  public move(playerId: string, position: 'left' | 'down' | 'right') {
    const player = this.players.get(playerId);

    if (!player) return;

    player.action.move = position;
  }

  public getPlayerInstance(playerId: string) {
    return this.players.has(playerId) ? this : null;
  }

  public isEmpty() {
    return this.players.size === 0;
  }

  public getRoomId() {
    return this.id;
  }

  public isAvailable() {
    return this.players.size < 2;
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
    let lastUpdated = performance.now();

    this.interval = setInterval(() => {
      const now = performance.now();
      const dt = (now - lastUpdated) / 1000;
      lastUpdated = now;
      if (this.players.size === 0) {
        this.endGame();
        return;
      }

      for (const [_, { player, action }] of this.players) {
        const playerState = player.getState();

        if (playerState.isGameOver) {
          hasWinner = true;
        }

        if (!playerState.isGameOver && hasWinner) {
          winner = playerState.id;
        }

        player.update(dt, action);

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

        this.endGame();
      }

      this.socket.to(this.id).emit('gameStateUpdate', this.getState());
    }, 1000 / 60);
  }

  private endGame() {
    this.status = GameStatus.Finished;
    clearInterval(this.interval);
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
