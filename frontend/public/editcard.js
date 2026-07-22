'use strict'

// sessionStorageからデータを取得する処理
const getSessionStorageData = () =>{
    const gameData = JSON.parse(sessionStorage.getItem('gameData'));  // sessionStorageからデータを取得
    const gameImageUrl = sessionStorage.getItem('gameImageUrl');  // sessionStorageから画像のURLを取得

    console.log('SessionStorageから取得したゲームデータ:', gameData);
    console.log('SessionStorageから取得したゲーム画像URL:', gameImageUrl);

    return { gameData, gameImageUrl };
}


// ゲームカードの挿入処理
const inputGameData = (gameData) => {
    // ゲームデータのキー配列
    const gameKey = ['game_title', 'platform','play_date','play_status','play_time_minutes','review','star_level'];  
    
    // gameDataの値を取得
    const gameDataArr = [];
    
    // gameDataの値を配列に挿入
    gameKey.forEach(key => {
        
        const value = gameData[key];
        
        if(key === 'play_date'){
            gameDataArr.push(value.split('T')[0]);  // 日付の形式を整える
            return;
        }

        if(key === 'play_time_minutes'){
            const hour = Math.floor(value / 60);
            const minutes = value % 60;

            gameDataArr.push(hour);  // 時間を配列に挿入
            gameDataArr.push(minutes);
            return;
        }

        gameDataArr.push(value);
    });

    console.log('ゲームデータの値:', gameDataArr);

    // // 画面に値を挿入
    const gameImageElement = document.getElementById('GameImage');  // ゲーム画像の要素を取得

    // gameImageElement.src = gameImageUrl;  // ゲーム画像のURLを挿入
    if (gameData.game_image_path) {
    GameImage.src = `${CONFIG.API_BASE_URL}/mainscreen/reload/getBinary/${gameData.game_image_path}`;
    } else {
        GameImage.src = "./Image/default_image.png"; // 画像がない場合の予備
    }

    // フォームの入力要素を取得
    const inputGameDataValues = document.querySelectorAll('input, select, textarea,hidden');  // input, select, textarea, hiddenの要素を取得
    // console.log('inputGameDataValues:', inputGameDataValues);

    let counter = 0;  // カウンターを初期化
    // ゲームデータをフォームに挿入
    for(let i = 0; i < inputGameDataValues.length; i++){
        if(inputGameDataValues[i].type === 'file' || inputGameDataValues[i].type === 'submit'){
            continue;  // ファイル入力、送信ボタンスキップ
        }

        inputGameDataValues[i].value = gameDataArr[counter++];  // ゲームデータをフォームに挿入

    }

};



