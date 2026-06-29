// 起動時に実行
document.addEventListener('DOMContentLoaded', () => {
    const { gameData, gameImageUrl } = getSessionStorageData();  // sessionStorageからデータを取得

    // 取得できたかチェック
    if (gameData && gameImageUrl) {
        inputGameData(gameData, gameImageUrl);  // ゲームカードの挿入処理
    }
    else{
        console.log('SessionStorageにデータが存在しません。');
    }
});

// sessionStorageからデータを取得する処理
const getSessionStorageData = () =>{
    const gameData = JSON.parse(sessionStorage.getItem('gameData'));  // sessionStorageからデータを取得
    const gameImageUrl = sessionStorage.getItem('gameImageUrl');  // sessionStorageから画像のURLを取得

    console.log('SessionStorageから取得したゲームデータ:', gameData);
    console.log('SessionStorageから取得したゲーム画像URL:', gameImageUrl);

    return { gameData, gameImageUrl };
}

// ゲームカードの挿入処理
const inputGameData = (gameData, gameImageUrl) => {
    // ゲームデータのキー配列
    const gameKey = ['game_title', 'platform','play_date','play_status','play_time_minutes','review','star_level'];  
    
    // gameDataの値を取得
    const gameDataArr = gameKey.map(key => {
        
        const value = gameData[key];
        
        if(key === 'play_date'){
            return value.split('T')[0];  // 日付の形式を整える
        }

        if(key === 'play_time_minutes'){
            const hour = Math.floor(value / 60);
            const minutes = value % 60;

            return {hour, minutes};  // プレイ時間の形式を整える
        }

        return value;
    });

    console.log('ゲームデータの値:', gameDataArr);

    // // 画面に値を挿入
    // const gameImageElement = document.getElementById('GameImage');  // ゲーム画像の要素を取得

    // gameImageElement.src = gameImageUrl;  // ゲーム画像のURLを挿入

    // const inputGameData = document.querySelectorAll('input');
    // console.log('inputGameData:', inputGameData);

    // // ゲームデータをフォームに挿入
    // for(let i = 0; i < gameKey.length; i++){
    //     if(inputGameData[i]){
    //         inputGameData[i].value = gameData[gameKey[i]];  // ゲームデータをフォームに挿入
    //     }
    // }

};