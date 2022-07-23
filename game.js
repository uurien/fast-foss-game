GAME = typeof GAME === 'undefined' ? {} : GAME;
const WALL_CODE = 1;
const BIG_BALL_CODE = 2;
const SMALL_BALL_CODE = 0;
const EMPTY_CODE = 3;
let playing = true
const config = {
    type: Phaser.AUTO,
    width: 775,
    height: 775,
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
let dKey
let p2Buttons = {}
const unit = 25;
const maxUnitSize = 30;
const playerPosition = {x: 0, y: 15}
const player2Positions = [{x: 15, y: 15}, {x: 13, y: 17}, {x: 17, y: 17}, {x: 15, y: 17}]
const PLAYER2_SIZE = 4; // [1-4]
const player2 = [];
let currentPlayer2 = 0;
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
    this.load.image('smile', 'assets/smile.png');
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

function drawBigBalls (map, physics) {
    for (let i = 0; i <= maxUnitSize; i++) {
        for (let j = 0; j <= maxUnitSize; j++) {
            if (map[i][j] === BIG_BALL_CODE) {
                physics.add.sprite(getPixels(j), getPixels(i), 'ball-big')
            }
        }
    }
}

function drawSmallBalls (map, physics) {
    for (let i = 0; i <= maxUnitSize; i++) {
        for (let j = 0; j <= maxUnitSize; j++) {
            if (map[i][j] === SMALL_BALL_CODE) {
                physics.add.sprite(getPixels(j), getPixels(i), 'ball-small')
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
    console.log(player)
    for (let i = 0; i < PLAYER2_SIZE; i++) {
        player2.push(this.physics.add.sprite(getPixels(player2Positions[i].x), getPixels(player2Positions[i].y), 'enemy-normal'));
    }
    // drawBigBalls(GAME.map, this.physics)
    // drawSmallBalls(GAME.map, this.physics)
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
    movePlayer1()
    movePlayer2()
    for (let i = 0; i < PLAYER2_SIZE; i++) {
        player2[i].setTexture(i === currentPlayer2 ? 'enemy-selected' : 'enemy-normal')
    }
}

function collision () {
    if (playing) {
        playing = false
        alert('P2 win')
        console.log('collision')
    }

}