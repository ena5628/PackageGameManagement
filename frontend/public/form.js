'use strict'

// 起動時にモードを判定して表示を切り替える
document.addEventListener('DOMContentLoaded',(e) =>{
    const { gameData, gameImageUrl } = getSessionStorageData();  // sessionStorageからデータを取得
    const submitButton = document.getElementById('RegistrationButton');
    const MainPanel = document.getElementById('MainPanel');

    const gamePhoto = document.querySelector('.game-image');  // ゲーム画像

    gamePhoto.src = `${CONFIG.API_BASE_URL}/images/default_image.png`;

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
        submitButton.value = '更新する';
      } 

      EditMode();  // 読み取り、編集モード切替処理

      inputGameData(gameData);  // ゲームカードの挿入処理
      
      createStar(gameData.star_level);  // スターのイベント処理

      SendToData('edit');  // 編集処理用のapi呼び出し

      DeleteData(gameData);  // データ削除処理用のapi呼び出し

    }
    else{
      console.log('新規登録モードで起動しました');

      document.getElementById('MainText').textContent = '新規ゲーム追加フォーム';
      if (submitButton){
        submitButton.value = '登録する';
      } 

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

// 読み取り編集モード切替用処理
const EditMode = () =>{
  const MainPanel = document.getElementById('MainPanel');    // メインパネル
  const EditPanel = document.getElementById('EditCardWrapper');  // 編集パネル
  const EditButton = document.getElementById('EditButton');  // 編集ボタン
  const CurrentModeLabel = document.querySelector('.current-mode-text'); // モード切替のラベル
  const SubmitButton = document.getElementById('RegistrationButton');    // 送信ボタン

  MainPanel.classList.add('is-readonly');  // 読み取り専用モード（初回時）
  EditPanel.style.display = 'flex';
  CurrentModeLabel.style.display = 'block';
  SubmitButton.style.display = 'none';  // 初回時（読み取りモード）非表示
  

  // クリック時のイベント
  EditButton.addEventListener('click',(e) =>{
    e.preventDefault();
    MainPanel.classList.toggle('is-readonly');  // 読み取り＆書き込みの切り替え
    
    // ラベル、ボタンの値変更処理
    if(CurrentModeLabel.textContent === "MODE：読み取りモード..."){
      SubmitButton.style.display = 'block';
      CurrentModeLabel.textContent = "MODE：書き込みモード...";
      CurrentModeLabel.style.color = "#D93A49";

        EditButton.textContent = '読み取りモードにする';
        
        // ボタンの文字色を変更
        EditButton.style.color = '#000080'; 
    }
    else{
      SubmitButton.style.display = 'none';
      CurrentModeLabel.textContent = "MODE：読み取りモード...";
      CurrentModeLabel.style.color = "#67d49a";

      EditButton.textContent = '書き込みモードにする';
        
      EditButton.style.color= '#fdf9ba'; 
    } 
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
      console.log('選択されたファイルが見つかりませんでした：' + file);
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


// fetchの非同期処理（insert）
const FetchToFormInsert = async (formData) =>{
    return await fetch(`${CONFIG.API_BASE_URL}/form/insert`, {
    method:'POST',
    body: formData
  });
}

// fetchの非同期処理（update）
const FetchToFormUpdate = async (formData) =>{
  const sessionGameData = JSON.parse(sessionStorage.getItem('gameData')); 
      
  // 2. オブジェクトがちゃんと存在していれば、その中の「game_id」をピンポイントで取得
  const gameId = sessionGameData ? sessionGameData.game_id : null;

  const oldImagePath = sessionGameData ? sessionGameData.game_image_path : null;
  
  console.log('更新、削除するゲームID：' + gameId);
  console.log('古い画像パス：' + oldImagePath);

  // formDataだけをオブジェクトとして送りたいのでappendで追加
  if (gameId) {
    formData.append('GameId', gameId); 
  } 
  // 編集前の画像データを送る
  if(oldImagePath){
    formData.append('OldImagePath',oldImagePath);
  }
  return await fetch(`${CONFIG.API_BASE_URL}:3000/form/update`, {
  method:'POST',
  body: formData
  });
}

// データ送信処理
const SendToData = async (select_mode) =>{
  const GameForm = document.getElementById("GameForm");  // formタグのid
  const SendSuccess = document.getElementById("SendSuccess");  // 送信完了表示用のdivタグid
  const CloseBtn = document.getElementById("CloseBtn");  // 送信完了時の閉じるボタン
  const SuccessMessage = document.querySelector('.success-message');  // 完了時画面のメッセージ


  if (GameImage && GameImage.src.startsWith('blob:')) {
          GameImage.src = ""; 
  }

  CloseBtn.addEventListener('click',(e) => {
    e.preventDefault();
    SendSuccess.classList.remove('is-active');

    sessionStorage.clear();  // sessionStorageのクリア

    window.location.href="./index.html";

  });

  // 送信ボタンの処理（更新・登録）
  GameForm.addEventListener('submit', async (e) => {
    e.preventDefault();  // 送信時にページリロードされないようにする（情報の欠落を防ぐ）
    
    // Objectにname属性値を残すため
    PlayTimeHour.disabled = false;  // プレイ時間の有効化
    PlayTimeMinute.disabled = false;  // プレイ時間の有効化      

    const formData = new FormData(e.target);  // formデータをそのまま保持（ファイル対応）

    // オブジェクト形式に変換(使わないけど一応)
    const allData = Object.fromEntries(formData.entries());

    try {
      // 引数（選択されたモード）によってapi呼び出し先を変える
      if(select_mode === 'edit'){
        const response = await FetchToFormUpdate(formData);  // fetchの呼び出し（update）

        const status = await response.text();

        // レスポンスのステータスコードによって処理を分岐
        if(response.status === 200){
          console.log('データを更新しました');
          console.log(status);
          SuccessMessage.textContent = status;  // 更新完了メッセージを表示
          SendSuccess.classList.add('is-active');
        }
        else if(response.status === 500){  // データベースエラーの場合
          console.log('データベースエラーが発生しました');
          console.log(status);
        }
      }
      else if(select_mode === 'insert'){
        const response = await FetchToFormInsert(formData);  // fetchの呼び出し（insert）

        const status = await response.text();

        // レスポンスのステータスコードによって処理を分岐
        if(response.status === 200){
          console.log('データを登録しました');
          console.log(status);
          SuccessMessage.textContent = status;  // 登録完了メッセージを表示
          SendSuccess.classList.add('is-active');
        }
        else if(response.status === 500){  // データベースエラーの場合
          console.log('データベースエラーが発生しました');
          console.log(status);
        }
      }
      
    }
    catch(error){
      console.error("接続失敗：" + error);
    }
    
  });

};


// データの削除処理
const DeleteData = (gameData) =>{
  const DeleteButton = document.getElementById('DeleteButton');  // 削除ボタン
  const SendSuccess = document.getElementById("SendSuccess");  // 送信完了表示用のdivタグid
  const CloseBtn = document.getElementById("CloseBtn");  // 送信完了時の閉じるボタン
  const SuccessMessage = document.querySelector('.success-message');  // 完了時画面のメッセージ

  const alertMessage = `本当にこのデータを削除しますか？\n※削除すると後から復元することができません！！`;

  // 削除完了画面の閉じるボタンの処理
  CloseBtn.addEventListener('click',(e) => {
    e.preventDefault();
    SendSuccess.classList.remove('is-active');

    sessionStorage.clear();  // sessionStorageのクリア

    window.location.href="./index.html";

  });

  DeleteButton.addEventListener('click',async(e) =>{
    if(window.confirm(alertMessage)){
      console.log('削除処理を実行します');

      const DeleteId = gameData.game_id;

      console.log('削除するID：' + DeleteId);  // 確認用

      const response = await fetch(`${CONFIG.API_BASE_URL}/data/delete/${DeleteId}`);

      const status = await response.text();

      // レスポンスのステータスコードによって処理を分岐
      if(response.status === 200){
        console.log('データを削除しました');
        console.log(status);
        SuccessMessage.textContent = status;  // 削除完了メッセージを表示
        SendSuccess.classList.add('is-active');
      }
      else if(response.status === 404){  // 削除対象のデータが見つからなかった場合
        console.log('削除対象のデータが見つかりませんでした');
        console.log(status);
      }
      else if(response.status === 500){  // データベースエラーの場合
        console.log('データベースエラーが発生しました');
        console.log(status);
      }
    }
    else{
      console.log('キャンセルされました');
    }


  });
}



// // フォーム内容をコンソール出力（確認用）
// const GameForm = document.getElementById("GameForm");  // formタグのid

// GameForm.addEventListener('submit', (e) => {
//   e.preventDefault();  // 送信時にページリロードされないようにする（情報の欠落を防ぐ）
  
//   // Objectにname属性値を残すため
//   PlayTimeHour.disabled = false;  // プレイ時間の有効化
//   PlayTimeMinute.disabled = false;  // プレイ時間の有効化      

//   const formData = new FormData(e.target);

//   const GameTitle = formData.get('GameTitle');
//   const GameImagePhoto = formData.get('GameImagePhoto');

//   // console.log(GameTitle);
//   // console.log(GameImagePhoto);

//   // オブジェクト形式に変換
//   const allData = Object.fromEntries(formData.entries());

//   console.log(formData);  // ログ

//   console.log(allData);
  
// });


