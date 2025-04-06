export interface Position {
  x: number;
  y: number;
}

export enum TetrominoType {
  I,
  O,
  T,
  S,
  Z,
  J,
  L,
}

export enum BlockState {
  Empty,
  Filled,
}

export type Rotation = 0 | 90 | 180 | 270;

export type Shape = [number, number][];

export interface ActiveTetromino {
  type: TetrominoType;
  shape: Shape;
  position: Position;
}

export type Gameboard = BlockState[][];

export interface PlayerState {
  id: string;
  board: Gameboard;
  heldTetromino: TetrominoType | null;
  currentTetromino: ActiveTetromino | null;
  tetrominoQueue: TetrominoType[];
  isGameOver: boolean;
}

export enum GameStatus {
  Lobby,
  Playing,
  Finished,
}

export interface GameState {
  id: string;
  players: Record<string, PlayerState>;
  status: GameStatus;
}

export interface PlayerAction {
  drop?: boolean;
  rotate?: boolean;
  move?: 'left' | 'down' | 'right';
  hold?: boolean;
}
