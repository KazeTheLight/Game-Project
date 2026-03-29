import { SaveManager } from '../SaveManager.js';

export default class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    preload() {
        this.cache.json.remove('sentences');
        this.load.json('sentences', 'assets/data/sentences.json');
        this.load.image('background', 'assets/gameplaybg.png');
        this.load.image('kembali','assets/back.png');
        this.load.audio('bgs', 'assets/sound/gssound.ogg');
    }

    init(data) {
        this.level         = Number(data.level) || 1;
        this.questionIndex = Number(data.questionIndex) || 0;
        this.score         = Number(data.score) || 0;
        this.lives         = Number(data.lives) || 3;
        this.correctCount  = Number(data.correctCount) || 0;
    }

    create() {
        if (!this.sound.get('bgs')) {
            this.music = this.sound.add('bgs', { loop: true, volume: 0.5 });
            this.music.play();
        } else {
            this.music = this.sound.get('bgs');
        }
        const W  = this.scale.width;
        const H  = this.scale.height;
        const cx = W / 2;

        this.add.image(0, 0, 'background')
            .setOrigin(0, 0)
            .setDisplaySize(W, H);

        const data      = this.cache.json.get('sentences');
        const sentences = data.levels[this.level];

        if (!sentences) {
            console.error("Sentences not found for level:", this.level);
            return;
        }

        const sentenceObj    = sentences[this.questionIndex];
        this.correctWords    = sentenceObj.text.split(' ');
        const translation    = sentenceObj.translation;
        const wordTrans      = sentenceObj.wordTranslations || {};

        this.playerWords     = [];
        this.totalQuestions  = sentences.length;
        this.scorePerCorrect = 20;
        this.wordButtons     = [];
        this.answerSlots     = [];

        // Kriteria lulus level
        this.MIN_CORRECT  = 3;
        this.MIN_SCORE    = 60;

        const shuffled = Phaser.Utils.Array.Shuffle([...this.correctWords]);

        const fs = (n) => `${Math.round(n * W / 800)}px`;

        // ── Posisi papan tulis ─────────────────────────────────
        const boardLeft  = W * 0.235;
        const boardRight = W * 0.775;
        const boardTop   = H * 0.195;
        const boardBot   = H * 0.565;
        const boardW     = boardRight - boardLeft;
        const boardCX    = boardLeft + boardW / 2;
        const boardH     = boardBot - boardTop;

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

        // ── Counter jawaban benar (kiri bawah score) ───────────
        this.correctCountText = this.add.text(W * 0.02, H * 0.08,
            `✓ Benar: ${this.correctCount}/${this.MIN_CORRECT}`, {
            fontFamily: 'PixeloidMono',
            fontSize:   fs(13),
            color:      this.correctCount >= this.MIN_CORRECT ? '#00FF99' : '#aaffaa'
        }).setDepth(1);

        // ── Hint kriteria lulus (kanan bawah lives) ────────────
        this.add.text(W * 0.98, H * 0.08,
            `🎯 Lulus: min. ${this.MIN_CORRECT} benar / ${this.MIN_SCORE} skor`, {
            fontFamily: 'PixeloidSans',
            fontSize:   fs(12),
            color:      '#ffcc44',
            align:      'right'
        }).setOrigin(1, 0).setDepth(1);

        // ── Terjemahan Kalimat ─────────────────────────────────
        const transBoxW = boardW * 0.88;
        const transBoxH = H * 0.09;
        const transY    = boardTop + boardH * 0.18;

        this.translationBox = this.add.rectangle(boardCX, transY, transBoxW, transBoxH, 0x1a1a2e)
            .setVisible(false)
            .setStrokeStyle(2, 0xFFD700)
            .setDepth(3);

        this.translationLabel = this.add.text(
            boardCX - transBoxW / 2 + 10,
            transY - transBoxH / 2 + 4,
            'Terjemahan:', {
                fontFamily: 'PixeloidSans',
                fontSize:   fs(11),
                color:      '#888888'
            }
        ).setDepth(4).setVisible(false);

        this.translationText = this.add.text(boardCX, transY + 4, translation, {
            fontFamily: 'PixeloidSans, Arial',
            fontSize:   fs(15),
            color:      '#FFD700',
            wordWrap:   { width: transBoxW - 24 },
            align:      'center'
        }).setOrigin(0.5).setDepth(4).setVisible(false);

        // ── Area Jawaban + Slot ────────────────────────────────
        const slotCount  = this.correctWords.length;
        const slotPadY   = 5;
        const slotFontSz = Math.round(14 * W / 800);

        const maxCols2 = slotCount <= 5 ? slotCount : Math.ceil(slotCount / 2);
        const rowCount = Math.ceil(slotCount / maxCols2);

        const ansBoxW   = boardW * 0.88;
        const slotW     = Math.max(48, Math.floor((ansBoxW - 16) / maxCols2) - 10);
        const slotH     = slotFontSz + slotPadY * 2 + 4;
        const slotSpacX = slotW + 10;
        const slotSpacY = slotH + 14;

        const ansBoxH  = (slotH + 16) * rowCount + 20;
        const ansY     = boardTop + boardH * 0.58;

        this.answerBox = this.add.rectangle(boardCX, ansY, ansBoxW, ansBoxH, 0x222244)
            .setStrokeStyle(2, 0x5555aa)
            .setDepth(1);

        const slotStartX = boardCX - ((maxCols2 - 1) * slotSpacX) / 2;
        const slotStartY = ansY - ((rowCount - 1) * slotSpacY) / 2;

        this.correctWords.forEach((_, i) => {
            const col = i % maxCols2;
            const row = Math.floor(i / maxCols2);
            const sx  = slotStartX + col * slotSpacX;
            const sy  = slotStartY + row * slotSpacY;

            const slotBg = this.add.rectangle(sx, sy, slotW, slotH, 0x333366)
                .setStrokeStyle(1, 0x7777bb)
                .setDepth(2);

            const slotTxt = this.add.text(sx, sy, '____', {
                fontFamily: 'PixeloidSans',
                fontSize:   `${slotFontSz}px`,
                color:      '#555588',
                align:      'center'
            }).setOrigin(0.5).setDepth(3);

            this.answerSlots.push({
                index:   i,
                x:       sx,
                y:       sy,
                w:       slotW,
                h:       slotH,
                bg:      slotBg,
                txt:     slotTxt,
                word:    null,
                wordBtn: null
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
        const rowSpacing = H * 0.09;
        const btnStartX  = cx - ((maxCols - 1) * colSpacing) / 2;
        const btnStartY  = H * 0.65;

        shuffled.forEach((word, index) => {
            const col   = index % maxCols;
            const row   = Math.floor(index / maxCols);
            const origX = btnStartX + col * colSpacing;
            const origY = btnStartY + row * rowSpacing;
            const hint  = wordTrans[word] || '';

            const wordBtn = this.add.text(origX, origY, word, {
                fontFamily:      'PixeloidSans',
                fontSize:        fs(15),
                color:           '#ffffff',
                backgroundColor: '#444466',
                padding:         { x: 10, y: 6 }
            }).setOrigin(0.5).setInteractive({ draggable: true }).setDepth(5);

            wordBtn.origX  = origX;
            wordBtn.origY  = origY;
            wordBtn.word   = word;
            wordBtn.placed = false;

            this.wordButtons.push(wordBtn);

            wordBtn.on('pointerover', () => {
                if (!wordBtn.placed) wordBtn.setStyle({ backgroundColor: '#6666aa' });
                if (hint && !wordBtn.placed) {
                    const bx = wordBtn.x;
                    const by = wordBtn.y - wordBtn.height - 10;
                    const bw = Math.max(hint.length * (W / 800) * 9 + 24, 80);
                    this.tooltipShadow.setPosition(bx + 3, by + 3).setSize(bw, 38).setVisible(true);
                    this.tooltipBox.setPosition(bx, by).setSize(bw, 38).setVisible(true);
                    this.tooltipText.setPosition(bx, by).setText(hint).setVisible(true);
                }
            });

            wordBtn.on('pointerout', () => {
                if (!wordBtn.placed) wordBtn.setStyle({ backgroundColor: '#444466' });
                this._hideTooltip();
            });

            wordBtn.on('dragstart', () => {
                if (wordBtn.placed) return;
                this._hideTooltip();
                wordBtn.setDepth(30);
                wordBtn.setStyle({ backgroundColor: '#8888cc' });
                this.answerSlots.forEach(slot => {
                    if (!slot.word) slot.bg.setStrokeStyle(2, 0xFFD700);
                });
            });

            wordBtn.on('drag', (pointer, dragX, dragY) => {
                if (wordBtn.placed) return;
                wordBtn.setPosition(dragX, dragY);
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

            wordBtn.on('dragend', () => {
                if (wordBtn.placed) return;
                wordBtn.setDepth(5);
                this.answerSlots.forEach(slot => {
                    if (!slot.word) {
                        slot.bg.setFillStyle(0x333366);
                        slot.bg.setStrokeStyle(1, 0x7777bb);
                    }
                });

                let nearest     = null;
                let nearestDist = Infinity;
                const snapRadius = slotW * 1.2;

                this.answerSlots.forEach(slot => {
                    if (slot.word) return;
                    const dist = Phaser.Math.Distance.Between(wordBtn.x, wordBtn.y, slot.x, slot.y);
                    if (dist < snapRadius && dist < nearestDist) {
                        nearest     = slot;
                        nearestDist = dist;
                    }
                });

                if (nearest) {
                    this._placeWordInSlot(wordBtn, nearest, sentences);
                } else {
                    this._returnWordBtn(wordBtn);
                }
            });
        });

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
                lives:         this.lives,
                correctCount:  this.correctCount
            });
        });

        // ── Tombol Back ────────────────────────────────────────
        const btnBack = this.add.image(W * 0.04, H * 0.95, 'kembali');
        btnBack.setInteractive();
        btnBack.setScale(0.3);
        btnBack.on('pointerdown', () => {
            if (this.music) this.music.stop();
            this.scene.start('LevelSelectScene');
        });
    }

    // ── Snap kata ke slot ──────────────────────────────────────
    _placeWordInSlot(wordBtn, slot, sentences) {
        slot.word      = wordBtn.word;
        slot.wordBtn   = wordBtn;
        wordBtn.placed = true;

        wordBtn.setAlpha(0.3);
        wordBtn.setPosition(wordBtn.origX, wordBtn.origY);
        wordBtn.disableInteractive();

        slot.txt.setText(wordBtn.word);
        slot.txt.setColor('#00FF99');
        slot.bg.setFillStyle(0x224422);
        slot.bg.setStrokeStyle(2, 0x00FF99);

        this.tweens.add({
            targets:  slot.txt,
            scaleX:   1.08,
            scaleY:   1.08,
            duration: 80,
            yoyo:     true,
            ease:     'Power1'
        });

        this.playerWords = this.answerSlots.map(s => s.word || '');

        const allFilled = this.answerSlots.every(s => s.word);
        if (allFilled) {
            this.translationBox.setVisible(true);
            this.translationLabel.setVisible(true);
            this.translationText.setVisible(true);
            this.playerWords = this.answerSlots.map(s => s.word);
            this.checkAnswer(sentences);
        }
    }

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

        this.time.delayedCall(600, () => {
            if (isCorrect) {
                // ── BENAR ──────────────────────────────────────
                this.score        += this.scorePerCorrect;
                this.correctCount += 1;
                this.scoreText.setText(`Score: ${this.score}`);
                this.correctCountText.setText(`✓ Benar: ${this.correctCount}/${this.MIN_CORRECT}`);
                if (this.correctCount >= this.MIN_CORRECT) {
                    this.correctCountText.setColor('#00FF99');
                }

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
                            lives:         this.lives,
                            correctCount:  this.correctCount
                        });
                    } else {
                        this.checkLevelResult();
                    }
                });

            } else {
                // ── SALAH: kurangi nyawa, lanjut ke soal berikutnya ──
                this.lives -= 1;
                this.livesText.setText(`♥ ${this.lives}`);

                this.answerSlots.forEach(s => {
                    s.bg.setFillStyle(0x330000);
                    s.bg.setStrokeStyle(2, 0xff4444);
                });

                if (this.lives <= 0) {
                    // Nyawa habis
                    this.add.text(cx, H * 0.82, 'Nyawa Habis!', {
                        fontFamily: 'PixeloidSans-Bold',
                        fontSize:   fs(22),
                        color:      '#ff0000'
                    }).setOrigin(0.5).setDepth(5);

                    this.time.delayedCall(800, () => {
                        this._handleLivesOut();
                    });

                } else {
                    // Masih ada nyawa — lanjut soal berikutnya (BUKAN reset soal sama)
                    this.add.text(cx, H * 0.82, `✗ Salah! Sisa nyawa: ${this.lives}`, {
                        fontFamily: 'PixeloidSans-Bold',
                        fontSize:   fs(18),
                        color:      '#ff4444'
                    }).setOrigin(0.5).setDepth(5);

                    this.time.delayedCall(1200, () => {
                        const nextIndex = this.questionIndex + 1;
                        if (nextIndex < sentences.length) {
                            // Lanjut soal berikutnya
                            this.scene.restart({
                                level:         this.level,
                                questionIndex: nextIndex,
                                score:         this.score,
                                lives:         this.lives,
                                correctCount:  this.correctCount
                            });
                        } else {
                            // Soal habis (selesai di soal terakhir dan salah)
                            this.checkLevelResult();
                        }
                    });
                }
            }
        });
    }

    /**
     * Dipanggil saat nyawa = 0.
     * Kriteria lulus: benar >= MIN_CORRECT ATAU score >= MIN_SCORE
     * Lulus  → popup UIScene (Level Complete)
     * Gagal  → GameOverScene
     */
    _handleLivesOut() {
        const passed = (this.correctCount >= this.MIN_CORRECT) || (this.score >= this.MIN_SCORE);

        if (passed) {
            SaveManager.recordLevelResult(this.level, this.score, this.correctCount);
            this.scene.start('UIScene', {
                level:        this.level,
                score:        this.score,
                correctCount: this.correctCount
            });
        } else {
            this.scene.start('GameOverScene', {
                level:        this.level,
                score:        this.score,
                correctCount: this.correctCount
            });
        }
    }

    checkLevelResult() {
        const passed = (this.correctCount >= this.MIN_CORRECT) || (this.score >= this.MIN_SCORE);

        if (passed) {
            SaveManager.recordLevelResult(this.level, this.score, this.correctCount);
            this.scene.start('UIScene', {
                level:        this.level,
                score:        this.score,
                correctCount: this.correctCount
            });
        } else {
            const W  = this.scale.width;
            const H  = this.scale.height;
            const cx = W / 2;
            const fs = (n) => `${Math.round(n * W / 800)}px`;

            this.add.text(cx, H * 0.65,
                `Score: ${this.score}  |  Benar: ${this.correctCount}/${this.totalQuestions}\nMinimal ${this.MIN_CORRECT} soal benar atau ${this.MIN_SCORE} skor untuk lulus!`, {
                fontFamily: 'PixeloidSans-Bold',
                fontSize:   fs(18),
                color:      '#ff8800',
                align:      'center'
            }).setOrigin(0.5).setDepth(5);

            this.time.delayedCall(2500, () => {
                this.scene.start('GameOverScene', {
                    level:        this.level,
                    score:        this.score,
                    correctCount: this.correctCount
                });
            });
        }
    }
}
