import type { Socket } from 'socket.io';
import type { GameState } from './game.types';

export interface ClientPayloads {
  joinRoom: {
    playerId: string;
    roomId: string;
  };
  leaveRoom: {
    playerId: string;
    roomId: string;
  };
  createRoom: {
    hostId: string;
  };
  rotateTetromino: {
    playerId: string;
  };
  swapTetromino: {
    playerId: string;
  };
  moveTetromino: {
    playerId: string;
    position: 'left' | 'down' | 'right';
  };
  dropTetromino: {
    playerId: string;
  };
}

export interface ServerPayloads {
  gameState: GameState;
  listAvailableRooms: string[];
}

export type ClientToServerEvents = {
  [K in keyof ClientPayloads]: (payload: ClientPayloads[K]) => void;
};

export type ServerToClientEvents = {
  [K in keyof ServerPayloads]: (payload: ServerPayloads[K]) => void;
};

export type ServerSocket = Socket<ClientToServerEvents, ServerToClientEvents>;

export type ClientSocket = Socket<ServerToClientEvents, ClientToServerEvents>;
