import { useState, useMemo } from "react"
import DashboardLayout from '../components/DashboardLayout'
import { T, globalStyles } from '../theme'

const G = {
  bg:'#f5f2eb',surface:'#ffffff',dark:'#0a0908',dark2:'#0f0e0c',
  ink:'#1a1916',ink2:'#2d2c2a',muted:'rgba(26,25,22,0.45)',
  gold:'#c9a227',goldD:'#a8861f',goldBg:'rgba(201,162,39,0.07)',goldBdr:'rgba(201,162,39,0.22)',
  rule:'rgba(26,25,22,0.09)',
  green:'#16a34a',red:'#dc2626',blue:'#2563eb',orange:'#d97706',
  mono:"'JetBrains Mono', monospace",display:"'Anton', sans-serif",
}

/* ═══════════════════════════════════
   TERRAIN SVG
═══════════════════════════════════ */
function Pitch({w=300,h=220,zone='half',els=[],title}){
  const pw=100,ph=zone==='small'?36:zone==='half'?62:100
  return(
    <div style={{background:'#1a3d17',borderRadius:3,padding:8,display:'inline-block'}}>
      {title&&<div style={{fontFamily:G.mono,fontSize:7,letterSpacing:'.1em',textTransform:'uppercase',color:'rgba(255,255,255,0.35)',marginBottom:4,textAlign:'center'}}>{title}</div>}
      <svg viewBox={`0 0 ${pw} ${ph}`} width={w} height={h} style={{display:'block'}}>
        {/* Terrain */}
        <rect x="3" y="3" width={pw-6} height={ph-6} rx="0.5" fill="#2d5a27" stroke="rgba(255,255,255,0.3)" strokeWidth="0.5"/>
        {zone==='full'&&<><line x1="3" y1={ph/2} x2={pw-3} y2={ph/2} stroke="rgba(255,255,255,0.22)" strokeWidth="0.4"/>
          <circle cx={pw/2} cy={ph/2} r="7" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.4"/>
          <rect x={pw/2-16} y="3" width="32" height="12" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.4"/>
          <rect x={pw/2-7} y="3" width="14" height="4.5" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="0.3"/></>}
        <rect x={pw/2-16} y={ph-3-12} width="32" height="12" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="0.4"/>
        <rect x={pw/2-7} y={ph-3-4.5} width="14" height="4.5" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="0.3"/>
        {(zone==='half'||zone==='full')&&<line x1="3" y1="3" x2={pw-3} y2="3" stroke="rgba(255,255,255,0.25)" strokeWidth="0.4"/>}
        {/* Defs */}
        <defs>
          <marker id="mW" markerWidth="3.5" markerHeight="2.5" refX="3" refY="1.25" orient="auto"><polygon points="0,0 3.5,1.25 0,2.5" fill="rgba(255,255,255,0.65)"/></marker>
          <marker id="mG" markerWidth="3.5" markerHeight="2.5" refX="3" refY="1.25" orient="auto"><polygon points="0,0 3.5,1.25 0,2.5" fill="#c9a227"/></marker>
          <marker id="mB" markerWidth="3.5" markerHeight="2.5" refX="3" refY="1.25" orient="auto"><polygon points="0,0 3.5,1.25 0,2.5" fill="#60a5fa"/></marker>
          <marker id="mR" markerWidth="3.5" markerHeight="2.5" refX="3" refY="1.25" orient="auto"><polygon points="0,0 3.5,1.25 0,2.5" fill="#f87171"/></marker>
        </defs>
        {/* Zones */}
        {els.filter(e=>e.t==='z').map((z,i)=><rect key={`z${i}`} x={z.x} y={z.y} width={z.w} height={z.h} fill={z.fill||'rgba(201,162,39,0.12)'} stroke={z.stroke||'rgba(201,162,39,0.35)'} strokeWidth="0.4" strokeDasharray={z.dash?"1.5,1":"none"} rx="0.5"/>)}
        {/* Arrows */}
        {els.filter(e=>e.t==='a').map((a,i)=><line key={`a${i}`} x1={a.x1} y1={a.y1} x2={a.x2} y2={a.y2} stroke={a.c||'rgba(255,255,255,0.55)'} strokeWidth={a.bold?"0.9":"0.5"} strokeDasharray={a.dash?"1.5,1.5":"none"} markerEnd={`url(#${a.m||'mW'})`}/>)}
        {/* Curved arrows */}
        {els.filter(e=>e.t==='ca').map((a,i)=><path key={`ca${i}`} d={`M${a.x1},${a.y1} Q${a.cx},${a.cy} ${a.x2},${a.y2}`} fill="none" stroke={a.c||'rgba(255,255,255,0.55)'} strokeWidth="0.5" strokeDasharray={a.dash?"1.5,1.5":"none"} markerEnd={`url(#${a.m||'mW'})`}/>)}
        {/* Players */}
        {els.filter(e=>e.t==='p').map((p,i)=><g key={`p${i}`}><circle cx={p.x} cy={p.y} r={p.r||2.3} fill={p.c||'#c9a227'} stroke="rgba(255,255,255,0.75)" strokeWidth="0.35"/>{p.l&&<text x={p.x} y={p.y+0.7} textAnchor="middle" fill="#fff" fontSize="2" fontWeight="700" fontFamily="sans-serif">{p.l}</text>}</g>)}
        {/* Cones */}
        {els.filter(e=>e.t==='cone').map((c,i)=><polygon key={`c${i}`} points={`${c.x},${c.y-1} ${c.x-0.8},${c.y+0.7} ${c.x+0.8},${c.y+0.7}`} fill={c.c||'#f59e0b'} stroke="rgba(0,0,0,0.2)" strokeWidth="0.2"/>)}
        {/* Ball */}
        {els.filter(e=>e.t==='b').map((b,i)=><circle key={`b${i}`} cx={b.x} cy={b.y} r="1.3" fill="#fff" stroke="#555" strokeWidth="0.25"/>)}
        {/* Text labels */}
        {els.filter(e=>e.t==='txt').map((t,i)=><text key={`t${i}`} x={t.x} y={t.y} textAnchor="middle" fill={t.c||'rgba(255,255,255,0.4)'} fontSize={t.s||"2.5"} fontFamily="sans-serif" fontWeight="600">{t.v}</text>)}
      </svg>
    </div>
  )
}

