import { useState, useMemo } from "react"
import DashboardLayout from '../components/DashboardLayout'
import { T, globalStyles } from '../theme'

const G = {
  bg: '#f5f2eb', surface: '#ffffff', dark: '#0a0908', dark2: '#0f0e0c',
  ink: '#1a1916', ink2: '#2d2c2a', muted: 'rgba(26,25,22,0.45)',
  gold: '#c9a227', goldD: '#a8861f', goldBg: 'rgba(201,162,39,0.07)', goldBdr: 'rgba(201,162,39,0.22)',
  rule: 'rgba(26,25,22,0.09)',
  green: '#16a34a', red: '#dc2626', blue: '#2563eb', orange: '#d97706',
  mono: "'JetBrains Mono', monospace",
  display: "'Anton', sans-serif",
}

/* ═══ TERRAIN SVG ═══ */
function PitchSVG({ width = 280, height = 200, elements = [], zone = 'full' }) {
  const pw = 100; const ph = zone === 'quarter' ? 40 : zone === 'half' ? 65 : 100
  return (
    <svg viewBox={`0 0 ${pw} ${ph}`} width={width} height={height} style={{ background: '#2d5a27', borderRadius: 2, display: 'block' }}>
      <rect x="2" y="2" width={pw-4} height={ph-4} rx="1" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="0.5"/>
      {zone==='full'&&<line x1="2" y1={ph/2} x2={pw-2} y2={ph/2} stroke="rgba(255,255,255,0.25)" strokeWidth="0.4"/>}
      {zone==='full'&&<circle cx={pw/2} cy={ph/2} r="8" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="0.4"/>}
      <rect x={pw/2-18} y={ph-2-14} width="36" height="14" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="0.4"/>
      <rect x={pw/2-8} y={ph-2-5} width="16" height="5" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.3"/>
      {zone==='full'&&<><rect x={pw/2-18} y="2" width="36" height="14" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="0.4"/><rect x={pw/2-8} y="2" width="16" height="5" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.3"/></>}
      <defs>
        <marker id="ah" markerWidth="4" markerHeight="3" refX="3.5" refY="1.5" orient="auto"><polygon points="0,0 4,1.5 0,3" fill="rgba(255,255,255,0.7)"/></marker>
        <marker id="ahG" markerWidth="4" markerHeight="3" refX="3.5" refY="1.5" orient="auto"><polygon points="0,0 4,1.5 0,3" fill="#c9a227"/></marker>
        <marker id="ahB" markerWidth="4" markerHeight="3" refX="3.5" refY="1.5" orient="auto"><polygon points="0,0 4,1.5 0,3" fill="#60a5fa"/></marker>
      </defs>
      {elements.filter(e=>e.type==='zone').map((z,i)=><rect key={`z${i}`} x={z.x} y={z.y} width={z.w} height={z.h} fill={z.color||'rgba(201,162,39,0.15)'} stroke={z.stroke||'rgba(201,162,39,0.4)'} strokeWidth="0.4" strokeDasharray={z.dashed?"1.5,1":"none"} rx="0.5"/>)}
      {elements.filter(e=>e.type==='arrow').map((a,i)=><line key={`a${i}`} x1={a.x1} y1={a.y1} x2={a.x2} y2={a.y2} stroke={a.color||'rgba(255,255,255,0.6)'} strokeWidth={a.thick?"0.8":"0.5"} strokeDasharray={a.dashed?"1.5,1.5":"none"} markerEnd={`url(#${a.marker||'ah'})`}/>)}
      {elements.filter(e=>e.type==='player').map((p,i)=><g key={`p${i}`}><circle cx={p.x} cy={p.y} r={p.r||2.5} fill={p.color||'#c9a227'} stroke="rgba(255,255,255,0.8)" strokeWidth="0.4"/>{p.label&&<text x={p.x} y={p.y+0.8} textAnchor="middle" fill="#fff" fontSize="2.2" fontWeight="700" fontFamily="sans-serif">{p.label}</text>}</g>)}
      {elements.filter(e=>e.type==='cone').map((c,i)=><polygon key={`c${i}`} points={`${c.x},${c.y-1.2} ${c.x-1},${c.y+0.8} ${c.x+1},${c.y+0.8}`} fill={c.color||'#f59e0b'} stroke="rgba(0,0,0,0.3)" strokeWidth="0.2"/>)}
      {elements.filter(e=>e.type==='ball').map((b,i)=><circle key={`b${i}`} cx={b.x} cy={b.y} r="1.5" fill="#fff" stroke="#333" strokeWidth="0.3"/>)}
    </svg>
  )
}

/* ═══ DONNEES ═══ */
const PRINCIPES = {
  'Phase offensive':[
    {id:'po1',label:'Construction courte depuis le gardien',desc:'Relance au sol, circuits courts, patience'},
    {id:'po2',label:'Jeu en triangles côté fort',desc:'Combinaisons courtes latéral-milieu-ailier'},
    {id:'po3',label:'Appels en profondeur',desc:'Courses derrière la ligne défensive'},
    {id:'po4',label:'Jeu entre les lignes',desc:'Occupation des intervalles, décrochages'},
    {id:'po5',label:'Centres et occupation surface',desc:'Débordements + 3 joueurs zone finition'},
    {id:'po6',label:'Jeu de position',desc:'Supériorité numérique par zone, rotations'},
  ],
  'Phase défensive':[
    {id:'pd1',label:'Pressing haut à la perte',desc:'Contre-pressing immédiat dans les 5 secondes'},
    {id:'pd2',label:'Bloc médian compact',desc:'Lignes resserrées, 30m entre défense et attaque'},
    {id:'pd3',label:'Bloc bas organisé',desc:'Défense profonde, protection de la surface'},
    {id:'pd4',label:'Pressing orienté côté',desc:'Fermer le centre, pousser vers la touche'},
  ],
  'Transitions':[
    {id:'tr1',label:'Transition offensive rapide',desc:'Verticalité immédiate à la récupération'},
    {id:'tr2',label:'Transition offensive patiente',desc:'Sécuriser le ballon puis accélérer'},
    {id:'tr3',label:'Repli défensif immédiat',desc:'Course vers son but, replacements rapides'},
    {id:'tr4',label:'Contre-pressing',desc:'Récupération dans les 6 sec après la perte'},
  ],
  'Coups de pied arrêtés':[
    {id:'cpa1',label:'Corners offensifs travaillés',desc:'Schémas prédéfinis, mouvements coordonnés'},
    {id:'cpa2',label:'Coups francs indirects',desc:'Combinaisons courtes sur CF latéraux'},
    {id:'cpa3',label:'Défense de zone sur CPA',desc:'Placement zonal, responsabilités claires'},
  ],
}
const JOURS=[{id:'lundi',label:'Lun'},{id:'mardi',label:'Mar'},{id:'mercredi',label:'Mer'},{id:'jeudi',label:'Jeu'},{id:'vendredi',label:'Ven'},{id:'samedi',label:'Sam'},{id:'dimanche',label:'Dim'}]

const SEANCES=[
  {theme:'Pressing haut — déclencheurs',principe:'Pressing haut à la perte',blocs:[
    {nom:'Rondo 4v2',duree:'15min',desc:'4 joueurs conservent contre 2 au centre. 2 touches max. Transition à la perte.',
      pitch:{zone:'quarter',elements:[
        {type:'zone',x:15,y:5,w:30,h:30,color:'rgba(201,162,39,0.12)',stroke:'rgba(201,162,39,0.3)'},
        {type:'player',x:20,y:10,color:'#c9a227',label:'A'},{type:'player',x:40,y:10,color:'#c9a227',label:'B'},
        {type:'player',x:20,y:30,color:'#c9a227',label:'C'},{type:'player',x:40,y:30,color:'#c9a227',label:'D'},
        {type:'player',x:28,y:18,color:'#dc2626',label:'1'},{type:'player',x:33,y:23,color:'#dc2626',label:'2'},
        {type:'arrow',x1:20,y1:10,x2:38,y2:10,color:'#c9a227',marker:'ahG'},
        {type:'arrow',x1:28,y1:18,x2:23,y2:12,color:'#ef4444',dashed:true},
    ]}},
    {nom:'3v2 pressing sur relance GK',duree:'20min',desc:'GK relance vers 2 DC. 3 attaquants pressent pour récupérer en 6 sec.',
      pitch:{zone:'half',elements:[
        {type:'player',x:50,y:60,color:'#3b82f6',label:'GK',r:3},
        {type:'player',x:35,y:48,color:'#3b82f6',label:'DC'},{type:'player',x:65,y:48,color:'#3b82f6',label:'DC'},
        {type:'player',x:50,y:30,color:'#c9a227',label:'9'},{type:'player',x:30,y:25,color:'#c9a227',label:'7'},{type:'player',x:70,y:25,color:'#c9a227',label:'11'},
        {type:'arrow',x1:50,y1:30,x2:48,y2:46,color:'#c9a227',marker:'ahG',thick:true},
        {type:'arrow',x1:30,y1:25,x2:33,y2:46,color:'#c9a227',marker:'ahG'},
        {type:'arrow',x1:70,y1:25,x2:67,y2:46,color:'#c9a227',marker:'ahG'},
        {type:'arrow',x1:50,y1:60,x2:37,y2:50,color:'#60a5fa',dashed:true,marker:'ahB'},
        {type:'zone',x:20,y:38,w:60,h:27,color:'rgba(239,68,68,0.08)',stroke:'rgba(239,68,68,0.25)',dashed:true},
    ]}},
    {nom:'6v6 récup haute = bonus',duree:'25min',desc:'But normal = 1 pt. But dans les 8s après récup camp adverse = 3 pts.',
      pitch:{zone:'full',elements:[
        {type:'zone',x:10,y:5,w:80,h:42,color:'rgba(239,68,68,0.06)',stroke:'rgba(239,68,68,0.2)',dashed:true},
        {type:'player',x:50,y:15,color:'#c9a227'},{type:'player',x:30,y:25,color:'#c9a227'},{type:'player',x:70,y:25,color:'#c9a227'},
        {type:'player',x:40,y:38,color:'#c9a227'},{type:'player',x:60,y:38,color:'#c9a227'},{type:'player',x:50,y:48,color:'#c9a227'},
        {type:'player',x:50,y:55,color:'#3b82f6'},{type:'player',x:30,y:62,color:'#3b82f6'},{type:'player',x:70,y:62,color:'#3b82f6'},
        {type:'player',x:40,y:75,color:'#3b82f6'},{type:'player',x:60,y:75,color:'#3b82f6'},{type:'player',x:50,y:85,color:'#3b82f6'},
    ]}},
    {nom:'10v10 pressing déclenché',duree:'25min',desc:'Signal de pressing = passe arrière vers DC adverses. Bloc monte collectivement.',
      pitch:{zone:'full',elements:[
        {type:'zone',x:15,y:8,w:70,h:25,color:'rgba(201,162,39,0.1)',stroke:'rgba(201,162,39,0.3)',dashed:true},
        {type:'player',x:50,y:10,color:'#c9a227'},{type:'player',x:25,y:22,color:'#c9a227'},{type:'player',x:75,y:22,color:'#c9a227'},
        {type:'player',x:35,y:35,color:'#c9a227'},{type:'player',x:50,y:32,color:'#c9a227'},{type:'player',x:65,y:35,color:'#c9a227'},
        {type:'player',x:20,y:48,color:'#c9a227'},{type:'player',x:40,y:50,color:'#c9a227'},{type:'player',x:60,y:50,color:'#c9a227'},{type:'player',x:80,y:48,color:'#c9a227'},
        {type:'arrow',x1:35,y1:35,x2:35,y2:25,color:'#c9a227',marker:'ahG',thick:true},
        {type:'arrow',x1:65,y1:35,x2:65,y2:25,color:'#c9a227',marker:'ahG',thick:true},
    ]}},
  ]},
  {theme:'Construction courte + jeu entre les lignes',principe:'Construction courte depuis le gardien',blocs:[
    {nom:'Conservation 5v3',duree:'15min',desc:'2 touches, jouer vers l\'avant obligatoire. Rotation défenseurs toutes les 45s.',
      pitch:{zone:'quarter',elements:[
        {type:'zone',x:10,y:3,w:40,h:34,color:'rgba(201,162,39,0.1)'},
        {type:'player',x:15,y:8,color:'#c9a227'},{type:'player',x:45,y:8,color:'#c9a227'},
        {type:'player',x:15,y:32,color:'#c9a227'},{type:'player',x:45,y:32,color:'#c9a227'},{type:'player',x:30,y:20,color:'#c9a227'},
        {type:'player',x:25,y:15,color:'#dc2626'},{type:'player',x:35,y:25,color:'#dc2626'},{type:'player',x:28,y:30,color:'#dc2626'},
    ]}},
    {nom:'Sortie de balle GK → DC → milieu',duree:'20min',desc:'3 circuits travaillés : centre, droit, gauche. Opposition progressive.',
      pitch:{zone:'half',elements:[
        {type:'player',x:50,y:60,color:'#3b82f6',label:'GK',r:3},
        {type:'player',x:35,y:48,color:'#3b82f6',label:'DC'},{type:'player',x:65,y:48,color:'#3b82f6',label:'DC'},
        {type:'player',x:50,y:32,color:'#c9a227',label:'6'},{type:'player',x:20,y:35,color:'#c9a227',label:'LG'},{type:'player',x:80,y:35,color:'#c9a227',label:'LD'},
        {type:'arrow',x1:50,y1:58,x2:37,y2:50,color:'#60a5fa',marker:'ahB'},
        {type:'arrow',x1:35,y1:46,x2:48,y2:34,color:'#60a5fa',marker:'ahB'},
        {type:'arrow',x1:50,y1:58,x2:63,y2:50,color:'#60a5fa',dashed:true,marker:'ahB'},
        {type:'cone',x:50,y:25,color:'#f59e0b'},{type:'cone',x:20,y:25,color:'#f59e0b'},{type:'cone',x:80,y:25,color:'#f59e0b'},
    ]}},
    {nom:'Trouver le 10 — 3 zones',duree:'20min',desc:'Zone 1: 4v2 conservation. Zone 2: joker libre. Zone 3: 2v2 + but. Trouver le joker débloque la zone 3.',
      pitch:{zone:'full',elements:[
        {type:'zone',x:5,y:60,w:90,h:35,color:'rgba(59,130,246,0.08)',stroke:'rgba(59,130,246,0.25)'},
        {type:'zone',x:5,y:40,w:90,h:20,color:'rgba(201,162,39,0.12)',stroke:'rgba(201,162,39,0.3)'},
        {type:'zone',x:5,y:5,w:90,h:35,color:'rgba(239,68,68,0.06)',stroke:'rgba(239,68,68,0.2)'},
        {type:'player',x:25,y:72,color:'#3b82f6'},{type:'player',x:50,y:78,color:'#3b82f6'},{type:'player',x:75,y:72,color:'#3b82f6'},{type:'player',x:40,y:68,color:'#3b82f6'},
        {type:'player',x:35,y:80,color:'#dc2626'},{type:'player',x:65,y:80,color:'#dc2626'},
        {type:'player',x:50,y:50,color:'#c9a227',label:'10',r:3},
        {type:'player',x:35,y:22,color:'#3b82f6'},{type:'player',x:65,y:22,color:'#3b82f6'},
        {type:'player',x:35,y:15,color:'#dc2626'},{type:'player',x:65,y:15,color:'#dc2626'},
        {type:'arrow',x1:50,y1:78,x2:50,y2:53,color:'#c9a227',marker:'ahG',thick:true},
        {type:'arrow',x1:50,y1:48,x2:37,y2:24,color:'#c9a227',marker:'ahG',thick:true},
    ]}},
    {nom:'9v9 construction patiente',duree:'25min',desc:'Interdit de franchir la médiane avant 6 passes dans son camp. Après 6 passes, accélérer.',
      pitch:{zone:'full',elements:[
        {type:'zone',x:5,y:47,w:90,h:3,color:'rgba(239,68,68,0.3)',stroke:'rgba(239,68,68,0.5)'},
        {type:'player',x:50,y:92,color:'#3b82f6',label:'GK',r:3},
        {type:'player',x:35,y:78,color:'#3b82f6'},{type:'player',x:65,y:78,color:'#3b82f6'},
        {type:'player',x:20,y:68,color:'#3b82f6'},{type:'player',x:50,y:65,color:'#3b82f6'},{type:'player',x:80,y:68,color:'#3b82f6'},
        {type:'player',x:35,y:55,color:'#3b82f6'},{type:'player',x:65,y:55,color:'#3b82f6'},{type:'player',x:50,y:52,color:'#3b82f6'},
        {type:'arrow',x1:35,y1:78,x2:48,y2:67,color:'#60a5fa',marker:'ahB'},
        {type:'arrow',x1:50,y1:65,x2:78,y2:70,color:'#60a5fa',marker:'ahB'},
        {type:'ball',x:35,y:78},
    ]}},
  ]},
]

const PROG=[
  {period:'Préparation',weeksCount:6,color:G.green,themes:['Remise en route physique','Bloc défensif','Circuits de jeu','Automatismes offensifs','Matchs de prépa','Montée en charge'],focus:'Poser les bases du projet de jeu.'},
  {period:'Phase aller — Début',weeksCount:8,color:G.gold,themes:['Pressing — déclencheurs','Construction sous pression','Jeu entre les lignes','Transitions OFF/DEF','Animation côté fort','Gestion temps faibles','CPA offensifs','Récupération'],focus:'Installer les principes en compétition.'},
  {period:'Phase aller — Fin',weeksCount:8,color:G.orange,themes:['Adaptation vs bloc bas','Défense en infériorité','Finition','Gestion du score','Permutations','Ressort mental','Bilan mi-saison','Trêve'],focus:'Consolider et corriger.'},
  {period:'Trêve',weeksCount:3,color:G.blue,themes:['Reprise physique','Rappels projet de jeu','Intégration nouveaux'],focus:'Recharger. Réajuster.'},
  {period:'Phase retour — Début',weeksCount:10,color:G.gold,themes:['Réactivation pressing','Plan B','Supériorité milieu','Jeu long','Pressing orienté','CPA défensifs','Gestion fatigue','Intensité','Mental','Matchs décisifs'],focus:'Monter en puissance. Variété tactique.'},
  {period:'Sprint final',weeksCount:6,color:G.red,themes:['Automatismes','Gestion émotionnelle','Plans adversaire','Scénarios','Maintien physique','Bilan saison'],focus:'Exécuter, pas expérimenter.'},
]

/* ═══ COMPOSANTS UI ═══ */
function StepIndicator({step,labels}){return(
  <div style={{display:'flex',alignItems:'center',gap:0,marginBottom:28,flexWrap:'wrap'}}>
    {labels.map((l,i)=>(
      <div key={i} style={{display:'flex',alignItems:'center'}}>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <div style={{width:26,height:26,borderRadius:'50%',background:i<=step?G.gold:'transparent',border:`2px solid ${i<=step?G.gold:G.rule}`,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:G.mono,fontSize:10,fontWeight:700,color:i<=step?'#0f0f0d':G.muted}}>{i<step?'✓':i+1}</div>
          <span style={{fontFamily:G.mono,fontSize:8,letterSpacing:'.1em',textTransform:'uppercase',color:i<=step?G.ink:G.muted,fontWeight:i===step?700:400}}>{l}</span>
        </div>
        {i<labels.length-1&&<div style={{width:28,height:2,background:i<step?G.gold:G.rule,margin:'0 8px'}}/>}
      </div>
    ))}
  </div>
)}

function PrincipeCard({p,selected,onToggle}){return(
  <button onClick={onToggle} style={{width:'100%',textAlign:'left',cursor:'pointer',padding:'11px 13px',background:selected?G.goldBg:G.surface,border:`1.5px solid ${selected?G.gold:G.rule}`,transition:'all .15s',display:'flex',alignItems:'flex-start',gap:10}}>
    <div style={{width:17,height:17,flexShrink:0,marginTop:1,border:`2px solid ${selected?G.gold:G.rule}`,borderRadius:3,display:'flex',alignItems:'center',justifyContent:'center',background:selected?G.gold:'transparent'}}>
      {selected&&<span style={{color:'#0f0f0d',fontSize:10,fontWeight:900}}>✓</span>}
    </div>
    <div>
      <div style={{fontFamily:G.display,fontSize:14,textTransform:'uppercase',color:selected?G.ink:G.ink2,letterSpacing:'.02em',marginBottom:1}}>{p.label}</div>
      <div style={{fontFamily:G.mono,fontSize:9,color:G.muted,letterSpacing:'.03em',lineHeight:1.5}}>{p.desc}</div>
    </div>
  </button>
)}

function PeriodCard({period,startDate}){
  const[open,setOpen]=useState(false)
  return(
    <div style={{background:G.surface,border:`1px solid ${G.rule}`,borderLeft:`3px solid ${period.color}`,marginBottom:5}}>
      <button onClick={()=>setOpen(o=>!o)} style={{width:'100%',display:'flex',alignItems:'center',justifyContent:'space-between',padding:'13px 16px',background:'transparent',border:'none',cursor:'pointer'}}>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <div style={{width:30,height:30,background:period.color+'15',border:`1px solid ${period.color}30`,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:G.display,fontSize:14,color:period.color}}>{period.weeksCount}</div>
          <div style={{textAlign:'left'}}>
            <div style={{fontFamily:G.display,fontSize:15,textTransform:'uppercase',color:G.ink}}>{period.period}</div>
            <div style={{fontFamily:G.mono,fontSize:8,color:G.muted}}>{startDate?`Dès le ${startDate} · `:''}{period.weeksCount} sem.</div>
          </div>
        </div>
        <span style={{fontFamily:G.mono,fontSize:13,color:G.muted,transform:open?'rotate(90deg)':'none',transition:'transform .2s'}}>›</span>
      </button>
      {open&&(
        <div style={{padding:'0 16px 14px',borderTop:`1px solid ${G.rule}`}}>
          <p style={{fontFamily:G.mono,fontSize:10,color:G.muted,lineHeight:1.6,margin:'10px 0 12px',fontStyle:'italic'}}>{period.focus}</p>
          {period.themes.map((t,i)=>(
            <div key={i} style={{display:'flex',alignItems:'center',gap:8,padding:'5px 8px',background:i%2===0?G.goldBg:'transparent'}}>
              <span style={{fontFamily:G.mono,fontSize:8,color:period.color,fontWeight:700,width:16}}>S{i+1}</span>
              <span style={{fontFamily:G.mono,fontSize:10,color:G.ink2}}>{t}</span>
            </div>
          ))}
        </div>
      )}
    </div>
)}

function SeanceCard({seance,jourLabel,horaire}){
  const[open,setOpen]=useState(false)
  const[activeBloc,setActiveBloc]=useState(null)
  return(
    <div style={{background:G.surface,border:`1px solid ${G.rule}`,borderTop:`2px solid ${G.gold}`,marginBottom:10}}>
      <button onClick={()=>setOpen(o=>!o)} style={{width:'100%',display:'flex',alignItems:'center',justifyContent:'space-between',padding:'14px 16px',background:'transparent',border:'none',cursor:'pointer'}}>
        <div style={{textAlign:'left'}}>
          <div style={{fontFamily:G.mono,fontSize:8,letterSpacing:'.14em',textTransform:'uppercase',color:G.gold,marginBottom:2}}>{jourLabel} · {horaire} · 1h30</div>
          <div style={{fontFamily:G.display,fontSize:17,textTransform:'uppercase',color:G.ink}}>{seance.theme}</div>
          <div style={{fontFamily:G.mono,fontSize:9,color:G.muted,marginTop:1}}>Principe : {seance.principe}</div>
        </div>
        <span style={{fontFamily:G.mono,fontSize:13,color:G.muted,transform:open?'rotate(90deg)':'none',transition:'transform .2s'}}>›</span>
      </button>
      {open&&<div style={{borderTop:`1px solid ${G.rule}`}}>
        {seance.blocs.map((bloc,i)=>(
          <div key={i}>
            <div onClick={()=>setActiveBloc(activeBloc===i?null:i)} style={{display:'flex',gap:10,padding:'10px 16px',borderBottom:`1px solid ${G.rule}`,background:activeBloc===i?G.goldBg:'transparent',cursor:'pointer',transition:'background .1s'}}>
              <div style={{width:40,flexShrink:0}}><div style={{fontFamily:G.mono,fontSize:9,fontWeight:700,color:G.gold}}>{bloc.duree}</div></div>
              <div style={{flex:1}}>
                <div style={{fontFamily:G.display,fontSize:12,textTransform:'uppercase',color:G.ink,marginBottom:1}}>{bloc.nom}</div>
                <div style={{fontFamily:G.mono,fontSize:9,color:G.muted,lineHeight:1.5}}>{bloc.desc}</div>
              </div>
              {bloc.pitch&&<div style={{fontFamily:G.mono,fontSize:8,color:G.gold,flexShrink:0,alignSelf:'center'}}>▶ terrain</div>}
            </div>
            {activeBloc===i&&bloc.pitch&&(
              <div style={{padding:'14px 16px',background:'rgba(45,90,39,0.04)',borderBottom:`1px solid ${G.rule}`,display:'flex',justifyContent:'center'}}>
                <PitchSVG width={300} height={bloc.pitch.zone==='quarter'?150:bloc.pitch.zone==='half'?210:250} zone={bloc.pitch.zone} elements={bloc.pitch.elements}/>
              </div>
            )}
          </div>
        ))}
      </div>}
    </div>
)}

/* ═══ MAIN ═══ */
export default function ProjetDeJeu(){
  const[step,setStep]=useState(0)
  const[sel,setSel]=useState([])
  const[formation,setFormation]=useState('4-3-3')
  const[categorie,setCategorie]=useState('Seniors')
  const[dateReprise,setDateReprise]=useState('')
  const[jours,setJours]=useState(['mardi','jeudi'])
  const[horaire,setHoraire]=useState('19:00')

  const toggle=id=>setSel(p=>p.includes(id)?p.filter(x=>x!==id):p.length>=5?p:[...p,id])
  const toggleJour=id=>setJours(p=>p.includes(id)?p.filter(x=>x!==id):[...p,id].sort((a,b)=>JOURS.findIndex(j=>j.id===a)-JOURS.findIndex(j=>j.id===b)))

  const allP=Object.values(PRINCIPES).flat()
  const selLabels=sel.map(id=>allP.find(p=>p.id===id)?.label).filter(Boolean)

  const periodDates=useMemo(()=>{
    if(!dateReprise)return[]
    let c=new Date(dateReprise)
    return PROG.map(p=>{const d=new Date(c);c.setDate(c.getDate()+p.weeksCount*7);return d.toLocaleDateString('fr-FR',{day:'numeric',month:'short',year:'numeric'})})
  },[dateReprise])

  const joursLabels=jours.map(j=>JOURS.find(x=>x.id===j)?.label).join(' + ')
  const ok=sel.length>=3&&dateReprise&&jours.length>=1

  return(
    <DashboardLayout>
      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:none;}}@media(max-width:768px){.pdj-cfg{grid-template-columns:1fr!important;}}`}</style>

      <div style={{marginBottom:22,paddingBottom:16,borderBottom:`1px solid ${G.rule}`}}>
        <p style={{fontFamily:G.mono,fontSize:9,letterSpacing:'.2em',textTransform:'uppercase',color:G.gold,display:'flex',alignItems:'center',gap:8,marginBottom:6}}>
          <span style={{width:14,height:1,background:G.gold}}/>Planification
        </p>
        <h1 style={{fontFamily:G.display,fontSize:46,textTransform:'uppercase',lineHeight:.88,color:G.ink}}>Projet <span style={{color:G.gold}}>de jeu.</span></h1>
      </div>

      <div style={{maxWidth:860}}>
        <StepIndicator step={step} labels={['Identité','Programmation','Séances']}/>

        {step===0&&(
          <div style={{animation:'fadeIn .35s ease'}}>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:22}} className="pdj-cfg">
              <div><label style={{fontFamily:G.mono,fontSize:8,letterSpacing:'.14em',textTransform:'uppercase',color:G.muted,display:'block',marginBottom:4}}>Formation</label>
                <select value={formation} onChange={e=>setFormation(e.target.value)} style={{width:'100%',padding:'8px 10px',fontFamily:G.mono,fontSize:11,border:`1px solid ${G.rule}`,background:G.surface,color:G.ink,outline:'none',cursor:'pointer'}}>
                  {['4-4-2','4-3-3','3-5-2','4-2-3-1','3-4-3','4-1-4-1'].map(f=><option key={f}>{f}</option>)}</select></div>
              <div><label style={{fontFamily:G.mono,fontSize:8,letterSpacing:'.14em',textTransform:'uppercase',color:G.muted,display:'block',marginBottom:4}}>Catégorie</label>
                <select value={categorie} onChange={e=>setCategorie(e.target.value)} style={{width:'100%',padding:'8px 10px',fontFamily:G.mono,fontSize:11,border:`1px solid ${G.rule}`,background:G.surface,color:G.ink,outline:'none',cursor:'pointer'}}>
                  {['U14','U15','U16','U17','U18','U19','Seniors'].map(c=><option key={c}>{c}</option>)}</select></div>
              <div><label style={{fontFamily:G.mono,fontSize:8,letterSpacing:'.14em',textTransform:'uppercase',color:G.muted,display:'block',marginBottom:4}}>Date de reprise</label>
                <input type="date" value={dateReprise} onChange={e=>setDateReprise(e.target.value)} style={{width:'100%',padding:'8px 10px',fontFamily:G.mono,fontSize:11,border:`1px solid ${G.rule}`,background:G.surface,color:G.ink,outline:'none',boxSizing:'border-box'}}/></div>
              <div><label style={{fontFamily:G.mono,fontSize:8,letterSpacing:'.14em',textTransform:'uppercase',color:G.muted,display:'block',marginBottom:4}}>Horaire</label>
                <input type="time" value={horaire} onChange={e=>setHoraire(e.target.value)} style={{width:'100%',padding:'8px 10px',fontFamily:G.mono,fontSize:11,border:`1px solid ${G.rule}`,background:G.surface,color:G.ink,outline:'none',boxSizing:'border-box'}}/></div>
            </div>

            <div style={{marginBottom:22}}>
              <label style={{fontFamily:G.mono,fontSize:8,letterSpacing:'.14em',textTransform:'uppercase',color:G.muted,display:'block',marginBottom:6}}>Jours d'entraînement</label>
              <div style={{display:'flex',gap:5,flexWrap:'wrap'}}>
                {JOURS.map(j=>{const a=jours.includes(j.id);return(
                  <button key={j.id} onClick={()=>toggleJour(j.id)} style={{padding:'7px 13px',fontFamily:G.mono,fontSize:10,background:a?G.gold:G.surface,color:a?'#0f0f0d':G.muted,border:`1.5px solid ${a?G.gold:G.rule}`,cursor:'pointer',fontWeight:a?700:400,transition:'all .12s'}}>{j.label}</button>
                )})}
              </div>
            </div>

            <div style={{marginBottom:16,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
              <div><h2 style={{fontFamily:G.display,fontSize:24,textTransform:'uppercase',color:G.ink}}>Principes <span style={{color:G.gold}}>de jeu</span></h2>
                <p style={{fontFamily:G.mono,fontSize:9,color:G.muted,marginTop:2}}>3 à 5 principes fondamentaux</p></div>
              <div style={{fontFamily:G.display,fontSize:24,color:sel.length>=3?G.gold:G.muted}}>{sel.length}<span style={{fontSize:13,color:G.muted}}>/5</span></div>
            </div>

            {Object.entries(PRINCIPES).map(([phase,list])=>(
              <div key={phase} style={{marginBottom:18}}>
                <div style={{fontFamily:G.mono,fontSize:8,letterSpacing:'.14em',textTransform:'uppercase',color:G.gold,marginBottom:6,display:'flex',alignItems:'center',gap:6}}>
                  <span style={{width:10,height:1.5,background:G.gold}}/>{phase}</div>
                <div style={{display:'flex',flexDirection:'column',gap:4}}>
                  {list.map(p=><PrincipeCard key={p.id} p={p} selected={sel.includes(p.id)} onToggle={()=>toggle(p.id)}/>)}
                </div>
              </div>
            ))}

            <div style={{position:'sticky',bottom:0,background:G.bg,borderTop:`1px solid ${G.rule}`,padding:'12px 0',marginTop:14}}>
              <button onClick={()=>setStep(1)} disabled={!ok} style={{width:'100%',padding:'13px',background:ok?G.gold:G.rule,border:'none',fontFamily:G.display,fontSize:14,letterSpacing:'.06em',textTransform:'uppercase',color:ok?'#0f0f0d':G.muted,cursor:ok?'pointer':'not-allowed'}}>
                Générer ma programmation →</button>
              {!ok&&<p style={{fontFamily:G.mono,fontSize:8,color:G.muted,textAlign:'center',marginTop:5}}>
                {sel.length<3?`Encore ${3-sel.length} principe(s)`:''}{!dateReprise?' · Date requise':''}{jours.length<1?' · Jours requis':''}</p>}
            </div>
          </div>
        )}

        {step===1&&(
          <div style={{animation:'fadeIn .35s ease'}}>
            <div style={{background:G.dark,padding:'14px 16px',marginBottom:20,borderLeft:`3px solid ${G.gold}`}}>
              <div style={{fontFamily:G.mono,fontSize:8,letterSpacing:'.14em',textTransform:'uppercase',color:G.gold,marginBottom:6}}>Votre identité</div>
              <div style={{display:'flex',gap:5,flexWrap:'wrap',marginBottom:6}}>
                <span style={{fontFamily:G.mono,fontSize:9,padding:'2px 7px',background:G.gold+'20',border:`1px solid ${G.gold}40`,color:G.gold}}>{formation}</span>
                <span style={{fontFamily:G.mono,fontSize:9,padding:'2px 7px',background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.1)',color:'rgba(245,242,235,0.6)'}}>{categorie}</span>
                <span style={{fontFamily:G.mono,fontSize:9,padding:'2px 7px',background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.1)',color:'rgba(245,242,235,0.6)'}}>{joursLabels} · {horaire}</span>
                <span style={{fontFamily:G.mono,fontSize:9,padding:'2px 7px',background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.1)',color:'rgba(245,242,235,0.6)'}}>Reprise : {dateReprise?new Date(dateReprise).toLocaleDateString('fr-FR',{day:'numeric',month:'long'}):'—'}</span>
              </div>
              <div style={{display:'flex',gap:3,flexWrap:'wrap'}}>
                {selLabels.map(l=><span key={l} style={{fontFamily:G.mono,fontSize:8,padding:'2px 5px',background:'rgba(245,242,235,0.06)',color:'rgba(245,242,235,0.5)'}}>{l}</span>)}
              </div>
            </div>

            <h2 style={{fontFamily:G.display,fontSize:24,textTransform:'uppercase',color:G.ink,marginBottom:3}}>Programmation <span style={{color:G.gold}}>annuelle</span></h2>
            <p style={{fontFamily:G.mono,fontSize:9,color:G.muted,marginBottom:18}}>{PROG.reduce((a,p)=>a+p.weeksCount,0)} semaines · calée sur votre reprise</p>

            {PROG.map((p,i)=><PeriodCard key={i} period={p} startDate={periodDates[i]}/>)}

            <div style={{display:'flex',gap:8,marginTop:20}}>
              <button onClick={()=>setStep(0)} style={{flex:1,padding:'11px',background:'transparent',border:`1px solid ${G.rule}`,fontFamily:G.mono,fontSize:9,letterSpacing:'.1em',textTransform:'uppercase',color:G.muted,cursor:'pointer'}}>← Modifier</button>
              <button onClick={()=>setStep(2)} style={{flex:2,padding:'11px',background:G.gold,border:'none',fontFamily:G.display,fontSize:13,letterSpacing:'.06em',textTransform:'uppercase',color:'#0f0f0d',cursor:'pointer'}}>Voir les séances →</button>
            </div>
          </div>
        )}

        {step===2&&(
          <div style={{animation:'fadeIn .35s ease'}}>
            <div style={{background:G.goldBg,border:`1px solid ${G.goldBdr}`,padding:'12px 16px',marginBottom:20,display:'flex',alignItems:'center',gap:8}}>
              <span style={{fontSize:16}}>💡</span>
              <p style={{fontFamily:G.mono,fontSize:9,color:G.ink2,lineHeight:1.5}}>Cliquez sur une séance puis sur <strong>"▶ terrain"</strong> pour voir le schéma de l'exercice.</p>
            </div>

            <h2 style={{fontFamily:G.display,fontSize:24,textTransform:'uppercase',color:G.ink,marginBottom:3}}>Semaine <span style={{color:G.gold}}>type</span></h2>
            <p style={{fontFamily:G.mono,fontSize:9,color:G.muted,marginBottom:18}}>{jours.length} séance{jours.length>1?'s':''} · {joursLabels} à {horaire} · {categorie}</p>

            {SEANCES.slice(0,jours.length).map((s,i)=>(
              <SeanceCard key={i} seance={s} jourLabel={JOURS.find(j=>j.id===jours[i])?.label||''} horaire={horaire}/>
            ))}

            <div style={{background:G.dark,padding:'20px 18px',marginTop:24,borderLeft:`3px solid ${G.gold}`,display:'flex',gap:14,alignItems:'center',flexWrap:'wrap'}}>
              <div style={{flex:1,minWidth:160}}>
                <div style={{fontFamily:G.mono,fontSize:8,letterSpacing:'.16em',textTransform:'uppercase',color:G.gold,marginBottom:5}}>Bientôt</div>
                <h3 style={{fontFamily:G.display,fontSize:18,textTransform:'uppercase',color:'#f5f2eb',marginBottom:5}}>Analyse vidéo <span style={{color:G.gold}}>→</span> Séances</h3>
                <p style={{fontFamily:G.mono,fontSize:9,color:'rgba(245,242,235,0.4)',lineHeight:1.6}}>Après chaque match, l'IA ajustera vos séances selon les axes de progression identifiés.</p>
              </div>
              <div style={{width:50,height:50,background:G.gold+'15',border:`1px solid ${G.gold}30`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                <span style={{fontFamily:G.display,fontSize:20,color:G.gold}}>IA</span>
              </div>
            </div>

            <div style={{display:'flex',gap:8,marginTop:20}}>
              <button onClick={()=>setStep(1)} style={{flex:1,padding:'11px',background:'transparent',border:`1px solid ${G.rule}`,fontFamily:G.mono,fontSize:9,letterSpacing:'.1em',textTransform:'uppercase',color:G.muted,cursor:'pointer'}}>← Programmation</button>
              <button onClick={()=>{setStep(0);setSel([])}} style={{flex:2,padding:'11px',background:G.gold,border:'none',fontFamily:G.display,fontSize:13,letterSpacing:'.06em',textTransform:'uppercase',color:'#0f0f0d',cursor:'pointer'}}>Recommencer</button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
