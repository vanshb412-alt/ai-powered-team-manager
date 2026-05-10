import React, { useState, useEffect } from 'react';
import { getData, saveData, generateInitials, createProject, joinProject } from './store.js';

function InputField({ label, placeholder, value, onChange, mono, delay, show }) {
  return (
    <div style={{ opacity: show ? 1 : 0, transform: show ? 'translateY(0)' : 'translateY(8px)', transition: `all 0.3s ease ${delay}s` }}>
      <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>{label}</label>
      <input value={value} onChange={e => onChange(mono ? e.target.value.toUpperCase().slice(0, 7) : e.target.value)}
        placeholder={placeholder}
        style={{width:'100%',padding:'12px 16px',borderRadius:12,border:'0.5px solid var(--border)',fontSize:14,fontFamily:mono?'monospace':'inherit',background:'var(--bg)',color:'var(--text)',outline:'none',transition:'border-color 0.2s',letterSpacing:mono?2:0}}
        onFocus={e=>e.target.style.borderColor='#534AB7'} onBlur={e=>e.target.style.borderColor='var(--border)'}/>
    </div>
  );
}

function Checkmark({ show }) {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" style={{ margin: '0 auto', display: 'block' }}>
      <circle cx="32" cy="32" r="28" fill="none" stroke="#1D9E75" strokeWidth="3"
        style={{ strokeDasharray: 176, strokeDashoffset: show ? 0 : 176, transition: 'stroke-dashoffset 0.4s ease' }} />
      <polyline points="20,34 28,42 44,24" fill="none" stroke="#1D9E75" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
        style={{ strokeDasharray: 40, strokeDashoffset: show ? 0 : 40, transition: 'stroke-dashoffset 0.3s ease 0.2s' }} />
    </svg>
  );
}

export default function OnboardingScreen({ role, onComplete }) {
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [copied, setCopied] = useState(false);
  const [joinError, setJoinError] = useState('');
  const [name, setName] = useState('');
  const [roleTitle, setRoleTitle] = useState('');
  const [teamName, setTeamName] = useState('');
  const [projectName, setProjectName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [resultData, setResultData] = useState(null);

  useEffect(() => { setTimeout(() => setShow(true), 50); }, []);
  const isLeader = role === 'leader';
  const canSubmit = isLeader ? name && roleTitle && teamName && projectName : name && roleTitle && joinCode;

  const handleSubmit = () => {
    if (!canSubmit || loading) return;
    setLoading(true);
    setJoinError('');
    setTimeout(() => {
      const d = getData();
      if (d && d.currentUser) {
        d.currentUser.name = name;
        d.currentUser.roleTitle = roleTitle;
        d.currentUser.avatar = generateInitials(name);
        saveData(d);
      }
      if (isLeader) {
        const user = getData().currentUser;
        const proj = createProject(projectName, 'Sprint 1', { id: user.id, name: user.name, roleTitle });
        setResultData({ inviteCode: proj.inviteCode, projectName: proj.name, teamName });
        setLoading(false); setSuccess(true);
      } else {
        const user = getData().currentUser;
        const res = joinProject(joinCode, { id: user.id, name: user.name, roleTitle });
        if (res.success) {
          setResultData({ projectName: res.project.name, teamName: res.project.name });
          setLoading(false); setSuccess(true);
        } else {
          setLoading(false); setJoinError(res.error);
        }
      }
    }, 800);
  };

  const handleFinish = () => {
    onComplete({ userName: name, userRoleTitle: roleTitle, teamName: isLeader ? teamName : resultData?.teamName });
  };

  const copyCode = () => {
    navigator.clipboard?.writeText(resultData?.inviteCode);
    setCopied(true); setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: 24 }}>
      <div style={{
        background:'var(--surface)',border:'0.5px solid var(--border)',borderRadius:16,padding:40,maxWidth:480,width:'100%',boxShadow:'0 2px 12px rgba(83,74,183,0.08)',
        transform:show?'translateY(0)':'translateY(20px)',opacity:show?1:0,transition:'all 0.4s ease'
      }}>
        {!success ? (
          <>
            <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 4 }}>{isLeader ? 'Set up your team' : 'Join your team'}</h2>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 24 }}>{isLeader ? 'You can always change these later' : 'Enter the invite code your team leader shared'}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <InputField label="Your name" placeholder="e.g. Vansh Bansal" value={name} onChange={setName} delay={0.08} show={show} />
              <InputField label="Your role" placeholder={isLeader?'e.g. Engineering Lead':'e.g. Frontend Developer'} value={roleTitle} onChange={setRoleTitle} delay={0.16} show={show} />
              {isLeader && <InputField label="Team name" placeholder="e.g. Team Synapse" value={teamName} onChange={setTeamName} delay={0.24} show={show} />}
              {isLeader && <InputField label="Project name" placeholder="e.g. Mobile App Redesign" value={projectName} onChange={setProjectName} delay={0.32} show={show} />}
              {!isLeader && <InputField label="Invite code" placeholder="e.g. SYN-4X2" value={joinCode} onChange={setJoinCode} mono delay={0.24} show={show} />}
              {joinError && <div style={{fontSize:12,color:'#E24B4A',padding:'8px 12px',background:'rgba(226,75,74,0.08)',borderRadius:8}}>{joinError}</div>}
              <button onClick={handleSubmit} disabled={!canSubmit||loading} style={{
                width:'100%',padding:14,borderRadius:12,border:'none',background:canSubmit?'#534AB7':'var(--border)',color:canSubmit?'white':'var(--text-muted)',fontSize:14,fontWeight:600,fontFamily:'inherit',cursor:canSubmit?'pointer':'not-allowed',transition:'all 0.2s',display:'flex',alignItems:'center',justifyContent:'center',gap:8
              }}>
                {loading?<div className="toast-spinner" style={{borderTopColor:'white',borderColor:'rgba(255,255,255,0.3)'}}/>:(isLeader?'Create Team →':'Join Team →')}
              </button>
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <Checkmark show={success} />
            <h2 style={{ fontSize: 16, fontWeight: 600, color: '#1D9E75', marginTop: 16 }}>{isLeader ? 'Team created successfully!' : "You've joined the team!"}</h2>
            {isLeader ? (
              <>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>Share this code with your team members</p>
                <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:12,margin:'16px auto',padding:'12px 24px',border:'1.5px solid var(--border)',borderRadius:12,background:'var(--bg)',maxWidth:200,transform:success?'scale(1)':'scale(0.8)',opacity:success?1:0,transition:'all 0.3s ease 0.3s'}}>
                  <span style={{fontSize:32,fontWeight:600,color:'#534AB7',fontFamily:'monospace',letterSpacing:3}}>{resultData?.inviteCode}</span>
                  <button onClick={copyCode} style={{background:'none',border:'none',cursor:'pointer',fontSize:16,color:copied?'#1D9E75':'var(--text-muted)',transition:'color 0.2s'}}>{copied?'✓':'📋'}</button>
                </div>
              </>
            ) : (
              <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 12 }}>Welcome to {resultData?.projectName}</p>
            )}
            <button onClick={handleFinish} style={{width:'100%',padding:14,borderRadius:12,border:'none',marginTop:20,background:'#534AB7',color:'white',fontSize:14,fontWeight:600,fontFamily:'inherit',cursor:'pointer',transition:'all 0.2s'}}>
              {isLeader?'Go to Dashboard →':"Let's get you set up →"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
