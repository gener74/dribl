# Documentació tècnica — Dribl

## Visió general

Dribl és una **PWA (Progressive Web App)** de tecnificació futbolística. Funciona com un joc per nivells: l'usuari veu un vídeo demostratiu d'un exercici i després l'ha de repetir davant la càmera. La IA valida en temps real si ho fa correctament.

---

## Tecnologies

| Tecnologia | Rol | Equivalent Java |
|---|---|---|
| **Next.js 16** | Framework web (React + servidor) | Spring Boot |
| **React 18** | UI declarativa basada en components | JSF / Thymeleaf |
| **TypeScript** | JavaScript amb tipat estàtic | Java tipat |
| **Tailwind CSS** | Estils via classes CSS | — |
| **Framer Motion** | Animacions declaratives | — |
| **TensorFlow.js** | Models de IA al navegador | — |
| **COCO-SSD** | Model de detecció d'objectes (pilota) | — |
| **MoveNet** | Model de detecció de pose humana (peus) | — |

### Per què Next.js i no React pur?
Next.js afegeix enrutament, optimització d'imatges, i la generació de metadata (manifest PWA). A més, Vercel —on despleguem— és dels mateixos creadors i el suport és natiu.

---

## Estructura del projecte

```
src/
├── app/                          ← Rutes (enrutament basat en carpetes)
│   ├── layout.tsx                ← Plantilla global (com un @Layout a Spring MVC)
│   ├── page.tsx                  ← Pàgina d'inici "/" — menú de nivells
│   └── level/[id]/page.tsx       ← Pàgina dinàmica "/level/1", "/level/2"...
├── components/
│   ├── ExerciseCamera.tsx        ← Component principal de l'exercici
│   ├── VideoDemo.tsx             ← Component del vídeo demostratiu
│   └── ServiceWorkerRegister.tsx ← Registra el SW per la PWA
├── hooks/
│   └── useBallTouchDetector.ts   ← Lògica d'IA (detecció pilota + tocs)
└── data/
    └── levels.ts                 ← Definició de tots els nivells
```

> **Nota Next.js**: cada `page.tsx` dins `app/` és una ruta automàtica. `[id]` és un paràmetre dinàmic (com `@PathVariable` a Spring).

---

## Flux de l'aplicació

```
/ (menú)
  └─→ /level/1
        ├─→ Stage "demo"     (VideoDemo)   ← vídeo explicatiu
        └─→ Stage "exercise" (ExerciseCamera) ← càmera + IA
              ├─→ loading    (carrega càmera + models IA)
              ├─→ countdown  (3, 2, 1, Va!)
              ├─→ playing    (bucle de detecció en temps real)
              └─→ success / timeout
```

---

## Fitxers clau explicats

### `src/data/levels.ts`
Font de veritat de tots els nivells. Per afegir un nivell nou només cal afegir un objecte a l'array `LEVELS`:

```ts
{
  id: 4,
  title: "Nou exercici",
  description: "...",
  objective: "...",
  targetCount: 15,      // tocs necessaris per completar
  timeLimit: 90,        // segons disponibles
  difficulty: "Mitjà",
  videoUrl: null,       // per vídeo local a /public/videos/level-4.mp4
  youtubeId: null,      // o ID de YouTube (ex: "dQw4w9WgXcQ")
  icon: "🎯",
  exercise: "ball_touches",
}
```

---

### `src/app/page.tsx` — Menú principal
Llista els nivells de `LEVELS`. La variable `unlockedLevels = [1]` controla quins es poden jugar (hardcoded de moment). Els nivells bloquejats es mostren amb opacitat i sense link.

---

### `src/app/level/[id]/page.tsx` — Pàgina de nivell
Gestiona el flux demo → exercici. Té un `stage` (estat) que pot ser `"demo"` o `"exercise"`. Quan l'usuari clica "Estic preparat", canvia l'stage i munta el component `ExerciseCamera`.

---

### `src/components/VideoDemo.tsx`
Mostra el vídeo demostratiu i les instruccions. Si el nivell té `youtubeId`, embeds un iframe de YouTube. Si no, mostra un placeholder indicant on posar el vídeo local.

---

### `src/components/ExerciseCamera.tsx`
És el component més complex. Gestiona:

**Estados (phases):**
```
loading → countdown → playing → success
                              ↘ timeout
```

**Responsabilitats:**
- Accedir a la càmera (`navigator.mediaDevices.getUserMedia`)
- Carregar els models d'IA
- Executar el bucle de detecció via `requestAnimationFrame`
- Gestionar el temporitzador
- Mostrar feedback visual (flash ambre en cada toc, barra de temps, punts de progrés)

**Dos refs importants** (com a camps de classe a Java, persisteixen entre renders):
- `touchCountRef` — comptador real de tocs (no el state, que és asíncron)
- `phaseRef` — fase actual accessible dins els closures asíncrons

> **Per què refs i no state?** El bucle de detecció (`requestAnimationFrame`) és una closure que captura el valor de les variables en el moment de creació. Si usés `state` directament, sempre llegitia el valor inicial. Els `refs` sempre apunten al valor actual.

---

### `src/hooks/useBallTouchDetector.ts`
El cervell de l'app. És un **custom hook** de React (com un servei injectable a Spring, però per a components).

**Carrega dos models de IA:**

| Model | Funció | Threshold |
|---|---|---|
| COCO-SSD lite | Detecta la pilota a la imatge | score > 0.4 |
| MoveNet Lightning | Detecta 17 keypoints del cos humà | score > 0.3 |

**Keypoints de MoveNet usats** (índexs 15-18):
- 15 = turmell esquerre
- 16 = turmell dret  
- 17 = punta peu esquerre
- 18 = punta peu dret

**Algorisme de detecció de toc:**
```
Cada frame (~60fps):
  1. Detecta pilota (COCO-SSD) → posició normalitzada (0.0 - 1.0)
  2. Si no la detecta, usa l'última posició coneguda fins a 300ms (persistència)
  3. Detecta keypoints dels peus (MoveNet)
  4. Calcula distància euclidiana pilota ↔ cada peu
  5. Si distància < 0.18 (normalitzat) → incrementa "nearFootFrames"
  6. Quan la pilota s'allunya (nearFootFrames ≥ 2) → registra TOC
  7. Cooldown de 500ms entre tocs (evita dobles comptatges)
```

> La distància és **normalitzada** (0.0 a 1.0 respecte a l'amplada/alçada del frame), no en píxels. Així funciona igual independentment de la resolució de la càmera.

**Overlay al canvas:**
Dibuixa per sobre del vídeo:
- Cercle verd = pilota detectada
- Cercles blaus = posicions dels peus
- Cercle ambre = toc detectat

---

## PWA (Progressive Web App)

Fitxers que fan l'app instal·lable al mòbil:

| Fitxer | Funció |
|---|---|
| `public/manifest.json` | Metadades de l'app (nom, icones, color) |
| `public/sw.js` | Service Worker — permet funcionar offline i ser instal·lada |
| `src/components/ServiceWorkerRegister.tsx` | Registra el SW al navegador |

---

## Com afegir un nou nivell

1. Edita `src/data/levels.ts` i afegeix un objecte a `LEVELS`
2. Edita `src/app/page.tsx` i afegeix el nou `id` a `unlockedLevels`
3. (Opcional) Afegeix un vídeo a `public/videos/level-X.mp4`

---

## Desplegament

- **Repositori**: GitHub (`gener74/dribl`)
- **Hosting**: Vercel (desplegament automàtic en cada `git push`)
- **Comanda local**: `npm run dev` → http://localhost:3000
