import {
  TetrominoType,
  type PlayerState,
  type PlayerAction,
} from '../../shared/types/game.types';
import type { GameboardService } from './game-board';
import { Tetromino } from './tetromino';
import { strict as assert } from 'node:assert';

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
  private tetrominoQueue: TetrominoType[];
  private isGameOver = false;
  private canSwap = false;

  private maxQueueSize = 5;

  constructor(
    private readonly id: string,
    private readonly board: GameboardService,
  ) {
    this.tetrominoQueue = this.generateInitialTetrominos();
  }

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
  public update(dt: number, action: PlayerAction) {
    if (action.hold) {
      this.handleSwapping();
    }

    const tetromino = this.getCurrentTetromino();

    this.board.update(dt, tetromino, action);
    if (tetromino.checkIfPlaced()) {
      this.canSwap = true;
    }

    if (this.board.isOverflowing()) {
      this.isGameOver = true;
    }
  }

  private handleSwapping() {
    if (this.canSwap) {
      this.canSwap = false;

      if (!this.heldTetromino) {
        assert(this.currentTetromino);

        this.heldTetromino = this.currentTetromino.getState().type;
        this.currentTetromino = null;
      } else {
        assert(this.currentTetromino);

        const temp = this.currentTetromino;
        this.currentTetromino = new Tetromino(this.heldTetromino);
        this.heldTetromino = temp.getState().type;
      }
    }
  }

  // TODO(fcasibu): Improve piece generation
  // THE 7 BAG?!?
  private getCurrentTetromino(): Tetromino {
    if (!this.currentTetromino) {
      const type = this.tetrominoQueue.shift();
      assert(typeof type !== 'undefined');

      this.currentTetromino = new Tetromino(type);

      const newTetromino = TYPES[Math.floor(Math.random() * TYPES.length)];
      assert(typeof newTetromino !== 'undefined');

      this.tetrominoQueue.push(newTetromino);
    }

    const currentTetromino = this.currentTetromino;
    if (currentTetromino.checkIfPlaced()) {
      this.currentTetromino = null;
      return this.getCurrentTetromino();
    }

    return this.currentTetromino;
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
