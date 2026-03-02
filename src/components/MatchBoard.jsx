import { useState, useRef, useCallback, useEffect } from 'react'

const FM = {
  '4-4-2':[{x:50,y:92},{x:18,y:74},{x:40,y:76},{x:60,y:76},{x:82,y:74},{x:18,y:52},{x:40,y:54},{x:60,y:54},{x:82,y:52},{x:37,y:30},{x:63,y:30}],
  '4-3-3':[{x:50,y:92},{x:18,y:74},{x:40,y:76},{x:60,y:76},{x:82,y:74},{x:30,y:52},{x:50,y:56},{x:70,y:52},{x:20,y:28},{x:50,y:24},{x:80,y:28}],
  '3-5-2':[{x:50,y:92},{x:30,y:76},{x:50,y:78},{x:70,y:76},{x:10,y:52},{x:32,y:50},{x:50,y:53},{x:68,y:50},{x:90,y:52},{x:38,y:27},{x:62,y:27}],
  '4-2-3-1':[{x:50,y:92},{x:18,y:74},{x:40,y:76},{x:60,y:76},{x:82,y:74},{x:38,y:56},{x:62,y:56},{x:22,y:38},{x:50,y:36},{x:78,y:38},{x:50,y:22}],
  '3-4-3':[{x:50,y:92},{x:30,y:76},{x:50,y:78},{x:70,y:76},{x:18,y:52},{x:40,y:54},{x:60,y:54},{x:82,y:52},{x:20,y:28},{x:50,y:24},{x:80,y:28}],
}
const DN=['GK','DD','DC','DC','DG','MD','MC','MC','MG','AT','AT']
const COLS=[{id:'gold',bg:'#c9a227',t:'#0a0908'},{id:'white',bg:'#ffffff',t:'#0a0908'},{id:'red',bg:'#dc2626',t:'#ffffff'},{id:'blue',bg:'#2563eb',t:'#ffffff'},{id:'green',bg:'#16a34a',t:'#ffffff'},{id:'black',bg:'#1a1916',t:'#f5f2eb'},{id:'orange',bg:'#ea580c',t:'#ffffff'},{id:'purple',bg:'#7c3aed',t:'#ffffff'},{id:'cyan',bg:'#06b6d4',t:'#0a0908'},{id:'pink',bg:'#ec4899',t:'#ffffff'},{id:'yellow',bg:'#eab308',t:'#0a0908'},{id:'brown',bg:'#92400e',t:'#ffffff'}]
const ZC=[{id:'red',fill:'rgba(220,38,38,0.18)',stroke:'rgba(220,38,38,0.55)',txt:'rgba(220,38,38,0.9)'},{id:'blue',fill:'rgba(37,99,235,0.18)',stroke:'rgba(37,99,235,0.55)',txt:'rgba(37,99,235,0.9)'},{id:'yellow',fill:'rgba(234,179,8,0.20)',stroke:'rgba(234,179,8,0.55)',txt:'rgba(234,179,8,0.95)'},{id:'orange',fill:'rgba(234,88,12,0.18)',stroke:'rgba(234,88,12,0.55)',txt:'rgba(234,88,12,0.9)'},{id:'green',fill:'rgba(22,163,74,0.18)',stroke:'rgba(22,163,74,0.55)',txt:'rgba(22,163,74,0.9)'},{id:'purple',fill:'rgba(124,58,237,0.18)',stroke:'rgba(124,58,237,0.55)',txt:'rgba(124,58,237,0.9)'}]

const BND={xMin:6,xMax:94,yMin:4,yMax:96}
const cz=(x,y,w,h)=>{const cw=Math.min(w,BND.xMax-BND.xMin),ch=Math.min(h,BND.yMax-BND.yMin);return{x:Math.max(BND.xMin,Math.min(BND.xMax-cw,x)),y:Math.max(BND.yMin,Math.min(BND.yMax-ch,y)),w:cw,h:ch}}

