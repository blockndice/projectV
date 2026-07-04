// ============================================================
// FIGHT_MISSION.JS — Combat mission (multi-ennemis 1-4)
// ============================================================
// Paramètres URL :
//   arena, player, bg, enemy (id tiré aléatoirement par Roundforet.js)
//   mapW, mapH, px, py  (position de retour dans Roundforet)
//   count               (optionnel : force le nombre d'ennemis, sinon aléatoire 1-4)
// ============================================================

// ================================
// CONFIGURATION GLOBALE
// ================================
const GAME_WIDTH        = 800;
const GAME_HEIGHT       = 450;
const CONTAINER_PADDING = 40;
const GROUND_Y          = 330;
const SPRITE_SCALE      = 1.5;

// ================================
// CANVAS
// ================================
const canvas = document.getElementById("gameCanvas");
const ctx    = canvas.getContext("2d");

function resizeCanvas() {
    const scale = Math.min(
        (window.innerWidth  - CONTAINER_PADDING) / GAME_WIDTH,
        (window.innerHeight - CONTAINER_PADDING) / GAME_HEIGHT
    );
    canvas.width  = Math.floor(GAME_WIDTH  * scale);
    canvas.height = Math.floor(GAME_HEIGHT * scale);
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// ================================
// LECTURE DES PARAMÈTRES URL
// ================================
const _params   = new URLSearchParams(window.location.search);
const _arenaId  = Number(_params.get("arena"))  || 1;
const _playerId = _params.get("player")         || "swordsman";
const _bgFile   = _params.get("bg")             || "foret1.png";
const _mapW     = _params.get("mapW")           || "2400";
const _mapH     = _params.get("mapH")           || "1350";
const _px       = _params.get("px")             || "";
const _py       = _params.get("py")             || "";

// Nombre d'ennemis : aléatoire 1-4, ou forcé via ?count=N
const _enemyCount = _params.get("count")
    ? Math.max(1, Math.min(4, Number(_params.get("count"))))
    : Math.floor(Math.random() * 4) + 1;

const _missionConfig = MISSION_CONFIG[_arenaId];
const _playerConfig  = CHARACTERS_REGISTRY[_playerId]?.();

// Pool d'ennemis disponibles pour cette mission
const _enemyPool = _missionConfig?.enemies ?? ["skeleton"];

if (!_playerConfig) console.error(`[fight_mission] Joueur introuvable : "${_playerId}"`);

function pickRandomEnemyConfig() {
    const id  = _enemyPool[Math.floor(Math.random() * _enemyPool.length)];
    const cfg = CHARACTERS_REGISTRY[id]?.();
    if (!cfg) console.error(`[fight_mission] Ennemi introuvable : "${id}"`);
    return cfg;
}

// Génère une liste de configs diversifiée pour _enemyCount ennemis :
// - Si pool >= count : on pioche count types distincts (shuffle + slice)
// - Si pool < count  : on remplit avec le pool mélangé en boucle,
//   puis on complète avec des types aléatoires → jamais plus de 2 identiques consécutifs
function buildEnemyConfigs(count) {
    if (_enemyPool.length <= 1) {
        // Un seul type dispo : pas le choix
        return Array.from({ length: count }, () => pickRandomEnemyConfig());
    }

    // Shuffle du pool
    const shuffled = [..._enemyPool].sort(() => Math.random() - 0.5);

    // Répète le pool mélangé jusqu'à avoir assez d'ids, sans doublons consécutifs
    const ids = [];
    while (ids.length < count) {
        for (const id of shuffled) {
            if (ids.length >= count) break;
            // Évite deux fois le même type de suite
            if (ids[ids.length - 1] === id) {
                // Insère un autre type entre les deux
                const other = shuffled.find(x => x !== id);
                if (other) ids.push(other);
            }
            ids.push(id);
        }
    }

    return ids.slice(0, count).map(id => {
        const cfg = CHARACTERS_REGISTRY[id]?.();
        if (!cfg) console.error(`[fight_mission] Ennemi introuvable : "${id}"`);
        return cfg;
    });
}

// Mise à jour du DOM
if (_missionConfig) {
    const banner = document.getElementById("arena-banner");
    if (banner) banner.textContent = _missionConfig.name;
}
const btnBack = document.getElementById("btn-back");
if (btnBack) btnBack.href = "aventure1.html";

// ================================
// DÉCOR 3D EN ARRIÈRE-PLAN
// ================================
(function initArena3D() {
    if (typeof THREE === "undefined") return;

    // Canvas 3D fixe derrière le jeu
    const bg = document.createElement("canvas");
    Object.assign(bg.style, {
        position: "fixed", top: "0", left: "0",
        width: "100%", height: "100%",
        zIndex: "5", pointerEvents: "none",
        boxShadow: "none",
    });
    document.body.insertBefore(bg, document.body.firstChild);

    const bgR = new THREE.WebGLRenderer({ canvas: bg, antialias: false });
    bgR.setPixelRatio(1);
    bgR.shadowMap.enabled = true;
    bgR.shadowMap.type = THREE.BasicShadowMap;

    const bgS = new THREE.Scene();
    bgS.background = new THREE.Color(0x080808);
    bgS.fog = new THREE.Fog(0x080808, 12, 30);

    const bgCam = new THREE.PerspectiveCamera(65, 1, 0.1, 60);
    bgCam.position.set(0, 3.5, 9);
    bgCam.lookAt(0, 1, -5);

    function onBgResize() {
        bgR.setSize(window.innerWidth, window.innerHeight);
        bgCam.aspect = window.innerWidth / window.innerHeight;
        bgCam.updateProjectionMatrix();
    }
    window.addEventListener("resize", onBgResize);
    onBgResize();

    // ── Lumières ─────────────────────────────────────────────────
    bgS.add(new THREE.AmbientLight(0x504040, 2.5));

    const sunLight = new THREE.DirectionalLight(0xffc060, 1.5);
    sunLight.position.set(6, 14, 10);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.set(512, 512);
    bgS.add(sunLight);

    // Torches (ajoutées après les piliers)
    const torchL = new THREE.PointLight(0xc9a84c, 0, 8);
    torchL.position.set(-5.5, 4.5, -3);
    bgS.add(torchL);
    const torchR = new THREE.PointLight(0xc9a84c, 0, 8);
    torchR.position.set( 5.5, 4.5, -3);
    bgS.add(torchR);

    // ── Textures pixel-art ────────────────────────────────────────
    function pixelTex(fn, size) {
        size = size || 16;
        const c = document.createElement("canvas");
        c.width = c.height = size;
        const cx = c.getContext("2d");
        function px(x, y, col) { cx.fillStyle = col; cx.fillRect(x, y, 1, 1); }
        fn(cx, px);
        const t = new THREE.CanvasTexture(c);
        t.magFilter = THREE.NearestFilter;
        t.minFilter = THREE.NearestFilter;
        return t;
    }

    const texFloor = pixelTex(function (cx, px) {
        for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) {
            const v = ((x*7+y*5)%11 < 2) ? "#7a6a4e"
                    : ((x*3+y*9)%7  < 1) ? "#8a7a5c"
                    : "#947e62";
            px(x, y, v);
        }
        for (let xi = 0; xi < 16; xi++) { px(xi, 0, "#504030"); px(0, xi, "#504030"); }
        [[3,1],[8,5],[12,2],[2,10]].forEach(b => px(b[0], b[1], "#5e5040"));
    });
    texFloor.repeat.set(6, 6);
    texFloor.wrapS = texFloor.wrapT = THREE.RepeatWrapping;

    const texWall = pixelTex(function (cx, px) {
        for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) {
            const row = Math.floor(y / 4);
            const dark = (y % 4 === 0 || (x + row * 8) % 20 === 0);
            px(x, y, dark ? "#0a0816" : ((x+y) % 3 === 0 ? "#26223c" : "#1e1c30"));
        }
    });
    texWall.repeat.set(6, 2.5);
    texWall.wrapS = texWall.wrapT = THREE.RepeatWrapping;

    const texPillar = pixelTex(function (cx, px) {
        for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) {
            px(x, y, (x === 0 || x === 15 || y === 0 || y === 15) ? "#0e0c18" : "#222038");
        }
    });

    const matFloor  = new THREE.MeshLambertMaterial({ map: texFloor });
    const matWall   = new THREE.MeshLambertMaterial({ map: texWall });
    const matPillar = new THREE.MeshLambertMaterial({ map: texPillar });
    const matCap    = new THREE.MeshLambertMaterial({ color: 0x141228 });

    // ── Géométries ───────────────────────────────────────────────
    // Sol
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(28, 22), matFloor);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(0, 0, -2);
    floor.receiveShadow = true;
    bgS.add(floor);

    // Mur du fond
    const backWall = new THREE.Mesh(new THREE.BoxGeometry(28, 10, 0.6), matWall);
    backWall.position.set(0, 5, -13);
    backWall.receiveShadow = true;
    bgS.add(backWall);

    // Murs latéraux
    const sideGeo = new THREE.BoxGeometry(0.6, 10, 22);
    const wallL2 = new THREE.Mesh(sideGeo, matWall);
    wallL2.position.set(-10, 5, -3);
    bgS.add(wallL2);
    const wallR2 = new THREE.Mesh(sideGeo, matWall);
    wallR2.position.set( 10, 5, -3);
    bgS.add(wallR2);

    // Piliers
    const pillarGeo = new THREE.CylinderGeometry(0.38, 0.5, 6, 8);
    const capGeo    = new THREE.BoxGeometry(1.2, 0.4, 1.2);
    const baseGeo   = new THREE.BoxGeometry(1.3, 0.3, 1.3);
    [[-5.5, -3], [5.5, -3], [-5.5, 3], [5.5, 3]].forEach(([px, pz]) => {
        const p = new THREE.Mesh(pillarGeo, matPillar);
        p.position.set(px, 3, pz);
        p.castShadow = p.receiveShadow = true;
        bgS.add(p);
        const cap = new THREE.Mesh(capGeo, matCap);
        cap.position.set(px, 6.2, pz);
        bgS.add(cap);
        const base = new THREE.Mesh(baseGeo, matCap);
        base.position.set(px, 0.15, pz);
        bgS.add(base);
    });

    // Allume les torches maintenant que les piliers sont créés
    torchL.intensity = 3.5;
    torchR.intensity = 3.5;

    // ── Boucle de rendu du décor ─────────────────────────────────
    let bgT = 0;
    function bgLoop(ts) {
        bgT = ts * 0.001;
        // Vacillement des torches
        torchL.intensity = 3 + Math.sin(bgT * 8.3) * 0.9 + Math.sin(bgT * 17.1) * 0.4;
        torchR.intensity = 3 + Math.sin(bgT * 9.7) * 0.9 + Math.sin(bgT * 13.9) * 0.4;
        bgR.render(bgS, bgCam);
        requestAnimationFrame(bgLoop);
    }
    requestAnimationFrame(bgLoop);
})();

