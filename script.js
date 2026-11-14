
/* ============================================
   CUSTOMIZATION AND ADJUSTMENT — JAVASCRIPT
   Modify the values below to customize
   images, positions, sizes, and gameplay.
   ============================================ */

const CONFIG = {

    // A. IMAGE ASSETS
    assets: {

        // Replace these paths with your PNG files.
        runner: "assets/runner.png",
        obstacle1: "assets/obstacle1.png",
        obstacle2: "assets/obstacle2.png",
        background: "assets/background.png",
        doodad1: "assets/doodad1.png",
        doodad2: "assets/doodad2.png"

    },


    // B. RUNNER
    runner: {

        // Horizontal position of the runner.
        x: 125,

        // Vertical adjustment relative to the ground.
        yOffset: 0,

        // Maximum displayed image dimensions.
        maxWidth: 130,
        maxHeight: 160,

        // Image positioning adjustments.
        imageOffsetX: 0,
        imageOffsetY: 20,

        // Jumping physics.
        jumpStrength: 800,
        gravity: 2500,

        // Collision area adjustments.
        hitboxPaddingX: 50,
        hitboxPaddingY: 50

    },


    // C. OBSTACLE 1
    obstacle1: {

        maxWidth: 120,
        maxHeight: 140,

        imageOffsetX: 0,
        imageOffsetY: 30,

        groundOffset: 0,

        hitboxPaddingX: 50,
        hitboxPaddingY: 50

    },      


    // D. OBSTACLE 2
    obstacle2: {

        maxWidth: 120,
        maxHeight: 100,

        imageOffsetX: 0,
        imageOffsetY: 20,

        groundOffset: 0,

        hitboxPaddingX: 18,
        hitboxPaddingY: 16

    },


    // E. BACKGROUND
    background: {

        offsetX: 0,
        offsetY: 0,

        scale: 1,

        // Background movement multiplier.
        scrollSpeed: 0.18,

        // Used when no background image is available.
        fallbackColor: "#a9cc87",

        // Supported values: "center", "top", "bottom".
        alignment: "center"

    },


    // F. DOODAD 1
    doodad1: {

        // Initial horizontal position.
        x: 180,

        // Vertical position.
        y: 35,

        maxWidth: 62,
        maxHeight: 55,

        imageOffsetX: 0,
        imageOffsetY: 0,

        // Repeat the decorative element.
        repeat: true,

        // Horizontal distance between instances.
        spacing: 620,

        // Slow movement for distant scenery.
        scrollSpeed: 0.25

    },


    // G. DOODAD 2
    doodad2: {

        x: 330,
        y: 105,

        maxWidth: 48,
        maxHeight: 38,

        imageOffsetX: 0,
        imageOffsetY: 0,

        repeat: true,

        spacing: 390,

        // Faster movement than the first doodad.
        scrollSpeed: 0.55

    },


    // H. GAMEPLAY
    gameplay: {

        startingSpeed: 330,

        maxSpeed: 690,

        // Speed increase per second.
        difficultyIncrease: 8,

        // Minimum obstacle spacing.
        minObstacleSpacing: 350,

        // Maximum obstacle spacing.
        maxObstacleSpacing: 540

    },


    // I. DEBUG — HITBOX VISUALIZATION
    debug: {

        showHitboxes: false,

        runnerHitboxColor: "#00FF00",

        obstacleHitboxColor: "#FF0000",

        hitboxLineWidth: 2

    }

};


/* ============================================
   END OF CUSTOMIZATION AND ADJUSTMENT
   GAME LOGIC BELOW
   ============================================ */


/* ============================================
   1. HTML ELEMENTS AND CANVAS
   ============================================ */

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const scoreDisplay = document.getElementById("scoreDisplay");
const highScoreDisplay = document.getElementById("highScoreDisplay");

const gameOverlay = document.getElementById("gameOverlay");
const overlayTitle = document.getElementById("overlayTitle");
const overlayMessage = document.getElementById("overlayMessage");

const startButton = document.getElementById("startButton");
const assetStatus = document.getElementById("assetStatus");

const gameTitle = document.getElementById("gameTitle");
const gameDescription = document.getElementById("gameDescription");
const gameInstructions = document.getElementById("gameInstructions");


/* ============================================
   2. CANVAS SETTINGS
   ============================================ */

const GAME_WIDTH = 960;
const GAME_HEIGHT = 450;

const GROUND_Y = 390;

canvas.width = GAME_WIDTH;
canvas.height = GAME_HEIGHT;


/* ============================================
   3. GAME STATE
   ============================================ */

let gameState = "ready";

let score = 0;
let highScore = 0;

let gameSpeed = CONFIG.gameplay.startingSpeed;

let animationFrameId = null;
let previousTime = 0;

let worldDistance = 0;

let obstacleTimer = 0;
let nextObstacleDistance = 450;

let assetLoadCount = 0;
let assetTotal = 6;


