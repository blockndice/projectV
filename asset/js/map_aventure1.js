// ============================================================
// MAP AVENTURE 1 — Grille 40×40 + déplacement du héros
// MAP_GRID  — terrain  : 0 = vide (noir) | 1 = couloir (marchable) | 2 = mur (collision)
// ITEM_GRID — objets   : 0 = vide        | 1 = coffre fermé        | 2 = coffre ouvert
//
// ── Placer un coffre ──────────────────────────────────────────────
// Dans ITEM_GRID, mettez 1 à l'intersection [LIGNE][COLONNE] :
//   ITEM_GRID[5][10] = 1;   →  coffre en ligne 5, colonne 10
// La case MAP_GRID correspondante doit être 1 (couloir marchable).
// ─────────────────────────────────────────────────────────────────
// ============================================================

const MAP_GRID = [
//   0  1  2  3  4  5  6  7  8  9  10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29 30 31 32 33 34 35 36 37 38 39
    [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2], // 0
    [2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2], // 1
    [2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2], // 2
    [2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2], // 3
    [2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2], // 4
    [2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2], // 5
    [2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2], // 6
    [2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2], // 7
    [2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2], // 8
    [2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2], // 9
    [2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2], // 10
    [2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2], // 11
    [2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2], // 12
    [2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2], // 13
    [2, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2], // 14
    [2, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2], // 15
    [2, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2], // 16
    [2, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2], // 17
    [2, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2], // 18
    [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2], // 19 — passage vers la section sud
    [2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2], // 20
    [2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2], // 21
    [2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2], // 22
    [2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2], // 23
    [2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2], // 24
    [2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2], // 25
    [2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2], // 26
    [2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2], // 27
    [2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2], // 28
    [2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2], // 29
    [2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2], // 30
    [2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2], // 31
    [2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2], // 32
    [2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2], // 33
    [2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2], // 34
    [2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2], // 35
    [2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2], // 36
    [2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2], // 37
    [2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2], // 38
    [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0, 2, 2], // 39
];

const TILE_COLORS = {
    0: "#1a1a1a",  // mur
    1: "#c4924a",  // couloir marron clair
    2: "#888888",  // salle gris
};

const TILE_SIZE = 28;
const ROWS = MAP_GRID.length;
const COLS = MAP_GRID[0].length;

// ── Grille d'objets (même dimensions que MAP_GRID) ───────────
// 0 = vide  |  1 = coffre fermé  |  2 = coffre ouvert
// Pour placer un coffre : ITEM_GRID[LIGNE][COLONNE] = 1
const ITEM_GRID = (function () {
    const g = Array.from({ length: ROWS }, () => new Array(COLS).fill(0));
    // ── Coffres ──────────────────────────────────────────────
    g[2][5]   = 1;
    g[23][4]  = 1;
    g[23][35] = 1;
    g[31][12] = 1;
    g[31][26] = 1;
    // ─────────────────────────────────────────────────────────
    return g;
})();

// ── Mouvement ────────────────────────────────────────────────
const HERO_SPEED    = 120;  // vitesse max en pixels/seconde
const HERO_ACCEL    = 700;  // accélération (px/s²) — plus élevé = réponse plus rapide
const HERO_FRICTION = 14;   // décélération au relâchement — plus élevé = arrêt plus brusque
const HERO_SCALE    = 1.5;  // taille du sprite : 1 = une case, 2 = deux cases, 0.5 = demi-case
const HERO_ANIM_SLOW = 1.75;  // ralentissement de l'animation idle : 1 = normal, 2 = moitié vitesse, 3 = tiers
const HERO_WALK_SPEED = 1.5;    // vitesse de l'animation marche : 1 = normal, 2 = double vitesse, 0.5 = moitié

// Rayon de collision du héros (en pixels). Réduire pour passer dans des passages plus étroits.
const HERO_RADIUS = TILE_SIZE * 0.32;

// Inset visuel du carré bleu des coffres — utilisé à la fois pour le rendu et la collision.
const CHEST_PAD = Math.floor(TILE_SIZE * 0.18);

// ── Rencontre aléatoire ──────────────────────────────────────
const ENCOUNTER_MIN     = 15;                              // secondes minimum
const ENCOUNTER_MAX     = 35;                              // secondes maximum
const ENCOUNTER_ENEMIES = ["skeleton", "skeleton_archer"]; // ennemis possibles

// Mettre à true pour activer les combats aléatoires.
let fight = false;

