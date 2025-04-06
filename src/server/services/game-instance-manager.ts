import type { ServerSocket } from '../../shared/types/socket.events';
import { GameInstance } from './game-instance';
import { strict as assert } from 'node:assert';

export class GameInstanceManager {
  private gameInstances = new Map<string, GameInstance>();
  private io: ServerSocket | null = null;

  constructor() {}

  public init(io: ServerSocket) {
    this.io = io;
    this.setupListeners();
  }

  private setupListeners() {
    const io = this.io;
    assert(io);

    io.on('connection', (socket: ServerSocket) => {
      socket.on('startGame', ({ roomId }) => {
        const instance = this.gameInstances.get(roomId);

        if (!instance) return;

        instance.start();
      });

      socket.on('swapTetromino', ({ playerId }) => {
        const instance = this.findInstanceOfPlayer(playerId);

        if (!instance) {
          return;
        }

        instance.swap(playerId);
      });

      socket.on('dropTetromino', ({ playerId }) => {
        const instance = this.findInstanceOfPlayer(playerId);

        if (!instance) {
          return;
        }

        instance.drop(playerId);
      });

      socket.on('rotateTetromino', ({ playerId }) => {
        const instance = this.findInstanceOfPlayer(playerId);

        if (!instance) {
          return;
        }

        instance.rotate(playerId);
      });

      socket.on('moveTetromino', ({ playerId, position }) => {
        const instance = this.findInstanceOfPlayer(playerId);

        if (!instance) {
          return;
        }

        instance.move(playerId, position);
      });

      // TODO(fcasibu): solo/pvp specific
      socket.on('joinRoom', ({ playerId }, ack) => {
        const availableInstance = this.findAvailableInstance();

        if (!availableInstance) {
          const gameInstance = new GameInstance(io);
          socket.join(gameInstance.getRoomId());

          this.gameInstances.set(gameInstance.getRoomId(), gameInstance);
          gameInstance.addPlayer(playerId);
          return;
        }

        availableInstance.addPlayer(playerId);
        socket.join(availableInstance.getRoomId());

        // TODO(fcasibu): for testing
        availableInstance.start();

        ack?.({
          success: true,
          payload: availableInstance.getState(),
        });
      });

      socket.on('leaveRoom', ({ roomId, playerId }, ack) => {
        const instance = this.gameInstances.get(roomId);

        if (!instance) {
          ack?.({
            success: false,
            reason: 'The room does not exist',
          });
          return;
        }

        instance.removePlayer(playerId);
        io.to(instance.getRoomId()).emit('leaveRoom', { playerId });
      });

      socket.on('disconnect', () => {
        const instance = this.findInstanceOfPlayer(socket.id);

        if (!instance) {
          return;
        }

        instance.removePlayer(socket.id);

        if (instance.isEmpty()) {
          this.gameInstances.delete(instance.getRoomId());
        }
      });
    });
  }

  private findAvailableInstance() {
    for (const gameInstance of this.gameInstances.values()) {
      if (gameInstance.isAvailable()) return gameInstance;
    }
  }

  private findInstanceOfPlayer(socketId: string) {
    for (const instance of this.gameInstances.values()) {
      const player = instance.getPlayerInstance(socketId);

      if (player) return player;
    }
  }
}
