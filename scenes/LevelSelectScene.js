import { SaveManager } from '../SaveManager.js';

export default class LevelSelectScene extends Phaser.Scene {
    constructor() {
        super('LevelSelectScene');
    }

    preload() {
        this.load.image('bglevel',  'assets/levelselection.png');
        this.load.image('level1',   'assets/Level 1.png');
        this.load.image('level2',   'assets/Level 2.png');
        this.load.image('level3',   'assets/Level 3.png');
        this.load.image('level4',   'assets/Level 4.png');
        this.load.image('level5',   'assets/Level 5.png');
        this.load.image('level6',   'assets/Level 6.png');
        this.load.image('level7',   'assets/Level 7.png');
        this.load.image('level8',   'assets/Level 8.png');
        this.load.image('level9',   'assets/Level 9.png');
        this.load.image('level10',  'assets/Level 10.png');
        this.load.image('kembali',  'assets/back.png');
    }

    create() {
        this.music = this.sound.get('bgm');

        this.events.on('shutdown', () => {
            if (this.music) this.music.stop();
        });
        const W  = this.scale.width;
        const H  = this.scale.height;
        const cx = W / 2;
        const fs = (n) => `${Math.round(n * W / 800)}px`;

        this.add.image(W / 2, H / 2, 'bglevel').setDisplaySize(W, H);

        this.add.text(1090, 130, 'SELECT LEVEL', {
            fontSize:   '50px',
            fontFamily: 'PixeloidSans-Bold',
            color :     '#ffffff',
            stroke :    '#000000',
            strokeThickness: 6
        }).setOrigin(0.5);

        // Hint kriteria unlock
        this.add.text(cx, H * 0.90,
            '🔒 Selesaikan level sebelumnya dengan minimal 3 soal benar atau 60 skor untuk membuka level berikutnya', {
            fontFamily: 'PixeloidSans',
            fontSize:   fs(13),
            color:      '#ffcc44',
            align:      'center',
            wordWrap:   { width: W * 0.75 }
        }).setOrigin(0.5).setDepth(2);

        // Definisi posisi setiap level
        const levelPositions = [
            { level: 1,  x: 620,  y: 250 },
            { level: 2,  x: 770,  y: 250 },
            { level: 3,  x: 920,  y: 250 },
            { level: 4,  x: 1070, y: 250 },
            { level: 5,  x: 1220, y: 250 },
            { level: 6,  x: 1370, y: 250 },
            { level: 7,  x: 1520, y: 250 },
            { level: 8,  x: 920,  y: 400 },
            { level: 9,  x: 1070, y: 400 },
            { level: 10, x: 1220, y: 400 },
        ];

        levelPositions.forEach(({ level, x, y }) => {
            const isUnlocked = SaveManager.isUnlocked(level);
            const stats      = SaveManager.getLevelStats(level);
            const btn        = this.add.image(x, y, `level${level}`)
                .setScale(0.5)
                .setDepth(1);

            if (!isUnlocked) {
                // ── Level terkunci ──────────────────────────────
                btn.setTint(0x555555);
                btn.setAlpha(0.6);

                // Ikon gembok
                this.add.text(x, y - 10, '🔒', {
                    fontSize: fs(24)
                }).setOrigin(0.5).setDepth(2);

                // Tooltip saat hover
                btn.setInteractive();
                btn.on('pointerover', () => {
                    this._showLockTooltip(x, y - 50,
                        `Selesaikan Level ${level - 1} dulu!\nMin. 3 benar / 60 skor`, fs);
                });
                btn.on('pointerout', () => this._hideLockTooltip());

            } else {
                // ── Level terbuka ───────────────────────────────
                btn.setInteractive();

                // Badge "completed" jika sudah pernah lulus
                if (stats.completed) {
                    this.add.text(x + 28, y - 28, '✓', {
                        fontFamily:      'PixeloidSans-Bold',
                        fontSize:        fs(14),
                        color:           '#00FF99',
                        backgroundColor: '#003300',
                        padding:         { x: 3, y: 2 }
                    }).setOrigin(0.5).setDepth(2);
                }

                btn.on('pointerover', () => {
                    btn.setScale(0.6);
                    // Tampilkan best score jika pernah dimainkan
                    if (stats.bestScore > 0) {
                        this._showLockTooltip(x, y - 55,
                            `Best: ${stats.bestScore} skor | ${stats.bestCorrect} benar`, fs);
                    }
                });
                btn.on('pointerout', () => {
                    btn.setScale(0.5);
                    btn.clearTint();
                    this._hideLockTooltip();
                });
                btn.on('pointerdown', () => {
                    btn.setScale(0.4);
                    btn.setTint(0xdddddd);
                });
                btn.on('pointerup', () => {
                    btn.setScale(0.5);
                    btn.clearTint();
                    this.scene.start('GameScene', {
                        level:         String(level),
                        questionIndex: 0,
                        score:         0,
                        lives:         3,
                        correctCount:  0
                    });
                });
            }
        });

        // ── Tombol Back ────────────────────────────────────────
        const btnBack = this.add.image(100, 100, 'kembali').setScale(0.3).setInteractive();
        btnBack.on('pointerdown', () => btnBack.setTint(0xdddddd));
        btnBack.on('pointerup',   () => this.scene.start('HomeScene'));

        //tooltip untuk hint
        this._tooltipBgHint   = this.add.rectangle(cx, H * 0.90, 1500, 100, 0x1a1a2e)
            .setStrokeStyle(1, 0xFFD700).setVisible(true).setDepth(0);

        // Elemen tooltip (dibuat sekali, disembunyikan)
        this._tooltipBg   = this.add.rectangle(0, 0, 220, 50, 0x1a1a2e)
            .setStrokeStyle(1, 0xFFD700).setVisible(false).setDepth(10);
        this._tooltipText = this.add.text(0, 0, '', {
            fontFamily: 'PixeloidSans',
            color:      '#ffcc44',
            align:      'center'
        }).setOrigin(0.5).setVisible(false).setDepth(11);
    }

    _showLockTooltip(x, y, msg, fs) {
        const lines = msg.split('\n').length;
        const h     = 30 + lines * 20;
        const w     = 500;
        this._tooltipBg.setPosition(x, y).setSize(w, h).setVisible(true);
        this._tooltipText.setPosition(x, y).setText(msg).setFontSize(fs ? fs(12) : '12px').setVisible(true);
    }

    _hideLockTooltip() {
        this._tooltipBg.setVisible(false);
        this._tooltipText.setVisible(false);
    }
}