/* ═══════════════════════════════════
   DONNÉES SÉANCES — cohérentes, réalistes
═══════════════════════════════════ */

function buildSeances(nbJoueurs, nbSeances) {
  const n = nbJoueurs || 16
  // Adapter les effectifs : si 14 joueurs → 6v6+GK, si 18 → 8v8+GK etc.
  const jrSize = Math.min(Math.floor(n / 2), 8) // taille jeu réduit par équipe
  const matchSize = Math.min(n - 2, 18) // taille match (- 2 GK)

  const seance1 = {
    theme: 'Pressing haut — déclencheurs',
    principe: 'Pressing haut à la perte',
    objectif_seance: `Apprendre à déclencher le pressing collectif sur signal (passe arrière adverse). ${n} joueurs.`,
    blocs: [
      {
        nom:'Échauffement — Rondo pressing',duree:'12 min',type:'ÉCHAUFFEMENT',
        objectif:'Activation + réaction à la perte de balle',
        desc:`Rondo ${Math.min(n-2,5)}v2 dans un carré 12x12m. 2 touches max. À la perte, le passeur fautif + son voisin deviennent défenseurs. Enchaîner 3 rotations sans pause.`,
        coaching:['Orientation du corps AVANT de recevoir','Passe ferme au sol, pas molle','Le duo qui presse : un ferme le porteur, l\'autre coupe la ligne de passe'],
        pitch:{zone:'small',els:[
          {t:'z',x:20,y:5,w:24,h:24,fill:'rgba(255,255,255,0.04)',stroke:'rgba(255,255,255,0.15)'},
          // 5 attaquants en cercle
          {t:'p',x:22,y:8,c:'#c9a227'},{t:'p',x:42,y:8,c:'#c9a227'},
          {t:'p',x:22,y:27,c:'#c9a227'},{t:'p',x:42,y:27,c:'#c9a227'},{t:'p',x:32,y:5,c:'#c9a227'},
          // 2 défenseurs
          {t:'p',x:29,y:15,c:'#ef4444',l:'D'},{t:'p',x:35,y:20,c:'#ef4444',l:'D'},
          // Passe
          {t:'a',x1:22,y1:8,x2:40,y2:8,c:'#c9a227',m:'mG'},
          // Course pressing
          {t:'a',x1:29,y1:15,x2:24,y2:10,c:'#ef4444',dash:true,m:'mR'},
          {t:'b',x:22,y:8},
          {t:'txt',x:32,y:34,v:'12×12m',s:'2.2'},
        ]},
      },
      {
        nom:'Pressing 3v2 sur relance GK',duree:'18 min',type:'EXERCICE',
        objectif:'Coordonner le pressing à 3 sur la sortie de balle adverse (GK → DC)',
        desc:`Zone 30×25m. GK relance vers 2 DC. 3 attaquants (1 central + 2 côtés) pressent. L'attaquant central courbe sa course pour fermer la passe entre les 2 DC. Les 2 ailiers ferment les côtés. Objectif : récupérer en moins de 6 secondes OU forcer la passe longue. Séries de 3 min, rotation des rôles.`,
        coaching:['L\'attaquant central NE va PAS droit sur le ballon — il courbe pour fermer la passe intérieure','Les ailiers déclenchent EN MÊME TEMPS','Si le GK garde en main → reculer, pas presser le GK'],
        pitch:{zone:'half',els:[
          // Zone pressing
          {t:'z',x:18,y:28,w:64,h:30,fill:'rgba(239,68,68,0.06)',stroke:'rgba(239,68,68,0.2)',dash:true},
          {t:'txt',x:50,y:26,v:'ZONE DE PRESSING',s:'2',c:'rgba(239,68,68,0.35)'},
          // Défenseurs
          {t:'p',x:50,y:56,c:'#3b82f6',l:'GK',r:3},
          {t:'p',x:35,y:43,c:'#3b82f6',l:'DC'},{t:'p',x:65,y:43,c:'#3b82f6',l:'DC'},
          // Attaquants pressing
          {t:'p',x:50,y:30,c:'#c9a227',l:'9'},{t:'p',x:25,y:32,c:'#c9a227',l:'7'},{t:'p',x:75,y:32,c:'#c9a227',l:'11'},
          // Course courbée du 9
          {t:'ca',x1:50,y1:30,cx:42,cy:35,x2:37,y2:42,c:'#c9a227',m:'mG'},
          // Courses ailiers
          {t:'a',x1:25,y1:32,x2:30,y2:41,c:'#c9a227',m:'mG',bold:true},
          {t:'a',x1:75,y1:32,x2:70,y2:41,c:'#c9a227',m:'mG',bold:true},
          // Passe GK
          {t:'a',x1:50,y1:54,x2:37,y2:45,c:'#60a5fa',dash:true,m:'mB'},
          {t:'b',x:50,y:56},
          {t:'txt',x:50,y:61,v:'30×25m',s:'2'},
        ]},
      },
      {
        nom:`${jrSize}v${jrSize} récup haute = 3 pts`,duree:'20 min',type:'JEU RÉDUIT',
        objectif:'Appliquer le pressing en situation de jeu. Valoriser la récupération haute.',
        desc:`${jrSize}v${jrSize} + 2 GK sur 45×30m. But normal = 1 pt. But inscrit dans les 8 secondes après une récupération dans la moitié de terrain adverse = 3 pts. Matchs de 4 min.`,
        coaching:['On presse EN BLOC, pas un joueur tout seul','À la récup : 1re passe VERS L\'AVANT, pas sur le côté','Si on ne récupère pas en 6 sec → on recule, on ne court pas dans le vide'],
        pitch:{zone:'full',els:[
          // Zone bonus (moitié haute)
          {t:'z',x:5,y:4,w:90,h:44,fill:'rgba(239,68,68,0.05)',stroke:'rgba(239,68,68,0.18)',dash:true},
          {t:'txt',x:50,y:10,v:'ZONE RÉCUP = 3 PTS',s:'2.5',c:'rgba(239,68,68,0.3)'},
          // Equipe gold (pressing)
          ...[{x:50,y:18},{x:30,y:28},{x:70,y:28},{x:35,y:40},{x:65,y:40},{x:50,y:45}].slice(0,jrSize).map(p=>({t:'p',x:p.x,y:p.y,c:'#c9a227'})),
          {t:'p',x:50,y:95,c:'#c9a227',l:'GK',r:2.8},
          // Equipe bleue
          ...[{x:50,y:58},{x:30,y:65},{x:70,y:65},{x:35,y:78},{x:65,y:78},{x:50,y:85}].slice(0,jrSize).map(p=>({t:'p',x:p.x,y:p.y,c:'#3b82f6'})),
          {t:'p',x:50,y:5,c:'#3b82f6',l:'GK',r:2.8},
          {t:'txt',x:50,y:99,v:'45×30m',s:'2'},
        ]},
      },
      {
        nom:'Match dirigé — pressing déclenché',duree:'20 min',type:'JEU À THÈME',
        objectif:'Application en conditions réelles. Le coach gèle le jeu pour corriger les placements.',
        desc:`${Math.floor(matchSize/2)}v${Math.floor(matchSize/2)} + 2 GK sur grand terrain. Règle : le pressing se déclenche UNIQUEMENT quand le GK adverse joue court vers ses DC. Si le GK joue long → bloc médian, on ne presse pas. Le coach arrête le jeu 2-3 fois pour valider ou corriger un placement. 2×8 min.`,
        coaching:['Le SIGNAL c\'est la passe courte du GK. Pas avant.','Si on presse et qu\'on ne récupère pas → REPLI immédiat','Valoriser à voix haute les bons déclenchements'],
        pitch:{zone:'full',els:[
          // Ligne de pressing
          {t:'z',x:8,y:15,w:84,h:3,fill:'rgba(201,162,39,0.2)',stroke:'rgba(201,162,39,0.4)'},
          {t:'txt',x:50,y:13,v:'LIGNE DE DÉCLENCHEMENT',s:'2',c:'rgba(201,162,39,0.4)'},
          // Bloc gold en pressing haut
          {t:'p',x:50,y:20,c:'#c9a227'},{t:'p',x:30,y:20,c:'#c9a227'},{t:'p',x:70,y:20,c:'#c9a227'},
          {t:'p',x:25,y:32,c:'#c9a227'},{t:'p',x:42,y:30,c:'#c9a227'},{t:'p',x:58,y:30,c:'#c9a227'},{t:'p',x:75,y:32,c:'#c9a227'},
          {t:'p',x:20,y:50,c:'#c9a227'},{t:'p',x:40,y:48,c:'#c9a227'},{t:'p',x:60,y:48,c:'#c9a227'},{t:'p',x:80,y:50,c:'#c9a227'},
          // Flèches pressing collectif
          {t:'a',x1:42,y1:30,x2:42,y2:22,c:'#c9a227',m:'mG',bold:true},
          {t:'a',x1:58,y1:30,x2:58,y2:22,c:'#c9a227',m:'mG',bold:true},
        ]},
      },
      {
        nom:'Retour au calme + débrief',duree:'5 min',type:'DÉBRIEF',
        objectif:'Ancrer les apprentissages. Le coach pose 2 questions.',
        desc:'Étirements légers en cercle. Le coach demande : "C\'est quoi le signal du pressing ?" et "Qu\'est-ce qu\'on fait si on ne récupère pas en 6 secondes ?". Les joueurs répondent, pas le coach.',
        coaching:['Faire parler les joueurs, pas donner les réponses','Valoriser 1 moment positif de la séance','Annoncer le thème de la prochaine séance'],
        pitch:null,
      },
    ]
  }

  const seance2 = {
    theme: 'Construction courte depuis le gardien',
    principe: 'Construction courte + jeu entre les lignes',
    objectif_seance: `Maîtriser la sortie de balle depuis le GK et trouver les joueurs entre les lignes. ${n} joueurs.`,
    blocs: [
      {
        nom:'Échauffement — Conservation orientée',duree:'10 min',type:'ÉCHAUFFEMENT',
        objectif:'Activation + prise d\'info + obligation de jouer vers l\'avant',
        desc:`${Math.min(n-2,5)}v2 dans un rectangle 18×12m. L'équipe en possession doit réussir 6 passes ET finir par une passe dans une des 2 mini-portes (2m) placées sur le petit côté. Les défenseurs tournent toutes les 45 sec.`,
        coaching:['Chercher la passe vers l\'avant DÈS que possible','Se montrer dans le bon timing, pas trop tôt','Passe au sol, ferme, dans le bon pied'],
        pitch:{zone:'small',els:[
          {t:'z',x:13,y:3,w:36,h:28,fill:'rgba(255,255,255,0.03)',stroke:'rgba(255,255,255,0.12)'},
          // Mini-portes en haut
          {t:'z',x:25,y:2,w:4,h:1.5,fill:'rgba(201,162,39,0.3)',stroke:'#c9a227'},
          {t:'z',x:35,y:2,w:4,h:1.5,fill:'rgba(201,162,39,0.3)',stroke:'#c9a227'},
          // Joueurs
          {t:'p',x:15,y:10,c:'#c9a227'},{t:'p',x:47,y:10,c:'#c9a227'},
          {t:'p',x:15,y:25,c:'#c9a227'},{t:'p',x:47,y:25,c:'#c9a227'},{t:'p',x:31,y:17,c:'#c9a227'},
          {t:'p',x:28,y:12,c:'#ef4444',l:'D'},{t:'p',x:34,y:22,c:'#ef4444',l:'D'},
          {t:'a',x1:31,y1:17,x2:27,y2:4,c:'#c9a227',m:'mG',bold:true},
          {t:'b',x:15,y:10},
          {t:'txt',x:31,y:34,v:'18×12m',s:'2'},
        ]},
      },
      {
        nom:'Sortie de balle — 4+GK v 3 presseurs',duree:'18 min',type:'SITUATION',
        objectif:'Construire depuis le GK sous pressing. 3 circuits : central, droit, gauche.',
        desc:`GK + 2 DC + 1 milieu relayeur (6) + 1 latéral côté libre contre 3 presseurs. Le GK relance court vers un DC. Le DC oriente vers le milieu 6 ou le latéral. Objectif : franchir la ligne des 30m balle au pied ou par une passe. Les presseurs marquent en mini-but si récup. Séries de 2 min 30, rotation des rôles.`,
        coaching:['GK : ne PAS précipiter. Attendre que le circuit s\'ouvre.','DC : 1re touche ORIENTÉE vers l\'avant, jamais face à son but','Le 6 doit se démarquer ENTRE les 2 presseurs centraux — pas devant, pas derrière, ENTRE'],
        pitch:{zone:'half',els:[
          // Ligne des 30m (objectif)
          {t:'z',x:5,y:18,w:90,h:2,fill:'rgba(201,162,39,0.2)',stroke:'rgba(201,162,39,0.4)'},
          {t:'txt',x:50,y:16,v:'LIGNE OBJECTIF — 30m',s:'2',c:'rgba(201,162,39,0.35)'},
          // Défenseurs (bleu = équipe qui construit)
          {t:'p',x:50,y:56,c:'#3b82f6',l:'GK',r:3},
          {t:'p',x:35,y:42,c:'#3b82f6',l:'DC'},{t:'p',x:65,y:42,c:'#3b82f6',l:'DC'},
          {t:'p',x:50,y:30,c:'#3b82f6',l:'6'},
          {t:'p',x:82,y:35,c:'#3b82f6',l:'LD'},
          // Presseurs
          {t:'p',x:50,y:37,c:'#ef4444',l:'P'},{t:'p',x:30,y:33,c:'#ef4444',l:'P'},{t:'p',x:70,y:33,c:'#ef4444',l:'P'},
          // Circuit 1 : GK → DC gauche → 6
          {t:'a',x1:50,y1:54,x2:37,y2:44,c:'#60a5fa',m:'mB',bold:true},
          {t:'a',x1:35,y1:40,x2:48,y2:32,c:'#60a5fa',m:'mB'},
          // Circuit 2 : GK → DC droit → LD
          {t:'a',x1:50,y1:54,x2:63,y2:44,c:'#60a5fa',dash:true,m:'mB'},
          {t:'a',x1:65,y1:40,x2:80,y2:37,c:'#60a5fa',dash:true,m:'mB'},
          // Mini-but presseurs
          {t:'z',x:48,y:58,w:4,h:2,fill:'rgba(239,68,68,0.3)',stroke:'#ef4444'},
          {t:'b',x:50,y:56},
          {t:'txt',x:50,y:61,v:'30×25m',s:'2'},
        ]},
      },
      {
        nom:`${jrSize}v${jrSize} trouver le joueur entre les lignes`,duree:'20 min',type:'JEU RÉDUIT',
        objectif:'En jeu, chercher la passe entre les lignes adverses. Récompenser la prise de risque.',
        desc:`${jrSize}v${jrSize} + 2 GK sur 40×28m. Règle : un but inscrit après une passe qui a traversé la "zone interdite" (bande centrale de 8m matérialisée) vaut 2 pts. Un but normal = 1 pt. La passe entre les lignes doit être jouée AU SOL. Matchs de 4 min.`,
        coaching:['Le joueur entre les lignes doit se MONTRER au bon moment — pas trop tôt','La passe entre les lignes = signal d\'accélération collective','Si la passe entre les lignes est fermée, on joue sur les côtés. Pas de forcing.'],
        pitch:{zone:'full',els:[
          // Zone interdite (entre les lignes)
          {t:'z',x:5,y:42,w:90,h:12,fill:'rgba(201,162,39,0.1)',stroke:'rgba(201,162,39,0.3)',dash:true},
          {t:'txt',x:50,y:47,v:'ZONE « ENTRE LES LIGNES »',s:'2.2',c:'rgba(201,162,39,0.4)'},
          // Equipe gold
          ...[{x:50,y:90,l:'GK',r:2.8},{x:30,y:75},{x:70,y:75},{x:25,y:60},{x:50,y:58},{x:75,y:60}].slice(0,jrSize+1).map(p=>({t:'p',x:p.x,y:p.y,c:'#c9a227',l:p.l,r:p.r})),
          // Equipe bleue
          ...[{x:50,y:7,l:'GK',r:2.8},{x:30,y:22},{x:70,y:22},{x:25,y:35},{x:50,y:37},{x:75,y:35}].slice(0,jrSize+1).map(p=>({t:'p',x:p.x,y:p.y,c:'#3b82f6',l:p.l,r:p.r})),
          // Passe entre les lignes
          {t:'a',x1:50,y1:58,x2:50,y2:37,c:'#c9a227',m:'mG',bold:true},
          {t:'txt',x:50,y:98,v:'40×28m',s:'2'},
        ]},
      },
      {
        nom:'Match dirigé — construction obligatoire',duree:'20 min',type:'JEU À THÈME',
        objectif:'Construire depuis l\'arrière en situation réelle. Le GK ne peut PAS jouer long.',
        desc:`${Math.floor(matchSize/2)}v${Math.floor(matchSize/2)} + 2 GK. Contrainte : le GK doit OBLIGATOIREMENT jouer court (passe au sol vers un DC ou un latéral). Le jeu long est interdit pour l'équipe en construction. Si le GK joue long = perte de balle. Point bonus si le but vient d'une construction de 5+ passes depuis le GK. 2×8 min.`,
        coaching:['Le GK est un joueur de champ avec les mains','Les DC doivent OFFRIR des solutions — pas attendre','Le coach gèle 2-3 fois pour montrer les bons placements'],
        pitch:{zone:'full',els:[
          // GK zone
          {t:'z',x:30,y:85,w:40,h:12,fill:'rgba(59,130,246,0.06)',stroke:'rgba(59,130,246,0.2)'},
          {t:'txt',x:50,y:84,v:'GK JOUE COURT OBLIGATOIRE',s:'2',c:'rgba(59,130,246,0.35)'},
          {t:'p',x:50,y:93,c:'#3b82f6',l:'GK',r:3},
          {t:'p',x:35,y:80,c:'#3b82f6'},{t:'p',x:65,y:80,c:'#3b82f6'},
          {t:'p',x:18,y:68,c:'#3b82f6'},{t:'p',x:50,y:65,c:'#3b82f6'},{t:'p',x:82,y:68,c:'#3b82f6'},
          {t:'p',x:30,y:52,c:'#3b82f6'},{t:'p',x:50,y:50,c:'#3b82f6'},{t:'p',x:70,y:52,c:'#3b82f6'},
          // Flèche construction
          {t:'a',x1:50,y1:91,x2:37,y2:82,c:'#60a5fa',m:'mB',bold:true},
          {t:'a',x1:35,y1:78,x2:48,y2:67,c:'#60a5fa',m:'mB'},
        ]},
      },
      {
        nom:'Débrief',duree:'5 min',type:'DÉBRIEF',
        objectif:'Questions : "Quand est-ce qu\'on joue court ? Quand est-ce qu\'on joue long ?" — "C\'est quoi la zone entre les lignes ?"',
        desc:'Étirements en cercle. 2 questions posées aux joueurs. Le coach ne donne PAS les réponses, il guide. Annonce du thème de la prochaine séance.',
        coaching:['Faire verbaliser les joueurs','1 point positif collectif, 1 axe de progrès','Rester court : 5 min, pas 15'],
        pitch:null,
      },
    ]
  }

  return [seance1, seance2].slice(0, nbSeances)
}

