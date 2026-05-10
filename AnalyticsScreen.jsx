import React, { useState, useEffect, useRef, useCallback } from 'react';
import { velocityData, sprintTableStatic } from './data.js';
import { getActiveProject, calculateCompletion, calculateUserLoad } from './store.js';

function VelocityChart({isDark,animate}){const ref=useRef(null);
  const draw=useCallback(()=>{const c=ref.current;if(!c)return;const par=c.parentElement;if(!par)return;
    const W=par.clientWidth,H=220;c.width=W*2;c.height=H*2;c.style.width=W+'px';c.style.height=H+'px';
    const ctx=c.getContext('2d');ctx.scale(2,2);const{sprints,values}=velocityData;
    const mx=Math.max(...values)*1.2,px=36,py=16,cw=W-px*2,ch=H-py*3;
    const txt=isDark?'#8B8AA0':'#6B6B80',grid=isDark?'#2A2840':'#E8E8F0';
    ctx.strokeStyle=grid;ctx.lineWidth=0.5;
    for(let i=0;i<=4;i++){const y=py+(ch/4)*i;ctx.beginPath();ctx.moveTo(px,y);ctx.lineTo(W-px,y);ctx.stroke();ctx.fillStyle=txt;ctx.font='11px Inter';ctx.textAlign='right';ctx.fillText(Math.round(mx-(mx/4)*i),px-8,y+4);}
    const pts=values.map((v,i)=>({x:px+(cw/(sprints.length-1))*i,y:py+ch-(v/mx)*ch}));
    ctx.beginPath();ctx.moveTo(pts[0].x,pts[0].y);
    for(let i=0;i<pts.length-1;i++){const cp=(pts[i+1].x-pts[i].x)/2;ctx.bezierCurveTo(pts[i].x+cp,pts[i].y,pts[i].x+cp,pts[i+1].y,pts[i+1].x,pts[i+1].y);}
    ctx.strokeStyle='#534AB7';ctx.lineWidth=2.5;ctx.stroke();
    ctx.lineTo(pts[pts.length-1].x,py+ch);ctx.lineTo(pts[0].x,py+ch);ctx.closePath();
    const grd=ctx.createLinearGradient(0,py,0,py+ch);grd.addColorStop(0,'rgba(83,74,183,0.25)');grd.addColorStop(1,'rgba(83,74,183,0)');ctx.fillStyle=grd;ctx.fill();
    pts.forEach((p,i)=>{ctx.beginPath();ctx.arc(p.x,p.y,4,0,Math.PI*2);ctx.fillStyle='#534AB7';ctx.fill();ctx.lineWidth=2;ctx.strokeStyle=isDark?'#1A1928':'#fff';ctx.stroke();
      ctx.fillStyle=txt;ctx.textAlign='center';ctx.font='600 11px Inter';ctx.fillText(values[i],p.x,p.y-10);ctx.font='11px Inter';ctx.fillText(sprints[i],p.x,py+ch+16);});
  },[isDark]);
  useEffect(()=>{if(animate)draw();const h=()=>draw();window.addEventListener('resize',h);return()=>window.removeEventListener('resize',h);},[draw,animate]);
  return <canvas ref={ref} style={{display:'block',width:'100%'}}/>;
}