// ================================
// ASSETS — FOND (conservé pour compatibilité)
// ================================
const backgroundImage = new Image();
backgroundImage.src   = `asset/img/background_fight/${_bgFile}`;

// ================================
// CHARGEMENT DES SPRITES
// ================================
function loadSpritesFromConfig(stateConfig) {
    if (!stateConfig.path || stateConfig.count === 0) return [];
    const arr = [];
    for (let i = 1; i <= stateConfig.count; i++) {
        const img = new Image();
        img.src = stateConfig.path.replace("{i}", i);
        arr.push(img);
    }
    return arr;
}

function buildSprites(charConfig) {
    const sprites = {};
    for (const [name, cfg] of Object.entries(charConfig.sprites)) {
        sprites[name] = { ...cfg, frames: loadSpritesFromConfig(cfg), damageDoneFrames: [] };
    }
    return sprites;
}

function buildSpellThumbnails(charConfig) {
    if (!charConfig.spellThumbnails) return {};
    const thumbs = {};
    for (const [name, src] of Object.entries(charConfig.spellThumbnails)) {
        thumbs[name] = Object.assign(new Image(), { src });
    }
    return thumbs;
}

// ================================
// CRÉATION D'UNE ENTITÉ
// ================================
function createEntity(charConfig, isPlayer, index = 0, total = 1) {
    const sprites = buildSprites(charConfig);
    const idleH   = sprites.idle?.height ?? 32;

    const spellTimers = {};
    if (isPlayer) {
        for (const name of Object.keys(sprites)) {
            if (name.startsWith("Spell")) spellTimers[name] = 0;
        }
    }

    // ── Positionnement ──────────────────────────────────────
    // Joueur : toujours à gauche
    // Ennemis : 1er ennemi ancré à droite, chaque suivant +50px X +20px Y
    let x, y_base;
    if (isPlayer) {
        x      = 100;
        y_base = GROUND_Y - idleH * SPRITE_SCALE;
    } else {
        // Moitié droite : zone 420-780, centre = 600
        // Le groupe est centré horizontalement dans cette zone
        // Décalage en escalier : +50px X, +20px Y par rang
        const ZONE_CENTER_X = 600;
        const STEP_X        = 50;
        const STEP_Y        = 20;
        // Décalage total du groupe sur X pour le centrer
        const groupOffsetX  = ((total - 1) * STEP_X) / 2;
        x      = ZONE_CENTER_X - groupOffsetX + index * STEP_X;
        y_base = GROUND_Y - idleH * SPRITE_SCALE + index * STEP_Y;
    }

    const entity = {
        x,
        y: y_base,
        baseY: y_base, // conserve la Y de référence pour setState
        maxHp: charConfig.maxHp,
        hp:    charConfig.maxHp,
        flipX: !isPlayer,
        currentState: "idle",
        frameIndex:   0,
        frameTimer:   0,
        sprites,
        index,
    };

    if (isPlayer) {
        entity.hudHpBar    = { x: 60, y: 30, width: 300, height: 20, frameWidth: 300, frameHeight: 50, fallbackPadding: 2 };
        entity.aaTimer     = 0;
        entity.aaCancelled = false;
        entity.aaCancelTimer = 0;
        entity.spellTimers = spellTimers;
        entity.spellThumbnails = buildSpellThumbnails(charConfig);
        entity.aaSpeed     = charConfig.aaSpeed ?? 2;
    } else {
        entity.ai = charConfig.ai
            ? {
                aaSpeed:     charConfig.ai.aaSpeed,
                maxCycle:    charConfig.ai.maxCycle,
                spellCycles: structuredClone(charConfig.ai.spellCycles),
                aaTimer:     0,
                cycle:       0,
              }
            : null;
    }

    return entity;
}

