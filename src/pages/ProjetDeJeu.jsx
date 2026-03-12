import { useState, useMemo, useEffect } from "react"
import DashboardLayout from '../components/DashboardLayout'
import { T, globalStyles } from '../theme'
import CalendrierSaison from '../components/CalendrierSaison'
import exercicesData from '../data/exercises_database.json'

const _base = import.meta.env.VITE_API_URL || 'https://backend-pued.onrender.com'
const API = _base.endsWith('/api') ? _base : `${_base}/api`
function authH() {
  return { Authorization: `Bearer ${localStorage.getItem('insightball_token')}`, 'Content-Type': 'application/json' }
}
async function safeJson(res) {
  const ct = res.headers.get('content-type') || ''
  if (!ct.includes('application/json')) throw new Error('Réponse non-JSON')
  return res.json()
}

const G = {
  bg:T.bg, surface:T.surface, dark:T.dark,
  ink:T.ink, ink2:T.ink, muted:T.muted,
  gold:T.gold, goldBg:T.goldBg, goldBdr:T.goldBdr,
  rule:T.rule,
  green:T.green, red:T.red, blue:T.blue, orange:T.orange, purple:'#8b5cf6',
  mono:T.mono, display:T.display,
}

/* ═══════════════════════════════
   TABLEAU DIMENSIONS FFF
   Effectif → taille terrain
═══════════════════════════════ */
const DIMENSIONS = {
  1:  {s:'5×10m',m:'10×15m',l:'15×20m'},
  2:  {s:'10×15m',m:'15×20m',l:'20×25m'},
  3:  {s:'15×20m',m:'20×25m',l:'25×30m'},
  4:  {s:'20×25m',m:'25×30m',l:'30×35m'},
  5:  {s:'25×30m',m:'30×35m',l:'35×40m'},
  6:  {s:'30×40m',m:'35×45m',l:'40×50m'},
  7:  {s:'35×50m',m:'40×55m',l:'45×60m'},
  8:  {s:'35×55m',m:'40×60m',l:'45×65m'},
  9:  {s:'40×60m',m:'45×65m',l:'50×70m'},
  10: {s:'45×65m',m:'50×70m',l:'55×75m'},
  11: {s:'50×68m',m:'55×75m',l:'terrain complet'},
}
function getDim(perTeam,size='m'){
  const k=Math.min(Math.max(perTeam,1),11)
  return (DIMENSIONS[k]||DIMENSIONS[6])[size]||DIMENSIONS[k].m
}

/* ═══════════════════════════════
   DONNÉES EXERCICES (depuis JSON)
═══════════════════════════════ */
const EXERCICES = exercicesData.exercices
const SEANCES_SUGGEREES = exercicesData.seances_suggerees

// Index rapide par ID
const EXERCICES_BY_ID = {}
EXERCICES.forEach(e => { EXERCICES_BY_ID[e.id] = e })

// Couleurs par domaine
const DOMAINE_COLORS = {
  tactique_offensive: '#2563eb',
  tactique_defensive: '#dc2626',
  transition_offensive: '#ea580c',
  transition_defensive: '#8b5cf6',
  technique: '#0891b2',
  physique_integre: '#c9a227',
}
const DOMAINE_LABELS = {
  tactique_offensive: 'Tac. offensive',
  tactique_defensive: 'Tac. défensive',
  transition_offensive: 'Trans. offensive',
  transition_defensive: 'Trans. défensive',
  technique: 'Technique',
  physique_integre: 'Physique intégré',
}
const TYPE_COLORS = {
  echauffement: G.green,
  analytique: '#0891b2',
  situation: G.orange,
  jeu_reduit: G.gold,
  jeu_a_theme: '#8b5cf6',
  match: G.ink,
}
const TYPE_LABELS = {
  echauffement: 'Échauffement',
  analytique: 'Analytique',
  situation: 'Situation',
  jeu_reduit: 'Jeu réduit',
  jeu_a_theme: 'Jeu à thème',
  match: 'Match',
}
const INTENSITE_MAP = {
  faible: { label:'Faible', pct:33, color:G.green },
  moyenne: { label:'Moyenne', pct:66, color:G.orange },
  haute: { label:'Haute', pct:100, color:'#dc2626' },
}

/* ═══════════════════════════════
   DONNÉES PROJET
═══════════════════════════════ */
const PRINCIPES = {
  'Phase offensive':[
    {id:'po1',label:'Construction courte depuis le GB',desc:'Relance au sol, circuits courts, patience'},
    {id:'po2',label:'Jeu en triangles côté fort',desc:'Combinaisons latéral-milieu-ailier'},
    {id:'po3',label:'Appels en profondeur',desc:'Courses derrière la ligne défensive'},
    {id:'po4',label:'Jeu entre les lignes',desc:'Intervalles, décrochages milieux'},
    {id:'po5',label:'Centres et occupation surface',desc:'Débordements + finition'},
    {id:'po6',label:'Jeu de position',desc:'Supériorité numérique par zone'},
  ],
  'Phase défensive':[
    {id:'pd1',label:'Pressing haut à la perte',desc:'Contre-pressing immédiat en 5 sec'},
    {id:'pd2',label:'Bloc médian compact',desc:'Lignes resserrées, 30m max'},
    {id:'pd3',label:'Bloc bas organisé',desc:'Protection de la surface'},
    {id:'pd4',label:'Pressing orienté côté',desc:'Fermer le centre, pousser côté'},
  ],
  'Transitions':[
    {id:'tr1',label:'Transition offensive rapide',desc:'Verticalité immédiate'},
    {id:'tr2',label:'Transition offensive patiente',desc:'Sécuriser puis accélérer'},
    {id:'tr3',label:'Repli défensif immédiat',desc:'Replacements rapides'},
    {id:'tr4',label:'Contre-pressing',desc:'Récup en 6 sec après la perte'},
  ],
  'CPA':[
    {id:'cpa1',label:'Corners offensifs travaillés',desc:'Schémas prédéfinis'},
    {id:'cpa2',label:'CF indirects',desc:'Combinaisons courtes'},
    {id:'cpa3',label:'Défense de zone CPA',desc:'Placement zonal'},
  ],
}

const JOURS=[{id:'lundi',l:'Lun'},{id:'mardi',l:'Mar'},{id:'mercredi',l:'Mer'},{id:'jeudi',l:'Jeu'},{id:'vendredi',l:'Ven'},{id:'samedi',l:'Sam'},{id:'dimanche',l:'Dim'}]

const THEMES_SEANCE = [
  {id:'pressing',label:'Pressing haut',cat:'défensif'},
  {id:'construction',label:'Construction depuis le GB',cat:'offensif'},
  {id:'transition_off',label:'Transition offensive',cat:'transition'},
  {id:'transition_def',label:'Transition défensive',cat:'transition'},
  {id:'entre_lignes',label:'Jeu entre les lignes',cat:'offensif'},
  {id:'cote_fort',label:'Jeu côté fort / triangles',cat:'offensif'},
  {id:'finition',label:'Finition + efficacité',cat:'offensif'},
  {id:'bloc',label:'Bloc défensif',cat:'défensif'},
  {id:'cpa_off',label:'CPA offensifs',cat:'cpa'},
  {id:'physique',label:'Physique intégré',cat:'physique'},
]

const PROG=[
  {period:'Préparation',wk:6,color:G.green,themes:['Reprise physique + cohésion','Bloc défensif — fondations','Circuits construction','Automatismes offensifs','Matchs prépa — intégration','Montée en charge'],focus:'Bases du projet de jeu. Volume physique.'},
  {period:'Phase aller — Début',wk:8,color:G.gold,themes:['Pressing — déclencheurs','Construction sous pression','Jeu entre les lignes','Transitions OFF/DEF','Animation côté fort','Gestion temps faibles','CPA offensifs','Récupération'],focus:'Installer les principes en compétition.'},
  {period:'Phase aller — Fin',wk:8,color:G.orange,themes:['Adaptation vs bloc bas','Défense infériorité','Finition','Gestion score','Permutations','Ressort mental','Bilan mi-saison','Trêve'],focus:'Consolider et corriger.'},
  {period:'Trêve',wk:3,color:G.blue,themes:['Reprise progressive','Rappels projet de jeu','Intégration nouveaux'],focus:'Recharger.'},
  {period:'Phase retour',wk:10,color:G.gold,themes:['Réactivation pressing','Plan B','Supériorité milieu','Jeu long','Pressing orienté','CPA défensifs','Fatigue','Intensité','Mental','Matchs décisifs'],focus:'Variété tactique. Monter en puissance.'},
  {period:'Sprint final',wk:6,color:G.red,themes:['Automatismes','Émotionnel','Plans adversaire','Scénarios','Physique','Bilan'],focus:'Exécuter.'},
]

