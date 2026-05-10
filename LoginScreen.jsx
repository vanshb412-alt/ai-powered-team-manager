import React, { useState, useEffect } from 'react';

export default function LoginScreen({ onLogin }) {
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => { setTimeout(() => setShow(true), 50); }, []);

  const handleSign = () => {
    if (!email || !pass) return;
    setLoading(true);
    setTimeout(() => { setLoading(false); onLogin(email, pass); }, 800);
  };

  return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'var(--bg)',padding:24}}>
      <div style={{
        background:'var(--surface)',border:'0.5px solid var(--border)',borderRadius:16,
        padding:40,maxWidth:420,width:'100%',boxShadow:'0 2px 12px rgba(83,74,183,0.08)',
        transform:show?'translateY(0)':'translateY(30px)',opacity:show?1:0,
        transition:'all 0.5s cubic-bezier(0.34,1.56,0.64,1)'
      }}>
        <div style={{textAlign:'center',marginBottom:24}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:8,marginBottom:8}}>
            <div style={{width:10,height:10,borderRadius:'50%',background:'#534AB7'}}/>
            <span style={{fontSize:24,fontWeight:600}}>Synapse</span>
            <span style={{fontSize:13,color:'var(--text-muted)'}}>AI Team OS</span>
          </div>
          <div style={{fontSize:14,color:'var(--text-muted)'}}>Manage smarter. Ship faster.</div>
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:12}}>
          <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Enter your email"
            style={{width:'100%',padding:'12px 16px',borderRadius:12,border:'0.5px solid var(--border)',fontSize:14,fontFamily:'inherit',background:'var(--bg)',color:'var(--text)',outline:'none',transition:'border-color 0.2s',opacity:show?1:0,transform:show?'translateY(0)':'translateY(8px)',transitionDelay:'0.08s'}}
            onFocus={e=>e.target.style.borderColor='#534AB7'} onBlur={e=>e.target.style.borderColor='var(--border)'}/>
          <div style={{position:'relative',opacity:show?1:0,transform:show?'translateY(0)':'translateY(8px)',transition:'all 0.3s ease 0.16s'}}>
            <input value={pass} onChange={e=>setPass(e.target.value)} placeholder="Enter your password"
              type={showPass?'text':'password'}
              style={{width:'100%',padding:'12px 16px',paddingRight:44,borderRadius:12,border:'0.5px solid var(--border)',fontSize:14,fontFamily:'inherit',background:'var(--bg)',color:'var(--text)',outline:'none',transition:'border-color 0.2s'}}
              onFocus={e=>e.target.style.borderColor='#534AB7'} onBlur={e=>e.target.style.borderColor='var(--border)'}/>
            <button onClick={()=>setShowPass(p=>!p)} style={{position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',color:'var(--text-muted)',cursor:'pointer',fontSize:16}}>{showPass?'🙈':'👁'}</button>
          </div>
          <button onClick={handleSign} disabled={loading} style={{
            width:'100%',padding:'14px',borderRadius:12,border:'none',background:'#534AB7',color:'white',fontSize:14,fontWeight:600,fontFamily:'inherit',cursor:'pointer',transition:'all 0.2s',opacity:show?1:0,transform:show?'translateY(0)':'translateY(8px)',transitionDelay:'0.24s',display:'flex',alignItems:'center',justifyContent:'center',gap:8
          }}>
            {loading ? <div className="toast-spinner" style={{borderTopColor:'white',borderColor:'rgba(255,255,255,0.3)'}}/> : 'Sign In'}
          </button>
          <div style={{display:'flex',alignItems:'center',gap:12,margin:'4px 0'}}>
            <div style={{flex:1,height:0.5,background:'var(--border)'}}/> 
            <span style={{fontSize:12,color:'var(--text-muted)'}}>or</span>
            <div style={{flex:1,height:0.5,background:'var(--border)'}}/>
          </div>
          <button onClick={()=>onLogin('guest','')} style={{background:'none',border:'none',color:'var(--text-muted)',fontSize:13,fontFamily:'inherit',cursor:'pointer',padding:8,transition:'color 0.2s'}}>Continue as Guest</button>
        </div>
        <div style={{textAlign:'center',marginTop:16,fontSize:13,color:'var(--text-muted)'}}>
          Don't have an account? <span style={{color:'#534AB7',cursor:'pointer',fontWeight:500}} onClick={()=>onLogin('guest','')}>Get started</span>
        </div>
        <div style={{marginTop:20,padding:12,borderRadius:8,background:'var(--bg)',border:'0.5px solid var(--border)',textAlign:'center',fontSize:12,color:'var(--text-muted)'}}>
          Demo: <strong>vansh@synapse.ai</strong> · password: <strong>synapse123</strong>
        </div>
      </div>
    </div>
  );
}