// ================================
// INSTANCIATION DES ENTITÉS
// ================================
const player  = createEntity(_playerConfig, true);

// Focus initial sur le premier ennemi (déclaré ici, assigné après création)
let focusedEnemy = null;

// Crée _enemyCount ennemis avec composition diversifiée depuis le pool
const _enemyConfigs = buildEnemyConfigs(_enemyCount);
const enemies = _enemyConfigs.map((cfg, i) =>
    createEntity(cfg, false, i, _enemyCount)
);

// Focus initial sur le premier ennemi
focusedEnemy = enemies[0];

function getTargetEnemy() {
    if (focusedEnemy && focusedEnemy.hp > 0 && !focusedEnemy._ejecting) return focusedEnemy;
    // Fallback : plus proche vivant
    let nearest = null, minDist = Infinity;
    for (const e of enemies) {
        if (e.hp <= 0) continue;
        const d = Math.abs(e.x - player.x);
        if (d < minDist) { minDist = d; nearest = e; }
    }
    // Auto-focus sur le plus proche si le focus actuel est mort
    if (focusedEnemy?.hp <= 0) focusedEnemy = nearest;
    return nearest;
}

// ── Tous les ennemis sont-ils morts ? ────────────────────────
function allEnemiesDead() {
    return enemies.every(e => e.hp <= 0);
}

