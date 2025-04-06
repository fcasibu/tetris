import { GRID_COLS, GRID_ROWS, ROTATIONS } from '../../shared/constants';
import {
  type Gameboard,
  BlockState,
  type PlayerAction,
  type Position,
  type Shape,
} from '../../shared/types/game.types';
import type { Tetromino } from './tetromino';

export class GameboardService {
  private board: Gameboard = Array.from({ length: GRID_ROWS }, () =>
    Array.from({ length: GRID_COLS }, () => BlockState.Empty),
  );

  private maxTicks = 1;
  private currentTick = 0;

  public getState(): Gameboard {
    return this.board;
  }

  // TODO(fcasibu): improve soft drop fall speed
  public update(dt: number, activeTetromino: Tetromino, action: PlayerAction) {
    const { position: currentPosition, shape: originalShape } =
      activeTetromino.getState();
    let positionDelta = currentPosition;
    let currentShape = originalShape;

    if (action.rotate) {
      currentShape = this.testRotation(activeTetromino);
    }

    if (action.move) {
      const moveDelta = this.handleMoveAction(action.move);
      const nextPosition = {
        x: positionDelta.x + moveDelta.x,
        y: positionDelta.y + moveDelta.y,
      };

      if (this.isValidPosition(currentShape, nextPosition)) {
        positionDelta = nextPosition;
      }
    }

    if (action.drop) {
      positionDelta.y = this.findCollisionPoint(currentShape, positionDelta);

      this.placePiece(currentShape, positionDelta);
      activeTetromino.updatePosition(positionDelta.x, positionDelta.y);
      activeTetromino.setAsPlaced();
      this.processLineClears();
      return;
    }

    this.currentTick += dt;
    let applyGravity = this.currentTick >= this.maxTicks;
    let softDrop = action.move === 'down';
    let collidedVertically = false;

    if (applyGravity || softDrop) {
      if (applyGravity) this.currentTick = 0;

      const potentialPosition = { x: positionDelta.x, y: positionDelta.y + 1 };
      if (this.isValidPosition(currentShape, potentialPosition)) {
        positionDelta = potentialPosition;
      } else {
        if (applyGravity) {
          collidedVertically = true;
        }
      }
    }

    activeTetromino.updatePosition(positionDelta.x, positionDelta.y);

    if (collidedVertically) {
      this.placePiece(currentShape, positionDelta);
      activeTetromino.setAsPlaced();
      this.processLineClears();
    }
  }

  public isOverflowing(): boolean {
    return Boolean(this.board[0]?.some((cell) => cell === BlockState.Filled));
  }

  private findCollisionPoint(shape: Shape, position: Position) {
    let finalY = position.y;

    while (
      this.isValidPosition(shape, {
        x: position.x,
        y: finalY + 1,
      })
    ) {
      finalY++;
    }

    return finalY;
  }

  private placePiece(shape: Shape, position: Position) {
    for (const [x, y] of shape) {
      const boardX = position.x + x;
      const boardY = position.y + y;
      if (this.isWithinBounds({ x: boardX, y: boardY })) {
        if (this.board[boardY]?.[boardX] === BlockState.Empty) {
          this.board[boardY]![boardX] = BlockState.Filled;
        }
      }
    }
  }

  private isWithinBounds(position: Position) {
    return (
      position.x >= 0 &&
      position.x < GRID_COLS &&
      position.y >= 0 &&
      position.y < GRID_ROWS
    );
  }

  private processLineClears() {
    for (let row = GRID_ROWS - 1; row >= 0; ) {
      const isRowFilled = this.board[row]?.every(
        (cell) => cell === BlockState.Filled,
      );

      if (isRowFilled) {
        this.board.splice(row, 1);
        this.board.unshift(
          Array.from({ length: GRID_COLS }, () => BlockState.Empty),
        );
      } else {
        row--;
      }
    }
  }

  private handleMoveAction(move: 'left' | 'down' | 'right'): {
    x: number;
    y: number;
  } {
    switch (move) {
      case 'left':
        return { x: -1, y: 0 };
      case 'down':
        return { x: 0, y: 1 };
      case 'right':
        return { x: 1, y: 0 };
    }
  }

  private checkCollision(position: Position): boolean {
    if (position.x < 0 || position.x >= GRID_COLS || position.y >= GRID_ROWS) {
      return true;
    }
    if (position.y < 0) {
      return false;
    }
    return this.board[position.y]?.[position.x] === BlockState.Filled;
  }

  private isValidPosition(shape: Shape, position: Position): boolean {
    for (const [x, y] of shape) {
      const checkX = position.x + x;
      const checkY = position.y + y;

      if (this.checkCollision({ x: checkX, y: checkY })) {
        return false;
      }
    }
    return true;
  }

  private testRotation(activeTetromino: Tetromino) {
    const originalRotation = activeTetromino.getRotation();
    const originalPosition = activeTetromino.getPosition();

    const nextRotation =
      ROTATIONS[(ROTATIONS.indexOf(originalRotation) + 1) % ROTATIONS.length]!;

    const nextShape = activeTetromino.getShapeForRotation(nextRotation);

    const kickOffsets = [0, -1, 1, -2, 2];

    for (const offsetX of kickOffsets) {
      const hasCollision = nextShape.some(([x, y]) =>
        this.checkCollision({
          x: originalPosition.x + x + offsetX,
          y: originalPosition.y + y,
        }),
      );

      if (!hasCollision) {
        activeTetromino.rotate(nextRotation);
        activeTetromino.updatePosition(
          originalPosition.x + offsetX,
          originalPosition.y,
        );
        return nextShape.map(([x, y]) => [x + offsetX, y]) as Shape;
      }
    }

    activeTetromino.rotate(originalRotation);
    activeTetromino.updatePosition(originalPosition.x, originalPosition.y);
    return activeTetromino.getShapeForRotation(originalRotation);
  }
}
