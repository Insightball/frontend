import { useState, useMemo, useEffect } from "react"
import DashboardLayout from '../components/DashboardLayout'
import { T, globalStyles } from '../theme'
import CalendrierSaison from '../components/CalendrierSaison'

const API = 'https://backend-pued.onrender.com/api'
function authH() {
  return { Authorization: `Bearer ${localStorage.getItem('insightball_token')}`, 'Content-Type': 'application/json' }
}

const G = {
  bg:'#f5f2eb',surface:'#ffffff',dark:'#0a0908',
  ink:'#1a1916',ink2:'#2d2c2a',muted:'rgba(26,25,22,0.45)',
  gold:'#c9a227',goldBg:'rgba(201,162,39,0.07)',goldBdr:'rgba(201,162,39,0.22)',
  rule:'rgba(26,25,22,0.09)',
  green:'#16a34a',red:'#dc2626',blue:'#2563eb',orange:'#d97706',purple:'#8b5cf6',
  mono:"'JetBrains Mono',monospace",display:"'Anton',sans-serif",
}

/* ═══════════════════════════════
   TABLEAU DIMENSIONS FFF
   Effectif → taille terrain
═══════════════════════════════ */
const DIMENSIONS = {
  // [effectif par équipe] : { small, medium, large }
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
   TERRAIN SVG
═══════════════════════════════ */
function Pitch({w=300,h=200,zone='half',els=[]}){
  const pw=100,ph=zone==='small'?38:zone==='half'?64:100
  return(
    <div style={{background:'#1a3d17',borderRadius:3,padding:6,display:'inline-block'}}>
      <svg viewBox={`0 0 ${pw} ${ph}`} width={w} height={h} style={{display:'block'}}>
        <rect x="3" y="3" width={pw-6} height={ph-6} rx="0.5" fill="#2d5a27" stroke="rgba(255,255,255,0.3)" strokeWidth="0.5"/>
        {zone==='full'&&<><line x1="3" y1={ph/2} x2={pw-3} y2={ph/2} stroke="rgba(255,255,255,0.22)" strokeWidth="0.4"/>
          <circle cx={pw/2} cy={ph/2} r="7" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.4"/>
          <rect x={pw/2-16} y="3" width="32" height="12" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.4"/>
          <rect x={pw/2-7} y="3" width="14" height="4.5" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="0.3"/></>}
        <rect x={pw/2-16} y={ph-3-12} width="32" height="12" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="0.4"/>
        <rect x={pw/2-7} y={ph-3-4.5} width="14" height="4.5" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="0.3"/>
        <defs>
          <marker id="mW" markerWidth="3.5" markerHeight="2.5" refX="3" refY="1.25" orient="auto"><polygon points="0,0 3.5,1.25 0,2.5" fill="rgba(255,255,255,0.6)"/></marker>
          <marker id="mG" markerWidth="3.5" markerHeight="2.5" refX="3" refY="1.25" orient="auto"><polygon points="0,0 3.5,1.25 0,2.5" fill="#c9a227"/></marker>
          <marker id="mB" markerWidth="3.5" markerHeight="2.5" refX="3" refY="1.25" orient="auto"><polygon points="0,0 3.5,1.25 0,2.5" fill="#60a5fa"/></marker>
          <marker id="mR" markerWidth="3.5" markerHeight="2.5" refX="3" refY="1.25" orient="auto"><polygon points="0,0 3.5,1.25 0,2.5" fill="#f87171"/></marker>
        </defs>
        {els.filter(e=>e.t==='z').map((z,i)=><rect key={`z${i}`} x={z.x} y={z.y} width={z.w} height={z.h} fill={z.fill||'rgba(201,162,39,0.12)'} stroke={z.stroke||'rgba(201,162,39,0.35)'} strokeWidth="0.4" strokeDasharray={z.dash?"1.5,1":"none"} rx="0.5"/>)}
        {els.filter(e=>e.t==='a').map((a,i)=><line key={`a${i}`} x1={a.x1} y1={a.y1} x2={a.x2} y2={a.y2} stroke={a.c||'rgba(255,255,255,0.55)'} strokeWidth={a.bold?"0.9":"0.5"} strokeDasharray={a.dash?"1.5,1.5":"none"} markerEnd={`url(#${a.m||'mW'})`}/>)}
        {els.filter(e=>e.t==='ca').map((a,i)=><path key={`ca${i}`} d={`M${a.x1},${a.y1} Q${a.cx},${a.cy} ${a.x2},${a.y2}`} fill="none" stroke={a.c||'rgba(255,255,255,0.55)'} strokeWidth="0.5" strokeDasharray={a.dash?"1.5,1.5":"none"} markerEnd={`url(#${a.m||'mW'})`}/>)}
        {els.filter(e=>e.t==='p').map((p,i)=><g key={`p${i}`}><circle cx={p.x} cy={p.y} r={p.r||2.3} fill={p.c||'#c9a227'} stroke="rgba(255,255,255,0.75)" strokeWidth="0.35"/>{p.l&&<text x={p.x} y={p.y+0.7} textAnchor="middle" fill="#fff" fontSize="2" fontWeight="700" fontFamily="sans-serif">{p.l}</text>}</g>)}
        {els.filter(e=>e.t==='cone').map((c,i)=><polygon key={`c${i}`} points={`${c.x},${c.y-1} ${c.x-0.8},${c.y+0.7} ${c.x+0.8},${c.y+0.7}`} fill={c.c||'#f59e0b'} strokeWidth="0.2"/>)}
        {els.filter(e=>e.t==='b').map((b,i)=><circle key={`b${i}`} cx={b.x} cy={b.y} r="1.3" fill="#fff" stroke="#555" strokeWidth="0.25"/>)}
        {els.filter(e=>e.t==='txt').map((t,i)=><text key={`t${i}`} x={t.x} y={t.y} textAnchor="middle" fill={t.c||'rgba(255,255,255,0.35)'} fontSize={t.s||"2.2"} fontFamily="sans-serif" fontWeight="600">{t.v}</text>)}
      </svg>
    </div>
  )
}

/* ═══════════════════════════════
   DONNÉES
═══════════════════════════════ */
const PRINCIPES = {
  'Phase offensive':[
    {id:'po1',label:'Construction courte depuis le GK',desc:'Relance au sol, circuits courts, patience'},
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
  {id:'pressing',label:'Pressing haut',icon:'⚡',cat:'défensif'},
  {id:'construction',label:'Construction depuis le GK',icon:'🔨',cat:'offensif'},
  {id:'transition_off',label:'Transition offensive',icon:'🏃',cat:'transition'},
  {id:'transition_def',label:'Transition défensive',icon:'🛡️',cat:'transition'},
  {id:'entre_lignes',label:'Jeu entre les lignes',icon:'🎯',cat:'offensif'},
  {id:'cote_fort',label:'Jeu côté fort / triangles',icon:'🔺',cat:'offensif'},
  {id:'finition',label:'Finition + efficacité',icon:'⚽',cat:'offensif'},
  {id:'bloc',label:'Bloc défensif',icon:'🧱',cat:'défensif'},
  {id:'cpa_off',label:'CPA offensifs',icon:'🎪',cat:'cpa'},
  {id:'physique',label:'Physique intégré',icon:'💪',cat:'physique'},
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
   GÉNÉRATEUR DE SÉANCE
   Adapte effectifs + dimensions
═══════════════════════════════ */
function generateSeance(theme, nbPresents) {
  const n = nbPresents || 16
  const half = Math.floor(n / 2)
  const jrPT = Math.min(half, 8) // jeu réduit par équipe
  const exPT = Math.min(Math.floor(n / 3), 5) // exercice par groupe
  const matchPT = Math.floor((n - 2) / 2) // match par équipe (-2 GK)
  const rondoAtt = Math.min(n - 2, 6)
  const rondoDef = 2

  // Helpers dimensions
  const DIM = {
    1:{s:'5×10m',m:'10×15m',l:'15×20m'},2:{s:'10×15m',m:'15×20m',l:'20×25m'},
    3:{s:'15×20m',m:'20×25m',l:'25×30m'},4:{s:'20×25m',m:'25×30m',l:'30×35m'},
    5:{s:'25×30m',m:'30×35m',l:'35×40m'},6:{s:'30×40m',m:'35×45m',l:'40×50m'},
    7:{s:'35×50m',m:'40×55m',l:'45×60m'},8:{s:'35×55m',m:'40×60m',l:'45×65m'},
    9:{s:'40×60m',m:'45×65m',l:'50×70m'},10:{s:'45×65m',m:'50×70m',l:'55×75m'},
    11:{s:'50×68m',m:'55×75m',l:'terrain complet'},
  }
  function gd(pt,sz='m'){const k=Math.min(Math.max(pt,1),11);return(DIM[k]||DIM[6])[sz]}

  const jrDim = gd(jrPT,'m')
  const matchDim = gd(matchPT,'l')
  const rondoDim = gd(Math.ceil(rondoAtt/2),'s')

  // Joueurs pour les schémas — positions types
  const goldTeam = (count,startY=18,endY=45) => {
    const positions = [
      {x:50,y:startY},{x:28,y:startY+8},{x:72,y:startY+8},
      {x:35,y:startY+18},{x:65,y:startY+18},{x:50,y:startY+22},
      {x:20,y:startY+12},{x:80,y:startY+12}
    ]
    return positions.slice(0,count).map(p=>({t:'p',x:p.x,y:p.y,c:'#c9a227'}))
  }
  const blueTeam = (count,startY=58) => {
    const positions = [
      {x:50,y:startY},{x:28,y:startY+8},{x:72,y:startY+8},
      {x:35,y:startY+18},{x:65,y:startY+18},{x:50,y:startY+22},
      {x:20,y:startY+12},{x:80,y:startY+12}
    ]
    return positions.slice(0,count).map(p=>({t:'p',x:p.x,y:p.y,c:'#3b82f6'}))
  }

  // ═══ DÉBRIEF (commun à toutes les séances) ═══
  const debrief = (q1, q2) => ({
    nom:'Débrief',duree:'5 min',type:'DÉBRIEF',
    objectif:'Ancrer les apprentissages',
    desc:`En cercle. 2 questions : "${q1}" — "${q2}". Les joueurs répondent, le coach guide.`,
    coaching:['Faire PARLER les joueurs','1 point positif, 1 axe de progrès','5 min max'],
    pitch:null,
  })

  const ALL = {
    // ════════════════════════════════
    // 1. PRESSING HAUT
    // ════════════════════════════════
    pressing: {
      theme:'Pressing haut — déclencheurs',
      principe:'Pressing haut à la perte',
      objectif_seance:`Coordonner le pressing collectif sur signal. ${n} joueurs.`,
      blocs:[
        {nom:`Rondo ${rondoAtt}v${rondoDef}`,duree:'12 min',type:'ÉCHAUFFEMENT',
          objectif:'Activation + réaction à la perte de balle',
          desc:`${rondoAtt}v${rondoDef} dans un carré ${rondoDim}. 2 touches max. Le passeur fautif remplace le défenseur. Sans pause.`,
          coaching:['Passe ferme au sol','Orientation du corps AVANT de recevoir','Duo pressing : un ferme, l\'autre coupe'],
          pitch:{zone:'small',els:[
            {t:'z',x:18,y:4,w:28,h:28,fill:'rgba(255,255,255,0.04)',stroke:'rgba(255,255,255,0.15)'},
            {t:'p',x:20,y:7,c:'#c9a227'},{t:'p',x:44,y:7,c:'#c9a227'},{t:'p',x:20,y:29,c:'#c9a227'},{t:'p',x:44,y:29,c:'#c9a227'},{t:'p',x:32,y:4,c:'#c9a227'},
            {t:'p',x:29,y:15,c:'#ef4444',l:'D'},{t:'p',x:36,y:21,c:'#ef4444',l:'D'},
            {t:'a',x1:20,y1:7,x2:42,y2:7,c:'#c9a227',m:'mG'},
            {t:'a',x1:29,y1:15,x2:22,y2:9,c:'#ef4444',dash:true,m:'mR'},
            {t:'b',x:20,y:7},{t:'txt',x:32,y:36,v:rondoDim,s:'2'},
          ]}},
        {nom:`Pressing ${exPT}v${Math.max(exPT-1,2)} sur relance GK`,duree:'18 min',type:'SITUATION',
          objectif:'Pressing coordonné sur la sortie de balle du GK',
          desc:`Zone 30×25m. GK relance vers ${Math.max(exPT-1,2)} défenseurs. ${exPT} presseurs. Le central courbe sa course pour fermer la passe intérieure. Récupérer en 6 sec ou forcer le jeu long. Séries 2min30.`,
          coaching:['Course courbée du central — pas en ligne droite','Ailiers déclenchent EN MÊME TEMPS','Pas de récup en 6 sec → on recule'],
          pitch:{zone:'half',els:[
            {t:'z',x:18,y:25,w:64,h:32,fill:'rgba(239,68,68,0.06)',stroke:'rgba(239,68,68,0.2)',dash:true},
            {t:'txt',x:50,y:23,v:'ZONE PRESSING',s:'2',c:'rgba(239,68,68,0.3)'},
            {t:'p',x:50,y:58,c:'#3b82f6',l:'GK',r:3},{t:'p',x:35,y:44,c:'#3b82f6',l:'DC'},{t:'p',x:65,y:44,c:'#3b82f6',l:'DC'},
            {t:'p',x:50,y:30,c:'#c9a227',l:'9'},{t:'p',x:25,y:28,c:'#c9a227',l:'7'},{t:'p',x:75,y:28,c:'#c9a227',l:'11'},
            {t:'ca',x1:50,y1:30,cx:42,cy:35,x2:37,y2:43,c:'#c9a227',m:'mG'},
            {t:'a',x1:25,y1:28,x2:30,y2:42,c:'#c9a227',m:'mG',bold:true},
            {t:'a',x1:75,y1:28,x2:70,y2:42,c:'#c9a227',m:'mG',bold:true},
            {t:'b',x:50,y:58},{t:'txt',x:50,y:63,v:'30×25m'},
          ]}},
        {nom:`${jrPT}v${jrPT} récup haute = 3 pts`,duree:'20 min',type:'JEU RÉDUIT',
          objectif:'Pressing en jeu. Récompenser la récupération haute.',
          desc:`${jrPT}v${jrPT} + 2 GK sur ${jrDim}. But normal = 1 pt. But en 8 sec après récup camp adverse = 3 pts. Matchs 4 min.`,
          coaching:['Pressing EN BLOC','À la récup : 1re passe vers l\'avant','Pas de récup en 6 sec → repli'],
          pitch:{zone:'full',els:[
            {t:'z',x:5,y:4,w:90,h:44,fill:'rgba(239,68,68,0.05)',stroke:'rgba(239,68,68,0.18)',dash:true},
            {t:'txt',x:50,y:10,v:'ZONE RÉCUP = 3 PTS',s:'2.5',c:'rgba(239,68,68,0.3)'},
            ...goldTeam(jrPT),{t:'p',x:50,y:95,c:'#c9a227',l:'GK',r:2.8},
            ...blueTeam(jrPT),{t:'p',x:50,y:5,c:'#3b82f6',l:'GK',r:2.8},
            {t:'txt',x:50,y:99,v:jrDim},
          ]}},
        {nom:`${matchPT}v${matchPT} pressing déclenché`,duree:'20 min',type:'JEU À THÈME',
          objectif:'Application réelle. Coach gèle le jeu.',
          desc:`${matchPT}v${matchPT} + 2 GK sur ${matchDim}. Pressing déclenché UNIQUEMENT sur passe courte du GK. Jeu long = bloc médian. 2×8 min.`,
          coaching:['Le SIGNAL = passe courte du GK','Pressing échoue → REPLI','Valoriser les bons déclenchements'],
          pitch:{zone:'full',els:[
            {t:'z',x:8,y:15,w:84,h:3,fill:'rgba(201,162,39,0.2)',stroke:'rgba(201,162,39,0.4)'},
            {t:'txt',x:50,y:13,v:'LIGNE DÉCLENCHEMENT',s:'2',c:'rgba(201,162,39,0.4)'},
            {t:'p',x:50,y:20,c:'#c9a227'},{t:'p',x:28,y:20,c:'#c9a227'},{t:'p',x:72,y:20,c:'#c9a227'},
            {t:'p',x:22,y:32,c:'#c9a227'},{t:'p',x:42,y:30,c:'#c9a227'},{t:'p',x:58,y:30,c:'#c9a227'},{t:'p',x:78,y:32,c:'#c9a227'},
            {t:'a',x1:42,y1:30,x2:42,y2:22,c:'#c9a227',m:'mG',bold:true},
            {t:'a',x1:58,y1:30,x2:58,y2:22,c:'#c9a227',m:'mG',bold:true},
          ]}},
        debrief('C\'est quoi le signal du pressing ?','On fait quoi si on récupère pas en 6 sec ?'),
      ]
    },

    // ════════════════════════════════
    // 2. CONSTRUCTION DEPUIS LE GK
    // ════════════════════════════════
    construction: {
      theme:'Construction depuis le GK',
      principe:'Construction courte + jeu entre les lignes',
      objectif_seance:`Sortir le ballon proprement depuis le GK. Trouver les intervalles. ${n} joueurs.`,
      blocs:[
        {nom:`Conservation ${rondoAtt}v${rondoDef} orientée`,duree:'10 min',type:'ÉCHAUFFEMENT',
          objectif:'Activation + obligation de jouer vers l\'avant',
          desc:`${rondoAtt}v${rondoDef} dans ${rondoDim}. 2 touches. 1 pt si passe dans une mini-porte (2m) placée sur un petit côté. Rotation défenseurs 45 sec.`,
          coaching:['Chercher la passe avant DÈS que possible','Passe ferme dans le bon pied','Se montrer au bon timing'],
          pitch:{zone:'small',els:[
            {t:'z',x:14,y:3,w:36,h:30,fill:'rgba(255,255,255,0.03)',stroke:'rgba(255,255,255,0.12)'},
            {t:'z',x:25,y:2,w:4,h:1.5,fill:'rgba(201,162,39,0.3)',stroke:'#c9a227'},
            {t:'z',x:35,y:2,w:4,h:1.5,fill:'rgba(201,162,39,0.3)',stroke:'#c9a227'},
            {t:'p',x:16,y:10,c:'#c9a227'},{t:'p',x:48,y:10,c:'#c9a227'},{t:'p',x:16,y:28,c:'#c9a227'},{t:'p',x:48,y:28,c:'#c9a227'},{t:'p',x:32,y:18,c:'#c9a227'},
            {t:'p',x:28,y:13,c:'#ef4444',l:'D'},{t:'p',x:36,y:23,c:'#ef4444',l:'D'},
            {t:'a',x1:32,y1:18,x2:27,y2:4,c:'#c9a227',m:'mG',bold:true},
            {t:'b',x:16,y:10},{t:'txt',x:32,y:36,v:rondoDim},
          ]}},
        {nom:`Sortie de balle ${exPT+1}+GK v ${exPT}`,duree:'18 min',type:'SITUATION',
          objectif:'Construire depuis le GK sous pressing. 3 circuits.',
          desc:`Zone 30×25m. GK + 2 DC + 1 milieu relayeur + latéral(aux) contre ${exPT} presseurs. Franchir la ligne des 30m. Séries 2min30.`,
          coaching:['GK : ne PAS précipiter','DC : 1re touche ORIENTÉE vers l\'avant','Le 6 se démarque ENTRE les presseurs'],
          pitch:{zone:'half',els:[
            {t:'z',x:5,y:18,w:90,h:2.5,fill:'rgba(201,162,39,0.2)',stroke:'rgba(201,162,39,0.4)'},
            {t:'txt',x:50,y:16,v:'LIGNE 30m — OBJECTIF',s:'2',c:'rgba(201,162,39,0.35)'},
            {t:'p',x:50,y:58,c:'#3b82f6',l:'GK',r:3},{t:'p',x:35,y:44,c:'#3b82f6',l:'DC'},{t:'p',x:65,y:44,c:'#3b82f6',l:'DC'},
            {t:'p',x:50,y:32,c:'#3b82f6',l:'6'},{t:'p',x:82,y:36,c:'#3b82f6',l:'LD'},
            {t:'p',x:50,y:38,c:'#ef4444',l:'P'},{t:'p',x:30,y:34,c:'#ef4444',l:'P'},{t:'p',x:70,y:34,c:'#ef4444',l:'P'},
            {t:'a',x1:50,y1:56,x2:37,y2:46,c:'#60a5fa',m:'mB',bold:true},
            {t:'a',x1:35,y1:42,x2:48,y2:34,c:'#60a5fa',m:'mB'},
            {t:'b',x:50,y:58},{t:'txt',x:50,y:63,v:'30×25m'},
          ]}},
        {nom:`${jrPT}v${jrPT} passe entre lignes = 2 pts`,duree:'20 min',type:'JEU RÉDUIT',
          objectif:'Chercher la passe entre les lignes. Récompenser la prise de risque.',
          desc:`${jrPT}v${jrPT} + 2 GK sur ${jrDim}. Bande centrale 8m = "entre les lignes". But après passe AU SOL dans cette zone = 2 pts. Matchs 4 min.`,
          coaching:['Le joueur entre les lignes se MONTRE au bon moment','Passe entre lignes = signal d\'accélération','Si fermé au centre → jouer côté'],
          pitch:{zone:'full',els:[
            {t:'z',x:5,y:43,w:90,h:12,fill:'rgba(201,162,39,0.1)',stroke:'rgba(201,162,39,0.3)',dash:true},
            {t:'txt',x:50,y:48,v:'ZONE ENTRE LES LIGNES',s:'2.2',c:'rgba(201,162,39,0.35)'},
            ...goldTeam(jrPT,68,92),{t:'p',x:50,y:95,c:'#c9a227',l:'GK',r:2.8},
            ...blueTeam(jrPT,8),{t:'p',x:50,y:5,c:'#3b82f6',l:'GK',r:2.8},
            {t:'a',x1:50,y1:68,x2:50,y2:42,c:'#c9a227',m:'mG',bold:true},
            {t:'txt',x:50,y:99,v:jrDim},
          ]}},
        {nom:`${matchPT}v${matchPT} GK joue court obligatoire`,duree:'20 min',type:'JEU À THÈME',
          objectif:'Construction réelle. GK ne peut PAS jouer long.',
          desc:`${matchPT}v${matchPT} + 2 GK sur ${matchDim}. Jeu long = perte. Bonus si but après 5+ passes depuis GK. 2×8 min.`,
          coaching:['GK = joueur de champ avec les mains','DC offrir des solutions','Coach gèle 2-3 fois'],
          pitch:{zone:'full',els:[
            {t:'z',x:25,y:85,w:50,h:12,fill:'rgba(59,130,246,0.06)',stroke:'rgba(59,130,246,0.2)'},
            {t:'txt',x:50,y:83,v:'GK JOUE COURT',s:'2',c:'rgba(59,130,246,0.3)'},
            {t:'p',x:50,y:93,c:'#3b82f6',l:'GK',r:3},
            {t:'p',x:35,y:80,c:'#3b82f6'},{t:'p',x:65,y:80,c:'#3b82f6'},
            {t:'p',x:18,y:68,c:'#3b82f6'},{t:'p',x:50,y:65,c:'#3b82f6'},{t:'p',x:82,y:68,c:'#3b82f6'},
            {t:'a',x1:50,y1:91,x2:37,y2:82,c:'#60a5fa',m:'mB',bold:true},
            {t:'a',x1:35,y1:78,x2:48,y2:67,c:'#60a5fa',m:'mB'},
          ]}},
        debrief('Quand jouer court ? Quand jouer long ?','C\'est quoi la zone entre les lignes ?'),
      ]
    },

    // ════════════════════════════════
    // 3. TRANSITION OFFENSIVE
    // ════════════════════════════════
    transition_off: {
      theme:'Transition offensive rapide',
      principe:'Verticalité à la récupération',
      objectif_seance:`Exploiter la récupération de balle pour attaquer vite. ${n} joueurs.`,
      blocs:[
        {nom:`Jeu des couleurs 3 équipes`,duree:'12 min',type:'ÉCHAUFFEMENT',
          objectif:'Activation + transitions mentales rapides',
          desc:`3 équipes de ${Math.floor(n/3)}. 2 équipes conservent contre 1 qui presse. Qui perd le ballon presse. Transition permanente. 2 touches.`,
          coaching:['Identifier VITE qui est avec moi','Transition mentale instantanée','Première passe = sécurité'],
          pitch:{zone:'small',els:[
            {t:'z',x:10,y:3,w:42,h:32,fill:'rgba(255,255,255,0.03)',stroke:'rgba(255,255,255,0.12)'},
            {t:'p',x:15,y:8,c:'#c9a227'},{t:'p',x:45,y:8,c:'#c9a227'},{t:'p',x:30,y:5,c:'#c9a227'},
            {t:'p',x:15,y:30,c:'#3b82f6'},{t:'p',x:45,y:30,c:'#3b82f6'},{t:'p',x:30,y:32,c:'#3b82f6'},
            {t:'p',x:25,y:18,c:'#ef4444',l:'P'},{t:'p',x:35,y:18,c:'#ef4444',l:'P'},{t:'p',x:30,y:13,c:'#ef4444',l:'P'},
            {t:'txt',x:30,y:37,v:`3×${Math.floor(n/3)}`,s:'2'},
          ]}},
        {nom:`Transition 3v2 après récupération`,duree:'18 min',type:'SITUATION',
          objectif:'Exploiter le surnombre en transition',
          desc:`Phase défensive ${exPT}v${exPT} dans une moitié. Dès récupération, 3 joueurs partent en contre face à 2 défenseurs. 8 sec max pour finir. Alternance.`,
          coaching:['1re passe VERS L\'AVANT immédiate','Courses divergentes — écarter pour fixer','Pas de dribble inutile, jouer vite'],
          pitch:{zone:'full',els:[
            {t:'z',x:5,y:55,w:90,h:40,fill:'rgba(59,130,246,0.05)',stroke:'rgba(59,130,246,0.15)',dash:true},
            {t:'txt',x:50,y:53,v:'PHASE DÉFENSIVE',s:'2',c:'rgba(59,130,246,0.3)'},
            {t:'p',x:50,y:70,c:'#c9a227'},{t:'p',x:30,y:75,c:'#c9a227'},{t:'p',x:70,y:75,c:'#c9a227'},
            {t:'p',x:50,y:80,c:'#3b82f6'},{t:'p',x:35,y:85,c:'#3b82f6'},{t:'p',x:65,y:85,c:'#3b82f6'},
            // Contre-attaque
            {t:'p',x:35,y:35,c:'#c9a227',l:'A'},{t:'p',x:50,y:30,c:'#c9a227',l:'A'},{t:'p',x:65,y:35,c:'#c9a227',l:'A'},
            {t:'p',x:40,y:18,c:'#3b82f6',l:'D'},{t:'p',x:60,y:18,c:'#3b82f6',l:'D'},
            {t:'a',x1:50,y1:70,x2:50,y2:32,c:'#c9a227',m:'mG',bold:true},
            {t:'a',x1:35,y1:35,x2:25,y2:15,c:'#c9a227',dash:true,m:'mG'},
            {t:'a',x1:65,y1:35,x2:75,y2:15,c:'#c9a227',dash:true,m:'mG'},
            {t:'p',x:50,y:5,c:'#3b82f6',l:'GK',r:3},
          ]}},
        {nom:`${jrPT}v${jrPT} but en transition = 2 pts`,duree:'20 min',type:'JEU RÉDUIT',
          objectif:'Récompenser la verticalité après récupération',
          desc:`${jrPT}v${jrPT} + 2 GK sur ${jrDim}. But normal = 1 pt. But inscrit en moins de 6 sec après récup = 2 pts. Max 5 passes pour marquer après récup. Matchs 4 min.`,
          coaching:['À la récup : 1er choix = vers l\'avant','Si pas possible, sécuriser PUIS accélérer','L\'attaquant offre une solution en profondeur'],
          pitch:{zone:'full',els:[
            ...goldTeam(jrPT),{t:'p',x:50,y:95,c:'#c9a227',l:'GK',r:2.8},
            ...blueTeam(jrPT),{t:'p',x:50,y:5,c:'#3b82f6',l:'GK',r:2.8},
            {t:'a',x1:50,y1:18,x2:50,y2:8,c:'#c9a227',m:'mG',bold:true},
            {t:'txt',x:75,y:50,v:'6 SEC MAX',s:'2.5',c:'rgba(201,162,39,0.3)'},
            {t:'txt',x:50,y:99,v:jrDim},
          ]}},
        {nom:`${matchPT}v${matchPT} match transition`,duree:'20 min',type:'JEU À THÈME',
          objectif:'Application réelle. Rythme permanent.',
          desc:`${matchPT}v${matchPT} + 2 GK sur ${matchDim}. Chaque perte = l'autre équipe doit attaquer en 8 sec. Pas de temps mort. 2×8 min.`,
          coaching:['Attitude : TOUJOURS prêt à attaquer','Rythme permanent, pas de relâchement','Valoriser les contres bien menés'],
          pitch:{zone:'full',els:[
            ...goldTeam(Math.min(matchPT,8),20,45),
            ...blueTeam(Math.min(matchPT,8),55),
            {t:'p',x:50,y:95,c:'#c9a227',l:'GK',r:2.8},{t:'p',x:50,y:5,c:'#3b82f6',l:'GK',r:2.8},
            {t:'a',x1:50,y1:58,x2:50,y2:45,c:'#c9a227',m:'mG',bold:true},
            {t:'a',x1:50,y1:55,x2:50,y2:30,c:'rgba(201,162,39,0.3)',dash:true},
          ]}},
        debrief('1re intention après la récup ?','Quand accélérer ? Quand sécuriser ?'),
      ]
    },

    // ════════════════════════════════
    // 4. TRANSITION DÉFENSIVE
    // ════════════════════════════════
    transition_def: {
      theme:'Transition défensive — repli',
      principe:'Repli défensif + réaction à la perte',
      objectif_seance:`Réagir collectivement à la perte. Replacement rapide. ${n} joueurs.`,
      blocs:[
        {nom:`${rondoAtt}v${rondoDef} pressing chronométré`,duree:'12 min',type:'ÉCHAUFFEMENT',
          objectif:'Activation + réaction explosive à la perte',
          desc:`${rondoAtt}v${rondoDef} dans ${rondoDim}. À la perte, l'équipe a 5 sec pour récupérer. Passé 5 sec = point pour l'adversaire. Intensité max.`,
          coaching:['Réaction EXPLOSIVE à la perte','Le plus proche du ballon presse','Les autres coupent les options'],
          pitch:{zone:'small',els:[
            {t:'z',x:18,y:4,w:28,h:28,fill:'rgba(255,255,255,0.04)',stroke:'rgba(255,255,255,0.15)'},
            {t:'p',x:20,y:7,c:'#c9a227'},{t:'p',x:44,y:7,c:'#c9a227'},{t:'p',x:20,y:29,c:'#c9a227'},{t:'p',x:44,y:29,c:'#c9a227'},{t:'p',x:32,y:18,c:'#c9a227'},
            {t:'p',x:28,y:14,c:'#ef4444',l:'D'},{t:'p',x:36,y:22,c:'#ef4444',l:'D'},
            {t:'txt',x:54,y:18,v:'5 SEC',s:'3',c:'rgba(239,68,68,0.3)'},
            {t:'txt',x:32,y:36,v:rondoDim},
          ]}},
        {nom:`Repli 6v4 → 6v6`,duree:'18 min',type:'SITUATION',
          objectif:'Course de repli, replacement, temporiser',
          desc:`6 attaquants en contre face à 4 défenseurs. 2 défenseurs partent du rond central en course de repli. Objectif : retarder l'attaque le temps que les 2 reviennent.`,
          coaching:['Temporiser, NE PAS plonger','Communiquer : qui prend qui','Course de repli = sprint vers son but, pas vers le ballon'],
          pitch:{zone:'full',els:[
            {t:'p',x:50,y:5,c:'#3b82f6',l:'GK',r:3},
            // 4 défenseurs en place
            {t:'p',x:30,y:25,c:'#3b82f6',l:'D'},{t:'p',x:45,y:22,c:'#3b82f6',l:'D'},{t:'p',x:55,y:22,c:'#3b82f6',l:'D'},{t:'p',x:70,y:25,c:'#3b82f6',l:'D'},
            // 2 en repli
            {t:'p',x:35,y:48,c:'#3b82f6',l:'R'},{t:'p',x:65,y:48,c:'#3b82f6',l:'R'},
            {t:'a',x1:35,y1:48,x2:35,y2:30,c:'#60a5fa',m:'mB',bold:true},
            {t:'a',x1:65,y1:48,x2:65,y2:30,c:'#60a5fa',m:'mB',bold:true},
            // 6 attaquants
            {t:'p',x:20,y:40,c:'#c9a227'},{t:'p',x:40,y:38,c:'#c9a227'},{t:'p',x:60,y:38,c:'#c9a227'},
            {t:'p',x:80,y:40,c:'#c9a227'},{t:'p',x:35,y:50,c:'#c9a227'},{t:'p',x:65,y:50,c:'#c9a227'},
            {t:'a',x1:40,y1:38,x2:40,y2:25,c:'#c9a227',dash:true,m:'mG'},
            {t:'txt',x:50,y:55,v:'COURSE DE REPLI',s:'2',c:'rgba(59,130,246,0.3)'},
          ]}},
        {nom:`${jrPT}v${jrPT} réaction 5 sec`,duree:'20 min',type:'JEU RÉDUIT',
          objectif:'Réagir à la perte en jeu : 5 sec pour récupérer',
          desc:`${jrPT}v${jrPT} + 2 GK sur ${jrDim}. À la perte, 5 sec chrono pour récupérer. Si 5 sec dépassées = 1 pt pour l'adversaire automatique.`,
          coaching:['Pression immédiate sur le porteur','Couper les lignes proches','Agressivité contrôlée'],
          pitch:{zone:'full',els:[
            ...goldTeam(jrPT),{t:'p',x:50,y:95,c:'#c9a227',l:'GK',r:2.8},
            ...blueTeam(jrPT),{t:'p',x:50,y:5,c:'#3b82f6',l:'GK',r:2.8},
            {t:'txt',x:50,y:50,v:'5 SEC CHRONO',s:'3',c:'rgba(239,68,68,0.2)'},
            {t:'txt',x:50,y:99,v:jrDim},
          ]}},
        {nom:`${matchPT}v${matchPT} bloc bas + contre`,duree:'20 min',type:'JEU À THÈME',
          objectif:'Défendre bas puis lancer une contre-attaque',
          desc:`${matchPT}v${matchPT} + 2 GK sur ${matchDim}. Une équipe ne peut pas dépasser la ligne des 35m (bloc bas forcé). Quand elle récupère, 10 sec pour marquer. 2×8 min puis switch.`,
          coaching:['Compacité : max 25m entre 1re et dernière ligne','Patience : ne PAS sortir du bloc','Récup = explosion vers l\'avant'],
          pitch:{zone:'full',els:[
            {t:'z',x:5,y:60,w:90,h:35,fill:'rgba(59,130,246,0.06)',stroke:'rgba(59,130,246,0.2)',dash:true},
            {t:'txt',x:50,y:58,v:'BLOC BAS — NE PAS DÉPASSER',s:'2',c:'rgba(59,130,246,0.3)'},
            ...blueTeam(Math.min(matchPT,8),65),
            {t:'p',x:50,y:95,c:'#3b82f6',l:'GK',r:2.8},
            ...goldTeam(Math.min(matchPT,8),20,50),
            {t:'p',x:50,y:5,c:'#c9a227',l:'GK',r:2.8},
          ]}},
        debrief('On réagit comment à la perte ?','C\'est quoi un bloc compact ?'),
      ]
    },

    // ════════════════════════════════
    // 5. JEU ENTRE LES LIGNES
    // ════════════════════════════════
    entre_lignes: {
      theme:'Jeu entre les lignes',
      principe:'Occupation des intervalles',
      objectif_seance:`Trouver et exploiter les espaces entre les lignes adverses. ${n} joueurs.`,
      blocs:[
        {nom:`Rondo positionnel ${rondoAtt}v${rondoDef}`,duree:'10 min',type:'ÉCHAUFFEMENT',
          objectif:'Activation + se montrer dans les espaces',
          desc:`${rondoAtt}v${rondoDef} dans ${rondoDim}. 2 touches. 1 pt bonus si le joueur reçoit entre les 2 défenseurs (pas sur le côté).`,
          coaching:['Se montrer ENTRE les défenseurs','Timing : pas trop tôt, pas trop tard','1re touche orientée vers l\'avant'],
          pitch:{zone:'small',els:[
            {t:'z',x:18,y:4,w:28,h:28,fill:'rgba(255,255,255,0.04)',stroke:'rgba(255,255,255,0.15)'},
            {t:'p',x:20,y:7,c:'#c9a227'},{t:'p',x:44,y:7,c:'#c9a227'},{t:'p',x:20,y:29,c:'#c9a227'},{t:'p',x:44,y:29,c:'#c9a227'},{t:'p',x:32,y:18,c:'#c9a227'},
            {t:'p',x:28,y:14,c:'#ef4444',l:'D'},{t:'p',x:36,y:22,c:'#ef4444',l:'D'},
            {t:'z',x:27,y:13,w:10,h:10,fill:'rgba(201,162,39,0.15)',stroke:'rgba(201,162,39,0.3)',dash:true},
            {t:'txt',x:32,y:36,v:rondoDim},
          ]}},
        {nom:`Trouver le 10 — 3 zones`,duree:'18 min',type:'SITUATION',
          objectif:'Passer entre les lignes vers le joueur libre',
          desc:`50×30m en 3 zones. Zone 1 : ${Math.min(exPT+1,5)}v${Math.max(exPT-1,2)} conservation. Zone 2 : 1 joker libre (le "10"). Zone 3 : ${Math.min(exPT-1,3)}v${Math.min(exPT-1,3)} + but. Trouver le joker en zone 2 débloque la zone 3.`,
          coaching:['Le 10 doit se MONTRER au bon moment','Passe entre les lignes = signal d\'accélération','Si fermé → on circule, on ne force PAS'],
          pitch:{zone:'full',els:[
            {t:'z',x:5,y:62,w:90,h:33,fill:'rgba(59,130,246,0.06)',stroke:'rgba(59,130,246,0.2)'},
            {t:'z',x:5,y:40,w:90,h:22,fill:'rgba(201,162,39,0.1)',stroke:'rgba(201,162,39,0.3)'},
            {t:'z',x:5,y:5,w:90,h:35,fill:'rgba(239,68,68,0.05)',stroke:'rgba(239,68,68,0.15)'},
            {t:'txt',x:15,y:78,v:'ZONE 1',s:'2.5',c:'rgba(59,130,246,0.3)'},
            {t:'txt',x:15,y:50,v:'ZONE 2',s:'2.5',c:'rgba(201,162,39,0.3)'},
            {t:'txt',x:15,y:22,v:'ZONE 3',s:'2.5',c:'rgba(239,68,68,0.3)'},
            {t:'p',x:30,y:72,c:'#3b82f6'},{t:'p',x:50,y:78,c:'#3b82f6'},{t:'p',x:70,y:72,c:'#3b82f6'},{t:'p',x:40,y:82,c:'#3b82f6'},
            {t:'p',x:35,y:75,c:'#ef4444'},{t:'p',x:65,y:78,c:'#ef4444'},
            {t:'p',x:50,y:50,c:'#c9a227',l:'10',r:3},
            {t:'p',x:35,y:22,c:'#3b82f6'},{t:'p',x:65,y:22,c:'#3b82f6'},
            {t:'p',x:35,y:15,c:'#ef4444'},{t:'p',x:65,y:15,c:'#ef4444'},
            {t:'a',x1:50,y1:78,x2:50,y2:53,c:'#c9a227',m:'mG',bold:true},
            {t:'a',x1:50,y1:48,x2:37,y2:24,c:'#c9a227',m:'mG',bold:true},
          ]}},
        {nom:`${jrPT}v${jrPT} zone interdite = 2 pts`,duree:'20 min',type:'JEU RÉDUIT',
          objectif:'Chercher la passe entre les lignes en jeu',
          desc:`${jrPT}v${jrPT} + 2 GK sur ${jrDim}. Bande centrale 8m = zone entre les lignes. But après passe AU SOL dans cette zone = 2 pts. Matchs 4 min.`,
          coaching:['Passe entre les lignes = accélération','Se montrer au bon timing','Si fermé → côtés'],
          pitch:{zone:'full',els:[
            {t:'z',x:5,y:43,w:90,h:12,fill:'rgba(201,162,39,0.1)',stroke:'rgba(201,162,39,0.3)',dash:true},
            {t:'txt',x:50,y:48,v:'ZONE ENTRE LES LIGNES',s:'2.2',c:'rgba(201,162,39,0.35)'},
            ...goldTeam(jrPT,68,92),{t:'p',x:50,y:95,c:'#c9a227',l:'GK',r:2.8},
            ...blueTeam(jrPT,8),{t:'p',x:50,y:5,c:'#3b82f6',l:'GK',r:2.8},
            {t:'txt',x:50,y:99,v:jrDim},
          ]}},
        {nom:`${matchPT}v${matchPT} bonus intervalle`,duree:'20 min',type:'JEU À THÈME',
          objectif:'Trouver les intervalles en conditions réelles',
          desc:`${matchPT}v${matchPT} + 2 GK sur ${matchDim}. But normal = 1 pt. But après une passe reçue entre 2 défenseurs adverses = 2 pts. 2×8 min.`,
          coaching:['Décrochages pour recevoir entre les lignes','Varier le rythme : circuler puis accélérer','Valoriser les prises de risque réussies'],
          pitch:{zone:'full',els:[
            ...goldTeam(Math.min(matchPT,8),20,45),
            ...blueTeam(Math.min(matchPT,8),55),
            {t:'p',x:50,y:95,c:'#c9a227',l:'GK',r:2.8},{t:'p',x:50,y:5,c:'#3b82f6',l:'GK',r:2.8},
          ]}},
        debrief('C\'est quoi l\'espace entre les lignes ?','Comment on se montre au bon moment ?'),
      ]
    },

    // ════════════════════════════════
    // 6. JEU CÔTÉ FORT / TRIANGLES
    // ════════════════════════════════
    cote_fort: {
      theme:'Jeu côté fort — triangles',
      principe:'Combinaisons latéral-milieu-ailier',
      objectif_seance:`Créer et exploiter le surnombre côté fort par les triangles. ${n} joueurs.`,
      blocs:[
        {nom:`Passe et suit en triangle`,duree:'10 min',type:'ÉCHAUFFEMENT',
          objectif:'Activation technique, combinaisons à 3',
          desc:`Groupes de 3 en triangle (8m de côté). Passe et suit : A passe à B, A va à la place de B, B passe à C, etc. Ajouter un 2e ballon après 3 min.`,
          coaching:['Passe au sol ferme','Appel de balle avant la passe','Accélérer après la passe'],
          pitch:{zone:'small',els:[
            {t:'p',x:15,y:25,c:'#c9a227',l:'A'},{t:'p',x:32,y:7,c:'#c9a227',l:'B'},{t:'p',x:48,y:25,c:'#c9a227',l:'C'},
            {t:'a',x1:15,y1:25,x2:30,y2:9,c:'#c9a227',m:'mG'},{t:'a',x1:32,y1:7,x2:46,y2:23,c:'#c9a227',m:'mG'},{t:'a',x1:48,y1:25,x2:17,y2:25,c:'#c9a227',dash:true,m:'mG'},
            {t:'b',x:15,y:25},
            {t:'p',x:60,y:25,c:'#3b82f6',l:'A'},{t:'p',x:77,y:7,c:'#3b82f6',l:'B'},{t:'p',x:93,y:25,c:'#3b82f6',l:'C'},
          ]}},
        {nom:`Triangle côté — latéral + milieu + ailier v 2`,duree:'18 min',type:'SITUATION',
          objectif:'Combinaisons à 3 côté fort : passe-et-va, dédoublement, mur',
          desc:`Couloir de 30×20m. Latéral + milieu relayeur + ailier contre 2 défenseurs. Travailler 3 combinaisons : 1) passe-et-va 2) dédoublement du latéral 3) mur avec le milieu. Finir par un centre ou une passe décisive. Alterner côté droit/gauche.`,
          coaching:['Timing des appels','Le latéral déclenche quand l\'ailier fixe','Varier les combinaisons — pas toujours la même'],
          pitch:{zone:'half',els:[
            {t:'z',x:55,y:5,w:40,h:55,fill:'rgba(201,162,39,0.06)',stroke:'rgba(201,162,39,0.2)',dash:true},
            {t:'txt',x:75,y:3,v:'COULOIR FORT',s:'2',c:'rgba(201,162,39,0.3)'},
            {t:'p',x:85,y:40,c:'#c9a227',l:'LD'},{t:'p',x:70,y:28,c:'#c9a227',l:'6'},{t:'p',x:80,y:15,c:'#c9a227',l:'7'},
            {t:'p',x:75,y:22,c:'#ef4444',l:'D'},{t:'p',x:82,y:30,c:'#ef4444',l:'D'},
            {t:'a',x1:85,y1:40,x2:85,y2:18,c:'#c9a227',dash:true,m:'mG'},
            {t:'a',x1:80,y1:15,x2:72,y2:30,c:'#c9a227',m:'mG'},
            {t:'a',x1:70,y1:28,x2:78,y2:17,c:'#c9a227',m:'mG',bold:true},
            {t:'txt',x:75,y:58,v:'30×20m'},
          ]}},
        {nom:`${jrPT}v${jrPT} but après combinaison côté = 2 pts`,duree:'20 min',type:'JEU RÉDUIT',
          objectif:'Chercher le surnombre côté fort en jeu',
          desc:`${jrPT}v${jrPT} + 2 GK sur ${jrDim}. Terrain divisé en 3 couloirs verticaux. But après combinaison à 3+ dans un couloir latéral = 2 pts. But normal = 1 pt. Matchs 4 min.`,
          coaching:['Surcharger un côté pour créer le surnombre','Combinaison = au moins 3 passes dans le même couloir','Pas de centre sans combinaison'],
          pitch:{zone:'full',els:[
            {t:'z',x:65,y:4,w:30,h:92,fill:'rgba(201,162,39,0.06)',stroke:'rgba(201,162,39,0.2)',dash:true},
            {t:'z',x:5,y:4,w:30,h:92,fill:'rgba(201,162,39,0.06)',stroke:'rgba(201,162,39,0.2)',dash:true},
            {t:'txt',x:80,y:50,v:'COULOIR',s:'2',c:'rgba(201,162,39,0.25)'},
            {t:'txt',x:20,y:50,v:'COULOIR',s:'2',c:'rgba(201,162,39,0.25)'},
            ...goldTeam(jrPT),{t:'p',x:50,y:95,c:'#c9a227',l:'GK',r:2.8},
            ...blueTeam(jrPT),{t:'p',x:50,y:5,c:'#3b82f6',l:'GK',r:2.8},
            {t:'txt',x:50,y:99,v:jrDim},
          ]}},
        {nom:`${matchPT}v${matchPT} overload côté`,duree:'20 min',type:'JEU À THÈME',
          objectif:'Application réelle. Surcharger un côté puis switcher.',
          desc:`${matchPT}v${matchPT} + 2 GK sur ${matchDim}. Consigne : construire côté fort (3+ joueurs dans le même couloir) avant de centrer ou de switcher. But après switch de côté = 2 pts. 2×8 min.`,
          coaching:['Côté fort = là où on a 3+ joueurs','Fixer d\'un côté puis switcher si ça bloque','Le côté faible doit être DÉJÀ positionné haut'],
          pitch:{zone:'full',els:[
            ...goldTeam(Math.min(matchPT,8),20,45),
            ...blueTeam(Math.min(matchPT,8),55),
            {t:'p',x:50,y:95,c:'#c9a227',l:'GK',r:2.8},{t:'p',x:50,y:5,c:'#3b82f6',l:'GK',r:2.8},
            {t:'a',x1:65,y1:28,x2:25,y2:28,c:'rgba(201,162,39,0.3)',dash:true,m:'mG'},
            {t:'txt',x:50,y:25,v:'SWITCH',s:'2.5',c:'rgba(201,162,39,0.25)'},
          ]}},
        debrief('C\'est quoi le côté fort ?','Quand switcher ?'),
      ]
    },

    // ════════════════════════════════
    // 7. FINITION + EFFICACITÉ
    // ════════════════════════════════
    finition: {
      theme:'Finition — efficacité devant le but',
      principe:'Concrétiser les occasions',
      objectif_seance:`Améliorer l'efficacité dans le dernier tiers. ${n} joueurs.`,
      blocs:[
        {nom:`Passes en mouvement + frappe`,duree:'10 min',type:'ÉCHAUFFEMENT',
          objectif:'Activation technique + geste de frappe',
          desc:`Par paires, passes courtes en mouvement (15m). Au signal du coach : contrôle orienté + frappe au but. Alterner côté droit/gauche. Compétition : qui marque le plus en 5 min.`,
          coaching:['Passer EN MOUVEMENT, jamais à l\'arrêt','Frappe = regarder le but AVANT de frapper','Placement du pied d\'appui à côté du ballon'],
          pitch:{zone:'half',els:[
            {t:'p',x:50,y:55,c:'#3b82f6',l:'GK',r:3},
            {t:'p',x:25,y:35,c:'#c9a227',l:'A'},{t:'p',x:25,y:50,c:'#c9a227',l:'B'},
            {t:'p',x:75,y:35,c:'#c9a227',l:'C'},{t:'p',x:75,y:50,c:'#c9a227',l:'D'},
            {t:'a',x1:25,y1:50,x2:25,y2:37,c:'#c9a227',m:'mG'},
            {t:'a',x1:25,y1:35,x2:48,y2:55,c:'#c9a227',m:'mG',bold:true},
            {t:'a',x1:75,y1:50,x2:75,y2:37,c:'#c9a227',m:'mG'},
            {t:'a',x1:75,y1:35,x2:52,y2:55,c:'#c9a227',m:'mG',bold:true},
            {t:'txt',x:50,y:63,v:'FRAPPES'},
          ]}},
        {nom:`Centres + finition 3 zones`,duree:'18 min',type:'SITUATION',
          objectif:'Occupation de la surface et timing des appels sur centre',
          desc:`Ailier centre depuis la ligne. 3 attaquants (1er poteau, penalty, 2e poteau) attaquent le centre contre 2 défenseurs. Alterner côté droit/gauche. 3 types : centre tendu, lobé, en retrait.`,
          coaching:['Appels CROISÉS dans la surface','Attaquer le ballon — ne pas attendre','1er poteau = déviation, 2e poteau = reprise'],
          pitch:{zone:'half',els:[
            {t:'p',x:50,y:55,c:'#3b82f6',l:'GK',r:3},
            {t:'p',x:88,y:30,c:'#c9a227',l:'AIL'},
            {t:'p',x:40,y:42,c:'#c9a227',l:'1'},{t:'p',x:50,y:38,c:'#c9a227',l:'2'},{t:'p',x:62,y:42,c:'#c9a227',l:'3'},
            {t:'p',x:45,y:45,c:'#ef4444',l:'D'},{t:'p',x:58,y:45,c:'#ef4444',l:'D'},
            {t:'a',x1:88,y1:30,x2:52,y2:42,c:'#c9a227',m:'mG',bold:true},
            {t:'ca',x1:40,y1:42,cx:35,cy:38,x2:45,y2:38,c:'#c9a227',dash:true,m:'mG'},
            {t:'ca',x1:62,y1:42,cx:55,cy:38,x2:50,y2:40,c:'#c9a227',dash:true,m:'mG'},
          ]}},
        {nom:`${jrPT}v${jrPT} but dans surface only`,duree:'20 min',type:'JEU RÉDUIT',
          objectif:'Créer des occasions DANS la surface, pas tirer de loin',
          desc:`${jrPT}v${jrPT} + 2 GK sur ${jrDim}. Règle : le but ne compte QUE si le tir part de l'intérieur de la surface. Tir hors surface = pas de but. Matchs 4 min.`,
          coaching:['Chercher la passe qui élimine DANS la surface','Pas de frappe de 25m — pénétrer','Appels dans le dos de la défense'],
          pitch:{zone:'full',els:[
            {t:'z',x:34,y:84,w:32,h:12,fill:'rgba(201,162,39,0.1)',stroke:'rgba(201,162,39,0.3)'},
            {t:'z',x:34,y:4,w:32,h:12,fill:'rgba(201,162,39,0.1)',stroke:'rgba(201,162,39,0.3)'},
            {t:'txt',x:50,y:90,v:'ZONE TIR',s:'2',c:'rgba(201,162,39,0.3)'},
            {t:'txt',x:50,y:10,v:'ZONE TIR',s:'2',c:'rgba(201,162,39,0.3)'},
            ...goldTeam(jrPT),{t:'p',x:50,y:95,c:'#c9a227',l:'GK',r:2.8},
            ...blueTeam(jrPT),{t:'p',x:50,y:5,c:'#3b82f6',l:'GK',r:2.8},
            {t:'txt',x:50,y:99,v:jrDim},
          ]}},
        {nom:`${matchPT}v${matchPT} match efficacité`,duree:'20 min',type:'JEU À THÈME',
          objectif:'Concrétiser. Chaque occasion compte.',
          desc:`${matchPT}v${matchPT} + 2 GK sur ${matchDim}. Règle : si une équipe a une occasion franche (1v1 GK, frappe dans la surface) et ne marque pas, l'autre équipe gagne un corner. Pression sur la finition. 2×8 min.`,
          coaching:['Chaque occasion = concentration maximale','Pas de frappe molle — conviction','Valoriser les buts bien construits'],
          pitch:{zone:'full',els:[
            ...goldTeam(Math.min(matchPT,8),20,45),
            ...blueTeam(Math.min(matchPT,8),55),
            {t:'p',x:50,y:95,c:'#c9a227',l:'GK',r:2.8},{t:'p',x:50,y:5,c:'#3b82f6',l:'GK',r:2.8},
          ]}},
        debrief('Je tire ou je passe — comment je décide ?','Quelle zone je vise quand je frappe ?'),
      ]
    },

    // ════════════════════════════════
    // 8. BLOC DÉFENSIF
    // ════════════════════════════════
    bloc: {
      theme:'Bloc défensif — compacité',
      principe:'Lignes resserrées, couvertures',
      objectif_seance:`Organiser le bloc défensif. Compacité et coulissage. ${n} joueurs.`,
      blocs:[
        {nom:`Conservation ${rondoAtt}v${rondoDef} passif`,duree:'10 min',type:'ÉCHAUFFEMENT',
          objectif:'Activation + travail de replacement défensif',
          desc:`${rondoAtt}v${rondoDef} dans ${rondoDim}. Variante : les 2 défenseurs doivent toujours rester à moins de 3m l'un de l'autre (compacité). Si l'écart est > 3m, point bonus pour les attaquants.`,
          coaching:['Défenseurs : rester COMPACTS','Coulisser ensemble comme une unité','Communiquer en permanence'],
          pitch:{zone:'small',els:[
            {t:'z',x:18,y:4,w:28,h:28,fill:'rgba(255,255,255,0.04)',stroke:'rgba(255,255,255,0.15)'},
            {t:'p',x:20,y:7,c:'#c9a227'},{t:'p',x:44,y:7,c:'#c9a227'},{t:'p',x:20,y:29,c:'#c9a227'},{t:'p',x:44,y:29,c:'#c9a227'},{t:'p',x:32,y:18,c:'#c9a227'},
            {t:'p',x:30,y:16,c:'#ef4444',l:'D'},{t:'p',x:34,y:19,c:'#ef4444',l:'D'},
            {t:'a',x1:30,y1:16,x2:34,y2:19,c:'#ef4444',m:'mR',bold:true},
            {t:'txt',x:32,y:14,v:'3m MAX',s:'2',c:'rgba(239,68,68,0.4)'},
            {t:'txt',x:32,y:36,v:rondoDim},
          ]}},
        {nom:`Coulissage défensif 4v3`,duree:'18 min',type:'EXERCICE',
          objectif:'Coulisser en ligne, fermer les espaces',
          desc:`Ligne de 4 défenseurs face à 3 attaquants qui se passent le ballon latéralement. Les 4 défenseurs coulissent ensemble côté ballon. L'attaquant qui reçoit peut frapper si un espace s'ouvre. Vitesse progressive.`,
          coaching:['La ligne bouge ENSEMBLE — pas un seul joueur','Distance entre défenseurs = 5-6m max','Le défenseur côté ballon ferme, les autres couvrent'],
          pitch:{zone:'half',els:[
            {t:'p',x:50,y:55,c:'#3b82f6',l:'GK',r:3},
            {t:'p',x:25,y:40,c:'#3b82f6',l:'DC'},{t:'p',x:40,y:38,c:'#3b82f6',l:'DC'},{t:'p',x:60,y:38,c:'#3b82f6',l:'DC'},{t:'p',x:75,y:40,c:'#3b82f6',l:'DC'},
            {t:'a',x1:25,y1:40,x2:75,y2:40,c:'#60a5fa',dash:true},
            {t:'txt',x:50,y:37,v:'LIGNE COULISSE →',s:'2',c:'rgba(59,130,246,0.3)'},
            {t:'p',x:20,y:25,c:'#c9a227'},{t:'p',x:50,y:22,c:'#c9a227'},{t:'p',x:80,y:25,c:'#c9a227'},
            {t:'a',x1:20,y1:25,x2:48,y2:22,c:'#c9a227',m:'mG'},
            {t:'a',x1:50,y1:22,x2:78,y2:25,c:'#c9a227',dash:true,m:'mG'},
          ]}},
        {nom:`${jrPT}v${jrPT} max 25m entre lignes`,duree:'20 min',type:'JEU RÉDUIT',
          objectif:'Compacité du bloc en jeu',
          desc:`${jrPT}v${jrPT} + 2 GK sur ${jrDim}. Règle : l'équipe qui défend ne peut pas avoir plus de 25m entre son 1er et dernier joueur (hors GK). Si l'écart est > 25m, coup franc indirect pour l'adversaire. Matchs 4 min.`,
          coaching:['Monter et descendre ENSEMBLE','Communication : plus haut / plus bas','Compacité = priorité n°1'],
          pitch:{zone:'full',els:[
            {t:'z',x:5,y:55,w:90,h:25,fill:'rgba(59,130,246,0.06)',stroke:'rgba(59,130,246,0.2)',dash:true},
            {t:'txt',x:50,y:67,v:'25m MAX',s:'3',c:'rgba(59,130,246,0.2)'},
            ...goldTeam(jrPT),{t:'p',x:50,y:95,c:'#c9a227',l:'GK',r:2.8},
            ...blueTeam(jrPT,58),{t:'p',x:50,y:5,c:'#3b82f6',l:'GK',r:2.8},
            {t:'txt',x:50,y:99,v:jrDim},
          ]}},
        {nom:`${matchPT}v${matchPT} bloc organisé`,duree:'20 min',type:'JEU À THÈME',
          objectif:'Organisation défensive en match. Coach gèle.',
          desc:`${matchPT}v${matchPT} + 2 GK sur ${matchDim}. Le coach gèle le jeu 3-4 fois quand le bloc défend pour vérifier la compacité, les distances, les coulissages. 2×8 min.`,
          coaching:['Gel = pas pour punir, pour corriger','Montrer visuellement les espaces','Rester compact même sous pression'],
          pitch:{zone:'full',els:[
            ...goldTeam(Math.min(matchPT,8),20,45),
            ...blueTeam(Math.min(matchPT,8),55),
            {t:'p',x:50,y:95,c:'#c9a227',l:'GK',r:2.8},{t:'p',x:50,y:5,c:'#3b82f6',l:'GK',r:2.8},
          ]}},
        debrief('C\'est quoi un bloc compact ?','Quand est-ce qu\'on monte ? Quand on descend ?'),
      ]
    },

    // ════════════════════════════════
    // 9. CPA OFFENSIFS
    // ════════════════════════════════
    cpa_off: {
      theme:'CPA offensifs — corners et CF',
      principe:'Schémas prédéfinis',
      objectif_seance:`Travailler 2-3 schémas de corners et coups francs offensifs. ${n} joueurs.`,
      blocs:[
        {nom:'Activation jeu de tête',duree:'10 min',type:'ÉCHAUFFEMENT',
          objectif:'Échauffement cervicales + technique de tête',
          desc:'Par paires (3m). A lance à B qui remet de la tête. Puis centres latéraux : 1 centreur, 1 attaquant, 1 défenseur. Attaquant = jeu de tête cadré. 5 passages chacun.',
          coaching:['Yeux OUVERTS, front sur le ballon','Sauter EN AVANÇANT vers le ballon','Bras pour l\'équilibre (pas pousser)'],
          pitch:{zone:'small',els:[
            {t:'p',x:20,y:15,c:'#c9a227',l:'A'},{t:'p',x:20,y:28,c:'#c9a227',l:'B'},
            {t:'a',x1:20,y1:15,x2:20,y2:26,c:'#c9a227',m:'mG'},
            {t:'a',x1:20,y1:28,x2:20,y2:17,c:'#c9a227',dash:true,m:'mG'},
            {t:'p',x:50,y:10,c:'#c9a227',l:'C'},{t:'p',x:42,y:28,c:'#c9a227',l:'ATT'},{t:'p',x:42,y:22,c:'#ef4444',l:'DEF'},
            {t:'a',x1:50,y1:10,x2:44,y2:26,c:'#c9a227',m:'mG'},
          ]}},
        {nom:'Corner offensif — 3 schémas',duree:'18 min',type:'SITUATION',
          objectif:'Installer 3 schémas de corner travaillés',
          desc:`5-6 attaquants dans la surface vs 4-5 défenseurs + GK. 3 schémas alternés : 1) Bloc écran 1er poteau + course croisée 2) Corner court + centre croisé 3) Retrait pour frappe à l'entrée. 6 exécutions par schéma.`,
          coaching:['Le BLOC (écran) est légal mais ferme','Attaquer le ballon EN SPRINT','Le tireur vise la zone du 1er poteau, hauteur de tête'],
          pitch:{zone:'half',els:[
            {t:'p',x:50,y:55,c:'#3b82f6',l:'GK',r:3},
            {t:'p',x:92,y:10,c:'#c9a227',l:'⚽',r:2},
            {t:'p',x:38,y:38,c:'#c9a227',l:'1'},{t:'p',x:50,y:42,c:'#c9a227',l:'2'},{t:'p',x:62,y:38,c:'#c9a227',l:'3'},
            {t:'p',x:50,y:32,c:'#c9a227',l:'4'},{t:'p',x:70,y:28,c:'#c9a227',l:'5'},
            {t:'p',x:40,y:42,c:'#3b82f6'},{t:'p',x:55,y:40,c:'#3b82f6'},{t:'p',x:45,y:35,c:'#3b82f6'},{t:'p',x:60,y:35,c:'#3b82f6'},
            {t:'a',x1:92,y1:10,x2:42,y2:36,c:'#c9a227',m:'mG',bold:true},
            {t:'ca',x1:38,y1:38,cx:42,cy:32,x2:50,y2:36,c:'#c9a227',dash:true,m:'mG'},
            {t:'ca',x1:62,y1:38,cx:55,cy:32,x2:48,y2:38,c:'#c9a227',dash:true,m:'mG'},
          ]}},
        {nom:'CF latéral — combinaison courte',duree:'12 min',type:'SITUATION',
          objectif:'Surprendre sur coup franc avec feinte',
          desc:'CF à 25m. 2 joueurs au-dessus du ballon. A pose, B fait mine de tirer, A revient et centre au 2e poteau. Alterner : parfois B tire vraiment. Travailler le timing.',
          coaching:['Course de B = CONVAINCANTE','A centre VITE avant replacement défense','Attaquants partent au signal de B'],
          pitch:{zone:'half',els:[
            {t:'p',x:50,y:55,c:'#3b82f6',l:'GK',r:3},
            {t:'p',x:35,y:30,c:'#c9a227',l:'A'},{t:'p',x:38,y:32,c:'#c9a227',l:'B'},
            {t:'p',x:45,y:42,c:'#c9a227'},{t:'p',x:55,y:38,c:'#c9a227'},{t:'p',x:60,y:44,c:'#c9a227'},
            {t:'b',x:35,y:30},
            {t:'a',x1:38,y1:32,x2:36,y2:30,c:'#c9a227',m:'mG'},
            {t:'a',x1:35,y1:30,x2:58,y2:42,c:'#c9a227',dash:true,m:'mG',bold:true},
            {t:'p',x:45,y:38,c:'#3b82f6'},{t:'p',x:55,y:42,c:'#3b82f6'},{t:'p',x:50,y:35,c:'#3b82f6'},
          ]}},
        {nom:`${matchPT}v${matchPT} match + CPA`,duree:'15 min',type:'JEU À THÈME',
          objectif:'Appliquer les schémas en match',
          desc:`${matchPT}v${matchPT} + 2 GK sur ${matchDim}. Chaque corner ou CF dans les 30m = opportunité d'appliquer un des 3 schémas travaillés. Le coach peut demander un schéma spécifique. 2×6 min.`,
          coaching:['Annoncer le n° du schéma rapidement','Exécution rapide — pas 30 sec de placement','Adapter si la défense a compris'],
          pitch:{zone:'full',els:[
            ...goldTeam(Math.min(matchPT,8),20,45),
            ...blueTeam(Math.min(matchPT,8),55),
            {t:'p',x:50,y:95,c:'#c9a227',l:'GK',r:2.8},{t:'p',x:50,y:5,c:'#3b82f6',l:'GK',r:2.8},
          ]}},
        debrief('Quel schéma on préfère ? Pourquoi ?','Qu\'est-ce que la défense peut faire pour contrer ?'),
      ]
    },

    // ════════════════════════════════
    // 10. PHYSIQUE INTÉGRÉ
    // ════════════════════════════════
    physique: {
      theme:'Physique intégré au jeu',
      principe:'Endurance spécifique avec ballon',
      objectif_seance:`Travail physique intégré aux situations de jeu. Pas de course sans ballon. ${n} joueurs.`,
      blocs:[
        {nom:'Activation dynamique avec ballon',duree:'10 min',type:'ÉCHAUFFEMENT',
          objectif:'Montée en température progressive',
          desc:'En groupe, chaque joueur avec ballon. Conduite libre dans une zone 25×25m. Au signal : sprint 5m + dribble, changement direction, conduite en reculant, etc. Progressivité.',
          coaching:['Progressivité : pas d\'effort max direct','Garder le ballon proche du corps','Amplitude des mouvements'],
          pitch:{zone:'small',els:[
            {t:'z',x:10,y:3,w:44,h:32,fill:'rgba(255,255,255,0.03)',stroke:'rgba(255,255,255,0.12)'},
            {t:'p',x:15,y:10,c:'#c9a227'},{t:'p',x:30,y:8,c:'#c9a227'},{t:'p',x:45,y:12,c:'#c9a227'},
            {t:'p',x:20,y:20,c:'#c9a227'},{t:'p',x:35,y:22,c:'#c9a227'},{t:'p',x:48,y:25,c:'#c9a227'},
            {t:'p',x:15,y:30,c:'#c9a227'},{t:'p',x:40,y:30,c:'#c9a227'},
            {t:'b',x:15,y:10},{t:'b',x:35,y:22},{t:'b',x:48,y:25},
            {t:'txt',x:32,y:37,v:'25×25m — conduite libre'},
          ]}},
        {nom:`Intermittent 15/15 avec frappe`,duree:'18 min',type:'EXERCICE',
          objectif:'Capacité aérobie spécifique avec ballon',
          desc:`15 sec d'effort intense (conduite rapide en slalom 40m) + 15 sec de récup active (jonglage ou passe). À chaque fin de série : frappe au but. 2 séries de 7 min. Pause 3 min entre les séries.`,
          coaching:['Intensité MAXIMALE pendant les 15 sec','Récup active = pas arrêté','Qualité technique MALGRÉ la fatigue'],
          pitch:{zone:'half',els:[
            {t:'p',x:50,y:55,c:'#3b82f6',l:'GK',r:3},
            {t:'cone',x:15,y:20},{t:'cone',x:25,y:30},{t:'cone',x:35,y:20},{t:'cone',x:45,y:30},{t:'cone',x:55,y:20},{t:'cone',x:65,y:30},
            {t:'p',x:10,y:20,c:'#c9a227',l:'→'},
            {t:'a',x1:10,y1:20,x2:13,y2:20,c:'#c9a227',m:'mG'},
            {t:'a',x1:65,y1:30,x2:50,y2:53,c:'#c9a227',m:'mG',bold:true},
            {t:'txt',x:40,y:15,v:'SLALOM 40m',s:'2',c:'rgba(201,162,39,0.3)'},
            {t:'txt',x:50,y:63,v:'15/15 — 2×7 min'},
          ]}},
        {nom:`${jrPT}v${jrPT} SSG endurance 20 min`,duree:'20 min',type:'JEU RÉDUIT',
          objectif:'Endurance spécifique en jeu réduit continu',
          desc:`${jrPT}v${jrPT} sans GK sur ${gd(jrPT,'s')} avec mini-buts. Match CONTINU 20 min. Quand le ballon sort, nouveau ballon immédiatement remis en jeu par le coach. Pas de pause. Objectif : maintenir l'intensité.`,
          coaching:['Gérer son effort sur la durée','Communiquer pour se relayer au pressing','Qualité technique MALGRÉ la fatigue'],
          pitch:{zone:'full',els:[
            ...goldTeam(jrPT),
            ...blueTeam(jrPT),
            {t:'z',x:47,y:2,w:6,h:3,fill:'rgba(201,162,39,0.3)',stroke:'#c9a227'},
            {t:'z',x:47,y:93,w:6,h:3,fill:'rgba(59,130,246,0.3)',stroke:'#3b82f6'},
            {t:'txt',x:50,y:50,v:'20 MIN CONTINU',s:'3',c:'rgba(201,162,39,0.2)'},
            {t:'txt',x:50,y:99,v:gd(jrPT,'s')},
          ]}},
        {nom:`${matchPT}v${matchPT} match libre`,duree:'15 min',type:'JEU À THÈME',
          objectif:'Match libre pour terminer. Observer la gestion de l\'effort.',
          desc:`${matchPT}v${matchPT} + 2 GK sur ${matchDim}. Aucune contrainte. Le coach observe : qui gère bien l'effort, qui s'effondre, qui maintient la qualité technique. 1×15 min.`,
          coaching:['Observer sans intervenir','Noter qui tient physiquement','Qualité technique sous fatigue = le vrai test'],
          pitch:{zone:'full',els:[
            ...goldTeam(Math.min(matchPT,8),20,45),
            ...blueTeam(Math.min(matchPT,8),55),
            {t:'p',x:50,y:95,c:'#c9a227',l:'GK',r:2.8},{t:'p',x:50,y:5,c:'#3b82f6',l:'GK',r:2.8},
          ]}},
        debrief('Comment vous avez géré l\'effort ?','Qu\'est-ce qui a changé quand vous étiez fatigués ?'),
      ]
    },
  }

  return ALL[theme] || ALL.pressing
}


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

function BlocCard({bloc}){
  const[showPitch,setShowPitch]=useState(false)
  const tc={ÉCHAUFFEMENT:G.green,EXERCICE:G.blue,SITUATION:G.orange,'JEU RÉDUIT':G.gold,'JEU À THÈME':G.purple,DÉBRIEF:G.muted}[bloc.type]||G.muted
  return(
    <div style={{background:G.surface,border:`1px solid ${G.rule}`,borderLeft:`3px solid ${tc}`,marginBottom:5}}>
      <div style={{padding:'11px 13px'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:6}}>
          <div style={{display:'flex',alignItems:'center',gap:6}}>
            <span style={{fontFamily:G.mono,fontSize:7,letterSpacing:'.1em',textTransform:'uppercase',padding:'2px 5px',background:tc+'15',color:tc,border:`1px solid ${tc}30`}}>{bloc.type}</span>
            <span style={{fontFamily:G.mono,fontSize:9,color:G.muted}}>{bloc.duree}</span>
          </div>
          {bloc.pitch&&<button onClick={()=>setShowPitch(o=>!o)} style={{fontFamily:G.mono,fontSize:7,color:G.gold,background:G.goldBg,border:`1px solid ${G.goldBdr}`,padding:'2px 7px',cursor:'pointer'}}>{showPitch?'✕ Masquer':'▶ Terrain'}</button>}
        </div>
        <h4 style={{fontFamily:G.display,fontSize:14,textTransform:'uppercase',color:G.ink,marginBottom:2}}>{bloc.nom}</h4>
        <p style={{fontFamily:G.mono,fontSize:8,color:G.gold,marginBottom:6}}>→ {bloc.objectif}</p>
        <p style={{fontFamily:G.mono,fontSize:9,color:G.ink2,lineHeight:1.6,marginBottom:bloc.coaching?6:0}}>{bloc.desc}</p>
        {bloc.coaching&&<div style={{background:'rgba(26,25,22,0.02)',border:`1px solid ${G.rule}`,padding:'7px 9px',marginTop:4}}>
          <div style={{fontFamily:G.mono,fontSize:7,letterSpacing:'.12em',textTransform:'uppercase',color:G.gold,marginBottom:4}}>Points clés</div>
          {bloc.coaching.map((c,i)=>(
            <div key={i} style={{display:'flex',gap:5,marginBottom:2}}>
              <span style={{fontFamily:G.mono,fontSize:8,color:G.gold,flexShrink:0}}>→</span>
              <span style={{fontFamily:G.mono,fontSize:8,color:G.ink2,lineHeight:1.5}}>{c}</span>
            </div>
          ))}
        </div>}
      </div>
      {showPitch&&bloc.pitch&&(
        <div style={{padding:'10px 13px',background:'rgba(45,90,39,0.04)',borderTop:`1px solid ${G.rule}`,display:'flex',justifyContent:'center'}}>
          <Pitch w={310} h={bloc.pitch.zone==='small'?140:bloc.pitch.zone==='half'?210:270} zone={bloc.pitch.zone} els={bloc.pitch.els}/>
        </div>
      )}
    </div>
  )
}

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
   PAGE PRINCIPALE
═══════════════════════════════ */
export default function ProjetDeJeu(){
  // Projet de jeu (enregistré)
  const[step,setStep]=useState(0) // 0=projet, 1=programmation, 2=séance
  const[sel,setSel]=useState([])
  const[formation,setFormation]=useState('4-3-3')
  const[categorie,setCategorie]=useState('Seniors')
  const[dateReprise,setDateReprise]=useState('')
  const[jours,setJours]=useState(['mardi','jeudi'])
  const[horaire,setHoraire]=useState('19:00')
  const[projetSaved,setProjetSaved]=useState(false)

  const[loadingPlan,setLoadingPlan]=useState(true)

  // Séance du jour (variable)
  const[nbPresents,setNbPresents]=useState(16)
  const[themeSeance,setThemeSeance]=useState('pressing')
  const[weekThemes,setWeekThemes]=useState({})

  // Charger le projet sauvegardé au montage
  useEffect(()=>{
    let cancelled=false
    ;(async()=>{
      try{
        const res=await fetch(`${API}/game-plan`,{headers:authH()})
        if(res.ok&&!cancelled){const p=await res.json()
          if(p&&p.id){
            setFormation(p.formation||'4-3-3');setCategorie(p.category||'Seniors')
            setSel(p.principles||[]);setJours(p.training_days||['mardi','jeudi'])
            setHoraire(p.training_time||'19:00');setDateReprise(p.start_date||'')
            setWeekThemes(p.programming||{});setProjetSaved(true)
          }}
      }catch(e){console.error(e)}
      finally{if(!cancelled)setLoadingPlan(false)}
    })()
    return()=>{cancelled=true}
  },[])

  // Sauvegarder le projet
  const saveProjet=async()=>{
    try{
      await fetch(`${API}/game-plan`,{method:'PUT',headers:authH(),
        body:JSON.stringify({formation,category:categorie,principles:sel,
          training_days:jours,training_time:horaire,start_date:dateReprise||null,
          programming:weekThemes})})
      setProjetSaved(true)
    }catch(e){console.error(e)}
  }

  const toggle=id=>setSel(p=>p.includes(id)?p.filter(x=>x!==id):p.length>=5?p:[...p,id])
  const toggleJ=id=>setJours(p=>p.includes(id)?p.filter(x=>x!==id):[...p,id].sort((a,b)=>JOURS.findIndex(j=>j.id===a)-JOURS.findIndex(j=>j.id===b)))

  const allP=Object.values(PRINCIPES).flat()
  const selLabels=sel.map(id=>allP.find(p=>p.id===id)?.label).filter(Boolean)
  const joursLabels=jours.map(j=>JOURS.find(x=>x.id===j)?.l).join(' + ')
  const ok=sel.length>=3&&dateReprise&&jours.length>=1

  const seance=useMemo(()=>generateSeance(themeSeance,nbPresents),[themeSeance,nbPresents])

  const periodDates=useMemo(()=>{
    if(!dateReprise)return[]
    let c=new Date(dateReprise)
    return PROG.map(p=>{const d=new Date(c);c.setDate(c.getDate()+p.wk*7);return d.toLocaleDateString('fr-FR',{day:'numeric',month:'short'})})
  },[dateReprise])

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
              <div style={{display:'flex',gap:8,marginTop:16}}>
                <button onClick={()=>setStep(0)} style={{flex:1,padding:'10px',background:'transparent',border:`1px solid ${G.rule}`,fontFamily:G.mono,fontSize:9,textTransform:'uppercase',color:G.muted,cursor:'pointer'}}>← Modifier</button>
                <button onClick={()=>{saveProjet();setStep(2)}} style={{flex:2,padding:'10px',background:G.gold,border:'none',fontFamily:G.display,fontSize:13,textTransform:'uppercase',color:'#0f0f0d',cursor:'pointer'}}>Enregistrer et préparer une séance →</button>
              </div>
            </div>}
          </>
        ) : (
          /* ═══ SÉANCE DU JOUR ═══ */
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
                  onUpdateThemes={(t)=>{setWeekThemes(t);/* auto-save */fetch(`${API}/game-plan`,{method:'PUT',headers:authH(),body:JSON.stringify({formation,category:categorie,principles:sel,training_days:jours,training_time:horaire,start_date:dateReprise,programming:t})}).catch(console.error)}}
                  onSelectWeek={(wId,tId)=>{if(tId)setThemeSeance(tId)}}
                />
              </div>
            )}

            <div style={{borderTop:`1px solid ${G.rule}`,paddingTop:20,marginTop:4}}/>
            <h2 style={{fontFamily:G.display,fontSize:24,textTransform:'uppercase',color:G.ink,marginBottom:3}}>Préparer <span style={{color:G.gold}}>ma séance</span></h2>
            <p style={{fontFamily:G.mono,fontSize:9,color:G.muted,marginBottom:14}}>Renseignez votre effectif du jour et le thème souhaité.</p>

            {/* Config séance du jour */}
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:16}} className="pdj-g">
              <div>
                <label style={labSt}>Joueurs présents</label>
                <div style={{display:'flex',alignItems:'center',gap:10}}>
                  <input type="range" min={10} max={25} value={nbPresents} onChange={e=>setNbPresents(+e.target.value)}
                    style={{flex:1,accentColor:G.gold}}/>
                  <span style={{fontFamily:G.display,fontSize:24,color:G.gold,width:40,textAlign:'center'}}>{nbPresents}</span>
                </div>
              </div>
              <div>
                <label style={labSt}>Thème de la séance</label>
                <select value={themeSeance} onChange={e=>setThemeSeance(e.target.value)} style={selSt}>
                  {THEMES_SEANCE.map(t=><option key={t.id} value={t.id}>{t.icon} {t.label}</option>)}
                </select>
              </div>
            </div>

            {/* Info dimensions */}
            <div style={{background:G.goldBg,border:`1px solid ${G.goldBdr}`,padding:'8px 12px',marginBottom:16,display:'flex',alignItems:'center',gap:8}}>
              <span style={{fontSize:14}}>📐</span>
              <p style={{fontFamily:G.mono,fontSize:8,color:G.ink2,lineHeight:1.5}}>
                Dimensions adaptées à <strong>{nbPresents} joueurs</strong> : jeu réduit {getDim(Math.floor(nbPresents/4),'m')} · match {getDim(Math.floor((nbPresents-2)/2),'l')}
              </p>
            </div>

            {/* Séance générée */}
            <div style={{marginBottom:6,display:'flex',alignItems:'center',gap:8}}>
              <div style={{width:3,height:18,background:G.gold}}/>
              <div>
                <div style={{fontFamily:G.mono,fontSize:8,letterSpacing:'.1em',textTransform:'uppercase',color:G.gold}}>
                  {joursLabels} · {horaire} · 1h30 · {nbPresents} joueurs
                </div>
                <h3 style={{fontFamily:G.display,fontSize:18,textTransform:'uppercase',color:G.ink,margin:0}}>{seance.theme}</h3>
              </div>
            </div>
            <p style={{fontFamily:G.mono,fontSize:9,color:G.muted,marginBottom:10,paddingLeft:11}}>{seance.objectif_seance}</p>

            {seance.blocs.map((b,i)=><BlocCard key={i} bloc={b}/>)}

            {/* Teaser IA */}
            <div style={{background:G.dark,padding:'16px 14px',marginTop:18,borderLeft:`3px solid ${G.gold}`,display:'flex',gap:10,alignItems:'center',flexWrap:'wrap'}}>
              <div style={{flex:1,minWidth:140}}>
                <div style={{fontFamily:G.mono,fontSize:7,letterSpacing:'.12em',textTransform:'uppercase',color:G.gold,marginBottom:3}}>Bientôt</div>
                <h3 style={{fontFamily:G.display,fontSize:16,textTransform:'uppercase',color:'#f5f2eb',marginBottom:3}}>Analyse vidéo <span style={{color:G.gold}}>→</span> Séances</h3>
                <p style={{fontFamily:G.mono,fontSize:8,color:'rgba(245,242,235,0.3)',lineHeight:1.5}}>L'IA ajustera vos séances selon les résultats de vos matchs analysés.</p>
              </div>
            </div>
          </div>
        )}
      </div>
      </>}
    </DashboardLayout>
  )
}