export default function AnalyticsScreen({isDark,addToast,dv}){
  const[animate,setAnimate]=useState(false);const[counts,setCounts]=useState([0,0,0]);
  const proj=getActiveProject();const tasks=proj?.tasks||[];
  const completion=calculateCompletion(proj?.id);
  const bugsDone=tasks.filter(t=>t.status==='Done'&&/bug|fix/i.test(t.name)).length;
  const doneTasks=tasks.filter(t=>t.status==='Done'&&t.completedAt&&t.createdAt);
  const avgCycle=doneTasks.length?+(doneTasks.reduce((s,t)=>{return s+(new Date(t.completedAt)-new Date(t.createdAt))/86400000;},0)/doneTasks.length).toFixed(1):0;
  const members=(proj?.members||[]).map(m=>{const load=calculateUserLoad(proj?.id,m.name);return{name:m.name,pct:load,color:load>85?'var(--danger)':load>65?'var(--warning)':'var(--success)'};});
  const velocity=tasks.length?Math.round(tasks.filter(t=>t.status==='Done').length/tasks.length*100):0;
  const aiScore=Math.round(velocity*0.6+completion*0.4);
  const currentSprint={sprint:proj?.sprintName||'S14',tasks:tasks.length,bugs:bugsDone,velocity:velocity+'%',cycle:avgCycle+'d',ai:aiScore,current:true};
  const heatmap=Array.from({length:28},(_,i)=>{const seed=(proj?.id||'x').charCodeAt(i%7)+i;return seed%5;});

  useEffect(()=>{const t=setTimeout(()=>setAnimate(true),100);return()=>clearTimeout(t);},[]);
  useEffect(()=>{if(!animate)return;const targets=[completion,bugsDone,avgCycle];const start=performance.now();const dur=800;
    const step=(now)=>{const p=Math.min((now-start)/dur,1);const ease=1-Math.pow(1-p,3);setCounts(targets.map(t=>+(t*ease).toFixed(t<10?1:0)));if(p<1)requestAnimationFrame(step);};requestAnimationFrame(step);
  },[animate,completion,bugsDone,avgCycle]);

  const handleExport=()=>{addToast('loading','Generating report...');setTimeout(()=>addToast('success','Report exported!'),1500);};

  return(
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:24}}>
        <div><h1 style={{fontSize:20,fontWeight:600}}>Analytics & Reports</h1>
          <div style={{fontSize:13,color:'var(--text-muted)',marginTop:4}}>AI-generated insights · {proj?.sprintName||'Sprint'} · {new Date().toLocaleDateString('en-US',{month:'long',year:'numeric'})}</div></div>
        <button className="mag-btn" onClick={handleExport}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>Export Report</button>
      </div>
      <div className="insight-pills">
        {[`${velocity>=70?'↑':'↓'} Velocity ${velocity}%`,members.find(m=>m.pct>85)?`⚠ ${members.find(m=>m.pct>85).name} overloaded`:'✓ No overloads',`⏱ Avg task: ${avgCycle}d`,`🎯 ${completion}% sprint progress`,`💡 ${tasks.filter(t=>t.status==='Done').length} tasks completed`].map((t,i)=>(<button className="insight-pill" key={i}>{t}</button>))}
      </div>
      <div className="stats-grid">
        <div className="card-inner"><div className="metric-label">Completion Rate</div><div className="metric-val">{counts[0]}%</div><div style={{fontSize:12,color:'var(--text-muted)'}}>Sprint progress</div><div className="stat-bar"><div className="stat-fill" style={{width:animate?completion+'%':'0%',background:'var(--primary)'}}/></div></div>
        <div className="card-inner"><div className="metric-label">Bugs Resolved</div><div className="metric-val">{counts[1]}</div><div className="metric-delta" style={{color:'var(--success)'}}>Tasks with "bug" or "fix"</div><div className="stat-bar"><div className="stat-fill" style={{width:animate?Math.min(100,bugsDone*10)+'%':'0%',background:'var(--success)'}}/></div></div>
        <div className="card-inner"><div className="metric-label">Avg Cycle Time</div><div className="metric-val">{counts[2]||'N/A'}{counts[2]?'d':''}</div><div className="metric-delta" style={{color:'var(--warning)'}}>Creation to completion</div><div className="stat-bar"><div className="stat-fill" style={{width:animate?Math.min(100,avgCycle*20)+'%':'0%',background:'var(--warning)'}}/></div></div>
      </div>
      <div className="two-col">
        <div className="card"><div className="card-title">Velocity Trend</div><VelocityChart isDark={isDark} animate={animate}/></div>
        <div className="card"><div className="card-title">Individual Output</div>
          {members.length===0?<div style={{textAlign:'center',padding:24,color:'var(--text-muted)',fontSize:13}}>No team members yet</div>:
          members.map((o,i)=>(<div className="output-row" key={i}><div className="output-name">{o.name}</div><div className="output-bar-track"><div className="output-bar-fill" style={{width:animate?`${o.pct}%`:'0%',background:o.color,transitionDelay:`${i*80}ms`}}/></div><div className="output-pct" style={{color:o.color}}>{o.pct}%</div>{o.pct>85&&<span style={{fontSize:14}}>⚠️</span>}</div>))}
        </div>
      </div>
      <div className="two-col">
        <div className="card"><div className="card-title">Sprint Comparison</div>
          <table className="sprint-table"><thead><tr><th>Sprint</th><th>Tasks</th><th>Bugs</th><th>Velocity</th><th>Cycle</th><th>AI Score</th></tr></thead>
            <tbody>{[...sprintTableStatic,currentSprint].map((r,i)=>(<tr key={i} className={r.current?'current':''}><td>{r.sprint}</td><td>{r.tasks}</td><td>{r.bugs}</td><td>{r.velocity}</td><td>{r.cycle}</td><td>{r.ai}</td></tr>))}</tbody></table>
        </div>
        <div className="card"><div className="card-title">Commit Activity</div>
          <div className="heatmap-grid">{heatmap.map((lv,i)=>(<div key={i} className="heatmap-cell" data-level={lv}><span className="heatmap-tooltip">Day {i+1}: {lv*4} commits</span></div>))}</div>
          <div className="heatmap-legend"><span>Less</span>{[0,1,2,3,4].map(l=><div key={l} className="heatmap-legend-cell" style={{background:`var(--heatmap-${l})`}}/>)}<span>More</span></div>
        </div>
      </div>
    </div>
  );
}
