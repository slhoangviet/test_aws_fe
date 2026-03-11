import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';

export default function HomePage() {
  const navigate = useNavigate();
  const { isConnected, roomInfo, error, createRoom, joinRoom } = useSocket();

  const [boardSize, setBoardSize] = useState(15);
  const [joinCode, setJoinCode] = useState('');
  const [mode, setMode] = useState<'idle' | 'creating' | 'joining'>('idle');

  useEffect(() => {
    if (roomInfo) {
      navigate(`/game/${roomInfo.roomCode}`);
    }
  }, [roomInfo, navigate]);

  const handleCreate = () => {
    setMode('creating');
    createRoom(boardSize);
  };

  const handleJoin = () => {
    if (!joinCode.trim()) return;
    setMode('joining');
    joinRoom(joinCode.trim());
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-slate-800 rounded-2xl p-8 shadow-xl">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">⭕❌</div>
          <p className="text-slate-400">
            {isConnected ? 'Đã kết nối server' : 'Đang kết nối...'}
          </p>
        </div>

        {error && (
          <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Create Room */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4 text-slate-200">
            Tạo phòng mới
          </h2>
          <div className="flex items-center gap-4 mb-4">
            <label className="text-slate-400">Kích thước:</label>
            <select
              value={boardSize}
              onChange={(e) => setBoardSize(Number(e.target.value))}
              className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={10}>10 x 10</option>
              <option value={15}>15 x 15</option>
              <option value={20}>20 x 20</option>
            </select>
          </div>
          <button
            onClick={handleCreate}
            disabled={!isConnected || mode === 'creating'}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            {mode === 'creating' ? 'Đang tạo...' : 'Tạo phòng'}
          </button>
        </div>

        <div className="relative mb-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-600"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="bg-slate-800 px-4 text-slate-400">hoặc</span>
          </div>
        </div>

        {/* Join Room */}
        <div>
          <h2 className="text-lg font-semibold mb-4 text-slate-200">
            Vào phòng
          </h2>
          <input
            type="text"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            placeholder="Nhập mã phòng (VD: ABC123)"
            maxLength={6}
            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500 mb-4 text-center text-xl tracking-widest"
          />
          <button
            onClick={handleJoin}
            disabled={!isConnected || !joinCode.trim() || mode === 'joining'}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            {mode === 'joining' ? 'Đang vào...' : 'Vào phòng'}
          </button>
        </div>
      </div>
    </div>
  );
}
