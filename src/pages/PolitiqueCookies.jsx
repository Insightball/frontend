import React from 'react';
import { T } from '../theme';

const S = {
  page: {
    backgroundColor: T.bg,
    minHeight: '100vh',
    padding: '60px 20px 80px',
  },
  container: {
    maxWidth: 720,
    margin: '0 auto',
  },
  title: {
    fontFamily: "'Anton', sans-serif",
    fontSize: 32,
    color: T.ink,
    marginBottom: 8,
    letterSpacing: '0.02em',
    textTransform: 'uppercase',
  },
  updated: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 12,
    color: T.muted,
    marginBottom: 40,
  },
  h2: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 16,
    fontWeight: 700,
    color: T.ink,
    marginTop: 36,
    marginBottom: 12,
  },
  p: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 14,
    lineHeight: 1.7,
    color: T.ink,
    marginBottom: 12,
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    marginBottom: 20,
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 13,
  },
  th: {
    textAlign: 'left',
    padding: '10px 12px',
    borderBottom: `2px solid ${T.ink}`,
    color: T.ink,
    fontWeight: 700,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  td: {
    padding: '10px 12px',
    borderBottom: `1px solid ${T.rule}`,
    color: T.ink,
    lineHeight: 1.5,
  },
  back: {
    display: 'inline-block',
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 13,
    color: T.gold,
    textDecoration: 'none',
    marginBottom: 32,
  },
};

export default function PolitiqueCookies() {
  return (
    <div style={S.page}>
      <div style={S.container}>
        <a href="/" style={S.back}>← Retour à l'accueil</a>
        <h1 style={S.title}>Politique de cookies</h1>
        <p style={S.updated}>Dernière mise à jour : 1er mars 2026</p>

        <h2 style={S.h2}>1. Qu'est-ce qu'un cookie ?</h2>
        <p style={S.p}>
          Un cookie est un petit fichier texte déposé sur votre navigateur lors de la visite d'un site web. Il permet de stocker des informations relatives à votre navigation.
        </p>

        <h2 style={S.h2}>2. Cookies utilisés par Insightball</h2>
        <p style={S.p}>
          Insightball utilise <strong>uniquement des cookies strictement nécessaires</strong> au fonctionnement du service. Nous n'utilisons aucun cookie publicitaire, aucun cookie de tracking, et aucun outil d'analytics tiers.
        </p>

        <table style={S.table}>
          <thead>
            <tr>
              <th style={S.th}>Cookie</th>
              <th style={S.th}>Finalité</th>
              <th style={S.th}>Durée</th>
              <th style={S.th}>Type</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={S.td}>token / auth</td>
              <td style={S.td}>Authentification et maintien de la session utilisateur</td>
              <td style={S.td}>Session / 24h</td>
              <td style={S.td}>Strictement nécessaire</td>
            </tr>
            <tr>
              <td style={S.td}>stripe.js</td>
              <td style={S.td}>Sécurisation des paiements (déposé par Stripe)</td>
              <td style={S.td}>Session</td>
              <td style={S.td}>Strictement nécessaire</td>
            </tr>
          </tbody>
        </table>

        <h2 style={S.h2}>3. Consentement</h2>
        <p style={S.p}>
          Conformément aux recommandations de la CNIL, les cookies strictement nécessaires au fonctionnement du service ne requièrent pas de consentement préalable. Insightball n'utilisant que ce type de cookies, aucun bandeau de consentement n'est requis.
        </p>
        <p style={S.p}>
          Si nous devions à l'avenir utiliser des cookies non essentiels (analytics, marketing), nous mettrons en place un mécanisme de consentement conforme à la réglementation.
        </p>

        <h2 style={S.h2}>4. Gérer vos cookies</h2>
        <p style={S.p}>
          Vous pouvez à tout moment configurer votre navigateur pour refuser les cookies. Attention : la désactivation des cookies strictement nécessaires peut empêcher le fonctionnement normal du service (connexion, paiement).
        </p>

        <h2 style={S.h2}>5. Contact</h2>
        <p style={S.p}>
          Pour toute question relative aux cookies :<br />
          Ryad Bouharaoua — contact@insightball.com
        </p>
      </div>
    </div>
  );
}
