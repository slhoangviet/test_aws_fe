import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import GamePage from './pages/GamePage';

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-slate-800 py-4 px-6 shadow-lg">
        <h1 className="text-2xl font-bold text-center text-white">
          Caro Game
        </h1>
      </header>
      <main className="flex-1 flex items-center justify-center p-4">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/game/:roomCode" element={<GamePage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
