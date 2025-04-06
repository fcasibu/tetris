import type { ServerSocket } from '@shared/types/socket.events';
import { GameInstance } from './game-instance';
import { strict as assert } from 'node:assert';

export class GameInstanceManager {
  private gameInstances = new Map<string, GameInstance>();
  private io: ServerSocket;

  constructor() {}

  public init(io: ServerSocket) {
    this.io = io;
    this.setupListeners();
  }

  private setupListeners() {
    assert(this.io);

    this.io.on('connection', (socket: ServerSocket) => {
      socket.on('joinRoom', ({ playerId }, ack) => {
        const availableInstance = this.findAvailableInstance();

        if (!availableInstance) {
          const gameInstance = new GameInstance(this.io);
          socket.join(gameInstance.getRoomId());

          this.gameInstances.set(gameInstance.getRoomId(), gameInstance);
          gameInstance.addPlayer(playerId);
          return;
        }

        availableInstance.addPlayer(playerId);
        socket.join(availableInstance.getRoomId());

        ack({
          success: true,
          payload: availableInstance.getState(),
        });
      });

      socket.on('leaveRoom', ({ roomId, playerId }, ack) => {
        const instance = this.gameInstances.get(roomId);

        if (!instance) {
          ack({
            success: false,
            reason: 'The room does not exist',
          });
          return;
        }

        instance.removePlayer(playerId);
        this.io.to(instance.getRoomId()).emit('leaveRoom', { playerId });
      });

      // TODO(fcasibu): handle disconnect
    });
  }

  private findAvailableInstance() {
    for (const gameInstance of this.gameInstances.values()) {
      if (gameInstance.isAvailable()) return gameInstance;
    }
  }
}
