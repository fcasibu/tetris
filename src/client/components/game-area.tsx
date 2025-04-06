import React, { useRef, useEffect } from 'react';
import {
  BACKGROUND_COLOR,
  GRID_COLOR,
  FILLED_CELL_COLOR,
  TETROMINO_COLORS,
  GAME_OVER_OVERLAY_COLOR,
  GAME_OVER_TEXT_COLOR,
  GHOST_COLOR,
} from '../../shared/constants';
import {
  type PlayerState,
  type Position,
  type Shape,
  BlockState,
} from '../../shared/types/game.types';

const DEFAULT_CELL_SIZE = 30;
const BOARD_PADDING = 1;

const drawBlock = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  color: string,
  cellSize: number,
) => {
  ctx.fillStyle = color;
  ctx.fillRect(
    x * cellSize + BOARD_PADDING,
    y * cellSize + BOARD_PADDING,
    cellSize - BOARD_PADDING * 2,
    cellSize - BOARD_PADDING * 2,
  );
};

const isValidPosition = (
  shape: Shape,
  position: Position,
  board: BlockState[][],
  numRows: number,
  numCols: number,
): boolean => {
  for (const [dx, dy] of shape) {
    const checkX = position.x + dx;
    const checkY = position.y + dy;

    if (checkX < 0 || checkX >= numCols || checkY < 0 || checkY >= numRows) {
      return false;
    }

    if (board[checkY]?.[checkX] === BlockState.Filled) {
      return false;
    }
  }
  return true;
};

export const GameArea = React.memo(
  ({
    playerState,
    width,
    height,
    cellSize = DEFAULT_CELL_SIZE,
    showGrid = false,
  }: {
    playerState: PlayerState;
    width: number;
    height: number;
    cellSize?: number;
    showGrid?: boolean;
  }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');

      if (!ctx || !canvas) {
        console.error('Could not get canvas context');
        return;
      }

      const { board, currentTetromino, isGameOver } = playerState;
      const numRows = board.length;
      const numCols = board[0]?.length || 0;

      ctx.fillStyle = BACKGROUND_COLOR;
      ctx.fillRect(0, 0, width, height);

      if (showGrid && numRows > 0 && numCols > 0) {
        ctx.strokeStyle = GRID_COLOR;
        ctx.lineWidth = 1;

        for (let x = 0; x <= numCols; x++) {
          ctx.beginPath();
          ctx.moveTo(x * cellSize + BOARD_PADDING / 2, 0);
          ctx.lineTo(x * cellSize + BOARD_PADDING / 2, numRows * cellSize);
          ctx.stroke();
        }

        for (let y = 0; y <= numRows; y++) {
          ctx.beginPath();
          ctx.moveTo(0, y * cellSize + BOARD_PADDING / 2);
          ctx.lineTo(numCols * cellSize, y * cellSize + BOARD_PADDING / 2);
          ctx.stroke();
        }
      }

      if (numRows > 0 && numCols > 0) {
        for (let y = 0; y < numRows; y++) {
          for (let x = 0; x < numCols; x++) {
            if (board[y]?.[x] === BlockState.Filled) {
              drawBlock(ctx, x, y, FILLED_CELL_COLOR, cellSize);
            }
          }
        }
      }

      let ghostY = currentTetromino?.position.y ?? 0;
      if (currentTetromino && numRows > 0 && numCols > 0) {
        const { shape, position } = currentTetromino;
        let potentialY = position.y;
        while (
          isValidPosition(
            shape,
            { x: position.x, y: potentialY + 1 },
            board,
            numRows,
            numCols,
          )
        ) {
          potentialY++;
        }
        ghostY = potentialY;

        if (ghostY > position.y) {
          for (const [dx, dy] of shape) {
            const boardX = position.x + dx;
            const boardY = ghostY + dy;

            if (
              boardX >= 0 &&
              boardX < numCols &&
              boardY >= 0 &&
              boardY < numRows
            ) {
              if (board[boardY]?.[boardX] !== BlockState.Filled) {
                drawBlock(ctx, boardX, boardY, GHOST_COLOR, cellSize);
              }
            }
          }
        }
      }

      if (currentTetromino) {
        const { type, shape, position } = currentTetromino;
        const color = TETROMINO_COLORS[type];

        for (const [dx, dy] of shape) {
          const boardX = position.x + dx;
          const boardY = position.y + dy;

          if (
            boardX >= 0 &&
            boardX < numCols &&
            boardY >= 0 &&
            boardY < numRows
          ) {
            drawBlock(ctx, boardX, boardY, color!, cellSize);
          }
        }
      }

      if (isGameOver) {
        ctx.fillStyle = GAME_OVER_OVERLAY_COLOR;
        ctx.fillRect(0, 0, width, height);

        ctx.fillStyle = GAME_OVER_TEXT_COLOR;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Game Over', width / 2, height / 2);
      }
    }, [playerState, width, height, cellSize, showGrid]);

    return (
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={{ display: 'block' }}
      />
    );
  },
);

GameArea.displayName = 'GameArea';
