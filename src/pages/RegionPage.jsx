import { useEffect } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import regionsData from "../data/regions.json";

const G = {
  white:   '#ffffff',
  off:     '#f7f7f5',
  border:  '#e8e6e1',
  ink:     '#111110',
  ink2:    '#2d2c2a',
  muted:   '#6b6960',
  gold:    '#c9a227',
  goldD:   '#a8861f',
  dark:    '#0a0908',
  mono:    "'JetBrains Mono', monospace",
  display: "'Barlow Condensed', sans-serif",
  body:    "'Barlow', sans-serif",
}

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800&family=Barlow:ital,wght@0,400;0,500;1,400&family=JetBrains+Mono:wght@400;600&display=swap');`

function setMeta(title, description) {
  document.title = title;
  let desc = document.querySelector('meta[name="description"]');
  if (desc) desc.setAttribute("content", description);
  let ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) ogTitle.setAttribute("content", title);
  let ogDesc = document.querySelector('meta[property="og:description"]');
  if (ogDesc) ogDesc.setAttribute("content", description);
}

const FEATURES = [
  {
    icon: "📱",
    title: "Filmez avec votre téléphone",
    desc: "Pas de caméra pro, pas de setup. Vous filmez le match comme vous le faites déjà. C'est suffisant.",
  },
  {
    icon: "🗺️",
    title: "Heatmaps joueurs",
    desc: "Visualisez les zones de jeu de chaque joueur. Identifiez les déséquilibres et ajustez votre animation.",
  },
  {
    icon: "📊",
    title: "Statistiques match",
    desc: "Possession, passes, duels, distance parcourue. Des stats concrètes pour baser vos retours sur des faits.",
  },
  {
    icon: "📄",
    title: "Rapport PDF export",
    desc: "Un rapport tactique complet en PDF à partager avec vos joueurs, votre staff ou votre président de club.",
  },
];

