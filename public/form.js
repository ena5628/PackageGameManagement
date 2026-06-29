'use strict'

// 起動時にモードを判定して表示を切り替える
document.addEventListener('DOMContentLoaded',(e) =>{
    const { gameData, gameImageUrl } = getSessionStorageData();  // sessionStorageからデータを取得
    const submitButton = document.getElementById('RegistrationButton');

    // 共通の処理
    PlayTimeOverSolution();  // プレイ時間超過測定
    PlayTimeDisable();       // 未開封状態にプレイ時間を入力させないようにする
    imagePhotoChange();      // file変更時に表示している画像を変更
    sessionClear();          // sessionStorageのクリア

    // sesionStorageが取得できたかチェック（モード切替用）
    if (gameData && gameImageUrl) {
        console.log('編集モードで起動しました');

        document.getElementById('MainText').textContent = 'ゲーム情報の編集';
        if (submitButton){
          submitButton.textContent = '更新する';
        } 
        inputGameData(gameData, gameImageUrl);  // ゲームカードの挿入処理
        
        createStar(gameData.star_level);  // スターのイベント処理

        SendToData('edit');  // 編集処理用のapi呼び出し

    }
    else{
        console.log('新規登録モードで起動しました');

        createStar();                   // おすすめ度イベントの実行

        SendToData('insert');            // フォームの入力値をデータベース側に送る処理
    }
  

});

// BackButtonが押された際にsessionStorageの内容をクリアする処理
const sessionClear = () =>{
  const BackButton = document.getElementById('BackButton');

  BackButton.addEventListener('click',(e) =>{
    sessionStorage.clear();  // sessionStorageのクリア
  });
  
}


// 画像選択時にimgタグのsrcを変更する処理
const imagePhotoChange = () =>{
  const GameImage = document.getElementById('GameImage');  // imgタグ
  const GameImagePhotoButton = document.getElementById('GameImagePhotoButton'); // input(file)

  GameImagePhotoButton.addEventListener('change',(e) =>{
    const file = e.target.files[0];

    // ファイルが見つかった場合
    if(file){
      const imageURL = URL.createObjectURL(file);  // URL生成

      GameImage.src = imageURL;  // imgタグに挿入
    }
    else{
      console.log(file);
    }
  });

}



// ☆マークの描画＆値取得処理
const createStar = (initialValue) => {
  const starElement = document.querySelector('.star5_rating');
  const hiddenInput = document.getElementById('RecommendedLevel');  
  const StarLevelLabel = document.getElementById('StarLevelLabel');

  const updateStarDisplay = (score) => {
    const widthPercentage = (score / 5) * 100;  // 5段階評価を100%に換算
    starElement.style.setProperty('--starWidth', `${widthPercentage}%`);
    hiddenInput.value = score;
    if(StarLevelLabel){
      StarLevelLabel.textContent = score;  // ラベルに表示
    }
  }

  let currentScore = initialValue !== undefined ? initialValue : 0;  // 初期値が指定されていればそれを使用
  updateStarDisplay(currentScore);

  // ホバー時
  starElement.addEventListener('mousemove', (e) => {
    const rect = starElement.getBoundingClientRect();
    const clickX = e.clientX - rect.left; // クリックされた横のいち
    const widthPercentage = Math.round((clickX / rect.width) * 100);
    starElement.style.setProperty('--starWidth', `${widthPercentage}%`);

    let score_num = (widthPercentage / 100) * 5;
    score_num *= 10;  // 小数点第2位で切り捨て
    const score = Math.floor(score_num) / 10;
    
    updateStarDisplay(score);
  });

  // ホバーが外れた時
  starElement.addEventListener('mouseleave',(e) =>{
    updateStarDisplay(currentScore);
  });

  // クリック時
  starElement.addEventListener('click',(e) =>{
    const rect = starElement.getBoundingClientRect();
    const clickX = e.clientX - rect.left; // クリックされた横のいち
    const widthPercentage = Math.round((clickX / rect.width) * 100);
    starElement.style.setProperty('--starWidth', `${widthPercentage}%`);

    let score_num = (widthPercentage / 100) * 5;
    score_num *= 10;  // 小数点第2位で切り捨て
    const score = Math.floor(score_num) / 10;

    currentScore = score;

    updateStarDisplay(currentScore);
  });
  
  starElement.style.cursor = 'pointer';
};



