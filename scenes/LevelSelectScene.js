export default class LevelSelectScene extends Phaser.Scene {
    constructor() {
        super('LevelSelectScene');
    }

    preload(){
        this.load.image('bglevel', 'assets/levelselection.png');
        this.load.image('level1', 'assets/Level 1.png');
        this.load.image('level2', 'assets/Level 2.png');
        this.load.image('level3', 'assets/Level 3.png');
        this.load.image('level4', 'assets/Level 4.png');
        this.load.image('level5', 'assets/Level 5.png');
        this.load.image('level6', 'assets/Level 6.png');
        this.load.image('level7', 'assets/Level 7.png');
        this.load.image('level8', 'assets/Level 8.png');
        this.load.image('level9', 'assets/Level 9.png');
        this.load.image('level10', 'assets/Level 10.png');
    }

    create() {
        this.add.image(1905/2, 870/2,'bglevel')
        this.add.text(1090, 130, 'SELECT LEVEL', {
            fontSize: '32px',
            fontFamily: 'PixeloidSans-Bold'
        }).setOrigin(0.5);

        const level1Btn = this.add.image(620, 250, 'level1').setInteractive().setScale(0.5);
        level1Btn.on('pointerover', () => { level1Btn.setScale(0.6);});
        level1Btn.on('pointerout', () => { level1Btn.setScale(0.5);level1Btn.clearTint(); }); 
        level1Btn.on('pointerdown', () => { level1Btn.setScale(0.4); level1Btn.setTint(0xdddddd);});
        level1Btn.on('pointerup', () => {
            level1Btn.setScale(0.5);level1Btn.clearTint();
            this.scene.start('GameScene', { level: "1"});
        });

        const level2Btn = this.add.image(770, 250, 'level2').setInteractive().setScale(0.5);
        level2Btn.on('pointerover', () => { level2Btn.setScale(0.6);});
        level2Btn.on('pointerout', () => { level2Btn.setScale(0.5);level2Btn.clearTint(); }); 
        level2Btn.on('pointerdown', () => { level2Btn.setScale(0.4); level2Btn.setTint(0xdddddd);});
        level2Btn.on('pointerup', () => {
            level2Btn.setScale(0.5);level2Btn.clearTint();
            this.scene.start('GameScene', { level: "2"});
        });

        const level3Btn = this.add.image(920, 250, 'level3').setInteractive().setScale(0.5);
        level3Btn.on('pointerover', () => { level3Btn.setScale(0.6);});
        level3Btn.on('pointerout', () => { level3Btn.setScale(0.5);level3Btn.clearTint(); }); 
        level3Btn.on('pointerdown', () => { level3Btn.setScale(0.4); level3Btn.setTint(0xdddddd);});
        level3Btn.on('pointerup', () => {
            level3Btn.setScale(0.5);level3Btn.clearTint();
            this.scene.start('GameScene', { level: "3"});
        });

        const level4Btn = this.add.image(1070, 250, 'level4').setInteractive().setScale(0.5);
        level4Btn.on('pointerover', () => { level4Btn.setScale(0.6);});
        level4Btn.on('pointerout', () => { level4Btn.setScale(0.5);level4Btn.clearTint(); }); 
        level4Btn.on('pointerdown', () => { level4Btn.setScale(0.4); level4Btn.setTint(0xdddddd);});
        level4Btn.on('pointerup', () => {
            level4Btn.setScale(0.5);level4Btn.clearTint();
            this.scene.start('GameScene', { level: "4"});
        });

        const level5Btn = this.add.image(1220, 250, 'level5').setInteractive().setScale(0.5);
        level5Btn.on('pointerover', () => { level5Btn.setScale(0.6);});
        level5Btn.on('pointerout', () => { level5Btn.setScale(0.5);level5Btn.clearTint(); }); 
        level5Btn.on('pointerdown', () => { level5Btn.setScale(0.4); level5Btn.setTint(0xdddddd);});
        level5Btn.on('pointerup', () => {
            level5Btn.setScale(0.5);level5Btn.clearTint();
            this.scene.start('GameScene', { level: "5"});
        });

        const level6Btn = this.add.image(1370, 250, 'level6').setInteractive().setScale(0.5);
        level6Btn.on('pointerover', () => { level6Btn.setScale(0.6);});
        level6Btn.on('pointerout', () => { level6Btn.setScale(0.5);level6Btn.clearTint(); }); 
        level6Btn.on('pointerdown', () => { level6Btn.setScale(0.4); level6Btn.setTint(0xdddddd);});
        level6Btn.on('pointerup', () => {
            level6Btn.setScale(0.5);level6Btn.clearTint();
            this.scene.start('GameScene', { level: "6"});
        });

        const level7Btn = this.add.image(1520, 250, 'level7').setInteractive().setScale(0.5);
        level7Btn.on('pointerover', () => { level7Btn.setScale(0.6);});
        level7Btn.on('pointerout', () => { level7Btn.setScale(0.5);level7Btn.clearTint(); }); 
        level7Btn.on('pointerdown', () => { level7Btn.setScale(0.4); level7Btn.setTint(0xdddddd);});
        level7Btn.on('pointerup', () => {
            level7Btn.setScale(0.5);level7Btn.clearTint();
            this.scene.start('GameScene', { level: "7"});
        });

        const level8Btn = this.add.image(920, 400, 'level8').setInteractive().setScale(0.5);
        level8Btn.on('pointerover', () => { level8Btn.setScale(0.6);});
        level8Btn.on('pointerout', () => { level8Btn.setScale(0.5);level8Btn.clearTint(); }); 
        level8Btn.on('pointerdown', () => { level8Btn.setScale(0.4); level8Btn.setTint(0xdddddd);});
        level8Btn.on('pointerup', () => {
            level8Btn.setScale(0.5);level8Btn.clearTint();
            this.scene.start('GameScene', { level: "8"});
        });

        const level9Btn = this.add.image(1070, 400, 'level9').setInteractive().setScale(0.5);
        level9Btn.on('pointerover', () => { level9Btn.setScale(0.6);});
        level9Btn.on('pointerout', () => { level9Btn.setScale(0.5);level9Btn.clearTint(); }); 
        level9Btn.on('pointerdown', () => { level9Btn.setScale(0.4); level9Btn.setTint(0xdddddd);});
        level9Btn.on('pointerup', () => {
            level9Btn.setScale(0.5);level9Btn.clearTint();
            this.scene.start('GameScene', { level: "9"});
        });

        const level10Btn = this.add.image(1220, 400, 'level10').setInteractive().setScale(0.5);
        level10Btn.on('pointerover', () => { level10Btn.setScale(0.6);});
        level10Btn.on('pointerout', () => { level10Btn.setScale(0.5);level10Btn.clearTint(); }); 
        level10Btn.on('pointerdown', () => { level10Btn.setScale(0.4); level10Btn.setTint(0xdddddd);});
        level10Btn.on('pointerup', () => {
            level10Btn.setScale(0.5);level10Btn.clearTint();
            this.scene.start('GameScene', { level: "10"});
        });

        const btnBack= this.add.text(50, 50, "back" ,
            { backgroundColor: '#444', padding: 10 }).setInteractive().setOrigin(0.5);

        btnBack.on('pointerdown', () => {
            this.scene.start('HomeScene')
        });
    }
}