/* ═══════════════════════════════
   COMPOSANTS UI
═══════════════════════════════ */
const labSt={fontFamily:G.mono,fontSize:8,letterSpacing:'.12em',textTransform:'uppercase',color:G.muted,display:'block',marginBottom:4}
const selSt={width:'100%',padding:'8px 10px',fontFamily:G.mono,fontSize:11,border:`1px solid ${G.rule}`,background:G.surface,color:G.ink,outline:'none',cursor:'pointer',boxSizing:'border-box'}

function Tag({children,active,onClick}){return(
  <button onClick={onClick} style={{padding:'7px 13px',fontFamily:G.mono,fontSize:10,background:active?G.gold:G.surface,color:active?'#0f0f0d':G.muted,border:`1.5px solid ${active?G.gold:G.rule}`,cursor:'pointer',fontWeight:active?700:400,transition:'all .12s'}}>{children}</button>
)}

function StepBar({step,labels}){return(
  <div style={{display:'flex',alignItems:'center',gap:0,marginBottom:24,flexWrap:'wrap'}}>
    {labels.map((l,i)=>(
      <div key={i} style={{display:'flex',alignItems:'center'}}>
        <div style={{display:'flex',alignItems:'center',gap:7}}>
          <div style={{width:24,height:24,borderRadius:'50%',background:i<=step?G.gold:'transparent',border:`2px solid ${i<=step?G.gold:G.rule}`,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:G.mono,fontSize:9,fontWeight:700,color:i<=step?'#0f0f0d':G.muted}}>{i<step?'✓':i+1}</div>
          <span style={{fontFamily:G.mono,fontSize:8,letterSpacing:'.08em',textTransform:'uppercase',color:i<=step?G.ink:G.muted,fontWeight:i===step?700:400}}>{l}</span>
        </div>
        {i<labels.length-1&&<div style={{width:20,height:2,background:i<step?G.gold:G.rule,margin:'0 6px'}}/>}
      </div>
    ))}
  </div>
)}

function PeriodCard({p,sd}){
  const[open,setOpen]=useState(false)
  return(
    <div style={{background:G.surface,border:`1px solid ${G.rule}`,borderLeft:`3px solid ${p.color}`,marginBottom:4}}>
      <button onClick={()=>setOpen(o=>!o)} style={{width:'100%',display:'flex',alignItems:'center',justifyContent:'space-between',padding:'11px 13px',background:'transparent',border:'none',cursor:'pointer'}}>
        <div style={{display:'flex',alignItems:'center',gap:9}}>
          <div style={{width:26,height:26,background:p.color+'15',border:`1px solid ${p.color}30`,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:G.display,fontSize:13,color:p.color}}>{p.wk}</div>
          <div style={{textAlign:'left'}}>
            <div style={{fontFamily:G.display,fontSize:14,textTransform:'uppercase',color:G.ink}}>{p.period}</div>
            <div style={{fontFamily:G.mono,fontSize:8,color:G.muted}}>{sd||''} · {p.wk} sem.</div>
          </div>
        </div>
        <span style={{fontFamily:G.mono,fontSize:11,color:G.muted,transform:open?'rotate(90deg)':'none',transition:'transform .2s'}}>›</span>
      </button>
      {open&&<div style={{padding:'0 13px 11px',borderTop:`1px solid ${G.rule}`}}>
        <p style={{fontFamily:G.mono,fontSize:9,color:G.muted,fontStyle:'italic',margin:'8px 0 8px'}}>{p.focus}</p>
        {p.themes.map((t,i)=>(
          <div key={i} style={{display:'flex',alignItems:'center',gap:6,padding:'4px 7px',background:i%2===0?G.goldBg:'transparent'}}>
            <span style={{fontFamily:G.mono,fontSize:8,color:p.color,fontWeight:700,width:15}}>S{i+1}</span>
            <span style={{fontFamily:G.mono,fontSize:9,color:G.ink2}}>{t}</span>
          </div>
        ))}
      </div>}
    </div>
)}

function PrincipeCard({p,sel,onToggle}){return(
  <button onClick={onToggle} style={{width:'100%',textAlign:'left',cursor:'pointer',padding:'9px 11px',background:sel?G.goldBg:G.surface,border:`1.5px solid ${sel?G.gold:G.rule}`,transition:'all .15s',display:'flex',alignItems:'flex-start',gap:8}}>
    <div style={{width:15,height:15,flexShrink:0,marginTop:1,border:`2px solid ${sel?G.gold:G.rule}`,borderRadius:3,display:'flex',alignItems:'center',justifyContent:'center',background:sel?G.gold:'transparent'}}>
      {sel&&<span style={{color:'#0f0f0d',fontSize:9,fontWeight:900}}>✓</span>}
    </div>
    <div>
      <div style={{fontFamily:G.display,fontSize:13,textTransform:'uppercase',color:sel?G.ink:G.ink2,marginBottom:1}}>{p.label}</div>
      <div style={{fontFamily:G.mono,fontSize:8,color:G.muted,lineHeight:1.4}}>{p.desc}</div>
    </div>
  </button>
)}

/* ═══════════════════════════════
   TERRAIN SVG — ADAPTATIF
   reduit = carré, demi = paysage avec marquages,
   largeur = horizontal avec but+surface
═══════════════════════════════ */
const ROLE_COLORS = { att:G.gold, def:'#dc2626', gk:'#16a34a', neutre:'#94a3b8' }
const COURSE_COLORS = { course:G.gold, sprint:'#dc2626', appel:G.gold, coulissage:'#2563eb', sortie:'#dc2626' }

function SvgDefs(){return(
  <defs>
    <pattern id="tgr" width="10" height="10" patternUnits="userSpaceOnUse">
      <rect width="10" height="10" fill="#2b6b22"/><rect y="0" width="10" height="5" fill="#2f7226" opacity="0.35"/>
    </pattern>
    {[['tag',G.gold],['tar','#dc2626'],['tab','#2563eb']].map(([id,c])=>(
      <marker key={id} id={id} markerWidth="7" markerHeight="5" refX="6" refY="2.5" orient="auto"><path d="M0,0 L7,2.5 L0,5 Z" fill={c}/></marker>
    ))}
  </defs>
)}

function SvgJoueur({x,y,role,label}){
  const col=ROLE_COLORS[role]||G.muted
  return(<g><circle cx={x} cy={y} r={10} fill={col} stroke="white" strokeWidth="1.5" opacity="0.9"/>
    {label&&<text x={x} y={y+1} textAnchor="middle" dominantBaseline="central" fill="white" fontSize="6.5" fontWeight="700" fontFamily={G.mono}>{label}</text>}
  </g>)
}
function SvgPasse({x1,y1,x2,y2}){return <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="white" strokeWidth="1.5" strokeDasharray="5,4" opacity="0.45"/>}
function SvgCourse({x1,y1,x2,y2,type}){
  const col=COURSE_COLORS[type]||G.gold
  const m={[G.gold]:'url(#tag)','#dc2626':'url(#tar)','#2563eb':'url(#tab)'}
  return <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={col} strokeWidth="2" strokeDasharray={type==='appel'?'4,3':''} markerEnd={m[col]||'url(#tag)'} opacity="0.85"/>
}
function SvgPlot({x,y}){return <circle cx={x} cy={y} r={3.5} fill={G.orange} stroke="white" strokeWidth="0.5"/>}

function RenderSchema({schema,W,H,P}){
  const fw=W-P*2,fh=H-P*2
  const px=p=>P+(p/100)*fw, py=p=>P+(p/100)*fh
  const j=schema.joueurs||[],pa=schema.passes||[],co=schema.courses||[],el=schema.elements||[]
  return(<>
    {pa.map(([f,t],i)=>j[f]&&j[t]?<SvgPasse key={`p${i}`} x1={px(j[f].x)} y1={py(j[f].y)} x2={px(j[t].x)} y2={py(j[t].y)}/>:null)}
    {co.map((c,i)=><SvgCourse key={`c${i}`} x1={px(c.from[0])} y1={py(c.from[1])} x2={px(c.to[0])} y2={py(c.to[1])} type={c.type}/>)}
    {el.map((e,i)=>e.type==='plot'?<SvgPlot key={`e${i}`} x={px(e.x)} y={py(e.y)}/>:null)}
    {j.map((p,i)=><SvgJoueur key={`j${i}`} x={px(p.x)} y={py(p.y)} role={p.role} label={p.label}/>)}
    <text x={W/2} y={H-3} textAnchor="middle" fill="rgba(255,255,255,0.35)" fontSize="7" fontFamily={G.mono}>{schema.dimensions}</text>
  </>)
}

