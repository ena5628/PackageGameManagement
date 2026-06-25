'use strict'

// const { error } = require("node:console");

/**
 * 評価を星の数として出力
 */

// const createStar = () => {
//   const starElement = document.querySelector('.star5_rating');
//   const review = document.querySelector('.card-review-number').textContent;
//   const roundReview = Math.round(review * 10) / 10;
//   const widthPercentage = roundReview * 20;
//   starElement.style.setProperty('--starWidth', `${widthPercentage}%`);
// };

// ☆マークの描画＆値取得処理
const createStar = () => {
  const starElement = document.querySelector('.star5_rating');
  const hiddenInput = document.getElementById('RecommendedLevel');  
  const StarLevelLabel = document.getElementById('StarLevelLabel');

  starElement.addEventListener('click', (e) => {
    const rect = starElement.getBoundingClientRect();
    const clickX = e.clientX - rect.left; // クリックされた横のいち
    const widthPercentage = Math.round((clickX / rect.width) * 100);
    starElement.style.setProperty('--starWidth', `${widthPercentage}%`);

    let score_num = (widthPercentage / 100) * 5;
    score_num *= 10;  // 小数点第2位で切り捨て
    const score = Math.floor(score_num) / 10;
    hiddenInput.value = score;           
    StarLevelLabel.textContent = score;  // ラベルに表示
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


// 実行場所（フロント部分）
createStar();
PlayTimeOverSolution();
PlayTimeDisable();



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
        
        console.log(response.status);

        if(response.ok){
            console.log('接続完了');
        }
        else{
            console.log('接続できませんでした');
        }
      }
      catch(error){
        console.error("接続失敗：" + error);
      }


      
    });

};

SendToData();


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