/* ============================================
   4. STORAGE
   ============================================ */

const STORAGE_KEY = "forestRunnerHighScore";

function loadHighScore() {

    try {

        const savedScore = localStorage.getItem(STORAGE_KEY);

        const parsedScore = Number(savedScore);

        highScore = Number.isFinite(parsedScore) && parsedScore >= 0
            ? parsedScore
            : 0;

    } catch (error) {

        highScore = 0;

        console.warn("High score storage is unavailable.");

    }

    updateScoreDisplay();

}


function saveHighScore() {

    try {

        localStorage.setItem(STORAGE_KEY, String(highScore));

    } catch (error) {

        console.warn("Unable to save high score.");

    }

}


/* ============================================
   5. SCORE DISPLAY
   ============================================ */

function updateScoreDisplay() {

    scoreDisplay.textContent = Math.floor(score);

    highScoreDisplay.textContent = Math.floor(highScore);

}


/* ============================================
   6. IMAGE LOADING
   ============================================ */

const images = {

    runner: null,
    obstacle1: null,
    obstacle2: null,
    background: null,
    doodad1: null,
    doodad2: null

};

const imageLoaded = {

    runner: false,
    obstacle1: false,
    obstacle2: false,
    background: false,
    doodad1: false,
    doodad2: false

};


function loadImages() {

    Object.keys(CONFIG.assets).forEach(function (key) {

        const image = new Image();

        images[key] = image;

        image.onload = function () {

            imageLoaded[key] = true;

            updateAssetStatus();

        };

        image.onerror = function () {

            imageLoaded[key] = false;

            updateAssetStatus();

        };

        image.src = CONFIG.assets[key];

    });

}


function updateAssetStatus() {

    assetLoadCount++;

    const loadedCount = Object.values(imageLoaded).filter(Boolean).length;

    const failedCount = Object.keys(imageLoaded).length - loadedCount;

    if (assetLoadCount >= assetTotal) {

        if (failedCount === 0) {

            assetStatus.textContent = "All PNG assets loaded successfully.";

        } else {

            assetStatus.textContent =
                "Using Canvas fallback graphics for missing assets.";

        }

    }

}


/* ============================================
   7. IMAGE DIMENSION CALCULATION
   ============================================ */

// Preserve the original image aspect ratio.

function getImageDimensions(image, maxWidth, maxHeight) {

    if (!image || !image.complete || !image.naturalWidth) {

        return {
            width: maxWidth,
            height: maxHeight
        };

    }

    const ratio = Math.min(
        maxWidth / image.naturalWidth,
        maxHeight / image.naturalHeight
    );

    return {

        width: image.naturalWidth * ratio,

        height: image.naturalHeight * ratio

    };

}


/* ============================================
   8. RUNNER OBJECT
   ============================================ */

const runner = {

    x: CONFIG.runner.x,

    y: GROUND_Y,

    velocityY: 0,

    width: CONFIG.runner.maxWidth,

    height: CONFIG.runner.maxHeight,

    grounded: true,

    animationTime: 0

};


function updateRunnerDimensions() {

    const dimensions = getImageDimensions(
        imageLoaded.runner ? images.runner : null,
        CONFIG.runner.maxWidth,
        CONFIG.runner.maxHeight
    );

    runner.width = dimensions.width;
    runner.height = dimensions.height;

}


/* ============================================
   9. OBSTACLE MANAGEMENT
   ============================================ */

let obstacles = [];


function createObstacle(type, x) {

    const settings = CONFIG[type];

    const image = imageLoaded[type] ? images[type] : null;

    const dimensions = getImageDimensions(
        image,
        settings.maxWidth,
        settings.maxHeight
    );

    return {

        type: type,

        x: x,

        y: GROUND_Y - settings.groundOffset,

        width: dimensions.width,

        height: dimensions.height,

        passed: false

    };

}


function generateObstacle() {

    const type = Math.random() < 0.5
        ? "obstacle1"
        : "obstacle2";

    const lastObstacle = obstacles[obstacles.length - 1];

    const randomSpacing =
        CONFIG.gameplay.minObstacleSpacing +
        Math.random() * (
            CONFIG.gameplay.maxObstacleSpacing -
            CONFIG.gameplay.minObstacleSpacing
        );

    const x = lastObstacle
        ? Math.max(GAME_WIDTH + 20, lastObstacle.x + lastObstacle.width + randomSpacing)
        : GAME_WIDTH + 20;

    obstacles.push(createObstacle(type, x));

}


/* ============================================
   10. COLLISION RECTANGLES
   ============================================ */

// The same functions are used by collision
// detection and optional hitbox visualization.

