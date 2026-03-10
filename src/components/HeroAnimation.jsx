import { useEffect, useRef, useState, useCallback } from "react"

const GOLD  = '#c9a227'
const INK   = '#1a1916'
const MUTED = '#6b6960'
const GREEN = '#1a7a4a'
const RED   = '#dc2626'

const W = 560, H = 360, PAD = 24
const FW = W - PAD * 2, FH = H - PAD * 2
const px = x => PAD + x * FW
const py = y => PAD + y * FH

// ── FORMATION 4-3-3 équipe A (attaque vers la droite) ──────────────────────
// Positions de base — seront animées dynamiquement selon la phase de jeu
const BASE_A = [
  { id:1,  x:0.78, y:0.50, team:'A', role:'ATT_C'  }, // Avant-centre
  { id:2,  x:0.72, y:0.18, team:'A', role:'ATT_G'  }, // Ailier gauche
  { id:3,  x:0.72, y:0.82, team:'A', role:'ATT_D'  }, // Ailier droit
  { id:4,  x:0.60, y:0.50, team:'A', role:'MIL_AX' }, // Milieu axial
  { id:5,  x:0.58, y:0.22, team:'A', role:'MIL_G'  }, // Milieu gauche
  { id:6,  x:0.58, y:0.78, team:'A', role:'MIL_D'  }, // Milieu droit
  { id:7,  x:0.35, y:0.15, team:'A', role:'LAT_G'  }, // Latéral gauche
  { id:8,  x:0.35, y:0.38, team:'A', role:'DC_G'   }, // DC gauche
  { id:9,  x:0.35, y:0.62, team:'A', role:'DC_D'   }, // DC droit
  { id:10, x:0.35, y:0.85, team:'A', role:'LAT_D'  }, // Latéral droit
  { id:11, x:0.08, y:0.50, team:'A', role:'GK'     }, // Gardien
]

// ── FORMATION 4-4-2 équipe B (attaque vers la gauche) ──────────────────────
const BASE_B = [
  { id:12, x:0.22, y:0.38, team:'B', role:'ATT_G'  },
  { id:13, x:0.22, y:0.62, team:'B', role:'ATT_D'  },
  { id:14, x:0.38, y:0.18, team:'B', role:'MIL_G'  },
  { id:15, x:0.42, y:0.40, team:'B', role:'MIL_CG' },
  { id:16, x:0.42, y:0.60, team:'B', role:'MIL_CD' },
  { id:17, x:0.38, y:0.82, team:'B', role:'MIL_D'  },
  { id:18, x:0.58, y:0.15, team:'B', role:'LAT_G'  },
  { id:19, x:0.58, y:0.38, team:'B', role:'DC_G'   },
  { id:20, x:0.58, y:0.62, team:'B', role:'DC_D'   },
  { id:21, x:0.58, y:0.85, team:'B', role:'LAT_D'  },
  { id:22, x:0.92, y:0.50, team:'B', role:'GK'     },
]
const ALL_BASE = [...BASE_A, ...BASE_B]

