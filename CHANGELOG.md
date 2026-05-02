# Changelog — REB GPL PV WebApp
**Date :** 25 Avril 2026  
**Projet :** Dimensionnement PV — Ligne GPL Rhourde El Baguel (SONATRACH)

---

## 1. `src/lib/solar-calc.ts` — Corrections données statiques

### Correction config TA (`SITE_DETAIL_CONFIGS`)
La configuration TA affichait `"2G × 2S × 4.5P avg"` (valeur absurde). Corrigé en valeur dynamique (voir section 4).

```ts
// AVANT
TA: {
  pvLabel: "2G × 2S × 4.5P avg",
  pvTotalModules: 18,
  pvInstalledWp: 18 * 555,
}

// APRÈS — la section PV est maintenant dynamique (SiteResultCard)
// pvLabel n'est plus utilisé pour l'affichage PV
```

### Ajout modèle MPPT `GS-MPPT-60`
```ts
export type GatechMpptModel = "GS-MPPT-60" | "GS-MPPT-80M" | "GS-MPPT-100M";

export const GATECH_MPPT_SPECS: Record<GatechMpptModel, ...> = {
  "GS-MPPT-60":   { vmaxInput: 200, imaxInput: 60,  vmaxBatt: 60, label: "Morning Star GS-MPPT-60" },
  "GS-MPPT-80M":  { vmaxInput: 200, imaxInput: 80,  vmaxBatt: 60, label: "Morning Star GS-MPPT-80M" },
  "GS-MPPT-100M": { vmaxInput: 200, imaxInput: 100, vmaxBatt: 60, label: "Morning Star GS-MPPT-100M" },
};
```

---

## 2. `SiteCableChecker.tsx` — Refonte complète du vérificateur câbles

### Logique déterministe (séquence stricte)
```
A. S_calc = (ρ × 2L × I) / (ε × U)
B. S_sugg = section commerciale >= S_calc satisfaisant Iz >= 1.25×Isc
C. ε_réelle = ρ×2L×I / (S_choisie × U)
D. Cascade S1+S2 : si ε_S1 + ε_S2 > 3% → monter S2 d'un cran
```

### Constantes physiques
```ts
const RHO = 0.02314;  // Ω·mm²/m — cuivre à 80°C
const EPS = 0.03;     // 3% chute de tension max
const IMP = 13.33;    // A — Jinko 555 Wp Tiger Neo
const ISC = 14.07;    // A
const VMP = 41.64;    // V

// Sections commerciales (mm²)
const SECS = [1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120] as const;

// Iz à 80°C — Pose B1, deux câbles adjacents sur paroi
const IZ: Record<number, number> = {
  1.5: 20, 2.5: 27, 4: 36,  6: 47,  10: 66,
  16: 88,  25: 117, 35: 146, 50: 177, 70: 226, 95: 274, 120: 318,
};
```

### Moteur de calcul
```ts
function calcS(L: number, I: number, U: number): number {
  return (RHO * 2 * L * I) / (EPS * U);
}

function calcEps(L: number, I: number, U: number, S: number): number {
  return ((RHO * 2 * L * I) / (S * U)) * 100; // en %
}

function pickSugg(sCalc: number, iSc: number): Sec {
  const izReq = 1.25 * iSc;
  const baseIdx = SECS.findIndex((s) => s >= sCalc);
  for (let i = Math.max(0, baseIdx); i < SECS.length; i++) {
    if ((IZ[SECS[i]] ?? 0) >= izReq) return SECS[i];
  }
  return SECS[SECS.length - 1];
}

function cascadeS2(
  l1: number, i1: number, u1: number, s1: Sec,
  l2: number, i2: number, u2: number, s2Init: Sec,
): Sec {
  let s2 = s2Init;
  for (let i = SECS.indexOf(s2Init); i < SECS.length; i++) {
    s2 = SECS[i];
    const eps1 = calcEps(l1, i1, u1, s1);
    const eps2 = calcEps(l2, i2, u2, s2);
    if (eps1 + eps2 <= 3) break;
  }
  return s2;
}
```

### 3 segments avec tensions correctes
```ts
// S1 & S2 : U = Ns × Vmpp (tension chaîne MPP)
const vMpp = VMP * pv.seriesPerGroup;

// S3 : U = V_sys (tension batterie)
const vSys = params.systemVoltage;

// Courants de design
const i1Def = IMP;           // S1 : 1 chaîne
const i2Def = IMP * np;      // S2 : toutes chaînes (Np total)
const i3Def = 100;           // S3 : 100A cas défavorable décharge
```

### Interactivité User-Override
- Tableau comparatif `S_calc | S_suggérée | S_choisie (dropdown)`
- Dropdown éditable par segment (1.5 → 120 mm²)
- Bouton **Optimisation Automatique** → remet tout en mode auto
- Bouton **Synchroniser** → recharge les courants depuis la config calculateur
- Alerte absurde si section > 120 mm² pour I < 100 A

