import React from 'react';

function App() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <div
        style={{
          padding: '2rem 3rem',
          borderRadius: '1rem',
          boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
          background: 'white',
          textAlign: 'center',
        }}
      >
        <h1 style={{ marginBottom: '0.75rem', fontSize: '2rem' }}>test_aws_fe</h1>
        <p style={{ marginBottom: '0.5rem', color: '#555' }}>
          React + Vite + TypeScript starter
        </p>
        <p style={{ fontSize: '0.9rem', color: '#777' }}>
          Edit <code>src/App.tsx</code> and save to see changes.
        </p>
      </div>
    </div>
  );
}

export default App;

