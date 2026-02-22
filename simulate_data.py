"""
Script de simulation : joueurs U14 JS Cugnaux + matchs avec stats
"""
import os
import uuid
from datetime import datetime, timedelta
from sqlalchemy import create_engine, text
from dotenv import load_dotenv
import random

load_dotenv()
DATABASE_URL = os.environ.get("DATABASE_URL")
engine = create_engine(DATABASE_URL)

# ─── Joueurs U14 JS Cugnaux ──────────────────────────────────────────────────
PLAYERS = [
    {"name": "Carvalho Tiago",      "number": 1,  "position": "Gardien",    "foot": "Droit",  "birth_year": 2012},
    {"name": "Despres Rafael",      "number": 2,  "position": "Défenseur",  "foot": "Gauche", "birth_year": 2012},
    {"name": "Garrouchdi Wissam",   "number": 3,  "position": "Défenseur",  "foot": "Gauche", "birth_year": 2012},
    {"name": "Dahbani Mohamed",     "number": 4,  "position": "Défenseur",  "foot": "Droit",  "birth_year": 2012},
    {"name": "Ghali Hamza",         "number": 5,  "position": "Défenseur",  "foot": "Droit",  "birth_year": 2012},
    {"name": "Crivemale Tao",       "number": 6,  "position": "Défenseur",  "foot": "Droit",  "birth_year": 2012},
    {"name": "Semamra Matys",       "number": 7,  "position": "Défenseur",  "foot": "Droit",  "birth_year": 2012},
    {"name": "Ouakki Amin",         "number": 8,  "position": "Milieu",     "foot": "Droit",  "birth_year": 2012},
    {"name": "Boutdarine Imran",    "number": 9,  "position": "Milieu",     "foot": "Droit",  "birth_year": 2012},
    {"name": "Sidali Bilal",        "number": 10, "position": "Milieu",     "foot": "Droit",  "birth_year": 2012},
    {"name": "Manni Amrany Yassin", "number": 11, "position": "Milieu",     "foot": "Droit",  "birth_year": 2012},
    {"name": "El Korri Nassim",     "number": 12, "position": "Milieu",     "foot": "Droit",  "birth_year": 2012},
    {"name": "Bargou Adem",         "number": 13, "position": "Milieu",     "foot": "Droit",  "birth_year": 2012},
    {"name": "Tailhan Noa",         "number": 14, "position": "Milieu",     "foot": "Droit",  "birth_year": 2012},
    {"name": "Touré Cheick",        "number": 15, "position": "Attaquant",  "foot": "Droit",  "birth_year": 2012},
    {"name": "Lievi Joyce",         "number": 16, "position": "Attaquant",  "foot": "Droit",  "birth_year": 2012},
    {"name": "Bouzelif Kelym",      "number": 17, "position": "Attaquant",  "foot": "Droit",  "birth_year": 2012},
    {"name": "Golet Nabil",         "number": 18, "position": "Attaquant",  "foot": "Droit",  "birth_year": 2012},
    {"name": "Boughazi Salaheddine","number": 19, "position": "Attaquant",  "foot": "Droit",  "birth_year": 2012},
]

# ─── Matchs simulés ──────────────────────────────────────────────────────────
MATCHES = [
    {"opponent": "FC Muret U14",        "date_offset": -90, "score_home": 3, "score_away": 1, "competition": "Championnat District", "location": "Stade de Cugnaux"},
    {"opponent": "Toulouse FC U14",     "date_offset": -75, "score_home": 1, "score_away": 2, "competition": "Championnat District", "location": "Stade Antoine Béguère"},
    {"opponent": "US Colomiers U14",    "date_offset": -60, "score_home": 4, "score_away": 0, "competition": "Championnat District", "location": "Stade de Cugnaux"},
    {"opponent": "SC Tournefeuille U14","date_offset": -45, "score_home": 2, "score_away": 2, "competition": "Championnat District", "location": "Stade Pierre Baudis"},
    {"opponent": "AS Plaisance U14",    "date_offset": -30, "score_home": 5, "score_away": 1, "competition": "Coupe du District",    "location": "Stade de Cugnaux"},
    {"opponent": "FC Portet U14",       "date_offset": -15, "score_home": 2, "score_away": 3, "competition": "Championnat District", "location": "Stade Jean Pégot"},
    {"opponent": "AS Seysses U14",      "date_offset": -7,  "score_home": 3, "score_away": 0, "competition": "Championnat District", "location": "Stade de Cugnaux"},
]

