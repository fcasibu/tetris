import {
  type PlayerAction,
  TetrominoType,
  type PlayerState,
} from '@shared/types/game.types';
import type { GameboardService } from './game-board';
import { Tetromino } from './tetromino';
import assert from 'node:assert';

const TYPES = [
  TetrominoType.I,
  TetrominoType.J,
  TetrominoType.L,
  TetrominoType.O,
  TetrominoType.S,
  TetrominoType.T,
  TetrominoType.Z,
] as const;

export class PlayerService {
  private heldTetromino: TetrominoType | null = null;
  private currentTetromino: Tetromino | null = null;
  private tetrominoQueue: TetrominoType[] = this.generateInitialTetrominos();
  private isGameOver = false;

  private maxQueueSize = 5;

  constructor(
    private readonly id: string,
    private readonly board: GameboardService,
  ) {}

  public getState(): PlayerState {
    return {
      id: this.id,
      board: this.board.getState(),
      heldTetromino: this.heldTetromino,
      currentTetromino: this.currentTetromino?.getState() ?? null,
      tetrominoQueue: this.tetrominoQueue,
      isGameOver: this.isGameOver,
    };
  }

  // TODO(fcasibu): player input
  public update(action: PlayerAction) {
    if (action.hold) {
      this.holdTetromino();
    }

    const tetromino = this.getCurrentTetromino();

    this.board.update(tetromino, action);

    if (this.board.isOverflowing()) {
      this.isGameOver = true;
    }
  }

  private getCurrentTetromino(): Tetromino {
    if (!this.currentTetromino) {
      const type = this.tetrominoQueue.shift();
      assert(type);

      this.currentTetromino = new Tetromino(type);

      const newTetromino = TYPES[Math.floor(Math.random() * TYPES.length)];
      assert(newTetromino);

      this.tetrominoQueue.push(newTetromino);
    }

    return this.currentTetromino;
  }

  private holdTetromino() {
    if (!this.currentTetromino) return;

    this.heldTetromino = this.currentTetromino.getState().type;
    this.currentTetromino = null;
  }

  private generateInitialTetrominos() {
    const types: TetrominoType[] = [];

    while (types.length < this.maxQueueSize) {
      const tetromino = TYPES[Math.floor(Math.random() * TYPES.length)];

      if (tetromino) {
        types.push(tetromino);
      }
    }

    return types;
  }
}