// ================================
// ÉTAT DU COMBAT
// ================================
let gameState     = "playing";
const EJECT_SPEED = 900;
const EJECT_DELAY = 0.8;
let ejectEntity   = null;
let ejectTimer    = 0;
let ejectDir      = 1;
let resultWin     = false;

// ================================
// HUD FRAME
// ================================
const hudHpFrame = new Image();
hudHpFrame.src   = "asset/img/ui/titre_Vspel.png";

// ================================
// ÉTAT (commun joueur & ennemi)
// ================================
function setState(entity, stateName) {
    const nextState = entity.sprites[stateName];
    if (!nextState) { console.error(`[setState] "${stateName}" introuvable`); return; }

    const prevState = entity.sprites[entity.currentState];
    if (prevState?.damageDoneFrames) prevState.damageDoneFrames = [];
    if (nextState.damageDoneFrames)  nextState.damageDoneFrames = [];

    if (entity === player && entity.currentState === "AA" && stateName !== "AA") {
        const aaSprite    = entity.sprites.AA;
        const minDmgFrame = Math.min(...(aaSprite.damageFrames ?? [Infinity]));
        if (entity.frameIndex < minDmgFrame) {
            entity.aaCancelled   = true;
            entity.aaCancelTimer = 0.8;
        }
    }

    entity.currentState = stateName;
    entity.frameIndex   = 0;
    entity.frameTimer   = 0;
    // Utilise baseY si disponible (ennemis décalés), sinon GROUND_Y
    const refY = entity.baseY !== undefined
        ? entity.baseY + (entity.sprites.idle?.height ?? 32) * SPRITE_SCALE
        : GROUND_Y;
    entity.y = refY - nextState.height * SPRITE_SCALE;
}

function setPlayerState(stateName) { setState(player, stateName); }

// ================================
// INPUT CLAVIER
// ================================
window.addEventListener("keydown", (e) => {
    const keyMap    = { a: "Spell1", z: "Spell2", e: "Spell3", r: "Spell4" };
    const spellName = keyMap[e.key.toLowerCase()];
    if (!spellName) return;
    trycastSpell(spellName);
});

// ================================
// INPUT SOURIS — CLIC SUR ICÔNES
// ================================
function trycastSpell(spellName) {
    const next = player.sprites[spellName];
    if (!next || next.lock) return;
    if (next.cooldown && player.spellTimers[spellName] < next.cooldown) return;
    const current = player.sprites[player.currentState];
    if (player.currentState === "idle" || current.cancel) {
        if (next.cooldown) player.spellTimers[spellName] = 0;
        setPlayerState(spellName);
    }
}

function getSpellIconRects() {
    const { x, y, height } = player.hudHpBar;
    const startY      = y + height + 8 + 25;
    const iconSize    = 30;
    const iconSpacing = 20;
    return Object.keys(player.sprites)
        .filter(n => n.startsWith("Spell"))
        .map((name, i) => ({ name, x: x + i * (iconSize + iconSpacing), y: startY, w: iconSize, h: iconSize }));
}

canvas.addEventListener("click", (e) => {
    if (gameState === "result") { handleResultClick(e); return; }
    const scaleX = GAME_WIDTH  / canvas.width;
    const scaleY = GAME_HEIGHT / canvas.height;
    const rect   = canvas.getBoundingClientRect();
    const gameX  = (e.clientX - rect.left) * (canvas.width  / rect.width)  * scaleX;
    const gameY  = (e.clientY - rect.top)  * (canvas.height / rect.height) * scaleY;

    // Vérifie d'abord si on clique sur un ennemi vivant pour changer le focus
    if (gameState === "playing") {
        const barW   = 300;
        const barH   = 20;
        const gapY   = 5;
        const startX = GAME_WIDTH - 60 - barW;
        const startY = 30;

        for (let i = 0; i < enemies.length; i++) {
            const e = enemies[i];
            if (e.hp <= 0 || e._ejecting) continue;

            const bx = startX;
            const by = startY + i * (barH + gapY);

            if (
                gameX >= bx &&
                gameX <= bx + barW &&
                gameY >= by &&
                gameY <= by + barH
            ) {
                focusedEnemy = e;
                return; // clic consommé
            }
        }
    }

    // Sinon clic sur icônes spells
    for (const icon of getSpellIconRects()) {
        if (gameX >= icon.x && gameX <= icon.x + icon.w && gameY >= icon.y && gameY <= icon.y + icon.h) {
            trycastSpell(icon.name); break;
        }
    }
});

canvas.addEventListener("mousemove", (e) => {
    const scaleX = GAME_WIDTH  / canvas.width;
    const scaleY = GAME_HEIGHT / canvas.height;
    const rect   = canvas.getBoundingClientRect();
    const gameX  = (e.clientX - rect.left) * (canvas.width  / rect.width)  * scaleX;
    const gameY  = (e.clientY - rect.top)  * (canvas.height / rect.height) * scaleY;
    const hovering = getSpellIconRects().some(icon => {
        if (!(gameX >= icon.x && gameX <= icon.x + icon.w && gameY >= icon.y && gameY <= icon.y + icon.h)) return false;
        const spell = player.sprites[icon.name];
        return !spell.lock && spell.cooldown && player.spellTimers[icon.name] >= spell.cooldown;
    });
    canvas.style.cursor = hovering ? "pointer" : "default";
});

