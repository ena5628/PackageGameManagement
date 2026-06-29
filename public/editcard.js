// 起動時に実行
document.addEventListener('DOMContentLoaded', () => {

});

// sessionStorageからデータを取得する処理
const getSessionStorageData = () =>{
    const gameData = JSON.parse(sessionStorage.getItem('gameData'));  // sessionStorageからデータを取得
    const gameImageUrl = sessionStorage.getItem('gameImageUrl');  // sessionStorageから画像のURLを取得
    return { gameData, gameImageUrl };
}
