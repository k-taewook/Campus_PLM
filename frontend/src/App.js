import React, { useEffect, useState } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Dashboard from './components/Dashboard';

const App = () => {
  const [hello, setHello] = useState('');

  useEffect(() => {
    fetch('/api/hello')
      .then((res) => res.text())
      .then(setHello)
      .catch(() => setHello('서버 연결 실패'));
  }, []);

  return (
    <div>
      <nav style={{ padding: '8px 0' }}>
        <Link to="/">대시보드</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Dashboard />} />
      </Routes>
      <div style={{ marginTop: 16, color: '#666' }}>API 응답: {hello}</div>
    </div>
  );
};

export default App;
