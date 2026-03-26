export default class GameOverScene extends Phaser.Scene{
    constructor(){
        super('GameOverScene');
    }

    preload(){

    }

    init(data){
        this.level = data.level;
    }

    create(){
        const restartBtn = this.add.text(400, 300, 'restart LEVEL', {
            backgroundColor: '#00aa00',
            padding: 10
        }).setOrigin(0.5).setInteractive();

        restartBtn.on('pointerdown', () => {
            this.scene.restart( { level: this.level });
        });
    }

}