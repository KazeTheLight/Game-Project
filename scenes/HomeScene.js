export default class HomeScene extends Phaser.Scene {
    constructor() {
        super('HomeScene');
    }

    preload(){
        this.load.image('bghome', 'assets/mainmenu.png');
        this.load.image('play', 'assets/play.png')
        this.load.image('credit', 'assets/credit.png')
    }

    create() {
        this.add.image(1905/2 , 870/2, 'bghome');
        this.add.text(952.5, 200, 'WORD ARRANGE GAME', {
            fontSize: '32px'
        }).setOrigin(0.5);


        const creditBtn = this.add.image(1800, 80,'credit').setOrigin(0.5).setInteractive().setScale(0.5)
        const playBtn = this.add.image(952.5, 670, 'play').setOrigin(0.5).setInteractive().setScale(0.7);

        creditBtn.on('pointerdown', () => {
            this.scene.start('CreditScene')
        });

        playBtn.on('pointerdown', () => {
            this.scene.start('LevelSelectScene');
        });
    }
}
