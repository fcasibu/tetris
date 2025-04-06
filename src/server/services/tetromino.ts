import { ROTATIONS } from '@shared/constants';
import {
  TetrominoType,
  type ActiveTetromino,
  type Position,
  type Rotation,
} from '@shared/types/game.types';
import { getTetrominoShape } from '@shared/utils/get-tetromino-shape';

export class Tetromino {
  private position: Position = { x: 0, y: 0 };
  private rotation: Rotation = 0;

  constructor(private readonly type: TetrominoType) {}

  public rotate() {
    const newRotationIndex = ROTATIONS.indexOf(this.rotation) + 1;

    this.rotation = ROTATIONS[newRotationIndex % ROTATIONS.length] as Rotation;
  }

  public updatePosition(x: number, y: number) {
    this.position.x = x;
    this.position.y = y;
  }

  public getShape() {
    return getTetrominoShape(this.type, this.rotation);
  }

  public getState(): ActiveTetromino {
    return {
      type: this.type,
      shape: this.getShape(),
      position: this.position,
    };
  }
}