const PRESETS={'demi-espace-g':{label:'Demi-espace G',desc:'Half-space gauche',zones:[{x:19,y:4,w:14,h:92,c:'yellow',t:'DEMI-ESPACE'}]},'demi-espace-d':{label:'Demi-espace D',desc:'Half-space droit',zones:[{x:67,y:4,w:14,h:92,c:'yellow',t:'DEMI-ESPACE'}]},'demi-espaces':{label:'2 demi-espaces',desc:'Création entre les lignes',zones:[{x:19,y:4,w:14,h:92,c:'yellow',t:'DEMI-ESPACE'},{x:67,y:4,w:14,h:92,c:'yellow',t:'DEMI-ESPACE'}]},'canal-central':{label:'Canal central',desc:'Axe du jeu',zones:[{x:33,y:4,w:34,h:92,c:'blue',t:'AXE CENTRAL'}]},'couloirs':{label:'Couloirs',desc:'Appels + centres',zones:[{x:6,y:4,w:13,h:92,c:'green',t:'COULOIR'},{x:81,y:4,w:13,h:92,c:'green',t:'COULOIR'}]},'pressing-haut':{label:'Pressing haut',desc:'Récupération haute',zones:[{x:6,y:4,w:88,h:28,c:'red',t:'PRESSING'}]},'bloc-median':{label:'Bloc médian',desc:'Compacité milieu',zones:[{x:6,y:32,w:88,h:30,c:'orange',t:'BLOC MÉDIAN'}]},'bloc-bas':{label:'Bloc bas',desc:'Repli défensif',zones:[{x:6,y:64,w:88,h:32,c:'red',t:'BLOC BAS'}]},'desequilibre-g':{label:'Déséquilibre G',desc:'Côté faible gauche',zones:[{x:6,y:4,w:35,h:42,c:'orange',t:'DÉSÉQUILIBRE'}]},'desequilibre-d':{label:'Déséquilibre D',desc:'Côté faible droit',zones:[{x:59,y:4,w:35,h:42,c:'orange',t:'DÉSÉQUILIBRE'}]},'entre-lignes':{label:'Entre les lignes',desc:'Zone réception n°10',zones:[{x:22,y:30,w:56,h:18,c:'purple',t:'ENTRE LES LIGNES'}]},'zone-14':{label:'Zone 14',desc:'Zone dangereuse',zones:[{x:22,y:16,w:56,h:16,c:'red',t:'ZONE 14'}]}}

const PitchSVG=()=>(<svg viewBox="0 0 680 1050" style={{position:'absolute',inset:0,width:'100%',height:'100%'}} preserveAspectRatio="xMidYMid meet">{Array.from({length:12}).map((_,i)=><rect key={i} x="0" y={i*87.5} width="680" height="87.5" fill={i%2===0?'#2d8544':'#2a7f40'}/>)}<rect x="40" y="40" width="600" height="970" fill="none" stroke="rgba(255,255,255,0.65)" strokeWidth="2.5"/><line x1="40" y1="525" x2="640" y2="525" stroke="rgba(255,255,255,0.65)" strokeWidth="2.5"/><circle cx="340" cy="525" r="91.5" fill="none" stroke="rgba(255,255,255,0.65)" strokeWidth="2.5"/><circle cx="340" cy="525" r="4" fill="rgba(255,255,255,0.65)"/><rect x="138.4" y="40" width="403.2" height="165" fill="none" stroke="rgba(255,255,255,0.65)" strokeWidth="2.5"/><rect x="248.4" y="40" width="183.2" height="55" fill="none" stroke="rgba(255,255,255,0.65)" strokeWidth="2.5"/><circle cx="340" cy="150" r="4" fill="rgba(255,255,255,0.65)"/><path d="M 266.8 205 A 91.5 91.5 0 0 0 413.2 205" fill="none" stroke="rgba(255,255,255,0.65)" strokeWidth="2.5"/><rect x="138.4" y="845" width="403.2" height="165" fill="none" stroke="rgba(255,255,255,0.65)" strokeWidth="2.5"/><rect x="248.4" y="955" width="183.2" height="55" fill="none" stroke="rgba(255,255,255,0.65)" strokeWidth="2.5"/><circle cx="340" cy="900" r="4" fill="rgba(255,255,255,0.65)"/><path d="M 266.8 845 A 91.5 91.5 0 0 1 413.2 845" fill="none" stroke="rgba(255,255,255,0.65)" strokeWidth="2.5"/><rect x="303.4" y="16" width="73.2" height="24" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="2" strokeDasharray="6,4"/><rect x="303.4" y="1010" width="73.2" height="24" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="2" strokeDasharray="6,4"/><path d="M 40 50 A 10 10 0 0 1 50 40" fill="none" stroke="rgba(255,255,255,0.65)" strokeWidth="2.5"/><path d="M 630 40 A 10 10 0 0 1 640 50" fill="none" stroke="rgba(255,255,255,0.65)" strokeWidth="2.5"/><path d="M 50 1010 A 10 10 0 0 1 40 1000" fill="none" stroke="rgba(255,255,255,0.65)" strokeWidth="2.5"/><path d="M 640 1000 A 10 10 0 0 1 630 1010" fill="none" stroke="rgba(255,255,255,0.65)" strokeWidth="2.5"/></svg>)