with engine.connect() as conn:
    # Récupérer l'utilisateur Ryad
    result = conn.execute(text("SELECT id, club_id FROM users WHERE email = 'ryad.bouharaoua@gmail.com'"))
    user = result.fetchone()
    if not user:
        print("❌ Utilisateur ryad.bouharaoua@gmail.com introuvable")
        exit()
    
    user_id = user[0]
    club_id = user[1]
    print(f"✅ Utilisateur trouvé : {user_id}")

    # Créer le club si pas encore fait
    if not club_id:
        club_id = str(uuid.uuid4())
        conn.execute(text("""
            INSERT INTO clubs (id, name, quota_matches) VALUES (:id, :name, 50)
            ON CONFLICT DO NOTHING
        """), {"id": club_id, "name": "JS Cugnaux"})
        conn.execute(text("UPDATE users SET club_id = :club_id WHERE id = :user_id"),
                     {"club_id": club_id, "user_id": user_id})
        print(f"✅ Club JS Cugnaux créé")

    # Supprimer les anciens joueurs du club si besoin
    conn.execute(text("DELETE FROM players WHERE club_id = :club_id"), {"club_id": club_id})
    print("🗑️  Anciens joueurs supprimés")

    # Insérer les joueurs
    player_ids = []
    for p in PLAYERS:
        pid = str(uuid.uuid4())
        player_ids.append({"id": pid, "name": p["name"], "number": p["number"], "position": p["position"]})
        conn.execute(text("""
            INSERT INTO players (id, club_id, name, number, position, category, status, created_at)
            VALUES (:id, :club_id, :name, :number, :position, 'U14', 'actif', NOW())
        """), {
            "id": pid,
            "club_id": club_id,
            "name": p["name"],
            "number": p["number"],
            "position": p["position"],
        })
    print(f"✅ {len(PLAYERS)} joueurs créés")

    # Supprimer anciens matchs
    conn.execute(text("DELETE FROM matches WHERE club_id = :club_id"), {"club_id": club_id})
    print("🗑️  Anciens matchs supprimés")

    # Insérer les matchs avec stats simulées
    for m in MATCHES:
        match_id = str(uuid.uuid4())
        match_date = datetime.now() + timedelta(days=m["date_offset"])
        
        # Stats simulées réalistes
        possession = random.randint(48, 68)
        passes = random.randint(120, 280)
        shots = m["score_home"] * 3 + random.randint(2, 8)
        shots_on_target = m["score_home"] + random.randint(1, 4)
        
        conn.execute(text("""
            INSERT INTO matches (
                id, club_id, opponent, date, competition, location, category,
                score_home, score_away, status,
                stats, created_at
            ) VALUES (
                :id, :club_id, :opponent, :date, :competition, :location, :category,
                :score_home, :score_away, 'completed',
                :stats, NOW()
            )
        """), {
            "id": match_id,
            "club_id": club_id,
            "opponent": m["opponent"],
            "date": match_date,
            "competition": m["competition"],
            "location": m["location"],
            "category": "U14",
            "score_home": m["score_home"],
            "score_away": m["score_away"],
            "stats": f'{{"possession": {possession}, "passes": {passes}, "shots": {shots}, "shots_on_target": {shots_on_target}}}',
        })
    
    conn.commit()
    print(f"✅ {len(MATCHES)} matchs créés avec stats")
    print("\n🎉 Simulation terminée !")
    print(f"   → {len(PLAYERS)} joueurs U14 JS Cugnaux")
    print(f"   → {len(MATCHES)} matchs avec résultats et statistiques")
    print(f"   → Connectez-vous avec ryad.bouharaoua@gmail.com pour voir les données")
