'use strict';
//起動時に実行
document.addEventListener('DOMContentLoaded',async() =>{
    await ScreenReload();

    HeaderAnimation();  // ヘッダーのアニメーションイベントの実行

    EditGameCard();  // ゲームカード編集イベントの実行

    FilterGamecCard();  // ゲームカード絞り込みイベントの実行
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


// 画像のURLデータを取得する処理（共通関数）
const getUrlData = async(gameDataArr) =>{
    const gameImagePathArr = [];  // 画像パスの文字列配列

    // 画像パスの配列を作成
    for(let i = 0; i < gameDataArr.length; i++){
        gameImagePathArr.push(gameDataArr[i].game_image_path); 
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

    return url;  // urlが格納された配列を返す
}


// データベースからデータを取得する処理（全件取得）
const ResponseDataAll = async() =>{
    const responseJson = await fetch('http://localhost:3000/mainscreen/reload/getJson/all');  // JSONデータを取得しレスポンスを返す（全件取得）

    const GameDataArray = await getByJsonData(responseJson);  // レスポンスしたJSONデータをオブジェクトの配列で取得

    const Url = await getUrlData(GameDataArray);

    return {GameDataArray,Url};  // 取得したデータを返す

}

// データベースからデータを取得する処理（項目データ取得）
const ResponseDataSearch = async(filterValue) =>{
        // JSONデータを取得しレスポンスを返す（項目データ取得）
    const responseJson = await fetch(`http://localhost:3000/mainscreen/reload/getJson/search/${filterValue}`);  

    const GameDataArray = await getByJsonData(responseJson);  // レスポンスしたJSONデータをオブジェクトの配列で取得

    const Url = await getUrlData(GameDataArray);

    return {GameDataArray,Url};  // 取得したデータを返す
}



// html部分の作成（ゲームカード）
const CreatePanel = (values,url,index) =>{
    const GameCardList = document.querySelector('.game-card-list');  // game-card-listクラスの要素を取得

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
            <h3 class="game-title" translate="no">${values.game_title}</h3>
            <p>ゲームの種類</p>
            <p class="platform" translate="no">${values.platform}</p>
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
const ScreenReload = async(filterValue = null) =>{
    try{
        let responseData;  // データ取得処理

        // 引数が渡されたかで判定
        if(filterValue){
            responseData = await ResponseDataSearch(filterValue);  // データ取得処理（項目データ取得）
        }
        else {
            responseData = await ResponseDataAll();  // データ取得処理（全件）
        }

        // GamePanelの作成（受け取ったデータの数に合わせて）
        for(let i = 0; i < responseData.GameDataArray.length; i++){
            CreatePanel(responseData.GameDataArray[i],responseData.Url[i],i);
        }

    }
    catch(error){
        console.log('データ取得失敗：' + error);
    }


}



// ゲームカードをクリックしたら編集画面に遷移する処理
const EditGameCard = async() =>{
    const GameCardList = document.querySelector('.game-card-list');  // game-card-listのクラス要素を取得

    GameCardList.addEventListener('click',async(e) =>{
        
        const ClickedElement = e.target.closest('.card-blog-a');  // クリックされた要素の親要素を取得
        
        // クリックされていない場合
        if(!ClickedElement){
            return;
        }

        e.preventDefault();  // デフォルトのイベントをキャンセル（画面遷移を防ぐ）
        
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

    });

}


// header要素のナビゲーションバーのアニメーション
const HeaderAnimation = () =>{
    const nav = document.querySelector('.gamepackage-nav');  // gamepackage-navクラスの要素を取得
    const ul = document.querySelector('.nav-inner');  // nav-innerクラスの要素を取得


    // スクロールイベントを追加（headerがulタグの位置に来たらヘッダーを固定）
    window.addEventListener('scroll',() =>{

        if(window.pageYOffset >= ul.offsetTop){  // スクロール位置がulタグの位置より大きい場合
            nav.classList.add('scrolled');  // scrolledクラスを追加
        }
        else{
            console.log('elseブロックに入りました');
            nav.classList.remove('scrolled');  // scrolledクラスを削除
        }
    });
}


// headerの項目をクリックしたら絞り込みする処理
const FilterGamecCard = async() =>{
    const filterButton = document.querySelectorAll(`.nav-label`);  // nav-itemクラスの要素を取得
    const CreateGameCard = document.querySelector('.create-game-card');  // create-game-cardクラスの要素を取得
    const GameCardList = document.querySelector('.game-card-list');  // game-card-listクラスの要素を取得


    // イベントリスナーを追加
    filterButton.forEach(span =>{
        span.addEventListener('click',async(e) =>{

          // クリックした要素がすでにactiveクラスを持っている場合は削除し、持っていない場合は追加する
          if(e.target.classList.contains('active')){  
            e.target.classList.remove('active');  // activeクラスを削除
            
            GameCardList.replaceChildren();       // GameCardListの子要素をすべて削除

            CreateGameCard.classList.remove('hidden');  // 新規ゲーム追加パネルを表示にする

            await ScreenReload();  // 画面再描画
          }
          else {
            
            // すべてのspanからactiveクラスを削除
            filterButton.forEach(span =>{
                span.classList.remove('active');  
            
            });

            e.target.classList.add('active');  // クラスの切り替え 
            
            const filterValue = e.target.textContent;  // クリックした要素のデータを取得

            console.log('クリックした要素のデータ：' + filterValue);  // クリックした要素のデータを確認

            GameCardList.replaceChildren();       // GameCardListの子要素をすべて削除

            CreateGameCard.classList.add('hidden');  // 新規ゲーム追加パネルを非表示にする

            await ScreenReload(filterValue);  // 画面再描画（filterValue）

          }
        
        });
    })
}