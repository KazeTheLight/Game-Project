import { SaveManager } from '../SaveManager.js';

export default class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    preload() {
        this.cache.json.remove('sentences');
        this.load.json('sentences', 'assets/data/sentences.json');
        this.load.image('background', 'assets/gameplaybg.png');
        this.load.image('kembali', 'assets/back.png');
        this.load.audio('bgs', 'assets/sound/gssound.ogg');
    }

    init(data) {
        this.level         = Number(data.level)        || 1;
        this.questionIndex = Number(data.questionIndex) || 0;
        this.score         = Number(data.score)        || 0;
        this.lives         = Number(data.lives)        || 3;
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
            console.error('Sentences not found for level:', this.level);
            return;
        }

        const sentenceObj = sentences[this.questionIndex];
        this.correctWords = sentenceObj.text.split(' ');
        const translation = sentenceObj.translation;
        const wordTrans   = sentenceObj.wordTranslations || {};

        this.playerWords     = [];
        this.totalQuestions  = sentences.length;
        this.scorePerCorrect = 20;
        this.wordButtons     = [];
        this.answerSlots     = [];

        // Kriteria lulus
        this.MIN_CORRECT = 3;
        this.MIN_SCORE   = 60;

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
            color:      '#FFD700',
            stroke: `#000000`,
            strokeThickness: 6
        }).setOrigin(0.5).setDepth(1);

        this.add.text(cx, H * 0.11, `Soal ${this.questionIndex + 1} / ${this.totalQuestions}`, {
            fontFamily: 'PixeloidSans',
            fontSize:   fs(16),
            color:      '#ffffff',
            stroke: `#000000`,
            strokeThickness: 6
        }).setOrigin(0.5).setDepth(1);

        this.scoreText = this.add.text(W * 0.02, H * 0.03, `Score: ${this.score}`, {
            fontFamily: 'PixeloidMono',
            fontSize:   fs(16),
            color:      '#00FF99'
        }).setDepth(1);

        this._tooltipBgScore   = this.add.rectangle(160,70, 280, 100, 0x1a1a2e)
            .setStrokeStyle(1, 0xFFD700).setVisible(true).setDepth(0);

        this.livesText = this.add.text(W * 0.98, H * 0.03, `♥ ${this.lives}`, {
            fontFamily: 'PixeloidMono',
            fontSize:   fs(16),
            color:      '#ff4444'
        }).setOrigin(1, 0).setDepth(1);

        // ── Counter jawaban benar ──────────────────────────────
        this.correctCountText = this.add.text(W * 0.02, H * 0.08,
            `✓ Benar: ${this.correctCount}/${this.MIN_CORRECT}`, {
            fontFamily: 'PixeloidMono',
            fontSize:   fs(13),
            color:      this.correctCount >= this.MIN_CORRECT ? '#00FF99' : '#aaffaa'
        }).setDepth(1);

        this._tooltipBgHealth   = this.add.rectangle(1620,70, 550, 100, 0x1a1a2e)
            .setStrokeStyle(1, 0xFFD700).setVisible(true).setDepth(0);

        // ── Hint kriteria lulus ────────────────────────────────
        this.add.text(W * 0.98, H * 0.08,
            `🎯 Lulus: min. ${this.MIN_CORRECT} benar / ${this.MIN_SCORE} skor`, {
            fontFamily: 'PixeloidSans',
            fontSize:   fs(12),
            color:      '#ffcc44',
            align:      'right'
        }).setOrigin(1, 0).setDepth(1);

        // ── Terjemahan Kalimat ─────────────────────────────────
        const transBoxW  = boardW * 0.88;
        const transBoxH  = H * 0.10;
        const transPadT  = H * 0.012;
        const transY     = boardTop + transPadT + transBoxH / 2;
        const transBot   = transY + transBoxH / 2;

        this.translationBox = this.add.rectangle(boardCX, transY, transBoxW, transBoxH, 0x1a1a2e)
            .setVisible(false).setStrokeStyle(2, 0xFFD700).setDepth(3);

        // Auto-scale font terjemahan agar muat dalam kotak (max 15, min 9)
        const transInnerW = transBoxW - 24;
        const transInnerH = transBoxH - 16;
        let transFontSz = Math.round(15 * W / 800);
        const transFontMin = Math.round(9 * W / 800);

        // Buat teks sementara untuk mengukur, lalu hapus
        const _measureTrans = (sz) => {
            const t = this.add.text(0, -9999, translation, {
                fontFamily: 'PixeloidSans, Arial',
                fontSize:   `${sz}px`,
                wordWrap:   { width: transInnerW },
            }).setVisible(false);
            const bounds = t.getBounds();
            t.destroy();
            return { w: bounds.width, h: bounds.height };
        };

        while (transFontSz > transFontMin) {
            const b = _measureTrans(transFontSz);
            if (b.w <= transInnerW && b.h <= transInnerH) break;
            transFontSz -= 1;
        }

        this.translationText = this.add.text(boardCX, transY, translation, {
            fontFamily: 'PixeloidSans, Arial',
            fontSize:   `${transFontSz}px`,
            color:      '#FFD700',
            wordWrap:   { width: transInnerW },
            align:      'center'
        }).setOrigin(0.5).setDepth(4).setVisible(false);

        // ── Area Jawaban + Slot ────────────────────────────────
        const slotCount = this.correctWords.length;
        const slotPadY  = 4;

        // Ruang vertikal yang tersedia untuk kotak jawaban (dalam papan)
        const gapTransAns    = H * 0.025;                     // jarak terjemahan ↔ kotak jawaban
        const ansMarginBot   = H * 0.015;                     // jarak kotak jawaban ↔ bawah papan
        const availableH     = boardBot - transBot - gapTransAns - ansMarginBot;

        // Lebar maksimum grid slot
        const maxGridW = boardW * 0.86;

        // Estimasi lebar slot dari kata terpanjang
        const longestWord = this.correctWords.reduce((a, b) => b.length > a.length ? b : a, '');
        const charPxEst   = 9 * W / 800;
        const slotW       = Math.max(Math.ceil(longestWord.length * charPxEst) + 24, 60);

        // Hitung berapa kolom yang muat secara horizontal
        const slotSpacX  = slotW + 8;
        const maxColsFit = Math.max(1, Math.floor((maxGridW + 8) / slotSpacX));
        const maxCols2   = Math.min(slotCount, maxColsFit);
        const rowCount   = Math.ceil(slotCount / maxCols2);

        // Hitung slotH agar semua baris muat dalam availableH
        // slotSpacY = slotH + 10, ansBoxH = rowCount * slotSpacY - 10 + 20
        // → cari slotH terbesar yang membuat ansBoxH ≤ availableH
        const maxSlotH   = Math.floor((availableH - 20 + 10) / rowCount) - 10;
        const slotFontSz = Math.max(Math.round(9 * W / 800),
                           Math.min(Math.round(14 * W / 800), maxSlotH - slotPadY * 2 - 4));
        const slotH      = slotFontSz + slotPadY * 2 + 4;
        const slotSpacY  = slotH + 10;

        // Lebar & tinggi box final
        const actualGridW = maxCols2 * slotSpacX - 8;
        const ansBoxW     = actualGridW + 20;
        const ansBoxH     = rowCount * slotSpacY - 10 + 20;

        // Posisi Y kotak jawaban: tepat di bawah terjemahan + gap, tidak melebihi bawah papan
        const ansY = transBot + gapTransAns + ansBoxH / 2;

        this.answerBox = this.add.graphics().setDepth(1);
        this.answerBox.fillStyle(0x222244, 1);
        this.answerBox.fillRoundedRect(boardCX - ansBoxW/2, ansY - ansBoxH/2, ansBoxW, ansBoxH, 10);
        this.answerBox.lineStyle(2, 0x5555aa, 1);
        this.answerBox.strokeRoundedRect(boardCX - ansBoxW/2, ansY - ansBoxH/2, ansBoxW, ansBoxH, 10);

        const slotStartX = boardCX - ((maxCols2 - 1) * slotSpacX) / 2;
        const slotStartY = ansY    - ((rowCount   - 1) * slotSpacY) / 2;

        const SLOT_RADIUS = 7; // border radius slot

        this.correctWords.forEach((_, i) => {
            const col = i % maxCols2;
            const row = Math.floor(i / maxCols2);
            const sx  = slotStartX + col * slotSpacX;
            const sy  = slotStartY + row * slotSpacY;

            const slotBg = this.add.graphics().setDepth(2);
            slotBg.fillStyle(0x333366, 1);
            slotBg.fillRoundedRect(sx - slotW/2, sy - slotH/2, slotW, slotH, SLOT_RADIUS);
            slotBg.lineStyle(1, 0x7777bb, 1);
            slotBg.strokeRoundedRect(sx - slotW/2, sy - slotH/2, slotW, slotH, SLOT_RADIUS);

            const slotTxt = this.add.text(sx, sy, '____', {
                fontFamily: 'PixeloidSans',
                fontSize:   `${slotFontSz}px`,
                color:      '#555588',
                align:      'center'
            }).setOrigin(0.5).setDepth(3);

            this.answerSlots.push({
                index: i, x: sx, y: sy, w: slotW, h: slotH, r: SLOT_RADIUS,
                bg: slotBg, txt: slotTxt, word: null, wordBtn: null
            });
        });

        // ── Tooltip ────────────────────────────────────────────
        this.tooltipShadow = this.add.rectangle(0, 0, 160, 38, 0x000000, 0.5)
            .setVisible(false).setDepth(19);
        this.tooltipBox = this.add.rectangle(0, 0, 160, 38, 0x111133)
            .setStrokeStyle(1, 0xFFD700).setVisible(false).setDepth(20);
        this.tooltipText = this.add.text(0, 0, '', {
            fontFamily: 'PixeloidSans, Arial',
            fontSize:   fs(13),
            color:      '#FFD700',
            align:      'center'
        }).setOrigin(0.5).setVisible(false).setDepth(21);

        // ── Tombol Kata ────────────────────────────────────────
        const maxCols    = Math.min(shuffled.length, 5);
        // Hitung colSpacing berdasarkan kata terpanjang agar tidak bertabrakan
        const longestShuffled = shuffled.reduce((a, b) => b.length > a.length ? b : a, '');
        const minColSpacing   = Math.ceil(longestShuffled.length * (9 * W / 800)) + 30;
        const colSpacing = Math.max(W * 0.15, minColSpacing);
        const rowSpacing = H * 0.09;
        const btnStartX  = cx - ((maxCols - 1) * colSpacing) / 2;
        const btnStartY  = H * 0.70;

        const BTN_RADIUS = 7;
        const btnPadX    = 10;
        const btnPadY    = 6;
        const btnFontSz  = Math.round(15 * W / 800);

        shuffled.forEach((word, index) => {
            const col   = index % maxCols;
            const row   = Math.floor(index / maxCols);
            const origX = btnStartX + col * colSpacing;
            const origY = btnStartY + row * rowSpacing;
            const hint  = wordTrans[word] || '';

            // Ukur lebar teks dulu pakai teks sementara
            const _tmpTxt = this.add.text(0, -9999, word, {
                fontFamily: 'PixeloidSans', fontSize: `${btnFontSz}px`
            });
            const btnW = _tmpTxt.width  + btnPadX * 2;
            const btnH = _tmpTxt.height + btnPadY * 2;
            _tmpTxt.destroy();

            // Graphics background rounded
            const btnBg = this.add.graphics().setDepth(5);
            btnBg.fillStyle(0x444466, 1);
            btnBg.fillRoundedRect(-btnW/2, -btnH/2, btnW, btnH, BTN_RADIUS);

            // Label teks
            const btnTxt = this.add.text(0, 0, word, {
                fontFamily: 'PixeloidSans',
                fontSize:   `${btnFontSz}px`,
                color:      '#ffffff'
            }).setOrigin(0.5).setDepth(6);

            // Container agar bg + txt bergerak bersama saat drag
            const wordBtn = this.add.container(origX, origY, [btnBg, btnTxt])
                .setSize(btnW, btnH)
                .setInteractive({ draggable: true })
                .setDepth(5);

            wordBtn.origX  = origX;
            wordBtn.origY  = origY;
            wordBtn.word   = word;
            wordBtn.placed = false;
            wordBtn.btnBg  = btnBg;
            wordBtn.btnTxt = btnTxt;
            wordBtn.btnW   = btnW;
            wordBtn.btnH   = btnH;

            this.wordButtons.push(wordBtn);

            // Helper redraw bg tombol kata
            const redrawBtn = (fillHex, alpha = 1) => {
                btnBg.clear();
                btnBg.fillStyle(fillHex, alpha);
                btnBg.fillRoundedRect(-btnW/2, -btnH/2, btnW, btnH, BTN_RADIUS);
            };

            wordBtn.on('pointerover', () => {
                if (!wordBtn.placed) redrawBtn(0x6666aa);
                if (hint && !wordBtn.placed) {
                    const bx = wordBtn.x;
                    const by = wordBtn.y - btnH/2 - 10;
                    const bw = Math.max(hint.length * (W / 800) * 9 + 24, 80);
                    this.tooltipShadow.setPosition(bx + 3, by + 3).setSize(bw, 38).setVisible(true);
                    this.tooltipBox.setPosition(bx, by).setSize(bw, 38).setVisible(true);
                    this.tooltipText.setPosition(bx, by).setText(hint).setVisible(true);
                }
            });
            wordBtn.on('pointerout', () => {
                if (!wordBtn.placed) redrawBtn(0x444466);
                this._hideTooltip();
            });
            wordBtn.on('dragstart', () => {
                if (wordBtn.placed) return;
                this._hideTooltip();
                wordBtn.setDepth(30);
                btnTxt.setDepth(31);
                redrawBtn(0x8888cc);
                this.answerSlots.forEach(slot => {
                    if (!slot.word) this._redrawSlot(slot, 0x333366, 0xFFD700, 2);
                });
            });
            wordBtn.on('drag', (pointer, dragX, dragY) => {
                if (wordBtn.placed) return;
                wordBtn.setPosition(dragX, dragY);
                this.answerSlots.forEach(slot => {
                    if (slot.word) return;
                    const dist = Phaser.Math.Distance.Between(dragX, dragY, slot.x, slot.y);
                    if (dist < slotW * 0.9) {
                        this._redrawSlot(slot, 0x444488, 0xFFD700, 2);
                    } else {
                        this._redrawSlot(slot, 0x333366, 0xFFD700, 2);
                    }
                });
            });
            wordBtn.on('dragend', () => {
                if (wordBtn.placed) return;
                wordBtn.setDepth(5);
                btnTxt.setDepth(6);
                redrawBtn(0x444466);
                this.answerSlots.forEach(slot => {
                    if (!slot.word) this._redrawSlot(slot, 0x333366, 0x7777bb, 1);
                });

                let nearest = null, nearestDist = Infinity;
                const snapRadius = slotW * 1.2;
                this.answerSlots.forEach(slot => {
                    if (slot.word) return;
                    const dist = Phaser.Math.Distance.Between(wordBtn.x, wordBtn.y, slot.x, slot.y);
                    if (dist < snapRadius && dist < nearestDist) { nearest = slot; nearestDist = dist; }
                });

                nearest ? this._placeWordInSlot(wordBtn, nearest, sentences)
                        : this._returnWordBtn(wordBtn);
            });
        });

        this.input.on('drag', (pointer, obj, dragX, dragY) => {
            obj.emit('drag', pointer, dragX, dragY);
        });

        // ── Tombol Reset ───────────────────────────────────────
        const resetBtn = this.add.text(cx, H * 0.93, '[ Reset ]', {
            fontFamily: 'PixeloidSans',
            fontSize:   fs(16),
            color:      '#ffffff'
        }).setOrigin(0.5).setInteractive().setDepth(5);

        resetBtn.on('pointerover', () => resetBtn.setColor('#aaaaaa'));
        resetBtn.on('pointerout',  () => resetBtn.setColor('#ffffff'));
        resetBtn.on('pointerdown', () => {
            this.scene.restart({
                level: this.level, questionIndex: this.questionIndex,
                score: this.score, lives: this.lives, correctCount: this.correctCount
            });
        });

        // ── Tombol Back ────────────────────────────────────────
        const btnBack = this.add.image(W * 0.04, H * 0.95, 'kembali')
            .setInteractive().setScale(0.3);
        btnBack.on('pointerdown', () => {
            if (this.music) this.music.stop();
            this.scene.start('LevelSelectScene')});

        // Simpan fs untuk dipakai method lain
        this._fs = fs;
    }

    // ── Snap kata ke slot ──────────────────────────────────────
    _placeWordInSlot(wordBtn, slot, sentences) {
        slot.word = wordBtn.word; slot.wordBtn = wordBtn;
        wordBtn.placed = true;
        // Fade out container (bg + txt) dan kembalikan ke posisi asal
        wordBtn.setAlpha(0.3).setPosition(wordBtn.origX, wordBtn.origY).disableInteractive();

        slot.txt.setText(wordBtn.word).setColor('#00FF99');
        this._redrawSlot(slot, 0x224422, 0x00FF99, 2);

        this.tweens.add({ targets: slot.txt, scaleX: 1.08, scaleY: 1.08,
                          duration: 80, yoyo: true, ease: 'Power1' });

        this.playerWords = this.answerSlots.map(s => s.word || '');

        if (this.answerSlots.every(s => s.word)) {
            this.translationBox.setVisible(true);
            this.translationText.setVisible(true);
            this.playerWords = this.answerSlots.map(s => s.word);
            this.checkAnswer(sentences);
        }
    }

    _returnWordBtn(wordBtn) {
        this.tweens.add({ targets: wordBtn, x: wordBtn.origX, y: wordBtn.origY,
                          duration: 200, ease: 'Back.Out' });
        // Redraw bg ke warna normal (container, jadi akses btnBg langsung)
        if (wordBtn.btnBg) {
            wordBtn.btnBg.clear();
            wordBtn.btnBg.fillStyle(0x444466, 1);
            wordBtn.btnBg.fillRoundedRect(
                -wordBtn.btnW/2, -wordBtn.btnH/2,
                wordBtn.btnW, wordBtn.btnH, 7
            );
        }
    }

    _hideTooltip() {
        this.tooltipShadow.setVisible(false);
        this.tooltipBox.setVisible(false);
        this.tooltipText.setVisible(false);
    }

    // ── Redraw slot dengan rounded rect ───────────────────────
    _redrawSlot(slot, fillColor, strokeColor, strokeWidth) {
        slot.bg.clear();
        slot.bg.fillStyle(fillColor, 1);
        slot.bg.fillRoundedRect(
            slot.x - slot.w / 2, slot.y - slot.h / 2,
            slot.w, slot.h, slot.r
        );
        slot.bg.lineStyle(strokeWidth, strokeColor, 1);
        slot.bg.strokeRoundedRect(
            slot.x - slot.w / 2, slot.y - slot.h / 2,
            slot.w, slot.h, slot.r
        );
    }

    checkAnswer(sentences) {
        if (this.playerWords.length !== this.correctWords.length) return;

        const W  = this.scale.width;
        const H  = this.scale.height;
        const cx = W / 2;
        const fs = this._fs;

        const isCorrect = this.playerWords.join(' ') === this.correctWords.join(' ');

        this.time.delayedCall(600, () => {
            if (isCorrect) {
                // ── BENAR ──────────────────────────────────────
                this.score        += this.scorePerCorrect;
                this.correctCount += 1;
                this.scoreText.setText(`Score: ${this.score}`);
                this.correctCountText.setText(`✓ Benar: ${this.correctCount}/${this.MIN_CORRECT}`);
                if (this.correctCount >= this.MIN_CORRECT)
                    this.correctCountText.setColor('#00FF99');

                this.answerSlots.forEach(s => {
                    this._redrawSlot(s, 0x003300, 0x00ff99, 2);
                });

                this.add.text(cx, H * 0.82, '✓ Benar! +20', {
                    fontFamily: 'PixeloidSans-Bold', fontSize: fs(20), color: '#00ff99'
                }).setOrigin(0.5).setDepth(5);

                this.time.delayedCall(1000, () => {
                    const next = this.questionIndex + 1;
                    if (next < sentences.length) {
                        this.scene.restart({
                            level: this.level, questionIndex: next,
                            score: this.score, lives: this.lives, correctCount: this.correctCount
                        });
                    } else {
                        this.checkLevelResult();
                    }
                });

            } else {
                // ── SALAH: kurangi nyawa, lanjut soal berikutnya ──
                this.lives -= 1;
                this.livesText.setText(`♥ ${this.lives}`);
                this.answerSlots.forEach(s => {
                    this._redrawSlot(s, 0x330000, 0xff4444, 2);
                });

                if (this.lives <= 0) {
                    this.add.text(cx, H * 0.82, 'Nyawa Habis!', {
                        fontFamily: 'PixeloidSans-Bold', fontSize: fs(22), color: '#ff0000'
                    }).setOrigin(0.5).setDepth(5);

                    this.time.delayedCall(800, () => this._handleLivesOut());

                } else {
                    // Lanjut ke soal berikutnya (bukan reset soal sama)
                    this.add.text(cx, H * 0.82, `✗ Salah! Sisa nyawa: ${this.lives}`, {
                        fontFamily: 'PixeloidSans-Bold', fontSize: fs(18), color: '#ff4444'
                    }).setOrigin(0.5).setDepth(5);

                    this.time.delayedCall(1200, () => {
                        const next = this.questionIndex + 1;
                        if (next < sentences.length) {
                            this.scene.restart({
                                level: this.level, questionIndex: next,
                                score: this.score, lives: this.lives, correctCount: this.correctCount
                            });
                        } else {
                            this.checkLevelResult();
                        }
                    });
                }
            }
        });
    }

    // Nyawa habis di tengah permainan → cek kriteria
    _handleLivesOut() {
        const passed = (this.correctCount >= this.MIN_CORRECT) || (this.score >= this.MIN_SCORE);
        if (passed) {
            SaveManager.recordLevelResult(this.level, this.score, this.correctCount);
            this._showLevelCompleteOverlay();
        } else {
            this._showGameOverOverlay();
        }
    }

    // Semua soal habis → cek kriteria
    checkLevelResult() {
        const passed = (this.correctCount >= this.MIN_CORRECT) || (this.score >= this.MIN_SCORE);
        if (passed) {
            SaveManager.recordLevelResult(this.level, this.score, this.correctCount);
            this._showLevelCompleteOverlay();
        } else {
            this._showGameOverOverlay();
        }
    }

    // ══════════════════════════════════════════════════════════
    // OVERLAY LEVEL COMPLETE (lulus)
    // ══════════════════════════════════════════════════════════
    _showLevelCompleteOverlay() {
        const W   = this.scale.width;
        const H   = this.scale.height;
        const cx  = W / 2;
        const cy  = H / 2;
        const fs  = this._fs;
        const D   = 50; // depth base overlay

        // Overlay gelap — memblok klik ke elemen game di bawahnya
        const overlay = this.add.rectangle(cx, cy, W, H, 0x000000, 0)
            .setDepth(D).setInteractive(); // blok klik ke bawah
        this.tweens.add({ targets: overlay, fillAlpha: 0.72, duration: 300, ease: 'Power2' });

        // Panel
        const panelW = W * 0.46;
        const panelH = H * 0.66;

        // Shadow
        this.add.rectangle(cx + 6, cy + 6, panelW, panelH, 0x000000, 0.5).setDepth(D + 1);
        // Panel utama
        const panel = this.add.rectangle(cx, cy, panelW, panelH, 0x1a1a2e)
            .setStrokeStyle(3, 0xFFD700).setDepth(D + 2).setAlpha(0);
        this.tweens.add({ targets: panel, alpha: 1, duration: 300, ease: 'Power2' });

        // Garis atas
        this.add.rectangle(cx, cy - panelH / 2 + 6, panelW, 6, 0xFFD700).setDepth(D + 3);

        // Ikon
        this.add.text(cx, cy - panelH * 0.34, '⭐', {
            fontSize: fs(52)
        }).setOrigin(0.5).setDepth(D + 3);

        // Judul
        this.add.text(cx, cy - panelH * 0.19, 'LEVEL COMPLETE!', {
            fontFamily: 'PixeloidSans-Bold',
            fontSize:   fs(30),
            color:      '#FFD700'
        }).setOrigin(0.5).setDepth(D + 3);

        // Sub judul
        this.add.text(cx, cy - panelH * 0.07, `Level ${this.level} Selesai`, {
            fontFamily: 'PixeloidSans',
            fontSize:   fs(17),
            color:      '#aaaacc'
        }).setOrigin(0.5).setDepth(D + 3);

        // Divider
        this.add.rectangle(cx, cy + panelH * 0.02, panelW * 0.75, 2, 0x444466).setDepth(D + 3);

        // Statistik: Score
        this.add.text(cx - panelW * 0.18, cy + panelH * 0.08, 'Score', {
            fontFamily: 'PixeloidSans', fontSize: fs(13), color: '#888888'
        }).setOrigin(0.5).setDepth(D + 3);
        this.add.text(cx - panelW * 0.18, cy + panelH * 0.15, `${this.score}`, {
            fontFamily: 'PixeloidSans-Bold', fontSize: fs(26), color: '#00FF99'
        }).setOrigin(0.5).setDepth(D + 3);

        // Statistik: Soal Benar
        this.add.text(cx + panelW * 0.18, cy + panelH * 0.08, 'Soal Benar', {
            fontFamily: 'PixeloidSans', fontSize: fs(13), color: '#888888'
        }).setOrigin(0.5).setDepth(D + 3);
        this.add.text(cx + panelW * 0.18, cy + panelH * 0.15, `${this.correctCount}`, {
            fontFamily: 'PixeloidSans-Bold', fontSize: fs(26), color: '#FFD700'
        }).setOrigin(0.5).setDepth(D + 3);

        // Pesan kriteria
        const critMsg = (this.correctCount >= this.MIN_CORRECT)
            ? `✓ ${this.correctCount} soal benar — kriteria terpenuhi!`
            : `✓ Score ${this.score} — kriteria skor terpenuhi!`;
        this.add.text(cx, cy + panelH * 0.24, critMsg, {
            fontFamily: 'PixeloidSans', fontSize: fs(13), color: '#00FF99', align: 'center'
        }).setOrigin(0.5).setDepth(D + 3);

        // Tombol NEXT LEVEL
        const nextLevel    = this.level + 1;
        const hasNextLevel = nextLevel <= 10;

        if (hasNextLevel) {
            this._overlayButton(
                cx, cy + panelH * 0.36,
                `  ▶  Level ${nextLevel}  `,
                fs(18), 0x005500, 0x00aa00, 0x003300, '#ffffff', D + 3,
                () => {
                    this.scene.restart({
                        level: nextLevel, questionIndex: 0,
                        score: 0, lives: 3, correctCount: 0
                    });
                }
            );
        } else {
            this.add.text(cx, cy + panelH * 0.36, '🏆 Semua Level Selesai!', {
                fontFamily: 'PixeloidSans-Bold', fontSize: fs(20), color: '#FFD700'
            }).setOrigin(0.5).setDepth(D + 3);
        }

        // Tombol PILIH LEVEL
        this._overlayButton(
            cx, cy + panelH * 0.47,
            '  ☰  Pilih Level  ',
            fs(16), 0x444400, 0x888800, 0x333300, '#ffffff', D + 3,
            () => this.scene.start('LevelSelectScene')
        );
    }

    // ══════════════════════════════════════════════════════════
    // OVERLAY GAME OVER (gagal)
    // ══════════════════════════════════════════════════════════
    _showGameOverOverlay() {
        const W   = this.scale.width;
        const H   = this.scale.height;
        const cx  = W / 2;
        const cy  = H / 2;
        const fs  = this._fs;
        const D   = 50;

        // Overlay gelap — memblok klik ke elemen game di bawahnya
        const overlay = this.add.rectangle(cx, cy, W, H, 0x000000, 0)
            .setDepth(D).setInteractive();
        this.tweens.add({ targets: overlay, fillAlpha: 0.75, duration: 300, ease: 'Power2' });

        // Panel
        const panelW = W * 0.44;
        const panelH = H * 0.65;

        // Shadow
        this.add.rectangle(cx + 6, cy + 6, panelW, panelH, 0x000000, 0.5).setDepth(D + 1);
        // Panel utama
        const panel = this.add.rectangle(cx, cy, panelW, panelH, 0x1a1a2e)
            .setStrokeStyle(3, 0xff4444).setDepth(D + 2).setAlpha(0);
        this.tweens.add({ targets: panel, alpha: 1, duration: 300, ease: 'Power2' });

        // Garis atas
        this.add.rectangle(cx, cy - panelH / 2 + 6, panelW, 6, 0xff4444).setDepth(D + 3);

        // Ikon
        this.add.text(cx, cy - panelH * 0.33, '💀', {
            fontSize: fs(52)
        }).setOrigin(0.5).setDepth(D + 3);

        // Judul
        this.add.text(cx, cy - panelH * 0.17, 'GAME OVER', {
            fontFamily: 'PixeloidSans-Bold', fontSize: fs(34), color: '#ff4444'
        }).setOrigin(0.5).setDepth(D + 3);

        // Info level
        this.add.text(cx, cy - panelH * 0.04, `Level ${this.level}`, {
            fontFamily: 'PixeloidSans', fontSize: fs(18), color: '#aaaacc'
        }).setOrigin(0.5).setDepth(D + 3);

        // Statistik: Score
        this.add.text(cx - panelW * 0.2, cy + panelH * 0.07, 'Score', {
            fontFamily: 'PixeloidSans', fontSize: fs(13), color: '#888888'
        }).setOrigin(0.5).setDepth(D + 3);
        this.add.text(cx - panelW * 0.2, cy + panelH * 0.14, `${this.score}`, {
            fontFamily: 'PixeloidSans-Bold', fontSize: fs(24), color: '#ff8888'
        }).setOrigin(0.5).setDepth(D + 3);

        // Statistik: Soal Benar
        this.add.text(cx + panelW * 0.2, cy + panelH * 0.07, 'Soal Benar', {
            fontFamily: 'PixeloidSans', fontSize: fs(13), color: '#888888'
        }).setOrigin(0.5).setDepth(D + 3);
        this.add.text(cx + panelW * 0.2, cy + panelH * 0.14, `${this.correctCount}`, {
            fontFamily: 'PixeloidSans-Bold', fontSize: fs(24), color: '#ffaaaa'
        }).setOrigin(0.5).setDepth(D + 3);

        // Pesan kriteria gagal
        this.add.text(cx, cy + panelH * 0.25,
            `Butuh min. ${this.MIN_CORRECT} soal benar atau ${this.MIN_SCORE} skor\nuntuk membuka level berikutnya.`, {
            fontFamily: 'PixeloidSans', fontSize: fs(13), color: '#ff8800', align: 'center'
        }).setOrigin(0.5).setDepth(D + 3);

        // Divider
        this.add.rectangle(cx, cy + panelH * 0.32, panelW * 0.7, 2, 0x444466).setDepth(D + 3);

        // Tombol COBA LAGI
        this._overlayButton(
            cx, cy + panelH * 0.39,
            '  ↺  Coba Lagi  ',
            fs(18), 0x007700, 0x00aa00, 0x005500, '#ffffff', D + 3,
            () => {
                this.scene.restart({
                    level: this.level, questionIndex: 0,
                    score: 0, lives: 3, correctCount: 0
                });
            }
        );

        // Tombol PILIH LEVEL
        this._overlayButton(
            cx, cy + panelH * 0.49,
            '  ☰  Pilih Level  ',
            fs(16), 0x444400, 0x888800, 0x333300, '#ffffff', D + 3,
            () => this.scene.start('LevelSelectScene')
        );
    }

    // ── Helper tombol untuk overlay ────────────────────────────
    _overlayButton(x, y, label, fontSize, colorNormal, colorHover, colorPress, textColor, depth, callback) {
        const btn = this.add.text(x, y, label, {
            fontFamily:      'PixeloidSans-Bold',
            fontSize:        fontSize,
            color:           textColor,
            backgroundColor: `#${colorNormal.toString(16).padStart(6, '0')}`,
            padding:         { x: 18, y: 10 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(depth);

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