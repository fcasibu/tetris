import { GRID_COLS, GRID_ROWS } from '@shared/constants';
import { BlockState, type Gameboard } from '@shared/types/game.types';
import type { Tetromino } from './tetromino';

export class GameboardService {
  private board: Gameboard = Array.from({ length: GRID_ROWS }, () =>
    Array.from({ length: GRID_COLS }, () => BlockState.Empty),
  );
  private previouslyFilledCoordinates: [number, number][] = [];

  public getState(): Gameboard {
    return structuredClone(this.board);
  }

  public update(activeTetromino: Tetromino) {
    const { position, shape } = activeTetromino.getState();

    this.clearPreviouslyFilledCoordinates();

    for (const [x, y] of shape) {
      const currX = position.x + x;
      const currY = position.y + y;

      if (this.checkCollision(currX, currY)) {
        return;
      }

      this.board[currY]![currX] = BlockState.Filled;
      this.previouslyFilledCoordinates.push([currX, currY]);

      activeTetromino.updatePosition(position.x + 1, position.y + 1);
    }
  }

  private checkCollision(x: number, y: number) {
    if (x < 0 || x >= GRID_COLS) return true;

    if (y < 0 || y >= GRID_ROWS) return true;

    const cell = this.board[y]?.[x];

    return cell === BlockState.Filled;
  }

  private clearPreviouslyFilledCoordinates() {
    if (!this.previouslyFilledCoordinates.length) return;

    for (const [x, y] of this.previouslyFilledCoordinates) {
      this.board[x]![y] = BlockState.Empty;
    }

    this.previouslyFilledCoordinates = [];
  }
}
