export default class HomeScene extends Phaser.Scene {
    constructor() {
        super('HomeScene');
    }

    preload(){
        this.load.image('bghome', 'assets/mainmenu.png');
        this.load.image('play', 'assets/play.png');
        this.load.image('credit', 'assets/credit.png');
        this.load.audio('bgm', 'assets/sound/bgsound.ogg');
    }

    create() {
        const existing = this.sound.get('bgm');
        if (existing) {
            this.music = existing;
            if (!this.music.isPlaying) {
                this.music.play();
            }
        } else {
            this.music = this.sound.add('bgm', { loop: true, volume: 0.5 });
            this.music.play();
        }
        this.add.image(1905/2 , 870/2, 'bghome');
        this.add.text(930.5, 200, 'WORD ARRANGE GAME', {
            fontFamily: 'PixeloidSans-Bold',
            fontSize: '50px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 6
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
