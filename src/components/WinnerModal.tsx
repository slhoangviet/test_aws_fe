interface WinnerModalProps {
  winner: 'X' | 'O' | 'draw';
  mySymbol: 'X' | 'O';
  onRestart: () => void;
  onLeave: () => void;
}

export default function WinnerModal({ winner, mySymbol, onRestart, onLeave }: WinnerModalProps) {
  const isDraw = winner === 'draw';
  const isWinner = winner === mySymbol;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-2xl p-8 max-w-sm w-full mx-4 text-center shadow-2xl">
        <div className="text-6xl mb-4">
          {isDraw ? '🤝' : isWinner ? '🎉' : '😢'}
        </div>
        <h2 className="text-2xl font-bold mb-2">
          {isDraw ? 'Hòa!' : isWinner ? 'Bạn thắng!' : 'Bạn thua!'}
        </h2>
        <p className="text-slate-400 mb-6">
          {isDraw
            ? 'Trận đấu kết thúc hòa'
            : isWinner
            ? 'Chúc mừng! Bạn đã chiến thắng!'
            : 'Đối thủ đã chiến thắng'}
        </p>
        <div className="flex gap-4">
          <button
            onClick={onRestart}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Chơi lại
          </button>
          <button
            onClick={onLeave}
            className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Rời phòng
          </button>
        </div>
      </div>
    </div>
  );
}