function TerrainReduit({schema}){
  const W=180,H=180,P=14
  return(<svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{borderRadius:4,flexShrink:0}}>
    <SvgDefs/><rect width={W} height={H} rx="4" fill="url(#tgr)"/>
    <rect x={P} y={P} width={W-P*2} height={H-P*2} fill="none" stroke="white" strokeWidth="1.5" opacity="0.3" rx="2"/>
    <RenderSchema schema={schema} W={W} H={H} P={P}/>
  </svg>)
}

function TerrainDemi({schema}){
  const W=240,H=195,P=12
  const fw=W-P*2,fh=H-P*2,cx=W/2
  const surfW=fw*0.593,surfH=fh*0.314,surfX=cx-surfW/2
  const pSurfW=fw*0.269,pSurfH=fh*0.105,pSurfX=cx-pSurfW/2
  const penY=P+fh*0.209
  const arcR=fw*0.134,arcBot=P+surfH
  const dy=arcBot-penY,halfW=Math.sqrt(Math.max(0,arcR*arcR-dy*dy))
  const butW=fw*0.108,rcR=fw*0.10
  return(<svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{borderRadius:4,flexShrink:0}}>
    <SvgDefs/><rect width={W} height={H} rx="4" fill="url(#tgr)"/>
    <rect x={P} y={P} width={fw} height={fh} fill="none" stroke="white" strokeWidth="1.5" opacity="0.3"/>
    <line x1={P} y1={P+fh} x2={W-P} y2={P+fh} stroke="white" strokeWidth="1.5" opacity="0.3"/>
    <path d={`M ${cx-rcR} ${P+fh} A ${rcR} ${rcR} 0 0 0 ${cx+rcR} ${P+fh}`} fill="none" stroke="white" strokeWidth="0.8" opacity="0.15"/>
    <circle cx={cx} cy={P+fh} r={1.5} fill="white" opacity="0.2"/>
    <rect x={surfX} y={P} width={surfW} height={surfH} fill="none" stroke="white" strokeWidth="1" opacity="0.3"/>
    <rect x={pSurfX} y={P} width={pSurfW} height={pSurfH} fill="none" stroke="white" strokeWidth="0.8" opacity="0.22"/>
    <circle cx={cx} cy={penY} r={1.5} fill="white" opacity="0.3"/>
    {halfW>2&&<path d={`M ${cx-halfW} ${arcBot} A ${arcR} ${arcR} 0 0 0 ${cx+halfW} ${arcBot}`} fill="none" stroke="white" strokeWidth="0.8" opacity="0.18"/>}
    <rect x={cx-butW/2} y={P-4} width={butW} height={5} fill="none" stroke="white" strokeWidth="1.2" opacity="0.5" rx="1"/>
    <line x1={cx-butW/2} y1={P} x2={cx+butW/2} y2={P} stroke="white" strokeWidth="1.5" opacity="0.5"/>
    <RenderSchema schema={schema} W={W} H={H} P={P}/>
  </svg>)
}

function TerrainLargeur({schema}){
  const W=260,H=175,P=12
  const fw=W-P*2,fh=H-P*2,cx=W/2
  const surfW=fw*0.45,surfH=fh*0.28,surfX=cx-surfW/2
  const pSurfW=fw*0.24,pSurfH=fh*0.12,pSurfX=cx-pSurfW/2
  const penY=P+fh*0.22
  const arcR=fw*0.10,arcBot=P+surfH
  const dy=arcBot-penY,halfW=Math.sqrt(Math.max(0,arcR*arcR-dy*dy))
  const butW=fw*0.12
  return(<svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{borderRadius:4,flexShrink:0}}>
    <SvgDefs/><rect width={W} height={H} rx="4" fill="url(#tgr)"/>
    <rect x={P} y={P} width={fw} height={fh} fill="none" stroke="white" strokeWidth="1.5" opacity="0.3"/>
    <rect x={surfX} y={P} width={surfW} height={surfH} fill="none" stroke="white" strokeWidth="0.8" opacity="0.25"/>
    <rect x={pSurfX} y={P} width={pSurfW} height={pSurfH} fill="none" stroke="white" strokeWidth="0.8" opacity="0.2"/>
    <circle cx={cx} cy={penY} r={1.5} fill="white" opacity="0.3"/>
    {halfW>2&&<path d={`M ${cx-halfW} ${arcBot} A ${arcR} ${arcR} 0 0 0 ${cx+halfW} ${arcBot}`} fill="none" stroke="white" strokeWidth="0.8" opacity="0.18"/>}
    <rect x={cx-butW/2} y={P-4} width={butW} height={5} fill="none" stroke="white" strokeWidth="1.2" opacity="0.5" rx="1"/>
    <line x1={cx-butW/2} y1={P} x2={cx+butW/2} y2={P} stroke="white" strokeWidth="1.5" opacity="0.5"/>
    <RenderSchema schema={schema} W={W} H={H} P={P}/>
  </svg>)
}

function TerrainSVG({schema}){
  if(!schema||!schema.terrain) return null
  if(schema.terrain==='reduit') return <TerrainReduit schema={schema}/>
  if(schema.terrain==='demi') return <TerrainDemi schema={schema}/>
  if(schema.terrain==='largeur') return <TerrainLargeur schema={schema}/>
  return <TerrainReduit schema={schema}/>
}

// Fallback pour les exercices sans schema — affiche l'ancien ZoneIndicator
const ZONES_TERRAIN = {
  plein:{label:'Terrain complet',z:[0,0,100,100]}, trois_quarts:{label:'¾ terrain',z:[0,0,100,75]},
  demi:{label:'Demi-terrain',z:[0,0,100,50]}, quart:{label:'Quart terrain',z:[0,0,50,50]},
  surface:{label:'Surface',z:[20,0,60,25]}, couloir:{label:'Couloir central',z:[15,10,70,80]},
  largeur:{label:'Toute la largeur',z:[0,25,100,50]}, reduite:{label:'Zone réduite',z:[30,30,40,40]},
}
function ZoneIndicator({zoneKey}){
  const z=ZONES_TERRAIN[zoneKey]; if(!z) return null
  const [x,y,w,h]=z.z
  return(<div style={{display:'flex',alignItems:'center',gap:6}}>
    <svg width="38" height="54" viewBox="0 0 100 140" style={{border:'1px solid #3a7a33',background:'#2d5a27'}}>
      <rect x="2" y="2" width="96" height="136" fill="none" stroke="white" strokeWidth="1.5" opacity="0.25" rx="1"/>
      <line x1="2" y1="70" x2="98" y2="70" stroke="white" strokeWidth="1" opacity="0.18"/>
      <circle cx="50" cy="70" r="14" fill="none" stroke="white" strokeWidth="0.8" opacity="0.12"/>
      <rect x="25" y="2" width="50" height="20" fill="none" stroke="white" strokeWidth="0.8" opacity="0.12"/>
      <rect x="25" y="118" width="50" height="20" fill="none" stroke="white" strokeWidth="0.8" opacity="0.12"/>
      <rect x={x*.96+2} y={y*1.36+2} width={w*.96} height={h*1.36} fill={G.gold} opacity="0.35" rx="2"/>
      <rect x={x*.96+2} y={y*1.36+2} width={w*.96} height={h*1.36} fill="none" stroke={G.gold} strokeWidth="1.5" rx="2"/>
    </svg>
    <span style={{fontFamily:G.mono,fontSize:7,color:G.gold,fontWeight:600,letterSpacing:'.04em'}}>{z.label}</span>
  </div>)
}

/* ═══════════════════════════════
   COMPOSANTS SÉANCE
═══════════════════════════════ */

