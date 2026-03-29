import { SaveManager } from '../SaveManager.js';

export default class UIScene extends Phaser.Scene {
    constructor() {
        super('UIScene');
    }

    init(data) {
        this.level        = Number(data.level) || 1;
        this.score        = Number(data.score) || 0;
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
        const panelW = W * 0.46;
        const panelH = H * 0.65;

        // Shadow panel
        this.add.rectangle(cx + 6, cy + 6, panelW, panelH, 0x000000, 0.5).setDepth(1);

        // Panel utama
        this.add.rectangle(cx, cy, panelW, panelH, 0x1a1a2e)
            .setStrokeStyle(3, 0xFFD700)
            .setDepth(2);

        // Garis dekorasi atas
        this.add.rectangle(cx, cy - panelH / 2 + 6, panelW, 6, 0xFFD700).setDepth(3);

        // ── Ikon bintang ───────────────────────────────────────
        this.add.text(cx, cy - panelH * 0.35, '⭐', {
            fontSize: fs(52)
        }).setOrigin(0.5).setDepth(3);

        // ── Judul ─────────────────────────────────────────────
        this.add.text(cx, cy - panelH * 0.2, 'LEVEL COMPLETE!', {
            fontFamily: 'PixeloidSans-Bold',
            fontSize:   fs(30),
            color:      '#FFD700'
        }).setOrigin(0.5).setDepth(3);

        // ── Info Level ─────────────────────────────────────────
        this.add.text(cx, cy - panelH * 0.08, `Level ${this.level} Selesai`, {
            fontFamily: 'PixeloidSans',
            fontSize:   fs(18),
            color:      '#aaaacc'
        }).setOrigin(0.5).setDepth(3);

        // ── Divider ────────────────────────────────────────────
        this.add.rectangle(cx, cy, panelW * 0.75, 2, 0x444466).setDepth(3);

        // ── Statistik skor & benar ─────────────────────────────
        this.add.text(cx - panelW * 0.18, cy + panelH * 0.05, `Score`, {
            fontFamily: 'PixeloidSans',
            fontSize:   fs(14),
            color:      '#888888'
        }).setOrigin(0.5).setDepth(3);

        this.add.text(cx - panelW * 0.18, cy + panelH * 0.12, `${this.score}`, {
            fontFamily: 'PixeloidSans-Bold',
            fontSize:   fs(26),
            color:      '#00FF99'
        }).setOrigin(0.5).setDepth(3);

        this.add.text(cx + panelW * 0.18, cy + panelH * 0.05, `Soal Benar`, {
            fontFamily: 'PixeloidSans',
            fontSize:   fs(14),
            color:      '#888888'
        }).setOrigin(0.5).setDepth(3);

        this.add.text(cx + panelW * 0.18, cy + panelH * 0.12, `${this.correctCount}`, {
            fontFamily: 'PixeloidSans-Bold',
            fontSize:   fs(26),
            color:      '#FFD700'
        }).setOrigin(0.5).setDepth(3);

        // ── Pesan kriteria terpenuhi ───────────────────────────
        const critMsg = (this.correctCount >= MIN_CORRECT)
            ? `✓ ${this.correctCount} soal benar — kriteria terpenuhi!`
            : `✓ Score ${this.score} — kriteria skor terpenuhi!`;

        this.add.text(cx, cy + panelH * 0.22, critMsg, {
            fontFamily: 'PixeloidSans',
            fontSize:   fs(13),
            color:      '#00FF99',
            align:      'center'
        }).setOrigin(0.5).setDepth(3);

        // ── Tombol NEXT LEVEL ──────────────────────────────────
        const nextLevel = this.level + 1;
        const hasNextLevel = nextLevel <= 10;

        if (hasNextLevel) {
            this._makeButton(
                cx,
                cy + panelH * 0.34,
                `  ▶  Level ${nextLevel}  `,
                fs(18),
                0x005500, 0x00aa00, 0x003300,
                '#ffffff',
                () => {
                    this.scene.start('GameScene', {
                        level:         nextLevel,
                        questionIndex: 0,
                        score:         0,
                        lives:         3,
                        correctCount:  0
                    });
                }
            );
        } else {
            // Level terakhir selesai
            this.add.text(cx, cy + panelH * 0.34, '🏆 Semua Level Selesai!', {
                fontFamily: 'PixeloidSans-Bold',
                fontSize:   fs(20),
                color:      '#FFD700'
            }).setOrigin(0.5).setDepth(4);
        }

        // ── Tombol LEVEL SELECT ────────────────────────────────
        this._makeButton(
            cx,
            cy + panelH * 0.46,
            '  ☰  Pilih Level  ',
            fs(16),
            0x444400, 0x888800, 0x333300,
            '#ffffff',
            () => {
                this.scene.start('LevelSelectScene');
            }
        );

        // ── Fade in ────────────────────────────────────────────
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
