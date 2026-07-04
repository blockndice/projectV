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
    0: "#1a1a1a",  // vide
    1: "#c4924a",  // couloir marron clair
    2: "#888888",  // mur gris
};

const TILE_SIZE = 28;
const ROWS = MAP_GRID.length;
const COLS = MAP_GRID[0].length;

// ── Grille d'objets (même dimensions que MAP_GRID) ───────────
// 0 = vide  |  1 = coffre fermé  |  2 = coffre ouvert
const ITEM_GRID = (function () {
    const g = Array.from({ length: ROWS }, () => new Array(COLS).fill(0));
    g[2][5]   = 1;
    g[23][4]  = 1;
    g[23][35] = 1;
    g[31][12] = 1;
    g[31][26] = 1;
    return g;
})();

// ── Grille d'ennemis (même dimensions que MAP_GRID) ─────────
// 0 = vide  |  1 = skeleton  |  2 = skeleton_archer
const ENNEMI_GRID = (function () {
    const g = Array.from({ length: ROWS }, () => new Array(COLS).fill(0));
    g[5][10] = 1;  // → skeleton en ligne 5, colonne 10
    g[8][20] = 2;  // → skeleton_archer en ligne 8, colonne 20
    return g;
})();

// Patrouilles optionnelles — clé = "LIGNE,COLONNE"
const ENNEMI_PATROL = {
    // "5,10": { points: [[5,10],[5,18]] },
    "8,20": { points: [[8,20],[14,20],[14,28]] },
};

// ── Mouvement ────────────────────────────────────────────────
const HERO_SPEED    = 120;
const HERO_ACCEL    = 700;
const HERO_FRICTION = 14;
const HERO_SCALE    = 1.5;
const ENEMY_SCALE   = 1.75;
const HERO_ANIM_SLOW  = 1.75;
const HERO_WALK_SPEED = 1.5;

const ENEMY_SPEED    = 50;
const ENEMY_ACCEL    = 180;
const ENEMY_FRICTION = 10;

const HERO_RADIUS = TILE_SIZE * 0.32;
const CHEST_PAD   = Math.floor(TILE_SIZE * 0.18);

// ── Rencontre aléatoire ──────────────────────────────────────
const ENCOUNTER_MIN     = 15;
const ENCOUNTER_MAX     = 35;
const ENCOUNTER_ENEMIES = ["skeleton", "skeleton_archer"];

let fight = false;
const ENCOUNTER_COUNT = 1;

