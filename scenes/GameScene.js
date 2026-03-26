export default class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    preload() {
        this.cache.json.remove('sentences');
        this.load.json('sentences', 'assets/data/sentences.json');
    }

    init(data) {
        this.level         = Number(data.level) || 1;
        this.questionIndex = Number(data.questionIndex) || 0;
        this.score         = Number(data.score) || 0;
        this.lives         = Number(data.lives) || 3;
    }

    create() {
        // ── Responsif: ambil ukuran layar saat ini ─────────────
        const W = this.scale.width;
        const H = this.scale.height;
        const cx = W / 2;

        const data      = this.cache.json.get('sentences');
        const sentences = data.levels[this.level];

        if (!sentences) {
            console.error("Sentences not found for level:", this.level);
            return;
        }

        const sentenceObj = sentences[this.questionIndex];
        this.correctWords = sentenceObj.text.split(' ');
        const translation = sentenceObj.translation;
        const wordTrans   = sentenceObj.wordTranslations || {};

        this.playerWords     = [];   // kata yang sudah di-drop ke slot
        this.totalQuestions  = sentences.length;
        this.scorePerCorrect = 20;

        // wordBtn objects tetap ada (sumber drag)
        this.wordButtons     = [];
        // slot objects di area jawaban
        this.answerSlots     = [];

        const shuffled = Phaser.Utils.Array.Shuffle([...this.correctWords]);

        // ── Skala font relatif terhadap lebar layar ────────────
        const fs = (n) => `${Math.round(n * W / 800)}px`;

        // ── UI Header ──────────────────────────────────────────
        this.add.text(cx, H * 0.05, `Level ${this.level}`, {
            fontFamily: 'PixeloidSans-Bold',
            fontSize:   fs(28),
            color:      '#FFD700'
        }).setOrigin(0.5).setDepth(1);

        this.add.text(cx, H * 0.11, `Soal ${this.questionIndex + 1} / ${this.totalQuestions}`, {
            fontFamily: 'PixeloidSans',
            fontSize:   fs(16),
            color:      '#ffffff'
        }).setOrigin(0.5).setDepth(1);

        this.scoreText = this.add.text(W * 0.02, H * 0.03, `Score: ${this.score}`, {
            fontFamily: 'PixeloidMono',
            fontSize:   fs(16),
            color:      '#00FF99'
        }).setDepth(1);

        this.livesText = this.add.text(W * 0.98, H * 0.03, `♥ ${this.lives}`, {
            fontFamily: 'PixeloidMono',
            fontSize:   fs(16),
            color:      '#ff4444'
        }).setOrigin(1, 0).setDepth(1);

        // ── Terjemahan Kalimat ─────────────────────────────────
        const transY = H * 0.20;
        const boxW   = W * 0.88;
        const boxH   = H * 0.07;

        this.translationBox = this.add.rectangle(cx, transY, boxW, boxH, 0x1a1a2e)
            .setVisible(false)
            .setStrokeStyle(2, 0xFFD700)
            .setDepth(1);

        this.translationLabel = this.add.text(cx - boxW / 2 + 10, transY - boxH / 2 + 4, 'Terjemahan:', {
            fontFamily: 'PixeloidSans',
            fontSize:   fs(11),
            color:      '#888888'
        }).setDepth(2).setVisible(false);

        this.translationText = this.add.text(cx, transY + 4, translation, {
            fontFamily: 'PixeloidSans, Arial',
            fontSize:   fs(15),
            color:      '#FFD700',
            wordWrap:   { width: boxW - 24 },
            align:      'center'
        }).setOrigin(0.5).setDepth(2).setVisible(false);

        // ── Area Jawaban + Slot ────────────────────────────────
        const ansY  = H * 0.35;
        const ansH  = H * 0.10;

        this.answerBox = this.add.rectangle(cx, ansY, boxW, ansH, 0x222244)
            .setStrokeStyle(2, 0x5555aa)
            .setDepth(1);

        // Hitung ukuran & posisi setiap slot
        const slotCount   = this.correctWords.length;
        const slotPadX    = 14;
        const slotPadY    = 6;
        const slotFontSz  = Math.round(18 * W / 800);
        const slotW       = Math.max(60, Math.round(W * 0.10));
        const slotH       = slotFontSz + slotPadY * 2 + 4;
        const slotSpacing = Math.min(slotW + 12, (boxW - 24) / slotCount);
        const slotStartX  = cx - ((slotCount - 1) * slotSpacing) / 2;

        this.correctWords.forEach((_, i) => {
            const sx = slotStartX + i * slotSpacing;
            const sy = ansY;

            // Kotak slot
            const slotBg = this.add.rectangle(sx, sy, slotW, slotH, 0x333366)
                .setStrokeStyle(1, 0x7777bb)
                .setDepth(2);

            // Teks placeholder
            const slotTxt = this.add.text(sx, sy, '____', {
                fontFamily: 'PixeloidSans',
                fontSize:   `${slotFontSz}px`,
                color:      '#555588',
                align:      'center'
            }).setOrigin(0.5).setDepth(3);

            this.answerSlots.push({
                index:    i,
                x:        sx,
                y:        sy,
                w:        slotW,
                h:        slotH,
                bg:       slotBg,
                txt:      slotTxt,
                word:     null,   // kata yang sudah di-drop di sini
                wordBtn:  null    // referensi ke wordBtn sumber
            });
        });

        // ── Tooltip ────────────────────────────────────────────
        this.tooltipShadow = this.add.rectangle(0, 0, 160, 38, 0x000000, 0.5)
            .setVisible(false).setDepth(19);

        this.tooltipBox = this.add.rectangle(0, 0, 160, 38, 0x111133)
            .setStrokeStyle(1, 0xFFD700)
            .setVisible(false).setDepth(20);

        this.tooltipText = this.add.text(0, 0, '', {
            fontFamily: 'PixeloidSans, Arial',
            fontSize:   fs(13),
            color:      '#FFD700',
            align:      'center'
        }).setOrigin(0.5).setVisible(false).setDepth(21);

        // ── Tombol Kata (Sumber Drag) ──────────────────────────
        const maxCols    = Math.min(shuffled.length, 5);
        const colSpacing = W * 0.15;
        const rowSpacing = H * 0.10;
        const btnStartX  = cx - ((maxCols - 1) * colSpacing) / 2;
        const btnStartY  = H * 0.55;

        shuffled.forEach((word, index) => {
            const col    = index % maxCols;
            const row    = Math.floor(index / maxCols);
            const origX  = btnStartX + col * colSpacing;
            const origY  = btnStartY + row * rowSpacing;

            const hint = wordTrans[word] || '';

            const wordBtn = this.add.text(origX, origY, word, {
                fontFamily:      'PixeloidSans',
                fontSize:        fs(16),
                color:           '#ffffff',
                backgroundColor: '#444466',
                padding:         { x: 10, y: 6 }
            }).setOrigin(0.5).setInteractive({ draggable: true }).setDepth(5);

            // Simpan posisi asal & metadata
            wordBtn.origX  = origX;
            wordBtn.origY  = origY;
            wordBtn.word   = word;
            wordBtn.placed = false;   // sudah di-drop ke slot?

            this.wordButtons.push(wordBtn);

            // ── Hover tooltip ──────────────────────────────────
            wordBtn.on('pointerover', () => {
                if (!wordBtn.placed) {
                    wordBtn.setStyle({ backgroundColor: '#6666aa' });
                }
                if (hint && !wordBtn.placed) {
                    const bx   = wordBtn.x;
                    const by   = wordBtn.y - wordBtn.height - 10;
                    const bw   = Math.max(hint.length * (W / 800) * 9 + 24, 80);
                    this.tooltipShadow.setPosition(bx + 3, by + 3).setSize(bw, 38).setVisible(true);
                    this.tooltipBox.setPosition(bx, by).setSize(bw, 38).setVisible(true);
                    this.tooltipText.setPosition(bx, by).setText(hint).setVisible(true);
                }
            });

            wordBtn.on('pointerout', () => {
                if (!wordBtn.placed) {
                    wordBtn.setStyle({ backgroundColor: '#444466' });
                }
                this._hideTooltip();
            });

            // ── Drag mulai ─────────────────────────────────────
            wordBtn.on('dragstart', () => {
                if (wordBtn.placed) return;
                this._hideTooltip();
                wordBtn.setDepth(30);
                wordBtn.setStyle({ backgroundColor: '#8888cc' });

                // Highlight semua slot kosong
                this.answerSlots.forEach(slot => {
                    if (!slot.word) {
                        slot.bg.setStrokeStyle(2, 0xFFD700);
                    }
                });
            });

            // ── Sedang di-drag ─────────────────────────────────
            wordBtn.on('drag', (pointer, dragX, dragY) => {
                if (wordBtn.placed) return;
                wordBtn.setPosition(dragX, dragY);

                // Highlight slot terdekat
                this.answerSlots.forEach(slot => {
                    if (slot.word) return;
                    const dist = Phaser.Math.Distance.Between(dragX, dragY, slot.x, slot.y);
                    if (dist < slotW * 0.9) {
                        slot.bg.setFillStyle(0x444488);
                    } else {
                        slot.bg.setFillStyle(0x333366);
                        slot.bg.setStrokeStyle(2, 0xFFD700);
                    }
                });
            });

            // ── Drag selesai ───────────────────────────────────
            wordBtn.on('dragend', (pointer) => {
                if (wordBtn.placed) return;

                wordBtn.setDepth(5);
                // Reset highlight slot
                this.answerSlots.forEach(slot => {
                    if (!slot.word) {
                        slot.bg.setFillStyle(0x333366);
                        slot.bg.setStrokeStyle(1, 0x7777bb);
                    }
                });

                // Cari slot kosong terdekat dalam radius
                let nearest     = null;
                let nearestDist = Infinity;
                const snapRadius = slotW * 1.0;

                this.answerSlots.forEach(slot => {
                    if (slot.word) return;
                    const dist = Phaser.Math.Distance.Between(
                        wordBtn.x, wordBtn.y, slot.x, slot.y
                    );
                    if (dist < snapRadius && dist < nearestDist) {
                        nearest     = slot;
                        nearestDist = dist;
                    }
                });

                if (nearest) {
                    // ── Snap ke slot ───────────────────────────
                    this._placeWordInSlot(wordBtn, nearest, sentences);
                } else {
                    // ── Kembalikan ke posisi asal ──────────────
                    this._returnWordBtn(wordBtn);
                }
            });
        });

        // ── Input plugin drag ──────────────────────────────────
        this.input.on('drag', (pointer, obj, dragX, dragY) => {
            obj.emit('drag', pointer, dragX, dragY);
        });

        // ── Tombol Reset ───────────────────────────────────────
        const resetBtn = this.add.text(cx, H * 0.93, '[ Reset ]', {
            fontFamily: 'PixeloidSans',
            fontSize:   fs(16),
            color:      '#aaaaaa'
        }).setOrigin(0.5).setInteractive().setDepth(5);

        resetBtn.on('pointerover', () => resetBtn.setColor('#ffffff'));
        resetBtn.on('pointerout',  () => resetBtn.setColor('#aaaaaa'));
        resetBtn.on('pointerdown', () => {
            this.scene.restart({
                level:         this.level,
                questionIndex: this.questionIndex,
                score:         this.score,
                lives:         this.lives
            });
        });

        const btnBack= this.add.text(50, 800, "back" ,
            { backgroundColor: '#444', padding: 10 }).setInteractive().setOrigin(0.5);

        btnBack.on('pointerdown', () => {
            this.scene.start('LevelSelectScene')
        });
    }

    // ── Snap kata ke slot ──────────────────────────────────────
    _placeWordInSlot(wordBtn, slot, sentences) {
        const W  = this.scale.width;
        const H  = this.scale.height;
        const cx = W / 2;
        const fs = (n) => `${Math.round(n * W / 800)}px`;

        slot.word    = wordBtn.word;
        slot.wordBtn = wordBtn;
        wordBtn.placed = true;

        // Sembunyikan wordBtn sumber, tampilkan kata di slot
        wordBtn.setAlpha(0.3);
        wordBtn.setPosition(wordBtn.origX, wordBtn.origY);
        wordBtn.disableInteractive();

        slot.txt.setText(wordBtn.word);
        slot.txt.setColor('#00FF99');
        slot.bg.setFillStyle(0x224422);
        slot.bg.setStrokeStyle(2, 0x00FF99);

        // Tween kecil pada slot teks
        this.tweens.add({
            targets:  slot.txt,
            scaleX:   1.08,
            scaleY:   1.08,
            duration: 80,
            yoyo:     true,
            ease:     'Power1'
        });

        // Kumpulkan kata yang sudah di slot (urut index)
        this.playerWords = this.answerSlots.map(s => s.word || '');

        // Tampilkan terjemahan bila semua slot terisi
        const allFilled = this.answerSlots.every(s => s.word);
        if (allFilled) {
            this.translationBox.setVisible(true);
            this.translationLabel.setVisible(true);
            this.translationText.setVisible(true);
            this.playerWords = this.answerSlots.map(s => s.word);
            this.checkAnswer(sentences);
        }
    }

    // ── Kembalikan wordBtn ke posisi asal ──────────────────────
    _returnWordBtn(wordBtn) {
        this.tweens.add({
            targets:  wordBtn,
            x:        wordBtn.origX,
            y:        wordBtn.origY,
            duration: 200,
            ease:     'Back.Out'
        });
        wordBtn.setStyle({ backgroundColor: '#444466' });
    }

    _hideTooltip() {
        this.tooltipShadow.setVisible(false);
        this.tooltipBox.setVisible(false);
        this.tooltipText.setVisible(false);
    }

    checkAnswer(sentences) {
        if (this.playerWords.length !== this.correctWords.length) return;

        const W  = this.scale.width;
        const H  = this.scale.height;
        const cx = W / 2;
        const fs = (n) => `${Math.round(n * W / 800)}px`;

        const isCorrect = this.playerWords.join(' ') === this.correctWords.join(' ');

        // ── Delay 600ms sebelum feedback muncul ───────────────
        this.time.delayedCall(600, () => {

            if (isCorrect) {
                this.score += this.scorePerCorrect;
                this.scoreText.setText(`Score: ${this.score}`);

                // Warnai semua slot hijau
                this.answerSlots.forEach(s => {
                    s.bg.setFillStyle(0x003300);
                    s.bg.setStrokeStyle(2, 0x00ff99);
                });

                this.add.text(cx, H * 0.82, '✓ Benar! +20', {
                    fontFamily: 'PixeloidSans-Bold',
                    fontSize:   fs(20),
                    color:      '#00ff99'
                }).setOrigin(0.5).setDepth(5);

                this.time.delayedCall(1000, () => {
                    const nextIndex = this.questionIndex + 1;
                    if (nextIndex < sentences.length) {
                        this.scene.restart({
                            level:         this.level,
                            questionIndex: nextIndex,
                            score:         this.score,
                            lives:         this.lives
                        });
                    } else {
                        this.checkLevelResult();
                    }
                });

            } else {
                this.lives -= 1;
                this.livesText.setText(`♥ ${this.lives}`);

                // Warnai slot merah & kembalikan kata ke asal
                this.answerSlots.forEach(s => {
                    s.bg.setFillStyle(0x330000);
                    s.bg.setStrokeStyle(2, 0xff4444);
                });

                if (this.lives <= 0) {
                    this.add.text(cx, H * 0.82, 'Nyawa Habis!', {
                        fontFamily: 'PixeloidSans-Bold',
                        fontSize:   fs(22),
                        color:      '#ff0000'
                    }).setOrigin(0.5).setDepth(5);

                    this.time.delayedCall(800, () => {
                        this.scene.start('GameOverScene', { level: this.level });
                    });

                } else {
                    this.add.text(cx, H * 0.82, `X Salah! Sisa nyawa: ${this.lives}`, {
                        fontFamily: 'PixeloidSans-Bold',
                        fontSize:   fs(18),
                        color:      '#ff4444'
                    }).setOrigin(0.5).setDepth(5);

                    this.time.delayedCall(1200, () => {
                        this.scene.restart({
                            level:         this.level,
                            questionIndex: this.questionIndex,
                            score:         this.score,
                            lives:         this.lives
                        });
                    });
                }
            }

        }); // ── end delayedCall 600ms ──────────────────────────
    }

    checkLevelResult() {
        const W  = this.scale.width;
        const H  = this.scale.height;
        const cx = W / 2;
        const fs = (n) => `${Math.round(n * W / 800)}px`;

        const passed = this.score >= 75;

        if (passed) {
            this.scene.start('UIScene', {
                level: this.level,
                score: this.score
            });
        } else {
            this.add.text(cx, H * 0.65, `Score ${this.score}/100\nMinimal 75 untuk lulus!`, {
                fontFamily: 'PixeloidSans-Bold',
                fontSize:   fs(20),
                color:      '#ff8800',
                align:      'center'
            }).setOrigin(0.5).setDepth(5);

            this.time.delayedCall(2000, () => {
                this.scene.start('GameScene', {
                    level:         this.level,
                    questionIndex: 0,
                    score:         0,
                    lives:         this.lives
                });
            });
        }
    }
}