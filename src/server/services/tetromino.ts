import { ROTATIONS } from '../../shared/constants';
import type {
  Position,
  Rotation,
  TetrominoType,
  ActiveTetromino,
} from '../../shared/types/game.types';
import { getTetrominoShape } from '../../shared/utils/get-tetromino-shape';

export class Tetromino {
  private position: Position = { x: 0, y: 0 };
  private rotation: Rotation = 0;
  private placed = false;

  constructor(private readonly type: TetrominoType) {}

  public rotate(newRotation?: Rotation) {
    if (newRotation) {
      this.rotation = newRotation;
      return;
    }

    const newRotationIndex = ROTATIONS.indexOf(this.rotation) + 1;

    this.rotation = ROTATIONS[newRotationIndex % ROTATIONS.length] as Rotation;
  }

  public setAsPlaced() {
    this.placed = true;
  }

  public checkIfPlaced() {
    return this.placed;
  }

  public getRotation() {
    return this.rotation;
  }

  public getPosition() {
    return this.position;
  }

  public updatePosition(x: number, y: number) {
    this.position.x = x;
    this.position.y = y;
  }

  public getShapeForRotation(rotation: Rotation) {
    return getTetrominoShape(this.type, rotation);
  }

  public getShape() {
    return getTetrominoShape(this.type, this.rotation);
  }

  public getState(): ActiveTetromino {
    return {
      type: this.type,
      shape: this.getShape()!,
      position: this.position,
    };
  }
}
