import HomeScene from "./scenes/HomeScene.js";
import LevelSelectScene from "./scenes/LevelSelectScene.js";
import GameScene from "./scenes/GameScene.js";
import CreditScene from "./scenes/CreditScene.js";
import UIScene from "./scenes/PopUpUi.js";
import GameOverScene from "./scenes/GameOverScene.js";

const config = {
    type: Phaser.AUTO,
    scale: {
    mode : Phaser.Scale.FIT,
    autocenter: Phaser.Scale.CENTER_BOTH,
    width:      1905,                 // ← sesuai asset kamu
    height:     870,
    },
    scene: [HomeScene, CreditScene, LevelSelectScene, GameScene, UIScene, GameOverScene]
};

const game = new Phaser.Game(config);
