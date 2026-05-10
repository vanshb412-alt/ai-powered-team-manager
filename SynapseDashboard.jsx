import React, { useState, useEffect, useRef, useCallback } from 'react';
import './app.css';
import { notifications, announcements } from './data.js';
import { getData, saveData, initDemoData, initNewUser, getCurrentUser, getActiveProject, getUserProjects, getRoleInProject, setActiveProject, generateInitials, createProject, joinProject } from './store.js';
import LoginScreen from './LoginScreen.jsx';
import RoleSelectScreen from './RoleSelectScreen.jsx';
import OnboardingScreen from './OnboardingScreen.jsx';
import ProfileScreen from './ProfileScreen.jsx';
import DashboardScreen from './DashboardScreen.jsx';
import AnalyticsScreen from './AnalyticsScreen.jsx';
import AchievementsScreen from './AchievementsScreen.jsx';
import MemberProjectView from './MemberProjectView.jsx';
import TaskManagerScreen from './TaskManagerScreen.jsx';

const BellIcon=()=><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>;
const MoonIcon=()=><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>;
const SunIcon=()=><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>;
const MegaIcon=()=><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>;
const TrophyIcon=()=><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9H4.5a2.5 2.5 0 010-5H6"/><path d="M18 9h1.5a2.5 2.5 0 000-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20 17 22"/><path d="M18 2H6v7a6 6 0 0012 0V2z"/></svg>;
const ClipIcon=()=><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>;