// ── SÉQUENCE DE JEU RÉALISTE ────────────────────────────────────────────────
// Chaque étape : qui a le ballon + déplacements des autres joueurs sans ballon
// x/y = position cible pendant cette phase (null = reste en place)
const PLAY_SEQ = [
  // ── ACTE 1 : Construction depuis GK ──
  {
    ball: 11, dur: 45, label: 'Relance GK',
    moves: {
      8:  { x:0.28, y:0.38 }, // DC gauche descend pour recevoir
      9:  { x:0.28, y:0.62 }, // DC droit s'écarte
      7:  { x:0.30, y:0.12 }, // Latéral gauche monte un peu
      10: { x:0.30, y:0.88 }, // Latéral droit monte un peu
      4:  { x:0.52, y:0.50 }, // Milieu axial descend en soutien
    }
  },
  {
    ball: 8, dur: 38, label: 'DC gauche relance',
    moves: {
      5:  { x:0.48, y:0.22 }, // Milieu gauche offre solution
      7:  { x:0.38, y:0.10 }, // Latéral gauche monte en couloir
      4:  { x:0.50, y:0.45 }, // Milieu axial se démarque
    }
  },
  {
    ball: 5, dur: 35, label: 'Milieu gauche',
    moves: {
      7:  { x:0.52, y:0.08 }, // Latéral gauche overlap — dédoublement !
      2:  { x:0.68, y:0.15 }, // Ailier gauche rentre dans l'axe (appel intérieur)
      4:  { x:0.55, y:0.42 }, // Milieu axial avance
      1:  { x:0.72, y:0.45 }, // Avant-centre se déplace côté gauche
    }
  },
  // ── ACTE 2 : Dédoublement côté gauche ──
  {
    ball: 7, dur: 40, label: 'Latéral gauche overlap',
    moves: {
      2:  { x:0.65, y:0.30 }, // Ailier gauche crée l'espace en rentrant
      5:  { x:0.60, y:0.28 }, // Milieu gauche suit en soutien
      1:  { x:0.75, y:0.42 }, // Avant-centre se prépare au centre
      3:  { x:0.70, y:0.72 }, // Ailier droit reste écarte le bloc
      6:  { x:0.62, y:0.65 }, // Milieu droit monte côté droit
    }
  },
  {
    ball: 2, dur: 35, label: 'Ailier gauche reçoit',
    moves: {
      7:  { x:0.65, y:0.10 }, // Latéral gauche pousse encore
      1:  { x:0.78, y:0.48 }, // Avant-centre dans la surface
      4:  { x:0.62, y:0.50 }, // Milieu axial monte
      6:  { x:0.65, y:0.70 }, // Milieu droit au second poteau
    }
  },
  // ── ACTE 3 : Centre dans la surface ──
  {
    ball: 1, dur: 42, label: 'Centre — avant-centre',
    moves: {
      3:  { x:0.80, y:0.78 }, // Ailier droit au second poteau
      6:  { x:0.72, y:0.68 }, // Milieu droit entrée de surface
      4:  { x:0.65, y:0.50 }, // Milieu axial repli partiel
      7:  { x:0.55, y:0.12 }, // Latéral gauche repli préventif
    }
  },
  // ── ACTE 4 : Récupération adverse, contre ──
  {
    ball: 19, dur: 38, label: 'DC adverse récupère',
    moves: {
      // Équipe A se replie en bloc
      1:  { x:0.65, y:0.50 },
      2:  { x:0.55, y:0.22 },
      3:  { x:0.55, y:0.78 },
      4:  { x:0.50, y:0.50 },
      5:  { x:0.48, y:0.25 },
      6:  { x:0.48, y:0.75 },
    }
  },
  {
    ball: 15, dur: 35, label: 'Milieu adverse relance',
    moves: {
      12: { x:0.35, y:0.35 }, // Attaquant adverse appel profondeur
      13: { x:0.35, y:0.65 },
      14: { x:0.45, y:0.15 }, // Milieu gauche adverse monte
    }
  },
  {
    ball: 12, dur: 40, label: 'Attaquant adverse',
    moves: {
      13: { x:0.28, y:0.60 }, // Deuxième attaquant décale
      14: { x:0.40, y:0.12 }, // Ailier adverse en profondeur
      // Défense A compacte
      8:  { x:0.30, y:0.40 },
      9:  { x:0.30, y:0.55 },
      7:  { x:0.28, y:0.18 },
      10: { x:0.28, y:0.82 },
    }
  },
  // ── ACTE 5 : Récupération A, transition offensive ──
  {
    ball: 9, dur: 35, label: 'DC droit récupère',
    moves: {
      4:  { x:0.45, y:0.50 }, // Milieu axial pivot pour transition
      1:  { x:0.60, y:0.50 }, // Avant-centre repart
      2:  { x:0.62, y:0.20 }, // Ailiers remontent
      3:  { x:0.62, y:0.80 },
    }
  },
  {
    ball: 4, dur: 32, label: 'Transition offensive',
    moves: {
      1:  { x:0.72, y:0.50 },
      6:  { x:0.60, y:0.75 }, // Milieu droit repart
      10: { x:0.42, y:0.85 }, // Latéral droit monte — dédoublement droit
    }
  },
  // ── ACTE 6 : Dédoublement côté droit ──
  {
    ball: 6, dur: 38, label: 'Milieu droit',
    moves: {
      10: { x:0.58, y:0.88 }, // Latéral droit overlap droit
      3:  { x:0.68, y:0.72 }, // Ailier droit rentre dans l'axe
      1:  { x:0.75, y:0.55 }, // Avant-centre côté droit
      5:  { x:0.55, y:0.28 }, // Milieu gauche équilibre
    }
  },
  {
    ball: 10, dur: 40, label: 'Latéral droit overlap',
    moves: {
      3:  { x:0.72, y:0.65 }, // Ailier droit surface
      1:  { x:0.78, y:0.50 }, // Avant-centre axe
      2:  { x:0.70, y:0.20 }, // Ailier gauche second poteau
      6:  { x:0.65, y:0.80 }, // Milieu droit suit
    }
  },
]

