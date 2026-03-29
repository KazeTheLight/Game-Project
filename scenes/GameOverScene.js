export default class GameOverScene extends Phaser.Scene {
    constructor() {
        super('GameOverScene');
    }

    init(data) {
        this.level        = Number(data.level)        || 1;
        this.score        = Number(data.score)        || 0;
        this.correctCount = Number(data.correctCount) || 0;
    }

    create() {
        const W  = this.scale.width;
        const H  = this.scale.height;
        const cx = W / 2;
        const cy = H / 2;
        const fs = (n) => `${Math.round(n * W / 800)}px`;

        const MIN_CORRECT = 3;
        const MIN_SCORE   = 60;

        // ── Overlay gelap ──────────────────────────────────────
        this.add.rectangle(cx, cy, W, H, 0x000000, 0.75).setDepth(0);

        // ── Panel tengah ───────────────────────────────────────
        const panelW = W * 0.44;
        const panelH = H * 0.64;

        // Shadow panel
        this.add.rectangle(cx + 6, cy + 6, panelW, panelH, 0x000000, 0.5).setDepth(1);

        // Panel utama
        this.add.rectangle(cx, cy, panelW, panelH, 0x1a1a2e)
            .setStrokeStyle(3, 0xff4444)
            .setDepth(2);

        // Garis dekorasi atas
        this.add.rectangle(cx, cy - panelH / 2 + 6, panelW, 6, 0xff4444).setDepth(3);

        // ── Ikon ──────────────────────────────────────────────
        this.add.text(cx, cy - panelH * 0.33, '💀', {
            fontSize: fs(52)
        }).setOrigin(0.5).setDepth(3);

        // ── Judul ─────────────────────────────────────────────
        this.add.text(cx, cy - panelH * 0.17, 'GAME OVER', {
            fontFamily: 'PixeloidSans-Bold',
            fontSize:   fs(34),
            color:      '#ff4444'
        }).setOrigin(0.5).setDepth(3);

        // ── Info level & skor ──────────────────────────────────
        this.add.text(cx, cy - panelH * 0.04, `Level ${this.level}`, {
            fontFamily: 'PixeloidSans',
            fontSize:   fs(18),
            color:      '#aaaacc'
        }).setOrigin(0.5).setDepth(3);

        // Statistik
        this.add.text(cx - panelW * 0.2, cy + panelH * 0.07, `Score`, {
            fontFamily: 'PixeloidSans',
            fontSize:   fs(13),
            color:      '#888888'
        }).setOrigin(0.5).setDepth(3);

        this.add.text(cx - panelW * 0.2, cy + panelH * 0.14, `${this.score}`, {
            fontFamily: 'PixeloidSans-Bold',
            fontSize:   fs(24),
            color:      '#ff8888'
        }).setOrigin(0.5).setDepth(3);

        this.add.text(cx + panelW * 0.2, cy + panelH * 0.07, `Soal Benar`, {
            fontFamily: 'PixeloidSans',
            fontSize:   fs(13),
            color:      '#888888'
        }).setOrigin(0.5).setDepth(3);

        this.add.text(cx + panelW * 0.2, cy + panelH * 0.14, `${this.correctCount}`, {
            fontFamily: 'PixeloidSans-Bold',
            fontSize:   fs(24),
            color:      '#ffaaaa'
        }).setOrigin(0.5).setDepth(3);

        // ── Pesan kriteria tidak terpenuhi ─────────────────────
        this.add.text(cx, cy + panelH * 0.24,
            `Butuh min. ${MIN_CORRECT} soal benar atau ${MIN_SCORE} skor\nuntuk membuka level berikutnya.`, {
            fontFamily: 'PixeloidSans',
            fontSize:   fs(13),
            color:      '#ff8800',
            align:      'center'
        }).setOrigin(0.5).setDepth(3);

        // ── Divider ────────────────────────────────────────────
        this.add.rectangle(cx, cy + panelH * 0.31, panelW * 0.7, 2, 0x444466).setDepth(3);

        // ── Tombol Coba Lagi ───────────────────────────────────
        this._makeButton(
            cx,
            cy + panelH * 0.38,
            '  ↺  Coba Lagi  ',
            fs(18),
            0x007700, 0x00aa00, 0x005500,
            '#ffffff',
            () => {
                this.scene.start('GameScene', {
                    level:         this.level,
                    questionIndex: 0,
                    score:         0,
                    lives:         3,
                    correctCount:  0
                });
            }
        );

        // ── Tombol Level Select ────────────────────────────────
        this._makeButton(
            cx,
            cy + panelH * 0.48,
            '  ☰  Pilih Level  ',
            fs(16),
            0x444400, 0x888800, 0x333300,
            '#ffffff',
            () => {
                this.scene.start('LevelSelectScene');
            }
        );

        // ── Animasi fade-in ────────────────────────────────────
        this.cameras.main.setAlpha(0);
        this.tweens.add({
            targets:  this.cameras.main,
            alpha:    1,
            duration: 350,
            ease:     'Power2'
        });
    }

    _makeButton(x, y, label, fontSize, colorNormal, colorHover, colorPress, textColor, callback) {
        const btn = this.add.text(x, y, label, {
            fontFamily:      'PixeloidSans-Bold',
            fontSize:        fontSize,
            color:           textColor,
            backgroundColor: `#${colorNormal.toString(16).padStart(6, '0')}`,
            padding:         { x: 18, y: 10 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(4);

        btn.on('pointerover', () => {
            btn.setStyle({ backgroundColor: `#${colorHover.toString(16).padStart(6, '0')}` });
            this.tweens.add({ targets: btn, scaleX: 1.05, scaleY: 1.05, duration: 80, ease: 'Power1' });
        });
        btn.on('pointerout', () => {
            btn.setStyle({ backgroundColor: `#${colorNormal.toString(16).padStart(6, '0')}` });
            this.tweens.add({ targets: btn, scaleX: 1, scaleY: 1, duration: 80, ease: 'Power1' });
        });
        btn.on('pointerdown', () => {
            btn.setStyle({ backgroundColor: `#${colorPress.toString(16).padStart(6, '0')}` });
            this.tweens.add({ targets: btn, scaleX: 0.97, scaleY: 0.97, duration: 60, ease: 'Power1' });
        });
        btn.on('pointerup', () => {
            btn.setStyle({ backgroundColor: `#${colorHover.toString(16).padStart(6, '0')}` });
            this.tweens.add({
                targets: btn, scaleX: 1, scaleY: 1, duration: 80, ease: 'Back.Out',
                onComplete: callback
            });
        });

        return btn;
    }
}
