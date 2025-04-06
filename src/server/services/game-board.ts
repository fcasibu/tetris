import { GRID_COLS, GRID_ROWS } from '@shared/constants';
import {
  BlockState,
  type Gameboard,
  type PlayerAction,
  type Position,
  type Shape,
} from '@shared/types/game.types';
import type { Tetromino } from './tetromino';

export class GameboardService {
  private board: Gameboard = Array.from({ length: GRID_ROWS }, () =>
    Array.from({ length: GRID_COLS }, () => BlockState.Empty),
  );
  private previouslyFilledCoordinates: [number, number][] = [];

  public getState(): Gameboard {
    return structuredClone(this.board);
  }

  public update(activeTetromino: Tetromino, action: PlayerAction) {
    const { position, shape } = activeTetromino.getState();

    this.clearPreviouslyFilledCoordinates();
    let positionDelta = { x: position.x, y: position.y };
    let currentShape = shape;

    if (action.rotate) {
      currentShape = this.testRotation(activeTetromino);
    }

    if (action.drop) {
      const newY = this.findCollisionPoint(currentShape, position);

      activeTetromino.updatePosition(position.x, newY);
      return;
    }

    if (action.move) {
      const resultOfMoveAction = this.handleMoveAction(action.move);

      positionDelta.x += resultOfMoveAction.x;
      positionDelta.y += resultOfMoveAction.y;
    }

    for (const [x, y] of currentShape) {
      const currX = positionDelta.x + x;
      const currY = positionDelta.y + y;

      if (this.checkCollision(currX, currY)) {
        return;
      }

      this.board[currY]![currX] = BlockState.Filled;
      this.previouslyFilledCoordinates.push([currX, currY]);

      activeTetromino.updatePosition(positionDelta.x, positionDelta.y + 1);
    }
  }

  public isOverflowing() {
    return this.board[0]!.some((cell) => cell === BlockState.Filled);
  }

  private handleMoveAction(move: 'left' | 'down' | 'right'): Position {
    switch (move) {
      case 'left':
        return { x: -1, y: 0 };
      case 'down':
        return { x: 0, y: 1 };
      case 'right':
        return { x: 1, y: 0 };
    }
  }

  private findCollisionPoint(shape: Shape, position: Position): number {
    let yCollisionPoint = 0;

    for (const [x, y] of shape) {
      yCollisionPoint = Math.max(
        yCollisionPoint,
        this.getYCollision(x + position.x, y + position.y),
      );
    }

    return yCollisionPoint;
  }

  private getYCollision(x: number, y: number) {
    let collidedY = y;

    while (!this.checkCollision(x, collidedY)) {
      collidedY += 1;
    }

    return collidedY;
  }

  private testRotation(activeTetromino: Tetromino) {
    const { position } = activeTetromino.getState();

    const rotate = () =>
      activeTetromino.rotate((shape) =>
        shape.some(([x, y]) =>
          this.checkCollision(position.x + x, position.y + y),
        ),
      );

    let canRotate = rotate();

    // TODO(fcasibu): better to have a bound check?
    while (!canRotate) {
      canRotate = rotate();
    }

    return activeTetromino.getShape();
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
