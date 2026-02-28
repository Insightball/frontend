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

export default function CGV() {
  return (
    <div style={S.page}>
      <div style={S.container}>
        <a href="/" style={S.back}>← Retour à l'accueil</a>
        <h1 style={S.title}>Conditions Générales de Vente</h1>
        <p style={S.updated}>Dernière mise à jour : 1er mars 2026</p>

        <h2 style={S.h2}>1. Objet</h2>
        <p style={S.p}>
          Les présentes Conditions Générales de Vente (CGV) régissent la souscription et l'utilisation du service Insightball, plateforme d'analyse vidéo football par IA, éditée par Ryad Bouharaoua, Entreprise Individuelle (EI), SIRET : 820 100 402 00040.
        </p>
        <p style={S.p}>
          Toute inscription au service implique l'acceptation sans réserve des présentes CGV.
        </p>

        <h2 style={S.h2}>2. Description du service</h2>
        <p style={S.p}>
          Insightball propose un service en ligne d'analyse vidéo de matchs de football. L'utilisateur uploade une vidéo de match et reçoit un rapport tactique comprenant :
        </p>
        <ul style={S.ul}>
          <li>Heatmaps individuelles et collectives</li>
          <li>Statistiques individuelles et collectives</li>
          <li>Export PDF du rapport</li>
          <li>Gestion d'effectif</li>
        </ul>

        <h2 style={S.h2}>3. Plans et tarifs</h2>
        <p style={S.p}>
          <strong>Plan Coach — 39€ TTC/mois</strong><br />
          4 matchs analysés par cycle de facturation. Sans engagement, résiliation à tout moment.
        </p>
        <p style={S.p}>
          <strong>Plan Club — À partir de 99€ TTC/mois</strong><br />
          Offre sur mesure. Nombre de matchs et fonctionnalités définis sur devis. Tarif confirmé par email avant activation.
        </p>
        <p style={S.p}>
          Les prix sont indiqués en euros TTC. TVA non applicable, article 293 B du CGI.
        </p>

        <h2 style={S.h2}>4. Essai gratuit</h2>
        <p style={S.p}>
          Le plan Coach inclut un essai gratuit de 7 jours avec 1 match analysé offert. L'essai nécessite l'enregistrement d'une carte bancaire via Stripe. Aucun prélèvement n'est effectué pendant la période d'essai. À l'issue des 7 jours, l'abonnement au plan Coach (39€/mois) est automatiquement activé, sauf annulation par l'utilisateur avant la fin de la période d'essai.
        </p>
        <p style={S.p}>
          L'essai gratuit est limité à une fois par utilisateur. L'essai n'est pas disponible pour le plan Club.
        </p>

        <h2 style={S.h2}>5. Paiement</h2>
        <p style={S.p}>
          Les paiements sont traités par Stripe. Insightball ne stocke aucune donnée de carte bancaire. Le paiement est prélevé automatiquement chaque mois à la date anniversaire de la souscription. En cas d'échec de paiement, l'accès au service est suspendu jusqu'à régularisation.
        </p>

        <h2 style={S.h2}>6. Droit de rétractation</h2>
        <p style={S.p}>
          Conformément à l'article L221-28 du Code de la consommation, le droit de rétractation ne s'applique pas aux services pleinement exécutés avant la fin du délai de rétractation avec l'accord du consommateur. En souscrivant à Insightball et en utilisant le service (upload de vidéo, génération de rapport), vous acceptez expressément que le service soit exécuté avant l'expiration du délai de rétractation de 14 jours et reconnaissez perdre votre droit de rétractation.
        </p>
        <p style={S.p}>
          L'essai gratuit de 7 jours permet de tester le service sans engagement financier.
        </p>

        <h2 style={S.h2}>7. Résiliation</h2>
        <p style={S.p}>
          L'utilisateur peut résilier son abonnement à tout moment depuis les paramètres de son compte ou via le portail Stripe. La résiliation prend effet à la fin de la période de facturation en cours. L'accès au service reste actif jusqu'à cette date. Aucun remboursement prorata n'est effectué.
        </p>

        <h2 style={S.h2}>8. Quotas et limites</h2>
        <p style={S.p}>
          Chaque plan inclut un nombre défini de matchs analysables par cycle de facturation (Coach : 4, Club : selon devis). Les matchs non utilisés ne sont pas reportés au cycle suivant. Le compteur est réinitialisé à chaque nouveau cycle de facturation.
        </p>

        <h2 style={S.h2}>9. Responsabilité</h2>
        <p style={S.p}>
          Insightball s'engage à mettre en œuvre les moyens nécessaires pour assurer la disponibilité et le bon fonctionnement du service. Toutefois, Insightball ne garantit pas une disponibilité ininterrompue et ne saurait être tenu responsable en cas d'indisponibilité temporaire du service, de perte de données liée à un cas de force majeure, ou d'une utilisation du service non conforme aux présentes CGV.
        </p>
        <p style={S.p}>
          Les rapports d'analyse sont générés par intelligence artificielle et fournis à titre indicatif. Ils ne constituent pas un avis professionnel et ne sauraient engager la responsabilité d'Insightball.
        </p>

        <h2 style={S.h2}>10. Propriété intellectuelle</h2>
        <p style={S.p}>
          L'utilisateur conserve la propriété de ses vidéos et de ses données. Insightball conserve la propriété de la plateforme, des algorithmes et de la présentation des rapports. L'utilisateur accorde à Insightball une licence limitée d'utilisation de ses vidéos uniquement pour le traitement et la génération des rapports d'analyse.
        </p>

        <h2 style={S.h2}>11. Données personnelles</h2>
        <p style={S.p}>
          Le traitement des données personnelles est décrit dans notre Politique de confidentialité, accessible à l'adresse insightball.com/confidentialite.
        </p>

        <h2 style={S.h2}>12. Modification des CGV</h2>
        <p style={S.p}>
          Insightball se réserve le droit de modifier les présentes CGV. Les utilisateurs seront informés par email de toute modification substantielle au moins 30 jours avant leur entrée en vigueur. La poursuite de l'utilisation du service après cette date vaut acceptation des nouvelles CGV.
        </p>

        <h2 style={S.h2}>13. Droit applicable et litiges</h2>
        <p style={S.p}>
          Les présentes CGV sont soumises au droit français. En cas de litige, les parties s'engagent à rechercher une solution amiable. À défaut, les tribunaux de Toulouse seront seuls compétents. Conformément à l'article L612-1 du Code de la consommation, le consommateur peut recourir gratuitement à un médiateur de la consommation.
        </p>

        <h2 style={S.h2}>14. Contact</h2>
        <p style={S.p}>
          Pour toute question relative aux présentes CGV :<br />
          Ryad Bouharaoua — contact@insightball.com
        </p>
      </div>
    </div>
  );
}
