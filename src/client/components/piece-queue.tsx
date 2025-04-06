import { TetrominoType, type Shape } from '../../shared/types/game.types';
import { TETROMINO_COLORS } from '../../shared/constants';
import { getTetrominoShape } from '../../shared/utils/get-tetromino-shape';

export function PieceQueue({ queue }: { queue: TetrominoType[] }) {
  return (
    <div className="flex flex-col gap-2 w-16">
      {queue.map((type, index) => {
        const shape: Shape = getTetrominoShape(type, 0);
        const color = TETROMINO_COLORS[type];
        const minX = Math.min(...shape.map(([x]) => x));
        const minY = Math.min(...shape.map(([, y]) => y));

        return (
          <div key={index} className="relative aspect-square w-full max-w-16">
            {shape.map(([x, y], i) => (
              <div
                key={i}
                className="absolute border border-gray-800"
                style={{
                  left: `${(x - minX) * 33.33}%`,
                  top: `${(y - minY) * 33.33}%`,
                  width: '33.33%',
                  height: '33.33%',
                  backgroundColor: color,
                }}
              />
            ))}
          </div>
        );
      })}
    </div>
  );
}
