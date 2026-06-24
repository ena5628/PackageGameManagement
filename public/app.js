'use strict';
// 起動時に実行
// document.addEventListner('DOMContentLoaded',function(){

// });

// 新規ゲーム追加処理
let CreateGameCard = document.getElementById("CreateGameCard");

CreateGameCard.addEventListener('click',(e) =>{
    window.location.href = './form.html';
},false);