function getRunnerHitbox() {

    const paddingX = CONFIG.runner.hitboxPaddingX;
    const paddingY = CONFIG.runner.hitboxPaddingY;

    const x = runner.x -
        runner.width / 2 +
        CONFIG.runner.imageOffsetX +
        paddingX;

    const y = runner.y -
        runner.height +
        CONFIG.runner.imageOffsetY +
        paddingY;

    return {
        x: x,
        y: y,
        width: Math.max(0, runner.width - paddingX * 2),
        height: Math.max(0, runner.height - paddingY * 2)
    };

}


function getObstacleHitbox(obstacle) {

    const settings = CONFIG[obstacle.type];

    const paddingX = settings.hitboxPaddingX;
    const paddingY = settings.hitboxPaddingY;

    const x = obstacle.x -
        obstacle.width / 2 +
        settings.imageOffsetX +
        paddingX;

    const y = obstacle.y -
        obstacle.height +
        settings.imageOffsetY +
        paddingY;

    return {

        x: x,

        y: y,

        width: Math.max(0, obstacle.width - paddingX * 2),

        height: Math.max(0, obstacle.height - paddingY * 2)

    };

}


function checkCollision(rect1, rect2) {

    return (

        rect1.x < rect2.x + rect2.width &&

        rect1.x + rect1.width > rect2.x &&

        rect1.y < rect2.y + rect2.height &&

        rect1.y + rect1.height > rect2.y

    );

}


/* ============================================
   11. RUNNER JUMPING
   ============================================ */

function jump() {

    if (gameState === "ready") {

        startGame();

        return;

    }

    if (gameState !== "playing") {

        return;

    }

    // Prevent double jumping.

    if (runner.grounded) {

        runner.velocityY = -CONFIG.runner.jumpStrength;

        runner.grounded = false;

    }

}


function updateRunner(deltaTime) {

    if (gameState !== "playing") {

        return;

    }

    runner.animationTime += deltaTime;

    // Apply gravity.

    runner.velocityY += CONFIG.runner.gravity * deltaTime;

    // Update vertical position.

    runner.y += runner.velocityY * deltaTime;

    const groundPosition = GROUND_Y - CONFIG.runner.yOffset;

    // Prevent the runner from falling through the ground.

    if (runner.y >= groundPosition) {

        runner.y = groundPosition;

        runner.velocityY = 0;

        runner.grounded = true;

    }

}


/* ============================================
   12. BACKGROUND RENDERING
   ============================================ */

let backgroundDistance = 0;


