// ================================
// CONFIGURATION
// ================================
const MAP_WIDTH  = 800;
const MAP_HEIGHT = 450;
const CONTAINER_PADDING = 40;
const STORAGE_KEY = "vspell_aventure_progress";

// ================================
// CANVAS
// ================================
const canvas = document.getElementById("mapCanvas");
const ctx    = canvas.getContext("2d");

let scale = 1;

function resizeCanvas() {
    scale = Math.min(
        (window.innerWidth  - CONTAINER_PADDING) / MAP_WIDTH,
        (window.innerHeight - CONTAINER_PADDING) / MAP_HEIGHT
    );
    canvas.width  = Math.floor(MAP_WIDTH  * scale);
    canvas.height = Math.floor(MAP_HEIGHT * scale);
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// ================================
// PROGRESSION (localStorage)
// ================================
let completedStage = parseInt(localStorage.getItem(STORAGE_KEY) || "0", 10);

// ================================
// ASSETS
// ================================
const mapBackground = new Image();
mapBackground.src = "asset/img/map/map_arene_neant.png";

// ================================
// STAGES — lus depuis map_data.js (AVENTURE_CONFIG)
// ================================
const stages = Object.entries(AVENTURE_CONFIG).map(([id, cfg]) => ({
    id:   Number(id),
    name: cfg.name,
    x:    cfg.x,
    y:    cfg.y,
}));

// ================================
// CONSTANTES VISUELLES
// ================================
const POINT_RADIUS = 16;
const PULSE_MAX    = 26;
const TOOLTIP_PAD  = 8;

// ================================
// ÉTAT
// ================================
let hoveredStage = null;
let pulseTimer   = 0;

// ================================
// UTILITAIRE
// ================================
function getStageStatus(id) {
    if (id <= completedStage) return "completed";
    if (id === completedStage + 1) return "available";
    return "locked";
}

// ================================
// MOUSE
// ================================
canvas.addEventListener("mousemove", (e) => {
    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) / scale;
    const my = (e.clientY - rect.top)  / scale;

    hoveredStage = null;
    for (const stage of stages) {
        if (getStageStatus(stage.id) === "locked") continue;
        const dx = mx - stage.x;
        const dy = my - stage.y;
        if (Math.sqrt(dx * dx + dy * dy) <= POINT_RADIUS + 6) {
            hoveredStage = stage;
            break;
        }
    }

    canvas.style.cursor = hoveredStage ? "pointer" : "default";
});

canvas.addEventListener("click", (e) => {
    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) / scale;
    const my = (e.clientY - rect.top)  / scale;

    for (const stage of stages) {
        if (getStageStatus(stage.id) === "locked") continue;
        const dx = mx - stage.x;
        const dy = my - stage.y;
        if (Math.sqrt(dx * dx + dy * dy) <= POINT_RADIUS + 6) {
            window.location.href = `character_select.html?arena=${stage.id}&from=map_aventure`;
            return;
        }
    }
});

// ================================
// DRAW : FOND
// ================================
function drawBackground() {
    if (mapBackground.complete && mapBackground.naturalWidth !== 0) {
        ctx.drawImage(mapBackground, 0, 0, MAP_WIDTH, MAP_HEIGHT);
    } else {
        ctx.fillStyle = "#0a0a1a";
        ctx.fillRect(0, 0, MAP_WIDTH, MAP_HEIGHT);
    }
    ctx.fillStyle = "rgba(0,0,0,0.42)";
    ctx.fillRect(0, 0, MAP_WIDTH, MAP_HEIGHT);
}

// ================================
// UTILITAIRE DESSIN
// ================================
function roundRect(c, x, y, w, h, r) {
    c.beginPath();
    c.moveTo(x + r, y);
    c.lineTo(x + w - r, y);
    c.quadraticCurveTo(x + w, y, x + w, y + r);
    c.lineTo(x + w, y + h - r);
    c.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    c.lineTo(x + r, y + h);
    c.quadraticCurveTo(x, y + h, x, y + h - r);
    c.lineTo(x, y + r);
    c.quadraticCurveTo(x, y, x + r, y);
    c.closePath();
}

