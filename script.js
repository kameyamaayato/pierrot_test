// --- 定数定義 ---
const INITIAL_COINS = 100;
const REEL_SYMBOLS = [1, 2, 3, 4, 5, 6]; // リールシンボル (例: 1~6の数字)

// 配当表 (役: 獲得コイン)
const PAYOUTS = {
    '777': 50, // 仮の役。シンボル'7'がないので実際はシンボルIDで定義
    'TRIPLE_1': 30, // シンボル1が3つ揃い
    'TRIPLE_ANY': 10, // 任意のシンボルが3つ揃い
    'DOUBLE_ANY': 3, // 任意のシンボルが2つ揃い
    'NONE': -1 // ハズレ
};

// --- 変数定義 ---
let currentCoins = INITIAL_COINS;
let isSpinning = false;
const SPIN_DURATION_MS = 3000; // 3秒回転

// DOM要素
const coinDisplay = document.getElementById('current-coins');
const spinButton = document.getElementById('spin-button');
const resultMessage = document.getElementById('result-message');
const reels = [
    document.getElementById('reel-1'),
    document.getElementById('reel-2'),
    document.getElementById('reel-3')
];

// 初期表示の更新
function updateCoinDisplay() {
    coinDisplay.textContent = currentCoins;
}

// リールにシンボル画像を設定する関数 (擬似アニメーション用)
function setReelSymbol(reelElement, symbolId) {
    // 独自のリール画像を使用するため、CSSで設定したクラス名と画像パスを使用
    reelElement.innerHTML = `<div class="symbol symbol-${symbolId}" style="background-image: url('./images/symbol_${symbolId}.png');"></div>`;
}

// --- メインロジック ---

// リールの回転 (アニメーション)
function startReelSpin(reelIndex) {
    return new Promise(resolve => {
        // 200msごとの更新で「擬似的な更新（アニメ風）」を実現
        const intervalId = setInterval(() => {
            if (!isSpinning) {
                clearInterval(intervalId); // 全てのリールが停止するまでアニメーションは続く
            }
            // ランダムにシンボルを選び、表示を更新
            const randomSymbol = REEL_SYMBOLS[Math.floor(Math.random() * REEL_SYMBOLS.length)];
            setReelSymbol(reels[reelIndex], randomSymbol);
        }, 200);

        // 3秒後に停止
        setTimeout(() => {
            clearInterval(intervalId);
            // 最終結果を決定
            const finalSymbol = REEL_SYMBOLS[Math.floor(Math.random() * REEL_SYMBOLS.length)];
            setReelSymbol(reels[reelIndex], finalSymbol);
            resolve(finalSymbol); // 最終結果を返す
        }, SPIN_DURATION_MS);
    });
}

// 役判定ロジック
function checkWin(results) {
    const r1 = results[0];
    const r2 = results[1];
    const r3 = results[2];

    let winType = 'NONE';
    let coinsGained = PAYOUTS['NONE'];

    // 3つ揃い
    if (r1 === r2 && r2 === r3) {
        winType = `TRIPLE_${r1}`;
        if (r1 === 1) { // シンボル1が3つ揃いの場合 (例として)
            coinsGained = PAYOUTS.TRIPLE_1;
        } else {
            coinsGained = PAYOUTS.TRIPLE_ANY;
        }
    }
    // 2つ揃い (左2つ、または右2つ)
    else if (r1 === r2 || r2 === r3 || r1 === r3) {
        winType = 'DOUBLE_ANY';
        coinsGained = PAYOUTS.DOUBLE_ANY;
    }

    return { winType, coinsGained };
}

// 勝者画面を表示する関数 (必要に応じてモーダルや別要素で実装)
function showWinnerScreen(winType) {
    // ここに独自の勝者画面の表示ロジックを実装
    alert(`🎉 ${winType} で当たり！🎉`);
    // 例: 特定の役に対しては特別な演出を行う
}

// SPINボタンクリック時の処理
async function handleSpin() {
    if (isSpinning || currentCoins <= 0) return;

    isSpinning = true;
    spinButton.disabled = true;

    // コインを1消費
    currentCoins--;
    updateCoinDisplay();

    resultMessage.textContent = 'リール回転中...';

    // 3つのリールを同時に回転開始し、結果を待つ
    const results = await Promise.all([
        startReelSpin(0),
        startReelSpin(1),
        startReelSpin(2)
    ]);

    // 全リール停止後の処理
    isSpinning = false;
    
    const { winType, coinsGained } = checkWin(results);

    currentCoins += coinsGained;
    updateCoinDisplay();

    // 結果メッセージの表示
    if (coinsGained > 0) {
        resultMessage.textContent = `${winType} で ${coinsGained} コイン獲得！`;
        showWinnerScreen(winType); // 当たりなので勝者画面を表示
    } else {
        resultMessage.textContent = '残念、ハズレです。';
    }

    // ゲームオーバー判定
    if (currentCoins <= 0) {
        resultMessage.textContent = 'GAME OVER. コインがなくなりました。';
        spinButton.disabled = true;
    } else {
        spinButton.disabled = false;
    }
}

// イベントリスナー設定
spinButton.addEventListener('click', handleSpin);

// ゲーム初期化
updateCoinDisplay(); // 初期コインを反映