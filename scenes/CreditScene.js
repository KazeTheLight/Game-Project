export default class CreditScene extends Phaser.Scene {
    constructor() {
        super('CreditScene');
    }

    preload() {

    }

    create() {
        const W  = this.scale.width;
        const H  = this.scale.height;
        const cx = W / 2;
        const fs = (n) => `${Math.round(n * W / 800)}px`;

        // ── Background gradien gelap ───────────────────────────
        // Layer hitam penuh, nanti di-fade in
        const bg = this.add.rectangle(cx, H / 2, W, H, 0x000000).setAlpha(0).setDepth(0);

        // Sedikit gradien dengan rectangle overlay berwarna
        const bgGlow = this.add.rectangle(cx, H / 2, W, H, 0x0a0a1e).setAlpha(0).setDepth(1);

        // Bintang-bintang kecil random di background
        const starGraphics = this.add.graphics().setDepth(2).setAlpha(0);
        for (let i = 0; i < 120; i++) {
            const sx   = Phaser.Math.Between(0, W);
            const sy   = Phaser.Math.Between(0, H);
            const size = Phaser.Math.FloatBetween(0.5, 2.2);
            const alpha = Phaser.Math.FloatBetween(0.3, 1.0);
            starGraphics.fillStyle(0xffffff, alpha);
            starGraphics.fillCircle(sx, sy, size);
        }

        // ── Fade in background ─────────────────────────────────
        this.tweens.add({
            targets:  [bg, bgGlow],
            alpha:    { from: 0, to: 1 },
            duration: 1200,
            ease:     'Power2'
        });
        this.tweens.add({
            targets:  starGraphics,
            alpha:    { from: 0, to: 0.6 },
            duration: 1800,
            ease:     'Power2'
        });

        // ── Konten kredit ──────────────────────────────────────
        // Semua teks dikumpulkan dalam container, lalu di-scroll
        const container = this.add.container(0, 0).setDepth(5);

        // Fungsi helper buat teks dalam container
        const addText = (y, text, style) => {
            const t = this.add.text(cx, y, text, style).setOrigin(0.5, 0);
            container.add(t);
            return t;
        };

        // ── Susun konten dari Y awal ───────────────────────────
        let y = 0; // posisi relatif dalam container
        const lineH = H * 0.07;   // jarak antar baris normal
        const bigH  = H * 0.10;   // jarak setelah judul besar

        // Judul utama
        addText(y, '✦ WORD ARRANGE GAME ✦', {
            fontFamily: 'PixeloidSans-Bold',
            fontSize:   fs(44),
            color:      '#FFD700'
        });
        y += bigH * 1.4;

        // Versi
        addText(y, 'Version 1.0', {
            fontFamily: 'PixeloidMono',
            fontSize:   fs(16),
            color:      '#888899'
        });
        y += lineH * 1.8;

        // ── Seksi: Developer ───────────────────────────────────
        addText(y, '— Developer —', {
            fontFamily: 'PixeloidSans-Bold',
            fontSize:   fs(22),
            color:      '#aabbff'
        });
        y += lineH;

        [
            ['Game Designer', 'Bayu Dian Permadi'],
            ['programmer', 'Andravito Brilian Satrya'],
            ['Document', 'Kurnia Haikal'],
        ].forEach(([label, value]) => {
            addText(y, label, {
            fontFamily: 'PixeloidSans-Bold',
            fontSize:   fs(14),
            color:      '#888899'
            });
            y += lineH * 0.65;
            addText(y, value, {
                fontFamily: 'PixeloidMono',
                fontSize:   fs(18),
                color:      '#00FF99'
            });
            y += lineH * 1.1;
        })

        // ── Seksi: Tools & Engine ──────────────────────────────
        addText(y, '— Built With —', {
            fontFamily: 'PixeloidSans-Bold',
            fontSize:   fs(22),
            color:      '#aabbff'
        });
        y += lineH;

        [
            ['Game Engine',   'Phaser 3'],
            ['Language',      'JavaScript (ES6 Modules)'],
        ].forEach(([label, value]) => {
            addText(y, label, {
                fontFamily: 'PixeloidSans',
                fontSize:   fs(14),
                color:      '#888899'
            });
            y += lineH * 0.65;
            addText(y, value, {
                fontFamily: 'PixeloidMono',
                fontSize:   fs(18),
                color:      '#00FF99'
            });
            y += lineH * 1.1;
        });

        y += lineH * 0.5;

        // ── Seksi: Font Credit ─────────────────────────────────
        addText(y, '— Font ─', {
            fontFamily: 'PixeloidSans-Bold',
            fontSize:   fs(22),
            color:      '#aabbff'
        });
        y += lineH;

        addText(y, 'PixeloidSans  PixeloidSans-Bold  PixeloidMono', {
            fontFamily: 'PixeloidSans',
            fontSize:   fs(18),
            color:      '#ffffff'
        });
        y += lineH * 0.8;

        addText(y, 'by GGBotNet — itch.io/ggbot', {
            fontFamily: 'PixeloidMono',
            fontSize:   fs(14),
            color:      '#888899'
        });
        y += lineH * 2.0;

        // ── Seksi: Special Thanks ──────────────────────────────
        addText(y, '— Special Thanks —', {
            fontFamily: 'PixeloidSans-Bold',
            fontSize:   fs(22),
            color:      '#aabbff'
        });
        y += lineH;

        [
            'Semua yang sudah mencoba game ini',
            'Teman-teman yang sudah support',
            'Keluarga tercinta ♥',
        ].forEach(name => {
            addText(y, name, {
                fontFamily: 'PixeloidSans',
                fontSize:   fs(18),
                color:      '#ffffff'
            });
            y += lineH;
        });

        y += lineH;

        // ── Penutup ────────────────────────────────────────────
        addText(y, '✦  ✦  ✦', {
            fontFamily: 'PixeloidSans-Bold',
            fontSize:   fs(20),
            color:      '#FFD700'
        });
        y += lineH * 1.2;

        addText(y, 'Terima kasih sudah bermain!', {
            fontFamily: 'PixeloidSans-Bold',
            fontSize:   fs(28),
            color:      '#FFD700'
        });
        y += lineH * 2.5;

        // ── Posisi awal container: teks mulai dari bawah layar ─
        const totalContentH = y;                   // total tinggi konten
        const startY        = H;                    // mulai tepat di bawah layar
        const endY          = -totalContentH;       // berakhir saat konten habis melewati atas

        container.setY(startY);

        // ── Delay sedikit setelah bg fade selesai, baru scroll ─
        const scrollDuration = Math.max(totalContentH * 12, 12000); // ~12px per detik

        this.time.delayedCall(1000, () => {
            this.tweens.add({
                targets:  container,
                y:        endY,
                duration: scrollDuration,
                ease:     'Linear',
                onComplete: () => {
                    // Setelah selesai scroll → fade out lalu kembali ke Home
                    this.tweens.add({
                        targets:  this.cameras.main,
                        alpha:    0,
                        duration: 1000,
                        ease:     'Power2',
                        onComplete: () => this.scene.start('HomeScene')
                    });
                }
            });
        });

        // ── Tombol Skip (muncul setelah 1 detik) ──────────────
        const skipBtn = this.add.text(W - 30, 30, '[ Skip ]', {
            fontFamily:      'PixeloidSans',
            fontSize:        fs(16),
            color:           '#666677',
            backgroundColor: '#111122',
            padding:         { x: 12, y: 7 }
        }).setOrigin(1, 0).setInteractive({ useHandCursor: true }).setDepth(10).setAlpha(0);

        this.time.delayedCall(800, () => {
            this.tweens.add({ targets: skipBtn, alpha: 1, duration: 500 });
        });

        skipBtn.on('pointerover', () => skipBtn.setStyle({ color: '#ffffff', backgroundColor: '#333355' }));
        skipBtn.on('pointerout',  () => skipBtn.setStyle({ color: '#666677', backgroundColor: '#111122' }));
        skipBtn.on('pointerdown', () => {
            this.tweens.killAll();
            this.cameras.main.fade(600, 0, 0, 0, false, (cam, progress) => {
                if (progress === 1) this.scene.start('HomeScene');
            });
        });

        // ── Garis top & bottom agar teks tidak terlihat di luar area ─
        // Mask area: teks hanya terlihat di dalam layar (bukan di luar atas/bawah)
        const maskShape = this.make.graphics();
        maskShape.fillStyle(0xffffff);
        maskShape.fillRect(0, 0, W, H);
        const mask = maskShape.createGeometryMask();
        container.setMask(mask);
    }
}