// ================================
// DÉGÂTS — TEXTES FLOTTANTS
// ================================
const damageTexts        = [];
const DAMAGE_TEXT_SPEED  = 60;
const DAMAGE_TEXT_DURATION = 1;

function addDamageText(value, x, y, color) {
    damageTexts.push({ value, x: Math.floor(x), y: Math.floor(y), lifetime: DAMAGE_TEXT_DURATION, maxLifetime: DAMAGE_TEXT_DURATION, color });
}

// Dégâts joueur → ennemi ciblé (focus ou plus proche)
function applyDamageToNearestEnemy(dmg) {
    const target = getTargetEnemy();
    if (!target) return;
    target.hp = Math.max(0, target.hp - dmg);
    addDamageText(dmg, target.x, target.y - 20, "#ff4444");
    if (target.hp <= 0) {
        target._ejecting  = true;
        target._ejectDir  = 1;
        target._ejectTimer = 0;
        // Si c'était le focus, on cherche automatiquement un autre vivant
        if (focusedEnemy === target) focusedEnemy = null;
        if (allEnemiesDead()) triggerEndCombat(true);
    }
}

function applyDamageToPlayer(dmg) {
    player.hp = Math.max(0, player.hp - dmg);
    const { x, y, width, height } = player.hudHpBar;
    addDamageText(dmg, x + width * (player.hp / player.maxHp) + 12, y + height - 10, "#ff0000");
    if (player.hp <= 0) triggerEndCombat(false);
}

// ================================
// FIN DE COMBAT
// ================================
function triggerEndCombat(win) {
    if (gameState !== "playing") return;
    gameState  = "ejecting";
    resultWin  = win;
    ejectTimer = 0;
    if (!win) {
        // Éjecte le joueur
        ejectEntity = player;
        ejectDir    = -1;
    }
    // Si victoire, les ennemis individuels gèrent leur propre éjection via _ejecting
}

function updateEject(deltaTime) {
    if (gameState !== "ejecting") return;

    // Éjection du joueur (défaite)
    if (ejectEntity) {
        ejectEntity.x += ejectDir * EJECT_SPEED * deltaTime;
    }

    ejectTimer += deltaTime;
    if (ejectTimer >= EJECT_DELAY) gameState = "result";
}

// Éjections individuelles des ennemis vaincus (tourne pendant "playing" ET "ejecting")
function updateIndividualEjects(deltaTime) {
    for (const e of enemies) {
        if (e._ejecting) {
            e.x += e._ejectDir * EJECT_SPEED * deltaTime;
        }
    }
}

// ================================
// UPDATE : AUTO-ATTAQUE JOUEUR
// ================================
function updateAutoAttack(deltaTime) {
    if (player.currentState !== "idle") return;
    player.aaTimer += deltaTime;
    if (player.aaTimer >= player.aaSpeed) {
        player.aaTimer = 0;
        setPlayerState("AA");
    }
}

// ================================
// UPDATE : COOLDOWNS SPELLS JOUEUR
// ================================
function updateSpellTimers(deltaTime) {
    for (const name of Object.keys(player.spellTimers)) {
        const spell = player.sprites[name];
        if (!spell || spell.lock || !spell.cooldown) continue;
        player.spellTimers[name] = Math.min(spell.cooldown, player.spellTimers[name] + deltaTime);
    }
}

// ================================
// UPDATE : IA ENNEMIE (indépendante par ennemi)
// ================================
function updateEnemyAI(entity, deltaTime) {
    const ai = entity.ai;
    if (!ai || entity.hp <= 0 || entity._ejecting) return;
    if (entity.currentState !== "idle") return;

    ai.aaTimer += deltaTime;
    if (ai.aaTimer < ai.aaSpeed) return;
    ai.aaTimer = 0;
    ai.cycle++;

    let spellToCast = null;
    for (const spellName in ai.spellCycles) {
        if (ai.spellCycles[spellName].includes(ai.cycle)) { spellToCast = spellName; break; }
    }

    if (spellToCast && entity.sprites[spellToCast]) setState(entity, spellToCast);
    else setState(entity, "AA");

    if (ai.cycle >= ai.maxCycle) ai.cycle = 0;
}

// ================================
// DRAW : ENTITÉ (animation)
// ================================
function drawEntity(entity, deltaTime) {
    if (entity.hp <= 0 && !entity._ejecting) return; // mort et éjecté = invisible
    const state  = entity.sprites[entity.currentState];
    const frames = state?.frames;
    if (!frames || frames.length === 0) return;

    entity.frameTimer += deltaTime;
    if (entity.frameTimer >= state.frameTime) {
        entity.frameTimer -= state.frameTime;
        entity.frameIndex++;

        if (state.damageFrames && state.damageHit) {
            const pos = state.damageFrames.indexOf(entity.frameIndex);
            if (pos !== -1 && !state.damageDoneFrames.includes(entity.frameIndex)) {
                const dmg = state.damageHit[pos];
                if (entity === player) applyDamageToNearestEnemy(dmg);
                else                   applyDamageToPlayer(dmg);
                state.damageDoneFrames.push(entity.frameIndex);
            }
        }

        if (entity.frameIndex >= frames.length) {
            if (state.loop) {
                entity.frameIndex = 0;
            } else {
                setState(entity, "idle");
                if (entity.ai) entity.ai.aaTimer = 0;
                else           entity.aaTimer = 0;
                return;
            }
        }
    }

    const frame = frames[entity.frameIndex];
    if (!frame?.complete) return;

    const w = state.width  * SPRITE_SCALE;
    const h = state.height * SPRITE_SCALE;
    const x = entity.x + (state.offsetX ?? 0) * SPRITE_SCALE;
    const y = entity.y + (state.offsetY ?? 0) * SPRITE_SCALE;

    ctx.imageSmoothingEnabled = false;
    if (entity.flipX) {
        ctx.save(); ctx.scale(-1, 1);
        ctx.drawImage(frame, -(x + w), y, w, h);
        ctx.restore();
    } else {
        ctx.drawImage(frame, x, y, w, h);
    }
}

