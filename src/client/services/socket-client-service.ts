import type { GameState } from '@shared/types/game.types';
import type { ClientSocket } from '@shared/types/socket.events';
import { io } from 'socket.io-client';

export class SocketClientService {
  private static instance: SocketClientService | undefined;
  private io: ClientSocket;
  private rooms = new Map<string, string>();

  private constructor() {
    this.io = io('http://localhost:8080') as unknown as ClientSocket;
  }

  public static getInstance() {
    if (!this.instance) {
      this.instance = new SocketClientService();
    }

    return this.instance;
  }

  public isConnected() {
    return this.io.connected;
  }

  public getSelfId() {
    return this.io.id;
  }

  public getRoomIdOfSelf() {
    return this.rooms.get(this.getSelfId());
  }

  public initializeConnectListener(callback: () => void) {
    const event = 'connect';
    this.io.on(event, callback);

    return () => this.io.removeAllListeners(event);
  }

  public initializeGameInstanceUpdateListener(
    callback: (data: GameState) => void,
  ) {
    const event = 'gameStateUpdate';
    this.io.on(event, callback);

    return () => this.io.removeAllListeners(event);
  }

  public joinRoom(playerId: string, onJoin: (gameState: GameState) => void) {
    this.io.emit('joinRoom', { playerId }, (result) => {
      if (result.success) {
        onJoin(result.payload);
        this.rooms.set(playerId, result.payload.id);
      }
    });
  }

  public leaveRoom(roomId: string, playerId: string) {
    this.io.emit('leaveRoom', { roomId, playerId });
    this.rooms.delete(playerId);
  }

  public startGame(roomId: string) {
    this.io.emit('startGame', { roomId });
  }
}
