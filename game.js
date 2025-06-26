class PacmanScene extends Phaser.Scene {
  constructor() {
    super('Game');
  }

  preload() {}

  create() {
    const tileSize = 16;
    const level = [
      '####################',
      '#........#.........#',
      '#.####.#.#.####.#..#',
      '#o#  #.#.#.#  #.#oo#',
      '#.####.###.####.####',
      '#..................#',
      '####################'
    ];

    this.physics.world.setBounds(0, 0, level[0].length * tileSize, level.length * tileSize);

    this.walls = this.physics.add.staticGroup();
    this.pellets = this.physics.add.staticGroup();

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

    this.player = this.physics.add.sprite(tileSize * 1.5, tileSize * 1.5, null);
    this.player.body.setCircle(tileSize / 2);
    this.player.setCollideWorldBounds(true);

    const graphics = this.add.graphics({ fillStyle: { color: 0xffff00 } });
    graphics.fillCircle(0, 0, tileSize / 2);
    this.player.setTexture(graphics.generateTexture('pacman', tileSize, tileSize));

    this.cursors = this.input.keyboard.createCursorKeys();

    this.physics.add.collider(this.player, this.walls);
    this.physics.add.overlap(this.player, this.pellets, (player, pellet) => {
      pellet.destroy();
    });
  }

  update() {
    const speed = 100;
    this.player.body.setVelocity(0);

    if (this.cursors.left.isDown) {
      this.player.body.setVelocityX(-speed);
    } else if (this.cursors.right.isDown) {
      this.player.body.setVelocityX(speed);
    }

    if (this.cursors.up.isDown) {
      this.player.body.setVelocityY(-speed);
    } else if (this.cursors.down.isDown) {
      this.player.body.setVelocityY(speed);
    }
  }
}

const config = {
  type: Phaser.AUTO,
  width: 320,
  height: 112,
  physics: {
    default: 'arcade',
    arcade: {
      debug: false
    }
  },
  scene: PacmanScene
};

new Phaser.Game(config);