// ================================
// DRAW : HUD BARRE DE VIE JOUEUR
// ================================
function drawHealthHUD(entity, invert = false) {
    const { x, y, width, height, frameWidth, frameHeight, fallbackPadding } = entity.hudHpBar;
    const ratio    = Math.max(0, entity.hp / entity.maxHp);
    const hasFrame = hudHpFrame.complete && hudHpFrame.naturalWidth !== 0;

    if (hasFrame) ctx.drawImage(hudHpFrame, x - 20, y - 15, frameWidth, frameHeight);
    else {
        ctx.fillStyle = "#000";
        ctx.fillRect(x - fallbackPadding, y - fallbackPadding, width + fallbackPadding * 2, height + fallbackPadding * 2);
    }
    ctx.fillStyle = "#400"; ctx.fillRect(x, y, width, height);
    ctx.fillStyle = "#2ecc71";
    if (!invert) ctx.fillRect(x, y, width * ratio, height);
    else         ctx.fillRect(x + width * (1 - ratio), y, width * ratio, height);
}

// ================================
// DRAW : TRIANGLE DE FOCUS (au-dessus du sprite ciblé)
// ================================
function drawFocusTriangle(entity) {
    const state = entity.sprites[entity.currentState];
    if (!state) return;

    const w = state.width  * SPRITE_SCALE;
    const h = state.height * SPRITE_SCALE;

    // Position réelle utilisée dans drawEntity()
    const drawX = entity.x + (state.offsetX ?? 0) * SPRITE_SCALE;
    const drawY = entity.y + (state.offsetY ?? 0) * SPRITE_SCALE;

    // Centre réel du sprite affiché
    const centerX = entity.flipX
        ? drawX + w / 2
        : drawX + w / 2;

    // Position au-dessus du sprite
    const topY = drawY - 12;

    const size = 8;

    ctx.save();
    ctx.fillStyle   = "rgba(255,255,255,0.95)";
    ctx.shadowColor = "rgba(255,255,255,0.6)";
    ctx.shadowBlur  = 6;

    ctx.beginPath();
    ctx.moveTo(centerX, topY);
    ctx.lineTo(centerX - size, topY - size * 1.6);
    ctx.lineTo(centerX + size, topY - size * 1.6);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
}

// ================================
// DRAW : BARRES DE VIE ENNEMIS (HUD coin droit, empilées)
// ================================
function drawEnemyHpBars() {
    const barW   = 300;
    const barH   = 20;
    const gapY   = 5;   // écart entre barres
    const startX = GAME_WIDTH - 60 - barW;
    const startY = 30;

    enemies.forEach((e, i) => {
        const bx    = startX;
        const by    = startY + i * (barH + gapY);
        const ratio = Math.max(0, e.hp / e.maxHp);
        const isFocused = (focusedEnemy === e || (_enemyCount === 1));
        const isDead    = e.hp <= 0;

        // Cadre HUD (image ou fallback)
        const hasFrame = hudHpFrame.complete && hudHpFrame.naturalWidth !== 0;
        if (hasFrame) ctx.drawImage(hudHpFrame, bx - 20, by - 15, 300, 50);
        else {
            ctx.fillStyle = "#000";
            ctx.fillRect(bx - 2, by - 2, barW + 4, barH + 4);
        }

        // Fond barre
        ctx.fillStyle = isDead ? "#222" : "#400";
        ctx.fillRect(bx, by, barW, barH);

        // Barre de vie (de droite à gauche — invert)
        if (!isDead) {
            ctx.fillStyle = ratio > 0.5 ? "#2ecc71" : ratio > 0.25 ? "#f39c12" : "#e74c3c";
            ctx.fillRect(bx + barW * (1 - ratio), by, barW * ratio, barH);
        }

        // Indicateur de focus (liseré doré sur la barre active)
        if (isFocused && !isDead) {
            ctx.strokeStyle = "#f0c040";
            ctx.lineWidth   = 1.5;
            ctx.strokeRect(bx, by, barW, barH);
        }

        // Nom de l'ennemi + numéro si plusieurs
        if (_enemyCount > 1) {
            ctx.fillStyle    = isDead ? "rgba(255,255,255,0.25)" : isFocused ? "#f0c040" : "rgba(255,255,255,0.6)";
            ctx.font         = `${isFocused ? "bold " : ""}11px Arial`;
            ctx.textAlign    = "right";
            ctx.textBaseline = "middle";
            ctx.fillText(`Ennemi ${i + 1}${isDead ? " ✗" : ""}`, bx - 4, by + barH / 2);
        }

        // Triangle de focus au-dessus du sprite sur le terrain
        if (isFocused && !isDead) drawFocusTriangle(e);
    });
}