### Validation BVS1 (Ns=2, Np=5, U=83.28V)
| Segment | S_calc | S_sugg | ε_seg | ε_total |
|---------|--------|--------|-------|---------|
| S1 (L=3m, I=13.33A) | 0.741 mm² | 1.5 mm² | ~1.48% | — |
| S2 (L=30m, I=66.65A) | 37.05 mm² | 50 mm² | ~2.22% | — |
| **Total S1+S2** | — | — | — | **~3.70% → cascade → 95mm²** |

---

## 3. `SiteMpptChecker.tsx` — Refonte complète compatibilité MPPT

### Logique corrigée (document GATECH)
```
AVANT (erroné) : Voc_total = Voc × Ns × k → comparer à V_max
APRÈS (correct) : Voc_corrigé = Voc × k → Ns_max = floor(V_max / Voc_corrigé)
                                           Vérif : Ns_actuel ≤ Ns_max
```

### Coefficients et paramètres
```ts
const VOC_DEF = 50.34; // V — Voc STC (document GATECH)
const ISC_DEF = 14.07; // A
const K_VOC   = 1.14;  // correction température froide (GATECH)
const K_ISC   = 1.25;  // marge sécurité courant
```

### MPPT fixe par site (étude REB GPL)
```ts
const SITE_MPPT: Record<string, GatechMpptModel> = {
  BVS1: "GS-MPPT-100M",  // 100A / 200V
  BVS2: "GS-MPPT-80M",   // 80A  / 200V
  TA:   "GS-MPPT-100M",  // 100A / 200V
};
// Pas de sélecteur — modèle fixe selon le site
```

### Calculs corrects
```ts
// Tension
const vocCorrige = voc * K_VOC;                          // Voc d'un module corrigé
const nsMax      = Math.floor(specs.vmaxInput / vocCorrige); // Ns max autorisé
const vocOk      = nsActuel <= nsMax;

// Courant
const iscCorrige = isc * K_ISC;                          // Isc d'une chaîne corrigé
const npMax      = Math.floor(specs.imaxInput / iscCorrige); // Np max autorisé
const iscOk      = npActuel <= npMax;
```

### Correction Np pour TA (bug critique)
```ts
// AVANT (erroné) : npActuel = pv.parallelStrings * params.groups → 4×2 = 8
// APRÈS (correct) : npActuel = pv.parallelStrings → 4
// Raison : TA a 2 groupes avec chacun son propre MPPT indépendant
const npActuel = pv.parallelStrings; // par groupe/MPPT
```

### Validation BVS1 (GS-MPPT-100M)
```
Voc_corrigé = 50.34 × 1.14 = 57.39 V
Ns_max = floor(200 / 57.39) = 3
Ns_actuel = 2 ≤ 3 → ✅ COMPATIBLE

Isc_corrigé = 14.07 × 1.25 = 17.59 A
Np_max = floor(100 / 17.59) = 5
Np_actuel = 5 ≤ 5 → ✅ COMPATIBLE
```

### Validation BVS2 (GS-MPPT-80M)
```
Np_max = floor(80 / 17.59) = 4
Np_actuel = 3 ≤ 4 → ✅ COMPATIBLE
```

---

## 4. `SiteResultCard.tsx` — Section "Étude de Détails" dynamique

### Problème
La section "Étude de Détails Suggérée" affichait des valeurs statiques hardcodées (`SITE_DETAIL_CONFIGS`), dont `"2G × 2S × 4.5P avg"` pour TA.

### Correction
`DetailStudyCard` reçoit maintenant `result: SiteResult` et utilise `result.pv` pour la config PV.

```tsx
// AVANT
function DetailStudyCard({ siteId }: { siteId: string }) {
  const config = SITE_DETAIL_CONFIGS[siteId];
  // affichait config.pvLabel, config.pvTotalModules, config.pvInstalledWp
}

// APRÈS
function DetailStudyCard({ siteId, result }: { siteId: string; result: SiteResult }) {
  const config = SITE_DETAIL_CONFIGS[siteId]; // gardé pour la batterie (statique)
  const { pv, params } = result;              // PV dynamique

  // Affiche :
  // pv.configLabel       → ex: "2G × 2S × 4P"
  // pv.totalModules      → ex: 16
  // pv.actualPvPower     → ex: 8 880 Wp
  // pv.seriesPerGroup    → ex: 2
  // pv.parallelStrings   → ex: 4P
  // params.groups > 1    → affiche "Groupes (MPPT indép.) : 2G"
}
```

### Appel mis à jour
```tsx
// AVANT
<DetailStudyCard siteId={result.siteId} />

// APRÈS
<DetailStudyCard siteId={result.siteId} result={result} />
```

---

## Résumé des fichiers modifiés

| Fichier | Changements |
|---------|-------------|
| `src/lib/solar-calc.ts` | Ajout GS-MPPT-60, correction config TA |
| `SiteCableChecker.tsx` | Refonte complète — logique déterministe, cascade S2, user-override |
| `SiteMpptChecker.tsx` | Logique GATECH correcte, MPPT fixe par site, fix Np TA |
| `SiteResultCard.tsx` | Section PV dynamique dans "Étude de Détails" |
