GAME = typeof GAME === 'undefined' ? {} : GAME;
GAME.running = false;
GAME.start = function () {
    if(!GAME.running) {
        init();
        setTimeout(() => {
            document.getElementById('menu').classList.add('hidden')
        }, 100)
    }
}
GAME.restart = function () {
    init();
}
const MAX_SECONDS = 90;
let pendingTime
let timerInterval;
let timerElement;

function init () {
    GAME.running = true;
    pendingTime = MAX_SECONDS;
    currentPlayer2 = 0
    viewPlaying();
    startTimer();
    drawTime();
    initPlayers();
}

function initPlayers () {
    playerPosition = {x: 0, y: 15}
    player2Positions = [{x: 15, y: 15}, {x: 13, y: 17}, {x: 15, y: 17}, {x: 17, y: 17}]
    player.setX(getPixels(playerPosition.x))
    player.setY(getPixels(playerPosition.y))
    for (let i = 0; i < PLAYER2_SIZE; i++) {
        const player2Position = player2Positions[i];
        player2[i].setX(getPixels(player2Position.x))
        player2[i].setY(getPixels(player2Position.y))
    }
}

function startTimer() {
    timerElement = document.getElementById('timer')
    timerInterval = setInterval(updateTimer, 1000)
}
function drawTime () {
    timerElement.innerText = formatTime(pendingTime);
}
function formatTime(totalSeconds) {
    const seconds = Math.floor(totalSeconds % 60);
    const minutes = Math.floor(totalSeconds / 60);
    return `${minutes}:${seconds < 10 ? '0': ''}${seconds}`
}
function updateTimer () {
    if (GAME.running) {
        pendingTime--;
        drawTime()
        if (pendingTime === 0) {
            GAME.running = false
            stopTimer();
            p1Win();
        }
    } else {
        stopTimer()
    }
}
function stopTimer () {
    clearInterval(timerInterval);
    timerInterval = null;
}
const WALL_CODE = 1;
const config = {
    type: Phaser.AUTO,
    width: 775,
    height: 775,
    backgroundColor: '#ffffff',
    physics: {
        default: 'arcade',
        arcade: {}
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};
let player
let cursors
let p2Buttons = {}
const unit = 25;
const maxUnitSize = 30;
let playerPosition = {x: 0, y: 15}
let player2Positions = [{x: 15, y: 15}, {x: 13, y: 17}, {x: 17, y: 17}, {x: 15, y: 17}]
const PLAYER2_SIZE = 4; // [1-4]
const player2 = [];
let currentPlayer2;
function getPixels(units) {
    return (unit/2) + (unit * units)
}
const game = new Phaser.Game(config);
let platforms;

function preload ()
{
    this.load.image('wall', 'assets/wall.png');
    this.load.image('ball-big', 'assets/ball-big.png');
    this.load.image('ball-small', 'assets/ball-small.png');
    this.load.image('smile', 'assets/euskal.png');
    this.load.spritesheet('enemy', 'assets/enemy.png', { frameWidth: 25, frameHeight: 25 });
    this.load.image('enemy-normal', 'assets/enemy-normal.png');
    this.load.image('enemy-selected', 'assets/enemy-selected.png');
}

function drawMap(map) {
    for (let i = 0; i <= maxUnitSize; i++) {
        for (let j = 0; j <= maxUnitSize; j++) {
            if (map[i][j] === WALL_CODE) {
                platforms.create(getPixels(j), getPixels(i), 'wall').setScale(1).refreshBody();
            }
        }
    }
}

function create ()
{
    for (let i = 0; i <= 3; i++) {
        this.input.keyboard.addKey(49 + i).on('down', function (e) {
            currentPlayer2 = i;
        });
    }
    platforms = this.physics.add.staticGroup();
    drawMap(GAME.map)
    player = this.physics.add.sprite(getPixels(playerPosition.x), getPixels(playerPosition.y), 'smile');
    for (let i = 0; i < PLAYER2_SIZE; i++) {
        player2.push(this.physics.add.sprite(getPixels(player2Positions[i].x), getPixels(player2Positions[i].y), 'enemy-normal'));
    }
    cursors = this.input.keyboard.createCursorKeys()
    p2Buttons.a = this.input.keyboard.addKey('a');
    p2Buttons.s = this.input.keyboard.addKey('s');
    p2Buttons.d = this.input.keyboard.addKey('d');
    p2Buttons.w = this.input.keyboard.addKey('w');
    for (let i = 0; i < PLAYER2_SIZE; i++) {
        this.physics.add.overlap(player, player2[i], collision, null, this);
    }
}

let timeoutP1
let timeoutP2
function isInLimits(unit) {
    return !(unit < 0 || unit > maxUnitSize);
}

function isValidPosition(x,y) {
    if (isInLimits(x) && isInLimits(y)) {
        return GAME.map[y][x] !== WALL_CODE;
    }
    return false
}

function movePlayer1 () {
    if (!timeoutP1) {
        let newX = playerPosition.x
        let newY = playerPosition.y
        if (cursors.right.isDown) {
            newX++
        } else if (cursors.left.isDown) {
            newX--
        } else if (cursors.down.isDown) {
            newY++
        } else if (cursors.up.isDown) {
            newY--
        }
        if ((newX !== playerPosition.x || newY !== playerPosition.y) && isValidPosition(newX, newY)) {
            playerPosition.x = newX;
            playerPosition.y = newY
            timeoutP1 = setTimeout(function () {
                timeoutP1 = null;
            }, 100)
            player.setX(getPixels(playerPosition.x))
            player.setY(getPixels(playerPosition.y))
        }
    }
}

function movePlayer2 () {
    if (!timeoutP2) {
        const player2Position = player2Positions[currentPlayer2]
        let newX = player2Position.x
        let newY = player2Position.y
        if (p2Buttons.d.isDown) {
            newX++
        } else if (p2Buttons.a.isDown) {
            newX--
        } else if (p2Buttons.s.isDown) {
            newY++
        } else if (p2Buttons.w.isDown) {
            newY--
        }
        if ((newX !== player2Position.x || newY !== player2Position.y) && isValidPosition(newX, newY)) {
            player2Position.x = newX;
            player2Position.y = newY
            timeoutP2 = setTimeout(function () {
                timeoutP2 = null;
            }, 100)
            player2[currentPlayer2].setX(getPixels(player2Position.x))
            player2[currentPlayer2].setY(getPixels(player2Position.y))
        }
    }
}

function update () {
    if (GAME.running) {
        console.log('update')
        movePlayer1()
        movePlayer2()
        for (let i = 0; i < PLAYER2_SIZE; i++) {
            player2[i].setTexture(i === currentPlayer2 ? 'enemy-selected' : 'enemy-normal')
        }
    }
}

function collision () {
    if (GAME.running) {
        GAME.running = false;
        p2Win();
    }
}

function viewPlaying () {
    document.getElementById('menu').classList.add('hidden')
    document.getElementById('main').classList.add('hidden')
    document.getElementById('p1-winner').classList.add('hidden')
    document.getElementById('p2-winner').classList.add('hidden')
}

function p1Win () {
    document.getElementById('menu').classList.remove('hidden')
    document.getElementById('main').classList.add('hidden')
    document.getElementById('p1-winner').classList.remove('hidden')
    document.getElementById('p2-winner').classList.add('hidden')
    document.getElementById('p1-replay').focus()
}

function p2Win () {
    document.getElementById('menu').classList.remove('hidden')
    document.getElementById('main').classList.add('hidden')
    document.getElementById('p1-winner').classList.add('hidden')
    document.getElementById('p2-winner').classList.remove('hidden');
    document.getElementById('p2-replay').focus()
    document.getElementById('sobrean').innerText = formatTime(pendingTime)
}