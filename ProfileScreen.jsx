import React, { useState, useEffect } from 'react';
import { getCurrentUser, getActiveProject, getTasksForUser, generateInitials, calculateStreak, getData } from './store.js';

export default function ProfileScreen({ onNavigate, role, dv }) {
  const [show, setShow] = useState(false);
  useEffect(() => { setTimeout(() => setShow(true), 50); }, []);
  const user = getCurrentUser();const proj = getActiveProject();
  const initials = user ? generateInitials(user.name) : '??';
  const streak = calculateStreak() || user?.streak || 0;
  const completedCount = getData()?.completedTasks?.length || 0;
  const achievCount = user?.unlockedAchievements?.length || 0;
  const myTasks = proj ? getTasksForUser(proj.id, user?.name).filter(t => t.status !== 'Done') : [];

  const tagStyle = (pri) => {
    if (pri === 'Urgent') return { pr: '#E24B4A', border: '#E24B4A', due: '#E24B4A' };
    if (pri === 'High') return { pr: '#E24B4A', border: '#BA7517', due: '#BA7517' };
    if (pri === 'Medium') return { pr: '#BA7517', border: '#534AB7', due: '#1D9E75' };
    return { pr: '#6B6B80', border: '#534AB7', due: '#1D9E75' };
  };

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px' }}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#534AB7', color: 'white', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 600, transform: show ? 'translateY(0) scale(1)' : 'translateY(-40px) scale(0.8)', opacity: show ? 1 : 0, transition: 'all 0.6s cubic-bezier(0.34,1.56,0.64,1)' }}>{initials}</div>
        <h1 style={{ fontSize: 24, fontWeight: 600, marginTop: 16, opacity: show ? 1 : 0, transform: show ? 'translateY(0)' : 'translateY(10px)', transition: 'all 0.3s ease 0.2s' }}>{user?.name || 'User'} <span style={{ fontSize: 14, color: 'var(--text-muted)', cursor: 'pointer' }}>✏️</span></h1>
        <div style={{ fontSize: 14, color: 'var(--text-muted)', opacity: show ? 1 : 0, transition: 'all 0.3s ease 0.25s' }}>{user?.roleTitle || 'Team Member'}</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4, opacity: show ? 1 : 0, transition: 'all 0.3s ease 0.3s' }}>{proj?.name || 'No Project'} <span style={{ color: 'var(--primary)' }}>·</span> {proj?.sprintName || ''}</div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 8, fontSize: 13, color: 'var(--success)', fontWeight: 500, opacity: show ? 1 : 0, transition: 'all 0.2s ease 0.35s' }}><span className="pulse-dot" /> Active</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 32 }}>
        {[{ val: String(completedCount), label: 'Total completed' }, { val: String(streak), label: 'Day streak 🔥' }, { val: String(achievCount), label: 'Unlocked', color: '#F5A623' }].map((s, i) => (
          <div key={i} className="card-inner" style={{ textAlign: 'center', opacity: show ? 1 : 0, transform: show ? 'translateY(0)' : 'translateY(16px)', transition: `all 0.3s ease ${0.45 + i * 0.1}s` }}>
            <div style={{ fontSize: 26, fontWeight: 600, color: s.color || 'var(--text)' }}>{s.val}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>
      <div style={{ opacity: show ? 1 : 0, transition: 'all 0.2s ease 0.7s' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600 }}>My Pending Tasks</h2>
          <span style={{ background: 'rgba(226,75,74,0.1)', color: '#E24B4A', fontSize: 11, fontWeight: 600, padding: '2px 10px', borderRadius: 8 }}>{myTasks.length} tasks</span>
        </div>
      </div>
      {myTasks.length === 0 ? <div style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)', fontSize: 13 }}>No pending tasks assigned to you.</div> :
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {myTasks.map((t, i) => { const s = tagStyle(t.priority); return (
          <div key={t.id || i} className="card-inner" style={{ borderLeft: `3px solid ${s.border}`, padding: '14px 16px', opacity: show ? 1 : 0, transform: show ? 'translateY(0)' : 'translateY(12px)', transition: `all 0.25s ease ${0.8 + i * 0.08}s` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{t.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>📁 {proj?.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{t.description}</div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 10px', borderRadius: 8, background: `${s.pr}15`, color: s.pr }}>{t.priority}</span>
                <div style={{ fontSize: 11, fontWeight: 600, color: s.due, marginTop: 8 }}>{t.dueDate ? new Date(t.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'No date'}</div>
              </div>
            </div>
          </div>
        ); })}
      </div>}
      <div style={{ display: 'flex', gap: 12, marginTop: 32, opacity: show ? 1 : 0, transition: 'all 0.2s ease 1.3s' }}>
        <button className="mag-btn" onClick={() => onNavigate(role === 'member' ? 'myproject' : 'dashboard')} style={{ flex: 1, justifyContent: 'center', background: 'var(--primary)', color: 'white', border: '1.5px solid var(--primary)' }}>{role === 'member' ? 'Go to My Project →' : 'Go to Dashboard →'}</button>
        <button className="mag-btn" onClick={() => onNavigate('achievements')} style={{ flex: 1, justifyContent: 'center' }}>🏆 View Achievements</button>
      </div>
    </div>
  );
}