/* ═══ Programmation ═══ */
const PROG=[
  {period:'Préparation',wk:6,color:G.green,themes:['Reprise physique + cohésion','Mise en place du bloc défensif','Circuits de jeu — construction','Automatismes offensifs — triangles','Matchs de prépa (Intégration)','Montée en charge — répétitions'],focus:'Installer les bases du projet de jeu. Volume physique + principes.'},
  {period:'Phase aller — Début',wk:8,color:G.gold,themes:['Pressing haut — déclencheurs','Construction sous pression','Jeu entre les lignes','Transitions OFF/DEF','Animation côté fort','Gestion temps faibles','CPA offensifs','Récupération active'],focus:'Installer les principes en situation de compétition.'},
  {period:'Phase aller — Fin',wk:8,color:G.orange,themes:['Adaptation vs bloc bas','Défense en infériorité','Finition + efficacité','Gestion du score','Permutations','Ressort mental','Bilan mi-saison','Trêve — régénération'],focus:'Consolider. Corriger. Préparer la trêve.'},
  {period:'Trêve hivernale',wk:3,color:G.blue,themes:['Reprise progressive','Rappels projet de jeu','Intégration nouveaux joueurs'],focus:'Recharger et réajuster.'},
  {period:'Phase retour',wk:10,color:G.gold,themes:['Réactivation pressing','Plan B tactique','Supériorité numérique milieu','Jeu long comme alternative','Pressing orienté + piège','CPA défensifs','Gestion fatigue','Intensité compétition','Prépa mentale','Matchs décisifs'],focus:'Monter en puissance. Variété tactique.'},
  {period:'Sprint final',wk:6,color:G.red,themes:['Automatismes sous pression','Gestion émotionnelle','Plans adversaire spécifiques','Scénarios (mener/être mené)','Maintien physique','Bilan de saison'],focus:'Exécuter. Pas expérimenter.'},
]

