import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Card = ({ title, value }) => (
  <div style={{ border: '1px solid #eee', borderRadius: 8, padding: 16, minWidth: 160 }}>
    <div style={{ color: '#666', marginBottom: 8 }}>{title}</div>
    <div style={{ fontSize: 24, fontWeight: 700 }}>{value}</div>
  </div>
);

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    axios.get('/api/dashboard/summary').then((r) => setSummary(r.data));
    axios.get('/api/dashboard/projects').then((r) => setProjects(r.data.items));
  }, []);

  return (
    <div style={{ padding: 16 }}>
      <h1 style={{ marginBottom: 16 }}>대시보드</h1>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 24 }}>
        <Card title="총 프로젝트" value={summary?.totalProjects ?? '-'} />
        <Card title="진행 중" value={summary?.inProgress ?? '-'} />
        <Card title="할당된 태스크" value={summary?.assignedTasks ?? '-'} />
        <Card title="완료된 태스크" value={summary?.completedTasks ?? '-'} />
        <Card title="지연된 태스크" value={summary?.delayedTasks ?? '-'} />
        <Card title="임박한 마감일" value={summary?.upcomingDeadlines ?? '-'} />
      </div>

      <h2 style={{ marginBottom: 8 }}>내 프로젝트</h2>
      <div style={{ display: 'grid', gap: 12 }}>
        {projects.map((p) => (
          <div key={p.id} style={{ border: '1px solid #eee', borderRadius: 8, padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div style={{ fontWeight: 700 }}>{p.name}</div>
              <div style={{ color: '#10b981' }}>{p.status}</div>
            </div>
            <div style={{ color: '#666', margin: '6px 0 12px' }}>리드: {p.lead} · 팀: {p.team} · 마감: {p.dueDate}</div>
            <div style={{ height: 6, background: '#f3f4f6', borderRadius: 999 }}>
              <div style={{ width: `${p.progressPercent}%`, height: '100%', background: '#111827', borderRadius: 999 }} />
            </div>
          </div>
        ))}
        {projects.length === 0 && <div>프로젝트가 없습니다.</div>}
      </div>
    </div>
  );
}

export default Dashboard;