// ================================
// DRAW : TIMER AA JOUEUR
// ================================
function drawAATimer() {
    const { x, y, width, height } = player.hudHpBar;
    const isDoingAA = player.currentState === "AA";
    const ratio     = isDoingAA ? 1 : Math.min(1, player.aaTimer / player.aaSpeed);
    const barY  = y + height + 5;
    const barH  = 8;
    const textX = x + width;
    const textY = barY + barH + 15;

    ctx.fillStyle = "#222";     ctx.fillRect(x, barY, width, barH);
    ctx.fillStyle = ratio >= 1 ? "#ffd700" : "#3498db";
    ctx.fillRect(x, barY, width * ratio, barH);
    ctx.strokeStyle = "#000";   ctx.lineWidth = 1;
    ctx.strokeRect(x, barY, width, barH);

    ctx.font = "12px Arial"; ctx.textAlign = "right";
    if (player.aaCancelled && player.aaCancelTimer > 0) {
        ctx.globalAlpha = Math.min(1, player.aaCancelTimer / 0.2);
        ctx.fillStyle   = "#ff3333"; ctx.font = "bold 12px Arial";
        ctx.fillText("AA : Cancel", textX, textY);
        ctx.globalAlpha = 1;
    } else {
        ctx.fillStyle = "#fff";
        ctx.fillText(isDoingAA ? "AA: READY" : `AA: ${player.aaTimer.toFixed(2)}s / ${player.aaSpeed}s`, textX, textY);
    }
}

// ================================
// DRAW : ICÔNES SPELLS JOUEUR
// ================================
function drawSpellIcons() {
    const { x, y, height } = player.hudHpBar;
    const startY      = y + height + 8 + 25;
    const iconSize    = 30;
    const iconSpacing = 20;
    const keys        = ["A", "Z", "E", "R"];
    const spellNames  = Object.keys(player.sprites).filter(n => n.startsWith("Spell"));

    spellNames.forEach((name, i) => {
        const spell = player.sprites[name];
        if (!spell) return;
        const ix = x + i * (iconSize + iconSpacing), iy = startY;
        const ratio   = (!spell.lock && spell.cooldown) ? player.spellTimers[name] / spell.cooldown : 0;
        const isReady = ratio >= 1;
        const isUlt   = name === "Spell4";

        if (isReady && isUlt) { ctx.save(); ctx.shadowColor = "#ffd700"; ctx.shadowBlur = 20; }
        ctx.fillStyle = isReady ? "#ffd700" : "#333";
        ctx.fillRect(ix, iy, iconSize, iconSize);
        if (!spell.lock && spell.cooldown) {
            ctx.fillStyle = isReady ? "#ffea00" : "#3498db";
            ctx.fillRect(ix, iy + iconSize - iconSize * ratio, iconSize, iconSize * ratio);
        }
        if (spell.lock) {
            ctx.strokeStyle = "#e74c3c"; ctx.lineWidth = 3;
            const p = 8;
            ctx.beginPath();
            ctx.moveTo(ix + p, iy + p); ctx.lineTo(ix + iconSize - p, iy + iconSize - p);
            ctx.moveTo(ix + iconSize - p, iy + p); ctx.lineTo(ix + p, iy + iconSize - p);
            ctx.stroke();
        } else if (isReady) {
            const thumb = player.spellThumbnails?.[name];
            if (thumb?.complete && thumb.naturalWidth !== 0) ctx.drawImage(thumb, ix, iy, iconSize, iconSize);
        } else {
            ctx.fillStyle = "#666"; ctx.font = "bold 20px Arial";
            ctx.textAlign = "center"; ctx.textBaseline = "middle";
            ctx.fillText(keys[i] ?? name, ix + iconSize / 2, iy + iconSize / 2);
        }
        ctx.strokeStyle = spell.lock ? "#666" : isReady ? "#ffd700" : "#555";
        ctx.lineWidth = 2; ctx.strokeRect(ix, iy, iconSize, iconSize);
        if (isReady && isUlt) ctx.restore();
        if (isReady && !spell.lock) {
            ctx.fillStyle = "#fff"; ctx.font = "bold 12px Arial";
            ctx.textAlign = "center"; ctx.textBaseline = "top";
            ctx.fillText(keys[i] ?? name, ix + iconSize / 2, iy + iconSize + 5);
        }
    });
}

// ================================
// DRAW : COMPTEUR ENNEMIS RESTANTS
// ================================
function drawEnemyCounter() {
    const alive = enemies.filter(e => e.hp > 0).length;
    const cx    = GAME_WIDTH / 2;
    ctx.fillStyle    = "rgba(0,0,0,0.5)";
    ctx.beginPath();
    ctx.roundRect(cx - 60, 8, 120, 24, 4);
    ctx.fill();
    ctx.fillStyle    = alive > 0 ? "#e74c3c" : "#2ecc71";
    ctx.font         = "bold 13px Arial";
    ctx.textAlign    = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(`Ennemis : ${alive} / ${_enemyCount}`, cx, 20);
}