const JOURS=[{id:'lundi',label:'Lun'},{id:'mardi',label:'Mar'},{id:'mercredi',label:'Mer'},{id:'jeudi',label:'Jeu'},{id:'vendredi',label:'Ven'},{id:'samedi',label:'Sam'},{id:'dimanche',label:'Dim'}]

/* ═══ COMPOSANTS UI ═══ */
function StepBar({step,labels}){return(
  <div style={{display:'flex',alignItems:'center',gap:0,marginBottom:28,flexWrap:'wrap'}}>
    {labels.map((l,i)=>(
      <div key={i} style={{display:'flex',alignItems:'center'}}>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <div style={{width:26,height:26,borderRadius:'50%',background:i<=step?G.gold:'transparent',border:`2px solid ${i<=step?G.gold:G.rule}`,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:G.mono,fontSize:10,fontWeight:700,color:i<=step?'#0f0f0d':G.muted}}>{i<step?'✓':i+1}</div>
          <span style={{fontFamily:G.mono,fontSize:8,letterSpacing:'.08em',textTransform:'uppercase',color:i<=step?G.ink:G.muted,fontWeight:i===step?700:400}}>{l}</span>
        </div>
        {i<labels.length-1&&<div style={{width:24,height:2,background:i<step?G.gold:G.rule,margin:'0 8px'}}/>}
      </div>
    ))}
  </div>
)}