(function () {
    const params   = new URLSearchParams(window.location.search);
    const playerId = params.get("player") || "swordsman";

    const canvas = document.getElementById("mapCanvas");
    const ctx    = canvas.getContext("2d");
    const MAP_W  = COLS * TILE_SIZE;
    const MAP_H  = ROWS * TILE_SIZE;
    let scale = 1, vpW = 0, vpH = 0, camX = 0, camY = 0;

    function resizeCanvas() {
        // Zoom ancré sur 20 tuiles (référence originale) — la caméra scrolle sur l'excédent.
        const ZOOM_REF = 20 * TILE_SIZE;
        scale = Math.max(window.innerWidth / ZOOM_REF, window.innerHeight / ZOOM_REF);
        canvas.width  = window.innerWidth;
        canvas.height = window.innerHeight;
        vpW = canvas.width  / scale;  // zone logique visible en largeur
        vpH = canvas.height / scale;  // zone logique visible en hauteur
    }
    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    // ── Rencontre aléatoire ──────────────────────────────────────
    let encounterTimer = ENCOUNTER_MIN + Math.random() * (ENCOUNTER_MAX - ENCOUNTER_MIN);
    let combatActive   = false;

    const encOverlay = document.createElement("div");
    encOverlay.innerHTML =
        `<div style="text-align:center">` +
        `<p style="font-size:2.2rem;margin:0 0 .5rem;letter-spacing:.12em">&#9876; Combat !</p>` +
        `<p id="enc-count" style="font-size:5rem;margin:0;font-weight:bold;line-height:1">1</p>` +
        `</div>`;
    Object.assign(encOverlay.style, {
        display:"none", position:"fixed", inset:"0",
        background:"rgba(0,0,0,0.78)", zIndex:"200",
        alignItems:"center", justifyContent:"center",
        color:"#f0d070", fontFamily:"serif",
    });
    document.body.appendChild(encOverlay);

    function triggerEncounter() {
        combatActive = true;
        encOverlay.style.display = "flex";
        let count = 1;
        document.getElementById("enc-count").textContent = count;
        const iv = setInterval(() => {
            count--;
            document.getElementById("enc-count").textContent = Math.max(0, count);
            if (count <= 0) { clearInterval(iv); goFight(); }
        }, 1000);
    }

    function goFight() {
        const enemy = ENCOUNTER_ENEMIES[Math.floor(Math.random() * ENCOUNTER_ENEMIES.length)];
        window.location.href =
            `fight_mission.html?arena=1&player=${playerId}&bg=foret1.png&enemy=${enemy}` +
            `&from=aventure1&mapW=${MAP_W}&mapH=${MAP_H}` +
            `&px=${Math.round(hero.x)}&py=${Math.round(hero.y)}`;
    }

    // Position en pixels (centre du héros), spawn dans la première case marchable
    const _retX = Number(params.get("px"));
    const _retY = Number(params.get("py"));
    const hero = {
        x: _retX > 0 ? _retX : 1.5 * TILE_SIZE,
        y: _retY > 0 ? _retY : 1.5 * TILE_SIZE,
        vx: 0, vy: 0,
        facing: 1,      // 1 = droite, -1 = gauche
        isMoving: false,
        target: null,   // destination souris { x, y } ou null
        spriteW: 0, spriteH: 0,
        // animation idle
        frames: [], frameIdx: 0, elapsed: 0, frameTime: 0.12,
        // animation walk
        walkFrames: [], walkFrameIdx: 0, walkElapsed: 0, walkFrameTime: 0.1,
    };

    // ── Chargement des sprites du héros ──────────────────────────
    function loadHeroSprites() {
        if (typeof CHARACTERS_REGISTRY === "undefined") return;
        const charFn = CHARACTERS_REGISTRY[playerId];
        if (!charFn) return;
        const char = charFn();
        const idle = char.sprites?.idle;
        if (!idle?.path || !idle.count) return;

        hero.frameTime = (idle.frameTime ?? 0.12) * HERO_ANIM_SLOW;
        hero.spriteW   = idle.width;
        hero.spriteH   = idle.height;

        for (let i = 0; i < idle.count; i++) {
            const img = new Image(), index = i;
            img.onload = () => { hero.frames[index] = img; };
            img.src    = idle.path.replace("{i}", i + 1);
            hero.frames.push(null);
        }

        const walk = char.sprites?.walk;
        if (walk?.path && walk.count) {
            hero.walkFrameTime = (walk.frameTime ?? 0.1) * HERO_ANIM_SLOW / HERO_WALK_SPEED;
            for (let i = 0; i < walk.count; i++) {
                const img = new Image(), index = i;
                img.onload = () => { hero.walkFrames[index] = img; };
                img.src    = walk.path.replace("{i}", i + 1);
                hero.walkFrames.push(null);
            }
        }
    }

    // ── Collision : seul le tile 1 est marchable ─────────────────
    function tileAt(px, py) {
        const c = Math.floor(px / TILE_SIZE);
        const r = Math.floor(py / TILE_SIZE);
        if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return -1;
        return MAP_GRID[r][c];
    }

    // Teste si le rectangle du héros chevauche le carré bleu d'un coffre fermé (AABB).
    function chestBlocksAt(hx, hy) {
        const hr = HERO_RADIUS;
        const hL = hx - hr, hR = hx + hr, hT = hy - hr, hB = hy + hr;
        const cL = Math.floor(hL / TILE_SIZE), cR = Math.floor(hR / TILE_SIZE);
        const rT = Math.floor(hT / TILE_SIZE), rB = Math.floor(hB / TILE_SIZE);
        for (let r = rT; r <= rB; r++) {
            for (let c = cL; c <= cR; c++) {
                const iv = ITEM_GRID[r]?.[c];
                if (iv !== 1 && iv !== 2) continue;
                const bL = c * TILE_SIZE + CHEST_PAD,     bR = (c + 1) * TILE_SIZE - CHEST_PAD;
                const bT = r * TILE_SIZE + CHEST_PAD,     bB = (r + 1) * TILE_SIZE - CHEST_PAD;
                if (hL < bR && hR > bL && hT < bB && hB > bT) return true;
            }
        }
        return false;
    }

    function canOccupy(px, py) {
        const r = HERO_RADIUS;
        return tileAt(px - r, py - r) === 1 &&
               tileAt(px + r, py - r) === 1 &&
               tileAt(px - r, py + r) === 1 &&
               tileAt(px + r, py + r) === 1 &&
               !chestBlocksAt(px, py);
    }

    // Retourne {row,col} du coffre fermé adjacent au héros, ou null.
    // La zone de détection est élargie de CHEST_REACH px au-delà du bord bloquant,
    // car canOccupy empêche le héros d'entrer dans l'AABB exacte du coffre.
    const CHEST_REACH = 4;
    function chestInContact() {
        const hr = HERO_RADIUS;
        const hL = hero.x - hr, hR = hero.x + hr, hT = hero.y - hr, hB = hero.y + hr;
        const cL = Math.floor(hL / TILE_SIZE), cR = Math.floor(hR / TILE_SIZE);
        const rT = Math.floor(hT / TILE_SIZE), rB = Math.floor(hB / TILE_SIZE);
        for (let r = rT; r <= rB; r++) {
            for (let c = cL; c <= cR; c++) {
                if (ITEM_GRID[r]?.[c] !== 1) continue;
                const bL = c * TILE_SIZE + CHEST_PAD - CHEST_REACH;
                const bR = (c + 1) * TILE_SIZE - CHEST_PAD + CHEST_REACH;
                const bT = r * TILE_SIZE + CHEST_PAD - CHEST_REACH;
                const bB = (r + 1) * TILE_SIZE - CHEST_PAD + CHEST_REACH;
                if (hL < bR && hR > bL && hT < bB && hB > bT) return { row: r, col: c };
            }
        }
        return null;
    }

    // ── Mise à jour du mouvement ──────────────────────────────────
    const keys = new Set();

    function updateHero(dt) {
        let ix = 0, iy = 0;
        if (keys.has("ArrowUp")    || keys.has("z")) iy -= 1;
        if (keys.has("ArrowDown")  || keys.has("s")) iy += 1;
        if (keys.has("ArrowLeft")  || keys.has("q")) ix -= 1;
        if (keys.has("ArrowRight") || keys.has("d")) ix += 1;

        if (ix !== 0 || iy !== 0) {
            hero.target = null; // clavier annule la cible souris
            if (ix !== 0) hero.facing = ix > 0 ? 1 : -1;

            // Accélération normalisée (diagonale = même vitesse)
            const len = Math.sqrt(ix * ix + iy * iy);
            hero.vx += (ix / len) * HERO_ACCEL * dt;
            hero.vy += (iy / len) * HERO_ACCEL * dt;

            // Plafond à HERO_SPEED
            const speed = Math.sqrt(hero.vx * hero.vx + hero.vy * hero.vy);
            if (speed > HERO_SPEED) {
                const ratio = HERO_SPEED / speed;
                hero.vx *= ratio;
                hero.vy *= ratio;
            }
        } else if (hero.target) {
            const dx   = hero.target.x - hero.x;
            const dy   = hero.target.y - hero.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < TILE_SIZE * 0.35) {
                hero.target = null;
            } else {
                ix = dx / dist;
                iy = dy / dist;
                if (ix !== 0) hero.facing = ix > 0 ? 1 : -1;
                const len = Math.sqrt(ix * ix + iy * iy);
                hero.vx += (ix / len) * HERO_ACCEL * dt;
                hero.vy += (iy / len) * HERO_ACCEL * dt;
                const speed = Math.sqrt(hero.vx * hero.vx + hero.vy * hero.vy);
                if (speed > HERO_SPEED) {
                    hero.vx *= HERO_SPEED / speed;
                    hero.vy *= HERO_SPEED / speed;
                }
            }
        }

        if (ix === 0 && iy === 0 && !hero.target) {
            // Friction exponentielle indépendante du framerate
            const decay = Math.exp(-HERO_FRICTION * dt);
            hero.vx *= decay;
            hero.vy *= decay;
            if (Math.abs(hero.vx) < 0.5) hero.vx = 0;
            if (Math.abs(hero.vy) < 0.5) hero.vy = 0;
        }

        // Application avec glissement le long des murs
        const prevX = hero.x, prevY = hero.y;
        const mx = hero.vx * dt;
        const my = hero.vy * dt;
        if (canOccupy(hero.x + mx, hero.y)) hero.x += mx; else hero.vx = 0;
        if (canOccupy(hero.x, hero.y + my)) hero.y += my; else hero.vy = 0;

        // Navigation souris : annule la cible si le héros est bloqué des deux côtés
        if (hero.target && (mx !== 0 || my !== 0) && hero.x === prevX && hero.y === prevY) {
            hero.target = null;
        }

        // Walk si le héros a réellement bougé, sinon idle
        hero.isMoving = Math.abs(hero.x - prevX) > 0.1 || Math.abs(hero.y - prevY) > 0.1;

    }

    // ── Rendu de la grille ────────────────────────────────────────
    function drawGrid() {
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                const tile = MAP_GRID[r][c];
                const item = ITEM_GRID[r][c];

                // Terrain
                ctx.fillStyle = TILE_COLORS[tile] ?? "#000";
                ctx.fillRect(c * TILE_SIZE, r * TILE_SIZE, TILE_SIZE, TILE_SIZE);
                if (tile === 1) {
                    ctx.strokeStyle = "rgba(0,0,0,0.2)";
                    ctx.lineWidth   = 0.5;
                    ctx.strokeRect(c * TILE_SIZE + 0.5, r * TILE_SIZE + 0.5, TILE_SIZE - 1, TILE_SIZE - 1);
                }

                // Objets (ITEM_GRID)
                if (item === 1 || item === 2) {
                    const pad = CHEST_PAD;
                    const bx  = c * TILE_SIZE + pad;
                    const by  = r * TILE_SIZE + pad;
                    const bw  = TILE_SIZE - pad * 2;
                    if (item === 1) {
                        // Coffre fermé : carré bleu plein
                        ctx.fillStyle = "#2563eb";
                        ctx.fillRect(bx, by, bw, bw);
                        ctx.strokeStyle = "#1a3fa8";
                        ctx.lineWidth = 1;
                        ctx.strokeRect(bx + 0.5, by + 0.5, bw - 1, bw - 1);
                    } else {
                        // Coffre ouvert : carré bleu vide
                        ctx.strokeStyle = "#2563eb";
                        ctx.lineWidth = 2;
                        ctx.strokeRect(bx + 1, by + 1, bw - 2, bw - 2);
                    }
                }
            }
        }
    }

    // ── Rendu du héros ───────────────────────────────────────────
    function drawHero(dt) {
        // Halo doré
        ctx.save();
        ctx.shadowColor = "rgba(201,168,76,0.7)";
        ctx.shadowBlur  = 12;
        ctx.fillStyle   = "rgba(201,168,76,0.12)";
        ctx.fillRect(hero.x - TILE_SIZE / 2 + 2, hero.y - TILE_SIZE / 2 + 2, TILE_SIZE - 4, TILE_SIZE - 4);
        ctx.restore();

        // Choisit l'animation selon l'état du héros
        const useWalk   = hero.isMoving && hero.walkFrames.filter(Boolean).length > 0;
        const animFrames = useWalk ? hero.walkFrames.filter(Boolean) : hero.frames.filter(Boolean);
        const frameTime  = useWalk ? hero.walkFrameTime : hero.frameTime;

        if (useWalk) {
            hero.walkElapsed += dt;
            if (hero.walkElapsed >= frameTime) {
                hero.walkElapsed  -= frameTime;
                hero.walkFrameIdx  = (hero.walkFrameIdx + 1) % animFrames.length;
            }
        } else {
            hero.elapsed += dt;
            if (hero.elapsed >= frameTime) {
                hero.elapsed  -= frameTime;
                hero.frameIdx  = (hero.frameIdx + 1) % (animFrames.length || 1);
            }
        }

        if (animFrames.length > 0 && hero.spriteW > 0) {
            const frameIdx = useWalk ? hero.walkFrameIdx : hero.frameIdx;
            const img      = animFrames[Math.min(frameIdx, animFrames.length - 1)];
            const scale    = Math.min(TILE_SIZE / hero.spriteW, TILE_SIZE / hero.spriteH) * HERO_SCALE;
            const dw       = hero.spriteW * scale;
            const dh       = hero.spriteH * scale;

            ctx.save();
            ctx.translate(hero.x, hero.y);
            ctx.scale(hero.facing, 1);
            ctx.drawImage(img, -dw / 2, -dh / 2, dw, dh);
            ctx.restore();
        } else {
            // Fallback : cercle doré
            ctx.fillStyle   = "#e8c84a";
            ctx.beginPath();
            ctx.arc(hero.x, hero.y, TILE_SIZE * 0.32, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = "#a0882a";
            ctx.lineWidth   = 1.5;
            ctx.stroke();
        }
    }

    // ── Boucle de jeu ────────────────────────────────────────────
    let lastTS = null;
    function loop(ts) {
        const dt = lastTS !== null ? Math.min((ts - lastTS) / 1000, 0.05) : 0;
        lastTS   = ts;

        if (!combatActive) {
            updateHero(dt);
            if (fight) {
                encounterTimer -= dt;
                if (encounterTimer <= 0) triggerEncounter();
            }
        }

        // Caméra centrée sur le héros, bloquée aux bords de la carte
        camX = Math.max(0, Math.min(hero.x - vpW / 2, MAP_W - vpW));
        camY = Math.max(0, Math.min(hero.y - vpH / 2, MAP_H - vpH));

        // Reset transform pour effacer le canvas physique entier
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Applique zoom + décalage caméra en une seule transformation
        ctx.setTransform(scale, 0, 0, scale, -camX * scale, -camY * scale);
        drawGrid();
        drawTarget();
        drawHero(dt);
        requestAnimationFrame(loop);
    }

    // ── Indicateur de cible souris ───────────────────────────────
    function drawTarget() {
        if (!hero.target) return;
        const x = hero.target.x;
        const y = hero.target.y;
        ctx.save();
        ctx.strokeStyle = "rgba(201,168,76,0.8)";
        ctx.lineWidth   = 1;
        const r = TILE_SIZE * 0.3;
        ctx.beginPath(); ctx.moveTo(x - r, y); ctx.lineTo(x + r, y); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x, y - r); ctx.lineTo(x, y + r); ctx.stroke();
        ctx.beginPath();
        ctx.arc(x, y, r * 0.5, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(201,168,76,0.5)";
        ctx.stroke();
        ctx.restore();
    }

    // ── Saisie clavier ───────────────────────────────────────────
    const GAME_KEYS = new Set(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight","z","s","q","d"]);
    document.addEventListener("keydown", e => {
        if (GAME_KEYS.has(e.key)) { e.preventDefault(); keys.add(e.key); }
        if (e.key === "e") {
            const chest = chestInContact();
            if (chest) ITEM_GRID[chest.row][chest.col] = 2;
        }
    });
    document.addEventListener("keyup",   e => keys.delete(e.key));

    // ── Clic souris → déplacement ou ouverture de coffre ────────────────────────
    canvas.addEventListener("click", e => {
        const rect = canvas.getBoundingClientRect();
        const wx = (e.clientX - rect.left) / scale + camX;
        const wy = (e.clientY - rect.top)  / scale + camY;
        const tc = Math.floor(wx / TILE_SIZE);
        const tr = Math.floor(wy / TILE_SIZE);

        if (ITEM_GRID[tr]?.[tc] === 1) {
            // Clic sur un coffre fermé : ouvre si le héros le touche, sinon s'en approche
            const contact = chestInContact();
            if (contact && contact.row === tr && contact.col === tc) {
                ITEM_GRID[tr][tc] = 2;
            } else {
                hero.target = { x: (tc + 0.5) * TILE_SIZE, y: (tr + 0.5) * TILE_SIZE };
            }
        } else if (tileAt(wx, wy) === 1) {
            hero.target = { x: wx, y: wy };
        }
    });

    loadHeroSprites();
    requestAnimationFrame(loop);
})();
