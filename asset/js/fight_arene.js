// ============================================================
// FIGHT ARENE.JS — Logique de jeu pure
// ============================================================
// Ce fichier ne contient AUCUNE donnée de personnage.
// Tout est chargé dynamiquement depuis :
//   - js/characters/<id>.js  (stats, sprites, spells, IA)
//   - js/arenas.js           (décors + ennemi fixe par arène)
//
// Paramètres URL attendus :
//   ?arena=1&player=swordsman&bg=arene_ruine.png
// ============================================================

// ================================
// CONFIGURATION GLOBALE
// ================================
const GAME_WIDTH       = 800;
const GAME_HEIGHT      = 450;
const CONTAINER_PADDING = 40;
const GROUND_Y         = 330;
const SPRITE_SCALE     = 2;

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
const _arenaId  = Number(_params.get("arena"))   || 1;
const _playerId = _params.get("player")          || "swordsman";
const _bgFile   = _params.get("bg")              || "arene.jpg";
const _fromMap  = _params.get("from")            || "map_arene";

const _arenaConfig  = _fromMap === "map_aventure"
    ? AVENTURE_CONFIG[_arenaId]
    : ARENAS_CONFIG[_arenaId];
const _playerConfig = CHARACTERS_REGISTRY[_playerId]?.();
const _enemyConfig  = CHARACTERS_REGISTRY[_arenaConfig?.enemy]?.();

if (!_playerConfig) console.error(`[arene.js] Personnage joueur introuvable : "${_playerId}"`);
if (!_enemyConfig)  console.error(`[arene.js] Personnage ennemi introuvable : "${_arenaConfig?.enemy}"`);

// Mise à jour du DOM (bandeau arène + bouton retour)
if (_arenaConfig) {
    const banner = document.getElementById("arena-banner");
    if (banner) banner.textContent = _arenaConfig.name;
}
const btnBack = document.getElementById("btn-back");
if (btnBack) btnBack.href = `character_select.html?arena=${_arenaId}&from=${_fromMap}`;

// ================================
// ASSETS — FOND
// ================================
const backgroundImage = new Image();
backgroundImage.src   = `asset/img/background_fight/${_bgFile}`;

// ================================
// CHARGEMENT DES SPRITES
// ================================
// Transforme la config d'un état (path + count) en tableau d'objets Image.
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

// Construit l'objet sprites runtime à partir de la config personnage.
// Chaque état reçoit ses frames chargées + damageDoneFrames initialisé.
function buildSprites(charConfig) {
    const sprites = {};
    for (const [stateName, stateCfg] of Object.entries(charConfig.sprites)) {
        sprites[stateName] = {
            ...stateCfg,
            frames:          loadSpritesFromConfig(stateCfg),
            damageDoneFrames: [],
        };
    }
    return sprites;
}

// Charge les thumbnails des spells (joueur uniquement).
function buildSpellThumbnails(charConfig) {
    if (!charConfig.spellThumbnails) return {};
    const thumbs = {};
    for (const [spellName, src] of Object.entries(charConfig.spellThumbnails)) {
        thumbs[spellName] = Object.assign(new Image(), { src });
    }
    return thumbs;
}

// ================================
// CRÉATION D'UNE ENTITÉ
// ================================
// Crée un objet entité runtime (player ou enemy) à partir d'une config personnage.
function createEntity(charConfig, isPlayer) {
    const sprites = buildSprites(charConfig);
    const idleH   = sprites.idle?.height ?? 32;

    // Timers de cooldown pour tous les spells (joueur uniquement)
    const spellTimers = {};
    if (isPlayer) {
        for (const stateName of Object.keys(sprites)) {
            if (stateName.startsWith("Spell")) spellTimers[stateName] = 0;
        }
    }

    const entity = {
        // Position
        x: isPlayer ? 100 : GAME_WIDTH - 200,
        y: GROUND_Y - idleH * SPRITE_SCALE,

        // Stats
        maxHp: charConfig.maxHp,
        hp:    charConfig.maxHp,

        // Affichage
        flipX: !isPlayer, // ennemi retourné

        // Animation
        currentState: "idle",
        frameIndex:   0,
        frameTimer:   0,

        // Sprites runtime
        sprites,

        // HUD barre de vie
        hudHpBar: isPlayer
            ? { x: 60, y: 30, width: 300, height: 20, frameWidth: 300, frameHeight: 50, fallbackPadding: 2 }
            : { x: GAME_WIDTH - 60 - 300, y: 30, width: 300, height: 20, frameWidth: 300, frameHeight: 50, fallbackPadding: 2 },
    };

    if (isPlayer) {
        // Données spécifiques au joueur
        entity.aaTimer      = 0;
        entity.aaCancelled  = false;
        entity.aaCancelTimer = 0;
        entity.spellTimers  = spellTimers;
        entity.spellThumbnails = buildSpellThumbnails(charConfig);
        entity.aaSpeed      = charConfig.aaSpeed ?? 2;
    } else {
        // Données spécifiques à l'IA ennemie (copiées depuis la config)
        entity.ai = charConfig.ai
            ? {
                aaSpeed:    charConfig.ai.aaSpeed,
                maxCycle:   charConfig.ai.maxCycle,
                spellCycles: structuredClone(charConfig.ai.spellCycles),
                aaTimer:    0,
                cycle:      0,
              }
            : null;
    }

    return entity;
}