function Tag({children,active,onClick}){return(
  <button onClick={onClick} style={{padding:'7px 13px',fontFamily:G.mono,fontSize:10,background:active?G.gold:G.surface,color:active?'#0f0f0d':G.muted,border:`1.5px solid ${active?G.gold:G.rule}`,cursor:'pointer',fontWeight:active?700:400,transition:'all .12s'}}>{children}</button>
)}

function PrincipeCard({p,sel,onToggle}){return(
  <button onClick={onToggle} style={{width:'100%',textAlign:'left',cursor:'pointer',padding:'10px 12px',background:sel?G.goldBg:G.surface,border:`1.5px solid ${sel?G.gold:G.rule}`,transition:'all .15s',display:'flex',alignItems:'flex-start',gap:9}}>
    <div style={{width:16,height:16,flexShrink:0,marginTop:1,border:`2px solid ${sel?G.gold:G.rule}`,borderRadius:3,display:'flex',alignItems:'center',justifyContent:'center',background:sel?G.gold:'transparent'}}>
      {sel&&<span style={{color:'#0f0f0d',fontSize:10,fontWeight:900}}>✓</span>}
    </div>
    <div>
      <div style={{fontFamily:G.display,fontSize:14,textTransform:'uppercase',color:sel?G.ink:G.ink2,marginBottom:1}}>{p.label}</div>
      <div style={{fontFamily:G.mono,fontSize:8,color:G.muted,lineHeight:1.5}}>{p.desc}</div>
    </div>
  </button>
)}

