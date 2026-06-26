'use strict';
//起動時に実行
document.addEventListener('DOMContentLoaded',() =>{
    ScreenReload();
});

// 新規ゲーム追加処理
let CreateGameCard = document.getElementById("CreateGameCard");

// 画面遷移
CreateGameCard.addEventListener('click',(e) =>{
    window.location.href = './form.html';
},false);

// JSON形式でデータを受け取る処理
const getByJsonData = async(response) =>{
    if(response.ok){
        console.log('JSON取得成功');
        const gameData = await response.json(); // JSON形式の値を自動的にオブジェクトに変換
        console.log(gameData);

        return gameData;  // オブジェクトのデータを返す
    }
}

// 画面再描画処理
const ScreenReload = async() =>{
    try{
        const response = await fetch('http://localhost:3000/mainscreen/reload');

        const GameData = getByJsonData(response);
    }
    catch(error){
        console.log("データ取得失敗：" + error);
    }


}