function IntensityBar({level}){
  const c = INTENSITE_MAP[level]
  if(!c) return null
  return(
    <div style={{display:'flex',alignItems:'center',gap:5}}>
      <div style={{width:34,height:5,borderRadius:3,background:G.rule,overflow:'hidden'}}>
        <div style={{width:`${c.pct}%`,height:'100%',borderRadius:3,background:c.color}}/>
      </div>
      <span style={{fontFamily:G.mono,fontSize:8,color:c.color,fontWeight:600}}>{c.label}</span>
    </div>
  )
}

function ExerciceCard({ex,isOpen,onToggle,onAdd,inSession,sessionFull}){
  const dc = DOMAINE_COLORS[ex.domaine] || G.muted
  const tc = TYPE_COLORS[ex.type] || G.muted
  const hasSchema = ex.schema && ex.schema.terrain
  return(
    <div style={{background:G.surface,border:`1px solid ${isOpen?dc:G.rule}`,borderLeft:`3px solid ${dc}`,marginBottom:4,transition:'all .15s'}}>
      <div style={{padding:'10px 12px',cursor:'pointer',display:'flex',alignItems:'center',gap:8}}>
        <div onClick={onToggle} style={{flex:1,minWidth:0}}>
          <div style={{fontFamily:G.display,fontSize:13,textTransform:'uppercase',color:G.ink,marginBottom:3}}>{ex.nom}</div>
          <div style={{display:'flex',alignItems:'center',gap:4,flexWrap:'wrap'}}>
            <span style={{fontFamily:G.mono,fontSize:7,padding:'1px 5px',background:`${dc}12`,color:dc,border:`1px solid ${dc}25`}}>{DOMAINE_LABELS[ex.domaine]||ex.domaine}</span>
            <span style={{fontFamily:G.mono,fontSize:7,padding:'1px 5px',background:`${tc}12`,color:tc,border:`1px solid ${tc}25`}}>{TYPE_LABELS[ex.type]||ex.type}</span>
            <span style={{fontFamily:G.mono,fontSize:8,color:G.muted}}>{ex.duree}min · {ex.j_min}-{ex.j_max}j</span>
            <IntensityBar level={ex.intensite}/>
          </div>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:5,flexShrink:0}}>
          {!inSession && (
            <button onClick={(e)=>{e.stopPropagation();onAdd(ex)}} disabled={sessionFull}
              style={{padding:'4px 9px',fontFamily:G.mono,fontSize:8,textTransform:'uppercase',letterSpacing:'.06em',
                background:sessionFull?G.rule:G.gold,color:sessionFull?G.muted:'#0f0f0d',
                border:'none',cursor:sessionFull?'not-allowed':'pointer',opacity:sessionFull?.5:1}}>
              + Procédé
            </button>
          )}
          {inSession && <span style={{fontFamily:G.mono,fontSize:7,color:G.gold,fontWeight:700}}>ajouté</span>}
          <span onClick={onToggle} style={{fontFamily:G.mono,fontSize:12,color:G.muted,transform:isOpen?'rotate(90deg)':'none',transition:'transform .2s',cursor:'pointer'}}>›</span>
        </div>
      </div>
      {isOpen && (
        <div style={{padding:'0 12px 12px',borderTop:`1px solid ${G.rule}`}}>
          {/* Terrain SVG + Objectif + Mise en place */}
          <div style={{marginTop:8,display:'flex',gap:14,flexWrap:'wrap',alignItems:'flex-start'}}>
            {hasSchema ? <TerrainSVG schema={ex.schema}/> : ex.zone ? <ZoneIndicator zoneKey={ex.zone}/> : null}
            <div style={{flex:1,minWidth:180}}>
              <div style={{fontFamily:G.mono,fontSize:7,letterSpacing:'.12em',textTransform:'uppercase',color:dc,marginBottom:3}}>Objectif</div>
              <p style={{fontFamily:G.mono,fontSize:9,color:G.ink2,lineHeight:1.55,margin:'0 0 8px'}}>{ex.objectif}</p>
              <div style={{background:G.goldBg,border:`1px solid ${G.goldBdr}`,padding:'7px 9px'}}>
                <div style={{fontFamily:G.mono,fontSize:7,letterSpacing:'.12em',textTransform:'uppercase',color:G.muted,marginBottom:3}}>Mise en place</div>
                <div style={{fontFamily:G.mono,fontSize:8,color:G.ink2,lineHeight:1.5}}>
                  <div style={{marginBottom:2}}><strong style={{color:dc}}>Dimensions :</strong> {ex.mise_en_place.dimensions}</div>
                  <div><strong style={{color:dc}}>Organisation :</strong> {ex.mise_en_place.organisation}</div>
                </div>
              </div>
            </div>
          </div>
          {/* Déroulement */}
          <div style={{marginTop:8}}>
            <div style={{fontFamily:G.mono,fontSize:7,letterSpacing:'.12em',textTransform:'uppercase',color:G.muted,marginBottom:3}}>Déroulement</div>
            <p style={{fontFamily:G.mono,fontSize:9,color:G.ink2,lineHeight:1.6,margin:0}}>{ex.deroulement}</p>
          </div>
          {/* Transfert en match */}
          {ex.impact_match && (
            <div style={{marginTop:8,background:G.dark,padding:'8px 10px',borderLeft:`3px solid ${G.gold}`}}>
              <div style={{fontFamily:G.mono,fontSize:7,letterSpacing:'.12em',textTransform:'uppercase',color:G.gold,marginBottom:3,fontWeight:700}}>Transfert en match</div>
              <p style={{fontFamily:G.mono,fontSize:8,color:'rgba(245,242,235,0.7)',lineHeight:1.55,margin:0}}>{ex.impact_match}</p>
            </div>
          )}
          {/* Comportements attendus */}
          {ex.comportements_attendus && ex.comportements_attendus.length>0 && (
            <div style={{marginTop:8}}>
              <div style={{fontFamily:G.mono,fontSize:7,letterSpacing:'.12em',textTransform:'uppercase',color:'#16a34a',marginBottom:4,fontWeight:700}}>Comportements attendus</div>
              {ex.comportements_attendus.map((c,i)=>(
                <div key={i} style={{display:'flex',gap:5,marginBottom:2,padding:'3px 7px',background:i%2===0?'rgba(22,163,74,0.04)':'transparent',borderLeft:'2px solid rgba(22,163,74,0.2)'}}>
                  <span style={{fontFamily:G.mono,fontSize:8,color:'#16a34a',fontWeight:700,flexShrink:0}}>{i+1}.</span>
                  <span style={{fontFamily:G.mono,fontSize:8,color:G.ink2,lineHeight:1.5}}>{c}</span>
                </div>
              ))}
            </div>
          )}
          {/* Points de coaching */}
          <div style={{marginTop:8,background:'rgba(26,25,22,0.02)',border:`1px solid ${G.rule}`,padding:'7px 9px'}}>
            <div style={{fontFamily:G.mono,fontSize:7,letterSpacing:'.12em',textTransform:'uppercase',color:G.gold,marginBottom:4}}>Points de coaching</div>
            {ex.coaching.map((c,i)=>(
              <div key={i} style={{display:'flex',gap:5,marginBottom:2}}>
                <span style={{fontFamily:G.mono,fontSize:8,color:dc,flexShrink:0,fontWeight:700}}>{i+1}.</span>
                <span style={{fontFamily:G.mono,fontSize:8,color:G.ink2,lineHeight:1.5}}>{c}</span>
              </div>
            ))}
          </div>
          {/* Matériel + Catégories */}
          <div style={{marginTop:8,display:'flex',gap:12,flexWrap:'wrap'}}>
            <div>
              <div style={{fontFamily:G.mono,fontSize:7,letterSpacing:'.12em',textTransform:'uppercase',color:G.muted,marginBottom:3}}>Matériel</div>
              <div style={{display:'flex',gap:3,flexWrap:'wrap'}}>
                {ex.materiel.map((m,i)=><span key={i} style={{fontFamily:G.mono,fontSize:7,padding:'1px 5px',background:G.rule,color:G.ink2}}>{m}</span>)}
              </div>
            </div>
            <div>
              <div style={{fontFamily:G.mono,fontSize:7,letterSpacing:'.12em',textTransform:'uppercase',color:G.muted,marginBottom:3}}>Catégories</div>
              <div style={{display:'flex',gap:3,flexWrap:'wrap'}}>
                {ex.cats.map((c,i)=><span key={i} style={{fontFamily:G.mono,fontSize:7,padding:'1px 5px',background:G.goldBg,color:G.gold,border:`1px solid ${G.goldBdr}`,fontWeight:600}}>{c}</span>)}
              </div>
            </div>
          </div>
          {/* Variantes */}
          {ex.variantes&&ex.variantes.length>0&&(
            <div style={{marginTop:8}}>
              <div style={{fontFamily:G.mono,fontSize:7,letterSpacing:'.12em',textTransform:'uppercase',color:'#2563eb',marginBottom:3,fontWeight:700}}>Variantes & progressions</div>
              {ex.variantes.map((v,i)=>(
                <div key={i} style={{display:'flex',gap:5,marginBottom:2,padding:'3px 7px',borderLeft:'2px solid rgba(37,99,235,0.2)',background:i%2===0?'rgba(37,99,235,0.03)':'transparent'}}>
                  <span style={{fontFamily:G.mono,fontSize:8,color:'#2563eb',fontWeight:700,flexShrink:0}}>→</span>
                  <span style={{fontFamily:G.mono,fontSize:8,color:G.muted,lineHeight:1.45}}>{v}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function SessionBuilder({session,onRemove,onMoveUp,onMoveDown,onExport,onClear}){
  const tot = session.reduce((a,e)=>a+(e.duree||0),0)
  // Vérifier l'équilibre
  const hasEchauffement = session.some(e=>e.type==='echauffement')
  const highCount = session.filter(e=>e.intensite==='haute').length
  const warnings = []
  if(session.length>0 && !hasEchauffement) warnings.push('Pas d\'échauffement — pensez à en ajouter un')
  if(highCount>=3) warnings.push(`${highCount} procédés haute intensité — attention à la charge`)

  return(
    <div style={{background:G.dark,padding:'12px 13px',marginBottom:8,borderLeft:`3px solid ${G.gold}`}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:session.length>0?8:0}}>
        <div>
          <div style={{fontFamily:G.display,fontSize:16,textTransform:'uppercase',color:G.gold}}>Ma séance</div>
          <div style={{fontFamily:G.mono,fontSize:8,color:'rgba(245,242,235,0.4)',marginTop:1}}>{session.length}/6 procédés · {tot} min</div>
        </div>
        <div style={{display:'flex',gap:4}}>
          {session.length>0&&<button onClick={onClear} style={{fontFamily:G.mono,fontSize:7,color:'rgba(245,242,235,0.3)',background:'transparent',border:'1px solid rgba(255,255,255,0.1)',padding:'3px 7px',cursor:'pointer'}}>Vider</button>}
          {session.length>0&&<button onClick={onExport} style={{fontFamily:G.display,fontSize:11,textTransform:'uppercase',color:'#0f0f0d',background:G.gold,border:'none',padding:'3px 10px',cursor:'pointer'}}>Export PDF</button>}
        </div>
      </div>
      {session.length===0&&(
        <div style={{textAlign:'center',padding:'12px 0',fontFamily:G.mono,fontSize:8,color:'rgba(245,242,235,0.25)'}}>
          Sélectionnez une séance suggérée ou composez la vôtre avec <span style={{color:G.gold}}>+ Procédé</span> (max 6)
        </div>
      )}
      {session.map((ex,i)=>{
        const dc = DOMAINE_COLORS[ex.domaine]||G.muted
        const tc = TYPE_COLORS[ex.type]||G.muted
        return(
          <div key={ex.id+'-'+i} style={{display:'flex',alignItems:'center',gap:7,background:'rgba(245,242,235,0.03)',borderLeft:`3px solid ${dc}`,padding:'6px 9px',marginBottom:2}}>
            <span style={{fontFamily:G.display,fontSize:14,color:G.gold,minWidth:16}}>{i+1}</span>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontFamily:G.mono,fontSize:9,color:'rgba(245,242,235,0.8)',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{ex.nom}</div>
              <div style={{display:'flex',gap:4,marginTop:1}}>
                <span style={{fontFamily:G.mono,fontSize:7,color:tc}}>{TYPE_LABELS[ex.type]||ex.type}</span>
                <span style={{fontFamily:G.mono,fontSize:7,color:'rgba(245,242,235,0.2)'}}>·</span>
                <span style={{fontFamily:G.mono,fontSize:7,color:'rgba(245,242,235,0.3)'}}>{ex.duree}min</span>
              </div>
            </div>
            <div style={{display:'flex',gap:2}}>
              <button onClick={()=>onMoveUp(i)} disabled={i===0} style={{width:18,height:18,border:'none',background:i===0?'transparent':'rgba(255,255,255,0.06)',color:i===0?'rgba(255,255,255,0.1)':'rgba(255,255,255,0.5)',cursor:i===0?'default':'pointer',fontFamily:G.mono,fontSize:8}}>▲</button>
              <button onClick={()=>onMoveDown(i)} disabled={i===session.length-1} style={{width:18,height:18,border:'none',background:i===session.length-1?'transparent':'rgba(255,255,255,0.06)',color:i===session.length-1?'rgba(255,255,255,0.1)':'rgba(255,255,255,0.5)',cursor:i===session.length-1?'default':'pointer',fontFamily:G.mono,fontSize:8}}>▼</button>
              <button onClick={()=>onRemove(i)} style={{width:18,height:18,border:'none',background:'rgba(220,38,38,0.15)',color:'#ef4444',cursor:'pointer',fontFamily:G.mono,fontSize:8,fontWeight:700}}>✕</button>
            </div>
          </div>
        )
      })}
      {session.length>0&&(
        <div style={{display:'flex',gap:1,height:4,borderRadius:2,overflow:'hidden',background:'rgba(255,255,255,0.05)',marginTop:6}}>
          {session.map((ex,i)=><div key={i} style={{flex:ex.duree||1,background:DOMAINE_COLORS[ex.domaine]||G.muted}}/>)}
        </div>
      )}
      {warnings.length>0&&(
        <div style={{marginTop:6}}>
          {warnings.map((w,i)=><div key={i} style={{fontFamily:G.mono,fontSize:7,color:G.orange,padding:'2px 0'}}>→ {w}</div>)}
        </div>
      )}
    </div>
  )
}

function exportSeancePDF(session, meta){
  const tot = session.reduce((a,e)=>a+(e.duree||0),0)
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Séance Insightball</title>
  <link href="https://fonts.googleapis.com/css2?family=Anton&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
  <style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'JetBrains Mono',monospace;background:#f5f2eb;color:#1a1916;padding:20px;max-width:780px;margin:0 auto}
  .hd{text-align:center;border-bottom:3px solid #c9a227;padding-bottom:14px;margin-bottom:18px}.hd h1{font-family:'Anton',sans-serif;font-size:22px;text-transform:uppercase}.hd .s{font-size:10px;color:#78716c;margin-top:3px}
  .ex{border:1px solid rgba(26,25,22,0.08);margin-bottom:8px;padding:12px;background:white;page-break-inside:avoid}
  .eh{display:flex;align-items:center;gap:8px;margin-bottom:6px}.en{font-family:'Anton',sans-serif;font-size:18px;color:#c9a227;min-width:24px}
  .et{font-family:'Anton',sans-serif;font-size:14px;text-transform:uppercase}.em{font-size:9px;color:#78716c;margin-top:1px}
  .sc{margin-top:6px}.sl{font-size:7px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#78716c;margin-bottom:2px}
  .sc p{font-size:10px;line-height:1.5}.cp{background:#f5f2eb;border-left:3px solid #c9a227;padding:4px 7px;margin-bottom:2px;font-size:9px;line-height:1.4}
  .ft{text-align:center;margin-top:14px;font-size:8px;color:#a8a29e}
  @media print{body{padding:10px}@page{margin:12mm}}</style></head><body>
  <div class="hd"><h1>Séance d'entraînement</h1><div class="s">${meta||''} · ${session.length} procédés · ${tot} minutes · insightball.com</div></div>
  ${session.map((ex,i)=>{
    const dl = DOMAINE_LABELS[ex.domaine]||ex.domaine
    const tl = TYPE_LABELS[ex.type]||ex.type
    const il = INTENSITE_MAP[ex.intensite]
    return `<div class="ex" style="border-left:4px solid ${DOMAINE_COLORS[ex.domaine]||'#999'}">
    <div class="eh"><span class="en">${i+1}</span><div><div class="et">${ex.nom}</div><div class="em">${dl} · ${tl} · ${ex.duree}min · ${ex.j_min}-${ex.j_max} joueurs · Intensité ${il?il.label:''}</div></div></div>
    <div class="sc"><div class="sl">Objectif</div><p>${ex.objectif}</p></div>
    <div class="sc"><div class="sl">Mise en place</div><p><b>Dimensions :</b> ${ex.mise_en_place.dimensions}<br><b>Organisation :</b> ${ex.mise_en_place.organisation}</p></div>
    <div class="sc"><div class="sl">Déroulement</div><p>${ex.deroulement}</p></div>
    <div class="sc"><div class="sl">Points de coaching</div>${ex.coaching.map((p,j)=>`<div class="cp"><b>${j+1}.</b> ${p}</div>`).join('')}</div>
    <div class="sc"><div class="sl">Matériel</div><p>${ex.materiel.join(' · ')}</p></div>
    ${ex.variantes&&ex.variantes.length?`<div class="sc"><div class="sl">Variantes</div><p>${ex.variantes.join(' | ')}</p></div>`:''}</div>`
  }).join('')}
  <div class="ft">Généré par Insightball · insightball.com</div>
  <script>window.onload=()=>window.print()<\/script></body></html>`
  const blob = new Blob([html],{type:'text/html'})
  window.open(URL.createObjectURL(blob),'_blank')
}

/* ═══════════════════════════════
   PAGE PRINCIPALE
═══════════════════════════════ */
export default function ProjetDeJeu(){
  const[step,setStep]=useState(0)
  const[sel,setSel]=useState([])
  const[formation,setFormation]=useState('4-3-3')
  const[categorie,setCategorie]=useState('Seniors')
  const[dateReprise,setDateReprise]=useState('')
  const[jours,setJours]=useState(['mardi','jeudi'])
  const[horaire,setHoraire]=useState('19:00')
  const[projetSaved,setProjetSaved]=useState(false)
  const[loadingPlan,setLoadingPlan]=useState(true)
  const[saving,setSaving]=useState(false)
  const[saveError,setSaveError]=useState('')

  // Séance
  const[themeSeance,setThemeSeance]=useState('pressing')
  const[weekThemes,setWeekThemes]=useState({})
  const[seanceTab,setSeanceTab]=useState('suggerees') // suggerees | composer
  const[session,setSession]=useState([])
  const[openExId,setOpenExId]=useState(null)
  const[filterDomaine,setFilterDomaine]=useState('all')
  const[filterType,setFilterType]=useState('all')

  // Charger le projet
  useEffect(()=>{
    let cancelled=false
    ;(async()=>{
      try{
        const res=await fetch(`${API}/game-plan`,{headers:authH()})
        if(res.ok&&!cancelled){
          const p=await safeJson(res)
          if(p&&p.id){
            setFormation(p.formation||'4-3-3')
            setCategorie(p.category||'Seniors')
            setSel(Array.isArray(p.principles)?p.principles:[])
            setJours(Array.isArray(p.training_days)?p.training_days:['mardi','jeudi'])
            setHoraire(p.training_time||'19:00')
            // start_date peut arriver comme "2026-08-01" ou "2026-08-01T00:00:00" — on garde juste la date
            const sd = p.start_date ? String(p.start_date).slice(0,10) : ''
            setDateReprise(sd)
            setWeekThemes(p.programming&&typeof p.programming==='object'?p.programming:{})
            // Ne marquer comme sauvé que si les données sont suffisantes
            if(sd && Array.isArray(p.principles) && p.principles.length>=3){
              setProjetSaved(true)
            }
          }
        }
      }catch(e){console.error('Erreur chargement projet:',e)}
      finally{if(!cancelled)setLoadingPlan(false)}
    })()
    return()=>{cancelled=true}
  },[])

  const saveProjet=async()=>{
    setSaving(true)
    setSaveError('')
    try{
      const res = await fetch(`${API}/game-plan`,{method:'PUT',headers:authH(),
        body:JSON.stringify({formation,category:categorie,principles:sel,
          training_days:jours,training_time:horaire,start_date:dateReprise||null,
          programming:weekThemes})})
      if(!res.ok){
        const err = await res.text().catch(()=>'')
        console.error('Erreur sauvegarde projet:',res.status,err)
        setSaveError(`Erreur ${res.status} — vérifiez votre connexion`)
        setSaving(false)
        return false
      }
      setProjetSaved(true)
      setSaving(false)
      return true
    }catch(e){
      console.error('Erreur réseau sauvegarde:',e)
      setSaveError('Erreur réseau — vérifiez votre connexion')
      setSaving(false)
      return false
    }
  }

  const toggle=id=>setSel(p=>p.includes(id)?p.filter(x=>x!==id):p.length>=5?p:[...p,id])
  const toggleJ=id=>setJours(p=>p.includes(id)?p.filter(x=>x!==id):[...p,id].sort((a,b)=>JOURS.findIndex(j=>j.id===a)-JOURS.findIndex(j=>j.id===b)))

  const allP=Object.values(PRINCIPES).flat()
  const selLabels=sel.map(id=>allP.find(p=>p.id===id)?.label).filter(Boolean)
  const joursLabels=jours.map(j=>JOURS.find(x=>x.id===j)?.l).join(' + ')
  const ok=sel.length>=3&&dateReprise&&jours.length>=1

  // Séance helpers
  const addToSession=(ex)=>{if(session.length<6)setSession(p=>[...p,ex])}
  const removeFromSession=(i)=>setSession(p=>p.filter((_,j)=>j!==i))
  const moveUp=(i)=>{if(i>0){const n=[...session];[n[i-1],n[i]]=[n[i],n[i-1]];setSession(n)}}
  const moveDown=(i)=>{if(i<session.length-1){const n=[...session];[n[i],n[i+1]]=[n[i+1],n[i]];setSession(n)}}
  const sessionIds=new Set(session.map(e=>e.id))

  // Séances suggérées pour le thème sélectionné
  const suggerees = SEANCES_SUGGEREES[themeSeance]?.seances || []

  // Filtrage catalogue
  const filtered = EXERCICES.filter(ex=>{
    if(filterDomaine!=='all' && ex.domaine!==filterDomaine) return false
    if(filterType!=='all' && ex.type!==filterType) return false
    return true
  })

  const periodDates=useMemo(()=>{
    if(!dateReprise)return[]
    let c=new Date(dateReprise)
    return PROG.map(p=>{const d=new Date(c);c.setDate(c.getDate()+p.wk*7);return d.toLocaleDateString('fr-FR',{day:'numeric',month:'short'})})
  },[dateReprise])

  const loadSuggested=(seance)=>{
    const exs = seance.procedes.map(id=>EXERCICES_BY_ID[id]).filter(Boolean)
    setSession(exs)
  }

  return(
    <DashboardLayout>
      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:none;}}@keyframes spin{to{transform:rotate(360deg);}}@media(max-width:768px){.pdj-g{grid-template-columns:1fr!important;}}`}</style>

      {loadingPlan ? (
        <div style={{textAlign:'center',padding:'80px 0'}}>
          <div style={{width:24,height:24,border:`2px solid ${G.goldBdr}`,borderTopColor:G.gold,borderRadius:'50%',animation:'spin .7s linear infinite',margin:'0 auto 12px'}}/>
          <p style={{fontFamily:G.mono,fontSize:9,letterSpacing:'.12em',textTransform:'uppercase',color:G.muted}}>Chargement...</p>
        </div>
      ) : <>

      <div style={{marginBottom:18,paddingBottom:12,borderBottom:`1px solid ${G.rule}`}}>
        <p style={{fontFamily:G.mono,fontSize:9,letterSpacing:'.16em',textTransform:'uppercase',color:G.gold,display:'flex',alignItems:'center',gap:8,marginBottom:5}}>
          <span style={{width:14,height:1,background:G.gold}}/>Planification</p>
        <h1 style={{fontFamily:G.display,fontSize:42,textTransform:'uppercase',lineHeight:.88,color:G.ink}}>Projet <span style={{color:G.gold}}>de jeu.</span></h1>
      </div>

      <div style={{maxWidth:880}}>
        {!projetSaved ? (
          <>
            <StepBar step={step} labels={['Identité','Programmation','Calendrier + Séance']}/>

            {/* ═══ ÉTAPE 1 : PROJET ═══ */}
            {step===0&&<div style={{animation:'fadeIn .3s ease'}}>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:16}} className="pdj-g">
                <div><label style={labSt}>Formation</label><select value={formation} onChange={e=>setFormation(e.target.value)} style={selSt}>
                  {['4-4-2','4-3-3','3-5-2','4-2-3-1','3-4-3','4-1-4-1'].map(f=><option key={f}>{f}</option>)}</select></div>
                <div><label style={labSt}>Catégorie</label><select value={categorie} onChange={e=>setCategorie(e.target.value)} style={selSt}>
                  {['U14','U15','U16','U17','U18','U19','Seniors'].map(c=><option key={c}>{c}</option>)}</select></div>
                <div><label style={labSt}>Date de reprise</label><input type="date" value={dateReprise} onChange={e=>setDateReprise(e.target.value)} style={selSt}/></div>
                <div><label style={labSt}>Horaire</label><input type="time" value={horaire} onChange={e=>setHoraire(e.target.value)} style={selSt}/></div>
              </div>
              <div style={{marginBottom:18}}>
                <label style={labSt}>Jours d'entraînement</label>
                <div style={{display:'flex',gap:4,flexWrap:'wrap'}}>{JOURS.map(j=><Tag key={j.id} active={jours.includes(j.id)} onClick={()=>toggleJ(j.id)}>{j.l}</Tag>)}</div>
              </div>
              <div style={{marginBottom:12,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                <div><h2 style={{fontFamily:G.display,fontSize:20,textTransform:'uppercase',color:G.ink}}>Principes <span style={{color:G.gold}}>de jeu</span></h2>
                  <p style={{fontFamily:G.mono,fontSize:8,color:G.muted,marginTop:1}}>3 à 5 principes</p></div>
                <div style={{fontFamily:G.display,fontSize:20,color:sel.length>=3?G.gold:G.muted}}>{sel.length}<span style={{fontSize:11,color:G.muted}}>/5</span></div>
              </div>
              {Object.entries(PRINCIPES).map(([phase,list])=>(
                <div key={phase} style={{marginBottom:12}}>
                  <div style={{fontFamily:G.mono,fontSize:7,letterSpacing:'.1em',textTransform:'uppercase',color:G.gold,marginBottom:4,display:'flex',alignItems:'center',gap:5}}>
                    <span style={{width:8,height:1.5,background:G.gold}}/>{phase}</div>
                  <div style={{display:'flex',flexDirection:'column',gap:3}}>
                    {list.map(p=><PrincipeCard key={p.id} p={p} sel={sel.includes(p.id)} onToggle={()=>toggle(p.id)}/>)}
                  </div>
                </div>
              ))}
              <div style={{position:'sticky',bottom:0,background:G.bg,borderTop:`1px solid ${G.rule}`,padding:'10px 0',marginTop:10}}>
                <button onClick={()=>setStep(1)} disabled={!ok} style={{width:'100%',padding:'12px',background:ok?G.gold:G.rule,border:'none',fontFamily:G.display,fontSize:14,textTransform:'uppercase',color:ok?'#0f0f0d':G.muted,cursor:ok?'pointer':'not-allowed'}}>Voir ma programmation →</button>
              </div>
            </div>}

            {/* ═══ ÉTAPE 2 : PROGRAMMATION ═══ */}
            {step===1&&<div style={{animation:'fadeIn .3s ease'}}>
              <div style={{background:G.dark,padding:'11px 13px',marginBottom:16,borderLeft:`3px solid ${G.gold}`}}>
                <div style={{fontFamily:G.mono,fontSize:7,letterSpacing:'.1em',textTransform:'uppercase',color:G.gold,marginBottom:5}}>Votre identité</div>
                <div style={{display:'flex',gap:4,flexWrap:'wrap',marginBottom:4}}>
                  {[formation,categorie,`${joursLabels} · ${horaire}`,dateReprise?`Reprise ${new Date(dateReprise).toLocaleDateString('fr-FR',{day:'numeric',month:'long'})}`:null].filter(Boolean).map((t,i)=>(
                    <span key={i} style={{fontFamily:G.mono,fontSize:8,padding:'2px 5px',background:i===0?G.gold+'20':'rgba(255,255,255,0.06)',border:`1px solid ${i===0?G.gold+'40':'rgba(255,255,255,0.1)'}`,color:i===0?G.gold:'rgba(245,242,235,0.5)'}}>{t}</span>
                  ))}
                </div>
                <div style={{display:'flex',gap:3,flexWrap:'wrap'}}>
                  {selLabels.map(l=><span key={l} style={{fontFamily:G.mono,fontSize:7,padding:'1px 4px',background:'rgba(245,242,235,0.06)',color:'rgba(245,242,235,0.4)'}}>{l}</span>)}
                </div>
              </div>
              <h2 style={{fontFamily:G.display,fontSize:20,textTransform:'uppercase',color:G.ink,marginBottom:2}}>Programmation <span style={{color:G.gold}}>annuelle</span></h2>
              <p style={{fontFamily:G.mono,fontSize:8,color:G.muted,marginBottom:14}}>{PROG.reduce((a,p)=>a+p.wk,0)} semaines · calée depuis votre reprise</p>
              {PROG.map((p,i)=><PeriodCard key={i} p={p} sd={periodDates[i]}/>)}
              <div style={{display:'flex',gap:8,marginTop:16,flexDirection:'column'}}>
                {saveError&&<div style={{fontFamily:G.mono,fontSize:9,color:G.red,background:G.redBg||'rgba(220,38,38,0.08)',border:`1px solid rgba(220,38,38,0.2)`,padding:'8px 10px'}}>{saveError}</div>}
                <div style={{display:'flex',gap:8}}>
                  <button onClick={()=>setStep(0)} disabled={saving} style={{flex:1,padding:'10px',background:'transparent',border:`1px solid ${G.rule}`,fontFamily:G.mono,fontSize:9,textTransform:'uppercase',color:G.muted,cursor:saving?'not-allowed':'pointer'}}>← Modifier</button>
                  <button onClick={async()=>{await saveProjet()}} disabled={saving} style={{flex:2,padding:'10px',background:saving?G.goldBg:G.gold,border:saving?`1px solid ${G.goldBdr}`:'none',fontFamily:G.display,fontSize:13,textTransform:'uppercase',color:saving?G.gold:'#0f0f0d',cursor:saving?'wait':'pointer'}}>{saving?'Enregistrement...':'Enregistrer et préparer une séance →'}</button>
                </div>
              </div>
            </div>}
          </>
        ) : (
          /* ═══ SÉANCE DU JOUR — REFACTORÉ ═══ */
          <div style={{animation:'fadeIn .3s ease'}}>
            {/* Résumé projet */}
            <div style={{background:G.dark,padding:'10px 12px',marginBottom:16,borderLeft:`3px solid ${G.gold}`,display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:8}}>
              <div style={{display:'flex',gap:4,flexWrap:'wrap',alignItems:'center'}}>
                <span style={{fontFamily:G.mono,fontSize:7,letterSpacing:'.1em',textTransform:'uppercase',color:G.gold}}>Projet :</span>
                {[formation,categorie,joursLabels].map((t,i)=>(
                  <span key={i} style={{fontFamily:G.mono,fontSize:8,padding:'2px 5px',background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.1)',color:'rgba(245,242,235,0.5)'}}>{t}</span>
                ))}
              </div>
              <button onClick={()=>{setProjetSaved(false);setStep(0)}} style={{fontFamily:G.mono,fontSize:7,color:G.gold,background:'transparent',border:`1px solid ${G.goldBdr}`,padding:'3px 8px',cursor:'pointer'}}>Modifier le projet</button>
            </div>

            {/* ═══ CALENDRIER SAISON ═══ */}
            {dateReprise && (
              <div style={{marginBottom:28}}>
                <h2 style={{fontFamily:G.display,fontSize:22,textTransform:'uppercase',color:G.ink,marginBottom:3}}>Programmation <span style={{color:G.gold}}>annuelle</span></h2>
                <p style={{fontFamily:G.mono,fontSize:8,color:G.muted,marginBottom:12}}>Glissez-déposez les thèmes · Clic droit pour les options · Cliquez "▶ Séance" pour générer</p>
                <CalendrierSaison
                  startDate={dateReprise}
                  totalWeeks={41}
                  weekThemes={weekThemes}
                  onUpdateThemes={(t)=>{setWeekThemes(t);fetch(`${API}/game-plan`,{method:'PUT',headers:authH(),body:JSON.stringify({formation,category:categorie,principles:sel,training_days:jours,training_time:horaire,start_date:dateReprise,programming:t})}).catch(console.error)}}
                  onSelectWeek={(wId,tId)=>{if(tId){setThemeSeance(tId);setSession([])}}}
                />
              </div>
            )}

            <div style={{borderTop:`1px solid ${G.rule}`,paddingTop:20,marginTop:4}}/>
            <h2 style={{fontFamily:G.display,fontSize:24,textTransform:'uppercase',color:G.ink,marginBottom:3}}>Préparer <span style={{color:G.gold}}>ma séance</span></h2>
            <p style={{fontFamily:G.mono,fontSize:9,color:G.muted,marginBottom:14}}>Choisissez un thème, puis une séance suggérée ou composez la vôtre.</p>

            {/* Sélection thème */}
            <div style={{marginBottom:12}}>
              <label style={labSt}>Thème de la séance</label>
              <select value={themeSeance} onChange={e=>{setThemeSeance(e.target.value);setSession([])}} style={selSt}>
                {THEMES_SEANCE.map(t=><option key={t.id} value={t.id}>{t.label}</option>)}
              </select>
            </div>

            {/* Session builder */}
            <SessionBuilder session={session} onRemove={removeFromSession} onMoveUp={moveUp} onMoveDown={moveDown}
              onExport={()=>exportSeancePDF(session,`${formation} · ${categorie} · ${joursLabels} · ${horaire}`)}
              onClear={()=>setSession([])}/>

            {/* Onglets */}
            <div style={{display:'flex',gap:0,marginBottom:12,marginTop:12}}>
              {[{k:'suggerees',l:`Séances suggérées (${suggerees.length})`},{k:'composer',l:`Composer (${EXERCICES.length} procédés)`}].map(t=>(
                <button key={t.k} onClick={()=>setSeanceTab(t.k)} style={{flex:1,padding:'10px',border:`1px solid ${G.rule}`,borderBottom:seanceTab===t.k?`2px solid ${G.gold}`:`1px solid ${G.rule}`,
                  background:seanceTab===t.k?G.goldBg:G.surface,fontFamily:G.mono,fontSize:9,textTransform:'uppercase',letterSpacing:'.06em',
                  color:seanceTab===t.k?G.gold:G.muted,fontWeight:seanceTab===t.k?700:400,cursor:'pointer'}}>{t.l}</button>
              ))}
            </div>

            {/* ═══ ONGLET : SÉANCES SUGGÉRÉES ═══ */}
            {seanceTab==='suggerees'&&(
              <div style={{animation:'fadeIn .2s ease'}}>
                {suggerees.length===0&&(
                  <div style={{textAlign:'center',padding:'30px',fontFamily:G.mono,fontSize:9,color:G.muted}}>Aucune séance suggérée pour ce thème.</div>
                )}
                {suggerees.map((s,i)=>{
                  const exs = s.procedes.map(id=>EXERCICES_BY_ID[id]).filter(Boolean)
                  const isLoaded = session.length>0 && session.length===exs.length && session.every((e,j)=>e.id===exs[j]?.id)
                  return(
                    <div key={i} style={{background:G.surface,border:`1px solid ${isLoaded?G.gold:G.rule}`,borderLeft:`3px solid ${G.gold}`,marginBottom:6,padding:'12px 14px'}}>
                      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:6}}>
                        <div>
                          <h3 style={{fontFamily:G.display,fontSize:15,textTransform:'uppercase',color:G.ink,margin:0}}>{s.nom}</h3>
                          <p style={{fontFamily:G.mono,fontSize:8,color:G.muted,margin:'2px 0 0'}}>{s.duree_totale} min · {exs.length} procédés</p>
                        </div>
                        <button onClick={()=>loadSuggested(s)} style={{fontFamily:G.display,fontSize:11,textTransform:'uppercase',padding:'5px 12px',
                          background:isLoaded?G.goldBg:G.gold,color:isLoaded?G.gold:'#0f0f0d',
                          border:isLoaded?`1px solid ${G.goldBdr}`:'none',cursor:'pointer'}}>
                          {isLoaded?'Chargée':'Charger'}
                        </button>
                      </div>
                      <p style={{fontFamily:G.mono,fontSize:8,color:G.gold,marginBottom:8}}>→ {s.objectif}</p>
                      <div style={{display:'flex',flexDirection:'column',gap:2}}>
                        {exs.map((ex,j)=>{
                          const dc = DOMAINE_COLORS[ex.domaine]||G.muted
                          const tc = TYPE_COLORS[ex.type]||G.muted
                          return(
                            <div key={j} style={{display:'flex',alignItems:'center',gap:6,padding:'4px 7px',background:j%2===0?G.goldBg:'transparent'}}>
                              <span style={{fontFamily:G.display,fontSize:12,color:G.gold,minWidth:14}}>{j+1}</span>
                              <div style={{width:3,height:14,background:dc,flexShrink:0}}/>
                              <div style={{flex:1,minWidth:0}}>
                                <div style={{fontFamily:G.mono,fontSize:9,color:G.ink,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{ex.nom}</div>
                                <div style={{display:'flex',gap:4}}>
                                  <span style={{fontFamily:G.mono,fontSize:7,color:tc}}>{TYPE_LABELS[ex.type]}</span>
                                  <span style={{fontFamily:G.mono,fontSize:7,color:G.muted}}>{ex.duree}min</span>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                      <p style={{fontFamily:G.mono,fontSize:8,color:G.muted,fontStyle:'italic',marginTop:6}}>Débrief : {s.debrief}</p>
                    </div>
                  )
                })}
              </div>
            )}

            {/* ═══ ONGLET : COMPOSER SA SÉANCE ═══ */}
            {seanceTab==='composer'&&(
              <div style={{animation:'fadeIn .2s ease'}}>
                {/* Filtres */}
                <div style={{display:'flex',gap:6,marginBottom:10,flexWrap:'wrap'}} className="pdj-g">
                  <select value={filterDomaine} onChange={e=>setFilterDomaine(e.target.value)} style={{...selSt,flex:1,minWidth:130}}>
                    <option value="all">Tous domaines</option>
                    {Object.entries(DOMAINE_LABELS).map(([k,v])=><option key={k} value={k}>{v}</option>)}
                  </select>
                  <select value={filterType} onChange={e=>setFilterType(e.target.value)} style={{...selSt,flex:1,minWidth:110}}>
                    <option value="all">Tous types</option>
                    {Object.entries(TYPE_LABELS).map(([k,v])=><option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                <div style={{fontFamily:G.mono,fontSize:8,color:G.muted,marginBottom:8}}>{filtered.length} procédé{filtered.length>1?'s':''}</div>

                {/* Liste exercices */}
                <div style={{display:'flex',flexDirection:'column',gap:3}}>
                  {filtered.map(ex=>(
                    <ExerciceCard key={ex.id} ex={ex} isOpen={openExId===ex.id} onToggle={()=>setOpenExId(openExId===ex.id?null:ex.id)}
                      onAdd={addToSession} inSession={sessionIds.has(ex.id)} sessionFull={session.length>=6}/>
                  ))}
                </div>
                {filtered.length===0&&<div style={{textAlign:'center',padding:'30px',fontFamily:G.mono,fontSize:9,color:G.muted}}>Aucun procédé ne correspond aux filtres.</div>}
              </div>
            )}

            {/* Teaser IA */}
            <div style={{background:G.dark,padding:'16px 14px',marginTop:18,borderLeft:`3px solid ${G.gold}`,display:'flex',gap:10,alignItems:'center',flexWrap:'wrap'}}>
              <div style={{flex:1,minWidth:140}}>
                <div style={{fontFamily:G.mono,fontSize:7,letterSpacing:'.12em',textTransform:'uppercase',color:G.gold,marginBottom:3}}>Bientôt</div>
                <h3 style={{fontFamily:G.display,fontSize:16,textTransform:'uppercase',color:'#f5f2eb',marginBottom:3}}>Analyse vidéo <span style={{color:G.gold}}>→</span> Séances</h3>
                <p style={{fontFamily:G.mono,fontSize:8,color:'rgba(245,242,235,0.3)',lineHeight:1.5}}>Les stats de vos matchs ajusteront vos séances automatiquement.</p>
              </div>
            </div>
          </div>
        )}
      </div>
      </>}
    </DashboardLayout>
  )
}
