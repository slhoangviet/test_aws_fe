import Cell from './Cell';
import type { CellValue } from '../types/game';

interface BoardProps {
  board: CellValue[][];
  winLine: { x: number; y: number }[] | null;
  onCellClick: (x: number, y: number) => void;
  disabled: boolean;
}

export default function Board({ board, winLine, onCellClick, disabled }: BoardProps) {
  const size = board.length;
  const cellSize = Math.max(24, Math.min(40, Math.floor(600 / size)));

  const isWinCell = (x: number, y: number): boolean => {
    if (!winLine) return false;
    return winLine.some((cell) => cell.x === x && cell.y === y);
  };

  return (
    <div className="flex justify-center overflow-auto p-4">
      <div
        className="grid gap-0 bg-slate-700 p-1 rounded-lg"
        style={{
          gridTemplateColumns: `repeat(${size}, ${cellSize}px)`,
          gridTemplateRows: `repeat(${size}, ${cellSize}px)`,
        }}
      >
        {board.map((row, y) =>
          row.map((cell, x) => (
            <Cell
              key={`${x}-${y}`}
              value={cell}
              isWin={isWinCell(x, y)}
              size={cellSize}
              onClick={() => onCellClick(x, y)}
              disabled={disabled || cell !== null}
            />
          ))
        )}
      </div>
    </div>
  );
}
