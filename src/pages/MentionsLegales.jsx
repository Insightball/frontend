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
  back: {
    display: 'inline-block',
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 13,
    color: T.gold,
    textDecoration: 'none',
    marginBottom: 32,
  },
};

export default function MentionsLegales() {
  return (
    <div style={S.page}>
      <div style={S.container}>
        <a href="/" style={S.back}>← Retour à l'accueil</a>
        <h1 style={S.title}>Mentions légales</h1>
        <p style={S.updated}>Dernière mise à jour : 1er mars 2026</p>

        <h2 style={S.h2}>1. Éditeur du site</h2>
        <p style={S.p}>
          Le site insightball.com est édité par Ryad Bouharaoua, Entreprise Individuelle (EI).<br />
          SIRET : 820 100 402 00040<br />
          Siège : Toulouse, France<br />
          Email : contact@insightball.com
        </p>

        <h2 style={S.h2}>2. Directeur de la publication</h2>
        <p style={S.p}>Ryad Bouharaoua — contact@insightball.com</p>

        <h2 style={S.h2}>3. Hébergement</h2>
        <p style={S.p}>
          <strong>Site web (frontend) :</strong><br />
          OVH SAS — 2 rue Kellermann, 59100 Roubaix, France<br />
          Téléphone : 1007<br />
          Site : www.ovh.com
        </p>
        <p style={S.p}>
          <strong>API et base de données :</strong><br />
          Render Services, Inc. — 525 Brannan Street, Suite 300, San Francisco, CA 94107, États-Unis<br />
          Site : render.com
        </p>

        <h2 style={S.h2}>4. Propriété intellectuelle</h2>
        <p style={S.p}>
          L'ensemble du contenu du site insightball.com (textes, images, graphismes, logo, icônes, logiciels) est la propriété exclusive de Ryad Bouharaoua ou fait l'objet d'une autorisation d'utilisation. Toute reproduction, représentation, modification, publication ou adaptation de tout ou partie des éléments du site est interdite sans autorisation écrite préalable.
        </p>

        <h2 style={S.h2}>5. Données personnelles</h2>
        <p style={S.p}>
          Les données personnelles collectées sur ce site sont traitées conformément à notre Politique de confidentialité. Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez d'un droit d'accès, de rectification, de suppression et de portabilité de vos données. Pour exercer ces droits, contactez-nous à contact@insightball.com.
        </p>

        <h2 style={S.h2}>6. Cookies</h2>
        <p style={S.p}>
          Ce site utilise uniquement des cookies strictement nécessaires au fonctionnement du service (authentification, session utilisateur). Aucun cookie publicitaire ou de tracking n'est utilisé. Consultez notre Politique de cookies pour plus de détails.
        </p>

        <h2 style={S.h2}>7. Limitation de responsabilité</h2>
        <p style={S.p}>
          Insightball s'efforce d'assurer l'exactitude et la mise à jour des informations diffusées sur le site. Toutefois, Insightball ne peut garantir l'exactitude, la précision ou l'exhaustivité des informations mises à disposition. Insightball décline toute responsabilité pour toute imprécision, inexactitude ou omission portant sur des informations disponibles sur le site.
        </p>

        <h2 style={S.h2}>8. Droit applicable</h2>
        <p style={S.p}>
          Les présentes mentions légales sont soumises au droit français. En cas de litige, les tribunaux de Toulouse seront seuls compétents.
        </p>
      </div>
    </div>
  );
}
