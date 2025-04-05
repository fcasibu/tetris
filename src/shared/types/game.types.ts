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

export interface ActiveTetromino {
  type: TetrominoType;
  shape: number[][];
  position: Position;
}

export type Gameboard = BlockState[][];

export interface PlayerState {
  id: string;
  board: Gameboard;
  heldTetromino: TetrominoType | null;
  currentTetromino: ActiveTetromino;
  tetrominoQueue: TetrominoType[];
  score: number;
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
