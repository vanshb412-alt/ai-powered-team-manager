import React, { useState, useEffect } from 'react';
import { getCurrentUser, calculateLevel, getLevelName, ACHIEVEMENTS, getAchievementProgress } from './store.js';

const tierColors = { gold:'#F5A623', silver:'#A8A8A8', bronze:'#CD7F32' };
const tierIcons = { gold:'🥇', silver:'🥈', bronze:'🥉' };
const cats = ['All','Sprint','Tasks','Team','Milestones'];

export default function AchievementsScreen({ dv }) {
  const [show, setShow] = useState(false);
  const [filter, setFilter] = useState('All');
  useEffect(() => { setTimeout(() => setShow(true), 50); }, []);

  const user = getCurrentUser();
  const xp = user?.xp || 0;
  const level = calculateLevel(xp);
  const levelName = getLevelName(level);
  const xpInLevel = xp - ((level - 1) * 300);
  const xpNeeded = 300;
  const xpPct = Math.min(100, Math.round((xpInLevel / xpNeeded) * 100));
  const unlocked = user?.unlockedAchievements || [];
  const unlockedCount = unlocked.length;
  const lockedCount = ACHIEVEMENTS.length - unlockedCount;

  const all = ACHIEVEMENTS.map(a => {
    const isUnlocked = unlocked.includes(a.id);
    const progress = isUnlocked ? { pct: 100, text: '' } : getAchievementProgress(a.id);
    return { ...a, unlocked: isUnlocked, progress: progress.text, pct: progress.pct };
  });
  const filtered = filter === 'All' ? all : all.filter(a => a.cat === filter);

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '32px 24px' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 20, fontWeight: 600 }}>Achievements</h1>
        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{unlockedCount} unlocked · {lockedCount} locked</div>
      </div>
      <div style={{
        background: 'linear-gradient(135deg,#534AB7 0%,#7F77DD 100%)', borderRadius: 16, padding: 24, color: 'white', marginBottom: 24,
        opacity: show ? 1 : 0, transform: show ? 'translateY(0)' : 'translateY(12px)', transition: 'all 0.4s ease 0.1s'
      }}>
        <div style={{ fontSize: 16, fontWeight: 600 }}>Level {level} — {levelName}</div>
        <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 4, height: 8, marginTop: 12, overflow: 'hidden' }}>
          <div style={{ height: '100%', background: 'white', borderRadius: 4, width: show ? xpPct + '%' : '0%', transition: 'width 0.8s ease-out 0.3s' }} />
        </div>
        <div style={{ fontSize: 12, opacity: 0.8, marginTop: 8 }}>{xp} / {level * 300} XP · {level * 300 - xp} XP to Level {level + 1} — {getLevelName(level + 1)}</div>
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {cats.map(c => (
          <button key={c} onClick={() => setFilter(c)} style={{
            padding: '6px 16px', borderRadius: 8, fontSize: 13, fontWeight: 500, fontFamily: 'inherit',
            cursor: 'pointer', transition: 'all 0.2s', border: '1.5px solid',
            background: filter === c ? 'var(--primary)' : 'transparent',
            color: filter === c ? 'white' : 'var(--primary)', borderColor: 'var(--primary)'
          }}>{c}</button>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 16 }}>
        {filtered.map((a, i) => (
          <div key={a.id} className="card-inner" style={{
            padding: 20, opacity: show ? 1 : 0, transform: show ? 'scale(1)' : 'scale(0.8)',
            transition: `all 0.4s ease ${0.2 + i * 0.06}s`, filter: a.unlocked ? 'none' : 'grayscale(0.5)',
            position: 'relative', overflow: 'hidden'
          }}>
            {a.unlocked && a.tier === 'gold' && (
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(90deg,transparent,rgba(245,166,35,0.1),transparent)', backgroundSize: '200% 100%', animation: 'shimmer 2s ease-in-out 1', pointerEvents: 'none' }} />
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: a.unlocked ? `${tierColors[a.tier]}20` : 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>{tierIcons[a.tier]}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, opacity: a.unlocked ? 1 : 0.5 }}>{a.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{a.desc}</div>
              </div>
            </div>
            {a.unlocked ? (
              <>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8 }}>Unlocked ✓</div>
                <div style={{ height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ height: '100%', background: tierColors[a.tier], borderRadius: 2, width: show ? '100%' : '0%', transition: `width 0.6s ease-out ${0.4 + i * 0.06}s` }} />
                </div>
              </>
            ) : (
              <>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>{a.progress || 'Keep going!'}</div>
                <div style={{ height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ height: '100%', background: 'var(--text-muted)', borderRadius: 2, width: show ? `${a.pct}%` : '0%', transition: `width 0.6s ease-out ${0.4 + i * 0.06}s` }} />
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>Keep going!</div>
              </>
            )}
            <div style={{ marginTop: 8 }}>
              <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 6, background: 'var(--pill-bg)', color: 'var(--primary)' }}>{a.cat}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