// ================================
// DRAW : CHEMIN
// ================================
function drawPath() {
    if (stages.length < 2) return;
    ctx.lineCap  = "round";
    ctx.lineJoin = "round";

    for (let i = 0; i < stages.length - 1; i++) {
        const a = stages[i];
        const b = stages[i + 1];
        const statusA = getStageStatus(a.id);

        // Trait de fond épais
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = "rgba(0,0,0,0.65)";
        ctx.lineWidth = 10;
        ctx.setLineDash([]);
        ctx.stroke();

        // Trait principal
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        if (statusA === "completed") {
            ctx.strokeStyle = "#c9a84c";
            ctx.lineWidth   = 4;
            ctx.setLineDash([]);
        } else {
            ctx.strokeStyle = "rgba(255,255,255,0.18)";
            ctx.lineWidth   = 3;
            ctx.setLineDash([10, 8]);
        }
        ctx.stroke();
    }
    ctx.setLineDash([]);
}

// ================================
// DRAW : STAGES
// ================================
function drawStages(deltaTime) {
    pulseTimer = (pulseTimer + deltaTime * 0.8) % 1;

    for (const stage of stages) {
        const status    = getStageStatus(stage.id);
        const isHovered = hoveredStage === stage;

        // Anneau pulsant (stage disponible uniquement)
        if (status === "available") {
            const pulseR     = POINT_RADIUS + pulseTimer * (PULSE_MAX - POINT_RADIUS);
            const pulseAlpha = (1 - pulseTimer) * 0.45;
            ctx.beginPath();
            ctx.arc(stage.x, stage.y, pulseR, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(201,168,76,${pulseAlpha})`;
            ctx.lineWidth = 2;
            ctx.stroke();
        }

        // Couleurs selon statut
        let fillColor, borderColor, shadowColor, shadowBlur;
        if (status === "completed") {
            fillColor   = "#c9a84c";
            borderColor = "#f0c040";
            shadowColor = "#c9a84c";
            shadowBlur  = 12;
        } else if (status === "available") {
            fillColor   = isHovered ? "#ff6b6b" : "#e74c3c";
            borderColor = "#fff";
            shadowColor = isHovered ? "#ff6b6b" : "#e74c3c";
            shadowBlur  = isHovered ? 22 : 14;
        } else {
            fillColor   = "#2a2a2a";
            borderColor = "#444";
            shadowColor = "transparent";
            shadowBlur  = 0;
        }

        ctx.shadowColor = shadowColor;
        ctx.shadowBlur  = shadowBlur;

        ctx.beginPath();
        ctx.arc(stage.x, stage.y, POINT_RADIUS, 0, Math.PI * 2);
        ctx.fillStyle = fillColor;
        ctx.fill();

        ctx.shadowBlur  = 0;
        ctx.strokeStyle = borderColor;
        ctx.lineWidth   = 2;
        ctx.stroke();

        // Icône / label interne
        ctx.font         = "bold 12px Arial";
        ctx.textAlign    = "center";
        ctx.textBaseline = "middle";
        if (status === "locked") {
            ctx.fillStyle = "#555";
            ctx.fillText("?", stage.x, stage.y);
        } else if (status === "completed") {
            ctx.fillStyle = "#fff";
            ctx.fillText("✓", stage.x, stage.y);
        } else {
            ctx.fillStyle = "#fff";
            ctx.fillText(stage.id, stage.x, stage.y);
        }

        // Nom du stage sous le nœud
        ctx.fillStyle    = status === "locked" ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.88)";
        ctx.font         = "bold 11px Arial";
        ctx.textAlign    = "center";
        ctx.textBaseline = "top";
        ctx.fillText(stage.name, stage.x, stage.y + POINT_RADIUS + 6);

        if (isHovered) drawTooltip(stage);
    }
}

// ================================
// DRAW : TOOLTIP
// ================================
function drawTooltip(stage) {
    const status  = getStageStatus(stage.id);
    const label   = stage.name;
    const subtext = status === "completed" ? "Rejouer ce stage" : "Commencer l'aventure";

    ctx.font = "bold 13px Arial";
    const labelW = ctx.measureText(label).width;
    ctx.font = "11px Arial";
    const subW   = ctx.measureText(subtext).width;

    const boxW = Math.max(labelW, subW) + TOOLTIP_PAD * 2;
    const boxH = 38;

    let tx = stage.x - boxW / 2;
    let ty = stage.y - POINT_RADIUS - boxH - 8;
    tx = Math.max(4, Math.min(MAP_WIDTH - boxW - 4, tx));
    ty = Math.max(4, ty);

    ctx.fillStyle = "rgba(0,0,0,0.82)";
    roundRect(ctx, tx, ty, boxW, boxH, 6);
    ctx.fill();

    ctx.strokeStyle = "#c9a84c";
    ctx.lineWidth   = 1.5;
    roundRect(ctx, tx, ty, boxW, boxH, 6);
    ctx.stroke();

    ctx.fillStyle    = "#fff";
    ctx.font         = "bold 13px Arial";
    ctx.textAlign    = "center";
    ctx.textBaseline = "top";
    ctx.fillText(label, tx + boxW / 2, ty + TOOLTIP_PAD - 1);

    ctx.fillStyle = "#aaa";
    ctx.font      = "11px Arial";
    ctx.fillText(subtext, tx + boxW / 2, ty + TOOLTIP_PAD + 14);
}

// ================================
// DRAW : TITRE
// ================================
function drawTitle() {
    ctx.fillStyle = "rgba(0,0,0,0.6)";
    roundRect(ctx, MAP_WIDTH / 2 - 130, 8, 260, 38, 6);
    ctx.fill();

    ctx.fillStyle    = "#f0c040";
    ctx.font         = "bold 17px Arial";
    ctx.textAlign    = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("❖  Mode Aventure  ❖", MAP_WIDTH / 2, 27);
}

// ================================
// DRAW : BARRE DE PROGRESSION
// ================================
function drawProgressBar() {
    const total = stages.length;
    const barW  = 220;
    const barH  = 10;
    const bx    = MAP_WIDTH / 2 - barW / 2;
    const by    = MAP_HEIGHT - 28;

    ctx.fillStyle    = "rgba(255,255,255,0.5)";
    ctx.font         = "11px Arial";
    ctx.textAlign    = "center";
    ctx.textBaseline = "bottom";
    ctx.fillText(`Progression : ${completedStage} / ${total}`, MAP_WIDTH / 2, by - 4);

    ctx.fillStyle = "rgba(0,0,0,0.5)";
    roundRect(ctx, bx - 1, by - 1, barW + 2, barH + 2, 5);
    ctx.fill();

    if (completedStage > 0) {
        const ratio = completedStage / total;
        const grad  = ctx.createLinearGradient(bx, 0, bx + barW, 0);
        grad.addColorStop(0, "#c9a84c");
        grad.addColorStop(1, "#f0c040");
        ctx.fillStyle = grad;
        roundRect(ctx, bx, by, barW * ratio, barH, 4);
        ctx.fill();
    }
}

// ================================
// GAME LOOP
// ================================
let lastTime = 0;

function mapLoop(timestamp) {
    const deltaTime = Math.min((timestamp - lastTime) / 1000, 0.1);
    lastTime = timestamp;

    ctx.clearRect(0, 0, MAP_WIDTH, MAP_HEIGHT);
    drawBackground();
    drawPath();
    drawStages(deltaTime);
    drawTitle();
    drawProgressBar();

    requestAnimationFrame(mapLoop);
}

requestAnimationFrame(mapLoop);