(function () {
    const params   = new URLSearchParams(window.location.search);
    const playerId = params.get("player") || "swordsman";

    const canvas = document.getElementById("mapCanvas");
    const MAP_W  = COLS * TILE_SIZE;
    const MAP_H  = ROWS * TILE_SIZE;

    // ── Three.js — Renderer ──────────────────────────────────────
    const TW = 1; // 1 unité monde = 1 tuile (TILE_SIZE px)

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: false });
    renderer.setPixelRatio(1);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.BasicShadowMap;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x080808);
    scene.fog = new THREE.Fog(0x080808, 20, 36);

    const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 60);

    function onResize() {
        renderer.setSize(window.innerWidth, window.innerHeight);
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    }
    window.addEventListener("resize", onResize);
    onResize();

    // ── Lumières ─────────────────────────────────────────────────
    scene.add(new THREE.AmbientLight(0x504040, 2.5));
    const sun = new THREE.DirectionalLight(0xffc060, 1.8);
    sun.position.set(6, 14, 10);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    sun.shadow.camera.near = 0.5;
    sun.shadow.camera.far  = 60;
    sun.shadow.camera.left = sun.shadow.camera.bottom = -22;
    sun.shadow.camera.right = sun.shadow.camera.top   =  22;
    scene.add(sun);

    const heroLight = new THREE.PointLight(0xc9a84c, 2.5, 6);
    scene.add(heroLight);

    // ── Textures pixel-art procédurales ──────────────────────────
    function pixelTex(fn, size) {
        size = size || 16;
        const c  = document.createElement("canvas");
        c.width  = c.height = size;
        const cx = c.getContext("2d");
        function px(x, y, col) { cx.fillStyle = col; cx.fillRect(x, y, 1, 1); }
        fn(cx, px);
        const t = new THREE.CanvasTexture(c);
        t.magFilter = THREE.NearestFilter;
        t.minFilter = THREE.NearestFilter;
        return t;
    }

    // Sol donjon — dalles 32×32, joints tous les 16px
    const texFloor = pixelTex(function (cx, px) {
        const slabCols = ["#8a7a5c", "#7c6e4e", "#948464", "#86745a"];
        for (let y = 0; y < 32; y++) {
            for (let x = 0; x < 32; x++) {
                if (x === 0 || y === 0 || x === 16 || y === 16) {
                    px(x, y, "#3a3028");
                } else {
                    const si = (x > 16 ? 1 : 0) + (y > 16 ? 2 : 0);
                    const edge = (x === 1 || x === 15 || x === 17 || x === 31 ||
                                  y === 1 || y === 15 || y === 17 || y === 31);
                    const noise = ((x * 11 + y * 7) % 13 < 2) ? -14 : 0;
                    const b = parseInt(slabCols[si].slice(1), 16);
                    const r = (b >> 16) & 0xff, g = (b >> 8) & 0xff, bl = b & 0xff;
                    const adj = noise + (edge ? -12 : 0);
                    const c = n => Math.max(0, Math.min(255, n)).toString(16).padStart(2, "0");
                    px(x, y, "#" + c(r + adj) + c(g + adj) + c(bl + adj));
                }
            }
        }
        // Fissures
        [[5,4],[9,19],[23,8],[28,26],[14,29],[3,22]].forEach(b => px(b[0], b[1], "#524438"));
    }, 32);

    // Mur donjon — briques 32×32 avec décalage alterné
    const texWall = pixelTex(function (cx, px) {
        for (let y = 0; y < 32; y++) {
            for (let x = 0; x < 32; x++) {
                const row = Math.floor(y / 8);
                const xOff = (row % 2) === 0 ? 0 : 16;
                const isH = (y % 8 === 0);
                const isV = ((x + xOff) % 20 === 0);
                if (isH || isV) {
                    px(x, y, "#0a0816");
                } else {
                    const brickId = Math.floor((x + xOff) / 20) + row;
                    const base = brickId % 3 === 0 ? "#26223c" : brickId % 3 === 1 ? "#1e1c30" : "#222038";
                    const inner = ((x + xOff) % 20 > 2 && (x + xOff) % 20 < 17 && y % 8 > 1 && y % 8 < 6);
                    px(x, y, inner ? base : "#141228");
                }
            }
        }
    }, 32);

    // Dessus de mur 32×32
    const texWallTop = pixelTex(function (cx, px) {
        for (let y = 0; y < 32; y++) for (let x = 0; x < 32; x++)
            px(x, y, ((x * 5 + y * 7) % 13 < 2) ? "#1a1830" : "#141226");
        [[3,5],[8,14],[16,4],[24,22],[11,26],[28,10]].forEach(b => px(b[0], b[1], "#22203a"));
    }, 32);

    const matFloor   = new THREE.MeshLambertMaterial({ map: texFloor });
    const matWallS   = new THREE.MeshLambertMaterial({ map: texWall });
    const matWallT   = new THREE.MeshLambertMaterial({ map: texWallTop });
    // BoxGeometry face order: +x, -x, +y (top), -y, +z, -z
    const wallMats   = [matWallS, matWallS, matWallT, matWallS, matWallS, matWallS];

    // ── Géométries de tuiles (InstancedMesh) ─────────────────────
    const WALL_H = 1.4;
    const CAP_H  = 0.12;

    let floorCnt = 0, wallCnt = 0;
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
        if (MAP_GRID[r][c] === 1) floorCnt++;
        else if (MAP_GRID[r][c] === 2) wallCnt++;
    }

    const geoFloorT = new THREE.PlaneGeometry(TW, TW);
    const geoWallB  = new THREE.BoxGeometry(TW, WALL_H, TW);
    const geoWallC  = new THREE.BoxGeometry(TW, CAP_H, TW);

    const floorInst = new THREE.InstancedMesh(geoFloorT, matFloor, floorCnt);
    const wallInst  = new THREE.InstancedMesh(geoWallB, wallMats, wallCnt);
    const capInst   = new THREE.InstancedMesh(geoWallC, matWallT, wallCnt);
    floorInst.receiveShadow = true;
    wallInst.castShadow = wallInst.receiveShadow = true;
    scene.add(floorInst);
    scene.add(wallInst);
    scene.add(capInst);

    const dummy = new THREE.Object3D();
    let fi = 0, wi = 0;
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            const tile = MAP_GRID[r][c];
            const wx = (c + 0.5) * TW;
            const wz = (r + 0.5) * TW;
            if (tile === 1) {
                dummy.position.set(wx, 0, wz);
                dummy.rotation.set(-Math.PI / 2, 0, 0);
                dummy.scale.set(1, 1, 1);
                dummy.updateMatrix();
                floorInst.setMatrixAt(fi++, dummy.matrix);
            } else if (tile === 2) {
                dummy.rotation.set(0, 0, 0);
                dummy.scale.set(1, 1, 1);
                dummy.position.set(wx, WALL_H / 2, wz);
                dummy.updateMatrix();
                wallInst.setMatrixAt(wi, dummy.matrix);
                dummy.position.set(wx, WALL_H + CAP_H / 2, wz);
                dummy.updateMatrix();
                capInst.setMatrixAt(wi, dummy.matrix);
                wi++;
            }
        }
    }
    floorInst.instanceMatrix.needsUpdate = true;
    wallInst.instanceMatrix.needsUpdate  = true;
    capInst.instanceMatrix.needsUpdate   = true;

    // ── Coffres ───────────────────────────────────────────────────
    const chestObjs = [];
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            if (ITEM_GRID[r][c] !== 1) continue;
            const cmat  = new THREE.MeshLambertMaterial({ color: 0x2563eb, emissive: 0x0022aa, emissiveIntensity: 0.5 });
            const cmesh = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.48, 0.48), cmat);
            cmesh.position.set((c + 0.5) * TW, 0.24, (r + 0.5) * TW);
            cmesh.castShadow = true;
            scene.add(cmesh);
            chestObjs.push({ mesh: cmesh, mat: cmat, row: r, col: c });
        }
    }

    // ── Indicateur de cible souris ───────────────────────────────
    const geoRing = new THREE.RingGeometry(0.18, 0.28, 16);
    const matRing = new THREE.MeshBasicMaterial({ color: 0xc9a84c, side: THREE.DoubleSide, transparent: true, opacity: 0.7 });
    const targetMesh = new THREE.Mesh(geoRing, matRing);
    targetMesh.rotation.x = -Math.PI / 2;
    targetMesh.position.y = 0.03;
    targetMesh.visible = false;
    scene.add(targetMesh);

    // ── Sprites (canvas texture → THREE.Sprite) ──────────────────
    const SPR_SIZE = 128;

    function makeSpriteObj(worldScale) {
        const sc  = document.createElement("canvas");
        sc.width  = sc.height = SPR_SIZE;
        const sctx = sc.getContext("2d");
        const tex  = new THREE.CanvasTexture(sc);
        tex.magFilter = THREE.NearestFilter;
        tex.minFilter = THREE.NearestFilter;
        const mat  = new THREE.SpriteMaterial({ map: tex, transparent: true });
        const spr  = new THREE.Sprite(mat);
        spr.scale.set(worldScale, worldScale, 1);
        spr.center.set(0.5, 0); // ancre bas du sprite → pieds au sol (y=0)
        scene.add(spr);
        return { spr, sctx, tex };
    }

    const HERO_WS  = 1.6;
    const ENEMY_WS = 1.8;

    const heroSpr = makeSpriteObj(HERO_WS);

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

    let _fightEnemySpawnX = -1, _fightEnemySpawnY = -1;

    function triggerEncounter(forcedEnemy) {
        combatActive = true;
        encounterTimer = ENCOUNTER_MIN + Math.random() * (ENCOUNTER_MAX - ENCOUNTER_MIN);
        // Mémorise les coords de spawn si c'est un ennemi de la map
        if (forcedEnemy && typeof forcedEnemy === "object") {
            _fightEnemySpawnX = Math.round(forcedEnemy.spawnX);
            _fightEnemySpawnY = Math.round(forcedEnemy.spawnY);
        } else {
            _fightEnemySpawnX = -1;
            _fightEnemySpawnY = -1;
        }
        const forcedType = typeof forcedEnemy === "string" ? forcedEnemy : (forcedEnemy?.type ?? null);
        encOverlay.style.display = "flex";
        let count = 1;
        document.getElementById("enc-count").textContent = count;
        const iv = setInterval(() => {
            count--;
            document.getElementById("enc-count").textContent = Math.max(0, count);
            if (count <= 0) { clearInterval(iv); goFight(forcedType); }
        }, 1000);
    }

    function goFight(forcedEnemy) {
        const enemy = forcedEnemy || ENCOUNTER_ENEMIES[Math.floor(Math.random() * ENCOUNTER_ENEMIES.length)];
        const count = ENCOUNTER_COUNT > 0 ? ENCOUNTER_COUNT : Math.floor(Math.random() * 4) + 1;
        window.location.href =
            `fight_aventure1.html?arena=1&player=${playerId}&bg=arene.jpg&enemy=${enemy}` +
            `&count=${count}&from=aventure1&mapW=${MAP_W}&mapH=${MAP_H}` +
            `&px=${Math.round(hero.x)}&py=${Math.round(hero.y)}` +
            `&espawnX=${_fightEnemySpawnX}&espawnY=${_fightEnemySpawnY}`;
    }

    // ── Héros ────────────────────────────────────────────────────
    const _retX = Number(params.get("px"));
    const _retY = Number(params.get("py"));
    const hero = {
        x: _retX > 0 ? _retX : 1.5 * TILE_SIZE,
        y: _retY > 0 ? _retY : 1.5 * TILE_SIZE,
        vx: 0, vy: 0,
        facing: 1,
        isMoving: false,
        target: null,
        spriteW: 0, spriteH: 0,
        frames: [], frameIdx: 0, elapsed: 0, frameTime: 0.12,
        walkFrames: [], walkFrameIdx: 0, walkElapsed: 0, walkFrameTime: 0.1,
    };

    // ── Ennemis depuis ENNEMI_GRID ───────────────────────────────
    const enemies = [];
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            const type = ENNEMI_GRID[r][c];
            if (!type) continue;
            const config = ENNEMI_PATROL[`${r},${c}`];
            enemies.push({
                type: type === 1 ? "skeleton" : "skeleton_archer",
                x: (c + 0.5) * TILE_SIZE,
                y: (r + 0.5) * TILE_SIZE,
                spawnX: (c + 0.5) * TILE_SIZE,
                spawnY: (r + 0.5) * TILE_SIZE,
                move: !!config,
                patrolPoints: config
                    ? config.points.map(([pr, pc]) => ({ x: (pc + 0.5) * TILE_SIZE, y: (pr + 0.5) * TILE_SIZE }))
                    : [],
                patrolIdx: 0,
                patrolDir: 1,
                vx: 0, vy: 0,
                facing: 1,
                facingTimer: 0,
                isMoving: false,
                frameIdx: 0, elapsed: 0,
                walkFrameIdx: 0, walkElapsed: 0,
            });
        }
    }

    // Un sprite 3D par ennemi
    const enemySprs = enemies.map(() => makeSpriteObj(ENEMY_WS));

    // Supprime l'ennemi vaincu au retour du combat
    const _espawnX = Number(params.get("espawnX")) || -1;
    const _espawnY = Number(params.get("espawnY")) || -1;
    if (params.get("result") === "win" && _espawnX > 0 && _espawnY > 0) {
        const di = enemies.findIndex(e => Math.abs(e.spawnX - _espawnX) < 1 && Math.abs(e.spawnY - _espawnY) < 1);
        if (di >= 0) {
            scene.remove(enemySprs[di].spr);
            enemies.splice(di, 1);
            enemySprs.splice(di, 1);
        }
    }

    // ── Hitboxes de debug ────────────────────────────────────────
    const HBR = HERO_RADIUS / TILE_SIZE; // 0.32 unités monde
    const hbGeo = new THREE.RingGeometry(HBR - 0.025, HBR, 24);
    const heroHB = new THREE.Mesh(hbGeo, new THREE.MeshBasicMaterial({ color: 0x00ff88, side: THREE.DoubleSide }));
    heroHB.rotation.x = -Math.PI / 2;
    heroHB.position.y = 0.015;
    scene.add(heroHB);

    const enemyHBs = enemies.map(() => {
        const m = new THREE.Mesh(hbGeo, new THREE.MeshBasicMaterial({ color: 0xff3311, side: THREE.DoubleSide }));
        m.rotation.x = -Math.PI / 2;
        m.position.y = 0.015;
        scene.add(m);
        return m;
    });

    // ── Cache de sprites ennemis ─────────────────────────────────
    const SPRITE_CACHE = {};
    function loadEnemySprites() {
        const types = [...new Set(enemies.map(e => e.type))];
        for (const type of types) {
            const charFn = CHARACTERS_REGISTRY?.[type];
            if (!charFn) continue;
            const sprites = charFn().sprites ?? {};
            const cache = {};
            for (const key of ["idle", "walk"]) {
                const def = sprites[key];
                if (!def?.path || !def.count) continue;
                const entry = {
                    frames: new Array(def.count).fill(null),
                    spriteW: def.width,
                    spriteH: def.height,
                    frameTime: def.frameTime ?? 0.1,
                };
                for (let i = 0; i < def.count; i++) {
                    const img = new Image(), idx = i;
                    img.onload = () => { entry.frames[idx] = img; };
                    img.src = def.path.replace("{i}", i + 1);
                }
                cache[key] = entry;
            }
            SPRITE_CACHE[type] = cache;
        }
    }

    // ── Sprites du héros ─────────────────────────────────────────
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

    // ── Collision ────────────────────────────────────────────────
    function tileAt(px, py) {
        const c = Math.floor(px / TILE_SIZE);
        const r = Math.floor(py / TILE_SIZE);
        if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return -1;
        return MAP_GRID[r][c];
    }

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

    // ── Mise à jour du héros ─────────────────────────────────────
    const keys = new Set();

    function updateHero(dt) {
        // Vecteurs avant/droite dans le plan du sol selon l'angle de caméra
        const fwdX = -Math.sin(camTheta), fwdZ = -Math.cos(camTheta);
        const rigX =  Math.cos(camTheta), rigZ = -Math.sin(camTheta);
        let ix = 0, iy = 0;
        if (keys.has("ArrowUp")    || keys.has("z")) { ix += fwdX; iy += fwdZ; }
        if (keys.has("ArrowDown")  || keys.has("s")) { ix -= fwdX; iy -= fwdZ; }
        if (keys.has("ArrowLeft")  || keys.has("q")) { ix -= rigX; iy -= rigZ; }
        if (keys.has("ArrowRight") || keys.has("d")) { ix += rigX; iy += rigZ; }

        if (ix !== 0 || iy !== 0) {
            hero.target = null;
            const len = Math.sqrt(ix * ix + iy * iy);
            hero.vx += (ix / len) * HERO_ACCEL * dt;
            hero.vy += (iy / len) * HERO_ACCEL * dt;
            const speed = Math.sqrt(hero.vx * hero.vx + hero.vy * hero.vy);
            if (speed > HERO_SPEED) { hero.vx *= HERO_SPEED / speed; hero.vy *= HERO_SPEED / speed; }
        } else if (hero.target) {
            const dx   = hero.target.x - hero.x;
            const dy   = hero.target.y - hero.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < TILE_SIZE * 0.35) {
                hero.target = null;
            } else {
                ix = dx / dist; iy = dy / dist;
                const len = Math.sqrt(ix * ix + iy * iy);
                hero.vx += (ix / len) * HERO_ACCEL * dt;
                hero.vy += (iy / len) * HERO_ACCEL * dt;
                const speed = Math.sqrt(hero.vx * hero.vx + hero.vy * hero.vy);
                if (speed > HERO_SPEED) { hero.vx *= HERO_SPEED / speed; hero.vy *= HERO_SPEED / speed; }
            }
        }

        if (ix === 0 && iy === 0 && !hero.target) {
            const decay = Math.exp(-HERO_FRICTION * dt);
            hero.vx *= decay;
            hero.vy *= decay;
            if (Math.abs(hero.vx) < 0.5) hero.vx = 0;
            if (Math.abs(hero.vy) < 0.5) hero.vy = 0;
        }

        const prevX = hero.x, prevY = hero.y;
        const mx = hero.vx * dt, my = hero.vy * dt;
        if (canOccupy(hero.x + mx, hero.y)) hero.x += mx; else hero.vx = 0;
        if (canOccupy(hero.x, hero.y + my)) hero.y += my; else hero.vy = 0;

        if (hero.target && (mx !== 0 || my !== 0) && hero.x === prevX && hero.y === prevY) {
            hero.target = null;
        }

        hero.isMoving = Math.abs(hero.x - prevX) > 0.1 || Math.abs(hero.y - prevY) > 0.1;
        // Orientation dans l'espace caméra : droite caméra = composante positive → facing 1
        if (hero.isMoving) {
            const camRight = hero.vx * Math.cos(camTheta) - hero.vy * Math.sin(camTheta);
            if (Math.abs(camRight) > 0.3) hero.facing = camRight > 0 ? 1 : -1;
        }
    }

    // ── Mise à jour des ennemis ──────────────────────────────────
    const ENEMY_FLIP_INTERVAL = 3;

    function updateEnemies(dt) {
        for (const e of enemies) {
            if (!e.move || e.patrolPoints.length < 2) {
                e.facingTimer += dt;
                if (e.facingTimer >= ENEMY_FLIP_INTERVAL) { e.facingTimer = 0; e.facing *= -1; }
                e.isMoving = false;
                continue;
            }
            const target = e.patrolPoints[e.patrolIdx];
            const dx = target.x - e.x, dy = target.y - e.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < TILE_SIZE * 0.3) {
                const decay = Math.exp(-ENEMY_FRICTION * dt);
                e.vx *= decay; e.vy *= decay;
                if (Math.abs(e.vx) < 0.5 && Math.abs(e.vy) < 0.5) {
                    e.vx = 0; e.vy = 0;
                    const next = e.patrolIdx + e.patrolDir;
                    if (next < 0 || next >= e.patrolPoints.length) {
                        e.patrolDir *= -1;
                        e.patrolIdx += e.patrolDir;
                        e.facing *= -1;
                    } else {
                        e.patrolIdx = next;
                        const np = e.patrolPoints[e.patrolIdx];
                        const ndx = np.x - e.x;
                        if (Math.abs(ndx) > 1) e.facing = ndx > 0 ? 1 : -1;
                        else e.facing *= -1;
                    }
                }
                e.isMoving = Math.abs(e.vx) > 0.5 || Math.abs(e.vy) > 0.5;
            } else {
                const ix = dx / dist, iy = dy / dist;
                e.vx += ix * ENEMY_ACCEL * dt; e.vy += iy * ENEMY_ACCEL * dt;
                const speed = Math.sqrt(e.vx * e.vx + e.vy * e.vy);
                if (speed > ENEMY_SPEED) { e.vx *= ENEMY_SPEED / speed; e.vy *= ENEMY_SPEED / speed; }
                e.isMoving = true;
                if (Math.abs(dx) > 1) e.facing = dx > 0 ? 1 : -1;
            }
            e.x += e.vx * dt;
            e.y += e.vy * dt;
        }
    }

    // ── Collision héros ↔ ennemi ─────────────────────────────────
    function checkEnemyCollision() {
        const contactDist = HERO_RADIUS * 2;
        for (const e of enemies) {
            const dx = hero.x - e.x, dy = hero.y - e.y;
            if (dx * dx + dy * dy < contactDist * contactDist) {
                triggerEncounter(e); // passe l'objet pour mémoriser le spawn
                return;
            }
        }
    }

    // ── Caméra orbitale ──────────────────────────────────────────
    let camTheta  = 0;          // angle horizontal autour du héros (rad)
    let camPhi    = 1.05;       // angle vertical (~60°, calque sur la vue initiale)
    let camRadius = 12;         // distance héros-caméra
    const CAM_PHI_MIN = 0.18;  // ~10° (quasi horizontal)
    const CAM_PHI_MAX = 1.48;  // ~85° (quasi zenith)
    const CAM_R_MIN   = 3;
    const CAM_R_MAX   = 20;

    let orbitDragging = false;
    let orbitLastX = 0, orbitLastY = 0;

    // ── Rendu d'un sprite sur canvas texture ─────────────────────
    function updateSpriteCanvas(spObj, img, sw, sh, facing) {
        const { sctx, tex } = spObj;
        sctx.clearRect(0, 0, SPR_SIZE, SPR_SIZE);
        if (img && sw > 0) {
            const sc = Math.min(SPR_SIZE / sw, SPR_SIZE / sh) * 0.92;
            sctx.save();
            sctx.translate(SPR_SIZE / 2, SPR_SIZE); // ancre en bas → pieds au bas du canvas
            sctx.scale(facing, 1);
            sctx.drawImage(img, -sw * sc / 2, -sh * sc, sw * sc, sh * sc);
            sctx.restore();
        }
        tex.needsUpdate = true;
    }

    // ── Rendu Three.js ───────────────────────────────────────────
    function render3D(dt) {
        // Coffres — mise à jour couleur si ouvert
        for (const co of chestObjs) {
            const open = ITEM_GRID[co.row][co.col] === 2;
            co.mat.color.set(open ? 0x334488 : 0x2563eb);
            co.mat.emissive.set(open ? 0x000000 : 0x001880);
            co.mat.emissiveIntensity = open ? 0 : 0.5;
        }

        // Indicateur cible
        if (hero.target) {
            targetMesh.visible = true;
            targetMesh.position.x = hero.target.x / TILE_SIZE;
            targetMesh.position.z = hero.target.y / TILE_SIZE;
        } else {
            targetMesh.visible = false;
        }

        // Lumière dorée autour du héros
        heroLight.position.set(hero.x / TILE_SIZE, 1.5, hero.y / TILE_SIZE);

        // Sprite héros
        const useWalk  = hero.isMoving && hero.walkFrames.filter(Boolean).length > 0;
        const animFr   = useWalk ? hero.walkFrames.filter(Boolean) : hero.frames.filter(Boolean);
        const ft       = useWalk ? hero.walkFrameTime : hero.frameTime;
        if (useWalk) {
            hero.walkElapsed += dt;
            if (hero.walkElapsed >= ft) { hero.walkElapsed -= ft; hero.walkFrameIdx = (hero.walkFrameIdx + 1) % animFr.length; }
        } else {
            hero.elapsed += dt;
            if (hero.elapsed >= ft) { hero.elapsed -= ft; hero.frameIdx = (hero.frameIdx + 1) % (animFr.length || 1); }
        }
        const hIdx = useWalk ? hero.walkFrameIdx : hero.frameIdx;
        const hImg = animFr[Math.min(hIdx, animFr.length - 1)] || null;
        updateSpriteCanvas(heroSpr, hImg, hero.spriteW, hero.spriteH, hero.facing);
        heroSpr.spr.position.set(hero.x / TILE_SIZE, 0, hero.y / TILE_SIZE);
        heroHB.position.x = hero.x / TILE_SIZE;
        heroHB.position.z = hero.y / TILE_SIZE;

        // Sprites ennemis
        enemies.forEach((e, i) => {
            const ec   = SPRITE_CACHE[e.type];
            const anim = ec && (e.isMoving && ec.walk ? ec.walk : ec.idle);
            const loaded = anim ? anim.frames.filter(Boolean) : [];
            const ft2  = anim ? anim.frameTime : 0.12;
            if (e.isMoving) {
                e.walkElapsed += dt;
                if (e.walkElapsed >= ft2) { e.walkElapsed -= ft2; e.walkFrameIdx = (e.walkFrameIdx + 1) % (loaded.length || 1); }
            } else {
                e.elapsed += dt;
                if (e.elapsed >= ft2) { e.elapsed -= ft2; e.frameIdx = (e.frameIdx + 1) % (loaded.length || 1); }
            }
            const eIdx = e.isMoving ? e.walkFrameIdx : e.frameIdx;
            const eImg = loaded[Math.min(eIdx, loaded.length - 1)] || null;
            const sw   = anim ? (ec.idle?.spriteW ?? anim.spriteW) : TILE_SIZE;
            const sh   = anim ? (ec.idle?.spriteH ?? anim.spriteH) : TILE_SIZE;
            updateSpriteCanvas(enemySprs[i], eImg, sw, sh, e.facing);
            enemySprs[i].spr.position.set(e.x / TILE_SIZE, 0, e.y / TILE_SIZE);
            enemyHBs[i].position.x = e.x / TILE_SIZE;
            enemyHBs[i].position.z = e.y / TILE_SIZE;
        });

        // Caméra orbitale autour du héros
        const hw = hero.x / TILE_SIZE;
        const hz = hero.y / TILE_SIZE;
        const cosPhi = Math.cos(camPhi);
        const cx = hw + camRadius * Math.sin(camTheta) * cosPhi;
        const cy = camRadius * Math.sin(camPhi);
        const cz = hz + camRadius * Math.cos(camTheta) * cosPhi;
        camera.position.set(cx, cy, cz);
        camera.lookAt(hw, 0.5, hz);

        renderer.render(scene, camera);
    }

    // ── Boucle de jeu ────────────────────────────────────────────
    let lastTS = null;
    function loop(ts) {
        const dt = lastTS !== null ? Math.min((ts - lastTS) / 1000, 0.05) : 0;
        lastTS   = ts;

        if (!combatActive) {
            updateHero(dt);
            updateEnemies(dt);
            checkEnemyCollision();
            if (fight) {
                encounterTimer -= dt;
                if (encounterTimer <= 0) triggerEncounter();
            }
        }

        render3D(dt);
        requestAnimationFrame(loop);
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
    document.addEventListener("keyup", e => keys.delete(e.key));

    // ── Clic souris → déplacement ou ouverture de coffre ────────
    const rayClick = new THREE.Raycaster();
    const mouseNDC = new THREE.Vector2();
    const groundPl = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const hitPt    = new THREE.Vector3();

    canvas.addEventListener("click", e => {
        const rect = canvas.getBoundingClientRect();
        mouseNDC.x =  ((e.clientX - rect.left) / rect.width)  * 2 - 1;
        mouseNDC.y = -((e.clientY - rect.top)  / rect.height) * 2 + 1;
        rayClick.setFromCamera(mouseNDC, camera);
        if (!rayClick.ray.intersectPlane(groundPl, hitPt)) return;

        // Coordonnées monde → coordonnées pixel (logique de jeu)
        const wx = hitPt.x * TILE_SIZE;
        const wy = hitPt.z * TILE_SIZE;
        const tc = Math.floor(hitPt.x);
        const tr = Math.floor(hitPt.z);

        if (ITEM_GRID[tr]?.[tc] === 1) {
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

    // ── Contrôles caméra orbitale ────────────────────────────────
    canvas.addEventListener("contextmenu", e => e.preventDefault());

    canvas.addEventListener("mousedown", e => {
        if (e.button === 2) {
            orbitDragging = true;
            orbitLastX = e.clientX;
            orbitLastY = e.clientY;
        }
    });
    window.addEventListener("mouseup", e => { if (e.button === 2) orbitDragging = false; });
    window.addEventListener("mousemove", e => {
        if (!orbitDragging) return;
        const dx = e.clientX - orbitLastX;
        const dy = e.clientY - orbitLastY;
        orbitLastX = e.clientX;
        orbitLastY = e.clientY;
        camTheta -= dx * 0.005;
        camPhi = Math.max(CAM_PHI_MIN, Math.min(CAM_PHI_MAX, camPhi + dy * 0.005));
    });
    canvas.addEventListener("wheel", e => {
        e.preventDefault();
        camRadius = Math.max(CAM_R_MIN, Math.min(CAM_R_MAX, camRadius + e.deltaY * 0.015));
    }, { passive: false });

    // ── Contrôles tactiles (tap = déplacer, 2 doigts = orbite + zoom) ───
    let touchPrev = [];
    let tapStartPos = null; // pour détecter un vrai tap (sans glissement)

    canvas.addEventListener("touchstart", e => {
        e.preventDefault();
        touchPrev = Array.from(e.touches).map(t => ({ id: t.identifier, x: t.clientX, y: t.clientY }));
        if (e.touches.length === 1) {
            tapStartPos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        } else {
            tapStartPos = null;
        }
    }, { passive: false });

    canvas.addEventListener("touchend", e => {
        e.preventDefault();
        // Tap 1 doigt sans déplacement → déclenche la logique click (déplacement héros)
        if (e.changedTouches.length === 1 && e.touches.length === 0 && tapStartPos) {
            const t = e.changedTouches[0];
            const moved = Math.hypot(t.clientX - tapStartPos.x, t.clientY - tapStartPos.y);
            if (moved < 10) {
                canvas.dispatchEvent(new MouseEvent("click", {
                    bubbles: true, cancelable: true,
                    clientX: t.clientX, clientY: t.clientY
                }));
            }
        }
        tapStartPos = null;
        touchPrev = Array.from(e.touches).map(t => ({ id: t.identifier, x: t.clientX, y: t.clientY }));
    }, { passive: false });

    canvas.addEventListener("touchmove", e => {
        e.preventDefault();
        tapStartPos = null; // glissement → annule le tap
        const tch = Array.from(e.touches);
        if (tch.length === 2 && touchPrev.length === 2) {
            const p1 = touchPrev.find(p => p.id === tch[0].identifier) || touchPrev[0];
            const p2 = touchPrev.find(p => p.id === tch[1].identifier) || touchPrev[1];
            const cx = (tch[0].clientX + tch[1].clientX) / 2;
            const cy = (tch[0].clientY + tch[1].clientY) / 2;
            camTheta -= (cx - (p1.x + p2.x) / 2) * 0.005;
            camPhi = Math.max(CAM_PHI_MIN, Math.min(CAM_PHI_MAX, camPhi + (cy - (p1.y + p2.y) / 2) * 0.005));
            const dNow  = Math.hypot(tch[0].clientX - tch[1].clientX, tch[0].clientY - tch[1].clientY);
            const dPrev = Math.hypot(p1.x - p2.x, p1.y - p2.y);
            camRadius = Math.max(CAM_R_MIN, Math.min(CAM_R_MAX, camRadius - (dNow - dPrev) * 0.03));
        }
        touchPrev = tch.map(t => ({ id: t.identifier, x: t.clientX, y: t.clientY }));
    }, { passive: false });

    loadHeroSprites();
    loadEnemySprites();
    requestAnimationFrame(loop);
})();