export default function MatchBoard(){
  const pitchRef=useRef(null)
  const F="'JetBrains Mono',monospace"
  const act=useRef({type:null,d:null})
  const lastTap=useRef({id:null,time:0})
  const[,tick]=useState(0)
  const bump=()=>tick(n=>n+1)

  const[hCol,setHCol]=useState(COLS[0])
  const[aCol,setACol]=useState(COLS[5])
  const[showHCP,setShowHCP]=useState(false)
  const[showACP,setShowACP]=useState(false)
  const[pl,setPl]=useState(()=>FM['4-4-2'].map((p,i)=>({id:'h'+i,tm:'home',n:i+1,nm:DN[i],x:p.x,y:p.y})))
  const[aw,setAw]=useState(()=>FM['4-4-2'].map((p,i)=>({id:'a'+i,tm:'away',n:i+1,nm:'',x:100-p.x,y:100-p.y})))
  const[fm,setFm]=useState('4-4-2')
  const[afm,setAfm]=useState('4-4-2')
  const[shA,setShA]=useState(false)
  const[arrows,setArrows]=useState([])
  const[tool,setTool]=useState('move')
  const[mob,setMob]=useState(()=>typeof window!=='undefined'&&window.innerWidth<768)
  const[zones,setZones]=useState([])
  const[azc,setAzc]=useState(ZC[0])
  const[shZP,setShZP]=useState(false)
  const[shZCP,setShZCP]=useState(false)
  const[sel,setSel]=useState(null)
  const[eP,setEP]=useState(null)
  const[eV,setEV]=useState('')
  const[eZ,setEZ]=useState(null)
  const[ezV,setEzV]=useState('')

  useEffect(()=>{const c=()=>setMob(window.innerWidth<768);window.addEventListener('resize',c);return()=>window.removeEventListener('resize',c)},[])
  useEffect(()=>{const c=()=>{setShowHCP(false);setShowACP(false);setShZCP(false)};if(showHCP||showACP||shZCP)setTimeout(()=>document.addEventListener('click',c,{once:true}),0)},[showHCP,showACP,shZCP])

  const gp=useCallback(e=>{
    if(!pitchRef.current)return{x:0,y:0}
    const r=pitchRef.current.getBoundingClientRect()
    return{x:Math.max(0,Math.min(100,((e.clientX-r.left)/r.width)*100)),y:Math.max(0,Math.min(100,((e.clientY-r.top)/r.height)*100))}
  },[])

  /* Double-tap detection for zone selection */
  const checkDoubleTap=(zoneId)=>{
    const now=Date.now()
    if(lastTap.current.id===zoneId && now-lastTap.current.time<400){
      lastTap.current={id:null,time:0}
      return true
    }
    lastTap.current={id:zoneId,time:now}
    return false
  }

  const onPlDown=useCallback((e,p)=>{
    if(tool!=='move')return
    e.preventDefault();e.stopPropagation()
    e.target.setPointerCapture(e.pointerId)
    setSel(null)
    const pos=gp(e)
    act.current={type:'player',d:{id:p.id,tm:p.tm,ox:pos.x-p.x,oy:pos.y-p.y}}
  },[tool,gp])

  /* Zone hitbox tap — detect double-tap to select */
  const onZoneHitDown=useCallback((e,z)=>{
    if(tool!=='move')return
    e.stopPropagation()
    if(checkDoubleTap(z.id)){
      e.preventDefault()
      setSel(z.id)
    }
  },[tool])

  const onSelZDown=useCallback((e,z)=>{
    e.preventDefault();e.stopPropagation()
    e.target.setPointerCapture(e.pointerId)
    const pos=gp(e)
    act.current={type:'zdrag',d:{id:z.id,ox:pos.x-z.x,oy:pos.y-z.y}}
  },[gp])

  const onRszDown=useCallback((e,z,corner)=>{
    e.preventDefault();e.stopPropagation()
    e.target.setPointerCapture(e.pointerId)
    const pos=gp(e)
    act.current={type:'zrsz',d:{id:z.id,corner,sx:pos.x,sy:pos.y,ox:z.x,oy:z.y,ow:z.w,oh:z.h}}
  },[gp])

  const onPitchDown=useCallback(e=>{
    const pos=gp(e)
    if(tool==='move'){setSel(null);return}
    if(tool==='arrow'){act.current={type:'arrow',d:{sx:pos.x,sy:pos.y,ex:pos.x,ey:pos.y}};bump()}
    if(tool==='zone'){setSel(null);act.current={type:'zdraw',d:{sx:pos.x,sy:pos.y,ex:pos.x,ey:pos.y}};bump()}
  },[tool,gp])

  const onPitchMove=useCallback(e=>{
    const a=act.current
    if(!a.type)return
    e.preventDefault()
    const pos=gp(e)
    if(a.type==='player'){
      const s=a.d.tm==='home'?setPl:setAw
      s(prev=>prev.map(p=>p.id===a.d.id?{...p,x:Math.max(2,Math.min(98,pos.x-a.d.ox)),y:Math.max(2,Math.min(98,pos.y-a.d.oy))}:p))
    }else if(a.type==='arrow'){a.d.ex=pos.x;a.d.ey=pos.y;bump()
    }else if(a.type==='zdraw'){a.d.ex=pos.x;a.d.ey=pos.y;bump()
    }else if(a.type==='zdrag'){
      setZones(prev=>prev.map(z=>{if(z.id!==a.d.id)return z;const c=cz(pos.x-a.d.ox,pos.y-a.d.oy,z.w,z.h);return{...z,x:c.x,y:c.y}}))
    }else if(a.type==='zrsz'){
      const g=a.d,dx=pos.x-g.sx,dy=pos.y-g.sy
      let x=g.ox,y=g.oy,w=g.ow,h=g.oh
      if(g.corner==='br'){w=g.ow+dx;h=g.oh+dy}
      else if(g.corner==='bl'){x=g.ox+dx;w=g.ow-dx;h=g.oh+dy}
      else if(g.corner==='tr'){w=g.ow+dx;y=g.oy+dy;h=g.oh-dy}
      else{x=g.ox+dx;w=g.ow-dx;y=g.oy+dy;h=g.oh-dy}
      w=Math.max(5,w);h=Math.max(4,h)
      const c=cz(x,y,w,h)
      setZones(prev=>prev.map(z=>z.id===g.id?{...z,...c}:z))
    }
  },[gp])

  const onPitchUp=useCallback(e=>{
    const a=act.current
    if(a.type==='arrow'&&a.d){if(Math.hypot(a.d.ex-a.d.sx,a.d.ey-a.d.sy)>2)setArrows(prev=>[...prev,{id:Date.now(),sx:a.d.sx,sy:a.d.sy,ex:a.d.ex,ey:a.d.ey}])}
    if(a.type==='zdraw'&&a.d){
      let x=Math.min(a.d.sx,a.d.ex),y=Math.min(a.d.sy,a.d.ey),w=Math.abs(a.d.ex-a.d.sx),h=Math.abs(a.d.ey-a.d.sy)
      if(w>3&&h>3){const c=cz(x,y,w,h);setZones(prev=>[...prev,{id:Date.now(),...c,fill:azc.fill,stroke:azc.stroke,txt:azc.txt,label:'',type:'free'}])}
    }
    act.current={type:null,d:null};bump()
  },[azc])

  const addPreset=key=>{const p=PRESETS[key];if(!p)return;const nz=p.zones.map((z,i)=>{const c=ZC.find(x=>x.id===z.c)||ZC[0];const cl=cz(z.x,z.y,z.w,z.h);return{id:Date.now()+i,...cl,fill:c.fill,stroke:c.stroke,txt:c.txt,label:z.t||'',type:key}});setZones(a=>[...a,...nz]);setShZP(false)}
  const applyF=(key,tm)=>{const f=FM[key];if(!f)return;if(tm==='home'){setFm(key);setPl(p=>p.map((x,i)=>({...x,x:f[i]?f[i].x:x.x,y:f[i]?f[i].y:x.y})))}else{setAfm(key);setAw(p=>p.map((x,i)=>({...x,x:f[i]?100-f[i].x:x.x,y:f[i]?100-f[i].y:x.y})))}}
  const confirmEP=()=>{if(!eP)return;const s=eP.startsWith('h')?setPl:setAw;s(p=>p.map(x=>x.id===eP?{...x,nm:eV}:x));setEP(null);setEV('')}
  const confirmEZ=()=>{if(!eZ)return;setZones(p=>p.map(z=>z.id===eZ?{...z,label:ezV}:z));setEZ(null);setEzV('')}
  const resetAll=()=>{setPl(FM['4-4-2'].map((p,i)=>({id:'h'+i,tm:'home',n:i+1,nm:DN[i],x:p.x,y:p.y})));setAw(FM['4-4-2'].map((p,i)=>({id:'a'+i,tm:'away',n:i+1,nm:'',x:100-p.x,y:100-p.y})));setFm('4-4-2');setAfm('4-4-2');setArrows([]);setZones([]);setShA(false);setSel(null);setHCol(COLS[0]);setACol(COLS[5]);act.current={type:null,d:null}}

  const CPick=({cur,onChange,onClose})=>(<div onClick={e=>e.stopPropagation()} style={{position:'absolute',top:'100%',left:0,zIndex:200,marginTop:4,padding:8,background:'#0a0908',border:'1px solid rgba(255,255,255,0.12)',display:'grid',gridTemplateColumns:'repeat(6,1fr)',gap:4,boxShadow:'0 8px 24px rgba(0,0,0,0.6)'}}>{COLS.map(c=><button key={c.id} onClick={()=>{onChange(c);onClose()}} style={{width:26,height:26,borderRadius:'50%',background:c.bg,border:cur.id===c.id?'2.5px solid #c9a227':'2px solid rgba(255,255,255,0.08)',cursor:'pointer'}}/>)}</div>)

  const hs=mob?22:16
  const tbS=a=>({padding:mob?'6px 10px':'7px 14px',background:a?'#c9a227':'transparent',border:a?'none':'1px solid rgba(255,255,255,0.10)',color:a?'#0a0908':'rgba(245,242,235,0.55)',fontFamily:F,fontSize:mob?9:10,letterSpacing:'.08em',textTransform:'uppercase',cursor:'pointer',fontWeight:a?700:400,borderRadius:0})
  const fS=a=>({padding:'4px 10px',background:a?'rgba(201,162,39,0.12)':'transparent',border:'1px solid '+(a?'rgba(201,162,39,0.35)':'rgba(255,255,255,0.07)'),color:a?'#c9a227':'rgba(245,242,235,0.40)',fontFamily:F,fontSize:10,cursor:'pointer'})

  const all=shA?[...pl,...aw]:pl
  const a=act.current

  /* ═══ TOOLBAR ═══ */
  const Toolbar=()=>(
    <div style={{display:'flex',flexWrap:'wrap',gap:mob?4:6,padding:mob?'10px 14px':'12px 16px',background:'#0a0908',alignItems:'center'}}>
      <button style={tbS(tool==='move')} onClick={()=>{setTool('move');setShZP(false)}}>✋ Déplacer</button>
      <button style={tbS(tool==='arrow')} onClick={()=>{setTool('arrow');setShZP(false);setSel(null)}}>➡ Flèche</button>
      <button style={tbS(tool==='zone')} onClick={()=>{setTool('zone');setShZP(!shZP);setSel(null)}}>▧ Zone</button>
      <button style={tbS(false)} onClick={()=>{setArrows([]);setZones([]);setSel(null)}}>🗑</button>
      <div style={{flex:1}}/>
      <button style={{...tbS(shA),borderColor:shA?'rgba(201,162,39,0.3)':undefined}} onClick={()=>setShA(!shA)}>{shA?'👥':'👤'}</button>
    </div>
  )

  /* ═══ ZONE PANEL ═══ */
  const ZonePanel=()=>shZP?(
    <div style={{padding:'12px 14px',background:'#0d0c0a',borderTop:'1px solid rgba(255,255,255,0.05)'}}>
      <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:10}}>
        <div style={{position:'relative'}}>
          <button onClick={e=>{e.stopPropagation();setShZCP(!shZCP)}} style={{width:22,height:22,borderRadius:4,background:azc.stroke.replace('0.55','0.85'),border:'2px solid rgba(255,255,255,0.15)',cursor:'pointer'}}/>
          {shZCP&&(<div onClick={e=>e.stopPropagation()} style={{position:'absolute',top:'100%',left:0,zIndex:200,marginTop:4,padding:8,background:'#0a0908',border:'1px solid rgba(255,255,255,0.12)',display:'flex',gap:4,boxShadow:'0 8px 24px rgba(0,0,0,0.6)'}}>{ZC.map(c=><button key={c.id} onClick={()=>{setAzc(c);setShZCP(false)}} style={{width:26,height:26,borderRadius:4,background:c.stroke.replace('0.55','0.85'),border:azc.id===c.id?'2.5px solid #c9a227':'2px solid rgba(255,255,255,0.08)',cursor:'pointer'}}/>)}</div>)}
        </div>
        <span style={{fontFamily:F,fontSize:9,color:'rgba(245,242,235,0.40)',letterSpacing:'.06em',textTransform:'uppercase'}}>Dessinez ou choisissez :</span>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:4}}>
        {Object.entries(PRESETS).map(([k,p])=>(<button key={k} onClick={()=>addPreset(k)} style={{padding:'7px 10px',background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.07)',cursor:'pointer',textAlign:'left'}} onMouseEnter={e=>{e.currentTarget.style.borderColor='rgba(201,162,39,0.3)';e.currentTarget.style.background='rgba(201,162,39,0.05)'}} onMouseLeave={e=>{e.currentTarget.style.borderColor='rgba(255,255,255,0.07)';e.currentTarget.style.background='rgba(255,255,255,0.03)'}}><div style={{fontFamily:F,fontSize:9,color:'#c9a227',letterSpacing:'.04em',marginBottom:2}}>{p.label}</div><div style={{fontFamily:F,fontSize:8,color:'rgba(245,242,235,0.25)'}}>{p.desc}</div></button>))}
      </div>
    </div>
  ):null

  /* ═══ FORMATIONS BAR ═══ */
  const FormBar=()=>(<>
    <div style={{display:'flex',flexWrap:'wrap',gap:4,padding:'8px 14px',background:'#0a0908',borderTop:'1px solid rgba(255,255,255,0.05)',alignItems:'center'}}>
      <div style={{position:'relative'}}><button onClick={e=>{e.stopPropagation();setShowHCP(!showHCP);setShowACP(false)}} style={{width:20,height:20,borderRadius:'50%',background:hCol.bg,border:'2px solid rgba(255,255,255,0.2)',cursor:'pointer',marginRight:6}}/>{showHCP&&<CPick cur={hCol} onChange={setHCol} onClose={()=>setShowHCP(false)}/>}</div>
      <span style={{fontSize:9,letterSpacing:'.12em',textTransform:'uppercase',color:'rgba(245,242,235,0.30)',marginRight:4,fontFamily:F}}>Dom</span>
      {Object.keys(FM).map(k=><button key={k} style={fS(fm===k)} onClick={()=>applyF(k,'home')}>{k}</button>)}
    </div>
    {shA&&(<div style={{display:'flex',flexWrap:'wrap',gap:4,padding:'8px 14px',background:'#0a0908',borderTop:'1px solid rgba(255,255,255,0.05)',alignItems:'center'}}>
      <div style={{position:'relative'}}><button onClick={e=>{e.stopPropagation();setShowACP(!showACP);setShowHCP(false)}} style={{width:20,height:20,borderRadius:'50%',background:aCol.bg,border:'2px solid rgba(255,255,255,0.2)',cursor:'pointer',marginRight:6}}/>{showACP&&<CPick cur={aCol} onChange={setACol} onClose={()=>setShowACP(false)}/>}</div>
      <span style={{fontSize:9,letterSpacing:'.12em',textTransform:'uppercase',color:'rgba(245,242,235,0.30)',marginRight:4,fontFamily:F}}>Ext</span>
      {Object.keys(FM).map(k=><button key={'a'+k} style={fS(afm===k)} onClick={()=>applyF(k,'away')}>{k}</button>)}
    </div>)}
  </>)

  /* ═══ ACTIONS BAR ═══ */
  const ActionsBar=()=>(
    <div style={{display:'flex',gap:6,padding:'12px 14px',background:'#0a0908',borderTop:'1px solid rgba(255,255,255,0.05)'}}>
      <button onClick={async()=>{setSel(null);await new Promise(r=>setTimeout(r,50));try{const{default:h2c}=await import('https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.esm.js');const c=await h2c(pitchRef.current,{backgroundColor:'#1a1916',scale:2,useCORS:true});const l=document.createElement('a');l.download='insightball-matchboard-'+Date.now()+'.png';l.href=c.toDataURL('image/png');l.click()}catch(e){alert('Réessayez')}}} style={{padding:'9px 20px',background:'#c9a227',border:'none',color:'#0a0908',fontFamily:F,fontSize:10,letterSpacing:'.1em',textTransform:'uppercase',fontWeight:700,cursor:'pointer'}}>📸 Exporter PNG</button>
      <button onClick={resetAll} style={{padding:'9px 20px',background:'transparent',border:'1px solid rgba(255,255,255,0.10)',color:'rgba(245,242,235,0.5)',fontFamily:F,fontSize:10,letterSpacing:'.1em',textTransform:'uppercase',cursor:'pointer'}}>↺ Reset</button>
    </div>
  )

  /* ═══ PITCH AREA ═══ */
  const PitchArea=()=>(
    <div ref={pitchRef} style={{position:'relative',width:'100%',paddingBottom:'154.4%',overflow:'hidden',cursor:tool==='arrow'||tool==='zone'?'crosshair':'default',touchAction:'none',userSelect:'none',borderRadius:mob?0:4}}
      onPointerDown={onPitchDown} onPointerMove={onPitchMove} onPointerUp={onPitchUp} onPointerCancel={()=>{act.current={type:null,d:null};bump()}}>
      <div style={{position:'absolute',inset:0}}>
        <PitchSVG/>

        {zones.map(z=>{const isSel=sel===z.id;return(<div key={z.id}>
          <div style={{position:'absolute',left:z.x+'%',top:z.y+'%',width:z.w+'%',height:z.h+'%',background:z.fill,border:isSel?'3px solid '+z.stroke.replace('0.55','0.9'):'2px dashed '+z.stroke,borderRadius:2,zIndex:3,pointerEvents:'none',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:isSel?'0 0 0 3px '+z.stroke.replace('0.55','0.2'):'none'}}>
            {eZ!==z.id&&z.label&&<span style={{fontFamily:F,fontSize:mob?7:10,fontWeight:700,color:z.txt||z.stroke,letterSpacing:'.1em',textTransform:'uppercase',textShadow:'0 1px 4px rgba(0,0,0,0.5)',padding:'0 4px',textAlign:'center',lineHeight:1.3,wordBreak:'break-word'}}>{z.label}</span>}
          </div>
          {eZ===z.id&&<div style={{position:'absolute',left:z.x+'%',top:z.y+'%',width:z.w+'%',height:z.h+'%',zIndex:25,display:'flex',alignItems:'center',justifyContent:'center'}}><input autoFocus value={ezV} onChange={e=>setEzV(e.target.value)} onBlur={confirmEZ} onKeyDown={e=>{if(e.key==='Enter')confirmEZ()}} style={{background:'rgba(0,0,0,0.7)',border:'1px solid '+z.stroke,color:'#f5f2eb',fontFamily:F,fontSize:mob?9:11,textAlign:'center',padding:'5px 12px',outline:'none',letterSpacing:'.08em',textTransform:'uppercase',width:'85%',maxWidth:200,borderRadius:3}}/></div>}
          {isSel&&<div style={{position:'absolute',left:z.x+'%',top:z.y+'%',width:z.w+'%',height:z.h+'%',zIndex:20,cursor:'grab'}} onPointerDown={e=>onSelZDown(e,z)}>
            <div style={{position:'absolute',top:-12,right:-12,width:mob?26:24,height:mob?26:24,borderRadius:'50%',background:'#dc2626',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',boxShadow:'0 2px 8px rgba(0,0,0,0.5)',border:'2px solid rgba(255,255,255,0.4)',zIndex:30}} onPointerDown={e=>{e.preventDefault();e.stopPropagation();setZones(p=>p.filter(q=>q.id!==z.id));setSel(null)}}><span style={{color:'#fff',fontSize:mob?14:13,fontWeight:700,lineHeight:1}}>✕</span></div>
            <div style={{position:'absolute',top:-12,left:-12,width:mob?26:24,height:mob?26:24,borderRadius:'50%',background:z.stroke.replace('0.55','0.85'),display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',boxShadow:'0 2px 8px rgba(0,0,0,0.5)',border:'2px solid rgba(255,255,255,0.4)',zIndex:30}} onPointerDown={e=>{e.preventDefault();e.stopPropagation();setEZ(z.id);setEzV(z.label)}}><span style={{color:'#fff',fontSize:mob?12:11,fontWeight:700,lineHeight:1}}>✎</span></div>
            {['tl','tr','bl','br'].map(c=>{const isT=c[0]==='t',isL=c[1]==='l';return<div key={c} style={{position:'absolute',...(isT?{top:-hs/2}:{bottom:-hs/2}),...(isL?{left:-hs/2}:{right:-hs/2}),width:hs,height:hs,background:z.stroke.replace('0.55','0.8'),border:'2px solid rgba(255,255,255,0.5)',borderRadius:3,cursor:(c==='tl'||c==='br')?'nwse-resize':'nesw-resize',zIndex:30,boxShadow:'0 1px 4px rgba(0,0,0,0.4)'}} onPointerDown={e=>onRszDown(e,z,c)}/>})}
          </div>}
          {!isSel&&tool==='move'&&<div style={{position:'absolute',left:z.x+'%',top:z.y+'%',width:z.w+'%',height:z.h+'%',zIndex:6,cursor:'pointer'}} onPointerDown={e=>onZoneHitDown(e,z)}/>}
        </div>)})}

        {a.type==='zdraw'&&a.d&&(()=>{let x=Math.min(a.d.sx,a.d.ex),y=Math.min(a.d.sy,a.d.ey),w=Math.abs(a.d.ex-a.d.sx),h=Math.abs(a.d.ey-a.d.sy);const c=cz(x,y,w,h);return<div style={{position:'absolute',left:c.x+'%',top:c.y+'%',width:c.w+'%',height:c.h+'%',background:azc.fill,border:'2px dashed '+azc.stroke,borderRadius:2,pointerEvents:'none',zIndex:5}}/>})()}

        <svg viewBox="0 0 100 100" style={{position:'absolute',inset:0,width:'100%',height:'100%',pointerEvents:'none'}} preserveAspectRatio="none">
          <defs><marker id="ah" markerWidth="4" markerHeight="3" refX="4" refY="1.5" orient="auto"><polygon points="0 0,4 1.5,0 3" fill="#c9a227"/></marker><marker id="ahd" markerWidth="4" markerHeight="3" refX="4" refY="1.5" orient="auto"><polygon points="0 0,4 1.5,0 3" fill="rgba(201,162,39,0.5)"/></marker></defs>
          {arrows.map(ar=><line key={ar.id} x1={ar.sx} y1={ar.sy} x2={ar.ex} y2={ar.ey} stroke="#c9a227" strokeWidth="0.5" strokeDasharray="1.2,0.6" markerEnd="url(#ah)"/>)}
          {a.type==='arrow'&&a.d&&<line x1={a.d.sx} y1={a.d.sy} x2={a.d.ex} y2={a.d.ey} stroke="rgba(201,162,39,0.5)" strokeWidth="0.5" strokeDasharray="1.2,0.6" markerEnd="url(#ahd)"/>}
        </svg>

        {all.map(p=>{const c=p.tm==='home'?hCol:aCol;const isDr=a.type==='player'&&a.d&&a.d.id===p.id;const isEd=eP===p.id;return(
          <div key={p.id} style={{position:'absolute',left:p.x+'%',top:p.y+'%',transform:'translate(-50%,-50%)',zIndex:isDr?100:10,cursor:tool==='move'?'grab':'default',touchAction:'none',userSelect:'none'}} onPointerDown={e=>onPlDown(e,p)} onDoubleClick={()=>{setEP(p.id);setEV(p.nm)}}>
            <div style={{width:mob?28:32,height:mob?28:32,borderRadius:'50%',background:c.bg,border:'2.5px solid '+((['#ffffff','#eab308','#06b6d4'].indexOf(c.bg)>=0)?'rgba(0,0,0,0.15)':'rgba(255,255,255,0.25)'),display:'flex',alignItems:'center',justifyContent:'center',boxShadow:isDr?'0 4px 16px rgba(0,0,0,0.6)':'0 2px 6px rgba(0,0,0,0.35)',transform:isDr?'scale(1.15)':'scale(1)',transition:isDr?'none':'transform .12s'}}>
              <span style={{fontFamily:F,fontSize:mob?10:11,fontWeight:700,color:c.t,lineHeight:1}}>{p.n}</span>
            </div>
            {isEd?<input autoFocus value={eV} onChange={e=>setEV(e.target.value)} onBlur={confirmEP} onKeyDown={e=>e.key==='Enter'&&confirmEP()} style={{position:'absolute',top:'100%',left:'50%',transform:'translateX(-50%)',marginTop:2,width:64,padding:'3px 5px',background:'#0a0908',border:'1px solid #c9a227',color:'#f5f2eb',fontFamily:F,fontSize:9,textAlign:'center',outline:'none'}}/>
            :p.nm&&<div style={{position:'absolute',top:'100%',left:'50%',transform:'translateX(-50%)',marginTop:1,background:'rgba(0,0,0,0.65)',padding:'1px 6px',whiteSpace:'nowrap',borderRadius:2}}><span style={{fontFamily:F,fontSize:mob?7:8,color:'rgba(255,255,255,0.85)',letterSpacing:'.04em'}}>{p.nm}</span></div>}
          </div>
        )})}
      </div>
    </div>
  )

  /* ═══ LAYOUT ═══ */
  if(mob){
    // Mobile : vertical stack
    return(<div style={{fontFamily:F,background:'#0a0908',width:'100%'}}>
      <Toolbar/>
      <ZonePanel/>
      <FormBar/>
      <PitchArea/>
      <ActionsBar/>
      <div style={{padding:'8px 14px',background:'#0a0908'}}><span style={{fontFamily:F,fontSize:7,color:'rgba(245,242,235,0.22)',letterSpacing:'.06em'}}>Double-tap zone → sélectionner · Tap terrain → désélectionner</span></div>
    </div>)
  }

  // Desktop : terrain à gauche (large), panneau contrôles à droite
  return(<div style={{fontFamily:F,background:'#0a0908',width:'100%',display:'flex',gap:0,minHeight:'calc(100vh - 80px)'}}>
    {/* Pitch — takes most space */}
    <div style={{flex:1,minWidth:0,display:'flex',alignItems:'flex-start',justifyContent:'center',padding:'16px 16px 16px 0'}}>
      <div style={{width:'100%',maxWidth:520}}>
        <PitchArea/>
      </div>
    </div>

    {/* Controls panel — fixed width right */}
    <div style={{width:280,flexShrink:0,background:'#0a0908',borderLeft:'1px solid rgba(255,255,255,0.05)',overflowY:'auto',maxHeight:'calc(100vh - 80px)'}}>
      <Toolbar/>
      <ZonePanel/>
      <FormBar/>
      <ActionsBar/>
      <div style={{padding:'10px 14px',borderTop:'1px solid rgba(255,255,255,0.05)'}}><span style={{fontFamily:F,fontSize:8,color:'rgba(245,242,235,0.22)',letterSpacing:'.06em'}}>Double-clic zone → sélectionner · Clic terrain → désélectionner</span></div>
    </div>
  </div>)
}
