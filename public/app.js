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
        const gameDataArray = await response.json(); // JSON形式の値を自動的にオブジェクトに変換
        console.log(gameDataArray);

        return gameDataArray;  // オブジェクトの配列データを返す
    }
}

// バイナリデータを受け取る処理
const getByBInaryData = async(response) => {
    if(response.ok){
        const blob = await response.blob();  // バイナリデータの取得
        const url = URL.createObjectURL(blob);  // URLを生成
    }
}

// 画面再描画処理
const ScreenReload = async() =>{
    try{
        const responseJson = await fetch('http://localhost:3000/mainscreen/reload/getJson');

        const GameDataArray = await getByJsonData(responseJson);  // JSONデータをオブジェクトの配列で取得

        // let data = GameDataArray[0];

        // const gameImagePathTest = data.game_image_path;

        // console.log(gameImagePathTest);

        const gameImagePathArr = [];  // 画像パスの文字列配列

        for(let i = 0; i < GameDataArray.length; i++){
            gameImagePathArr.push(GameDataArray[i].game_image_path); 
        }

        console.log(gameImagePathArr);

        // fetchを一斉に走らせる(mapでループさせることにより結果を返す)
        const fetchPromise = gameImagePathArr.map((imagepath) =>{
            return fetch(`http://localhost:3000/mainscreen/reload/getBinary/${imagepath}`);
        });


        // fetchがすべて終わるまで待つ（非同期同時処理）
        const resposeBinary =  await Promise.all(fetchPromise);

        console.log(resposeBinary)
        getByBInaryData(resposeBinary);

        // const resposeBinary = await fetch('http://localhost:3000/mainscreen/reload/getBinary');
    }
    catch(error){
        console.log("データ取得失敗：" + error);
    }


}


