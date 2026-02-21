// Formations tactiques avec positions en pourcentages (x: 0-100, y: 0-100)
// x = largeur (0 = gauche, 100 = droite)
// y = hauteur (0 = haut/attaque, 100 = bas/défense)

export const FORMATIONS = {
  '4-4-2': {
    name: '4-4-2',
    positions: [
      { id: 'GK', role: 'Gardien', x: 50, y: 95 },
      { id: 'LB', role: 'Arrière gauche', x: 20, y: 80 },
      { id: 'CB1', role: 'Défenseur central', x: 40, y: 85 },
      { id: 'CB2', role: 'Défenseur central', x: 60, y: 85 },
      { id: 'RB', role: 'Arrière droit', x: 80, y: 80 },
      { id: 'LM', role: 'Milieu gauche', x: 20, y: 55 },
      { id: 'CM1', role: 'Milieu central', x: 40, y: 60 },
      { id: 'CM2', role: 'Milieu central', x: 60, y: 60 },
      { id: 'RM', role: 'Milieu droit', x: 80, y: 55 },
      { id: 'ST1', role: 'Attaquant', x: 40, y: 25 },
      { id: 'ST2', role: 'Attaquant', x: 60, y: 25 }
    ]
  },
  '4-3-3': {
    name: '4-3-3',
    positions: [
      { id: 'GK', role: 'Gardien', x: 50, y: 95 },
      { id: 'LB', role: 'Arrière gauche', x: 20, y: 80 },
      { id: 'CB1', role: 'Défenseur central', x: 40, y: 85 },
      { id: 'CB2', role: 'Défenseur central', x: 60, y: 85 },
      { id: 'RB', role: 'Arrière droit', x: 80, y: 80 },
      { id: 'CDM', role: 'Milieu défensif', x: 50, y: 65 },
      { id: 'CM1', role: 'Milieu central', x: 35, y: 50 },
      { id: 'CM2', role: 'Milieu central', x: 65, y: 50 },
      { id: 'LW', role: 'Ailier gauche', x: 15, y: 25 },
      { id: 'ST', role: 'Avant-centre', x: 50, y: 20 },
      { id: 'RW', role: 'Ailier droit', x: 85, y: 25 }
    ]
  },
  '4-2-3-1': {
    name: '4-2-3-1',
    positions: [
      { id: 'GK', role: 'Gardien', x: 50, y: 95 },
      { id: 'LB', role: 'Arrière gauche', x: 20, y: 80 },
      { id: 'CB1', role: 'Défenseur central', x: 40, y: 85 },
      { id: 'CB2', role: 'Défenseur central', x: 60, y: 85 },
      { id: 'RB', role: 'Arrière droit', x: 80, y: 80 },
      { id: 'CDM1', role: 'Milieu défensif', x: 40, y: 65 },
      { id: 'CDM2', role: 'Milieu défensif', x: 60, y: 65 },
      { id: 'LM', role: 'Milieu gauche', x: 20, y: 45 },
      { id: 'CAM', role: 'Milieu offensif', x: 50, y: 40 },
      { id: 'RM', role: 'Milieu droit', x: 80, y: 45 },
      { id: 'ST', role: 'Avant-centre', x: 50, y: 20 }
    ]
  },
  '3-5-2': {
    name: '3-5-2',
    positions: [
      { id: 'GK', role: 'Gardien', x: 50, y: 95 },
      { id: 'CB1', role: 'Défenseur central', x: 30, y: 85 },
      { id: 'CB2', role: 'Défenseur central', x: 50, y: 85 },
      { id: 'CB3', role: 'Défenseur central', x: 70, y: 85 },
      { id: 'LWB', role: 'Piston gauche', x: 15, y: 60 },
      { id: 'CM1', role: 'Milieu central', x: 35, y: 55 },
      { id: 'CM2', role: 'Milieu central', x: 50, y: 50 },
      { id: 'CM3', role: 'Milieu central', x: 65, y: 55 },
      { id: 'RWB', role: 'Piston droit', x: 85, y: 60 },
      { id: 'ST1', role: 'Attaquant', x: 40, y: 25 },
      { id: 'ST2', role: 'Attaquant', x: 60, y: 25 }
    ]
  },
  '4-5-1': {
    name: '4-5-1',
    positions: [
      { id: 'GK', role: 'Gardien', x: 50, y: 95 },
      { id: 'LB', role: 'Arrière gauche', x: 20, y: 80 },
      { id: 'CB1', role: 'Défenseur central', x: 40, y: 85 },
      { id: 'CB2', role: 'Défenseur central', x: 60, y: 85 },
      { id: 'RB', role: 'Arrière droit', x: 80, y: 80 },
      { id: 'LM', role: 'Milieu gauche', x: 15, y: 55 },
      { id: 'CM1', role: 'Milieu central', x: 35, y: 60 },
      { id: 'CM2', role: 'Milieu central', x: 50, y: 55 },
      { id: 'CM3', role: 'Milieu central', x: 65, y: 60 },
      { id: 'RM', role: 'Milieu droit', x: 85, y: 55 },
      { id: 'ST', role: 'Avant-centre', x: 50, y: 25 }
    ]
  },
  '3-4-3': {
    name: '3-4-3',
    positions: [
      { id: 'GK', role: 'Gardien', x: 50, y: 95 },
      { id: 'CB1', role: 'Défenseur central', x: 30, y: 85 },
      { id: 'CB2', role: 'Défenseur central', x: 50, y: 85 },
      { id: 'CB3', role: 'Défenseur central', x: 70, y: 85 },
      { id: 'LM', role: 'Milieu gauche', x: 20, y: 55 },
      { id: 'CM1', role: 'Milieu central', x: 40, y: 60 },
      { id: 'CM2', role: 'Milieu central', x: 60, y: 60 },
      { id: 'RM', role: 'Milieu droit', x: 80, y: 55 },
      { id: 'LW', role: 'Ailier gauche', x: 20, y: 25 },
      { id: 'ST', role: 'Avant-centre', x: 50, y: 20 },
      { id: 'RW', role: 'Ailier droit', x: 80, y: 25 }
    ]
  }
}

export const FORMATION_LIST = Object.keys(FORMATIONS).map(key => ({
  value: key,
  label: FORMATIONS[key].name
}))
