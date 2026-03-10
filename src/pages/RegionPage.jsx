import { useEffect } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { T } from "../theme";
import regionsData from "../data/regions.json";

// Helper meta tags dynamiques (sans react-helmet pour éviter une dépendance)
function setMeta(title, description) {
  document.title = title;
  let desc = document.querySelector('meta[name="description"]');
  if (desc) desc.setAttribute("content", description);
  let ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) ogTitle.setAttribute("content", title);
  let ogDesc = document.querySelector('meta[property="og:description"]');
  if (ogDesc) ogDesc.setAttribute("content", description);
}

// Stats visuelles statiques — valeur perçue élevée, vraies questions que se pose un coach
const STATS = [
  { value: "30 min", label: "Après le match, votre analyse est prête" },
  { value: "100%", label: "Clubs amateurs — pas besoin de caméra pro" },
  { value: "4×", label: "Plus vite qu'une analyse vidéo manuelle" },
];

const FEATURES = [
  {
    icon: "🗺️",
    title: "Heatmaps joueurs",
    desc: "Visualisez les zones de jeu de chaque joueur sur le terrain. Identifiez les déséquilibres et ajustez votre animation.",
  },
  {
    icon: "📊",
    title: "Statistiques match",
    desc: "Possession, passes, duels, xG, intensité. Des données concrètes pour baser vos retours sur des faits, pas des impressions.",
  },
  {
    icon: "📄",
    title: "Rapport PDF export",
    desc: "Un rapport tactique complet en PDF à partager avec vos joueurs, votre staff ou votre président de club.",
  },
  {
    icon: "📅",
    title: "Projet de jeu",
    desc: "Calendrier de séances, thèmes d'entraînement, programmation annuelle. Du match à la prochaine séance en un clic.",
  },
];