const HM = [
  { x:0.72, y:0.50, r:0.12, i:0.9 },
  { x:0.65, y:0.22, r:0.09, i:0.7 },
  { x:0.65, y:0.78, r:0.09, i:0.65 },
  { x:0.55, y:0.50, r:0.10, i:0.85 },
  { x:0.35, y:0.28, r:0.08, i:0.5 },
  { x:0.35, y:0.72, r:0.08, i:0.5 },
  { x:0.20, y:0.50, r:0.10, i:0.32 },
  { x:0.80, y:0.48, r:0.08, i:0.68 },
  { x:0.58, y:0.42, r:0.07, i:0.45 },
]

const STATS = [
  { label:'Possession',     value:'63%', trend:'+8%',  trendUp:true,  spark:[45,48,52,50,55,58,61,63] },
  { label:'Passes réussies',value:'78%', trend:'+5%',  trendUp:true,  spark:[68,70,72,69,73,75,76,78] },
  { label:'Tirs cadrés',    value:'6/9', trend:null,   trendUp:null,  spark:[3,5,4,6,5,7,5,6] },
  { label:'Ballons perdus', value:'11',  trend:'-4',   trendUp:false, spark:[18,16,15,17,14,13,12,11] },
]

const PHASES = ['raw','tracking','heatmap','report']
const PHASE_DURATION = [7000, 3500, 3500, 4500]

// Interpolation fluide entre position de base et position cible
function getPlayerPos(base, seq, seqProg, tick) {
  const targetMoves = seq.moves || {}
  const target = targetMoves[base.id]

  let tx = target ? target.x : base.x
  let ty = target ? target.y : base.y

  // Micro-jitter pour donner vie
  const speed = base.role==='GK' ? 0.08 : base.role.startsWith('ATT') ? 0.9 : 0.55
  const amp   = base.role==='GK' ? 0.005 : 0.012
  const jx = Math.sin(tick*0.04*speed + base.id*1.3) * amp
  const jy = Math.cos(tick*0.03*speed + base.id*0.87) * amp

  // Lerp vers la cible selon progression dans la séquence
  const lerp = Math.min(1, seqProg * 2) // arrive à mi-phase
  const cx = base.x + (tx - base.x) * lerp + jx
  const cy = base.y + (ty - base.y) * lerp + jy

  return { x: Math.max(0.04, Math.min(0.96, cx)), y: Math.max(0.04, Math.min(0.96, cy)) }
}

