import { useState, useMemo } from "react"
import DashboardLayout from '../components/DashboardLayout'
import { T, globalStyles } from '../theme'

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
  // Jeu réduit : on split l'effectif en 2 équipes
  const jrPerTeam = Math.min(half, 8)
  const jrDim = getDim(jrPerTeam, 'm')
  // Exercice : souvent groupes plus petits
  const exPerTeam = Math.min(Math.floor(n / 3), 5)
  // Match : tout le monde
  const matchPerTeam = Math.floor((n - 2) / 2) // -2 GK
  const matchDim = getDim(matchPerTeam, 'l')
  // Échauffement : rondo adapté
  const rondoAtt = Math.min(n - 2, 6)
  const rondoDef = 2
  const rondoDim = getDim(Math.ceil(rondoAtt / 2), 's')

  const seances = {
    pressing: {
      theme:'Pressing haut — déclencheurs',
      objectif_seance:`Coordonner le pressing collectif sur signal. Adapter la réaction à la perte. ${n} joueurs.`,
      blocs:[
        {
          nom:`Rondo ${rondoAtt}v${rondoDef}`,duree:'12 min',type:'ÉCHAUFFEMENT',
          objectif:'Activation + réaction à la perte de balle',
          desc:`${rondoAtt}v${rondoDef} dans un carré de ${rondoDim}. 2 touches max. Quand un défenseur intercepte, le passeur fautif le remplace. Enchaîner sans pause.`,
          coaching:['Passe au sol, ferme, dans le bon pied','Orientation du corps AVANT de recevoir','Duo pressing : un ferme, l\'autre coupe'],
          pitch:{zone:'small',els:[
            {t:'z',x:18,y:4,w:28,h:28,fill:'rgba(255,255,255,0.04)',stroke:'rgba(255,255,255,0.15)'},
            ...[{x:20,y:7},{x:44,y:7},{x:20,y:29},{x:44,y:29},{x:32,y:4},{x:32,y:32}].slice(0,rondoAtt).map(p=>({t:'p',...p,c:'#c9a227'})),
            {t:'p',x:30,y:15,c:'#ef4444',l:'D'},{t:'p',x:36,y:21,c:'#ef4444',l:'D'},
            {t:'a',x1:20,y1:7,x2:42,y2:7,c:'#c9a227',m:'mG'},
            {t:'a',x1:30,y1:15,x2:22,y2:9,c:'#ef4444',dash:true,m:'mR'},
            {t:'b',x:20,y:7},
            {t:'txt',x:32,y:36,v:rondoDim,s:'2'},
          ]},
        },
        {
          nom:`Pressing ${exPerTeam}v${Math.max(exPerTeam-1,2)} sur relance GK`,duree:'18 min',type:'SITUATION',
          objectif:'Coordonner le pressing sur la sortie de balle du GK adverse',
          desc:`Zone de 30×25m. GK relance vers ${Math.max(exPerTeam-1,2)} défenseurs. ${exPerTeam} attaquants pressent. Le central courbe sa course pour fermer la passe intérieure. Objectif : récupérer en 6 sec ou forcer le jeu long. Séries de 2min30, rotation.`,
          coaching:['L\'attaquant central COURBE sa course — il ne va pas droit','Les ailiers déclenchent EN MÊME TEMPS','Si 6 sec dépassées sans récup → on recule'],
          pitch:{zone:'half',els:[
            {t:'z',x:18,y:25,w:64,h:32,fill:'rgba(239,68,68,0.06)',stroke:'rgba(239,68,68,0.2)',dash:true},
            {t:'txt',x:50,y:23,v:'ZONE PRESSING',s:'2',c:'rgba(239,68,68,0.3)'},
            {t:'p',x:50,y:58,c:'#3b82f6',l:'GK',r:3},
            ...[{x:35,y:44,l:'DC'},{x:65,y:44,l:'DC'},{x:50,y:38,l:'6'}].slice(0,Math.max(exPerTeam-1,2)).map(p=>({t:'p',...p,c:'#3b82f6'})),
            ...[{x:50,y:30,l:'9'},{x:25,y:28,l:'7'},{x:75,y:28,l:'11'},{x:40,y:35},{x:60,y:35}].slice(0,exPerTeam).map(p=>({t:'p',...p,c:'#c9a227'})),
            {t:'ca',x1:50,y1:30,cx:42,cy:34,x2:37,y2:43,c:'#c9a227',m:'mG'},
            {t:'a',x1:25,y1:28,x2:30,y2:42,c:'#c9a227',m:'mG',bold:true},
            {t:'a',x1:75,y1:28,x2:70,y2:42,c:'#c9a227',m:'mG',bold:true},
            {t:'a',x1:50,y1:56,x2:37,y2:46,c:'#60a5fa',dash:true,m:'mB'},
            {t:'b',x:50,y:58},
            {t:'txt',x:50,y:63,v:'30×25m'},
          ]},
        },
        {
          nom:`${jrPerTeam}v${jrPerTeam} récup haute = 3 pts`,duree:'20 min',type:'JEU RÉDUIT',
          objectif:'Appliquer le pressing en jeu. Récompenser la récupération dans le camp adverse.',
          desc:`${jrPerTeam}v${jrPerTeam} + 2 GK sur ${jrDim}. But normal = 1 pt. But inscrit dans les 8 sec après récupération dans la moitié adverse = 3 pts. Matchs de 4 min.`,
          coaching:['On presse EN BLOC — pas un joueur isolé','À la récup : 1re passe vers l\'avant','Si pas de récup en 6 sec → repli collectif'],
          pitch:{zone:'full',els:[
            {t:'z',x:5,y:4,w:90,h:44,fill:'rgba(239,68,68,0.05)',stroke:'rgba(239,68,68,0.18)',dash:true},
            {t:'txt',x:50,y:10,v:'ZONE RÉCUP = 3 PTS',s:'2.5',c:'rgba(239,68,68,0.3)'},
            ...[{x:50,y:18},{x:28,y:26},{x:72,y:26},{x:35,y:38},{x:65,y:38},{x:50,y:42},{x:20,y:35},{x:80,y:35}].slice(0,jrPerTeam).map(p=>({t:'p',...p,c:'#c9a227'})),
            {t:'p',x:50,y:95,c:'#c9a227',l:'GK',r:2.8},
            ...[{x:50,y:58},{x:28,y:66},{x:72,y:66},{x:35,y:78},{x:65,y:78},{x:50,y:82},{x:20,y:72},{x:80,y:72}].slice(0,jrPerTeam).map(p=>({t:'p',...p,c:'#3b82f6'})),
            {t:'p',x:50,y:5,c:'#3b82f6',l:'GK',r:2.8},
            {t:'txt',x:50,y:99,v:jrDim},
          ]},
        },
        {
          nom:`${matchPerTeam}v${matchPerTeam} match dirigé`,duree:'20 min',type:'JEU À THÈME',
          objectif:'Pressing déclenché en conditions réelles. Le coach gèle le jeu pour corriger.',
          desc:`${matchPerTeam}v${matchPerTeam} + 2 GK sur ${matchDim}. Contrainte : pressing déclenché UNIQUEMENT sur passe courte du GK vers ses DC. Si le GK joue long → bloc médian, on ne presse pas. Le coach arrête le jeu 2-3 fois pour valider les placements. 2×8 min.`,
          coaching:['Le SIGNAL = passe courte du GK. Pas avant.','Si le pressing échoue → REPLI immédiat','Valoriser les bons déclenchements à voix haute'],
          pitch:{zone:'full',els:[
            {t:'z',x:8,y:15,w:84,h:3,fill:'rgba(201,162,39,0.2)',stroke:'rgba(201,162,39,0.4)'},
            {t:'txt',x:50,y:13,v:'LIGNE DÉCLENCHEMENT',s:'2',c:'rgba(201,162,39,0.4)'},
            ...[{x:50,y:20},{x:28,y:20},{x:72,y:20}].map(p=>({t:'p',...p,c:'#c9a227'})),
            ...[{x:22,y:32},{x:40,y:30},{x:60,y:30},{x:78,y:32}].map(p=>({t:'p',...p,c:'#c9a227'})),
            ...[{x:18,y:48},{x:38,y:46},{x:62,y:46},{x:82,y:48}].map(p=>({t:'p',...p,c:'#c9a227'})),
            {t:'a',x1:40,y1:30,x2:40,y2:22,c:'#c9a227',m:'mG',bold:true},
            {t:'a',x1:60,y1:30,x2:60,y2:22,c:'#c9a227',m:'mG',bold:true},
          ]},
        },
        {
          nom:'Débrief',duree:'5 min',type:'DÉBRIEF',
          objectif:'Ancrer les apprentissages',
          desc:'En cercle. 2 questions : "C\'est quoi le signal du pressing ?" — "Qu\'est-ce qu\'on fait si on récupère pas en 6 sec ?" Les joueurs répondent.',
          coaching:['Faire PARLER les joueurs','1 point positif, 1 axe de progrès','5 min, pas 15'],
          pitch:null,
        },
      ]
    },
    construction: {
      theme:'Construction depuis le GK',
      objectif_seance:`Sortir le ballon proprement depuis le GK. Trouver les joueurs entre les lignes. ${n} joueurs.`,
      blocs:[
        {
          nom:`Conservation ${rondoAtt}v${rondoDef} orientée`,duree:'10 min',type:'ÉCHAUFFEMENT',
          objectif:'Activation + obligation de jouer vers l\'avant',
          desc:`${rondoAtt}v${rondoDef} dans un rectangle ${rondoDim}. 2 touches. Pour marquer 1 pt : réussir une passe à travers une des 2 mini-portes (2m) placées sur un petit côté. Rotation défenseurs toutes les 45 sec.`,
          coaching:['Chercher la passe vers l\'avant DÈS que possible','Se montrer au bon timing — pas trop tôt','Passe ferme dans le bon pied'],
          pitch:{zone:'small',els:[
            {t:'z',x:14,y:3,w:34,h:30,fill:'rgba(255,255,255,0.03)',stroke:'rgba(255,255,255,0.12)'},
            {t:'z',x:24,y:2,w:4,h:1.5,fill:'rgba(201,162,39,0.3)',stroke:'#c9a227'},
            {t:'z',x:36,y:2,w:4,h:1.5,fill:'rgba(201,162,39,0.3)',stroke:'#c9a227'},
            ...[{x:16,y:8},{x:46,y:8},{x:16,y:28},{x:46,y:28},{x:31,y:18},{x:31,y:8}].slice(0,rondoAtt).map(p=>({t:'p',...p,c:'#c9a227'})),
            {t:'p',x:28,y:13,c:'#ef4444',l:'D'},{t:'p',x:34,y:22,c:'#ef4444',l:'D'},
            {t:'a',x1:31,y1:18,x2:26,y2:4,c:'#c9a227',m:'mG',bold:true},
            {t:'b',x:16,y:8},{t:'txt',x:31,y:36,v:rondoDim},
          ]},
        },
        {
          nom:`Sortie de balle ${exPerTeam+1}+GK v ${exPerTeam} presseurs`,duree:'18 min',type:'SITUATION',
          objectif:'Construire depuis le GK sous pressing. 3 circuits : central, droit, gauche.',
          desc:`Zone 30×25m. GK + 2 DC + 1 milieu relayeur + ${Math.max(exPerTeam-2,1)} latéral(aux) contre ${exPerTeam} presseurs. Le GK joue court vers un DC. Le DC oriente vers le 6 ou le latéral. Objectif : franchir la ligne des 30m. Si perte = les presseurs marquent en mini-but. Séries de 2min30.`,
          coaching:['GK : ne PAS précipiter — attendre que le circuit s\'ouvre','DC : 1re touche ORIENTÉE, jamais face à son but','Le 6 se démarque ENTRE les presseurs — pas devant, pas derrière'],
          pitch:{zone:'half',els:[
            {t:'z',x:5,y:18,w:90,h:2.5,fill:'rgba(201,162,39,0.2)',stroke:'rgba(201,162,39,0.4)'},
            {t:'txt',x:50,y:16,v:'LIGNE 30m — OBJECTIF',s:'2',c:'rgba(201,162,39,0.35)'},
            {t:'p',x:50,y:58,c:'#3b82f6',l:'GK',r:3},
            {t:'p',x:35,y:44,c:'#3b82f6',l:'DC'},{t:'p',x:65,y:44,c:'#3b82f6',l:'DC'},
            {t:'p',x:50,y:32,c:'#3b82f6',l:'6'},{t:'p',x:82,y:36,c:'#3b82f6',l:'LD'},
            ...[{x:50,y:38,l:'P'},{x:30,y:34,l:'P'},{x:70,y:34,l:'P'}].slice(0,exPerTeam).map(p=>({t:'p',...p,c:'#ef4444'})),
            {t:'a',x1:50,y1:56,x2:37,y2:46,c:'#60a5fa',m:'mB',bold:true},
            {t:'a',x1:35,y1:42,x2:48,y2:34,c:'#60a5fa',m:'mB'},
            {t:'a',x1:65,y1:42,x2:80,y2:38,c:'#60a5fa',dash:true,m:'mB'},
            {t:'b',x:50,y:58},{t:'txt',x:50,y:63,v:'30×25m'},
          ]},
        },
        {
          nom:`${jrPerTeam}v${jrPerTeam} passe entre les lignes = 2 pts`,duree:'20 min',type:'JEU RÉDUIT',
          objectif:'Chercher la passe entre les lignes en jeu. Récompenser la prise de risque.',
          desc:`${jrPerTeam}v${jrPerTeam} + 2 GK sur ${jrDim}. Bande centrale de 8m matérialisée = "zone entre les lignes". Un but après une passe AU SOL qui traverse cette zone = 2 pts. But normal = 1 pt. Matchs 4 min.`,
          coaching:['Le joueur entre les lignes se MONTRE au bon moment','Passe entre les lignes = signal d\'accélération','Si fermé au centre → on joue côté, pas de forcing'],
          pitch:{zone:'full',els:[
            {t:'z',x:5,y:43,w:90,h:12,fill:'rgba(201,162,39,0.1)',stroke:'rgba(201,162,39,0.3)',dash:true},
            {t:'txt',x:50,y:48,v:'ZONE ENTRE LES LIGNES',s:'2.2',c:'rgba(201,162,39,0.35)'},
            ...[{x:50,y:92,l:'GK',r:2.8},{x:30,y:76},{x:70,y:76},{x:25,y:62},{x:50,y:60},{x:75,y:62},{x:20,y:70},{x:80,y:70}].slice(0,jrPerTeam+1).map(p=>({t:'p',...p,c:'#c9a227'})),
            ...[{x:50,y:7,l:'GK',r:2.8},{x:30,y:22},{x:70,y:22},{x:25,y:35},{x:50,y:37},{x:75,y:35},{x:20,y:28},{x:80,y:28}].slice(0,jrPerTeam+1).map(p=>({t:'p',...p,c:'#3b82f6'})),
            {t:'a',x1:50,y1:60,x2:50,y2:37,c:'#c9a227',m:'mG',bold:true},
            {t:'txt',x:50,y:99,v:jrDim},
          ]},
        },
        {
          nom:`${matchPerTeam}v${matchPerTeam} GK joue court obligatoire`,duree:'20 min',type:'JEU À THÈME',
          objectif:'Construction depuis l\'arrière en conditions réelles. GK ne peut PAS jouer long.',
          desc:`${matchPerTeam}v${matchPerTeam} + 2 GK sur ${matchDim}. Le GK doit OBLIGATOIREMENT jouer court (au sol vers DC ou latéral). Jeu long = perte de balle. Bonus si but après 5+ passes depuis le GK. 2×8 min.`,
          coaching:['Le GK est un joueur de champ avec les mains','DC : offrir des solutions, pas attendre','Le coach gèle 2-3 fois pour corriger'],
          pitch:{zone:'full',els:[
            {t:'z',x:25,y:85,w:50,h:12,fill:'rgba(59,130,246,0.06)',stroke:'rgba(59,130,246,0.2)'},
            {t:'txt',x:50,y:83,v:'GK JOUE COURT',s:'2',c:'rgba(59,130,246,0.3)'},
            {t:'p',x:50,y:93,c:'#3b82f6',l:'GK',r:3},
            {t:'p',x:35,y:80,c:'#3b82f6'},{t:'p',x:65,y:80,c:'#3b82f6'},
            {t:'p',x:18,y:68,c:'#3b82f6'},{t:'p',x:50,y:65,c:'#3b82f6'},{t:'p',x:82,y:68,c:'#3b82f6'},
            {t:'p',x:30,y:52,c:'#3b82f6'},{t:'p',x:50,y:50,c:'#3b82f6'},{t:'p',x:70,y:52,c:'#3b82f6'},
            {t:'a',x1:50,y1:91,x2:37,y2:82,c:'#60a5fa',m:'mB',bold:true},
            {t:'a',x1:35,y1:78,x2:48,y2:67,c:'#60a5fa',m:'mB'},
          ]},
        },
        {
          nom:'Débrief',duree:'5 min',type:'DÉBRIEF',
          objectif:'"Quand jouer court ? Quand jouer long ?" — "C\'est quoi la zone entre les lignes ?"',
          desc:'Étirements en cercle. 2 questions aux joueurs. Le coach guide mais ne donne PAS les réponses. Annonce du thème suivant.',
          coaching:['Verbalisation par les joueurs','1 positif, 1 progrès','Court : 5 min max'],
          pitch:null,
        },
      ]
    },
  }

  return seances[theme] || seances.pressing
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

  // Séance du jour (variable)
  const[nbPresents,setNbPresents]=useState(16)
  const[themeSeance,setThemeSeance]=useState('pressing')

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
      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:none;}}@media(max-width:768px){.pdj-g{grid-template-columns:1fr!important;}}`}</style>

      <div style={{marginBottom:18,paddingBottom:12,borderBottom:`1px solid ${G.rule}`}}>
        <p style={{fontFamily:G.mono,fontSize:9,letterSpacing:'.16em',textTransform:'uppercase',color:G.gold,display:'flex',alignItems:'center',gap:8,marginBottom:5}}>
          <span style={{width:14,height:1,background:G.gold}}/>Planification</p>
        <h1 style={{fontFamily:G.display,fontSize:42,textTransform:'uppercase',lineHeight:.88,color:G.ink}}>Projet <span style={{color:G.gold}}>de jeu.</span></h1>
      </div>

      <div style={{maxWidth:880}}>
        {!projetSaved ? (
          <>
            <StepBar step={step} labels={['Identité','Programmation','Préparer une séance']}/>

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
                <button onClick={()=>{setProjetSaved(true);setStep(2)}} style={{flex:2,padding:'10px',background:G.gold,border:'none',fontFamily:G.display,fontSize:13,textTransform:'uppercase',color:'#0f0f0d',cursor:'pointer'}}>Enregistrer et préparer une séance →</button>
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
    </DashboardLayout>
  )
}
