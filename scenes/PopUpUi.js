export default class UIScene extends Phaser.Scene {
    constructor() {
        super('UIScene');
    }

    init(data) {
        this.level = data.level;
    }

    create() {
        const bg = this.add.rectangle(400, 300, 400, 300, 0x000000, 0.7);

        this.add.text(400, 230, 'LEVEL COMPLETE!', {
            fontSize: '24px'
        }).setOrigin(0.5);

        const nextBtn = this.add.text(400, 300, 'NEXT LEVEL', {
            backgroundColor: '#00aa00',
            padding: 10
        }).setOrigin(0.5).setInteractive();

        const selectBtn = this.add.text(400, 360, 'LEVEL SELECT', {
            backgroundColor: '#aaaa00',
            padding: 10
        }).setOrigin(0.5).setInteractive();

        nextBtn.on('pointerdown', () => {
            this.scene.stop('GameScene');
            this.scene.stop();
            this.scene.start('GameScene', { level: this.level + 1 });
        });

        selectBtn.on('pointerdown', () => {
            this.scene.stop('GameScene');
            this.scene.stop();
            this.scene.start('LevelSelectScene');
        });
    }
}