// ================================
// INSTANCIATION DES ENTITÉS
// ================================
const player = createEntity(_playerConfig, true);
const enemy  = createEntity(_enemyConfig,  false);

// ================================
// ÉTAT DU COMBAT
// ================================
// "playing" | "ejecting" | "result"
let gameState      = "playing";

// Éjection : le perdant glisse hors écran avant l'écran de résultat
const EJECT_SPEED  = 900;  // pixels/seconde
const EJECT_DELAY  = 0.8;  // secondes d'éjection avant affichage résultat
let   ejectEntity  = null; // entité en cours d'éjection
let   ejectTimer   = 0;
let   ejectDir     = 1;    // +1 vers la droite, -1 vers la gauche
let   resultWin    = false; // true = joueur a gagné

// ================================
// HUD FRAME (image partagée)
// ================================
const hudHpFrame = new Image();
hudHpFrame.src   = "asset/img/ui/titre_Vspel.png";

// ================================
// ÉTAT (commun joueur & ennemi)
// ================================
function setState(entity, stateName) {
    const who      = entity === player ? "PLAYER" : "ENEMY";
    const nextState = entity.sprites[stateName];
    if (!nextState) {
        console.error(`[setState] "${stateName}" introuvable sur ${who}`);
        return;
    }

    // Reset damageDoneFrames de l'état qu'on quitte
    const prevState = entity.sprites[entity.currentState];
    if (prevState?.damageDoneFrames) prevState.damageDoneFrames = [];

    // Reset damageDoneFrames de l'état cible
    if (nextState.damageDoneFrames) nextState.damageDoneFrames = [];

    // Cancel AA joueur : pénalité si on annule avant le premier damageFrame
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
    entity.y = GROUND_Y - nextState.height * SPRITE_SCALE;

    console.log(`[setState] ${who}: → ${stateName}`);
}

function setPlayerState(stateName) { setState(player, stateName); }

