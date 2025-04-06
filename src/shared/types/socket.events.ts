import { type Socket } from 'socket.io';
import type { GameState } from './game.types';

export interface ClientPayloads {
  joinRoom: {
    // TODO(fcasibu): ok for now
    type: 'solo' | 'multi';
    playerId: string;
  };
  leaveRoom: {
    playerId: string;
    roomId: string;
  };
  startGame: {
    roomId: string;
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

interface SuccessResult<T> {
  success: true;
  payload: T;
}

interface FailureResult {
  success: false;
  reason: string;
}

type Result<T> = SuccessResult<T> | FailureResult;

export interface AckFunctions {
  joinRoom: (result: Result<GameState>) => void;
  leaveRoom: (result: Result<GameState>) => void;
}

export interface ServerPayloads {
  gameStateUpdate: GameState;
  gameWinner: { roomId: string; playerId: string };
  leaveRoom: {
    playerId: string;
  };
}

export type ClientToServerEvents = {
  [K in keyof ClientPayloads]: (
    payload: ClientPayloads[K],
    ack?: K extends keyof AckFunctions ? AckFunctions[K] : never,
  ) => void;
} & {
  connection: (socket: Socket) => void;
};

export type ServerToClientEvents = {
  [K in keyof ServerPayloads]: (payload: ServerPayloads[K]) => void;
} & { connect: () => void };

export type ServerSocket = Socket<ClientToServerEvents, ServerToClientEvents>;

export type ClientSocket = Socket<ServerToClientEvents, ClientToServerEvents>;
