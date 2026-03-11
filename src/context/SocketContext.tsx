import { createContext, useContext, useEffect, useRef, useState, useCallback, type ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import type { CellValue, GameState, RoomInfo } from '../types/game';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';

interface SocketContextType {
  isConnected: boolean;
  roomInfo: RoomInfo | null;
  gameState: GameState | null;
  error: string | null;
  createRoom: (boardSize: number) => void;
  joinRoom: (roomCode: string) => void;
  makeMove: (x: number, y: number) => void;
  leaveRoom: () => void;
  restartGame: () => void;
  clearError: () => void;
}

const SocketContext = createContext<SocketContextType | null>(null);

export function SocketProvider({ children }: { children: ReactNode }) {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [roomInfo, setRoomInfo] = useState<RoomInfo | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
      setIsConnected(true);
      setError(null);
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    socket.on('error', (data: { message: string }) => {
      setError(data.message);
    });

    socket.on('room_created', (data: { roomCode: string; boardSize: number; symbol: 'X' | 'O' }) => {
      console.log('Room created:', data);
      setRoomInfo({
        roomCode: data.roomCode,
        boardSize: data.boardSize,
        symbol: data.symbol,
        playerCount: 1,
      });
      setError(null);
    });

    socket.on('player_joined', (data: { playerId: string; symbol: 'X' | 'O'; playerCount: number; roomCode: string; boardSize: number }) => {
      console.log('Player joined:', data);
      setRoomInfo((prev) => {
        if (prev) {
          return { ...prev, playerCount: data.playerCount };
        }
        // Joiner receives their own join event before callback - set roomInfo from event
        if (data.playerId === socket.id) {
          return {
            roomCode: data.roomCode,
            boardSize: data.boardSize,
            symbol: data.symbol,
            playerCount: data.playerCount,
          };
        }
        return null;
      });
    });

    socket.on('game_start', (data: { board: CellValue[][]; boardSize: number; currentTurn: 'X' | 'O'; roomCode: string; players: Record<string, 'X' | 'O'> }) => {
      console.log('Game start:', data, 'my socket id:', socket.id);
      const mySymbol = socket.id ? data.players[socket.id] : undefined;
      console.log('My symbol:', mySymbol);
      
      setGameState({
        board: data.board,
        boardSize: data.boardSize,
        currentTurn: data.currentTurn,
        winner: null,
        winLine: null,
      });
      
      if (mySymbol) {
        setRoomInfo({
          roomCode: data.roomCode,
          boardSize: data.boardSize,
          symbol: mySymbol,
          playerCount: 2,
        });
      } else {
        // Fallback: giữ roomInfo cũ, chỉ update playerCount
        setRoomInfo((prev) => prev ? { ...prev, playerCount: 2 } : prev);
      }
      setError(null);
    });

    socket.on('move_made', (data: { x: number; y: number; symbol: 'X' | 'O'; board: CellValue[][]; currentTurn?: 'X' | 'O' }) => {
      setGameState((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          board: data.board,
          currentTurn: data.currentTurn ?? prev.currentTurn,
        };
      });
    });

    socket.on('game_over', (data: { winner: 'X' | 'O' | 'draw'; line: { x: number; y: number }[] | null }) => {
      console.log('Game over:', data);
      setGameState((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          winner: data.winner,
          winLine: data.line,
        };
      });
    });

    socket.on('player_left', () => {
      console.log('Player left');
      setRoomInfo((prev) => prev ? { ...prev, playerCount: prev.playerCount - 1 } : null);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const createRoom = useCallback((boardSize: number) => {
    console.log('Creating room with size:', boardSize);
    socketRef.current?.emit('create_room', { boardSize });
  }, []);

  const joinRoom = useCallback((roomCode: string) => {
    console.log('Joining room:', roomCode);
    socketRef.current?.emit('join_room', { roomCode }, (response: { success?: boolean; symbol?: 'X' | 'O'; boardSize?: number; error?: string }) => {
      console.log('Join response:', response);
      if (response.error) {
        setError(response.error);
      } else if (response.success && response.symbol && response.boardSize) {
        const symbol = response.symbol;
        const boardSize = response.boardSize;
        // Chỉ set roomInfo nếu chưa được set bởi game_start
        setRoomInfo((prev) => {
          if (prev && prev.playerCount === 2) {
            // game_start đã chạy, không ghi đè
            return prev;
          }
          return {
            roomCode: roomCode.toUpperCase(),
            boardSize,
            symbol,
            playerCount: prev?.playerCount ?? 1,
          };
        });
        setError(null);
      }
    });
  }, []);

  const makeMove = useCallback((x: number, y: number) => {
    socketRef.current?.emit('make_move', { x, y }, (response: { error?: string }) => {
      if (response.error) {
        setError(response.error);
      }
    });
  }, []);

  const leaveRoom = useCallback(() => {
    socketRef.current?.emit('leave_room');
    setRoomInfo(null);
    setGameState(null);
  }, []);

  const restartGame = useCallback(() => {
    socketRef.current?.emit('restart_game');
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return (
    <SocketContext.Provider
      value={{
        isConnected,
        roomInfo,
        gameState,
        error,
        createRoom,
        joinRoom,
        makeMove,
        leaveRoom,
        restartGame,
        clearError,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}
