// Pacman clone with grid-based movement, ghosts and scoring

const tileSize = 16;
const level = [
  '############################',
  '#............##............#',
  '#.####.#####.##.#####.####.#',
  '#o#  #.#   #.##.#   #.#  #o#',
  '#.####.#####.##.#####.####.#',
  '#..........................#',
  '####.##.###########.##.#####',
  '####.##...........#.##.#####',
  '#......###########........#',
  '####.##...........#.##.#####',
  '####.##.###########.##.#####',
  '#............##............#',
  '#.####.#####.##.#####.####.#',
  '#o...#.....#....#.....#...o#',
  '############################'
];

const BOARD_WIDTH = level[0].length * tileSize;
const BOARD_HEIGHT = level.length * tileSize;

class PacmanScene extends Phaser.Scene {
  constructor() {
    super('Game');
  }

  preload() {}

  create() {
    this.physics.world.setBounds(0, 0, BOARD_WIDTH, BOARD_HEIGHT);

    this.walls = this.add.group();
    this.pellets = this.add.group();

    for (let row = 0; row < level.length; row++) {
      for (let col = 0; col < level[row].length; col++) {
        const x = col * tileSize + tileSize / 2;
        const y = row * tileSize + tileSize / 2;
        const ch = level[row][col];
        if (ch === '#') {
          const wall = this.add.rectangle(x, y, tileSize, tileSize, 0x0000ff).setOrigin(0.5);
          this.walls.add(wall);
        } else if (ch === '.' || ch === 'o') {
          const pellet = this.add.circle(x, y, ch === 'o' ? 4 : 2, 0xffffff).setOrigin(0.5);
          this.pellets.add(pellet);
        }
      }
    }

    this.playerTile = new Phaser.Math.Vector2(1, 1);
    this.player = this.add.circle(0, 0, tileSize / 2, 0xffff00).setOrigin(0.5);
    this.placeOnTile(this.player, this.playerTile);

    this.ghosts = [];
    const ghostPositions = [
      { x: 13, y: 7 },
      { x: 14, y: 7 },
      { x: 13, y: 8 },
      { x: 14, y: 8 },
    ];
    const colors = [0xff0000, 0xffb8ff, 0xffb847, 0x00ffff];
    ghostPositions.forEach((pos, idx) => {
      const g = this.add.circle(0, 0, tileSize / 2, colors[idx]).setOrigin(0.5);
      g.tile = new Phaser.Math.Vector2(pos.x, pos.y);
      this.placeOnTile(g, g.tile);
      this.ghosts.push(g);
    });

    this.score = 0;
    this.scoreText = this.add.text(4, BOARD_HEIGHT + 4, 'SCORE: 0', { fontFamily: '"Press Start 2P"', fontSize: '10px', color: '#fff' });

    this.timeLeft = 60;
    this.timerText = this.add.text(BOARD_WIDTH - 100, BOARD_HEIGHT + 4, 'TIME: 60', { fontFamily: '"Press Start 2P"', fontSize: '10px', color: '#fff' });
    this.time.addEvent({ delay: 1000, callback: this.tick, callbackScope: this, loop: true });

    this.isMoving = false;
    this.gameOver = false;
    this.input.keyboard.on('keydown', this.handleKey, this);
  }

  tick() {
    if (this.gameOver) return;
    this.timeLeft--;
    this.timerText.setText('TIME: ' + this.timeLeft);
    if (this.timeLeft <= 0) {
      this.endGame(false);
    }
  }

  handleKey(event) {
    if (this.isMoving || this.gameOver) return;
    const dir = new Phaser.Math.Vector2(0, 0);
    if (event.code === 'ArrowLeft') dir.x = -1;
    else if (event.code === 'ArrowRight') dir.x = 1;
    else if (event.code === 'ArrowUp') dir.y = -1;
    else if (event.code === 'ArrowDown') dir.y = 1;
    if (dir.x === 0 && dir.y === 0) return;
    const target = this.playerTile.clone().add(dir);
    if (this.isWall(target)) return;
    this.movePlayerTo(target);
  }

  isWall(tile) {
    if (tile.y < 0 || tile.y >= level.length || tile.x < 0 || tile.x >= level[0].length) return true;
    return level[tile.y][tile.x] === '#';
  }

  movePlayerTo(tile) {
    this.isMoving = true;
    this.playerTile = tile;
    this.tweens.add({
      targets: this.player,
      x: tile.x * tileSize + tileSize / 2,
      y: tile.y * tileSize + tileSize / 2,
      duration: 150,
      onComplete: () => {
        this.isMoving = false;
        this.checkPellet();
        this.checkWin();
      }
    });
  }

  placeOnTile(sprite, tile) {
    sprite.setPosition(tile.x * tileSize + tileSize / 2, tile.y * tileSize + tileSize / 2);
  }

  checkPellet() {
    const toRemove = this.pellets.getChildren().find(p =>
      Phaser.Math.Distance.Between(p.x, p.y, this.player.x, this.player.y) < tileSize / 2);
    if (toRemove) {
      this.pellets.remove(toRemove, true, true);
      this.score += 10;
      this.scoreText.setText('SCORE: ' + this.score);
    }
  }

  checkWin() {
    if (this.pellets.getLength() === 0) {
      this.endGame(true);
    }
  }

  endGame(win) {
    this.gameOver = true;
    const msg = win ? 'YOU WIN!' : 'GAME OVER';
    this.add.text(BOARD_WIDTH / 2, BOARD_HEIGHT / 2, msg, { fontFamily: '"Press Start 2P"', fontSize: '16px', color: '#fff' }).setOrigin(0.5);
  }

  update() {
    if (this.gameOver) return;
    this.moveGhosts();
    this.ghosts.forEach(g => {
      if (Phaser.Math.Distance.Between(g.x, g.y, this.player.x, this.player.y) < tileSize / 2) {
        this.endGame(false);
      }
    });
  }

  moveGhosts() {
    this.ghosts.forEach(g => {
      if (g.tween && g.tween.isPlaying()) return;
      const dirs = [new Phaser.Math.Vector2(1,0), new Phaser.Math.Vector2(-1,0), new Phaser.Math.Vector2(0,1), new Phaser.Math.Vector2(0,-1)];
      Phaser.Utils.Array.Shuffle(dirs);
      for (const d of dirs) {
        const target = g.tile.clone().add(d);
        if (!this.isWall(target)) {
          g.tile = target;
          g.tween = this.tweens.add({ targets: g, x: target.x*tileSize+tileSize/2, y: target.y*tileSize+tileSize/2, duration: 200 });
          break;
        }
      }
    });
  }
}

const config = {
  type: Phaser.AUTO,
  width: BOARD_WIDTH,
  height: BOARD_HEIGHT + 32,
  backgroundColor: '#000',
  physics: { default: 'arcade', arcade: { debug: false } },
  scene: PacmanScene
};

new Phaser.Game(config);
