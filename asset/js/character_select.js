const params      = new URLSearchParams(window.location.search);
const arenaId     = Number(params.get("arena")) || 1;
const fromMap     = params.get("from") || "map_arene"; // page d'origine

// Cherche dans la bonne config selon le mode
const arenaConfig = fromMap === "map_mission"
    ? MISSION_CONFIG[arenaId]
    : fromMap === "map_aventure"
        ? AVENTURE_CONFIG[arenaId]
        : ARENAS_CONFIG[arenaId];

// Texte du bouton selon le mode
const btnFight = document.getElementById("btn-fight");
if (fromMap === "map_mission") {
    btnFight.innerHTML = "⚔ &nbsp;Commencer la mission";
} else if (fromMap === "map_aventure") {
    btnFight.innerHTML = "⚔ &nbsp;Commencer l'aventure";
}

document.getElementById("arena-label").textContent =
    arenaConfig
        ? (fromMap === "map_aventure"
            ? `Étape ${arenaId} — ${arenaConfig.name}`
            : `Arène ${arenaId} — ${arenaConfig.name}`)
        : "Arène inconnue";

// ── Chargement des frames idle d'un personnage ──────────────
function loadIdleFrames(charConfig) {
    const idle = charConfig.sprites?.idle;
    if (!idle || !idle.path || !idle.count) return Promise.resolve([]);

    return Promise.all(
        Array.from({ length: idle.count }, (_, i) =>
            new Promise(resolve => {
                const img   = new Image();
                img.onload  = () => resolve(img);
                img.onerror = () => resolve(null);
                img.src     = idle.path.replace("{i}", i + 1);
            })
        )
    );
}

// ── Animation idle sur un canvas ───────────────────────────
// Centre et met à l'échelle le sprite dans un carré DISPLAY×DISPLAY px
function animateIdle(canvas, frames, spriteW, spriteH, frameTime) {
    const ctx     = canvas.getContext("2d");
    const DISPLAY = 120;
    canvas.width  = DISPLAY;
    canvas.height = DISPLAY;

    const scale = Math.min(DISPLAY / spriteW, DISPLAY / spriteH);
    const drawW = Math.floor(spriteW * scale);
    const drawH = Math.floor(spriteH * scale);
    const offX  = Math.floor((DISPLAY - drawW) / 2);
    const offY  = Math.floor((DISPLAY - drawH) / 2);

    let frameIndex = 0;
    let elapsed    = 0;
    let lastTS     = null;

    function tick(timestamp) {
        if (lastTS !== null) {
            elapsed += (timestamp - lastTS) / 1000;
            if (elapsed >= frameTime) {
                elapsed   -= frameTime;
                frameIndex = (frameIndex + 1) % frames.length;
            }
        }
        lastTS = timestamp;

        ctx.clearRect(0, 0, DISPLAY, DISPLAY);
        const frame = frames[frameIndex];
        if (frame) ctx.drawImage(frame, offX, offY, drawW, drawH);

        requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
}

// ── Génération des cartes ───────────────────────────────────
const container    = document.getElementById("characters");
let selectedCharId = null;

for (const [charId, getChar] of Object.entries(CHARACTERS_REGISTRY)) {
    const char = getChar();
    const idle = char.sprites?.idle;

    const card      = document.createElement("div");
    card.className  = "char-card";
    card.dataset.id = charId;

    // <canvas> remplace le <img>
    const cvs     = document.createElement("canvas");
    cvs.className = "char-canvas";

    const label         = document.createElement("div");
    label.className     = "char-name";
    label.textContent   = char.name;

    card.appendChild(cvs);
    card.appendChild(label);

    card.addEventListener("click", () => {
        document.querySelectorAll(".char-card").forEach(c => c.classList.remove("selected"));
        card.classList.add("selected");
        selectedCharId = charId;
        btnFight.classList.add("active");
    });

    container.appendChild(card);

    // Chargement asynchrone → animation dès que les frames sont prêtes
    loadIdleFrames(char).then(frames => {
        const valid = frames.filter(Boolean);
        if (!valid.length || !idle) return;
        animateIdle(cvs, valid, idle.width, idle.height, idle.frameTime ?? 0.12);
    });
}

btnFight.addEventListener("click", () => {
    if (!selectedCharId || !arenaConfig) return;
    if (fromMap === "map_mission") {
        window.location.href =
            `roundForet.html?arena=${arenaId}&player=${selectedCharId}&bg=${arenaConfig.bg}&from=${fromMap}`;
    } else {
        window.location.href =
            `fight_arene.html?arena=${arenaId}&player=${selectedCharId}&bg=${arenaConfig.bg}&from=${fromMap}`;
    }
});

document.getElementById("btn-back").addEventListener("click", () => {
    window.location.href = `${fromMap}.html`;
});