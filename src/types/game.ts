export type CellValue = 'X' | 'O' | null;

export interface Move {
  x: number;
  y: number;
  symbol: 'X' | 'O';
  timestamp: number;
}

export interface GameState {
  board: CellValue[][];
  boardSize: number;
  currentTurn: 'X' | 'O';
  winner: 'X' | 'O' | 'draw' | null;
  winLine: { x: number; y: number }[] | null;
}

export interface RoomInfo {
  roomCode: string;
  boardSize: number;
  symbol: 'X' | 'O';
  playerCount: number;
}
