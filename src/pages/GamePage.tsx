import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import Board from '../components/Board';
import WinnerModal from '../components/WinnerModal';

export default function GamePage() {
  const { roomCode } = useParams<{ roomCode: string }>();
  const navigate = useNavigate();
  const {
    isConnected,
    roomInfo,
    gameState,
    error,
    joinRoom,
    makeMove,
    leaveRoom,
    restartGame,
  } = useSocket();

  useEffect(() => {
    if (isConnected && roomCode && !roomInfo) {
      joinRoom(roomCode);
    }
  }, [isConnected, roomCode, roomInfo, joinRoom]);

  const handleLeave = () => {
    leaveRoom();
    navigate('/');
  };

  const handleCellClick = (x: number, y: number) => {
    if (!gameState || gameState.winner) return;
    if (gameState.currentTurn !== roomInfo?.symbol) return;
    if (gameState.board[y][x] !== null) return;
    makeMove(x, y);
  };

  const isMyTurn = gameState?.currentTurn === roomInfo?.symbol;
  const waiting = roomInfo && (!gameState || roomInfo.playerCount < 2);

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Room Info Bar */}
      <div className="bg-slate-800 rounded-xl p-4 mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-slate-700 px-4 py-2 rounded-lg">
            <span className="text-slate-400 text-sm">Phòng:</span>{' '}
            <span className="text-white font-mono font-bold text-lg">
              {roomCode}
            </span>
          </div>
          {roomInfo && (
            <div className="bg-slate-700 px-4 py-2 rounded-lg">
              <span className="text-slate-400 text-sm">Bạn là:</span>{' '}
              <span
                className={`font-bold text-lg ${
                  roomInfo.symbol === 'X' ? 'text-blue-400' : 'text-red-400'
                }`}
              >
                {roomInfo.symbol}
              </span>
            </div>
          )}
        </div>
        <button
          onClick={handleLeave}
          className="bg-slate-700 hover:bg-slate-600 text-slate-300 px-4 py-2 rounded-lg transition-colors"
        >
          Rời phòng
        </button>
      </div>

      {error && (
        <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Waiting State */}
      {waiting && (
        <div className="bg-slate-800 rounded-xl p-12 text-center">
          <div className="animate-pulse text-6xl mb-6">⏳</div>
          <h2 className="text-2xl font-semibold mb-2">Đang chờ đối thủ...</h2>
          <p className="text-slate-400 mb-6">
            Chia sẻ mã phòng <span className="font-mono font-bold text-white">{roomCode}</span> cho bạn bè
          </p>
          <button
            onClick={() => navigator.clipboard.writeText(roomCode || '')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Copy mã phòng
          </button>
        </div>
      )}

      {/* Game Board */}
      {gameState && !waiting && (
        <>
          <div className="text-center mb-4">
            {!gameState.winner && (
              <div
                className={`inline-block px-6 py-2 rounded-full text-lg font-semibold ${
                  isMyTurn
                    ? 'bg-green-600 text-white'
                    : 'bg-slate-700 text-slate-300'
                }`}
              >
                {isMyTurn ? 'Lượt của bạn!' : 'Chờ đối thủ...'}
              </div>
            )}
          </div>

          <Board
            board={gameState.board}
            winLine={gameState.winLine}
            onCellClick={handleCellClick}
            disabled={!isMyTurn || !!gameState.winner}
          />

          {gameState.winner && (
            <WinnerModal
              winner={gameState.winner}
              mySymbol={roomInfo?.symbol || 'X'}
              onRestart={restartGame}
              onLeave={handleLeave}
            />
          )}
        </>
      )}
    </div>
  );
}
