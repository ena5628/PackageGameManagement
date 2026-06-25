
const express = require("express");  // expressパッケージの読み込み
const mysql = require("mysql2");  // mysql2パッケージの読み込み
require('dotenv').config(); // .envファイルの読み込み
const app = express();
const path = require("path");

// mysqlとの接続情報を登録
const connection = mysql.createConnection({
    host:process.env.DB_HOST,
    user:process.env.DB_USER,
    password:process.env.DB_PASSWORD,
    database:process.env.DB_NAME,

});

// 接続確認処理
connection.connect((err) =>{
    if(err) {
        console.log('error connecting' + err.stack);
        return;
    }

    console.log('success');
});

app.get('/form',function(req,res){
    res.send('Hello World'); // レスポンスを返す
});

app.listen(3000);  // ポートの受付