// ================================
// DRAW : TEXTES DE DÉGÂTS
// ================================
function drawDamageTexts(deltaTime) {
    for (let i = damageTexts.length - 1; i >= 0; i--) {
        const d = damageTexts[i];
        d.lifetime -= deltaTime;
        if (d.lifetime <= 0) { damageTexts.splice(i, 1); continue; }
        d.y -= Math.floor(DAMAGE_TEXT_SPEED * deltaTime);
        ctx.globalAlpha = d.lifetime / d.maxLifetime;
        ctx.fillStyle   = d.color;
        ctx.font        = "20px Arial";
        ctx.textAlign   = "center";
        ctx.fillText(d.value, d.x, d.y);
        ctx.globalAlpha = 1;
    }
}

// ================================
// DRAW : ÉCRAN DE RÉSULTAT
// ================================
const _resultButtons = [];

function drawResult() {
    ctx.fillStyle = "rgba(0,0,0,0.72)";
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    const cx = GAME_WIDTH / 2, cy = GAME_HEIGHT / 2;
    const title    = resultWin ? "VICTOIRE" : "DÉFAITE";
    const titleCol = resultWin ? "#f0c040"  : "#e74c3c";

    ctx.save();
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.shadowBlur = 40; ctx.shadowColor = titleCol;
    ctx.fillStyle  = titleCol;
    ctx.font       = "bold 72px Arial";
    ctx.fillText(title, cx, cy - 60);
    ctx.restore();

    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillStyle = "rgba(255,255,255,0.55)";
    ctx.font      = "18px Arial";
    ctx.fillText(
        resultWin ? "Tous les ennemis ont été vaincus !" : "Vous avez été vaincu...",
        cx, cy - 10
    );

    if (resultWin) {
        drawResultButton("Continuer", cx, cy + 50, 200, 44, "#c9a84c", "#1a0e00", () => {
            const rp = new URLSearchParams();
            if (_px && _py) { rp.set("px", _px); rp.set("py", _py); }
            const sx = _params.get("espawnX"), sy = _params.get("espawnY");
            if (sx && sy && Number(sx) > 0) { rp.set("espawnX", sx); rp.set("espawnY", sy); rp.set("result", "win"); }
            const qs = rp.toString();
            window.location.href = `aventure1.html${qs ? "?" + qs : ""}`;
        });
    } else {
        drawResultButton("Retour à la carte", cx, cy + 50, 220, 44, "#333", "#fff", () => {
            window.location.href = "aventure1.html";
        });
    }
}

function drawResultButton(label, cx, cy, w, h, bg, fg, onClick) {
    const x = cx - w / 2, y = cy - h / 2, r = 6;
    ctx.beginPath();
    ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    ctx.fillStyle = bg; ctx.fill();
    ctx.fillStyle = fg; ctx.font = "bold 16px Arial";
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(label, cx, cy);
    _resultButtons.push({ x, y, w, h, onClick });
}

function handleResultClick(e) {
    const scaleX = GAME_WIDTH  / canvas.width;
    const scaleY = GAME_HEIGHT / canvas.height;
    const rect   = canvas.getBoundingClientRect();
    const gameX  = (e.clientX - rect.left) * (canvas.width  / rect.width)  * scaleX;
    const gameY  = (e.clientY - rect.top)  * (canvas.height / rect.height) * scaleY;
    for (const btn of _resultButtons) {
        if (gameX >= btn.x && gameX <= btn.x + btn.w && gameY >= btn.y && gameY <= btn.y + btn.h) {
            btn.onClick(); break;
        }
    }
}

// ================================
// GAME LOOP
// ================================
let lastTime = 0;

function gameLoop(timestamp) {
    const deltaTime = Math.min((timestamp - lastTime) / 1000, 0.1);
    lastTime = timestamp;

    ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    // Voile sombre au sol pour lisibilité des sprites sur le décor 3D
    const _bgGrad = ctx.createLinearGradient(0, GAME_HEIGHT * 0.45, 0, GAME_HEIGHT);
    _bgGrad.addColorStop(0, "rgba(0,0,0,0)");
    _bgGrad.addColorStop(1, "rgba(0,0,0,0.45)");
    ctx.fillStyle = _bgGrad;
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    if (gameState === "playing") {
        if (player.aaCancelled) {
            player.aaCancelTimer -= deltaTime;
            if (player.aaCancelTimer <= 0) player.aaCancelled = false;
        }
        updateAutoAttack(deltaTime);
        updateSpellTimers(deltaTime);
        for (const e of enemies) updateEnemyAI(e, deltaTime);
    }

    updateIndividualEjects(deltaTime); // tourne toujours, peu importe gameState
    if (gameState === "ejecting") updateEject(deltaTime);

    // Dessin joueur
    const playerOut = gameState === "ejecting" && ejectEntity === player && player.x < -200;
    if (!playerOut) drawEntity(player, gameState === "playing" ? deltaTime : 0);

    // Dessin ennemis
    for (const e of enemies) {
        const out = e._ejecting && e.x > GAME_WIDTH + 200;
        if (!out) drawEntity(e, gameState === "playing" ? deltaTime : 0);
    }

    // HUD
    if (gameState !== "result") {
        drawHealthHUD(player);
        drawAATimer();
        drawSpellIcons();
        drawEnemyHpBars();
        drawDamageTexts(deltaTime);
    }

    if (gameState === "result") {
        _resultButtons.length = 0;
        drawResult();
    }

    requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);