function drawBackgroundFallback() {

    ctx.fillStyle = CONFIG.background.fallbackColor;
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    const hillOffset = backgroundDistance % 250;
    const treeOffset = backgroundDistance % 220;
    const groundOffset = backgroundDistance % 29;

    // Distant hills.

    for (let i = -1; i < 6; i++) {

        const x = i * 250 - hillOffset;

        ctx.fillStyle = "#91b978";

        ctx.beginPath();
        ctx.arc(x + 125, 230, 150, Math.PI, 0);
        ctx.fill();

    }

    // Repeating trees.

    for (let i = -1; i < 7; i++) {

        const x = i * 220 - treeOffset;

        ctx.fillStyle = "#79502e";
        ctx.fillRect(x + 35, 100, 35, 200);

        ctx.fillStyle = "#376d37";

        ctx.beginPath();
        ctx.arc(x + 52, 105, 76, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#548b43";

        ctx.beginPath();
        ctx.arc(x + 12, 140, 43, 0, Math.PI * 2);
        ctx.arc(x + 92, 140, 43, 0, Math.PI * 2);
        ctx.fill();

    }

    // Ground.

    ctx.fillStyle = "#75502f";
    ctx.fillRect(0, GROUND_Y, GAME_WIDTH, GAME_HEIGHT - GROUND_Y);

    ctx.fillStyle = "#568b39";
    ctx.fillRect(0, GROUND_Y, GAME_WIDTH, 13);

    // Repeating grass details.

    ctx.fillStyle = "#a1c96c";

    for (let i = -1; i < 35; i++) {

        const x = i * 29 - groundOffset;

        ctx.fillRect(
            x,
            GROUND_Y + 15,
            3,
            7
        );

    }

}

function drawBackgroundImage() {

    const image = images.background;

    const scale = CONFIG.background.scale;

    const scaledWidth = GAME_WIDTH * scale;
    const scaledHeight = GAME_HEIGHT * scale;

    const baseWidth = image.naturalWidth;
    const baseHeight = image.naturalHeight;

    const coverScale = Math.max(
        scaledWidth / baseWidth,
        scaledHeight / baseHeight
    );

    const width = baseWidth * coverScale;
    const height = baseHeight * coverScale;

    let y;

    if (CONFIG.background.alignment === "top") {

        y = 0;

    } else if (CONFIG.background.alignment === "bottom") {

        y = GAME_HEIGHT - height;

    } else {

        y = (GAME_HEIGHT - height) / 2;

    }

    y += CONFIG.background.offsetY;

    const xOffset = CONFIG.background.offsetX;

    const scrollWidth = Math.max(1, width);

    const offset = backgroundDistance % scrollWidth;

    // Draw two copies to avoid visible gaps.

    ctx.drawImage(
        image,
        xOffset - offset,
        y,
        width,
        height
    );

    ctx.drawImage(
        image,
        xOffset - offset + width,
        y,
        width,
        height
    );

    // Draw an additional copy if necessary.

    if (width < GAME_WIDTH) {

        ctx.drawImage(
            image,
            xOffset - offset - width,
            y,
            width,
            height
        );

    }

}


function drawBackground() {

    if (imageLoaded.background) {

        drawBackgroundImage();

    } else {

        drawBackgroundFallback();

    }

}


/* ============================================
   13. DOODAD FALLBACK GRAPHICS
   ============================================ */

// Generic decorative drawing functions.
// The selected theme determines their appearance.

function drawDoodad1Fallback(x, y, width, height) {

    ctx.save();

    const scaleX = width / 62;
    const scaleY = height / 55;

    ctx.translate(x, y);

    ctx.scale(scaleX, scaleY);

    // Owl body.

    ctx.fillStyle = "#8a5837";

    ctx.beginPath();

    ctx.ellipse(31, 32, 19, 21, 0, 0, Math.PI * 2);

    ctx.fill();

    // Head.

    ctx.fillStyle = "#a96d3e";

    ctx.beginPath();

    ctx.arc(31, 16, 18, 0, Math.PI * 2);

    ctx.fill();

    // Ear tufts.

    ctx.beginPath();

    ctx.moveTo(17, 7);
    ctx.lineTo(11, -2);
    ctx.lineTo(25, 4);

    ctx.moveTo(45, 7);
    ctx.lineTo(51, -2);
    ctx.lineTo(37, 4);

    ctx.fill();

    // Eyes.

    ctx.fillStyle = "#fff3ce";

    ctx.beginPath();

    ctx.arc(23, 17, 8, 0, Math.PI * 2);
    ctx.arc(39, 17, 8, 0, Math.PI * 2);

    ctx.fill();

    ctx.fillStyle = "#222222";

    ctx.beginPath();

    ctx.arc(24, 17, 3, 0, Math.PI * 2);
    ctx.arc(38, 17, 3, 0, Math.PI * 2);

    ctx.fill();

    // Beak.

    ctx.fillStyle = "#e6a52f";

    ctx.beginPath();

    ctx.moveTo(31, 23);
    ctx.lineTo(26, 29);
    ctx.lineTo(36, 29);

    ctx.closePath();

    ctx.fill();

    // Wings.

    ctx.fillStyle = "#69452d";

    ctx.beginPath();

    ctx.ellipse(14, 34, 7, 14, -0.2, 0, Math.PI * 2);
    ctx.ellipse(48, 34, 7, 14, 0.2, 0, Math.PI * 2);

    ctx.fill();

    ctx.restore();

}


function drawDoodad2Fallback(x, y, width, height, phase) {

    ctx.save();

    const scaleX = width / 48;
    const scaleY = height / 38;

    ctx.translate(x, y);

    ctx.scale(scaleX, scaleY);

    const flap = Math.sin(phase * 9) * 5;

    // Bat body.

    ctx.fillStyle = "#493b32";

    ctx.beginPath();

    ctx.ellipse(24, 19, 7, 11, 0, 0, Math.PI * 2);

    ctx.fill();

    // Wings.

    ctx.beginPath();

    ctx.moveTo(21, 17);

    ctx.quadraticCurveTo(9, 0 + flap, 0, 5 + flap);

    ctx.lineTo(7, 25);

    ctx.quadraticCurveTo(13, 19, 20, 24);

    ctx.closePath();

    ctx.fill();

    ctx.beginPath();

    ctx.moveTo(27, 17);

    ctx.quadraticCurveTo(39, 0 - flap, 48, 5 - flap);

    ctx.lineTo(41, 25);

    ctx.quadraticCurveTo(35, 19, 28, 24);

    ctx.closePath();

    ctx.fill();

    // Ears.

    ctx.beginPath();

    ctx.moveTo(19, 12);
    ctx.lineTo(16, 3);
    ctx.lineTo(23, 10);

    ctx.moveTo(29, 12);
    ctx.lineTo(32, 3);
    ctx.lineTo(25, 10);

    ctx.fill();

    // Eyes.

    ctx.fillStyle = "#e8d78c";

    ctx.beginPath();

    ctx.arc(21, 17, 1.5, 0, Math.PI * 2);
    ctx.arc(27, 17, 1.5, 0, Math.PI * 2);

    ctx.fill();

    ctx.restore();

}


/* ============================================
   14. DOODAD POSITIONING AND MOVEMENT
   ============================================ */

const doodadOffsets = {

    doodad1: 0,
    doodad2: 0

};


function updateDoodads(deltaTime) {

    if (gameState !== "playing") {

        return;

    }

    doodadOffsets.doodad1 +=
        gameSpeed * CONFIG.doodad1.scrollSpeed * deltaTime;

    doodadOffsets.doodad2 +=
        gameSpeed * CONFIG.doodad2.scrollSpeed * deltaTime;

}


function drawDoodad(key, settings, fallbackFunction) {

    const image = imageLoaded[key] ? images[key] : null;

    const dimensions = getImageDimensions(
        image,
        settings.maxWidth,
        settings.maxHeight
    );

    const width = dimensions.width;
    const height = dimensions.height;

    const offset = doodadOffsets[key];

    const startX = settings.x - offset;

    const positions = [];

    if (settings.repeat) {

        const spacing = settings.spacing > 0
            ? settings.spacing
            : width;

        const tileSpacing = Math.max(width, spacing);

        const firstX = ((startX % tileSpacing) + tileSpacing) % tileSpacing;

        for (
            let x = firstX - tileSpacing;
            x < GAME_WIDTH + tileSpacing;
            x += tileSpacing
        ) {

            positions.push(x);

        }

    } else {

        positions.push(settings.x);

    }

    positions.forEach(function (x) {

        const drawX = x + settings.imageOffsetX;
        const drawY = settings.y + settings.imageOffsetY;

        if (image) {

            ctx.drawImage(
                image,
                drawX,
                drawY,
                width,
                height
            );

        } else {

            fallbackFunction(
                drawX,
                drawY,
                width,
                height,
                worldDistance / 100
            );

        }

    });

}


function drawDoodads() {

    drawDoodad(
        "doodad1",
        CONFIG.doodad1,
        drawDoodad1Fallback
    );

    drawDoodad(
        "doodad2",
        CONFIG.doodad2,
        drawDoodad2Fallback
    );

}


/* ============================================
   15. RUNNER FALLBACK GRAPHIC
   ============================================ */

function drawRunnerFallback(x, y, width, height) {

    ctx.save();

    const scaleX = width / 78;
    const scaleY = height / 92;

    ctx.translate(x, y);

    ctx.scale(scaleX, scaleY);

    // Animated running movement.

    const running = runner.grounded
        ? Math.sin(runner.animationTime * 17) * 5
        : 0;

    // Legs.

    ctx.strokeStyle = "#b77a36";
    ctx.lineWidth = 7;
    ctx.lineCap = "round";

    ctx.beginPath();

    ctx.moveTo(36, 69);
    ctx.lineTo(28 + running, 85);

    ctx.moveTo(43, 69);
    ctx.lineTo(52 - running, 85);

    ctx.stroke();

    // Shoes.

    ctx.fillStyle = "#65432d";

    ctx.beginPath();

    ctx.ellipse(23 + running, 87, 10, 4, 0, 0, Math.PI * 2);
    ctx.ellipse(54 - running, 87, 10, 4, 0, 0, Math.PI * 2);

    ctx.fill();

    // Body.

    ctx.fillStyle = "#4c9b42";

    ctx.beginPath();

    ctx.moveTo(26, 37);
    ctx.lineTo(53, 37);
    ctx.lineTo(58, 70);
    ctx.lineTo(23, 70);

    ctx.closePath();

    ctx.fill();

    // Belt.

    ctx.fillStyle = "#784b2a";

    ctx.fillRect(24, 60, 32, 5);

    // Arms.

    ctx.strokeStyle = "#e5b37b";
    ctx.lineWidth = 7;

    ctx.beginPath();

    ctx.moveTo(27, 42);
    ctx.lineTo(12, 54 - running);

    ctx.moveTo(52, 42);
    ctx.lineTo(66, 53 + running);

    ctx.stroke();

    // Head.

    ctx.fillStyle = "#e5b37b";

    ctx.beginPath();

    ctx.arc(40, 23, 16, 0, Math.PI * 2);

    ctx.fill();

    // Hair.

    ctx.fillStyle = "#70452b";

    ctx.beginPath();

    ctx.arc(40, 16, 16, Math.PI, Math.PI * 2);

    ctx.fill();

    // Green cap.

    ctx.fillStyle = "#28713b";

    ctx.beginPath();

    ctx.moveTo(23, 15);
    ctx.lineTo(37, 2);
    ctx.lineTo(55, 14);
    ctx.lineTo(51, 18);
    ctx.lineTo(28, 18);

    ctx.closePath();

    ctx.fill();

    // Cap feather.

    ctx.strokeStyle = "#d4e78a";
    ctx.lineWidth = 3;

    ctx.beginPath();

    ctx.moveTo(39, 5);
    ctx.quadraticCurveTo(49, -4, 57, 1);

    ctx.stroke();

    // Eye.

    ctx.fillStyle = "#28231d";

    ctx.beginPath();

    ctx.arc(47, 23, 2, 0, Math.PI * 2);

    ctx.fill();

    // Face detail.

    ctx.strokeStyle = "#80502e";
    ctx.lineWidth = 1.5;

    ctx.beginPath();

    ctx.arc(48, 30, 4, 0.2, 1.5);

    ctx.stroke();

    ctx.restore();

}


function drawRunner() {

    const dimensions = getImageDimensions(
        imageLoaded.runner ? images.runner : null,
        CONFIG.runner.maxWidth,
        CONFIG.runner.maxHeight
    );

    runner.width = dimensions.width;
    runner.height = dimensions.height;

    const drawX =
        runner.x -
        runner.width / 2 +
        CONFIG.runner.imageOffsetX;

    const drawY =
        runner.y -
        runner.height +
        CONFIG.runner.yOffset +
        CONFIG.runner.imageOffsetY;

    if (imageLoaded.runner) {

        ctx.drawImage(
            images.runner,
            drawX,
            drawY,
            runner.width,
            runner.height
        );

    } else {

        drawRunnerFallback(
            drawX,
            drawY,
            runner.width,
            runner.height
        );

    }

}


/* ============================================
   16. OBSTACLE FALLBACK GRAPHICS
   ============================================ */

function drawObstacle1Fallback(x, y, width, height) {

    ctx.save();

    const scaleX = width / 76;
    const scaleY = height / 82;

    ctx.translate(x, y);

    ctx.scale(scaleX, scaleY);

    // Body.

    ctx.fillStyle = "#555b50";

    ctx.beginPath();

    ctx.ellipse(38, 55, 30, 26, 0, 0, Math.PI * 2);

    ctx.fill();

    // Head.

    ctx.fillStyle = "#77796c";

    ctx.beginPath();

    ctx.arc(38, 24, 22, 0, Math.PI * 2);

    ctx.fill();

    // Ears.

    ctx.beginPath();

    ctx.arc(17, 23, 8, 0, Math.PI * 2);
    ctx.arc(59, 23, 8, 0, Math.PI * 2);

    ctx.fill();

    // Face.

    ctx.fillStyle = "#b49b7b";

    ctx.beginPath();

    ctx.ellipse(38, 32, 16, 13, 0, 0, Math.PI * 2);

    ctx.fill();

    // Angry eyebrows.

    ctx.strokeStyle = "#25231f";
    ctx.lineWidth = 4;

    ctx.beginPath();

    ctx.moveTo(23, 15);
    ctx.lineTo(34, 20);

    ctx.moveTo(42, 20);
    ctx.lineTo(53, 15);

    ctx.stroke();

    // Eyes.

    ctx.fillStyle = "#e9e2c9";

    ctx.beginPath();

    ctx.arc(30, 25, 4, 0, Math.PI * 2);
    ctx.arc(46, 25, 4, 0, Math.PI * 2);

    ctx.fill();

    ctx.fillStyle = "#a52620";

    ctx.beginPath();

    ctx.arc(31, 25, 2, 0, Math.PI * 2);
    ctx.arc(45, 25, 2, 0, Math.PI * 2);

    ctx.fill();

    // Mouth.

    ctx.strokeStyle = "#34241d";
    ctx.lineWidth = 3;

    ctx.beginPath();

    ctx.moveTo(29, 42);
    ctx.lineTo(47, 42);

    ctx.stroke();

    // Arms.

    ctx.fillStyle = "#555b50";

    ctx.beginPath();

    ctx.ellipse(10, 54, 9, 18, -0.4, 0, Math.PI * 2);
    ctx.ellipse(66, 54, 9, 18, 0.4, 0, Math.PI * 2);

    ctx.fill();

    // Legs.

    ctx.fillStyle = "#393d36";

    ctx.fillRect(23, 72, 12, 10);
    ctx.fillRect(42, 72, 12, 10);

    ctx.restore();

}


function drawObstacle2Fallback(x, y, width, height) {

    ctx.save();

    const scaleX = width / 76;
    const scaleY = height / 53;

    ctx.translate(x, y);

    ctx.scale(scaleX, scaleY);

    // Snake body.

    ctx.strokeStyle = "#478a39";
    ctx.lineWidth = 17;
    ctx.lineCap = "round";

    ctx.beginPath();

    ctx.moveTo(5, 45);
    ctx.bezierCurveTo(16, 10, 30, 55, 45, 34);
    ctx.quadraticCurveTo(58, 16, 62, 19);

    ctx.stroke();

    // Belly.

    ctx.strokeStyle = "#c3c97b";
    ctx.lineWidth = 7;

    ctx.beginPath();

    ctx.moveTo(7, 46);
    ctx.quadraticCurveTo(22, 36, 31, 43);

    ctx.stroke();

    // Head.

    ctx.fillStyle = "#5e9d40";

    ctx.beginPath();

    ctx.ellipse(63, 18, 14, 11, -0.2, 0, Math.PI * 2);

    ctx.fill();

    // Eyes.

    ctx.fillStyle = "#fff4cb";

    ctx.beginPath();

    ctx.arc(66, 12, 4, 0, Math.PI * 2);

    ctx.fill();

    ctx.fillStyle = "#222222";

    ctx.beginPath();

    ctx.arc(67, 12, 2, 0, Math.PI * 2);

    ctx.fill();

    // Tongue.

    ctx.strokeStyle = "#d83d43";
    ctx.lineWidth = 2;

    ctx.beginPath();

    ctx.moveTo(74, 22);
    ctx.lineTo(80, 26);
    ctx.moveTo(80, 26);
    ctx.lineTo(84, 22);

    ctx.stroke();

    ctx.restore();

}


/* ============================================
   17. OBSTACLE RENDERING
   ============================================ */

function drawObstacle(obstacle) {

    const settings = CONFIG[obstacle.type];

    const image = imageLoaded[obstacle.type]
        ? images[obstacle.type]
        : null;

    const dimensions = getImageDimensions(
        image,
        settings.maxWidth,
        settings.maxHeight
    );

    obstacle.width = dimensions.width;
    obstacle.height = dimensions.height;

    const drawX =
        obstacle.x -
        obstacle.width / 2 +
        settings.imageOffsetX;

    const drawY =
        obstacle.y -
        obstacle.height +
        settings.imageOffsetY;

    if (image) {

        ctx.drawImage(
            image,
            drawX,
            drawY,
            obstacle.width,
            obstacle.height
        );

    } else if (obstacle.type === "obstacle1") {

        drawObstacle1Fallback(
            drawX,
            drawY,
            obstacle.width,
            obstacle.height
        );

    } else {

        drawObstacle2Fallback(
            drawX,
            drawY,
            obstacle.width,
            obstacle.height
        );

    }

}


/* ============================================
   18. HITBOX DEBUG VISUALIZATION
   ============================================ */

function drawHitboxes() {

    if (!CONFIG.debug.showHitboxes) {

        return;

    }

    ctx.save();

    ctx.lineWidth = CONFIG.debug.hitboxLineWidth;

    // Runner collision hitbox.

    const runnerBox = getRunnerHitbox();

    ctx.strokeStyle = CONFIG.debug.runnerHitboxColor;

    ctx.strokeRect(
        runnerBox.x,
        runnerBox.y,
        runnerBox.width,
        runnerBox.height
    );

    // Obstacle collision hitboxes.

    ctx.strokeStyle = CONFIG.debug.obstacleHitboxColor;

    obstacles.forEach(function (obstacle) {

        const box = getObstacleHitbox(obstacle);

        ctx.strokeRect(
            box.x,
            box.y,
            box.width,
            box.height
        );

    });

    ctx.restore();

}


/* ============================================
   19. OBSTACLE MOVEMENT
   ============================================ */

function updateObstacles(deltaTime) {

    if (gameState !== "playing") {

        return;

    }

    obstacles.forEach(function (obstacle) {

        obstacle.x -= gameSpeed * deltaTime;

    });

    obstacles = obstacles.filter(function (obstacle) {

        return obstacle.x + obstacle.width / 2 > -10;

    });

    // Generate a new obstacle after sufficient distance.

    const lastObstacle = obstacles[obstacles.length - 1];

    if (!lastObstacle || lastObstacle.x < GAME_WIDTH - nextObstacleDistance) {

        generateObstacle();

        nextObstacleDistance =
            CONFIG.gameplay.minObstacleSpacing +
            Math.random() * (
                CONFIG.gameplay.maxObstacleSpacing -
                CONFIG.gameplay.minObstacleSpacing
            );

    }

}


/* ============================================
   20. COLLISION DETECTION
   ============================================ */

function checkGameCollisions() {

    if (gameState !== "playing") {

        return;

    }

    const runnerBox = getRunnerHitbox();

    for (const obstacle of obstacles) {

        const obstacleBox = getObstacleHitbox(obstacle);

        if (checkCollision(runnerBox, obstacleBox)) {

            endGame();

            return;

        }

    }

}


/* ============================================
   21. SCORE AND DIFFICULTY
   ============================================ */

function updateScore(deltaTime) {

    if (gameState !== "playing") {

        return;

    }

    // Preserve decimal precision internally.

    score += deltaTime * 10;

    if (score > highScore) {

        highScore = score;

        saveHighScore();

    }

    updateScoreDisplay();

}


function updateDifficulty(deltaTime) {

    if (gameState !== "playing") {

        return;

    }

    gameSpeed += CONFIG.gameplay.difficultyIncrease * deltaTime;

    gameSpeed = Math.min(
        gameSpeed,
        CONFIG.gameplay.maxSpeed
    );

}


/* ============================================
   22. GAME RENDERING
   ============================================ */

function drawGame() {

    ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Draw distant scenery first.

    drawBackground();

    // Draw decorative layers.

    drawDoodads();

    // Draw obstacles.

    obstacles.forEach(function (obstacle) {

        drawObstacle(obstacle);

    });

    // Draw the runner.

    drawRunner();

    // Draw debugging outlines last.

    drawHitboxes();

}


/* ============================================
   23. GAME UPDATE
   ============================================ */

function updateGame(deltaTime) {

    if (gameState !== "playing") {

        return;

    }

    worldDistance += gameSpeed * deltaTime;

    backgroundDistance +=
        gameSpeed * CONFIG.background.scrollSpeed * deltaTime;

    updateRunner(deltaTime);

    updateObstacles(deltaTime);

    updateDoodads(deltaTime);

    updateDifficulty(deltaTime);

    updateScore(deltaTime);

    checkGameCollisions();

}


/* ============================================
   24. MAIN ANIMATION LOOP
   ============================================ */

function gameLoop(timestamp) {

    if (gameState === "playing") {

        if (previousTime === 0) {

            previousTime = timestamp;

        }

        // Delta time prevents frame-rate dependent movement.

        const deltaTime = Math.min(
            (timestamp - previousTime) / 1000,
            0.033
        );

        previousTime = timestamp;

        updateGame(deltaTime);

    }

    drawGame();

    if (gameState === "playing") {

        animationFrameId = requestAnimationFrame(gameLoop);

    } else {

        animationFrameId = null;

    }

}


/* ============================================
   25. START GAME
   ============================================ */

function startGame() {

    if (gameState === "playing") {

        return;

    }

    // Reset gameplay variables.

    score = 0;

    gameSpeed = CONFIG.gameplay.startingSpeed;

    obstacles = [];

    worldDistance = 0;

    backgroundDistance = 0;

    doodadOffsets.doodad1 = 0;
    doodadOffsets.doodad2 = 0;

    obstacleTimer = 0;

    nextObstacleDistance = 450;

    // Reset runner.

    runner.x = CONFIG.runner.x;

    runner.y = GROUND_Y - CONFIG.runner.yOffset;

    runner.velocityY = 0;

    runner.grounded = true;

    runner.animationTime = 0;

    // Update state.

    gameState = "playing";

    previousTime = 0;

    // Hide overlay.

    gameOverlay.style.display = "none";

    updateScoreDisplay();

    // Cancel any previous loop before starting a new one.

    if (animationFrameId !== null) {

        cancelAnimationFrame(animationFrameId);

        animationFrameId = null;

    }

    animationFrameId = requestAnimationFrame(gameLoop);

}


/* ============================================
   26. GAME OVER
   ============================================ */

function endGame() {

    if (gameState !== "playing") {

        return;

    }

    gameState = "gameover";

    if (animationFrameId !== null) {

        cancelAnimationFrame(animationFrameId);

        animationFrameId = null;

    }

    saveHighScore();

    updateScoreDisplay();

    overlayTitle.textContent = "Game Over!";

    overlayMessage.textContent =
        "Peter Pan's adventure has ended! " +
        "Your final score is " + Math.floor(score) +
        ". Your best score is " + Math.floor(highScore) +
        ". Try again and explore farther into the forest!";

    startButton.textContent = startButton.dataset.restartText;

    gameOverlay.style.display = "flex";

    drawGame();

}


/* ============================================
   27. BUTTON FUNCTIONALITY
   ============================================ */

startButton.addEventListener("click", function () {

    startGame();

});


/* ============================================
   28. KEYBOARD CONTROLS
   ============================================ */

document.addEventListener("keydown", function (event) {

    if (
        event.code === "Space" ||
        event.code === "ArrowUp"
    ) {

        event.preventDefault();

        jump();

    }

});


/* ============================================
   29. MOUSE AND TOUCH CONTROLS
   ============================================ */

canvas.addEventListener("pointerdown", function (event) {

    if (event.pointerType === "mouse" && event.button !== 0) {

        return;

    }

    event.preventDefault();

    jump();

});


/* ============================================
   30. INITIALIZATION
   ============================================ */

function initializeGame() {

    // Validate required HTML elements.

    const requiredElements = [

        canvas,
        gameTitle,
        gameDescription,
        gameInstructions,
        scoreDisplay,
        highScoreDisplay,
        gameOverlay,
        overlayTitle,
        overlayMessage,
        startButton,
        assetStatus

    ];

    if (requiredElements.some(function (element) {
        return !element;
    })) {

        console.error(
            "Forest Runner: One or more required HTML elements are missing."
        );

        return;

    }

    // Load the saved high score.

    loadHighScore();

    // Set the initial button label from HTML.

    startButton.textContent = startButton.dataset.startText;

    // Set initial game state.

    gameState = "ready";

    gameOverlay.style.display = "flex";

    // Load optional PNG files.

    loadImages();

    // Draw the initial scene.

    updateRunnerDimensions();

    drawGame();

}


// Start the game initialization.

initializeGame();
