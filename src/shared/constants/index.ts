import { TetrominoType } from '@shared/types/game.types';

export const ROTATIONS = [0, 90, 180, 270] as const;
export const GRID_ROWS = 20;
export const GRID_COLS = 10;

export const TETROMINO_COLORS: Record<TetrominoType, string> = {
  [TetrominoType.I]: '#00FFFF',
  [TetrominoType.O]: '#FFFF00',
  [TetrominoType.T]: '#800080',
  [TetrominoType.S]: '#00FF00',
  [TetrominoType.Z]: '#FF0000',
  [TetrominoType.J]: '#0000FF',
  [TetrominoType.L]: '#FFA500',
};

export const GHOST_COLOR = 'rgba(255, 255, 255, 0.3)';
export const FILLED_CELL_COLOR = '#888888';
export const GRID_COLOR = '#333333';
export const BACKGROUND_COLOR = '#1a1a1a';
export const GAME_OVER_OVERLAY_COLOR = 'rgba(0, 0, 0, 0.75)';
export const GAME_OVER_TEXT_COLOR = '#FFFFFF';