function ProjectSwitcher({onSwitch,onCreateNew,onJoinNew}){
  const [open,setOpen]=useState(false);
  const proj=getActiveProject();const ups=getUserProjects();
  const colors=['#534AB7','#1D9E75','#BA7517','#E24B4A','#0F6E56','#993556'];
  return(
    <div style={{position:'relative'}}>
      <button onClick={()=>setOpen(o=>!o)} style={{display:'flex',alignItems:'center',gap:6,background:'none',border:'none',cursor:'pointer',fontSize:13,fontWeight:500,color:'var(--text)',fontFamily:'inherit',maxWidth:200,padding:'4px 8px',borderRadius:8,transition:'background 0.15s'}}
        onMouseEnter={e=>e.currentTarget.style.background='var(--bg)'} onMouseLeave={e=>e.currentTarget.style.background='none'}>
        <span style={{overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{proj?.name||'No Project'}</span>
        <span style={{fontSize:10,transition:'transform 0.2s',transform:open?'rotate(180deg)':'none'}}>▾</span>
      </button>
      {open&&<div style={{position:'absolute',top:'100%',left:0,marginTop:4,background:'var(--surface)',border:'0.5px solid var(--border)',borderRadius:12,padding:8,minWidth:240,boxShadow:'0 4px 20px rgba(0,0,0,0.12)',zIndex:1000,animation:'fadeSlideDown 0.2s ease'}}>
        <div style={{fontSize:11,textTransform:'uppercase',color:'var(--text-muted)',padding:'8px 12px',fontWeight:500,letterSpacing:0.5}}>My Projects</div>
        {ups.map((up,i)=>(
          <div key={up.projectId} onClick={()=>{onSwitch(up.projectId);setOpen(false);}} style={{display:'flex',alignItems:'center',gap:10,padding:'8px 12px',borderRadius:8,cursor:'pointer',transition:'background 0.15s'}}
            onMouseEnter={e=>e.currentTarget.style.background='var(--bg)'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
            <div style={{width:8,height:8,borderRadius:'50%',background:colors[i%colors.length],flexShrink:0}}/>
            {proj?.id===up.projectId&&<span style={{color:'var(--primary)',fontSize:12}}>✓</span>}
            <span style={{flex:1,fontSize:13,fontWeight:600,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{up.project?.name}</span>
            <span style={{fontSize:10,fontWeight:600,padding:'2px 8px',borderRadius:6,background:up.role==='leader'?'rgba(83,74,183,0.1)':'rgba(29,158,117,0.1)',color:up.role==='leader'?'#534AB7':'#1D9E75'}}>{up.role==='leader'?'Leader':'Member'}</span>
          </div>
        ))}
        <div style={{height:0.5,background:'var(--border)',margin:'4px 0'}}/>
        <div onClick={()=>{onCreateNew();setOpen(false);}} style={{display:'flex',alignItems:'center',gap:8,padding:'8px 12px',borderRadius:8,cursor:'pointer',color:'#534AB7',fontSize:13,fontWeight:500,transition:'background 0.15s'}}
          onMouseEnter={e=>e.currentTarget.style.background='var(--bg)'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>+ Create new project</div>
        <div onClick={()=>{onJoinNew();setOpen(false);}} style={{display:'flex',alignItems:'center',gap:8,padding:'8px 12px',borderRadius:8,cursor:'pointer',color:'#1D9E75',fontSize:13,fontWeight:500,transition:'background 0.15s'}}
          onMouseEnter={e=>e.currentTarget.style.background='var(--bg)'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>+ Join a project</div>
      </div>}
    </div>
  );
}

function ProjectModal({mode,onClose,addToast,forceUpdate}){
  const [name,setName]=useState('');const[sprint,setSprint]=useState('Sprint 1');const[code,setCode]=useState('');const[role,setRole]=useState('');const[error,setError]=useState('');const[loading,setLoading]=useState(false);
  const handleSubmit=()=>{
    if(mode==='create'){if(!name.trim())return;setLoading(true);
      setTimeout(()=>{const u=getCurrentUser();const p=createProject(name.trim(),sprint,{id:u.id,name:u.name,roleTitle:u.roleTitle});
        addToast('success',`Project created! Invite code: ${p.inviteCode}`,4000);forceUpdate();onClose();},500);
    }else{if(!code.trim()||!role.trim())return;setLoading(true);setError('');
      setTimeout(()=>{const u=getCurrentUser();const res=joinProject(code.trim(),{id:u.id,name:u.name,roleTitle:role});
        if(res.success){addToast('success',`Joined ${res.project.name} successfully!`);forceUpdate();onClose();}
        else{setError(res.error);setLoading(false);}},500);
    }
  };
  return(
    <div className="card" style={{maxWidth:480,margin:'0 auto',marginBottom:24}}>
      <h3 style={{fontSize:18,fontWeight:600,marginBottom:4}}>{mode==='create'?'Create a New Project':'Join a Project'}</h3>
      <p style={{fontSize:13,color:'var(--text-muted)',marginBottom:20}}>{mode==='create'?'Set up your project and invite your team':'Enter the invite code from your team leader'}</p>
      <div style={{display:'flex',flexDirection:'column',gap:14}}>
        {mode==='create'?<>
          <input value={name} onChange={e=>setName(e.target.value)} placeholder="Project name" style={{width:'100%',padding:12,borderRadius:12,border:'0.5px solid var(--border)',background:'var(--bg)',color:'var(--text)',fontFamily:'inherit',fontSize:14,outline:'none'}}/>
          <input value={sprint} onChange={e=>setSprint(e.target.value)} placeholder="e.g. Sprint 1" style={{width:'100%',padding:12,borderRadius:12,border:'0.5px solid var(--border)',background:'var(--bg)',color:'var(--text)',fontFamily:'inherit',fontSize:14,outline:'none'}}/>
          <div style={{fontSize:13,color:'var(--text-muted)',padding:'8px 12px',background:'var(--bg)',borderRadius:8}}>Your role: <strong>Leader</strong></div>
        </>:<>
          <input value={code} onChange={e=>setCode(e.target.value.toUpperCase())} placeholder="e.g. SYN-472" style={{width:'100%',padding:12,borderRadius:12,border:`0.5px solid ${error?'#E24B4A':'var(--border)'}`,background:'var(--bg)',color:'var(--text)',fontFamily:'monospace',fontSize:14,letterSpacing:2,outline:'none'}}/>
          <input value={role} onChange={e=>setRole(e.target.value)} placeholder="Your role e.g. Frontend Developer" style={{width:'100%',padding:12,borderRadius:12,border:'0.5px solid var(--border)',background:'var(--bg)',color:'var(--text)',fontFamily:'inherit',fontSize:14,outline:'none'}}/>
          {error&&<div style={{fontSize:12,color:'#E24B4A',padding:'8px 12px',background:'rgba(226,75,74,0.08)',borderRadius:8}}>{error}</div>}
        </>}
        <button onClick={handleSubmit} disabled={loading} style={{width:'100%',padding:14,borderRadius:12,border:'none',background:'#534AB7',color:'white',fontSize:14,fontWeight:600,fontFamily:'inherit',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>
          {loading?<div className="toast-spinner" style={{borderTopColor:'white',borderColor:'rgba(255,255,255,0.3)'}}/>:(mode==='create'?'Create Project →':'Join Project →')}
        </button>
      </div>
    </div>
  );
}

export default function SynapseDashboard(){
  const d=getData();const hasUser=d?.currentUser&&d.currentUser.xp!==undefined;
  const [appPhase,setAppPhase]=useState(hasUser?'app':'login');
  const [selectedRole,setSelectedRole]=useState(null);
  const [dataVersion,setDataVersion]=useState(0);
  const forceUpdate=useCallback(()=>setDataVersion(v=>v+1),[]);

  const user=getCurrentUser();const proj=getActiveProject();
  const activeRole=proj?getRoleInProject(proj.id):'leader';
  const isLeader=activeRole==='leader';
  const defaultScreen=isLeader?'dashboard':'myproject';
  const [screen,setScreen]=useState(hasUser?defaultScreen:'dashboard');
  const [isDark,setIsDark]=useState(false);const[loaded,setLoaded]=useState(false);
  const [showNotifs,setShowNotifs]=useState(false);const[showSidebar,setShowSidebar]=useState(false);
  const [bellRing,setBellRing]=useState(false);const[themeSpin,setThemeSpin]=useState(false);
  const [toasts,setToasts]=useState([]);const[fadeState,setFadeState]=useState('active');
  const [showAvatarMenu,setShowAvatarMenu]=useState(false);
  const [modal,setModal]=useState(null); // 'create'|'join'|null
  const dotRef=useRef(null);const ringRef=useRef(null);
  const mousePos=useRef({x:-100,y:-100});const ringPos=useRef({x:-100,y:-100});const hovering=useRef(false);

  useEffect(()=>{if(appPhase==='app')setTimeout(()=>setLoaded(true),100);},[appPhase]);
  useEffect(()=>{if(appPhase!=='app')return;const iv=setInterval(()=>{setBellRing(true);setTimeout(()=>setBellRing(false),500);},8000);return()=>clearInterval(iv);},[appPhase]);

  useEffect(()=>{
    const onMove=e=>{mousePos.current={x:e.clientX,y:e.clientY};};
    const onClick=e=>{const r=document.createElement('div');r.className='click-ripple';r.style.left=e.clientX+'px';r.style.top=e.clientY+'px';document.body.appendChild(r);setTimeout(()=>r.remove(),400);if(dotRef.current){dotRef.current.classList.add('clicking');setTimeout(()=>dotRef.current?.classList.remove('clicking'),150);}};
    const onOver=e=>{hovering.current=!!e.target.closest('button,a,[role="button"],.project-row,.nav-btn,.card-inner,.insight-pill,.mag-btn,.avatar,.heatmap-cell,.ai-brief,.task-card-hover');};
    document.addEventListener('mousemove',onMove);document.addEventListener('click',onClick);document.addEventListener('mouseover',onOver);
    let raf;const loop=()=>{ringPos.current.x+=(mousePos.current.x-ringPos.current.x)*0.12;ringPos.current.y+=(mousePos.current.y-ringPos.current.y)*0.12;
      if(dotRef.current){dotRef.current.style.left=mousePos.current.x+'px';dotRef.current.style.top=mousePos.current.y+'px';dotRef.current.classList.toggle('hovering',hovering.current);}
      if(ringRef.current){ringRef.current.style.left=ringPos.current.x+'px';ringRef.current.style.top=ringPos.current.y+'px';ringRef.current.classList.toggle('hovering',hovering.current);}
      raf=requestAnimationFrame(loop);};raf=requestAnimationFrame(loop);
    return()=>{cancelAnimationFrame(raf);document.removeEventListener('mousemove',onMove);document.removeEventListener('click',onClick);document.removeEventListener('mouseover',onOver);};
  },[]);

  useEffect(()=>{document.body.classList.toggle('dark',isDark);},[isDark]);
  const toggleDark=()=>{setThemeSpin(true);setTimeout(()=>setThemeSpin(false),400);setIsDark(d=>!d);};

  const navigate=useCallback((target)=>{if(target===screen)return;setFadeState('exit');setModal(null);
    setTimeout(()=>{setScreen(target);setFadeState('enter');setTimeout(()=>setFadeState('active'),20);},200);},[screen]);

  const addToast=useCallback((type,msg,duration)=>{const id=Date.now();
    setToasts(t=>[...t,{id,type,msg}]);
    setTimeout(()=>{setToasts(t=>t.map(x=>x.id===id?{...x,exit:true}:x));setTimeout(()=>setToasts(t=>t.filter(x=>x.id!==id)),200);},duration||2500);
  },[]);

  const handleLogin=(email,pass)=>{
    if(email==='vansh@synapse.ai'&&pass==='synapse123'){initDemoData(email);setAppPhase('app');setScreen('dashboard');forceUpdate();return;}
    if(email==='guest'||!email){initNewUser('Guest User',email||'','');setAppPhase('roleSelect');return;}
    const existing=getData();
    if(existing?.currentUser?.email===email){setAppPhase('app');setScreen(getRoleInProject(getActiveProject()?.id)==='leader'?'dashboard':'myproject');forceUpdate();return;}
    initNewUser('New User',email,'');setAppPhase('roleSelect');
  };

  const handleRoleSelect=(role)=>{setSelectedRole(role);setAppPhase('onboarding');};
  const handleOnboardComplete=()=>{const r=getRoleInProject(getActiveProject()?.id);setScreen(r==='leader'?'dashboard':'myproject');setAppPhase('app');forceUpdate();};

  const handleSignOut=()=>{localStorage.removeItem('synapse_data');setShowAvatarMenu(false);setAppPhase('login');setScreen('dashboard');};

  const handleProjectSwitch=(projectId)=>{setActiveProject(projectId);forceUpdate();
    const r=getRoleInProject(projectId);setFadeState('exit');
    setTimeout(()=>{setScreen(r==='leader'?'dashboard':'myproject');setFadeState('enter');setTimeout(()=>setFadeState('active'),20);},200);
  };

  if(appPhase==='login')return(<><div ref={dotRef} className="cursor-dot"/><div ref={ringRef} className="cursor-ring"/><LoginScreen onLogin={handleLogin}/></>);
  if(appPhase==='roleSelect')return(<><div ref={dotRef} className="cursor-dot"/><div ref={ringRef} className="cursor-ring"/><RoleSelectScreen onSelect={handleRoleSelect}/></>);
  if(appPhase==='onboarding')return(<><div ref={dotRef} className="cursor-dot"/><div ref={ringRef} className="cursor-ring"/><OnboardingScreen role={selectedRole} onComplete={handleOnboardComplete}/></>);

  const tabItems=isLeader
    ?[{key:'profile',label:'Profile'},{key:'dashboard',label:'Dashboard'},{key:'analytics',label:'Analytics'}]
    :[{key:'profile',label:'Profile'},{key:'myproject',label:'My Project'}];

  return(
    <><div ref={dotRef} className="cursor-dot"/><div ref={ringRef} className="cursor-ring"/>
      <nav className="navbar">
        <div style={{display:'flex',alignItems:'center',gap:16}}>
          <div className="nav-brand"><div className="nav-dot"/><span className="nav-title">Synapse</span><span className="nav-sub">AI Team OS</span></div>
          <ProjectSwitcher onSwitch={handleProjectSwitch} onCreateNew={()=>{setModal('create');navigate('dashboard');}} onJoinNew={()=>{setModal('join');navigate('dashboard');}}/>
          <div style={{display:'flex',gap:4}}>
            {tabItems.map(t=>(<button key={t.key} className="nav-btn" onClick={()=>navigate(t.key)} style={{width:'auto',borderRadius:8,padding:'6px 14px',fontSize:13,fontWeight:600,fontFamily:'inherit',background:screen===t.key?'rgba(83,74,183,0.1)':'transparent',color:screen===t.key?'var(--primary)':'var(--text-muted)'}}>{t.label}</button>))}
          </div>
        </div>
        <input className="nav-search" placeholder="Search tasks, people..."/>
        <div className="nav-right">
          <button className="nav-btn" onClick={()=>navigate('achievements')} title="Achievements" style={{color:screen==='achievements'?'var(--primary)':'var(--text-muted)'}}><TrophyIcon/></button>
          {isLeader&&<button className="nav-btn" onClick={()=>navigate('tasks')} title="Task Manager" style={{color:screen==='tasks'?'var(--primary)':'var(--text-muted)'}}><ClipIcon/></button>}
          <button className="nav-btn" onClick={()=>setShowSidebar(true)}><MegaIcon/></button>
          <button className={`nav-btn ${bellRing?'bell-ringing':''}`} onClick={()=>setShowNotifs(n=>!n)} style={{position:'relative'}}>
            <BellIcon/><span className="badge">3</span>
            {showNotifs&&<div className="notif-dropdown" onClick={e=>e.stopPropagation()}>{notifications.map((n,i)=>(<div className="notif-item" key={i}><div className="notif-bar" style={{background:n.color}}/><div><div className="notif-title">{n.title}</div><div className="notif-time">{n.time}</div></div></div>))}</div>}
          </button>
          <button className={`nav-btn ${themeSpin?'theme-spin':''}`} onClick={toggleDark}>{isDark?<SunIcon/>:<MoonIcon/>}</button>
          <div className="avatar" onClick={()=>setShowAvatarMenu(s=>!s)} style={{cursor:'none',boxShadow:screen==='profile'?'0 0 0 2px var(--primary)':'none',transition:'box-shadow 0.2s ease',position:'relative'}}>
            {user?generateInitials(user.name):'??'}
            {showAvatarMenu&&<div style={{position:'absolute',top:48,right:0,background:'var(--surface)',border:'0.5px solid var(--border)',borderRadius:8,boxShadow:'0 4px 16px rgba(0,0,0,0.1)',overflow:'hidden',zIndex:200,minWidth:180}} onClick={e=>e.stopPropagation()}>
              <div style={{padding:'12px 16px',borderBottom:'0.5px solid var(--border)'}}>
                <div style={{fontSize:13,fontWeight:600}}>{user?.name}</div>
                <div style={{fontSize:11,color:'var(--text-muted)',marginTop:2}}>{user?.email||'Guest'}</div>
              </div>
              <button onClick={()=>{setShowAvatarMenu(false);navigate('profile');}} style={{display:'block',width:'100%',padding:'10px 16px',background:'none',border:'none',fontSize:13,fontFamily:'inherit',color:'var(--text)',textAlign:'left',cursor:'pointer'}}>Go to Profile</button>
              <button onClick={()=>{addToast('success','Coming soon!');setShowAvatarMenu(false);}} style={{display:'block',width:'100%',padding:'10px 16px',background:'none',border:'none',fontSize:13,fontFamily:'inherit',color:'var(--text)',textAlign:'left',cursor:'pointer'}}>Settings</button>
              <button onClick={handleSignOut} style={{display:'block',width:'100%',padding:'10px 16px',background:'none',border:'none',borderTop:'0.5px solid var(--border)',fontSize:13,fontFamily:'inherit',color:'#E24B4A',textAlign:'left',cursor:'pointer'}}>Sign Out</button>
            </div>}
          </div>
        </div>
      </nav>
      <main className="main" style={{paddingTop:88}}>
        {modal&&<ProjectModal mode={modal} onClose={()=>setModal(null)} addToast={addToast} forceUpdate={()=>{forceUpdate();setModal(null);}}/>}
        <div style={{opacity:fadeState==='exit'?0:1,transform:fadeState==='exit'?'translateY(-6px)':fadeState==='enter'?'translateY(6px)':'translateY(0)',transition:fadeState==='exit'?'all 0.2s ease-in':'all 0.25s ease-out'}}>
          {screen==='profile'&&<ProfileScreen onNavigate={navigate} role={activeRole} dv={dataVersion}/>}
          {screen==='dashboard'&&isLeader&&<DashboardScreen isDark={isDark} loaded={loaded} addToast={addToast} forceUpdate={forceUpdate} dv={dataVersion}/>}
          {screen==='analytics'&&isLeader&&<AnalyticsScreen isDark={isDark} addToast={addToast} dv={dataVersion}/>}
          {screen==='myproject'&&!isLeader&&<MemberProjectView addToast={addToast} forceUpdate={forceUpdate} dv={dataVersion}/>}
          {screen==='achievements'&&<AchievementsScreen dv={dataVersion}/>}
          {screen==='tasks'&&isLeader&&<TaskManagerScreen addToast={addToast} forceUpdate={forceUpdate} dv={dataVersion}/>}
        </div>
      </main>
      <div className={`sidebar-overlay ${showSidebar?'open':''}`} onClick={()=>setShowSidebar(false)}/>
      <div className={`sidebar ${showSidebar?'open':''}`}>
        <div className="sidebar-header"><div><div className="sidebar-title">Company Forecast</div><div className="sidebar-sub">AI-summarized org updates</div></div><button className="sidebar-close" onClick={()=>setShowSidebar(false)}>✕</button></div>
        {announcements.map((a,i)=>(<div className="announce-card" key={i}><span className="announce-tag" style={{background:a.tagBg,color:a.tagColor}}>{a.tag}</span><div className="announce-title">{a.title}</div><div className="announce-date">{a.date}</div><div className="ai-impact"><div className="ai-impact-label">AI Impact on Your Team:</div>{a.impact}</div></div>))}
      </div>
      <div className="toast-container">{toasts.map(t=>(<div key={t.id} className={`toast ${t.exit?'exit':''}`}><div className="toast-bar" style={{background:t.type==='loading'?'var(--primary)':t.type==='success'?'var(--success)':'var(--danger)'}}/>{t.type==='loading'?<div className="toast-spinner"/>:t.type==='success'?'✓':'✕'}{t.msg}</div>))}</div>
    </>
  );
}