export default function RegionPage() {
  const { slug } = useParams();
  const region = regionsData.find((r) => r.slug === slug);

  useEffect(() => {
    if (region) {
      setMeta(region.metaTitle, region.metaDescription);
      // JSON-LD structuré pour cette page
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

  if (!region) return <Navigate to="/404" replace />;

  return (
    <div
      style={{
        backgroundColor: T.bg,
        minHeight: "100vh",
        fontFamily: "'Inter', sans-serif",
        color: T.ink,
      }}
    >
      {/* NAV */}
      <nav
        style={{
          backgroundColor: T.dark,
          padding: "16px 32px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Link to="/" style={{ textDecoration: "none" }}>
          <span
            style={{
              color: T.gold,
              fontWeight: 800,
              fontSize: "20px",
              letterSpacing: "0.5px",
            }}
          >
            Insightball
          </span>
        </Link>
        <Link
          to="/signup"
          style={{
            backgroundColor: T.gold,
            color: T.dark,
            padding: "10px 20px",
            borderRadius: "8px",
            fontWeight: 700,
            fontSize: "14px",
            textDecoration: "none",
          }}
        >
          Essai gratuit 7 jours
        </Link>
      </nav>

      {/* HERO */}
      <section
        style={{
          backgroundColor: T.dark,
          padding: "80px 32px 64px",
          textAlign: "center",
        }}
      >
        {/* Breadcrumb */}
        <p style={{ color: T.gold, fontSize: "13px", marginBottom: "16px", opacity: 0.8 }}>
          Football amateur · {region.ligue}
        </p>

        <h1
          style={{
            color: "#ffffff",
            fontSize: "clamp(28px, 5vw, 48px)",
            fontWeight: 800,
            lineHeight: 1.15,
            maxWidth: "760px",
            margin: "0 auto 20px",
          }}
        >
          L'analyse vidéo football amateur{" "}
          <span style={{ color: T.gold }}>en {region.name}</span>
        </h1>

        <p
          style={{
            color: "rgba(255,255,255,0.7)",
            fontSize: "18px",
            maxWidth: "580px",
            margin: "0 auto 40px",
            lineHeight: 1.6,
          }}
        >
          {region.description}
        </p>

        <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
          <Link
            to="/signup"
            style={{
              backgroundColor: T.gold,
              color: T.dark,
              padding: "14px 32px",
              borderRadius: "10px",
              fontWeight: 700,
              fontSize: "16px",
              textDecoration: "none",
            }}
          >
            Démarrer l'essai gratuit
          </Link>
          <Link
            to="/login"
            style={{
              backgroundColor: "transparent",
              color: "#ffffff",
              padding: "14px 32px",
              borderRadius: "10px",
              fontWeight: 600,
              fontSize: "16px",
              textDecoration: "none",
              border: "1px solid rgba(255,255,255,0.2)",
            }}
          >
            Se connecter
          </Link>
        </div>
      </section>

      {/* STATS BANDEAU */}
      <section
        style={{
          backgroundColor: T.gold,
          padding: "32px",
          display: "flex",
          justifyContent: "center",
          gap: "48px",
          flexWrap: "wrap",
        }}
      >
        {STATS.map((s) => (
          <div key={s.value} style={{ textAlign: "center" }}>
            <div style={{ fontSize: "32px", fontWeight: 800, color: T.dark }}>{s.value}</div>
            <div style={{ fontSize: "13px", color: T.dark, opacity: 0.75, marginTop: "4px", maxWidth: "160px" }}>
              {s.label}
            </div>
          </div>
        ))}
      </section>

      {/* CONTEXTE LIGUE */}
      <section style={{ maxWidth: "840px", margin: "0 auto", padding: "64px 32px 0" }}>
        <h2
          style={{
            fontSize: "24px",
            fontWeight: 700,
            marginBottom: "24px",
            color: T.ink,
          }}
        >
          Le football en {region.name} en chiffres
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "16px",
            marginBottom: "40px",
          }}
        >
          {[
            { label: "Clubs affiliés FFF", value: region.clubs.toLocaleString("fr-FR") },
            { label: "Licenciés", value: region.licencies.toLocaleString("fr-FR") },
            { label: "Divisions actives", value: region.divisions.length },
          ].map((item) => (
            <div
              key={item.label}
              style={{
                backgroundColor: "#ffffff",
                borderRadius: "12px",
                padding: "24px",
                boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                border: `1px solid rgba(201,162,39,0.15)`,
              }}
            >
              <div style={{ fontSize: "28px", fontWeight: 800, color: T.gold }}>{item.value}</div>
              <div style={{ fontSize: "13px", color: T.ink, opacity: 0.65, marginTop: "4px" }}>{item.label}</div>
            </div>
          ))}
        </div>

        <div
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "12px",
            padding: "24px",
            border: `1px solid rgba(201,162,39,0.15)`,
          }}
        >
          <p style={{ fontSize: "14px", fontWeight: 600, color: T.ink, marginBottom: "12px" }}>
            Divisions concernées par {region.ligue} :
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {region.divisions.map((d) => (
              <span
                key={d}
                style={{
                  backgroundColor: T.bg,
                  border: `1px solid rgba(201,162,39,0.3)`,
                  borderRadius: "6px",
                  padding: "6px 12px",
                  fontSize: "13px",
                  color: T.ink,
                  fontWeight: 500,
                }}
              >
                {d}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ maxWidth: "840px", margin: "0 auto", padding: "64px 32px 0" }}>
        <h2 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "8px" }}>
          Ce qu'Insightball apporte à votre club
        </h2>
        <p style={{ color: T.ink, opacity: 0.6, marginBottom: "32px", fontSize: "15px" }}>
          Pas de remplacement de l'analyste vidéo — un assistant data qui libère votre temps et structure vos retours.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "16px" }}>
          {FEATURES.map((f) => (
            <div
              key={f.title}
              style={{
                backgroundColor: "#ffffff",
                borderRadius: "12px",
                padding: "24px",
                boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                border: "1px solid rgba(0,0,0,0.06)",
                display: "flex",
                gap: "16px",
                alignItems: "flex-start",
              }}
            >
              <span style={{ fontSize: "28px", flexShrink: 0 }}>{f.icon}</span>
              <div>
                <div style={{ fontWeight: 700, marginBottom: "6px", fontSize: "15px" }}>{f.title}</div>
                <div style={{ fontSize: "14px", color: T.ink, opacity: 0.65, lineHeight: 1.5 }}>{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* POSITIONNEMENT */}
      <section
        style={{
          maxWidth: "840px",
          margin: "64px auto 0",
          padding: "0 32px",
        }}
      >
        <div
          style={{
            backgroundColor: T.dark,
            borderRadius: "16px",
            padding: "40px",
            display: "flex",
            gap: "32px",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <div style={{ flex: 1, minWidth: "260px" }}>
            <p style={{ color: T.gold, fontSize: "12px", fontWeight: 700, letterSpacing: "1px", marginBottom: "12px" }}>
              NOTRE PHILOSOPHIE
            </p>
            <h3 style={{ color: "#ffffff", fontSize: "22px", fontWeight: 700, lineHeight: 1.4, marginBottom: "16px" }}>
              On accompagne les acteurs du football amateur. On ne remplace personne.
            </h3>
            <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "14px", lineHeight: 1.6 }}>
              Insightball donne aux coachs et dirigeants amateurs les mêmes données que les pros — pour que le coach 
              passe moins de temps à collecter et plus de temps à coacher. C'est votre expertise qui fait la différence, 
              on vous donne juste les arguments data pour l'appuyer.
            </p>
          </div>
          <Link
            to="/signup"
            style={{
              backgroundColor: T.gold,
              color: T.dark,
              padding: "14px 28px",
              borderRadius: "10px",
              fontWeight: 700,
              fontSize: "15px",
              textDecoration: "none",
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            Essayer gratuitement →
          </Link>
        </div>
      </section>

      {/* TARIFS */}
      <section style={{ maxWidth: "840px", margin: "0 auto", padding: "64px 32px 0" }}>
        <h2 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "8px" }}>Tarifs</h2>
        <p style={{ color: T.ink, opacity: 0.6, marginBottom: "32px", fontSize: "15px" }}>
          7 jours d'essai gratuit, sans engagement. 1 match analysé offert pour tester avec votre propre équipe.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px" }}>
          {[
            {
              plan: "Coach",
              price: "39€",
              period: "/mois",
              matches: "4 matchs / mois",
              cta: "Démarrer l'essai gratuit",
              highlight: true,
              detail: "Idéal pour un coach individuel",
            },
            {
              plan: "Club",
              price: "99€",
              period: "/mois",
              matches: "10 matchs / mois",
              cta: "Demander une démo",
              highlight: false,
              detail: "Pour 3 à 4 équipes",
            },
          ].map((p) => (
            <div
              key={p.plan}
              style={{
                backgroundColor: p.highlight ? T.dark : "#ffffff",
                borderRadius: "14px",
                padding: "28px",
                border: p.highlight ? `2px solid ${T.gold}` : "1px solid rgba(0,0,0,0.08)",
                position: "relative",
              }}
            >
              {p.highlight && (
                <span
                  style={{
                    position: "absolute",
                    top: "-12px",
                    left: "24px",
                    backgroundColor: T.gold,
                    color: T.dark,
                    fontSize: "11px",
                    fontWeight: 700,
                    padding: "4px 10px",
                    borderRadius: "4px",
                  }}
                >
                  ESSAI GRATUIT
                </span>
              )}
              <div style={{ color: p.highlight ? T.gold : T.ink, fontWeight: 700, fontSize: "15px", marginBottom: "8px" }}>
                {p.plan}
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: "4px", marginBottom: "4px" }}>
                <span style={{ fontSize: "36px", fontWeight: 800, color: p.highlight ? "#ffffff" : T.ink }}>{p.price}</span>
                <span style={{ fontSize: "14px", color: p.highlight ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.4)" }}>{p.period}</span>
              </div>
              <div style={{ fontSize: "13px", color: p.highlight ? "rgba(255,255,255,0.55)" : "rgba(0,0,0,0.5)", marginBottom: "4px" }}>
                {p.matches}
              </div>
              <div style={{ fontSize: "13px", color: p.highlight ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)", marginBottom: "24px" }}>
                {p.detail}
              </div>
              <Link
                to={p.highlight ? "/signup" : "/contact"}
                style={{
                  display: "block",
                  textAlign: "center",
                  backgroundColor: p.highlight ? T.gold : T.bg,
                  color: p.highlight ? T.dark : T.ink,
                  padding: "12px",
                  borderRadius: "8px",
                  fontWeight: 700,
                  fontSize: "14px",
                  textDecoration: "none",
                  border: p.highlight ? "none" : `1px solid rgba(0,0,0,0.1)`,
                }}
              >
                {p.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER SIMPLE */}
      <footer
        style={{
          marginTop: "80px",
          backgroundColor: T.dark,
          padding: "32px",
          textAlign: "center",
        }}
      >
        <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "13px" }}>
          © 2026 Insightball · L'assistant data des clubs amateurs ·{" "}
          <Link to="/mentions-legales" style={{ color: "rgba(255,255,255,0.35)", textDecoration: "underline" }}>
            Mentions légales
          </Link>{" "}
          ·{" "}
          <Link to="/confidentialite" style={{ color: "rgba(255,255,255,0.35)", textDecoration: "underline" }}>
            Confidentialité
          </Link>
        </p>
      </footer>
    </div>
  );
}