// ================================
// INPUT CLAVIER
// ================================
window.addEventListener("keydown", (e) => {
    const keyMap   = { a: "Spell1", z: "Spell2", e: "Spell3", r: "Spell4" };
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
    const spellNames  = Object.keys(player.sprites).filter(n => n.startsWith("Spell"));

    return spellNames.map((name, i) => ({
        name,
        x: x + i * (iconSize + iconSpacing),
        y: startY,
        w: iconSize,
        h: iconSize,
    }));
}

canvas.addEventListener("click", (e) => {
    const scaleX = GAME_WIDTH  / canvas.width;
    const scaleY = GAME_HEIGHT / canvas.height;
    const rect   = canvas.getBoundingClientRect();
    const gameX  = (e.clientX - rect.left) * (canvas.width  / rect.width)  * scaleX;
    const gameY  = (e.clientY - rect.top)  * (canvas.height / rect.height) * scaleY;

    for (const icon of getSpellIconRects()) {
        if (gameX >= icon.x && gameX <= icon.x + icon.w &&
            gameY >= icon.y && gameY <= icon.y + icon.h) {
            trycastSpell(icon.name);
            break;
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
        if (!(gameX >= icon.x && gameX <= icon.x + icon.w &&
              gameY >= icon.y && gameY <= icon.y + icon.h)) return false;
        const spell   = player.sprites[icon.name];
        return !spell.lock && spell.cooldown && player.spellTimers[icon.name] >= spell.cooldown;
    });

    canvas.style.cursor = hovering ? "pointer" : "default";
});

// ================================
// DÉGÂTS — TEXTES FLOTTANTS
// ================================
const damageTexts        = [];
const DAMAGE_TEXT_SPEED    = 60;
const DAMAGE_TEXT_DURATION = 1;

function addDamageText(value, entity, invert, color) {
    const hud        = entity.hudHpBar;
    const ratio      = Math.max(0, entity.hp / entity.maxHp);
    const lifePixels = hud.width * ratio;

    const x = invert
        ? hud.x + (hud.width - lifePixels) - 12
        : hud.x + lifePixels + 12;
    const y = hud.y + hud.height - 10;

    damageTexts.push({
        value,
        x: Math.floor(x),
        y: Math.floor(y),
        lifetime:    DAMAGE_TEXT_DURATION,
        maxLifetime: DAMAGE_TEXT_DURATION,
        color,
    });
}

function applyDamageToEnemy(dmg) {
    enemy.hp = Math.max(0, enemy.hp - dmg);
    addDamageText(dmg, enemy, true, "#ff0000");
    if (enemy.hp <= 0) triggerEject(enemy);
}

function applyDamageToPlayer(dmg) {
    player.hp = Math.max(0, player.hp - dmg);
    addDamageText(dmg, player, false, "#ff0000");
    if (player.hp <= 0) triggerEject(player);
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
// UPDATE : IA ENNEMIE
// ================================
function updateEnemyAI(deltaTime) {
    const ai = enemy.ai;
    if (!ai) return;
    if (enemy.currentState !== "idle") return;

    ai.aaTimer += deltaTime;
    if (ai.aaTimer < ai.aaSpeed) return;

    ai.aaTimer = 0;
    ai.cycle++;

    let spellToCast = null;
    for (const spellName in ai.spellCycles) {
        if (ai.spellCycles[spellName].includes(ai.cycle)) {
            spellToCast = spellName;
            break;
        }
    }

    if (spellToCast && enemy.sprites[spellToCast]) {
        console.log(`[AI] ${spellToCast} au cycle ${ai.cycle}`);
        setState(enemy, spellToCast);
    } else {
        setState(enemy, "AA");
    }

    if (ai.cycle >= ai.maxCycle) {
        console.log("[AI] Reset cycle");
        ai.cycle = 0;
    }
}

// ================================
// DRAW : ENTITÉ (animation)
// ================================
function drawEntity(entity, deltaTime) {
    const state  = entity.sprites[entity.currentState];
    const frames = state?.frames;
    if (!frames || frames.length === 0) return;

    // Avancer la frame
    entity.frameTimer += deltaTime;
    if (entity.frameTimer >= state.frameTime) {
        entity.frameTimer -= state.frameTime;
        entity.frameIndex++;

        // Appliquer les dégâts sur la bonne frame
        if (state.damageFrames && state.damageHit) {
            const pos = state.damageFrames.indexOf(entity.frameIndex);
            if (pos !== -1 && !state.damageDoneFrames.includes(entity.frameIndex)) {
                const dmg = state.damageHit[pos];
                if (entity === player) applyDamageToEnemy(dmg);
                else                   applyDamageToPlayer(dmg);
                state.damageDoneFrames.push(entity.frameIndex);
            }
        }

        // Fin d'animation
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

    // Dessin de la frame courante
    const frame = frames[entity.frameIndex];
    if (!frame?.complete) return;

    const w = state.width  * SPRITE_SCALE;
    const h = state.height * SPRITE_SCALE;
    const x = entity.x + (state.offsetX ?? 0) * SPRITE_SCALE;
    const y = entity.y + (state.offsetY ?? 0) * SPRITE_SCALE;

    if (entity.flipX) {
        ctx.save();
        ctx.scale(-1, 1);
        ctx.drawImage(frame, -(x + w), y, w, h);
        ctx.restore();
    } else {
        ctx.drawImage(frame, x, y, w, h);
    }
}

// ================================
// DRAW : HUD BARRE DE VIE
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

    ctx.fillStyle = "#400";
    ctx.fillRect(x, y, width, height);

    ctx.fillStyle = "#2ecc71";
    if (!invert) ctx.fillRect(x, y, width * ratio, height);
    else         ctx.fillRect(x + width * (1 - ratio), y, width * ratio, height);
}

// ================================
// DRAW : TIMER AA JOUEUR
// ================================
function drawAATimer() {
    const aaState = player.sprites.AA;
    const { x, y, width, height } = player.hudHpBar;
    const isDoingAA = player.currentState === "AA";
    const ratio = isDoingAA ? 1 : Math.min(1, player.aaTimer / player.aaSpeed);

    const barY  = y + height + 5;
    const barH  = 8;
    const textX = x + width;
    const textY = barY + barH + 15;

    ctx.fillStyle = "#222";
    ctx.fillRect(x, barY, width, barH);
    ctx.fillStyle = ratio >= 1 ? "#ffd700" : "#3498db";
    ctx.fillRect(x, barY, width * ratio, barH);
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 1;
    ctx.strokeRect(x, barY, width, barH);

    ctx.font = "12px Arial";
    ctx.textAlign = "right";

    if (player.aaCancelled && player.aaCancelTimer > 0) {
        ctx.globalAlpha = Math.min(1, player.aaCancelTimer / 0.2);
        ctx.fillStyle   = "#ff3333";
        ctx.font        = "bold 12px Arial";
        ctx.fillText("AA : Cancel", textX, textY);
        ctx.globalAlpha = 1;
    } else {
        ctx.fillStyle = "#fff";
        ctx.fillText(
            isDoingAA ? "AA: READY" : `AA: ${player.aaTimer.toFixed(2)}s / ${player.aaSpeed}s`,
            textX, textY
        );
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

    const spellNames = Object.keys(player.sprites).filter(n => n.startsWith("Spell"));

    spellNames.forEach((name, i) => {
        const spell = player.sprites[name];
        if (!spell) return;

        const ix = x + i * (iconSize + iconSpacing);
        const iy = startY;

        const ratio      = (!spell.lock && spell.cooldown) ? player.spellTimers[name] / spell.cooldown : 0;
        const isReady    = ratio >= 1;
        const isUltimate = name === "Spell4";

        if (isReady && isUltimate) { ctx.save(); ctx.shadowColor = "#ffd700"; ctx.shadowBlur = 20; }

        // Fond
        ctx.fillStyle = isReady ? "#ffd700" : "#333";
        ctx.fillRect(ix, iy, iconSize, iconSize);

        // Barre de cooldown
        if (!spell.lock && spell.cooldown) {
            ctx.fillStyle = isReady ? "#ffea00" : "#3498db";
            ctx.fillRect(ix, iy + iconSize - iconSize * ratio, iconSize, iconSize * ratio);
        }

        // Contenu
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

        // Bordure
        ctx.strokeStyle = spell.lock ? "#666" : isReady ? "#ffd700" : "#555";
        ctx.lineWidth = 2;
        ctx.strokeRect(ix, iy, iconSize, iconSize);

        if (isReady && isUltimate) ctx.restore();

        // Lettre sous l'icône si prêt
        if (isReady && !spell.lock) {
            ctx.fillStyle = "#fff"; ctx.font = "bold 12px Arial";
            ctx.textAlign = "center"; ctx.textBaseline = "top";
            ctx.fillText(keys[i] ?? name, ix + iconSize / 2, iy + iconSize + 5);
        }
    });
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
// LOGIQUE : FIN DE COMBAT
// ================================

// Appelé dès qu'une entité tombe à 0 HP
function triggerEject(loser) {
    if (gameState !== "playing") return;
    gameState   = "ejecting";
    ejectEntity = loser;
    ejectTimer  = 0;
    resultWin   = (loser === enemy);

    // Le perdant est éjecté dans la direction opposée au vainqueur
    // Joueur (gauche) → éjecté vers la gauche (-1)
    // Ennemi (droite) → éjecté vers la droite (+1)
    ejectDir = (loser === player) ? -1 : 1;
}

// Mise à jour de l'éjection (appelée dans la game loop)
function updateEject(deltaTime) {
    if (gameState !== "ejecting") return;

    ejectEntity.x += ejectDir * EJECT_SPEED * deltaTime;
    ejectTimer    += deltaTime;

    if (ejectTimer >= EJECT_DELAY) {
        gameState = "result";
        if (_fromMap === "map_aventure" && resultWin) {
            const saved = parseInt(localStorage.getItem("vspell_aventure_progress") || "0", 10);
            if (_arenaId > saved) localStorage.setItem("vspell_aventure_progress", _arenaId);
        }
    }
}

// ================================
// DRAW : ÉCRAN DE RÉSULTAT
// ================================
function drawResult() {
    // Fond semi-transparent
    ctx.fillStyle = "rgba(0, 0, 0, 0.72)";
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    const cx = GAME_WIDTH  / 2;
    const cy = GAME_HEIGHT / 2;

    // Titre VICTOIRE / DÉFAITE
    const title    = resultWin ? "VICTOIRE" : "DÉFAITE";
    const titleCol = resultWin ? "#f0c040"  : "#e74c3c";

    ctx.save();
    ctx.textAlign    = "center";
    ctx.textBaseline = "middle";
    ctx.shadowBlur   = 40;
    ctx.shadowColor  = titleCol;
    ctx.fillStyle    = titleCol;
    ctx.font         = "bold 72px Arial";
    ctx.fillText(title, cx, cy - 60);
    ctx.restore();

    // Sous-titre
    ctx.textAlign    = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle    = "rgba(255,255,255,0.55)";
    ctx.font         = "18px Arial";
    ctx.fillText(
        resultWin ? "L'ennemi a été vaincu !" : "Vous avez été vaincu...",
        cx, cy - 10
    );

    // Boutons : Rejouer / Carte
    drawResultButton("Rejouer",       cx - 110, cy + 50, 180, 44, "#c9a84c", "#1a0e00", () => {
        window.location.href = window.location.href; // recharge la page
    });
    drawResultButton("Carte",         cx + 110, cy + 50, 180, 44, "#333",    "#fff",    () => {
        window.location.href = _fromMap === "map_aventure" ? "aventure.html" : "map_arene.html";
    });
}

// Dessine un bouton cliquable sur le canvas résultat
// Les boutons sont enregistrés pour la détection du clic
const _resultButtons = [];

function drawResultButton(label, cx, cy, w, h, bg, fg, onClick) {
    const x = cx - w / 2;
    const y = cy - h / 2;
    const r = 6;

    // Fond arrondi
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    ctx.fillStyle = bg;
    ctx.fill();

    // Texte
    ctx.fillStyle    = fg;
    ctx.font         = "bold 16px Arial";
    ctx.textAlign    = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(label, cx, cy);

    // Enregistre la zone cliquable
    _resultButtons.push({ x, y, w, h, onClick });
}

// Détection des clics sur les boutons résultat
canvas.addEventListener("click", (e) => {
    if (gameState !== "result") return;

    const scaleX = GAME_WIDTH  / canvas.width;
    const scaleY = GAME_HEIGHT / canvas.height;
    const rect   = canvas.getBoundingClientRect();
    const gameX  = (e.clientX - rect.left) * (canvas.width  / rect.width)  * scaleX;
    const gameY  = (e.clientY - rect.top)  * (canvas.height / rect.height) * scaleY;

    for (const btn of _resultButtons) {
        if (gameX >= btn.x && gameX <= btn.x + btn.w &&
            gameY >= btn.y && gameY <= btn.y + btn.h) {
            btn.onClick();
            break;
        }
    }
});

// ================================
// GAME LOOP
// ================================
let lastTime = 0;

function gameLoop(timestamp) {
    const deltaTime = Math.min((timestamp - lastTime) / 1000, 0.1);
    lastTime = timestamp;

    ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    if (backgroundImage.complete) ctx.drawImage(backgroundImage, 0, 0, GAME_WIDTH, GAME_HEIGHT);

    if (gameState === "playing") {
        // --- Joueur ---
        if (player.aaCancelled) {
            player.aaCancelTimer -= deltaTime;
            if (player.aaCancelTimer <= 0) player.aaCancelled = false;
        }
        updateAutoAttack(deltaTime);
        updateSpellTimers(deltaTime);

        // --- Ennemi ---
        updateEnemyAI(deltaTime);
    }

    if (gameState === "ejecting") {
        updateEject(deltaTime);
    }

    // Toujours dessiner les entités (sauf le perdant éjecté hors écran)
    const playerVisible = !(gameState === "ejecting" && ejectEntity === player && ejectEntity.x < -200);
    const enemyVisible  = !(gameState === "ejecting" && ejectEntity === enemy  && ejectEntity.x > GAME_WIDTH + 200);

    if (playerVisible) drawEntity(player, gameState === "playing" ? deltaTime : 0);
    if (enemyVisible)  drawEntity(enemy,  gameState === "playing" ? deltaTime : 0);

    // HUD (masqué en résultat)
    if (gameState !== "result") {
        drawHealthHUD(player);
        drawAATimer();
        drawSpellIcons();
        drawHealthHUD(enemy, true);
        drawDamageTexts(deltaTime);
    }

    // Écran de résultat
    if (gameState === "result") {
        _resultButtons.length = 0; // reset boutons à chaque frame
        drawResult();
    }

    requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);