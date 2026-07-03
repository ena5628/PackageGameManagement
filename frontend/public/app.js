'use strict';
//起動時に実行
document.addEventListener('DOMContentLoaded',async() =>{
    await ScreenReload();

    EditGameCard();  // ゲームカード編集イベントの実行
});


// 新規ゲーム追加処理
let CreateGameCard = document.getElementById("CreateGameCard");

CreateGameCard.addEventListener('click',(e) =>{
    window.location.href = './form.html';  // 画面遷移
},false);

// JSON形式でデータを受け取る処理
const getByJsonData = async(response) =>{
    if(response.ok){
        console.log('JSON取得成功');
        const gameDataArray = await response.json(); // JSON形式の値を自動的に配列オブジェクトに変換
        console.log('JSON取得した値：' + gameDataArray); 

        return gameDataArray;  // オブジェクトのデータを返す
    }
    else{
        console.log('JSON取得失敗');
    }
}

// バイナリデータを受け取る処理
const getByBinaryData = async(response) => {
    console.log('渡された値（バイナリデータ）：',response);
    const url = [];  // URLを生成

    // responseが配列かどうかを判定
    if(!Array.isArray(response)){
        const blob = await response.blob();  // バイナリデータの取得
        
        let createUrl = URL.createObjectURL(blob);  // URLを生成 

        url.push(createUrl);  // 配列に作成したURL追加

        return url;  // 画像のURLデータを返す
    }

    // 配列responseを一つずつ順に解析
    for(const res of response){
        if(res.ok){
            console.log('画像データ取得成功')
            const blob = await res.blob();  // バイナリデータの取得
            
            let createUrl = URL.createObjectURL(blob);  // URLを生成 

            url.push(createUrl);  // 配列に作成したURL追加
        }
        else{
            console.log('画像データ取得失敗:', + res.status);
            return null;
        }
    }
    
    return url;  // 画像のURLデータを返す
}

// データベースからデータを取得する処理
const ResponseData = async() =>{
const responseJson = await fetch('http://localhost:3000/mainscreen/reload/getJson');  // JSONデータを取得しレスポンスを返す

        const GameDataArray = await getByJsonData(responseJson);  // レスポンスしたJSONデータをオブジェクトの配列で取得

        const gameImagePathArr = [];  // 画像パスの文字列配列

        // 画像パスの配列を作成
        for(let i = 0; i < GameDataArray.length; i++){
            gameImagePathArr.push(GameDataArray[i].game_image_path); 
        }

        console.log('画像パスの文字列配列：' + gameImagePathArr);

        // fetchを一斉に走らせてそのPromiseをmapに格納(mapでループさせることにより結果を返す)
        const fetchPromise = gameImagePathArr.map((imagepath) =>{
            return fetch(`http://localhost:3000/mainscreen/reload/getBinary/${imagepath}`);
        });


        // fetchがすべて終わるまで待つ（非同期同時処理）
        const resposeBinary =  await Promise.all(fetchPromise);

        // ここでできるresponseBinaryは複数のfetchを実行したので配列となる
        console.log('api呼び出しで返ってきたバイナリデータ：' + resposeBinary)
        const url = await getByBinaryData(resposeBinary);  // url取得

        console.log('取得した画像URL：' + url);

        return {GameDataArray,url};  // 取得したデータを返す

}


// html部分の作成（ゲームカード）
const CreatePanel = (values,url,index) =>{
    const GameCardList = document.querySelector('.GameCardList');  // GameCardListクラスの要素を取得

    // 購入日の形式を直す
    // const date = new Date(values.play_date);
    // const formatDate = `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;

    // // プレイ時間の形式を直す
    // const hour = Math.floor(values.play_time_minutes / 60);
    // const minutes = values.play_time_minutes % 60;
    // const time = `${hour}時間 ${minutes}分`;

    // css変数にorderを指定することで、アニメーションの遅延を制御
    const htmlText =  `                                      
    <div class="card-blog-a" data-game-id="${values.game_id} "style="--order: ${index + 1};">  
        <img src="${url}" alt="記事画像">
            <div class="card-blog-content">
                <p >ゲームタイトル</p>
                <h3 class="game-title">${values.game_title}</h3>
                <p>ゲームの種類</p>
                <p class="platform">${values.platform}</p>
            </div>
    </div>
    `;


    //     <p class="play-date">購入日：${formatDate}</p>
    // <p class="play-status">進捗状況：${values.play_status}</p>
    // <p class="play-time-minutes">プレイ時間：${time}</p>
    // <p class="star_level">おすすめ度：${values.star_level}</p>
    // <p class="review">レビュー：${values.review}</p>

    GameCardList.insertAdjacentHTML('beforeend',htmlText);

}

// 画面再描画処理
const ScreenReload = async() =>{
    try{

        const responseData = await ResponseData();  // データ取得処理

        // GamePanelの作成（受け取ったデータの数に合わせて）
        for(let i = 0; i < responseData.GameDataArray.length; i++){
            CreatePanel(responseData.GameDataArray[i],responseData.url[i],i);
        }

        // const resposeBinary = await fetch('http://localhost:3000/mainscreen/reload/getBinary');
    }
    catch(error){
        console.log('データ取得失敗：' + error);
    }


}



// ゲームカードをクリックしたら編集画面に遷移する処理
const EditGameCard = async() =>{
    const editButton = document.querySelectorAll(`.card-blog-a`);  // GameCardクラスの要素を取得

    // console.log(editButton);
    editButton.forEach(cardElement =>{
        cardElement.addEventListener('click',async(e) =>{
        
            e.preventDefault();  // デフォルトのイベントをキャンセル（画面遷移を防ぐ）
            
            const ClickedElement = e.target.closest('.card-blog-a');  // クリックされた要素の親要素を取得

            if(ClickedElement){
                const gameID = ClickedElement.dataset.gameId;  // クリックした要素のdata-game-id属性を取得

                console.log('クリックした要素のゲームID：' + gameID);  // クリックした要素のIDを確認
                
                const responseJSON = await fetch(`http://localhost:3000/mainscreen/editCard/getJson/${gameID}`);  // IDをもとにデータベースからデータを取得

                const gameData = await getByJsonData(responseJSON);  // JSONデータをオブジェクトで取得（gameDataは配列として返る）

                const gameImagePath = gameData[0].game_image_path;  // 画像パスを取得

                console.log(gameImagePath);  // 画像パスを確認

                const responseBinary = await fetch(`http://localhost:3000/mainscreen/reload/getBinary/${gameImagePath}`);  // 画像データを取得

                const url = await getByBinaryData(responseBinary);  // 画像のURLを取得

                console.log('クリックしたした画像URL：' + url[0]);
            
                // 取得したデータをsessionoStorageに保存
                sessionStorage.setItem('gameData',JSON.stringify(gameData[0]));  
                sessionStorage.setItem('gameImageUrl',url[0]);  // 画像のURLをsessionStorageに保存
            
                window.location.href = `./form.html`;  // 編集画面に遷移     

            }

        });
    })

}


// headerの項目をクリックしたら絞り込みする処理