function PeriodCard({p,startDate}){
  const[open,setOpen]=useState(false)
  return(
    <div style={{background:G.surface,border:`1px solid ${G.rule}`,borderLeft:`3px solid ${p.color}`,marginBottom:4}}>
      <button onClick={()=>setOpen(o=>!o)} style={{width:'100%',display:'flex',alignItems:'center',justifyContent:'space-between',padding:'12px 14px',background:'transparent',border:'none',cursor:'pointer'}}>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <div style={{width:28,height:28,background:p.color+'15',border:`1px solid ${p.color}30`,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:G.display,fontSize:13,color:p.color}}>{p.wk}</div>
          <div style={{textAlign:'left'}}>
            <div style={{fontFamily:G.display,fontSize:14,textTransform:'uppercase',color:G.ink}}>{p.period}</div>
            <div style={{fontFamily:G.mono,fontSize:8,color:G.muted}}>{startDate||''} · {p.wk} sem.</div>
          </div>
        </div>
        <span style={{fontFamily:G.mono,fontSize:12,color:G.muted,transform:open?'rotate(90deg)':'none',transition:'transform .2s'}}>›</span>
      </button>
      {open&&<div style={{padding:'0 14px 12px',borderTop:`1px solid ${G.rule}`}}>
        <p style={{fontFamily:G.mono,fontSize:10,color:G.muted,fontStyle:'italic',margin:'10px 0 10px'}}>{p.focus}</p>
        {p.themes.map((t,i)=>(
          <div key={i} style={{display:'flex',alignItems:'center',gap:8,padding:'4px 8px',background:i%2===0?G.goldBg:'transparent'}}>
            <span style={{fontFamily:G.mono,fontSize:8,color:p.color,fontWeight:700,width:16}}>S{i+1}</span>
            <span style={{fontFamily:G.mono,fontSize:10,color:G.ink2}}>{t}</span>
          </div>
        ))}
      </div>}
    </div>
)}