export default function HeroAnimation() {
  const [phase, setPhase]         = useState(0)
  const [sweep, setSweep]         = useState(null)
  const [tick, setTick]           = useState(0)
  const [seqIdx, setSeqIdx]       = useState(0)
  const [seqTick, setSeqTick]     = useState(0)
  const [statVis, setStatVis]     = useState([false,false,false,false])
  const [hmOpacity, setHmOpacity] = useState(0)
  const [videoError, setVideoError] = useState(false)
  const seqIdxRef = useRef(0)
  const phaseTimer = useRef(null)
  const videoRef = useRef(null)

  // Tick global
  useEffect(() => {
    const id = setInterval(() => {
      setTick(n => n+1)
      setSeqTick(n => {
        const seq = PLAY_SEQ[seqIdxRef.current]
        if (n+1 >= seq.dur) {
          seqIdxRef.current = (seqIdxRef.current + 1) % PLAY_SEQ.length
          setSeqIdx(seqIdxRef.current)
          return 0
        }
        return n+1
      })
    }, 60)
    return () => clearInterval(id)
  }, [])

  const triggerSweep = useCallback((onDone) => {
    let prog = 0
    setSweep(0)
    const id = setInterval(() => {
      prog += 0.045
      setSweep(prog)
      if (prog >= 1.1) {
        clearInterval(id)
        setSweep(null)
        onDone()
      }
    }, 16)
  }, [])

  useEffect(() => {
    phaseTimer.current = setTimeout(() => {
      const nextPhase = (phase + 1) % PHASES.length
      triggerSweep(() => {
        setPhase(nextPhase)
        if (nextPhase === 0 && videoRef.current) {
          videoRef.current.currentTime = 0
          videoRef.current.play().catch(() => setVideoError(true))
        }
        if (nextPhase === 2) {
          setHmOpacity(0)
          setTimeout(() => setHmOpacity(1), 100)
        }
        if (nextPhase === 3) {
          setStatVis([false,false,false,false])
          setTimeout(() => setStatVis(() => [true,false,false,false]), 250)
          setTimeout(() => setStatVis(() => [true,true,false,false]), 550)
          setTimeout(() => setStatVis(() => [true,true,true,false]), 850)
          setTimeout(() => setStatVis(() => [true,true,true,true]),  1150)
        }
      })
    }, PHASE_DURATION[phase])
    return () => clearTimeout(phaseTimer.current)
  }, [phase, triggerSweep])

  const showTracking = phase >= 1
  const showHeatmap  = phase >= 2
  const showReport   = phase === 3

  const curSeq  = PLAY_SEQ[seqIdx]
  const seqProg = seqTick / curSeq.dur

  // Position ballon = position du porteur actuel
  const holderBase = ALL_BASE.find(p => p.id === curSeq.ball)
  const holderPos  = holderBase ? getPlayerPos(holderBase, curSeq, seqProg, tick) : { x:0.5, y:0.5 }

  // Prochaine position (pour interpolation ballon)
  const nextSeq     = PLAY_SEQ[(seqIdx + 1) % PLAY_SEQ.length]
  const nextHolder  = ALL_BASE.find(p => p.id === nextSeq.ball)
  const nextHPos    = nextHolder ? getPlayerPos(nextHolder, nextSeq, 0, tick) : holderPos

  // Ballon : suit le porteur, bondit vers le prochain en fin de séquence
  const ballLaunch = Math.max(0, (seqProg - 0.75) / 0.25) // 0→1 sur les 25% finaux
  const bx = holderPos.x + (nextHPos.x - holderPos.x) * ballLaunch
  const by = holderPos.y + (nextHPos.y - holderPos.y) * ballLaunch
           - Math.sin(ballLaunch * Math.PI) * 0.035
  const ballX = px(Math.max(0.03, Math.min(0.97, bx)))
  const ballY = py(Math.max(0.03, Math.min(0.97, by)))

  // Traîne ballon
  const trail = Array.from({length:5}).map((_,i) => {
    const tp = Math.max(0, ballLaunch - i*0.05)
    const tx = holderPos.x + (nextHPos.x - holderPos.x) * tp
    const ty = holderPos.y + (nextHPos.y - holderPos.y) * tp - Math.sin(tp * Math.PI) * 0.035
    return { x: px(Math.max(0.03, Math.min(0.97,tx))), y: py(Math.max(0.03, Math.min(0.97,ty))) }
  })

  return (
    <div style={{ position:'relative', width:'100%', maxWidth:600, margin:'0 auto', fontFamily:"'Barlow',sans-serif" }}>

      {/* Dots phase */}
      <div style={{ display:'flex', gap:6, justifyContent:'center', marginBottom:10 }}>
        {PHASES.map((p,i) => (
          <div key={p} style={{
            height:3, borderRadius:2,
            width: i===phase ? 28 : 14,
            background: i===phase ? GOLD : 'rgba(201,162,39,0.22)',
            transition:'all 0.4s ease',
          }}/>
        ))}
      </div>

      {/* Label */}
      <div style={{
        textAlign:'center', marginBottom:8,
        fontFamily:"'JetBrains Mono',monospace",
        fontSize:10, letterSpacing:'0.12em',
        color:GOLD, textTransform:'uppercase', minHeight:16,
      }}>
        {phase===0 && '// vidéo brute · non exploitée'}
        {phase===1 && `// tracking · ${curSeq.label}`}
        {phase===2 && '// analyse zones · heatmap générée'}
        {phase===3 && '// rapport prêt · réponses livrées'}
      </div>

      {/* Conteneur terrain */}
      <div style={{
        position:'relative', borderRadius:12, overflow:'hidden',
        border:`1px solid ${phase===0 ? 'rgba(255,255,255,0.07)' : 'rgba(201,162,39,0.28)'}`,
        transition:'border-color 0.8s, box-shadow 0.8s',
        boxShadow: phase>=2
          ? '0 0 48px rgba(201,162,39,0.14), 0 8px 36px rgba(0,0,0,0.5)'
          : '0 8px 32px rgba(0,0,0,0.45)',
      }}>

        {/* ── VIDÉO BRUTE (phase 0) ── */}
        {!videoError && (
          <video
            ref={videoRef}
            autoPlay muted loop playsInline
            onError={() => setVideoError(true)}
            style={{
              position:'absolute', inset:0,
              width:'100%', height:'100%',
              objectFit:'cover',
              opacity: phase===0 ? 0.70 : 0,
              transition:'opacity 0.8s ease',
              pointerEvents:'none',
            }}
            src="/match-raw.mp4"
          />
        )}

        <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display:'block', position:'relative', zIndex:1 }}>
          <defs>
            <linearGradient id="grs" x1="0" y1="0" x2="0.5" y2="1">
              <stop offset="0%"   stopColor={phase===0 ? 'rgba(10,9,8,0)' : '#0d2818'}/>
              <stop offset="100%" stopColor={phase===0 ? 'rgba(10,9,8,0)' : '#091d10'}/>
            </linearGradient>
            {HM.map((z,i) => (
              <radialGradient key={i} id={`hm${i}`} cx="50%" cy="50%" r="50%">
                <stop offset="0%"   stopColor="#ff3333" stopOpacity={z.i*0.75}/>
                <stop offset="35%"  stopColor="#ff8800" stopOpacity={z.i*0.45}/>
                <stop offset="65%"  stopColor={GOLD}    stopOpacity={z.i*0.22}/>
                <stop offset="100%" stopColor={GOLD}    stopOpacity="0"/>
              </radialGradient>
            ))}
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2.5" result="blur"/>
              <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            <filter id="ballGlow" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation="3" result="blur"/>
              <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            <linearGradient id="sweepGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%"   stopColor="rgba(201,162,39,0)"/>
              <stop offset="45%"  stopColor="rgba(201,162,39,0.06)"/>
              <stop offset="50%"  stopColor="rgba(201,162,39,0.65)"/>
              <stop offset="55%"  stopColor="rgba(201,162,39,0.06)"/>
              <stop offset="100%" stopColor="rgba(201,162,39,0)"/>
            </linearGradient>
            <clipPath id="fieldClip">
              <rect x={PAD} y={PAD} width={FW} height={FH}/>
            </clipPath>
          </defs>

          {/* Fond — transparent sur raw pour laisser passer la vidéo */}
          <rect width={W} height={H}
            fill={phase===0 ? 'rgba(0,0,0,0.0)' : 'url(#grs)'}
            style={{transition:'fill 0.8s'}}
          />

          {/* Bandes herbe */}
          {phase>0 && Array.from({length:8}).map((_,i) => (
            <rect key={i}
              x={PAD+i*FW/8} y={PAD} width={FW/8} height={FH}
              fill={i%2===0 ? 'rgba(255,255,255,0.022)' : 'transparent'}
            />
          ))}

          {/* Lignes terrain */}
          <g stroke={phase===0 ? 'rgba(255,255,255,0.0)' : 'rgba(255,255,255,0.38)'}
             strokeWidth="1.2" fill="none" style={{transition:'stroke 1s ease'}}>
            <rect x={PAD} y={PAD} width={FW} height={FH} rx="2"/>
            <line x1={W/2} y1={PAD} x2={W/2} y2={PAD+FH}/>
            <circle cx={W/2} cy={H/2} r={FH*0.18}/>
            <circle cx={W/2} cy={H/2} r={3}
              fill="rgba(255,255,255,0.55)" stroke="none"/>
            <rect x={PAD}            y={H/2-FH*0.27} width={FW*0.16} height={FH*0.54}/>
            <rect x={PAD}            y={H/2-FH*0.14} width={FW*0.06} height={FH*0.28}/>
            <rect x={PAD+FW-FW*0.16} y={H/2-FH*0.27} width={FW*0.16} height={FH*0.54}/>
            <rect x={PAD+FW-FW*0.06} y={H/2-FH*0.14} width={FW*0.06} height={FH*0.28}/>
            <path d={`M${PAD+FW*0.16} ${H/2-FH*0.1} A${FH*0.15} ${FH*0.15} 0 0 1 ${PAD+FW*0.16} ${H/2+FH*0.1}`}/>
            <path d={`M${PAD+FW-FW*0.16} ${H/2-FH*0.1} A${FH*0.15} ${FH*0.15} 0 0 0 ${PAD+FW-FW*0.16} ${H/2+FH*0.1}`}/>
            <path d={`M${PAD} ${PAD+8} A8 8 0 0 1 ${PAD+8} ${PAD}`}/>
            <path d={`M${PAD+FW-8} ${PAD} A8 8 0 0 1 ${PAD+FW} ${PAD+8}`}/>
            <path d={`M${PAD+FW} ${PAD+FH-8} A8 8 0 0 0 ${PAD+FW-8} ${PAD+FH}`}/>
            <path d={`M${PAD+8} ${PAD+FH} A8 8 0 0 1 ${PAD} ${PAD+FH-8}`}/>
            <rect x={PAD-8}  y={H/2-FH*0.08} width={8} height={FH*0.16}/>
            <rect x={PAD+FW} y={H/2-FH*0.08} width={8} height={FH*0.16}/>
          </g>

          {/* Heatmap */}
          <g clipPath="url(#fieldClip)" style={{opacity:hmOpacity, transition:'opacity 1s ease'}}>
            {showHeatmap && HM.map((z,i) => (
              <ellipse key={i}
                cx={px(z.x)} cy={py(z.y)}
                rx={z.r*FW} ry={z.r*FH*0.82}
                fill={`url(#hm${i})`}
              />
            ))}
          </g>

          {/* Traîne ballon */}
          {!showReport && phase>0 && trail.map((pt,i) => (
            <circle key={i} cx={pt.x} cy={pt.y} r={3.5 - i*0.45}
              fill={GOLD} opacity={(5-i)/5 * 0.2}/>
          ))}

          {/* Joueurs */}
          {ALL_BASE.map(p => {
            const pos = getPlayerPos(p, curSeq, seqProg, tick)
            const cx  = px(pos.x)
            const cy  = py(pos.y)
            const isA = p.team==='A'
            const r   = p.role==='GK' ? 5 : 6
            const isHolder = p.id === curSeq.ball && !showReport

            return (
              <g key={p.id} filter={showTracking ? "url(#glow)" : undefined}
                 style={{ opacity: phase===0 ? 0 : 1, transition:'opacity 0.8s ease' }}>
                {showTracking && (
                  <circle cx={cx} cy={cy} r={r+7}
                    fill="none"
                    stroke={isA ? GOLD : 'rgba(255,255,255,0.45)'}
                    strokeWidth={isHolder ? 1.5 : 0.7}
                    strokeDasharray={isHolder ? "none" : "3 2"}
                    opacity={isHolder ? 0.95 : 0.5}
                  />
                )}
                <circle cx={cx} cy={cy} r={r}
                  fill={isA ? GOLD : 'rgba(255,255,255,0.78)'}
                  stroke={isA ? '#a8861f' : 'rgba(255,255,255,0.25)'}
                  strokeWidth="1"
                />
                {showTracking && (
                  <text x={cx} y={cy+0.5}
                    textAnchor="middle" dominantBaseline="middle"
                    fontSize="4.5" fontFamily="'Barlow',sans-serif" fontWeight="800"
                    fill={INK} style={{userSelect:'none', pointerEvents:'none'}}>
                    {p.id<=11 ? p.id : p.id-11}
                  </text>
                )}
              </g>
            )
          })}

          {/* Ballon */}
          {!showReport && phase>0 && (
            <g filter="url(#ballGlow)">
              <circle cx={ballX} cy={ballY} r={4.5}
                fill="#ffffff"
                stroke="rgba(201,162,39,0.55)" strokeWidth="1"
              />
              <line x1={ballX-2} y1={ballY} x2={ballX+2} y2={ballY}
                stroke="rgba(0,0,0,0.3)" strokeWidth="0.6"/>
              <line x1={ballX} y1={ballY-2} x2={ballX} y2={ballY+2}
                stroke="rgba(0,0,0,0.3)" strokeWidth="0.6"/>
            </g>
          )}

          {/* ── OVERLAY RAW ── */}
          {phase===0 && (
            <g>
              {/* Overlay sombre léger pour lisibilité du texte */}
              <rect width={W} height={H} fill="rgba(0,0,0,0.38)"/>
              {/* Scanlines */}
              {Array.from({length:Math.floor(H/5)}).map((_,i) => (
                <line key={i} x1={0} y1={i*5} x2={W} y2={i*5}
                  stroke="rgba(0,0,0,0.12)" strokeWidth="1"/>
              ))}
              <text x={W/2} y={H/2-14} textAnchor="middle"
                fontSize="12" fontFamily="'JetBrains Mono',monospace"
                fill="rgba(255,255,255,0.55)" letterSpacing="4">
                VIDÉO EN COURS D'ANALYSE
              </text>
              <text x={W/2} y={H/2+8} textAnchor="middle"
                fontSize="9" fontFamily="'JetBrains Mono',monospace"
                fill="rgba(255,255,255,0.3)" letterSpacing="2">
                extraction des données en cours…
              </text>
              {/* Timecode */}
              <text x={PAD+8} y={PAD+FH-8}
                fontSize="8" fontFamily="'JetBrains Mono',monospace"
                fill="rgba(255,255,255,0.4)" letterSpacing="1">
                {`00:${String(Math.floor(tick/30)%60).padStart(2,'0')}:${String((tick%30)*2).padStart(2,'0')}`}
              </text>
              {/* REC */}
              <circle cx={PAD+FW-20} cy={PAD+14} r={4}
                fill="#dc2626" opacity={tick%30<15 ? 0.95 : 0.15}/>
              <text x={PAD+FW-12} y={PAD+18}
                fontSize="7" fontFamily="'JetBrains Mono',monospace"
                fill="rgba(255,255,255,0.5)" letterSpacing="1">REC</text>
            </g>
          )}

          {/* ── OVERLAY RAPPORT ── */}
          {showReport && (
            <g>
              <rect width={W} height={H} fill="rgba(10,9,8,0.78)"/>
              <rect x={W/2-170} y={H/2-95} width={340} height={190}
                rx="8" fill="#0f0e0c"
                stroke="rgba(201,162,39,0.35)" strokeWidth="1"/>
              <rect x={W/2-170} y={H/2-95} width={340} height={3}
                rx="2" fill={GOLD}/>
              <rect x={W/2-170} y={H/2-92} width={340} height={24}
                fill="rgba(201,162,39,0.1)"/>
              <text x={W/2-154} y={H/2-74}
                fontSize="7.5" fontFamily="'JetBrains Mono',monospace"
                fill={GOLD} letterSpacing="3">
                RAPPORT DE MATCH
              </text>
              <circle cx={W/2+140} cy={H/2-80} r={3} fill={GREEN}/>
              <text x={W/2+146} y={H/2-77}
                fontSize="6.5" fontFamily="'JetBrains Mono',monospace"
                fill={GREEN} letterSpacing="1">LIVE</text>

              {STATS.map((s,i) => {
                const col = i%2, row = Math.floor(i/2)
                const sx  = W/2-154 + col*170
                const sy  = H/2-58  + row*56
                const spW = 46, spH = 18
                const min = Math.min(...s.spark), max = Math.max(...s.spark), range = max-min||1
                const pts = s.spark.map((v,j) => {
                  const fx = sx+96 + (j/(s.spark.length-1))*spW
                  const fy = sy+36 - ((v-min)/range)*spH
                  return `${fx.toFixed(1)},${fy.toFixed(1)}`
                }).join(' ')
                const lx = sx+96+spW
                const ly = sy+36 - ((s.spark[s.spark.length-1]-min)/range)*spH
                const sc = s.trendUp===false ? RED : GOLD

                return (
                  <g key={s.label} style={{ opacity:statVis[i]?1:0, transition:'opacity 0.4s ease' }}>
                    <rect x={sx-2} y={sy-4} width={158} height={50}
                      rx="5" fill="rgba(255,255,255,0.035)"
                      stroke="rgba(201,162,39,0.12)" strokeWidth="0.5"/>
                    <text x={sx+6} y={sy+16}
                      fontSize="20" fontFamily="'Barlow Condensed',sans-serif"
                      fontWeight="800" fill={GOLD}>{s.value}</text>
                    {s.trend && (
                      <text x={sx+6} y={sy+28}
                        fontSize="7.5" fontFamily="'JetBrains Mono',monospace"
                        fill={s.trendUp ? GREEN : RED}>{s.trend}</text>
                    )}
                    <text x={sx+6} y={sy+39}
                      fontSize="7" fontFamily="'Barlow',sans-serif"
                      fill="rgba(255,255,255,0.38)" letterSpacing="0.3">{s.label}</text>
                    <polyline points={pts} fill="none" stroke={sc}
                      strokeWidth="1.3" opacity="0.75"/>
                    <circle cx={lx} cy={ly} r={2.2} fill={sc} opacity="0.9"/>
                  </g>
                )
              })}

              <rect x={W/2-56} y={H/2+76} width={112} height={17} rx="8" fill={GOLD}/>
              <text x={W/2} y={H/2+87.5}
                textAnchor="middle" fontSize="7.5"
                fontFamily="'Barlow',sans-serif" fontWeight="700"
                fill={INK} letterSpacing="1.5">EXPORT PDF →</text>
            </g>
          )}

          {/* Sweep */}
          {sweep !== null && (
            <rect x={(sweep-0.08)*W} y={0} width={W*0.16} height={H}
              fill="url(#sweepGrad)" style={{pointerEvents:'none'}}/>
          )}
        </svg>

        {/* Vignette */}
        <div style={{
          position:'absolute', inset:0, borderRadius:12,
          background:'radial-gradient(ellipse at center, transparent 50%, rgba(10,9,8,0.6) 100%)',
          pointerEvents:'none', zIndex:2,
        }}/>
      </div>

      {/* Légende */}
      <div style={{
        display:'flex', justifyContent:'center', gap:18,
        marginTop:10, minHeight:20,
        opacity: showReport ? 0 : phase===0 ? 0 : 1,
        transition:'opacity 0.4s',
      }}>
        <div style={{display:'flex', alignItems:'center', gap:5}}>
          <div style={{width:8, height:8, borderRadius:'50%', background:GOLD}}/>
          <span style={{fontSize:9.5, color:MUTED, fontFamily:"'JetBrains Mono',monospace"}}>Ton équipe</span>
        </div>
        <div style={{display:'flex', alignItems:'center', gap:5}}>
          <div style={{width:8, height:8, borderRadius:'50%', background:'rgba(255,255,255,0.72)'}}/>
          <span style={{fontSize:9.5, color:MUTED, fontFamily:"'JetBrains Mono',monospace"}}>Adversaire</span>
        </div>
        {showTracking && (
          <div style={{display:'flex', alignItems:'center', gap:5}}>
            <div style={{width:8, height:8, borderRadius:'50%', background:'#fff'}}/>
            <span style={{fontSize:9.5, color:MUTED, fontFamily:"'JetBrains Mono',monospace"}}>Ballon</span>
          </div>
        )}
        {showHeatmap && !showReport && (
          <div style={{display:'flex', alignItems:'center', gap:5}}>
            <div style={{width:8, height:8, borderRadius:'50%',
              background:'linear-gradient(135deg,#ff3333,#c9a227)'}}/>
            <span style={{fontSize:9.5, color:MUTED, fontFamily:"'JetBrains Mono',monospace"}}>Zones actives</span>
          </div>
        )}
      </div>
    </div>
  )
}
