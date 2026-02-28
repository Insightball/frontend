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
  ul: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 14,
    lineHeight: 1.7,
    color: T.ink,
    marginBottom: 12,
    paddingLeft: 24,
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

export default function PolitiqueConfidentialite() {
  return (
    <div style={S.page}>
      <div style={S.container}>
        <a href="/" style={S.back}>← Retour à l'accueil</a>
        <h1 style={S.title}>Politique de confidentialité</h1>
        <p style={S.updated}>Dernière mise à jour : 1er mars 2026</p>

        <p style={S.p}>
          Insightball, édité par Ryad Bouharaoua (SIRET : 820 100 402 00040), s'engage à protéger la vie privée de ses utilisateurs. Cette politique décrit les données que nous collectons, pourquoi nous les collectons, et comment nous les protégeons.
        </p>

        <h2 style={S.h2}>1. Données collectées</h2>
        <p style={S.p}>Nous collectons les données suivantes :</p>
        <ul style={S.ul}>
          <li><strong>Données de compte :</strong> nom, prénom, adresse email, mot de passe (hashé), numéro de téléphone (optionnel), ville (optionnel), diplôme sportif (optionnel).</li>
          <li><strong>Données d'abonnement :</strong> identifiant client Stripe, plan souscrit, dates de facturation. Aucune donnée de carte bancaire n'est stockée sur nos serveurs — Stripe gère 100% du flux de paiement.</li>
          <li><strong>Données d'utilisation :</strong> vidéos de matchs uploadées, rapports d'analyse générés, effectif joueurs saisi.</li>
          <li><strong>Données techniques :</strong> adresse IP, type de navigateur, pour le bon fonctionnement et la sécurité du service.</li>
        </ul>

        <h2 style={S.h2}>2. Finalités du traitement</h2>
        <p style={S.p}>Vos données sont utilisées pour :</p>
        <ul style={S.ul}>
          <li>Fournir et améliorer le service Insightball</li>
          <li>Gérer votre compte et votre abonnement</li>
          <li>Traiter vos vidéos et générer les rapports d'analyse</li>
          <li>Vous envoyer des emails liés à votre compte (confirmation, fin d'essai, factures)</li>
          <li>Assurer la sécurité et prévenir les abus</li>
        </ul>
        <p style={S.p}>
          Nous ne vendons jamais vos données personnelles à des tiers. Nous n'utilisons pas vos données à des fins publicitaires.
        </p>

        <h2 style={S.h2}>3. Base légale du traitement</h2>
        <ul style={S.ul}>
          <li><strong>Exécution du contrat :</strong> traitement nécessaire à la fourniture du service (article 6.1.b du RGPD)</li>
          <li><strong>Intérêt légitime :</strong> sécurité du service, prévention des abus (article 6.1.f du RGPD)</li>
          <li><strong>Obligation légale :</strong> conservation des données de facturation (article 6.1.c du RGPD)</li>
        </ul>

        <h2 style={S.h2}>4. Durée de conservation</h2>
        <ul style={S.ul}>
          <li><strong>Données de compte :</strong> conservées tant que le compte est actif, puis 30 jours après suppression (soft delete avec possibilité de récupération)</li>
          <li><strong>Données de facturation :</strong> conservées 10 ans (obligation légale française)</li>
          <li><strong>Vidéos uploadées :</strong> conservées tant que le compte est actif, supprimées après clôture du compte</li>
        </ul>

        <h2 style={S.h2}>5. Sous-traitants et transferts de données</h2>
        <p style={S.p}>Nous utilisons les sous-traitants suivants :</p>
        <ul style={S.ul}>
          <li><strong>Stripe</strong> (États-Unis) — traitement des paiements. Certifié PCI DSS niveau 1.</li>
          <li><strong>Render</strong> (États-Unis) — hébergement API et base de données.</li>
          <li><strong>OVH</strong> (France) — hébergement du site web.</li>
          <li><strong>Resend</strong> (États-Unis) — envoi d'emails transactionnels.</li>
        </ul>
        <p style={S.p}>
          Les transferts de données vers les États-Unis sont encadrés par les clauses contractuelles types (SCC) de la Commission européenne et/ou le EU-US Data Privacy Framework lorsque applicable.
        </p>

        <h2 style={S.h2}>6. Vos droits (RGPD)</h2>
        <p style={S.p}>Conformément au RGPD, vous disposez des droits suivants :</p>
        <ul style={S.ul}>
          <li><strong>Droit d'accès :</strong> obtenir une copie de vos données personnelles</li>
          <li><strong>Droit de rectification :</strong> corriger des données inexactes</li>
          <li><strong>Droit de suppression :</strong> demander la suppression de votre compte et de vos données</li>
          <li><strong>Droit à la portabilité :</strong> recevoir vos données dans un format structuré</li>
          <li><strong>Droit d'opposition :</strong> vous opposer au traitement de vos données</li>
          <li><strong>Droit de limitation :</strong> demander la limitation du traitement</li>
        </ul>
        <p style={S.p}>
          Pour exercer ces droits, contactez-nous à <strong>contact@insightball.com</strong>. Nous répondrons dans un délai de 30 jours. Vous avez également le droit d'introduire une réclamation auprès de la CNIL (www.cnil.fr).
        </p>

        <h2 style={S.h2}>7. Sécurité</h2>
        <p style={S.p}>
          Nous mettons en œuvre des mesures de sécurité adaptées pour protéger vos données : chiffrement HTTPS, mots de passe hashés, authentification par token JWT, vérification des droits d'accès sur chaque requête. Aucune donnée de carte bancaire ne transite par nos serveurs.
        </p>

        <h2 style={S.h2}>8. Contact</h2>
        <p style={S.p}>
          Pour toute question relative à cette politique de confidentialité :<br />
          Ryad Bouharaoua — contact@insightball.com
        </p>
      </div>
    </div>
  );
}