function BlocCard({bloc,index}){
  const[showPitch,setShowPitch]=useState(false)
  const typeColors={ÉCHAUFFEMENT:G.green,EXERCICE:G.blue,SITUATION:G.orange,'JEU RÉDUIT':G.gold,'JEU À THÈME':'#8b5cf6',DÉBRIEF:G.muted}
  const tc=typeColors[bloc.type]||G.muted
  return(
    <div style={{background:G.surface,border:`1px solid ${G.rule}`,borderLeft:`3px solid ${tc}`,marginBottom:6}}>
      <div style={{padding:'12px 14px'}}>
        {/* Header */}
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:8}}>
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            <span style={{fontFamily:G.mono,fontSize:7,letterSpacing:'.12em',textTransform:'uppercase',padding:'2px 6px',background:tc+'15',color:tc,border:`1px solid ${tc}30`}}>{bloc.type}</span>
            <span style={{fontFamily:G.mono,fontSize:9,color:G.muted}}>{bloc.duree}</span>
          </div>
          {bloc.pitch&&<button onClick={()=>setShowPitch(o=>!o)} style={{fontFamily:G.mono,fontSize:8,color:G.gold,background:G.goldBg,border:`1px solid ${G.goldBdr}`,padding:'3px 8px',cursor:'pointer'}}>{showPitch?'✕ Masquer':'▶ Terrain'}</button>}
        </div>
        {/* Title + objective */}
        <h4 style={{fontFamily:G.display,fontSize:15,textTransform:'uppercase',color:G.ink,marginBottom:3}}>{bloc.nom}</h4>
        <p style={{fontFamily:G.mono,fontSize:9,color:G.gold,marginBottom:8,letterSpacing:'.04em'}}>Objectif : {bloc.objectif}</p>
        {/* Description */}
        <p style={{fontFamily:G.mono,fontSize:10,color:G.ink2,lineHeight:1.6,marginBottom:bloc.coaching?8:0}}>{bloc.desc}</p>
        {/* Coaching points */}
        {bloc.coaching&&bloc.coaching.length>0&&(
          <div style={{background:'rgba(26,25,22,0.02)',border:`1px solid ${G.rule}`,padding:'8px 10px',marginTop:4}}>
            <div style={{fontFamily:G.mono,fontSize:7,letterSpacing:'.14em',textTransform:'uppercase',color:G.gold,marginBottom:5}}>Points clés</div>
            {bloc.coaching.map((c,i)=>(
              <div key={i} style={{display:'flex',gap:6,marginBottom:3}}>
                <span style={{fontFamily:G.mono,fontSize:9,color:G.gold,flexShrink:0}}>→</span>
                <span style={{fontFamily:G.mono,fontSize:9,color:G.ink2,lineHeight:1.5}}>{c}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Pitch diagram */}
      {showPitch&&bloc.pitch&&(
        <div style={{padding:'12px 14px',background:'rgba(45,90,39,0.04)',borderTop:`1px solid ${G.rule}`,display:'flex',justifyContent:'center'}}>
          <Pitch w={320} h={bloc.pitch.zone==='small'?140:bloc.pitch.zone==='half'?220:280} zone={bloc.pitch.zone} els={bloc.pitch.els}/>
        </div>
      )}
    </div>
  )
}

/* ═══ MAIN ═══ */
const PRINCIPES={
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
    {id:'tr2',label:'Transition offensive patiente',desc:'Sécuriser puis accélérer'},
    {id:'tr3',label:'Repli défensif immédiat',desc:'Course vers son but, replacements rapides'},
    {id:'tr4',label:'Contre-pressing',desc:'Récupération dans les 6 sec après la perte'},
  ],
  'Coups de pied arrêtés':[
    {id:'cpa1',label:'Corners offensifs travaillés',desc:'Schémas prédéfinis, mouvements coordonnés'},
    {id:'cpa2',label:'Coups francs indirects',desc:'Combinaisons courtes sur CF latéraux'},
    {id:'cpa3',label:'Défense de zone sur CPA',desc:'Placement zonal, responsabilités claires'},
  ],
}

export default function ProjetDeJeu(){
  const[step,setStep]=useState(0)
  const[sel,setSel]=useState([])
  const[formation,setFormation]=useState('4-3-3')
  const[categorie,setCategorie]=useState('Seniors')
  const[nbJoueurs,setNbJoueurs]=useState(16)
  const[dateReprise,setDateReprise]=useState('')
  const[jours,setJours]=useState(['mardi','jeudi'])
  const[horaire,setHoraire]=useState('19:00')

  const toggle=id=>setSel(p=>p.includes(id)?p.filter(x=>x!==id):p.length>=5?p:[...p,id])
  const toggleJ=id=>setJours(p=>p.includes(id)?p.filter(x=>x!==id):[...p,id].sort((a,b)=>JOURS.findIndex(j=>j.id===a)-JOURS.findIndex(j=>j.id===b)))

  const allP=Object.values(PRINCIPES).flat()
  const selLabels=sel.map(id=>allP.find(p=>p.id===id)?.label).filter(Boolean)
  const seances=useMemo(()=>buildSeances(nbJoueurs,jours.length),[nbJoueurs,jours.length])

  const periodDates=useMemo(()=>{
    if(!dateReprise)return[]
    let c=new Date(dateReprise)
    return PROG.map(p=>{const d=new Date(c);c.setDate(c.getDate()+p.wk*7);return d.toLocaleDateString('fr-FR',{day:'numeric',month:'short'})})
  },[dateReprise])

  const joursLabels=jours.map(j=>JOURS.find(x=>x.id===j)?.label).join(' + ')
  const ok=sel.length>=3&&dateReprise&&jours.length>=1

  const selStyle={width:'100%',padding:'8px 10px',fontFamily:G.mono,fontSize:11,border:`1px solid ${G.rule}`,background:G.surface,color:G.ink,outline:'none',cursor:'pointer',boxSizing:'border-box'}
  const labStyle={fontFamily:G.mono,fontSize:8,letterSpacing:'.12em',textTransform:'uppercase',color:G.muted,display:'block',marginBottom:4}

  return(
    <DashboardLayout>
      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:none;}}@media(max-width:768px){.pdj-g{grid-template-columns:1fr!important;}}`}</style>

      <div style={{marginBottom:20,paddingBottom:14,borderBottom:`1px solid ${G.rule}`}}>
        <p style={{fontFamily:G.mono,fontSize:9,letterSpacing:'.18em',textTransform:'uppercase',color:G.gold,display:'flex',alignItems:'center',gap:8,marginBottom:6}}>
          <span style={{width:14,height:1,background:G.gold}}/>Planification</p>
        <h1 style={{fontFamily:G.display,fontSize:44,textTransform:'uppercase',lineHeight:.88,color:G.ink}}>Projet <span style={{color:G.gold}}>de jeu.</span></h1>
      </div>

      <div style={{maxWidth:880}}>
        <StepBar step={step} labels={['Identité','Programmation','Séances']}/>

        {/* ═══ STEP 1 ═══ */}
        {step===0&&<div style={{animation:'fadeIn .3s ease'}}>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8,marginBottom:18}} className="pdj-g">
            <div><label style={labStyle}>Formation</label><select value={formation} onChange={e=>setFormation(e.target.value)} style={selStyle}>
              {['4-4-2','4-3-3','3-5-2','4-2-3-1','3-4-3','4-1-4-1'].map(f=><option key={f}>{f}</option>)}</select></div>
            <div><label style={labStyle}>Catégorie</label><select value={categorie} onChange={e=>setCategorie(e.target.value)} style={selStyle}>
              {['U14','U15','U16','U17','U18','U19','Seniors'].map(c=><option key={c}>{c}</option>)}</select></div>
            <div><label style={labStyle}>Joueurs à l'entraînement</label><select value={nbJoueurs} onChange={e=>setNbJoueurs(+e.target.value)} style={selStyle}>
              {[12,14,16,18,20,22].map(n=><option key={n} value={n}>{n} joueurs</option>)}</select></div>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:18}} className="pdj-g">
            <div><label style={labStyle}>Date de reprise</label><input type="date" value={dateReprise} onChange={e=>setDateReprise(e.target.value)} style={selStyle}/></div>
            <div><label style={labStyle}>Horaire</label><input type="time" value={horaire} onChange={e=>setHoraire(e.target.value)} style={selStyle}/></div>
          </div>
          <div style={{marginBottom:20}}>
            <label style={labStyle}>Jours d'entraînement</label>
            <div style={{display:'flex',gap:4,flexWrap:'wrap'}}>{JOURS.map(j=><Tag key={j.id} active={jours.includes(j.id)} onClick={()=>toggleJ(j.id)}>{j.label}</Tag>)}</div>
          </div>

          <div style={{marginBottom:14,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
            <div><h2 style={{fontFamily:G.display,fontSize:22,textTransform:'uppercase',color:G.ink}}>Principes <span style={{color:G.gold}}>de jeu</span></h2>
              <p style={{fontFamily:G.mono,fontSize:8,color:G.muted,marginTop:2}}>3 à 5 principes</p></div>
            <div style={{fontFamily:G.display,fontSize:22,color:sel.length>=3?G.gold:G.muted}}>{sel.length}<span style={{fontSize:12,color:G.muted}}>/5</span></div>
          </div>
          {Object.entries(PRINCIPES).map(([phase,list])=>(
            <div key={phase} style={{marginBottom:14}}>
              <div style={{fontFamily:G.mono,fontSize:8,letterSpacing:'.12em',textTransform:'uppercase',color:G.gold,marginBottom:5,display:'flex',alignItems:'center',gap:6}}>
                <span style={{width:10,height:1.5,background:G.gold}}/>{phase}</div>
              <div style={{display:'flex',flexDirection:'column',gap:3}}>
                {list.map(p=><PrincipeCard key={p.id} p={p} sel={sel.includes(p.id)} onToggle={()=>toggle(p.id)}/>)}
              </div>
            </div>
          ))}
          <div style={{position:'sticky',bottom:0,background:G.bg,borderTop:`1px solid ${G.rule}`,padding:'10px 0',marginTop:12}}>
            <button onClick={()=>setStep(1)} disabled={!ok} style={{width:'100%',padding:'12px',background:ok?G.gold:G.rule,border:'none',fontFamily:G.display,fontSize:14,textTransform:'uppercase',color:ok?'#0f0f0d':G.muted,cursor:ok?'pointer':'not-allowed'}}>Générer ma programmation →</button>
          </div>
        </div>}

        {/* ═══ STEP 2 ═══ */}
        {step===1&&<div style={{animation:'fadeIn .3s ease'}}>
          <div style={{background:G.dark,padding:'12px 14px',marginBottom:18,borderLeft:`3px solid ${G.gold}`}}>
            <div style={{fontFamily:G.mono,fontSize:7,letterSpacing:'.12em',textTransform:'uppercase',color:G.gold,marginBottom:6}}>Votre identité</div>
            <div style={{display:'flex',gap:4,flexWrap:'wrap',marginBottom:5}}>
              {[formation,categorie,`${nbJoueurs} joueurs`,`${joursLabels} · ${horaire}`,dateReprise?`Reprise ${new Date(dateReprise).toLocaleDateString('fr-FR',{day:'numeric',month:'long'})}`:null].filter(Boolean).map((t,i)=>(
                <span key={i} style={{fontFamily:G.mono,fontSize:8,padding:'2px 6px',background:i===0?G.gold+'20':'rgba(255,255,255,0.06)',border:`1px solid ${i===0?G.gold+'40':'rgba(255,255,255,0.1)'}`,color:i===0?G.gold:'rgba(245,242,235,0.55)'}}>{t}</span>
              ))}
            </div>
            <div style={{display:'flex',gap:3,flexWrap:'wrap'}}>
              {selLabels.map(l=><span key={l} style={{fontFamily:G.mono,fontSize:7,padding:'2px 5px',background:'rgba(245,242,235,0.06)',color:'rgba(245,242,235,0.45)'}}>{l}</span>)}
            </div>
          </div>
          <h2 style={{fontFamily:G.display,fontSize:22,textTransform:'uppercase',color:G.ink,marginBottom:3}}>Programmation <span style={{color:G.gold}}>annuelle</span></h2>
          <p style={{fontFamily:G.mono,fontSize:9,color:G.muted,marginBottom:16}}>{PROG.reduce((a,p)=>a+p.wk,0)} semaines · calée depuis votre reprise</p>
          {PROG.map((p,i)=><PeriodCard key={i} p={p} startDate={periodDates[i]}/>)}
          <div style={{display:'flex',gap:8,marginTop:18}}>
            <button onClick={()=>setStep(0)} style={{flex:1,padding:'11px',background:'transparent',border:`1px solid ${G.rule}`,fontFamily:G.mono,fontSize:9,textTransform:'uppercase',color:G.muted,cursor:'pointer'}}>← Modifier</button>
            <button onClick={()=>setStep(2)} style={{flex:2,padding:'11px',background:G.gold,border:'none',fontFamily:G.display,fontSize:13,textTransform:'uppercase',color:'#0f0f0d',cursor:'pointer'}}>Voir les séances →</button>
          </div>
        </div>}

        {/* ═══ STEP 3 ═══ */}
        {step===2&&<div style={{animation:'fadeIn .3s ease'}}>
          <div style={{background:G.goldBg,border:`1px solid ${G.goldBdr}`,padding:'10px 14px',marginBottom:18,display:'flex',alignItems:'center',gap:8}}>
            <span style={{fontSize:15}}>💡</span>
            <p style={{fontFamily:G.mono,fontSize:9,color:G.ink2,lineHeight:1.5}}>Semaine type — cliquez <strong>"▶ Terrain"</strong> sur chaque exercice pour voir le schéma. Effectifs adaptés à vos <strong>{nbJoueurs} joueurs</strong>.</p>
          </div>

          {seances.map((s,si)=>(
            <div key={si} style={{marginBottom:28}}>
              <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:6}}>
                <div style={{width:3,height:20,background:G.gold}}/>
                <div>
                  <div style={{fontFamily:G.mono,fontSize:8,letterSpacing:'.12em',textTransform:'uppercase',color:G.gold}}>{JOURS.find(j=>j.id===jours[si])?.label||'—'} · {horaire} · 1h30</div>
                  <h3 style={{fontFamily:G.display,fontSize:20,textTransform:'uppercase',color:G.ink,margin:0}}>{s.theme}</h3>
                </div>
              </div>
              <p style={{fontFamily:G.mono,fontSize:9,color:G.muted,marginBottom:10,paddingLeft:13}}>{s.objectif_seance}</p>
              {s.blocs.map((b,bi)=><BlocCard key={bi} bloc={b} index={bi}/>)}
            </div>
          ))}

          <div style={{background:G.dark,padding:'18px 16px',marginTop:20,borderLeft:`3px solid ${G.gold}`,display:'flex',gap:12,alignItems:'center',flexWrap:'wrap'}}>
            <div style={{flex:1,minWidth:160}}>
              <div style={{fontFamily:G.mono,fontSize:7,letterSpacing:'.14em',textTransform:'uppercase',color:G.gold,marginBottom:4}}>Bientôt</div>
              <h3 style={{fontFamily:G.display,fontSize:17,textTransform:'uppercase',color:'#f5f2eb',marginBottom:4}}>Analyse vidéo <span style={{color:G.gold}}>→</span> Séances</h3>
              <p style={{fontFamily:G.mono,fontSize:8,color:'rgba(245,242,235,0.35)',lineHeight:1.6}}>Après chaque match analysé, l'IA ajustera vos séances selon les axes de progression identifiés.</p>
            </div>
          </div>

          <div style={{display:'flex',gap:8,marginTop:18}}>
            <button onClick={()=>setStep(1)} style={{flex:1,padding:'11px',background:'transparent',border:`1px solid ${G.rule}`,fontFamily:G.mono,fontSize:9,textTransform:'uppercase',color:G.muted,cursor:'pointer'}}>← Programmation</button>
            <button onClick={()=>{setStep(0);setSel([])}} style={{flex:2,padding:'11px',background:G.gold,border:'none',fontFamily:G.display,fontSize:13,textTransform:'uppercase',color:'#0f0f0d',cursor:'pointer'}}>Recommencer</button>
          </div>
        </div>}
      </div>
    </DashboardLayout>
  )
}
