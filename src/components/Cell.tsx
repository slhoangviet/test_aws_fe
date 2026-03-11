import type { CellValue } from '../types/game';

interface CellProps {
  value: CellValue;
  isWin: boolean;
  size: number;
  onClick: () => void;
  disabled: boolean;
}

export default function Cell({ value, isWin, size, onClick, disabled }: CellProps) {
  const fontSize = Math.floor(size * 0.6);

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        flex items-center justify-center
        border border-slate-600
        transition-all duration-150
        ${!disabled && !value ? 'hover:bg-slate-600 cursor-pointer' : 'cursor-default'}
        ${isWin ? 'bg-green-600/50' : 'bg-slate-800'}
        ${value === 'X' ? 'text-blue-400' : 'text-red-400'}
      `}
      style={{
        width: size,
        height: size,
        fontSize,
        fontWeight: 'bold',
      }}
    >
      {value}
    </button>
  );
}