export default function RegionPage() {
  const { slug } = useParams();
  const region = regionsData.find((r) => r.slug === slug);

  useEffect(() => {
    if (region) {
      setMeta(region.metaTitle, region.metaDescription);
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.id = "region-jsonld";
      script.text = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name: "Insightball",
        applicationCategory: "SportsApplication",
        operatingSystem: "Web",
        description: region.metaDescription,
        offers: {
          "@type": "Offer",
          price: "39",
          priceCurrency: "EUR",
          description: "Plan Coach — 4 matchs/mois — Essai 7 jours gratuit",
        },
        areaServed: {
          "@type": "AdministrativeArea",
          name: region.name,
        },
      });
      const existing = document.getElementById("region-jsonld");
      if (existing) existing.remove();
      document.head.appendChild(script);
    }
    return () => {
      const s = document.getElementById("region-jsonld");
      if (s) s.remove();
    };
  }, [region]);

  if (!region) return <Navigate to="/" replace />;

  const hasDistricts = region.districts && region.districts.length > 0;

  return (
    <div style={{ background: G.white, color: G.ink, fontFamily: G.body, fontSize: 16, lineHeight: 1.6, overflowX: 'hidden' }}>
      <style>{FONTS}</style>

      {/* ══ NAV ══ */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
        background: G.dark,
        height: 60,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 40px',
        boxSizing: 'border-box',
      }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <img src="/logo.svg" alt="Insightball" style={{ height: 36, width: 'auto', display: 'block', mixBlendMode: 'screen' }} />
          <span style={{ fontFamily: G.display, fontSize: 18, fontWeight: 800, letterSpacing: '.04em', textTransform: 'uppercase', color: G.white }}>
            INSIGHT<span style={{ color: G.gold }}>ball</span>
          </span>
        </Link>
        <a
          href="/#waitlist"
          style={{
            padding: '9px 20px', background: G.gold, color: G.white,
            fontFamily: G.display, fontSize: 14, fontWeight: 700,
            letterSpacing: '.05em', textTransform: 'uppercase',
            borderRadius: 4, textDecoration: 'none',
            display: 'inline-flex', alignItems: 'center',
          }}
          onMouseEnter={e => e.currentTarget.style.background = G.goldD}
          onMouseLeave={e => e.currentTarget.style.background = G.gold}
        >
          Essai gratuit 7 jours
        </a>
      </nav>

      {/* ══ HERO ══ */}
      <section style={{
        background: G.dark,
        paddingTop: 120, paddingBottom: 72,
        paddingLeft: 40, paddingRight: 40,
        textAlign: 'center',
      }}>
        <p style={{
          fontFamily: G.mono, fontSize: 11, letterSpacing: '.18em',
          textTransform: 'uppercase', color: G.gold, marginBottom: 20, opacity: 0.85,
        }}>
          Football amateur · {region.ligue}
        </p>

        <h1 style={{
          fontFamily: G.display, fontSize: 'clamp(32px, 6vw, 58px)',
          fontWeight: 800, letterSpacing: '.02em', textTransform: 'uppercase',
          color: G.white, lineHeight: 1.1, maxWidth: 800, margin: '0 auto 24px',
        }}>
          L'analyse de match accessible à tous les staffs{' '}
          <span style={{ color: G.gold }}>en {region.name}</span>
        </h1>

        <p style={{
          fontFamily: G.body, color: 'rgba(255,255,255,0.65)',
          fontSize: 18, maxWidth: 580, margin: '0 auto 44px', lineHeight: 1.65,
        }}>
          Du District au National, vous filmez le match avec votre téléphone. Insightball transforme cette vidéo en stats concrètes sur votre équipe et vos joueurs.
        </p>

        <a
          href="/#waitlist"
          style={{
            padding: '16px 36px', background: G.gold, color: G.white,
            fontFamily: G.display, fontSize: 16, fontWeight: 700,
            letterSpacing: '.06em', textTransform: 'uppercase',
            borderRadius: 4, textDecoration: 'none',
            display: 'inline-flex', alignItems: 'center',
          }}
          onMouseEnter={e => e.currentTarget.style.background = G.goldD}
          onMouseLeave={e => e.currentTarget.style.background = G.gold}
        >
          Démarrer l'essai gratuit →
        </a>

        <p style={{
          fontFamily: G.mono, fontSize: 11, color: 'rgba(255,255,255,0.3)',
          marginTop: 16, letterSpacing: '.08em',
        }}>
          7 JOURS GRATUITS · 1 MATCH OFFERT · SANS ENGAGEMENT
        </p>
      </section>

      {/* ══ BANDEAU STATS ══ */}
      <section style={{
        background: G.gold, padding: '28px 40px',
        display: 'flex', justifyContent: 'center', gap: 56, flexWrap: 'wrap',
      }}>
        {[
          { value: '40+',           label: 'Métriques analysées par match' },
          { value: '< 1h',          label: 'Rapport livré après le match' },
          { value: 'U14 → Séniors', label: 'Toutes catégories couvertes' },
          { value: '0€',            label: 'Matériel supplémentaire requis' },
        ].map((s) => (
          <div key={s.value} style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: G.display, fontSize: 28, fontWeight: 800, color: G.dark, letterSpacing: '.02em' }}>{s.value}</div>
            <div style={{ fontFamily: G.body, fontSize: 13, color: G.dark, opacity: 0.65, marginTop: 4, maxWidth: 160 }}>{s.label}</div>
          </div>
        ))}
      </section>

      {/* ══ CONTEXTE LIGUE ══ */}
      <section style={{ maxWidth: 860, margin: '0 auto', padding: '72px 40px 0' }}>
        <p style={{ fontFamily: G.mono, fontSize: 10, letterSpacing: '.18em', textTransform: 'uppercase', color: G.gold, marginBottom: 12 }}>
          {region.ligue}
        </p>
        <h2 style={{ fontFamily: G.display, fontSize: 30, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.02em', marginBottom: 16, color: G.ink }}>
          Le football en {region.name}
        </h2>
        <p style={{ fontFamily: G.body, fontSize: 16, color: G.muted, marginBottom: 36, maxWidth: 600, lineHeight: 1.65 }}>
          {region.description}
        </p>

        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 16,
        }}>
          {[
            { label: 'Clubs affiliés FFF', value: region.clubs.toLocaleString('fr-FR') },
            { label: 'Licenciés',          value: region.licencies.toLocaleString('fr-FR') },
            { label: 'Du District au National', value: 'Tous\u00a0niveaux' },
          ].map((item) => (
            <div key={item.label} style={{
              background: G.off, borderRadius: 4, padding: '20px 24px', border: `1px solid ${G.border}`,
            }}>
              <div style={{ fontFamily: G.display, fontSize: 30, fontWeight: 800, color: G.gold, letterSpacing: '.01em', lineHeight: 1.1 }}>{item.value}</div>
              <div style={{ fontFamily: G.mono, fontSize: 10, letterSpacing: '.12em', textTransform: 'uppercase', color: G.muted, marginTop: 8 }}>{item.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ══ DISTRICTS ══ */}
      {hasDistricts && (
        <section style={{ maxWidth: 860, margin: '0 auto', padding: '72px 40px 0' }}>
          <p style={{ fontFamily: G.mono, fontSize: 10, letterSpacing: '.18em', textTransform: 'uppercase', color: G.gold, marginBottom: 12 }}>
            Organisation territoriale
          </p>
          <h2 style={{ fontFamily: G.display, fontSize: 30, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.02em', marginBottom: 16, color: G.ink }}>
            {region.districts.length} districts en {region.name}
          </h2>
          <p style={{ fontFamily: G.body, fontSize: 16, color: G.muted, marginBottom: 24, maxWidth: 600, lineHeight: 1.65 }}>
            La {region.ligue} est organisée en {region.districts.length} districts départementaux qui structurent les compétitions du niveau le plus local jusqu'au Régional.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {region.districts.map((d) => (
              <span key={d} style={{
                fontFamily: G.mono, fontSize: 11, letterSpacing: '.06em',
                padding: '8px 14px', background: G.off, border: `1px solid ${G.border}`,
                borderRadius: 4, color: G.ink2,
              }}>
                {d}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* ══ NOTE CORSE (pas de districts) ══ */}
      {!hasDistricts && region.districtNote && (
        <section style={{ maxWidth: 860, margin: '0 auto', padding: '72px 40px 0' }}>
          <p style={{ fontFamily: G.mono, fontSize: 10, letterSpacing: '.18em', textTransform: 'uppercase', color: G.gold, marginBottom: 12 }}>
            Organisation territoriale
          </p>
          <h2 style={{ fontFamily: G.display, fontSize: 30, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.02em', marginBottom: 16, color: G.ink }}>
            Une ligue, un territoire
          </h2>
          <p style={{ fontFamily: G.body, fontSize: 16, color: G.muted, maxWidth: 600, lineHeight: 1.65 }}>
            {region.districtNote}
          </p>
        </section>
      )}

      {/* ══ SPÉCIFICITÉS RÉGIONALES ══ */}
      {region.specificites && (
        <section style={{ maxWidth: 860, margin: '0 auto', padding: '56px 40px 0' }}>
          <div style={{
            background: G.off, borderRadius: 4, padding: '32px 36px',
            border: `1px solid ${G.border}`, borderLeft: `3px solid ${G.gold}`,
          }}>
            <p style={{ fontFamily: G.body, fontSize: 16, color: G.ink2, lineHeight: 1.65, margin: 0 }}>
              {region.specificites}
            </p>
          </div>
        </section>
      )}

      {/* ══ COMMENT ÇA MARCHE ══ */}
      <section style={{ maxWidth: 860, margin: '0 auto', padding: '72px 40px 0' }}>
        <p style={{ fontFamily: G.mono, fontSize: 10, letterSpacing: '.18em', textTransform: 'uppercase', color: G.gold, marginBottom: 12 }}>
          Comment ça marche
        </p>
        <h2 style={{ fontFamily: G.display, fontSize: 30, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.02em', marginBottom: 40, color: G.ink }}>
          Filmez. Uploadez. Recevez vos stats.
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 0, position: 'relative' }}>
          {[
            { num: '01', title: 'Filmez le match', desc: 'Votre téléphone suffit. MP4, MOV, tout format accepté.' },
            { num: '02', title: 'Uploadez la vidéo', desc: 'Depuis votre dashboard. Deux minutes pour contextualiser le match.' },
            { num: '03', title: 'Recevez votre analyse', desc: 'Heatmaps, stats joueurs, rapport PDF. Livré en moins d\'une heure.' },
          ].map((step, i) => (
            <div key={step.num} style={{
              padding: '32px 28px',
              borderLeft: i === 0 ? `3px solid ${G.gold}` : `1px solid ${G.border}`,
              background: i === 0 ? G.off : G.white,
            }}>
              <div style={{ fontFamily: G.mono, fontSize: 11, color: G.gold, letterSpacing: '.12em', marginBottom: 12 }}>{step.num}</div>
              <div style={{ fontFamily: G.display, fontSize: 18, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.03em', marginBottom: 8, color: G.ink }}>{step.title}</div>
              <div style={{ fontFamily: G.body, fontSize: 14, color: G.muted, lineHeight: 1.55 }}>{step.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ══ FEATURES ══ */}
      <section style={{ maxWidth: 860, margin: '0 auto', padding: '72px 40px 0' }}>
        <p style={{ fontFamily: G.mono, fontSize: 10, letterSpacing: '.18em', textTransform: 'uppercase', color: G.gold, marginBottom: 12 }}>
          Ce que vous recevez
        </p>
        <h2 style={{ fontFamily: G.display, fontSize: 30, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.02em', marginBottom: 8, color: G.ink }}>
          Après chaque match.
        </h2>
        <p style={{ fontFamily: G.body, fontSize: 16, color: G.muted, marginBottom: 36, maxWidth: 520 }}>
          Des stats sur votre équipe et vos joueurs. Sans formation, sans matériel, sans setup.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 16 }}>
          {FEATURES.map((f) => (
            <div key={f.title} style={{
              background: G.off, borderRadius: 4, padding: '24px 28px',
              border: `1px solid ${G.border}`,
              display: 'flex', gap: 18, alignItems: 'flex-start',
            }}>
              <span style={{ fontSize: 26, flexShrink: 0, marginTop: 2 }}>{f.icon}</span>
              <div>
                <div style={{ fontFamily: G.display, fontSize: 17, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.03em', marginBottom: 6, color: G.ink }}>{f.title}</div>
                <div style={{ fontFamily: G.body, fontSize: 14, color: G.muted, lineHeight: 1.55 }}>{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══ QUI SOMMES-NOUS ══ */}
      <section style={{ maxWidth: 860, margin: '72px auto 0', padding: '0 40px' }}>
        <div style={{
          background: G.dark, borderRadius: 4, padding: '48px',
          display: 'flex', gap: 40, alignItems: 'center', flexWrap: 'wrap',
        }}>
          <div style={{ flex: 1, minWidth: 260 }}>
            <p style={{ fontFamily: G.mono, fontSize: 10, letterSpacing: '.18em', textTransform: 'uppercase', color: G.gold, marginBottom: 16 }}>
              Insightball
            </p>
            <h3 style={{ fontFamily: G.display, fontSize: 26, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.02em', color: G.white, lineHeight: 1.25, marginBottom: 16 }}>
              On accompagne les acteurs du football amateur. Du District au National.
            </h3>
            <p style={{ fontFamily: G.body, fontSize: 15, color: 'rgba(255,255,255,0.55)', lineHeight: 1.65 }}>
              Insightball c'est un outil construit pour les entraîneurs, éducateurs et dirigeants du football amateur. On transforme vos vidéos de match en stats exploitables. Vous gardez le contrôle, on vous donne les arguments pour progresser.
            </p>
          </div>
          <a
            href="/#waitlist"
            style={{
              padding: '14px 28px', background: G.gold, color: G.white,
              fontFamily: G.display, fontSize: 15, fontWeight: 700,
              letterSpacing: '.05em', textTransform: 'uppercase',
              borderRadius: 4, textDecoration: 'none',
              whiteSpace: 'nowrap', flexShrink: 0,
            }}
            onMouseEnter={e => e.currentTarget.style.background = G.goldD}
            onMouseLeave={e => e.currentTarget.style.background = G.gold}
          >
            Essayer gratuitement →
          </a>
        </div>
      </section>

      {/* ══ MAILLAGE INTERNE ══ */}
      <section style={{ maxWidth: 860, margin: '0 auto', padding: '56px 40px 0' }}>
        <p style={{ fontFamily: G.mono, fontSize: 10, letterSpacing: '.18em', textTransform: 'uppercase', color: G.gold, marginBottom: 16 }}>
          Insightball partout en France
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {regionsData.filter(r => r.slug !== slug).map((r) => (
            <Link
              key={r.slug}
              to={`/football/${r.slug}`}
              style={{
                fontFamily: G.mono, fontSize: 11, letterSpacing: '.04em',
                padding: '6px 12px', background: G.off, border: `1px solid ${G.border}`,
                borderRadius: 4, color: G.muted, textDecoration: 'none',
              }}
            >
              {r.name}
            </Link>
          ))}
        </div>
      </section>

      {/* ══ CTA FINAL ══ */}
      <section style={{ textAlign: 'center', padding: '80px 40px' }}>
        <h2 style={{ fontFamily: G.display, fontSize: 36, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.02em', marginBottom: 12, color: G.ink }}>
          Votre prochain match commence ici.
        </h2>
        <p style={{ fontFamily: G.body, fontSize: 16, color: G.muted, marginBottom: 36 }}>
          7 jours gratuits. 1 match analysé offert. Sans engagement.
        </p>
        <a
          href="/#waitlist"
          style={{
            padding: '16px 40px', background: G.gold, color: G.white,
            fontFamily: G.display, fontSize: 16, fontWeight: 700,
            letterSpacing: '.06em', textTransform: 'uppercase',
            borderRadius: 4, textDecoration: 'none',
            display: 'inline-flex', alignItems: 'center',
          }}
          onMouseEnter={e => e.currentTarget.style.background = G.goldD}
          onMouseLeave={e => e.currentTarget.style.background = G.gold}
        >
          Démarrer l'essai gratuit →
        </a>
      </section>

      {/* ══ FOOTER ══ */}
      <footer style={{ background: G.dark, padding: '28px 40px', textAlign: 'center' }}>
        <p style={{ fontFamily: G.mono, fontSize: 11, color: 'rgba(255,255,255,0.28)', letterSpacing: '.06em' }}>
          © 2026 Insightball ·{' '}
          <Link to="/mentions-legales" style={{ color: 'rgba(255,255,255,0.28)', textDecoration: 'underline' }}>Mentions légales</Link>
          {' · '}
          <Link to="/confidentialite" style={{ color: 'rgba(255,255,255,0.28)', textDecoration: 'underline' }}>Confidentialité</Link>
        </p>
      </footer>
    </div>
  );
}