// 進捗状況が未プレイ時にプレイ時間を無効化する処理
const PlayTimeDisable = () => {
  const PlayTimeHour = document.getElementById('PlayTimeHour');  // 時間入力用のidを取得
  const PlayTimeMinute = document.getElementById('PlayTimeMinute');
  const PlayStatus = document.getElementById('PlayStatus');  // 進行状況用のidを取得

  PlayStatus.addEventListener('change',(e) => {
    const SelectValue = e.target.value; // 選択されたoptionの値を取得
    if(SelectValue === "未開封" || SelectValue === "選択してください"){
      PlayTimeHour.disabled = true;  // プレイ時間の無効化
      PlayTimeMinute.disabled = true;  // プレイ時間の無効化
    }
    else {
      PlayTimeHour.disabled = false;  // プレイ時間の有効化
      PlayTimeMinute.disabled = false;  // プレイ時間の有効化      
    }
  });
  
}


// プレイ時間の上限値測定
const PlayTimeOverSolution = () =>{
  const PlayTimeHour = document.getElementById('PlayTimeHour');

  PlayTimeHour.addEventListener('input',(e) => {
    const currentVal = e.target.value;  // 呼び出されたidのvalueを取得
    if(currentVal.length > 4){    
      // 先頭から4文字分切り取り時間inputのvalueに上書き
      e.target.value = currentVal.slice(0,4);
    }

  });
}






// fetchの非同期処理
const FetchToForm = async (formData) =>{
    return await fetch('http://localhost:3000/form', {
    method:'POST',
    body: formData
  });
}

// データ送信処理
const SendToData = async () =>{
  const GameForm = document.getElementById("GameForm");  // formタグのid

  GameForm.addEventListener('submit', async (e) => {
      e.preventDefault();  // 送信時にページリロードされないようにする（情報の欠落を防ぐ）
      
      // Objectにname属性値を残すため
      PlayTimeHour.disabled = false;  // プレイ時間の有効化
      PlayTimeMinute.disabled = false;  // プレイ時間の有効化      

      const formData = new FormData(e.target);  // formデータをそのまま保持（ファイル対応）

      // オブジェクト形式に変換(使わないけど一応)
      const allData = Object.fromEntries(formData.entries());

      // console.log(allData);

      try {
        const response = await FetchToForm(formData);  // fetchの呼び出し（レスポンス格納）
        
        const status = await response.text();

        if(response.ok){
            console.log('接続成功');
            console.log(status);
        }
        else{
            console.log('接続できませんでした');
            console.log(status);
        }
      }
      catch(error){
        console.error("接続失敗：" + error);
      }


      
    });

};






// フォーム内容をコンソール出力（確認用）
const GameForm = document.getElementById("GameForm");  // formタグのid

GameForm.addEventListener('submit', (e) => {
  e.preventDefault();  // 送信時にページリロードされないようにする（情報の欠落を防ぐ）
  
  // Objectにname属性値を残すため
  PlayTimeHour.disabled = false;  // プレイ時間の有効化
  PlayTimeMinute.disabled = false;  // プレイ時間の有効化      

  const formData = new FormData(e.target);

  const GameTitle = formData.get('GameTitle');
  const GameImagePhoto = formData.get('GameImagePhoto');

  // console.log(GameTitle);
  // console.log(GameImagePhoto);

  // オブジェクト形式に変換
  const allData = Object.fromEntries(formData.entries());

  console.log(formData);  // ログ

  console.log(allData);
  
});


